var csv = require("fast-csv");
var request = require("request");
var async = require('async');
var _ = require("underscore");
var this_file = require('./test.js');
var separateReqPool = {maxSockets: 10};

exports.upload_document = function (reqParams, item, csv_arr,records, callback) {
    const object_id = reqParams.object_id;
    async.series([
        function (callback) {
            async.each(csv_arr, function(csv_arr_val, callback1){
                let record ={};
                record.file_location = item;
                callDatabase(csv_arr_val, object_id, function (body) {
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
            });
        }],
        function (err) {
            if (err) {
                callback(err);
            } else {
                callback();
            }
        }
    );
}

function callDatabase(val, object_id, callback) {
    var options = {
        method: 'POST',
        url: 'https://ngpsservice--tst2.custhelp.com/cc/webservice/callfm/' + object_id + '/' + val,
        pool: separateReqPool
    };

    request(options, function (error, response, body) {
        //console.log(error)
        if (error) throw new Error(error);
        //console.log(body);
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