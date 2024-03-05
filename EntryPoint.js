"use strict";

const Execute = require("./Execute.js").Execute

const args = process.argv.slice(2);

let fileNames = [];
let environment = "DEV";
let solutionUniqueName = null;

if (args.length > 0) {

    fileNames = args[0].split(",");

    if(args.length > 1) {
        environment = args[1];
    }
    if(args.length > 2) {
        solutionUniqueName = args[2];
    }
}

Execute(fileNames, environment, solutionUniqueName);