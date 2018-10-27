var fs = require('fs');
var loadcsv = require('./test.js');
var async = require('async');
var createCsvWriter = require('csv-writer').createObjectCsvWriter;
const path = require('path');
const inboxFolder = path.join(__dirname,'../../','inbox');
const outboxFolder = path.join(__dirname,'../../','outbox');
const processedFolder = path.join(__dirname,'../../','processed');
var start_time = new Date();

exports.automate_data_load =function (req,res) {
    console.log("Start The Loading at : " + start_time);
    var reqParams = {
        file_location: req.params.file_location,
        object_id : req.params.object_id,
        user : req.params.user
    }
    var dir = path.join(outboxFolder,'/',reqParams.file_location);

    if (!fs.existsSync(outboxFolder)){
        fs.mkdirSync(outboxFolder);
    }
    if (!fs.existsSync(dir)){
        fs.mkdirSync(dir);
    }

    var dirP = path.join(processedFolder,'/',reqParams.file_location);

    if (!fs.existsSync(processedFolder)){
        fs.mkdirSync(processedFolder);
    }
    if (!fs.existsSync(dirP)){
        fs.mkdirSync(dirP);
    }
    const file__full_location = inboxFolder+"/"+reqParams.file_location;
    var records =[];
    console.log("parent file_location:-"+file__full_location);
    var items = fs.readdirSync(file__full_location);
    async.each(items, function(item, callback){
        const csvWriter = createCsvWriter({
            path: path.join(processedFolder,reqParams.file_location,item),
            header: [
                {id: 'file_location', title: 'File Location'},
                {id: 'logs', title: 'Logs'}
            ]
        });

        var csv_arr =[];
        async.series([
                function (callback) {
                    console.log("Getting CSV content of :--"+file__full_location+"/"+item)
                    loadcsv.get_csv_data(file__full_location+"/"+item, csv_arr, callback)
                },
                function (callback) {
                    console.log("Starting uploading CSV --"+csv_arr)
                    loadcsv.upload_document(reqParams,item,csv_arr, records, callback);
                },
                function (callback) {
                    console.log("updating logs for  --"+file__full_location+"/"+item)
                    csvWriter.writeRecords(records)       // returns a promise
                        .then(() => {
                            console.log('Logs written and Done for -->'+file__full_location+"/"+item);
                            callback();
                        });
                },
                function (callback) {
                    console.log("Moving processed file");
                    var oldPath = path.join(inboxFolder,reqParams.file_location,item);
                    var newPath = path.join(outboxFolder,reqParams.file_location,item);

                    fs.rename(oldPath, newPath, function (err) {
                        if (err) throw err
                        console.log('Successfully Moved:--'+item+" from -"+oldPath+" to ->"+newPath)
                        callback()
                    })
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
            if (err) {
                res.status(400).send({
                    "error": err
                });
            } else {
                console.log("Ending The process at : " + new Date());
                res.status(200).send({
                    "document_id": "OK"
                });
            }
        }
    );
}