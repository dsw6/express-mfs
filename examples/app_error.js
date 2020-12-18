/*
 * express-mfs
 *
 * Copyright(c) 2020 David Ward
 * MIT Licensed
 */

"use strict";

// ==========================================================================================
// error middleware
//
// mfs.error:
//    The error middleware provides basic error handling functionality.  The middleware
//    sets the response http statusCode and sends a error message.  
//
//    This middleware provides an API-friendly JSON error response.  The default 
//    express error handling functionality returns an html document with error 
//    information.
//
//    The following logic is used for determining the statusCode and error message:
//
//    Response HTTP statusCode (ordered list):
//
//       - err.statusCode specified: the value will be used
//
//       - res.statusCode specified (not the 200 default): value will be used
//
//       - res.statusCode no specified:  500, Internal Server Error, will be used
//
//    Response Payload:
//
//       - NODE_ENV = production:  the response payload contain err.message 
//
//       - NODE_ENV != production:  the response payload will contain err.message and err.stack
//
// ==========================================================================================

const express = require("express");
const mfs = require("../lib");

const API_PORT = 3000;

const app = express();


   // if err.statusCode is set, it will be used for the response http statusCode
app.get("/error1", function(req, res, next){

   var err = new Error("error1 - use err.statusCode");
   err.statusCode = 400;
   next(err);
});


   // no err.statusCode, no res.statusCode, default statusCode=500 will be used
app.get("/error2", function(req, res, next){

   var err = new Error("error2 - default to 500");
   next(err);
});


   // no err.statusCode, res.statusCode is specifically set, use res.statusCode
app.get("/error3", function(req, res, next){

   res.statusCode = 401
   var err = new Error("error3 - use res.statusCode");
   next(err);
});


   // handle errors
app.use(mfs.error);


app.listen(API_PORT);
console.log(`API Service Listening On Port: ${API_PORT}`);

