"use strict";

const fs = require("fs");
const path = require("path");
const fileConfig = require("./FileConfig.json");

exports.GetFiles = (fileNames = []) => {

    if (fileConfig == null) {
        throw new Error("Missing client file configuration");
    }

    let fileList = [];

    if (fileConfig.localDirectory != null) {
        fileList = RetrieveFilesByDirectory(fileConfig.localDirectory, "", [], fileNames);
    }
    else {
        fileList = RetrieveFilesByManifest(fileNames);
    }

    return fileList;
}

const RetrieveFilesByDirectory = (directory, virtualPath, existingFileList = [], fileNames = []) => {

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
                virtualPath: path.join(virtualPath, name).replace(/[\\]/g, "/",),
                fileContent: fileContent,
                type: GetWebResourceType(name),
            });

        } else {
            RetrieveFilesByDirectory(completePath, path.join(virtualPath, name), fileList, fileNames);
        }
    };

    return fileList;
}

const RetrieveFilesByManifest = (fileNames = []) => {

    const fileList = [];

    for (const fileName of fileNames) {

        const manifestRecord = fileConfig.manifest.filter(m => m.name == fileName)?.[0];

        if (manifestRecord == null) {
            console.log("Could not find manifest record with name '" + fileName + "'.");
            continue;
        }

        const baseName = path.basename(manifestRecord.localPath);
        const fileContent = fs.readFileSync(manifestRecord.localPath, { encoding: "base64" });

        fileList.push({
            fileName: baseName,
            virtualPath: manifestRecord.virtualPath,
            fileContent: fileContent,
            type: GetWebResourceType(baseName),
        });
    }

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