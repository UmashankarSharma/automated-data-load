var csv = require("fast-csv");
var request = require("request");
var async = require('async');
var test1 = require('./test1.js');
var csv_arr = [];
var csv_arr_res = [];
var _ = require("underscore");
var this_file = require('./test.js');
var separateReqPool = {maxSockets: 10};
var start_time = new Date();
var end_time;
var fs = require("fs");

exports.upload_document = function (req, res) {

    var object_id = req.params.object_id;
    var file_location = req.params.file_location;

    var createCsvWriter = require('csv-writer').createObjectCsvWriter;


    console.log("Start The Loading at : " + start_time);
    //get ticket
    var csvstream = csv.fromPath('./' + file_location, {headers: true})
        .on("data", function (row) {
            this_file.callDatabase(Object.values(row), object_id, function (res) {
                console.log(res);
            });
        })
        .on("end", function () {
            /*res.status(200).send({
                "STATUS": "200"
            });*/
        })
        .on("error", function (error) {
            res.status(400).send({
                "error": error
            });
        });
}

exports.callDatabase = function (val, object_id, callback) {

    var options = {

        method: 'POST',
        url: 'https://ngpsservice--tst2.custhelp.com/cc/webservice/callfm/' + object_id + 'Collection/' + val,
        pool: separateReqPool
    };

    request(options, function (error, response, body) {
        if (error) throw new Error(error);
        callback(body);
    });
}