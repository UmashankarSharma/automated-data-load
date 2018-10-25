var fs = require('fs')
const testFolder = './inbox';
var loadcsv = require('./test.js');
var async = require('async')

exports.automate_data_load =function (req,res) {
    fs.readdirSync(testFolder).forEach(file => {
        console.log("parent:-"+file);
    var items = fs.readdirSync(testFolder+"/"+file);
    async.each(items, function(item, callback){
            console.log("child:-"+item);
            req.params.object_id = "Collection";
            req.params.file_location = testFolder+"/"+file+"/"+item;
            loadcsv.upload_document(req,res);
            callback();
        },
        function(err){
            console.log("All Completes :");
        }
    );
        /*fs.readdirSync(testFolder+"/"+file).forEach(file_child => {
            console.log("child:-"+file_child);
            req.params.object_id = "Collection";
            req.params.file_location = testFolder+"/"+file+"/"+file_child;
            loadcsv.upload_document(req,res);
        })*/
    })
}