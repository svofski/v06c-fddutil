#!/usr/bin/env node

var fs = require('fs');
var path = require('path');
var fddimage = require('./fddimage');

ryba_file = "os-t34.fdd";
files_to_put = [];
output_file = undefined;

var launchpath = path.dirname(process.argv[1]);
ryba_file = path.join(launchpath, ryba_file);

try {
    var borrow = null;
    for(var i = 2; i < process.argv.length; ++i) {
        var arg = process.argv[i].trim();
        if (borrow) {
            borrow(arg);
            borrow = null;
            continue;
        }

        if (arg[0] == '-') {
            switch (arg[1]) {
                case 'h':
                    throw "halp";
                case 'r': // user ryba
                    borrow = function(v) {
                        ryba_file = v; 
                    };
                    break;
                case 'i': // file to add to filesystem
                    borrow = function(v) {
                        files_to_put.push(v);
                    };
                    break;
                case 'o': // output file
                    borrow = function(v) {
                        output_file = v;
                    };
            }
        } else {
            //files_to_put.push(arg);
            console.log('arg: "', arg, '" does not compute');
            throw "hapl";
        }
    }

    if (files_to_put.length == 0 || !output_file) {
        throw "hapl";
    }

} catch (numberwang) {
    //console.log(numberwang);
    console.log('Usage: fddutil -i file1 -i file2... -o output.fdd');
    process.exit(0);
}

var ryba_data = undefined;
try {
    ryba_data = fs.readFileSync(ryba_file);
}
catch (numberwang) {
    console.log('Error reading ryba file: ', ryba_file);
    process.exit(1);
}

var fdd = fddimage.Filesystem(0).FromArray(ryba_data);
console.log('Contents of ryba stomach:');
fdd.listDir();

for (var i in files_to_put) {
    var name = files_to_put[i];
    var data;
    try {
      data = fs.readFileSync(name);
    }
    catch (numberwang) {
        console.log('Could not read file ', name, ', it\'s numberwang');
        process.exit(1);j
    }
    var basename = path.basename(name);
    fdd.saveFile(basename, data);
    console.log('Saved file ', basename, ' to FDD image (', data.length, ' bytes)');
}

try {
    fs.writeFileSync(output_file, new Buffer(fdd.bytes));
    console.log('FDD image written to: ', output_file);
}
catch (numberwang) {
    console.log('Error writing FDD to: ', output_file);
    process.exit(1);
}

