import * as core from '@actions/core';
import * as github from '@actions/github';
import { file } from '@babel/types';


interface ChangedFile {
  filename: string;
  content: string;
}

function createChangedFile(filename: string, content: string): ChangedFile { 
  return {
    filename: filename,
    content: btoa(content)
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
    files.data.forEach(element => {
      const file = createChangedFile(element.filename , element.patch);
      console.info(JSON.stringify(file))
    });
    
  } catch (error) {
    core.setFailed(error.message)
    throw error
  }
}

run()