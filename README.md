# GitHub Action: action-extract-pull-metadata
Winter Hackathon Project 2019 for [@Scacap](https://github.com/ScaCap)

- Backend:
  - @krunogrc
  - @rowi1de
- Machine Learning / Feature Extraction
  - @huyqd
  - @jennyvytruchenko
  - @nikolasrieble

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


### Lambda
```javascript
"use strict";
const MongoClient = require('mongodb').MongoClient;
const MONGODB_URI = process.env.MONGODB_URI; // or Atlas connection string


module.exports.handler = (event, context, callback) => {
  context.callbackWaitsForEmptyEventLoop = false;

  console.log('event: ', event);
    
const MongoClient = require('mongodb').MongoClient;
const uri = MONGODB_URI
const client = new MongoClient(uri, { useNewUrlParser: true });
client.connect(err => {
  const db = client.db("competence-map");
  createDoc(db, event, callback);
});
  
};

function createDoc (db, json, callback) {
  db.collection('files').insertOne( json, function(err, result) {
      if(err!=null) {
          console.error("an error occurred in createDoc", err);
          callback(null, JSON.stringify(err));
      }
      else {
        console.log("Kudos! You just created an entry into the restaurants collection with id: " + result.insertedId);
        callback(null, "SUCCESS");
      }
    db.close();
  });
};
```
