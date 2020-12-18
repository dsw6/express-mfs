/*
 * express-mfs
 *
 * Copyright(c) 2020 David Ward
 * MIT Licensed
 */

"use strict";

const debug = require("debug")("express-mfs:schema");


/* ======================================================================
 * Public Interface
*/
module.exports = createVerifier;



/**
 *  Schema Verifier
 *
 * Create schema verification middleware to validate requests.
 * 
 * @param {Object} schema - object containing validation functions for each
 * desired express request object property.
 * 
 * The validation function will be passed the value of the req.xx property.
 *
 * Schema Object Example:
 * {
 *    body:  function checkBody(body) {...},
 *    query: function checkQuery(query) {...},
 *    params: function checkParams(params) {...}
 * }
 *
 * Validation Function: accepts one input, the req.xx propery, and returns a 
 * validation result object.  
 * 
 * ValidationResult: 
 * {
 *    error: {message: "error message to return", statusCode: statusCode to return},
 *    value: new value for req.xxx propery 
 * }   
 * 
 * If the error propery is present, the validation is treated as a failure.
 * 
 * If the value property is present, the new value is assigned to the 
 * req.xx property.  This provides an mechanism for the validation 
 * function to modify the req.xxx property as part of the validation process.
 * 
 */
function createVerifier( schema )
{
   schema = schema || {};

   if (typeof(schema) !== "object")
      throw new Error("invalid parameter, schema must be an object");      

   const properties = Object.keys(schema);

   return(verifier_middleware);

      // -----------------------------------------
   function verifier_middleware( req, res, next )
   {
      var p;
      var result;
      var err;

      for (p of properties)
      {
         result = schema[p](req[p]);

         if (result.error)
         {
            debug(`req.${p} - validation failed`);
            err = new Error(result.error.message || "schema validation error");
            res.statusCode = result.error.statusCode || 400;
            return(next(err));
         }

         if (result.value) req[p] = result.value;
      }
      return(next());
   }
}