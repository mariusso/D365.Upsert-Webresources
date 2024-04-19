"use strict";

const msal = require('@azure/msal-node');

exports.AcquireTokenByClientCredential = async (clientAuthConfig) => {
    const msalConfig = {
        auth: {
            authority: clientAuthConfig.authority,
            clientId: clientAuthConfig.clientId,
            clientSecret: clientAuthConfig.clientSecret
        }
    };

    const cca = new msal.ConfidentialClientApplication(msalConfig);

    const tokenRequest = {
        scopes: [clientAuthConfig.resource + ".default"]
    }

    const tokenResponse = await cca.acquireTokenByClientCredential(tokenRequest);

    return tokenResponse;
}

exports.AcquireTokenInteractive = async (clientAuthConfig) => {
    const msalConfig = {
        auth: {
            authority: clientAuthConfig.authority,
            clientId: clientAuthConfig.clientId,
        }
    };

    const pca = new msal.PublicClientApplication(msalConfig);

    const openBrowser = async (url) => {
        const moduleSpecifier = "open";
        const module = await import(moduleSpecifier);
        module.default(url);
    };

    const tokenRequest = {
        scopes: [clientAuthConfig.resource + ".default"],
        openBrowser,
        successTemplate: '<h1>Successfully signed in!</h1><p>You can close this window now.</p>',
        errorTemplate:"<h1>Something went wrong</h1><p>Check the console for more information.</p>",
    };

    const tokenResponse = await pca.acquireTokenInteractive(tokenRequest);

    return tokenResponse;
}