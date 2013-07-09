#!/usr/bin/env node
/*
Automatically grade files for the presence of specified HTML tags/attributes.
Uses commander.js and cheerio. Teaches command line application development
and basic DOM parsing.

References:

+ cheerio
- https://github.com/MatthewMueller/cheerio
- http://encosia.com/cheerio-faster-windows-friendly-alternative-jsdom/
- http://maxogden.com/scraping-with-node.html

+ commander.js
- https://github.com/visionmedia/commander.js
- http://tjholowaychuk.com/post/9103188408/commander-js-nodejs-command-line-interfaces-made-easy

+ restler
- https://github.com/danwrong/restler

+ when
- https://github.com/cujojs/when

+ JSON
- http://en.wikipedia.org/wiki/JSON
- https://developer.mozilla.org/en-US/docs/JSON
- https://developer.mozilla.org/en-US/docs/JSON#JSON_in_Firefox_2
*/

var fs = require('fs');
var program = require('commander');
var cheerio = require('cheerio');
/********************************/
var restler = require("restler");
var when = require("when");
/********************************/

var HTMLFILE_DEFAULT = "index.html";
var CHECKSFILE_DEFAULT = "checks.json";
var HTMLURL_DEFAULT = "http://murmuring-reaches-5294.herokuapp.com/index.html";

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

var clone = function(fn) {
    // Workaround for commander.js issue.
    // http://stackoverflow.com/a/6772648
    return fn.bind({});
};

/*************************************************/
var cheerioHtmlContent = function(content) {
    return cheerio.load(content);
};

var checkHtmlContent = function(html, checks) {
    $ = cheerioHtmlContent(html);
    var checksSort = checks.sort(); // Ordenamos el contenido fichero de checks
    var out = {};
    for(var ii in checksSort) {
        var present = $(checksSort[ii]).length > 0;
        out[checksSort[ii]] = present;
    }
    return out;
};

var getHtmlFromUrl = function( url ) {
    // Hacemos uso de when
    var deferred = when.defer();

    restler.get( url ).on( "complete", function( result ) {
        // Cuando se obtenga la url llamamos a nuestro callback
        deferred.resolve( result );
    });

    return deferred.promise;
}

var getResult = function(content, check) {
    var checkJson = checkHtmlContent(content, check); // Comprobamos si existen las etiquetas
    var outJson = JSON.stringify(checkJson, null, 4); // Generamos la salida
    
    //console.log(outJson);

    var outfile = "outputChecks.json";
    fs.writeFileSync(outfile, outJson);
}

var resultGetHtmlFromUrl = function(result) {
    getResult(
            result,
            loadChecks(program.checks) // Obtenemos el contenido del fichero (program.checks es el fichero)
            );
}
/************************************************/

if(require.main == module) {
    program
        .option('-c, --checks <check_file>', 'Path to checks.json', clone(assertFileExists), CHECKSFILE_DEFAULT)
        .option('-f, --file <html_file>', 'Path to index.html', clone(assertFileExists), HTMLFILE_DEFAULT)
        .option('-u, --url <url>', 'URL to html page')
        .parse(process.argv);

    if (program.url) { // Pasamos una URL
        getHtmlFromUrl(program.url).then( resultGetHtmlFromUrl );
    } else { // Se le pasa un fichero
        getResult(
                fs.readFileSync(program.file),
                loadChecks(program.checks)
                );
    }

    
} else {
    console.log("File");

    exports.checkHtmlFile = checkHtmlFile;
}