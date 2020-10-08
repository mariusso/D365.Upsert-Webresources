"use strict";

const WebresourceService = require("./WebresourceService").WebresourceService;
const fileHandler = require("./FileHandler");
const AcquireTokenWithClientCredentials = require("./AdalNode").AcquireTokenWithClientCredentials;
const dr365config = require("./clientConfig/clientConfig.json");

exports.Execute = async (fileNames) => {
    try {
        console.info("Deploying web resources...");

        const tokenResponse = await AcquireTokenWithClientCredentials();

        const files = fileHandler.GetFiles(fileNames);

        const webresourceService = new WebresourceService(files, tokenResponse, dr365config.webApiUrl)

        await webresourceService.UpsertWebresources();

        console.info("Done.");

    }
    catch (error) {
        console.error(error.message);
    }
}