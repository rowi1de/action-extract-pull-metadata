<<<<<<< Updated upstream
=======
import * as express from 'express';
import react as react from 'react';
>>>>>>> Stashed changes
var express = require('express');
var app = express();

app.get('/', function (req, res) {
  res.send('Hello World!');
});

app.listen(3000, function () {
  console.log('Example app listening on port 3000!');
});

// testing