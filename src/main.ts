import * as core from '@actions/core';
import * as github from '@actions/github';
import { file } from '@babel/types';
import * as httpm from 'typed-rest-client/HttpClient';


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
      issue: { owner: string; repo: string; number: number } = github.context.issue
      core.setSecret(repoToken);

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
    let httpc: httpm.HttpClient = new httpm.HttpClient('vsts-node-api');
    files.data.forEach(async element => {
      const file = createChangedFile(element.filename , element.patch);
      console.info("trying to send" + element.filename)
      const res = await httpc.post('https://afpp4zc0jc.execute-api.eu-west-3.amazonaws.com/v1/actiondata', JSON.stringify(file) );
      console.info(element.filename + " response: " + res)
    });
    
  } catch (error) {
    core.setFailed(error.message)
    throw error
  }
}

run()