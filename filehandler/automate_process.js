var fs = require('fs');
var loadcsv = require('./test.js');
var async = require('async');
var createCsvWriter = require('csv-writer').createObjectCsvWriter;
const path = require('path');
const inboxFolder = path.join(__dirname,'../../','inbox');
const outboxFolder = path.join(__dirname,'../../','outbox');

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
    const file__full_location = inboxFolder+"/"+reqParams.file_location;
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

            var dir = path.join(outboxFolder,'/',reqParams.file_location);

            if (!fs.existsSync(outboxFolder)){
                fs.mkdirSync(outboxFolder);
            }
            if (!fs.existsSync(dir)){
                fs.mkdirSync(dir);
            }
            async.each(items, function (file, callback) {
                var oldPath = path.join(inboxFolder,reqParams.file_location,file);
                var newPath = path.join(outboxFolder,reqParams.file_location,file);

                fs.rename(oldPath, newPath, function (err) {
                    if (err) throw err
                    console.log('Successfully Moved:--'+file+" from -"+oldPath+" to ->"+newPath)
                    callback()
                })
            },
            function (err) {
                if (err) {
                    console.log("File transfer failed");
                } else {
                    console.log("File transfer Success");
                }
            });

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