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
process.env.NODE_ENV = undefined;

const httpMocks = require('node-mocks-http');
const expect = require("chai").expect;
const mfs = require("../lib");


describe("Error Middleware", function () 
{

      //----------------------------------------------------------------------------
   it("err.message should be returned", function () 
   {
      var msg = "Error Msg";
      var req = httpMocks.createRequest();
      var res = httpMocks.createResponse();
      var err = new Error(msg);

      mfs.error(err, req, res, function next(err) {});

      var data = res._getJSONData();
      expect(data.message).to.equal(msg);
   });


      //----------------------------------------------------------------------------
   it("err.stack should be returned in non-prod environments", function () 
   {
      var msg = "Error Msg";
      var req = httpMocks.createRequest();
      var res = httpMocks.createResponse();
      var err = new Error(msg);

      mfs.error(err, req, res, function next(err) {});

      var data = res._getJSONData();
      expect(data.message).to.equal(msg);
      expect(data.stack).to.exist;
   });


      //----------------------------------------------------------------------------
   it("if present, err.statusCode should be used for response statusCode", function () 
   {
      var code = 404;
      var msg = "Error Msg";
      var req = httpMocks.createRequest();
      var res = httpMocks.createResponse();
      var err = new Error(msg);
      err.statusCode = code;

      mfs.error(err, req, res, function next(err) {});

      expect(res.statusCode).to.equal(code);
   });


      //----------------------------------------------------------------------------
   it("if err.statusCode is not present, res.statusCode should be used (unchanged)", function () 
   {
      var code = 404;
      var msg = "Error Msg";
      var req = httpMocks.createRequest();
      var res = httpMocks.createResponse();
      var err = new Error(msg);

      res.statusCode = code;
      mfs.error(err, req, res, function next(err) {});

      expect(res.statusCode).to.equal(code);
   });


      //----------------------------------------------------------------------------
   it("if res.statusCode was not set, res.statusCode should be set to 500", function () 
   {
         // Note: the res.statusCode is defaulted to 200 
         
      var msg = "Error Msg";
      var req = httpMocks.createRequest();
      var res = httpMocks.createResponse();
      var err = new Error(msg);

      mfs.error(err, req, res, function next(err) {});

      expect(res.statusCode).to.equal(500);
   });


      //----------------------------------------------------------------------------
   it("err should NOT be propogated to next error middleware", function () 
   {
      var msg = "Error Msg";
      var req = httpMocks.createRequest();
      var res = httpMocks.createResponse();
      var err = new Error(msg);
      var nextInvoked = false;

      res.headersSent = false;
      mfs.error(err, req, res, function next(err) { 
         nextInvoked = true; 
      });

      expect(nextInvoked).to.be.false;
   });

      //----------------------------------------------------------------------------
   it("if res.headersSent, no data should be write to the response object", function () 
   {
      var msg = "Error Msg";
      var req = httpMocks.createRequest();
      var res = httpMocks.createResponse();
      var err = new Error(msg);

      res.headersSent = true;
      mfs.error(err, req, res, function next(err) {});

      expect(res._getData()).to.be.empty;
   });

      //----------------------------------------------------------------------------
   it("if res.headersSent, the return(next(err)) pattern should be used", function () 
   {
      var returnValue = "AAA";
      var msg = "Error Msg";
      var req = httpMocks.createRequest();
      var res = httpMocks.createResponse();
      var err = new Error(msg);

      res.headersSent = true;
      var ret = mfs.error(err, req, res, function next(err) {return returnValue});

      expect(ret).to.equal(returnValue);
   });

});
