var fs = require('fs')
const testFolder = './inbox';
var loadcsv = require('./test.js');
var async = require('async');
var createCsvWriter = require('csv-writer').createObjectCsvWriter;

exports.automate_data_load =function (req,res) {
    const csvWriter = createCsvWriter({
        path: 'file.csv',
        header: [
            {id: 'file_location', title: 'File Location'},
            {id: 'logs', title: 'Logs'}
        ]
    });
    var records =[];
    var parentFolder = fs.readdirSync(testFolder);
    async.each(parentFolder, function(parentItem, callback){
        console.log("parent:-"+parentItem);
        var items = fs.readdirSync(testFolder+"/"+parentItem);
        async.each(items, function(item, callback){
                req.params.object_id = "Collection";
                req.params.file_location = testFolder+"/"+parentItem+"/"+item;
                var file_location = testFolder+"/"+parentItem+"/"+item;
                var csv_arr =[];
                async.series([
                        function (callback) {
                            console.log("Getting CSV content of :--"+file_location)
                            loadcsv.get_csv_data(file_location, csv_arr, callback)
                        },
                        function (callback) {
                            console.log("Starting uploading CSV --"+csv_arr)
                            loadcsv.upload_document(req,res,csv_arr, records, callback);
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
            },
            function(err){
                console.log("All Completes :"+items);
                callback();
            }
        );
    },
    function(err){
        console.log("Final Complete :");
        csvWriter.writeRecords(records)       // returns a promise
            .then(() => {
            console.log('Finaly written and Done');
        });
        if (err) {
            res.status(400).send({
                "error": err
            });
        } else {
            res.status(200).send({
                "document_id": "OK"
            });
        }
    });
}