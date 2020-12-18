/*
 * express-mfs
 *
 * Copyright(c) 2020 David Ward
 * MIT Licensed
 */

"use strict";

const debug = require("debug")("express-mfs:json");

   /* Module exports
   */
module.exports.accept = acceptJSON;
module.exports.content = contentJSON;
module.exports.only = onlyJSON;

const INVALID_ACCEPT = "Invalid Accept Header";
const INVALID_CONTENT = "Invalid Content-Type Header";


// =============================================================================
// JSON "accept" header middleware
//    request must have header and it must be json
// =============================================================================
function acceptJSON(req, res, next)
{
    var err;

   if (!req.header("accept") || !req.accepts("json"))
   {
      err = new Error(INVALID_ACCEPT);
      res.statusCode = 406;
      return(next(err));
   }

   return(next());
}

// =============================================================================
// JSON "content-type" header middleware
//    if content is present, header must specify json type
// =============================================================================
function contentJSON(req, res, next)
{
    var err;

   if ( req.header("content-length") && !req.is("json"))
   {
      err = new Error(INVALID_CONTENT);
      res.statusCode = 400;
      return(next(err));
   }

   return(next());
}

// =============================================================================
// Only JSON header middleware
//    Accept header and content-type header both must specify JSON
// =============================================================================
function onlyJSON(req, res, next)
{
   var err;

   if (!req.header("accept") || !req.accepts("json"))
   {
      err = new Error(INVALID_ACCEPT);
      res.statusCode = 406;
      return(next(err));
   }

   if ( req.header("content-length") && !req.is("json"))
   {
      err = new Error(INVALID_CONTENT);
      res.statusCode = 400;
      return(next(err));
   }

   return(next());
}
