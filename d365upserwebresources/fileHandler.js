const fs = require("fs");
const path = require("path");
const findConfig = require("find-config");
const wrConfig = findConfig.require("webresources.json", {dir: "d365upserwebresourcesconfiguration"});

if (wrConfig == null) {
    throw new Error("Missing webresources.json");
}

exports.GetFiles = () => {

    var fileList = ReadDirectoryAndRetrieveFiles(wrConfig.localDirectory, wrConfig.virtualBasePath);

    return fileList;
}

const ReadDirectoryAndRetrieveFiles = (directory, virtualPath, existingFileList) => {

    const namesInDirectory = fs.readdirSync(directory);

    const fileList = existingFileList || []

    namesInDirectory.forEach((name) => {

        const completePath = path.resolve(directory, name);
        const stats = fs.statSync(completePath);
        const isDirectory = stats.isDirectory();

        if(!isDirectory) {
            const fileContent = fs.readFileSync(completePath, { encoding: "base64" });
            fileList.push({
                fileName: name,
                virtualPath: virtualPath + "/" + name,
                fileContent: fileContent,
                type: GetWebResourceType(name),
            });
        } else {
            ReadDirectoryAndRetrieveFiles(completePath, virtualPath + "/" + name, fileList);
        }
    });

    return fileList;
}

const GetWebResourceType = (fileName) => {
    const extension = path.extname(fileName);

    if(extension.toLowerCase() == ".htm" || extension.toLowerCase() == ".html") {
        return 1;
    }

    if(extension.toLowerCase() == ".css") {
        return 2;
    }

    if(extension.toLowerCase() == ".js") {
        return 3;
    }

    if(extension.toLowerCase() == ".xml") {
        return 4;
    }

    if(extension.toLowerCase() == ".png") {
        return 5;
    }

    if(extension.toLowerCase() == ".jpg") {
        return 6;
    }

    if(extension.toLowerCase() == ".gif") {
        return 7;
    }

    if(extension.toLowerCase() == ".xap") {
        return 8;
    }

    if(extension.toLowerCase() == ".xsl" || extension.toLowerCase() == ".xslt") {
        return 9;
    }

    if(extension.toLowerCase() == ".ico") {
        return 10;
    }
}