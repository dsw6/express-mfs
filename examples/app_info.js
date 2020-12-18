/*
 * express-mfs
 *
 * Copyright(c) 2020 David Ward
 * MIT Licensed
 */

"use strict";

// ==========================================================================================
// service info middleware
//
// mfs.info:
//    The middleware provides a "service info" endpoint for your APIs.  
// 
//    The middleware returns information about the platform:  node version, cpus, arch,
//    hostname, etc.
//
//    Application level details are also returned:  name, description, version, 
//    dependencies, upTime, pid, startDate, etc.
//
//    The basic application details are read from the application's package.json file.
//
//    Below is an example response:
//    {
//       "name": "my-microservice",
//       "description": "example service",
//       "version": "1.0.0",
//       "dependencies": {
//          "express": "^4.13.4",      
//          "debug": "^4.1.1",
//          "express-mfs": "^1.0.0",
//       },
//       "nodeVersion": "v12.16.3",
//       "hostname": "XXXXXXXX",
//       "platform": "win32",
//       "arch": "x64",
//       "cpus": 12,
//       "startDate": "Tue, 30 Jun 2020 16:39:14 GMT",
//       "upTime": "0d:0h:0m:4s",
//       "pid": 153392
//    }
//
// ==========================================================================================

const express = require("express");
const mfs = require("../lib");

const API_PORT = 3000;

const app = express();

   // JSON-based apis
app.use(mfs.json.only);

app.get("/serviceInfo", mfs.info);

   // handle unknown routes
app.use(mfs.unknown);

   // handle all errors
app.use(mfs.error);

app.listen(API_PORT);
console.log(`API Service Listening On Port: ${API_PORT}`);

