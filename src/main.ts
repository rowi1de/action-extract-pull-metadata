import * as core from '@actions/core';
import * as github from '@actions/github';
const axios = require('axios').default;


interface ChangedFile {
  filename: string;
  content: string;
}

function createChangedFile(filename: string, content: string): ChangedFile { 
  return {
    filename: filename,
    content: Buffer.from(content, 'binary').toString('base64')

  };
}

export async function run() {
  try {
    const
      repoToken = core.getInput('repo-token', { required: true }),
      endpoint : string = core.getInput('receiver-endpoint', { required: true }),
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
    files.data.forEach(async element => {
      const file = createChangedFile(element.filename , element.patch);
      axios.post(endpoint, JSON.stringify(file)).then(function (response) {
        console.info(element.filename + " : " + response);
      })
      .catch(function (error) {
        core.setFailed(element.filename + " : " + error);
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