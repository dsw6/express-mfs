/*
 * express-mfs
 *
 * Copyright(c) 2020 David Ward
 * MIT Licensed
 */

"use strict";

var debug = require("debug")("express-mfs:unknown");
var util  = require("util");

module.exports = unknown;

// =============================================================================
// generic handler for unknown routes
// =============================================================================
function unknown(req, res, next)
{
        // If a the request was processed, do nothing, not an unknown route
   if (res.headersSent || res.finished)
      return( next() );

    var err = new Error(req.method + " " + req.originalUrl + "  unknown route");

    res.statusCode = 404;
    return( next(err) );
}