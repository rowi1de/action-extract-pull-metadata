import * as core from '@actions/core';
import * as github from '@actions/github';
const axios = require('axios');


interface ChangedFile {
  filename: string;
  content: string;
}

export async function run() {
  try {
    const
      repoToken = core.getInput('repo-token', { required: true }),
      endpoint: string = core.getInput('receiver-endpoint', { required: false }),
      issue: { owner: string; repo: string; number: number } = github.context.issue
    core.setSecret(repoToken);
    core.setSecret(endpoint);

    if (issue == null || issue.number == null) {
      console.log('No pull request context, skipping')
      return
    }
    
    if(endpoint == null){
       console.log('No receiver-endpoint, skipping')
       return
    }

    //See https://octokit.github.io/rest.js/
    const client = new github.GitHub(repoToken)
    const pull = await client.pulls.get(
      {
        owner: issue.owner,
        repo: issue.repo,
        pull_number: issue.number
      }
    )

    const files = await client.pulls.listFiles({
      owner: issue.owner,
      repo: issue.repo,
      pull_number: issue.number
    })

    const commits = await client.pulls.listCommits({
      owner: issue.owner,
      repo: issue.repo,
      pull_number: issue.number
    })

    const commit_data = commits.data.map(commit => {
      return {
        commit: commit.sha,
        message: commit.commit.message,
        committer: commit.commit.committer
      }
    })

    //needs to go to lambda
    files.data.forEach(async file => {
      const res = await axios({
        method: 'get',
        url: file.raw_url,
        responseType: 'arraybuffer'
      });
      let fullFile = ""
      if (res.status == 200) {
        console.log("Download for: " + file.filename + " : " + res.status)
        fullFile = Buffer.from(res.data, 'binary').toString('base64')
      }
      else {
        console.error("Download for: " + file.filename + " failed : " + res.status)
      }

      await axios({
        method: 'post',
        url: endpoint,
        data: {
          // json schema version
          version: 6,
          event: github.context.eventName,
          action: github.context.action,
          //metadata about pr
          metadata: {
            repo: issue.repo,
            created: pull.data.created_at,
            updated_at: pull.data.updated_at,
            pull_number: issue.number,
            pull_url: pull.data.issue_url,
            title: pull.data.title,
            state: pull.data.state,
            author: pull.data.user.login,
            reviewers: pull.data.requested_reviewers,
            diff_url: pull.data.diff_url
          },
          //file content
          file: {
            content: {
              name: file.filename,
              patch: Buffer.from(file.patch, 'binary').toString('base64'),
              full: fullFile
            },
            metadata:
            {
              //file metadata
              blob_url: file.blob_url,
              raw_url: file.raw_url,
              additions: file.additions,
              deletions: file.deletions,
              changes: file.changes,
              file_status: file.status,
              sha: file.sha
            }
          },
          commits: commit_data
        }
      }).then(function (response) {
        console.info(file.filename + " : " + response.status);
      })
        .catch(function (error) {
          core.setFailed(file.filename + " : " + error.message);
          throw error;
        })
        .finally(function () {
          // always executed
        });
    });

    client.issues.createComment({
      owner: issue.owner,
      repo: issue.repo,
      issue_number: issue.number,
      body: "Analzyed " + files.data.length + " files 🙌🏻 on event: " + github.context.eventName
    })


  } catch (error) {
    core.setFailed(error.message)
    throw error
  }
}

run()
