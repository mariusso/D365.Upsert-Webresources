"use strict";

const superagent = require("superagent");

exports.WebresourceService = class WebresourceService {

    constructor(filesToUpsert, tokenResponse, config) {

        this.Files = filesToUpsert;

        this.RequestHeaders = {
            "Authorization": "Bearer " + tokenResponse.accessToken,
            "Accept": "application/json",
            "Content-Type": "application/json",
            "If-None-Match": null,
            "OData-MaxVersion": "4.0",
            "OData-Version": "4.0",
            "Prefer": "return=representation,odata.include-annotations=\"*\"",
        };

        const relativeUrl = "api/data/v" + config.apiVersion + "/";

        const webApiUrl = new URL(relativeUrl, config.resource)

        this.WebresourceUrl = new URL("webresourceset", webApiUrl).toString();
        this.PublishUrl = new URL("PublishXml", webApiUrl).toString();
        this.AddToSolutionUrl = new URL("AddSolutionComponent", webApiUrl).toString();
    }

    async UpsertWebresources(solutionUniqueName) {
        let publishCustomizations = false;
        let publishXmlString = "<importexportxml><webresources>";

        for (const file of this.Files) {
            let webresourceid = await this.TryFindExistingWebresource(file);
            if (webresourceid) {
                console.info(file.virtualPath + ": existing.");
                publishCustomizations = true;
                await this.UpdateWebresource(webresourceid, file.fileContent);
                publishXmlString += "<webresource>" + webresourceid + "</webresource>";

            } else {
                console.info(file.virtualPath + ": new.");
                const createResponse = await this.CreateWebresource(file);
                webresourceid = createResponse.webresourceid;
            }

            if(solutionUniqueName != null && solutionUniqueName.length > 0) {
                console.log("Adding " + file.virtualPath + " to solution " + solutionUniqueName);
                await this.AddWebresourceToSolution(webresourceid, solutionUniqueName);
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

        const existingWebresource = res.body.value.pop();

        return existingWebresource?.webresourceid;
    }

    async UpdateWebresource(webresourceId, fileContent) {
        const url = encodeURI(this.WebresourceUrl + "(" + webresourceId + ")");

        const webresource = {
            content: fileContent,
        }

        try {
            await superagent.patch(url).set(this.RequestHeaders).send(webresource);
        }
        catch (errorResponse) {
            throw new Error(errorResponse.response.body.error.message);
        }
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

    async DeleteWebresource(webresourceId) {
        const url = encodeURI(this.WebresourceUrl + "(" + webresourceId + ")");

        try {
            await superagent.del(url).set(this.RequestHeaders);
        }
        catch (errorResponse) {
            throw new Error(errorResponse.response.body.error.message);
        }
    }

    async AddWebresourceToSolution(webresourceId, solutionUniqueName) {
        const url = encodeURI(this.AddToSolutionUrl);

        const addSolutionComponentRequest = {
            ComponentId: webresourceId,
            ComponentType: 61, // Webresource
            SolutionUniqueName: solutionUniqueName,
            AddRequiredComponents: false,
            IncludedComponentSettingsValues: null
        };

        try {
            await superagent.post(url).set(this.RequestHeaders).send(addSolutionComponentRequest)
        } catch (error) {
            throw new Error(error.response.body.error.message);
        }
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