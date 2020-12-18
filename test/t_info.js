/*
 * express-mfs
 *
 * Copyright(c) 2020 David Ward
 * MIT Licensed
 */


"use strict";

const os = require("os");
const httpMocks = require('node-mocks-http');
const expect = require("chai").expect;
const Emitter = require("events").EventEmitter;
const mfs = require("../lib");


describe("Info Middleware", function () 
{
   // NOTE:  The response mock doesn't have a reference to the request object.  In express
   // the res.req property is available, manually set it for the tests

      //----------------------------------------------------------------------------
   it("response should be info data", function () 
   {
      var req = httpMocks.createRequest({method: "GET", headers: {'accept': "application/json"}});
      var res = httpMocks.createResponse({eventEmitter: Emitter});
      res.req = req;

      mfs.info(req, res, function next() {});

      var data = res._getJSONData();
      expect(data.name).to.exist;
      expect(data.description).to.exist;
      expect(data.version).to.exist;
      expect(data.dependencies).to.exist;
      expect(data.nodeVersion).to.equal(process.version);
      expect(data.hostname).to.equal(os.hostname());
      expect(data.platform).to.equal(process.platform);
      expect(data.arch).to.equal(process.arch);
      expect(data.cpus).to.equal(os.cpus().length);
      expect(data.startDate).to.exist;
      expect(data.upTime).to.exist;
      expect(data.pid).to.equal(process.pid);
   });


      //----------------------------------------------------------------------------
   it("response should be content-type: application/json", function () 
   {
      var req = httpMocks.createRequest({method: "GET", headers: {'accept': "application/json"}});
      var res = httpMocks.createResponse({eventEmitter: Emitter});
      res.req = req;

      mfs.info(req, res, function next() {});

      expect(res.header("content-type")).to.equal("application/json");
   });


      //----------------------------------------------------------------------------
   it("only 'GET' method should be supported", function () 
   {
      var req = httpMocks.createRequest({method: "POST", headers: {'accept': "application/json"}});
      var res = httpMocks.createResponse({eventEmitter: Emitter});
      res.req = req;

      mfs.info(req, res, function next(err) {
         expect(err.message).to.exist;
      });

      expect(res.statusCode).to.equal(404);
   });


      //----------------------------------------------------------------------------
   it("only 'JSON' accept type should be supported", function () 
   {
      var req = httpMocks.createRequest({method: "GET", headers: {'accept': "application/xml"}});
      var res = httpMocks.createResponse({eventEmitter: Emitter});
      res.req = req;

      mfs.info(req, res, function next(err) {
         expect(err.message).to.exist;
      });

      expect(res.statusCode).to.equal(406);
   });


      //----------------------------------------------------------------------------
   it("invalid Accept header - return(next(err)) pattern should be used", function () 
   {
      var retValue = "AAA";
      var req = httpMocks.createRequest({method: "GET", headers: {'accept': "application/xml"}});
      var res = httpMocks.createResponse({eventEmitter: Emitter});
      res.req = req;

      var ret = mfs.info(req, res, function next(err) {
         expect(err.message).to.exist;
         return retValue
      });

      expect(ret).to.equal(retValue);
   });


      //----------------------------------------------------------------------------
   it("invalid method (POST) - return(next(err)) pattern should be used", function () 
   {
      var retValue = "AAA";
      var req = httpMocks.createRequest({method: "POST", headers: {'accept': "application/json"}});
      var res = httpMocks.createResponse({eventEmitter: Emitter});
      res.req = req;

      var ret = mfs.info(req, res, function next(err) {
         expect(err.message).to.exist;
         return retValue
      });

      expect(ret).to.equal(retValue);
   });


      //----------------------------------------------------------------------------
   it("success - return(next()) pattern NOT used", function () 
   {
      var retValue = "AAA";
      var req = httpMocks.createRequest({method: "GET", headers: {'accept': "application/json"}});
      var res = httpMocks.createResponse({eventEmitter: Emitter});
      res.req = req;

      var ret = mfs.info(req, res, function next(err) {
         expect(err).to.be.undefined;
         return retValue
      });

      expect(ret).to.be.undefined;
   });


});
