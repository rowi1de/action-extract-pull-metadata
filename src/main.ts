import * as core from '@actions/core';
import * as github from '@actions/github';


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
    console.info(JSON.stringify(files));
  
    //needs to go to lambda
    console.info(JSON.stringify(pull));
    
  } catch (error) {
    core.setFailed(error.message)
    throw error
  }
}

run()