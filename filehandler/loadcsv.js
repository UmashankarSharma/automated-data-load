'use strict';

module.exports = {

    get: function loaddocumenthandler(req, res) {
        var csvstream = csv.fromPath('OSvC_Collection_Create_20181023143514_10001.csv', { headers: true })
            .on("data", function (row) {
                csvstream.pause();
                // do some heavy work
                // when done resume the stream
                console.log(row);
                csvstream.resume();
            })
            .on("end", function () {
                console.log("We are done!")
            })
            .on("error", function (error) {
                console.log(error)
            });
    }
};
