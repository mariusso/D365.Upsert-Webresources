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
    const extension = path.extname(fileName);

    if (extension.toLowerCase() == ".htm" || extension.toLowerCase() == ".html") {
        return 1;
    }

    if (extension.toLowerCase() == ".css") {
        return 2;
    }

    if (extension.toLowerCase() == ".js") {
        return 3;
    }

    if (extension.toLowerCase() == ".xml") {
        return 4;
    }

    if (extension.toLowerCase() == ".png") {
        return 5;
    }

    if (extension.toLowerCase() == ".jpg") {
        return 6;
    }

    if (extension.toLowerCase() == ".gif") {
        return 7;
    }

    if (extension.toLowerCase() == ".xap") {
        return 8;
    }

    if (extension.toLowerCase() == ".xsl" || extension.toLowerCase() == ".xslt") {
        return 9;
    }

    if (extension.toLowerCase() == ".ico") {
        return 10;
    }
}