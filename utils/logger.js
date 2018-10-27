var httpContext = require('express-http-context');
var winston = require('winston');
var { format } = require('winston');
var { combine, timestamp, label, printf } = format;

var myFormat = printf(info => {
    return JSON.stringify({
        'timestamp'     : `${info.timestamp}`,
        'label'         : `[${info.label}]`,
        'level'         : `${info.level}`,
        'correlationId' : `${getReqId()}`,
        'message'       : `${info.message}`
    });
});

var path = require('path');
var fs = require('fs');
var existsSync = fs.existsSync || path.existsSync;
const logDir = path.join(__dirname,'../','LogFiles');

if (!fs.existsSync(logDir)){
    fs.mkdirSync(logDir);
}

var ensureDir = function (dir) {
    if (!existsSync(dir)) {
        ensureDir(path.dirname(dir));
        try {
            fs.mkdirSync(dir);
        }
        catch (e) {
            // check if directory was created in the meantime (by another process)
            if (!existsSync(dir))
                throw e;
        }
    }
};

ensureDir(logDir);
// Wrap Winston logger to print reqId in each log
var getReqId = function() {
    var reqId = httpContext.get('reqId');
    return reqId;
};

var logger = winston.createLogger({
    format: combine(
        label({ label: 'eComp' }),
        timestamp({
            format: 'YYYY-MM-DD HH:mm:ss'
        }),
        format.splat(),
        myFormat
    ),  transports: [
        new winston.transports.File({
            level: 'info',
            filename: logDir+'/info.log',
            handleExceptions: true,
            json: true,
            maxsize: 5242880, //5MB
            maxFiles: 5,
            timestamp:true,
            colorize: true,
            tailable:true
        }),
        new winston.transports.File({
            level: 'debug',
            filename: logDir+'/debug.log',
            handleExceptions: true,
            json: true,
            maxsize: 5242880, //5MB
            maxFiles: 5,
            timestamp:true,
            colorize: true,
            tailable:true
        }),
        new winston.transports.Console({
            level: 'debug',
            handleExceptions: true,
            json: false,
            timestamp:true,
            colorize: true
        })
    ],
    exitOnError: false
});
module.exports = logger;

