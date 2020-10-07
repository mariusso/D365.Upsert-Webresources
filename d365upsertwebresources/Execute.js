"use strict";

const WebresourceService = require("./WebresourceService").WebresourceService;
const fileHandler = require("./FileHandler");
const adal = require("./AdalNode");
const dr365config = require("./clientConfig/clientConfig.json");

exports.Execute = async (fileNames) => {
    
    console.log("Deploying web resources...");

    const tokenResponse = await  adal.AcquireTokenWithClientCredentials();

    const files = fileHandler.GetFiles(fileNames);

    const webresourceService = new WebresourceService(files, tokenResponse, dr365config.webApiUrl)

    await webresourceService.UpsertWebresources();

    console.log("Done.");
}