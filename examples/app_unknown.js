/*
 * express-mfs
 *
 * Copyright(c) 2020 David Ward
 * MIT Licensed
 */

"use strict";

// ==========================================================================================
// unknown middleware
//
// mfs.unknown:
//    The middleware provides a standardized way to handle unknown routes.  
//
//    The middleware creates an error object with a "unknown route" messagea, sets 
//    the response statusCode=404 (Not Found) and invokes the next(err) path.  
//
//    When used with the mfs.error middleware, an API-friendly JSON error response
//    is returned.
//
// ==========================================================================================

const express = require("express");
const mfs = require("../lib");

const API_PORT = 3000;

const app = express();


app.get("/ping", mfs.ping);


   // if we get here, the route was not handled, use the unknown middleware   
app.use(mfs.unknown);

   // handle all errors
app.use(mfs.error);


app.listen(API_PORT);
console.log(`API Service Listening On Port: ${API_PORT}`);

