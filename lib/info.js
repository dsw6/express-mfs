/*
 * express-mfs
 *
 * Copyright(c) 2020 David Ward
 * MIT Licensed
 */

"use strict";

const debug = require("debug")("express-mfs:info");
const os = require("os");
const util = require("util");
const path = require("path");


   // load the basic app information once when the module is loaded
const appInfo = getAppInfo();
const startDate = (new Date()).toUTCString();


   /* Module exports
   */
module.exports = info;
module.exports.appInfo = appInfo;


// =============================================================================
// service info middleware
// =============================================================================
function info(req, res, next)
{
   var upTime = process.uptime();
   var upDays = Math.floor(upTime / 86400 )
   var upHrs  = Math.floor(upTime % 86400 / 3600);
   var upMins = Math.floor(upTime % 3600 / 60);
   var upSecs = Math.floor(upTime % 60);

   var upTimeString = util.format("%dd:%dh:%dm:%ds", upDays, upHrs, upMins, upSecs);

         // only support registering on GET method
   if (req.method !== "GET")
   {
      res.statusCode = 404;
      return(next(new Error("Not Found")));
   }
       // only support JSON
   if (!req.accepts("JSON"))
   {
      res.statusCode = 406;
      return(next(new Error("invalid Accept type")));
   }

   res.json({
      name: appInfo.name,
      description: appInfo.description,
      version: appInfo.version,
      dependencies: appInfo.dependencies,

      nodeVersion: process.version,

      hostname: os.hostname(),
      platform: process.platform,
      arch: process.arch,
      cpus: os.cpus().length,

      startDate: startDate,
      upTime: upTimeString,
      pid: process.pid
   });
   
   return;
}


   // Return the application level information
   // The application information is loaded from the application"s package.json file
   // Try to load the application"s package.json file by searching
   // the path.  Starting with the folder the main file was loaded from
   //
function getAppInfo()
{
   var pkgJSON     = undefined;
   var pkgJSONPath = require.main.filename;
   var pathRoot    = (pkgJSONPath.split(path.sep))[0] + path.sep;

   do
   {
      pkgJSONPath = path.dirname(pkgJSONPath);

      try {
         pkgJSON = require(pkgJSONPath + path.sep + "package.json");
         debug("app level package.json found -> path: " + pkgJSONPath);
      }
      catch (err) {
         debug("app level package.json not found -> path: " + pkgJSONPath);
      }

   } while (!pkgJSON && pathRoot !== pkgJSONPath)

   pkgJSON = pkgJSON || {};
   pkgJSON.name = pkgJSON.name || "no_name";
   pkgJSON.version = pkgJSON.version || "no_version";
   pkgJSON.description = pkgJSON.description || "no_description";

   return( pkgJSON );
}

