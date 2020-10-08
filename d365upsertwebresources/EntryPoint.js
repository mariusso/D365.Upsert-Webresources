"use strict";

const Execute = require("./Execute.js").Execute;

const args = process.argv.slice(2);

let fileNames = [];

if (args.length > 0) {
    fileNames = fileNames.concat(args);
}


Execute(fileNames);