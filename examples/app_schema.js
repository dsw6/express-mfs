/*
 * express-mfs
 *
 * Copyright(c) 2020 David Ward
 * MIT Licensed
 */

"use strict";

// ==========================================================================================
// schema verifier middleware
//
// The schema verification middleware can be used to validate any property of the express
// 'req' middleware parameter.  
//
// Create a schema verification middleware by passing in an object that contains
// validation functions for each desired request object property.
//
// The validation function will be passed the value of the req.xx property.
// 
// Schema Object Example:
//  {
//     body:  function checkBody(body) {...},
//     query: function checkQuery(query) {...},
//     params: function checkParams(params) {...}
//  }
// 
// Validation Function: accepts one input, the req.xx propery, and returns a 
// validation result object.  
//  
// ValidationResult: 
//  {
//     error: {message: "error message to return", statusCode: statusCode to return},
//     value: new value for req.xxx propery 
//  }   
//  
// If the error propery is present, the validation is treated as a failure.
//  
// If the value property is present, the new value is assigned to the 
// req.xx property.  This provides an mechanism for the validation 
// function to modify the req.xxx property as part of the validation process.
//
// ==========================================================================================

const express = require("express");
const bodyParser = require("body-parser");
const joi = require("@hapi/joi");

const mfs = require("../lib");
const API_PORT = 3000;

// ========== Schema Verification Functions ================================================================

   // --- req.query schema verification ---------------------
   //    This example use the joi library to do validation
   //    Two query parameters are checked
   //       - q1 -> optional, must be an integer
   //       - q2 -> required, must be v1|v2  
const queryVerifier = function(query){

   let schema = joi.object().keys({
      q1:    joi.number().integer().optional(),
      q2:    joi.string().required().valid("v1", "v2")
   });   

      // the joi validation result is compatible with the schema verification middleware
      // so it is possible to return it directly.  The http statusCode will default to 400-Bad Request
   return(schema.validate(query));
};


   // --- req.params schema verification ---------------------
   //    This example uses a simple verication mechanism
   //    and returns a new value for the req.params
const paramsVerifier = function(params){

      // any simple validation mechanism can be used
      if (params.name !== "jim") 
         return({error: {message:`'${params.name}' is not valid`, statusCode:400}, value: undefined });

         // The req.params property will be replaced with the returned value
      return({error: undefined, value: {firstName:"Jim", lastName:"Smith"} });
};


   // --- req.body schema verification ---------------------
   //    Use joi, body must have firstName and lastName 
const bodyVerifier = function(body){

   let schema = joi.object().keys({
      firstName:  joi.string().required(),
      lastName:   joi.string().required()
   });   

   return(schema.validate(body));
};

// ===================================================================================================



const app = express();


   // all requests must accept JSON and send JSON
app.use(mfs.json.only);

   // body-parser will parse all request payload as JSON and create a req.body object
app.use(bodyParser.json());


   // query parameter validation (req.query)
app.get("/schema/query",  mfs.schema({query: queryVerifier}),  function(req, res){
   res.json({  
         msg: `hello from ${req.originalUrl}`,
         req_query: req.query
   });
});


   // url parameter validation (req.params)
app.get("/schema/:name",  mfs.schema({params: paramsVerifier}),  function(req, res){
   res.json({  
         msg: `hello from ${req.originalUrl}`,
         req_params: req.params
   });
});


   // multiple property validations (req.params, req.query)
app.get("/schema/multiple/:name",  mfs.schema({query: queryVerifier, params: paramsVerifier}),  function(req, res){
   res.json({  
         msg: `hello from ${req.originalUrl}`,
         req_params: req.params,
         req_query: req.query
   });
});


   // request body parameter validation (req.body) assumes body-parser has been used
app.post("/schema/body",  mfs.schema({body: bodyVerifier}),  function(req, res){
   res.json({  
         msg: `hello from ${req.originalUrl}`,
         req_body: req.body
   });
});


   // handle unknown routes
app.use(mfs.unknown);

   // handle errors
app.use(mfs.error);


app.listen(API_PORT);
console.log(`API Service Listening On Port: ${API_PORT}`);



