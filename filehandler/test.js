var csv = require("fast-csv");
var request = require("request");
var async = require('async');
var _ = require("underscore");
var this_file = require('./test.js');
var separateReqPool = {maxSockets: 10};
var logger = require('../utils/logger.js');

exports.upload_document = function (reqParams, item, csv_arr,records, callback) {
    const object_id = reqParams.object_id;
    async.series([
        function (callback) {
            logger.info('A file Processing to data base running for......'+item);
            callback();
        },
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
                    logger.info('A file failed to process');
                    callback(err);
                } else {
                    logger.info('All files have been processed successfully');
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
        if (error) throw new Error(error);
        callback(body);
    });
}

exports.get_csv_data = function (file_location, csv_arr,callback) {
    var csvstream = csv.fromPath(file_location, {headers: true})
        .on("data", function (row) {
            csv_arr.push(Object.values(row));
        })
        .on("end", function () {
            logger.info("We are in End Function");
            callback();
        })
        .on("error", function (error) {
            callback(error);
        });
}