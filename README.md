# GitHub Action: action-extract-pull-metadata
Winter Hackathon Project 2019 for [Scalable Capital](http://scalable.capital/)

- Backend:
  - https://github.com/krunogrc
  - https://github.com/rowi1de
- Machine Learning / Feature Extraction
  -  https://github.com/huyqd
  - https://github.com/nikolasrieble


## Motivation & Goal
- Build an self-updating competence map of devlopers
- Analyze PR Metadata, Change files 
- Extract Features (language, dependnecies, packages ...) 
- Join Expert + Learners on one PR for Knowledge Sharing

## Architecture
- GitHub Action to Process PR Data
- Send to AWS / API-G to Lambda
- Store Data in Mongo DB Atlas
- ... Python on that 

## Usage
```yaml
name: action-extract-pull-metadata

on: [push, pull]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/action-extract-pull-metadata@master
      with:
        repo-token: ${{ secrets.GITHUB_TOKEN }}
        receiver-endpoint: ${{ secrets.REST_ENDPOINT }}
```