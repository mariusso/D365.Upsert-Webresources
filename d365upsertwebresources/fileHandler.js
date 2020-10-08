"use strict";

const fs = require("fs");
const path = require("path");
const clientConfig = require("./clientConfig/clientConfig.json");

if (clientConfig == null) {
    throw new Error("Missing webresources.json");
}

exports.GetFiles = (fileNames = []) => {

    var fileList = ReadDirectoryAndRetrieveFiles(clientConfig.localDirectory, clientConfig.virtualBasePath, [], fileNames);

    return fileList;
}

const ReadDirectoryAndRetrieveFiles = (directory, virtualPath, existingFileList = [], fileNames = []) => {

    let namesInDirectory = fs.readdirSync(directory);

    const fileList = existingFileList || [];

    for (const name of namesInDirectory) {

        const completePath = path.resolve(directory, name);
        const stats = fs.statSync(completePath);
        const isDirectory = stats.isDirectory();

        if (!isDirectory) {

            if (fileNames.length > 0 && !fileNames.some(f => f === name)) {
                continue;
            }

            const fileContent = fs.readFileSync(completePath, { encoding: "base64" });
            fileList.push({
                fileName: name,
                virtualPath: path.join(virtualPath, name).replace(/[\\]/g, "/", ),
                fileContent: fileContent,
                type: GetWebResourceType(name),
            });

        } else {
            if (fileNames.length > 0 && !fileNames.some(f => f === name)) {
                continue;
            }
            ReadDirectoryAndRetrieveFiles(completePath, path.join(virtualPath, name), fileList, fileNames);
        }
    };

    return fileList;
}

const GetWebResourceType = (fileName) => {

    const extension = path.extname(fileName).toLowerCase();

    if (extension == ".htm" || extension == ".html") {
        return 1;
    }
    if (extension == ".css") {
        return 2;
    }

    if (extension == ".js") {
        return 3;
    }

    if (extension == ".xml") {
        return 4;
    }

    if (extension == ".png") {
        return 5;
    }

    if (extension == ".jpg") {
        return 6;
    }

    if (extension == ".gif") {
        return 7;
    }

    if (extension == ".xap") {
        return 8;
    }

    if (extension == ".xsl" || extension == ".xslt") {
        return 9;
    }

    if (extension == ".ico") {
        return 10;
    }
}