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
      endpoint: string = core.getInput('receiver-endpoint', { required: true }),
      issue: { owner: string; repo: string; number: number } = github.context.issue
    core.setSecret(repoToken);
    core.setSecret(endpoint);

    if (issue == null || issue.number == null) {
      console.log('No pull request context, skipping')
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

    //needs to go to lambda
    //console.info("Pull Request Metadata:" + JSON.stringify(pull));

    //needs to go to lambda
    files.data.forEach(file => {
      axios({
        method: 'post',
        url: endpoint,
        data: {
          // json schema version
          version: 1,
          event: github.context.eventName,
          action: github.context.action,
          //metadata
          metadata: {
            repo: issue.repo,
            created: pull.data.created_at,
            pull_number: issue.number,
            pull_url: pull.data.issue_url,
            author: issue.owner,
            reviewers: pull.data.requested_reviewers,
            diff_url: pull.data.diff_url
          },
          //file content
          file: {
            content: {
              name: file.filename,
              patch: Buffer.from(file.patch, 'binary').toString('base64')
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
          }
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

  } catch (error) {
    core.setFailed(error.message)
    throw error
  }
}

run()