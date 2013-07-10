#!/usr/bin/env node
var fs = require('fs');
var program = require('commander');
var cheerio = require('cheerio');
var rest = require('restler');
var HTML_DEFAULT = "index.html";
var CHECKSFILE_DEFAULT = "checks.json";

var assertFileExists = function(infile) {
    var instr = infile.toString();
    if(!fs.existsSync(instr)) {
        console.log("%s does not exist. Exiting.", instr);
        process.exit(1); // http://nodejs.org/api/process.html#process_process_exit_code
    }
    return instr;
};

var cheerioHtmlFile = function(htmlfile) {
    return cheerio.load(fs.readFileSync(htmlfile));
};

var downloadHtml = function(url,checksfile) {
    var extractHTML = function(result,response){
	if(result instanceof Error) {
	    console.error('Error: ' + util.format(response.message));
	    } else {
		//console.log(result);
		 presentResult(checkUrl( result,checksfile));
	    }
	}
    rest.get(url).on('complete',extractHTML);
    };

var loadChecks = function(checksfile) {
    return JSON.parse(fs.readFileSync(checksfile));
};

var checkHtmlFile = function(htmlfile, checksfile) {
    $ = cheerioHtmlFile(htmlfile);
    var checks = loadChecks(checksfile).sort();
    var out = {};
    for(var ii in checks) {
        var present = $(checks[ii]).length > 0;
        out[checks[ii]] = present;
    }
    return out;
};

var checkUrl = function(urlData,checksfile) {
    $ = cheerio.load(urlData);
    var checks = loadChecks(checksfile).sort();
    var out = {};
    for(var ii in checks) {
        var present = $(checks[ii]).length > 0;
        out[checks[ii]] = present;
    }
    return out;  
}
var startGradeURL = function(url,checksfile) {
    downloadHtml(url,checksfile);
}

var clone = function(fn) {
    return fn.bind({});
};


var presentResult= function(checkJson) {
    var outJson = JSON.stringify(checkJson, null, 4);
    console.log(outJson);       
}

if(require.main == module) {
    program
        .option('-c, --checks <check_file>', 'Path to checks.json', clone(assertFileExists), CHECKSFILE_DEFAULT)
        .option('-f, --file <html_file>', 'Path to index.html', clone(assertFileExists), HTML_DEFAULT)
        .option('-u, --url <html_url>','URL to check')
       .parse(process.argv);
   
    var checkJson;
    if (program.url){
            startGradeURL(program.url,program.checks);
	} else {
	    checkJson  = checkHtmlFile(program.file, program.checks);
	    presentResult(checkJson);
	}


} else {
    exports.checkHtmlFile = checkHtmlFile;
}

