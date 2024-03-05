"use strict";

const WebresourceService = require("./WebresourceService").WebresourceService;
const fileHandler = require("./FileHandler");
const AcquireTokenByClientCredential = require("./MsalNode").AcquireTokenByClientCredential;
const clientAuthConfig = require("./clientAuthConfig.json");

exports.Execute = async (fileNames, environment, solutionUniqueName) => {
    try {

        if(fileNames.length < 1) {
            throw new Error("No file names specified");
        }

        const config = clientAuthConfig.filter(c => c.name == environment)?.[0];

        if(config == null) {
            throw new Error("No client configuration with name '" + environment + "' found.");
        }

        console.log(`Environment: ${environment}. Url: ${config.resource}`);

        console.info("Acquiring token...");

        const tokenResponse = await AcquireTokenByClientCredential(config);

        console.info("Retrieving files...");

        const files = fileHandler.GetFiles(fileNames);

        console.info("Deploying web resources...");

        const webresourceService = new WebresourceService(files, tokenResponse, config)

        await webresourceService.UpsertWebresources(solutionUniqueName);

        console.info("Done.");
    }
    catch (error) {
        console.error(error.message);
    }
}