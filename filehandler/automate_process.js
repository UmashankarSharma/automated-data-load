var fs = require('fs');
var loadcsv = require('./test.js');
var async = require('async');
var createCsvWriter = require('csv-writer').createObjectCsvWriter;
const path = require('path');
const testFolder = path.join(__dirname,'../../','inbox');

exports.automate_data_load =function (req,res) {
    const csvWriter = createCsvWriter({
        path: 'file.csv',
        header: [
            {id: 'file_location', title: 'File Location'},
            {id: 'logs', title: 'Logs'}
        ]
    });
    var reqParams = {
        file_location: req.params.file_location,
        object_id : req.params.object_id,
        user : req.params.user
    }
    const file__full_location = testFolder+"/"+reqParams.file_location;
    var records =[];
    console.log("parent file_location:-"+file__full_location);
    var items = fs.readdirSync(file__full_location);
    async.each(items, function(item, callback){
        //req.params.object_id = "Collection";
        //req.params.file_location = testFolder+"/"+parentItem+"/"+item;
        //var file_location = testFolder+"/"+parentItem+"/"+item;
        var csv_arr =[];
        async.series([
                function (callback) {
                    console.log("Getting CSV content of :--"+file__full_location+"/"+item)
                    loadcsv.get_csv_data(file__full_location+"/"+item, csv_arr, callback)
                },
                function (callback) {
                    console.log("Starting uploading CSV --"+csv_arr)
                    loadcsv.upload_document(reqParams,csv_arr, records, callback);
                }
            ],
            function (err) {
                if (err) {
                    callback(err);
                } else {
                    callback();
                }
            });
        },
        function(err){
            console.log("Final Complete :"+items);
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
        }
    );
}