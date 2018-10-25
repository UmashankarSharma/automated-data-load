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
var createCsvWriter = require('csv-writer').createObjectCsvWriter;

exports.upload_document = function (req, res, csv_arr,records, callback) {

    var object_id = req.params.object_id;

    console.log("Start The Loading at : " + start_time);
    async.series([
            function (callback) {
                //this_file.get_csv_data(file_location,callback);
                callback();
            },
            function (callback) {
                async.each(csv_arr, function(csv_arr_val, callback1){
                    var record ={};
                    record.file_location = req.params.file_location;
                    this_file.callDatabase(csv_arr_val, object_id, function (body) {
                        record.logs = body;
                        records.push(record);
                        callback1();
                    });
                }, function(err) {
                    if( err ) {
                        console.log('A file failed to process');
                        callback(err);
                    } else {
                        console.log('All files have been processed successfully');
                        callback();
                    }
                }
                );
            }
        ],
        function (err) {
            if (err) {
                callback(err);
                /*res.status(400).send({
                    "error": err
                });*/
            } else {
                callback();
                /*res.status(200).send({
                    "document_id": "OK"
                });*/
            }
        });
}

exports.callDatabase = function (val, object_id, callback) {

    var options = {

        method: 'POST',
        url: 'https://ngpsservice--tst2.custhelp.com/cc/webservice/callfm/' + object_id + '/' + val,
        pool: separateReqPool
    };

    request(options, function (error, response, body) {
        console.log(error)
        if (error) throw new Error(error);
        console.log(body);
        callback(body);
    });
}

exports.get_csv_data = function (file_location, csv_arr,callback) {
    var csvstream = csv.fromPath(file_location, {headers: true})
        .on("data", function (row) {
            csv_arr.push(Object.values(row));
        })
        .on("end", function () {
            console.log("We are in End Function");
            callback();
        })
        .on("error", function (error) {
            callback(error);
        });
}