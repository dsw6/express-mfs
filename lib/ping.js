/*
 * express-mfs
 *
 * Copyright(c) 2020 David Ward
 * MIT Licensed
 */

"use strict";

var debug = require("debug")("express-mfs:ping");

module.exports = ping;


// =============================================================================
// ping middleware
// =============================================================================
function ping(req, res, next)
{
   var err;

       // only support registering on GET method
    if (req.method !== "GET")
    {
      err = new Error("express-mfs: not found");
      res.statusCode = 404;
      return(next(err));
    }
       // only support JSON
   if (!req.accepts("JSON"))
   {
      err = new Error("express-mfs: invalid Accept type");
      res.statusCode = 406;
      return(next(err));
   }

   res.json({message: "pong"});
   return;
}