/*
 * express-mfs
 *
 * Copyright(c) 2020 David Ward
 * MIT Licensed
 */

"use strict";

// ==========================================================================================
// JSON middleware
//
// There are 3 middlewares that can be used to verify JSON is specified in the headers:
// accept header, content-type headers.
//
// mfs.json.accept:  
//    This middleware verifies accept header is present and specifies JSON responses are 
//    acceptable.  If the JSON is not acceptable, the middleware invokes the next(err) 
//    path and sets statusCode=406 (Not Acceptable).  If JSON is acceptable the 
//    the middleware invokes the next() middleware.
//
// mfs.json.content:  
//    This middleware verifies the content-type header specifies JSON content. It does not
//    verify the actual content is valid JSON data.   If JSON content is not specified,
//    the middleware invokes the next(err) path and sets statusCode=400 (Bad Request).  If 
//    JSON content is specified, the middlware invokes the next() middleware.  If 
//    the request has no content (ex: GET request), the middleware does not verify
//    the content-type header.
//
// mfs.json.only:  
//    This middleware verifies JSON is specified in both headers: accept, content-type.
//    It combines the logic of mfs.json.accept and mfs.json.content middlewares.
//
// ==========================================================================================

const express = require("express");
const mfs = require("../lib");

const API_PORT = 3000;

const app = express();


   // requests must accept a JSON payload, accept: application/json
app.get("/hello", mfs.json.accept, function(req, res){
   res.json({msg: "hello"});
});

   // requests must send JSON payload, content-type: application/json
app.post("/hello", mfs.json.content, function(req, res){
   // do some work with the json payload
   res.status(204).end();
});



   // all requests must accept JSON and send JSON
app.use(mfs.json.only);

app.get("/hello2", function(req, res){
   res.json({msg: "GET: hello2"});
});

app.post("/hello2", function(req, res){
   // do some work with the json payload
   res.json({msg: "POST: hello2"});
});


   // handle errors
app.use(mfs.error);


app.listen(API_PORT);
console.log(`API Service Listening On Port: ${API_PORT}`);

