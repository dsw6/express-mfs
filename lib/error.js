/*
 * express-mfs
 *
 * Copyright(c) 2020 David Ward
 * MIT Licensed
 */

"use strict";

var debug = require("debug")("express-mfs:error");

module.exports = errorHandler;

var dumpStack = (process.env.NODE_ENV === "production" ? false : true);

// =============================================================================
// error handling middleware
//
// err.statusCode => if present, this value will be used as the statusCode
// overriding any value in res.statusCode
// =============================================================================
function errorHandler(err, req, res, next)
{
   debug(`errorHandler - err.message: ${err.message}, err.statusCode: ${err.statusCode}`);
   debug(`errorHandler - res.statusCode: ${res.statusCode}`);

        // per express documentation, delegate to the default express error
        // handler if the request headers have already been sent
   if (res.headersSent)
      return( next(err) );

         // use the err.statusCode if set, if no statusCode has been set
         // default to 500
   if (err.statusCode)
      res.statusCode = err.statusCode;

   else if (res.statusCode === 200)
      res.statusCode = 500;

   if (!dumpStack)
      res.json({message: err.message});
   else
      res.json({message: err.message, stack: err.stack});

   return;
}