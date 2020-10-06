const AuthenticationContext = require('adal-node').AuthenticationContext;
const findConfig = require("find-config");
const d365Config  = require("./d365upsertwebresourcesconfiguration/d365.json");
const clientConfig  = require("./d365upsertwebresourcesconfiguration/client.json");

if(d365Config == null) {
    throw new Error("Missing d365.json");
}

if(clientConfig == null) {
    throw new Error("Missing client.json");
}

const authorityUri = d365Config.authority;

exports.acquireTokenWithUserNameAndPassword = () => {
    return new Promise((resolve, reject) => {
        const authContext = new AuthenticationContext(authorityUri, true);
        authContext.acquireTokenWithUsernamePassword(d365Config.resource, clientConfig.username, clientConfig.password, clientConfig.clientId, (error, tokenResponse) => {
            if(error) {
                reject(error);
            }
            resolve(tokenResponse);
        });
    })
 };

 exports.acquireTokenWithClientCredentials = () => {
    return new Promise((resolve, reject) => {
        const authContext = new AuthenticationContext(authorityUri, true);
        authContext.acquireTokenWithClientCredentials(d365Config.resource, clientConfig.clientId, clientConfig.clientSecret, (error, tokenResponse) => {
            if(error) {
                reject(error);
            }
            resolve(tokenResponse);
        });
    })
 };