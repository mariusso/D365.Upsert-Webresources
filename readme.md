# About the repository

This repostitory can upload webresources directly to D365/dataverse by command line and optionally adding them to a solution. 

You can either upload by local directory or by manifest.

If you upload by local direcory, the virtual path of the webresource will be the same as the folder structure below the local directory.

Local directory "./output/prefix_/some/path/to/fileName.js" will become virtual path "prefix_/some/path/to/fileName.js".

This can be overridden by using manifest. If "localDirectory" is present in FileConfig.json, it will take priority.

No npm package yet unfortunately. Right now, you need to clone this repo and copy it locally with your webresource repo. 

## Example deploy command with local directory. Will traverse the local directory to find the file.
```
npm run start fileName.js DEV SolutionUniqueName
```

## Example deploy command with manifest. You don't need extension. It just needs to match the name of the manifest record.
```
npm run start fileName DEV SolutionUniqueName
```

## Example ClientAuthConfig.json:
```
[{ 
    "name": "DEV",
    "authority": "https://login.microsoftonline.com/tenantId/",
    "resource": "https://exampleorg.crmX.dynamics.com/", 
    "apiVersion": "9.2",
    "clientId": "App Reg Client Id", 
    "clientSecret": "App Reg Client Secret"
}]
```

Client Secret is optional. If this is not present, interactive login will be used.

## Example FileConfig.json using local directory:
```
{
    "localDirectory": "./output",
}
```

## Example FileConfig.json using manifest:
```
{
    "manifest": [{
        "name": "fileName",
        "localPath": "./output/some/path/to/fileName.js",
        "virtualPath": "prefix_/some/other/path/to/fileName.js"
    }]
}
```