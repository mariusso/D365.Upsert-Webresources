const Init = require("./Init").Init;

const args = process.argv.slice(2);

let fileNames = [];

if(args.length > 0) {
    fileNames = fileNames.concat(args);
}

Init(fileNames);