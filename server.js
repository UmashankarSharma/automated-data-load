'use strict';

var port = process.env.PORT || 8000;

var express = require('express');
var bodyParser = require('body-parser');
var fs = require("fs");

fs.existsSync = fs.existsSync || require('path').existsSync;

var app = express();

app.use(bodyParser.json({
    limit: '5mb'
}));


/**********************************************************
 *  Post the Quote/?? as a project/projects in service cloud.
 **********************************************************/

app.get('/load-data/:object_id/upload/:file_location',function(req, res) {
        var projects = require('./filehandler/test.js');
        projects.upload_document(req,res);
});
app.get('/automate-data-load',function(req, res) {
    var auto_process = require('./filehandler/automate_process.js');
    auto_process.automate_data_load(req,res);
});

/**********************************************************
 *  Create the NodeJS Server.
 **********************************************************/
app.listen(port, function () {
    console.info("server started listening to request on port %s",port);
});