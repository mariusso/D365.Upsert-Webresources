"use strict";

const url = require("url");
const superagent = require("superagent");

exports.WebresourceService = class WebresourceService {

    constructor(filesToUpsert, tokenResponse, webApiUrl) {

        this.Files = filesToUpsert;

        this.RequestHeaders = {
            "Authorization": "Bearer " + tokenResponse.accessToken,
            "Accept": "application/json",
            "Content-Type": "application/json",
            "OData-MaxVersion": "4.0",
            "OData-Version": "4.0"
        };

        this.WebresourceUrl = url.format(webApiUrl + "webresourceset");
        this.PublishUrl = url.format(webApiUrl + "PublishXml");
    }

    async UpsertWebresources() {
        let publishCustomizations = false;
        let publishXmlString = "<importexportxml><webresources>";

        for (const file of this.Files) {
            const existingWebResource = await this.TryFindExistingWebresource(file);
            if (existingWebResource) {
                console.info(file.virtualPath + ": existing.");
                publishCustomizations = true;
                await this.UpdateWebresource(existingWebResource.webresourceid, file.fileContent);
                publishXmlString += "<webresource>" + existingWebResource.webresourceid + "</webresource>";

            } else {
                console.info(file.virtualPath + ": new.");
                await this.CreateWebresource(file);
            }
        }

        publishXmlString += "</webresources></importexportxml>";

        if (publishCustomizations) {
            console.info("Publishing customizations...");
            await this.PublishCustomizations(publishXmlString);
        }
    }

    async TryFindExistingWebresource(file) {

        const queryUrl = encodeURI(this.WebresourceUrl + "?$select=webresourceid&$filter=name eq '" + file.virtualPath + "'");

        let res = undefined;
        try {
            res = await superagent.get(queryUrl).set(this.RequestHeaders);
        }
        catch (errorResponse) {
            throw new Error(errorResponse.response.body.error.message);
        }

        return res.body.value.pop();
    }

    async UpdateWebresource(webresourceId, fileContent) {
        const url = encodeURI(this.WebresourceUrl + "(" + webresourceId + ")");

        const webresource = {
            content: fileContent,
        }

        let res = undefined;
        try {
            res = await superagent.patch(url).set(this.RequestHeaders).send(webresource);
        }
        catch (errorResponse) {
            throw new Error(errorResponse.response.body.error.message);
        }

        return res.body;
    }

    async CreateWebresource(file) {

        const url = encodeURI(this.WebresourceUrl);

        const webresource = {
            name: file.virtualPath,
            displayname: file.fileName,
            webresourcetype: file.type,
            content: file.fileContent,
        }

        let res = undefined;
        try {
            res = await superagent.post(url).set(this.RequestHeaders).send(webresource);
        }
        catch (errorResponse) {
            throw new Error(errorResponse.response.body.error.message);
        }

        return res.body;
    }

    async PublishCustomizations(publishXmlString) {
        const url = encodeURI(this.PublishUrl);

        const publishBody = {
            ParameterXml: publishXmlString
        }

        let res = undefined;
        try {
            res = await superagent.post(url).set(this.RequestHeaders).send(publishBody);
        }
        catch (errorResponse) {
            throw new Error(errorResponse.response.body.error.message);
        }

        return res.body;
    }
}