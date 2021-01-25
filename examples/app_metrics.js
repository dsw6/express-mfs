/*
 * express-mfs
 *
 * Copyright(c) 2020 David Ward
 * MIT Licensed
 */

"use strict";

// ==========================================================================================
// Metrics Middlewares 
//
// Use this functionality to collect and report metrics for the service.
//
// metrics.init(opts):  
//    Used to initialized the metrics functionality.  The opts input specifies what 
//    to collect.  
//
//    opts:
//    {
//       totals:     boolean, collect request totals - success/failures
//       rps:        boolean, collect requests per second
//       methods:    boolean, collect method details
//       methodInfo: function, report method details to this function
//       extraInfo:  [functions], array of functions to provide custom stats
//                      for the metrics.info middleware
//    }
//
// methodInfo function: 
//    When provided, the methodInfo function will be invoked with details about each method. 
//    The function will be called with the following signature:
//
//    methodInfo(name, duration, req)
//          - name:        friendly name assigned to the method
//          - duration:    how long the method took, in milliseconds
//          - req:         the express request object
//
// extraInfo functions:
//    Information functions are used to provide additional data that will included in the
//    metrics.info middleware response.  An information function accepts no inputs 
//    and returns an object with two properties:  "name" and "value".
//
//    extraInfo function response example:  
//       {
//          name:  "poolInfo", 
//          value: {poolSize: 3, poolErrors: 5} 
//       }
//
//
// metrics.collect:  
//    This middleware configures the incoming request for metrics collection.  When collecting
//    method details, the middleware should be used early in the express middleware stack 
//    to ensure method timing data is correctly captured.
//
// metrics.name(name):  
//    Returns a middleware function that assigns a friendly name to the route.  When method
//    details are being collected, the friendly name is reported in the method details.  If 
//    a method information function is configured, the friendly name is reported to the function.
//
// metrics.info:  
//    Provides a "service stats" endpoint for the service. The middleware returns the stats 
//    that have been collected for the service plus any additional information reported 
//    by the extraInfo functions.
//
//
// Metrics info example response.  
//
//    The properties: "startDate", "upTime", "memory", "avgLoad" are always
//    present.  
//
//       - opts.totals=true, the "requests" property is present.  
//       - opts.rps=true, the "avgRPS" property is present.  
//       - opts.methods=true, the "methods" property is present.  
//
//    {
//       "startDate": "Tue, 08 Dec 2020 22:22:20 GMT",
//       "upTime": "0d:0h:0m:15s",
//       "memory": {
//          "rss": 29331456,
//          "heapTotal": 7712768,
//          "heapUsed": 6022248,
//          "external": 1269079
//       },
//       "avgLoad": {
//          "load1": 0,
//          "load5": 0,
//          "load15": 0
//       },
//       "requests": {
//          "total": 4,
//          "success": 4,
//          "failure": 0
//       },
//       "avgRPS": {
//          "rps1": 0.12,
//          "rps5": 0.03,
//          "rps15": 0.01
//       },
//       "methods": [
//          {
//             "name": "route1",
//             "count": 3,
//             "respTime": 2.29
//          },
//          {
//             "name": "serviceStats",
//             "count": 1,
//             "respTime": 1.89
//          }
//       ]
//    }
//
// ==========================================================================================

const express = require("express");
const mfs = require("express-mfs");
const API_PORT = 3000;


// ===============================================================================
// Additional information functions can be registered and will be called by
// the middleware.  
const customInfo = function()
{
   const info = {name: "myInfo", value: {health: "ok"}};

   return(info);
};

// ===============================================================================
// A method timing callback function can be registered.  The function will be
// with the "finish" event is fired for the response.  
//
//    callback parameters:
//          - name: the method name
//          - dur:  method timing, in milliseconds
//          - req:  the original request object
const methodInfo = function(name, dur, req)
{
   console.log(`${name},  ${req.method}: ${req.originalUrl}, statusCode: ${req.res.statusCode}, time: ${dur}`);
};

const opts = {
   totals: true,              // track request totals
   rps: true,                 // track avg requests/sec
   methods: true,             // track individual method (api) stats
   methodInfo: methodInfo,    // this function will be called with details about each method
   extraInfo: [customInfo]   // additional info for the metrics info method
};

const metrics = mfs.metrics;

metrics.init(opts);
const app = express();


   // all requests must accept JSON and send JSON
app.use(mfs.json.only);

   
app.use(metrics.collect);

   // set the name using the name middleware
app.get("/metrics/route1", metrics.name("route1"), function(req, res){
   res.json({  
         msg: `hello from ${req.originalUrl}`
   });
});


   // set the name inside of a middleware function
app.get("/metrics/route2", function(req, res){
   metrics.setName(req, "route2");
   res.json({  
         msg: `hello from ${req.originalUrl}`
   });
});


   // api to return the metrics info
app.get("/metrics/info", metrics.name("metrics"), metrics.info);


   // handle unknown routes
app.use(metrics.name("unknown_route"), mfs.unknown);

   // handle errors
app.use(mfs.error);


app.listen(API_PORT);
console.log(`API Service Listening On Port: ${API_PORT}`);



