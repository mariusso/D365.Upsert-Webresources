const d365 = require("./d365");
const fileHandler = require("./fileHandler");

exports.UpsertWebresources = async () => {
    
    console.log("Deploying web resources...");

    const files = fileHandler.GetFiles();

    await d365.UploadWebresource(files);

    console.log("Done.");
}