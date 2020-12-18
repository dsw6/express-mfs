/*
 * express-mfs
 *
 * Copyright(c) 2020 David Ward
 * MIT Licensed
 */

"use strict";

const debug = require("debug")("express-mfs:stats");
const os = require("os");
const util = require("util");

   /* Module exports
   */
module.exports.init          = init
module.exports.collect       = collect;
module.exports.name          = name;
module.exports.info          = info;
module.exports.getMetrics    = getMetrics;


const startDate = (new Date()).toUTCString();


   // ------------- Global Request Tracking -----------------------------------
const reqStats = {
   enabled: false,      // T/F
   total: 0,            // total number of requests since startup
   success: 0,          // total number of success responses (200 level statusCodes)
   failure: 0           // total number of error responses (non 200 level)
}

   // ------------- Method Request Tracking -----------------------------------
   //    Method details are stored as a map (key, value pairs).  The 
   //    key is the method name.  The values are objects: {count, time}
   //
   //    methods ex: {
   //       ping: {count: 123, totalTime: 345},
   //       serviceInfo: {count: 150, totalTime: 1230}
   //     }
const methodStats = {
   enabled: false,               // T/F
   methodInfo: null,             // function registered to receive timing data
   methods: {}                   // method details
}

   // ------------- Request/Sec Tracking -------------------------------------
   //    The req/sec values are calculated using a weighted moving average.
   //    A doublely linked circular list of samples is used.  Each sample
   //    represents the number of method calls made during the period. The timer
   //    function advances the current pointer to the next sample in the list.
const RPS_SAMPLE_INTERVAL = 5       // sample every 5 seconds
const RPS_1M_SAMPLE_CNT = 12        // 1 minute => 12 samples
const RPS_5M_SAMPLE_CNT = 60        // 5 minutes => 60 samples
const RPS_15M_SAMPLE_CNT = 180      // 15 minutes => 180 samples
const RPS_1M_WEIGHT_DIVISOR = (RPS_1M_SAMPLE_CNT * (RPS_1M_SAMPLE_CNT+1)) / 2;
const RPS_5M_WEIGHT_DIVISOR = (RPS_5M_SAMPLE_CNT * (RPS_5M_SAMPLE_CNT+1)) / 2;
const RPS_15M_WEIGHT_DIVISOR = (RPS_15M_SAMPLE_CNT * (RPS_15M_SAMPLE_CNT+1)) / 2;
const rpsStats = {
   enabled: false,
   timer: null,
   current: null     // current sample in the circular list
}

   // extra info functions, used by the stats middleware
const cbInfoFuncs = [];


   // ---------------------------------------------------------
function MethodStat()
{
   this.count = 0;
   this.totalTime = 0;
}

   // ---------------------------------------------------------
   //  prev, next pointers are initialized to point to itself
function RPS_Sample(node)
{
   this.node = node;
   this.count = 0;
   this.prev = this;
   this.next = this;
}


/**
 * Initialize the collection of stats.
 * @param {Object}  opts              - opts for the stats module
 * @param {boolean}    opts.totals    - optional, collect request totals (total requests, etc)
 * @param {boolean}    opts.rps       - optional, collect req/sec stats 
 * @param {boolean}    opts.methods   - optional, collect method stats
 * @param {function}   opts.timingFunc - optional, method timing data callback
 * @param {function[]} opts.infoFuncs  - optional, array of functions that provide additional information
 *
 * If provided, the timing callback (timingFunc) function will be invoked with details about each method.
 * The timingFunc will be called with the following signature:
 *
 *    timingFunc(duration, name, req)
 *          - duration:    how long the method took, in milliseconds
 *          - name:        friendly name assigned to the method
 *          - req:         the express request object
 *
 * infoFuncs is an array of functions that provide additional information.  The functions will be
 * called, in order, and their response data will be added to the stats response.  An info function
 * has no parameters and must return an object with two properties:  "name" and "value".  The
 * json data returned from stats will include an additional property ("name") with the value.
 *
 *       infoFunc response example:  { name:  "myInfo", value: {poolSize: 3, poolErrors: 5} }
*/
function init(opts)
{
   opts = opts || {};

   debug(`init: ${util.format(opts)}`);

      // reset all stats configuration each time init is called
   resetStats();

   if (typeof(opts) !== "object")
      throw new Error("invalid parameter, opts must be an object");      

   if (opts.hasOwnProperty("totals"))
   {
      if (typeof(opts.totals) !== "boolean")
         throw new Error("invalid parameter, opts.totals must be boolean");      

      reqStats.enabled = opts.totals;
   }

   if (opts.hasOwnProperty("rps"))
   {
      if (typeof(opts.rps) !== "boolean")
         throw new Error("invalid parameter, opts.rps must be boolean");      

      rpsStats.enabled = opts.rps;
   }      

   if (opts.hasOwnProperty("methods"))
   {
      if (typeof(opts.methods) !== "boolean")
         throw new Error("invalid parameter, opts.methods must be boolean");      

      methodStats.enabled = opts.methods;
   }
   
   if (opts.hasOwnProperty("methodInfo"))
   {
      if (typeof(opts.methodInfo) !== "function")
         throw new Error("invalid parameter: opts.methodInfo is not a function");

      methodStats.methodInfo = opts.methodInfo;
   }

   if (opts.hasOwnProperty("extraInfo"))
   {
      if (!Array.isArray(opts.extraInfo))
         throw new Error("invalid parameter: opts.extraInfo is not an array");

      for (let func of opts.extraInfo)
      {
         if (typeof(func) !== "function")
            throw new Error("invalid parameter: invalid extraInfo is not a function");
         
         cbInfoFuncs.push(func);
      }
   }


      // Create a doublely linked circular list.  Each sample points to the previous
      // and next samples.  The list contains n+1 samples.  The list will have 
      // n samples for calculating the averages.  The +1 sample is the active sample
      // which is counting requests for the current sample period.
   if (rpsStats.enabled)
   {
      let node = 0;
      let head = new RPS_Sample(++node);
      let tail = head;

      for (let i=0; i<RPS_15M_SAMPLE_CNT; i++)
      {
         let sample = new RPS_Sample(++node);
         sample.prev = tail;
         sample.next = head;
         tail.next = sample;
         head.prev = sample;
         tail = sample;
      }

      rpsStats.current = head;
      rpsStats.timer = setInterval(updateRPS, RPS_SAMPLE_INTERVAL * 1000).unref();
   }
}

   // ----------- Reset Stats ---------------------------------------------
   //    Reset the module's stats configuration
function resetStats()
{
      reqStats.enabled = false;
      reqStats.total = 0;
      reqStats.success = 0;
      reqStats.failure = 0;

      methodStats.enabled= false;
      methodStats.methodInfo= null;
      methodStats.methods= {};

      rpsStats.enabled = false;
      clearInterval(rpsStats.timer);
      rpsStats.timer = null;
      rpsStats.current = null;

      cbInfoFuncs.length = 0;
}

   // ----------- Sample Interval Timer Callback ------------------------------------
   //    Convert the sample count to rps (per second)
   //    Move the current sample bucket to the next one
function updateRPS()
{
   var count = rpsStats.current.count;
   rpsStats.current.count = count / RPS_SAMPLE_INTERVAL;
   rpsStats.current = rpsStats.current.next;
   rpsStats.current.count = 0;
}


   // ----------- Stats Callback Func ---------------------------------------------
   //    This function is registered by the collect middleware to collect stats
   //    When called, the express response object is the caller, the "this" object
function updateStats()
{
   var req = this.req;
   var statusCode = this.statusCode;
   var diff;
   var ms;
   var mName;

         // collect the request totals
   if (reqStats.enabled)
   {
      reqStats.total++;

      if ( statusCode >= 200 && statusCode < 300 )
         reqStats.success++;
      else
         reqStats.failure++;
   }
         // collect the rps level stats, increment the current sample count
   if (rpsStats.enabled)
      rpsStats.current.count++;

         // collect the method level stats
   if (req.mfsMetrics)
   {
      diff = process.hrtime(req.mfsMetrics.start);
      ms = (diff[0] * 1e3) + (diff[1] * 1e-6);
      mName = req.mfsMetrics.name;

      if (methodStats.enabled)
      {  
         if (!methodStats.methods[mName])
            methodStats.methods[mName] = new MethodStat();

         methodStats.methods[mName].count++;
         methodStats.methods[mName].totalTime += ms;
      }

      if (methodStats.methodInfo)
         methodStats.methodInfo(mName, ms, req);
   }
}


   // ----------- Compute the stats -----------------------------------------
function getMetrics()
{

   var upTime 	= process.uptime();
   var upDays	= Math.floor(upTime / 86400 )
   var upHrs 	= Math.floor(upTime % 86400 / 3600);
   var upMins	= Math.floor(upTime % 3600 / 60);
   var upSecs	= Math.floor(upTime % 60);
   var avgLoad = os.loadavg();
   var method;
   var name;

   var resp = {
      startDate: startDate,
      upTime: util.format("%dd:%dh:%dm:%ds", upDays, upHrs, upMins, upSecs),
      memory: process.memoryUsage(),
      avgLoad: { 
         load1: Math.round(avgLoad[0] * 100)/100, 
         load5: Math.round(avgLoad[1] * 100)/100, 
         load15: Math.round(avgLoad[2] * 100)/100
      }
   };

   if (reqStats.enabled)
      resp.requests = {total: reqStats.total, success: reqStats.success, failure: reqStats.failure};

   if (rpsStats.enabled)
      resp.avgRPS = calcRPS();

      // individual method level details (only methods that have been used will be present)
   if (methodStats.enabled)
   {
      resp.methods = [];
      for (name of Object.keys(methodStats.methods))
      {
         method = methodStats.methods[name];
         resp.methods.push({
               name: name, 
               count: method.count,
               respTime: Math.round((method.totalTime/method.count) * 100)/100
               });
      }
   }
      // add extra information as reported by each information function
   if (0 !== cbInfoFuncs.length)
   {
      for (let func of cbInfoFuncs)
      {
         let infoResp = func();
         resp[infoResp.name] = infoResp.value;
      }
   }

   return(resp);
}


   // ----------- Compute Weighted Moving Averages ----------------------------
   //    The current sample is active (collecting data), start with the 
   //    previous sample, which is the last full sample
function calcRPS()
{
   var rps1 = 0;
   var rps5 = 0;
   var rps15 = 0;

   var sample = rpsStats.current.prev;
   var s1 = RPS_1M_SAMPLE_CNT; 
   var s5 = RPS_5M_SAMPLE_CNT; 
   var s15 = RPS_15M_SAMPLE_CNT;
   
   for ( ; s15>0; s15--)
   {
      rps15 += (sample.count * (s15/RPS_15M_WEIGHT_DIVISOR));

      if (s5 > 0)
      {
         rps5 += (sample.count * (s5/RPS_5M_WEIGHT_DIVISOR)); 
         s5--;

         if (s1 > 0) { rps1 += (sample.count * (s1/RPS_1M_WEIGHT_DIVISOR)); s1--; }
      }

      sample = sample.prev;
   }

   return({
      rps1: Math.round(rps1 * 100)/100,
      rps5: Math.round(rps5 * 100)/100,
      rps15: Math.round(rps15 * 100)/100
   });
}




// ==========================================================================================================
// Middleware functions
// ==========================================================================================================

   // ----------- Stats collection ----------------------------------------------
   //    Register for the "finish" event to collect data and add method level
   //    tracking data on the request object if enabled.
function collect(req, res, next)
{
   res.on("finish", updateStats);

   if (methodStats.enabled || methodStats.methodInfo)
   {
      req.mfsMetrics = {
         start: process.hrtime(),
         name: req.originalUrl
      };
   }
   return( next() );
}

   // ----------- Stats collection ----------------------------------------------
   //    Returns a middleware function initialized with the name of the method
function name(name)
{
   if (methodStats.enabled === false)
      throw new Error("method stats are not enabled");

   if (typeof(name) !== "string")
      throw new Error("invalid parameter: opts.timingFunc is not a function");
 
   return(nameFunc);

   function nameFunc(req, res, next)
   {
      if (req.mfsMetrics) req.mfsMetrics.name = name;
      return( next() );
   }
}

   // ----------- Stats information ----------------------------------------------
function info(req, res, next)
{
   var err;

      // Add the friendly method name
   if (req.mfsMetrics && !req.mfsMetrics.name)
      req.mfsMetrics.name = "mfs_metrics";

       // only support registering on GET method
   if (req.method !== "GET")
   {
      err = new Error("Not Found");
      res.statusCode = 404;
      return(next(err));
   }
         // only support JSON
   if (!req.accepts("JSON"))
   {
      err = new Error("invalid Accept type");
      res.statusCode = 406;
      return(next(err));
   }

   res.json(getMetrics());
   return;

}