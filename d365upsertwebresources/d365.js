"use strict";

const url = require("url");
const adal = require("./adal");
const superagent = require("superagent");
const findConfig = require("find-config");
const d365Config = require("./d365upsertwebresourcesconfiguration/d365.json");

if (d365Config == null) {
    throw new Error("Missing d365.json");
}

const webResourceUrl = url.format(d365Config.webApiUrl + "webresourceset");
const publishUrl = url.format(d365Config.webApiUrl + "PublishXml");

exports.UploadWebresource = async (files) => {

    let publishCustomizations = false;
    let publishXmlString = "<importexportxml><webresources>" ;

    const tokenResponse = await adal.acquireTokenWithUserNameAndPassword();

    for (const file of files) {
        const existingWebResource = await TryFindExistingWebresource(file, tokenResponse);
        if (existingWebResource) {
            console.log(file.virtualPath + ": existing.");
            publishCustomizations = true;
            await UpdateWebresource(existingWebResource.webresourceid, file.fileContent, tokenResponse);
            publishXmlString += "<webresource>" + existingWebResource.webresourceid + "</webresource>";

        } else {
            console.log(file.virtualPath + ": new.");
            await CreateWebresource(file, tokenResponse);
        }
    }

    publishXmlString += "</webresources></importexportxml>" ;

    if (publishCustomizations) {
        console.log("Publishing customizations...");
        await PublishCustomizations(publishXmlString, tokenResponse);
    }
}

const TryFindExistingWebresource = async (file, tokenResponse) => {
    return new Promise((resolve, reject) => {

        const queryUrl = encodeURI(webResourceUrl + "?$select=webresourceid&$filter=name eq '" + file.virtualPath + "'");
        const headers = GetRequestHeaders(tokenResponse);
        superagent.get(queryUrl).set(headers).then((res) => {
            resolve(res.body.value.pop());
        }).catch((error) => {
            reject(error);
        });
    });
}

const UpdateWebresource = async (webresourceId, fileContent, tokenResponse) => {
    return new Promise((resolve, reject) => {

        const url = encodeURI(webResourceUrl + "(" + webresourceId + ")");
        const headers = GetRequestHeaders(tokenResponse);

        const webresource = {
            content: fileContent,
        }

        superagent.patch(url).set(headers).send(webresource).then((res) => {
            resolve(res.body);
        }).catch((error) => {
            reject(error);
        });
    });
}

const CreateWebresource = async (file, tokenResponse) => {
    return new Promise((resolve, reject) => {

        const url = encodeURI(webResourceUrl);
        const headers = GetRequestHeaders(tokenResponse);

        const webresource = {
            name: file.virtualPath,
            displayname: file.fileName,
            webresourcetype: file.type,
            content: file.fileContent,
        }

        superagent.post(url).set(headers).send(webresource).then((res) => {
            resolve(res.body);
        }).catch((error) => {
            reject(error);
        });
    });
}

const PublishCustomizations = async (publishXmlString, tokenResponse) => {
    return new Promise((resolve, reject) => {

        const url = encodeURI(publishUrl);
        const headers = GetRequestHeaders(tokenResponse);

        const publishBody = {
            ParameterXml: publishXmlString
        }

        superagent.post(url).set(headers).send(publishBody).then((res) => {
            resolve(res.body);
        }).catch((error) => {
            reject(error);
        });
    });
}

const GetRequestHeaders = (tokenResponse) => {
    const headers = {
        "Authorization": "Bearer " + tokenResponse.accessToken,
        "Accept": "application/json",
        "Content-Type": "application/json",
        "OData-MaxVersion": "4.0",
        "OData-Version": "4.0"
    };

    return headers;
}