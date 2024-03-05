"use strict";

const msal = require('@azure/msal-node');

exports.AcquireTokenByClientCredential = async (clientAuthConfig) => {
    const msalConfig = {
        auth: {
            clientId: clientAuthConfig.clientId,
            authority: clientAuthConfig.authority,
            clientSecret: clientAuthConfig.clientSecret
        }
    };

    const cca = new msal.ConfidentialClientApplication(msalConfig);

    const tokenReq = {
        scopes: [clientAuthConfig.resource + ".default"]
    }

    const tokenResponse = await cca.acquireTokenByClientCredential(tokenReq);

    return tokenResponse;

}