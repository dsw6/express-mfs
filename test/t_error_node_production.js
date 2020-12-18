/*
 * express-mfs
 *
 * Copyright(c) 2020 David Ward
 * MIT Licensed
 */


"use strict";

   // The mfs.error module checks NODE_ENV once at load time to determine if 
   // the error stack should be included.  Delete the mfs main module and
   // the error module for force reloading before the test runs
delete require.cache[require.resolve("../lib/index.js")];
delete require.cache[require.resolve("../lib/error.js")];

   // set the production environment variable
process.env.NODE_ENV = "production";

const httpMocks = require('node-mocks-http');
const expect = require("chai").expect;
const mfs = require("../lib");


describe("Error Middleware (production)", function () 
{

      //----------------------------------------------------------------------------
   it("err.message should be returned when NODE_ENV=production", function () 
   {
      var mfs = require("../lib");
      var msg = "Error Msg";
      var req = httpMocks.createRequest();
      var res = httpMocks.createResponse();
      var err = new Error(msg);

      mfs.error(err, req, res, function next(err) {});

      var data = res._getJSONData();
      expect(data.message).to.equal(msg);
   });


      //----------------------------------------------------------------------------
   it("err.stack should NOT be returned when NODE_ENV=production", function () 
   {
      var msg = "Error Msg";
      var req = httpMocks.createRequest();
      var res = httpMocks.createResponse();
      var err = new Error(msg);

      mfs.error(err, req, res, function next(err) {});

      var data = res._getJSONData();
      expect(data.message).to.equal(msg);
      expect(data.stack).to.not.exist;
   });

});
