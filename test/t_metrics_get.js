/*
 * express-mfs
 *
 * Copyright(c) 2020 David Ward
 * MIT Licensed
 */


"use strict";

const httpMocks = require('node-mocks-http');
const expect = require("chai").expect;
const Emitter = require("events").EventEmitter;
const mfs = require("../lib");


describe("Metrics Get MiddleWare", function () 
{
   // NOTE:  The response mock doesn't have a reference to the request object.  In express
   // the res.req property is available, manually set it for the tests   

      //----------------------------------------------------------------------------
   it("basic metrics should be available", function () 
   {
      var req = httpMocks.createRequest({method: "GET", headers: {'accept': "application/json"}});
      var res = httpMocks.createResponse();

      mfs.metrics.info(req, res, function next(err) {});

      var data = res._getJSONData();
      expect(data.startDate).to.be.a("string");
      expect(data.upTime).to.be.a("string");
      expect(data.memory).to.be.a("object");
      expect(data.memory.rss).to.be.a("number");
      expect(data.memory.heapTotal).to.be.a("number");
      expect(data.memory.heapUsed).to.be.a("number");
      expect(data.memory.external).to.be.a("number");
      expect(data.avgLoad).to.be.a("object");
      expect(data.avgLoad.load1).to.be.a("number");
      expect(data.avgLoad.load5).to.be.a("number");
      expect(data.avgLoad.load15).to.be.a("number");
   });


      //----------------------------------------------------------------------------
   it("non-middleware metrics function should be available", function () 
   {
      var data = mfs.metrics.getMetrics();

      expect(data.startDate).to.be.a("string");
      expect(data.upTime).to.be.a("string");
      expect(data.memory).to.be.a("object");
      expect(data.memory.rss).to.be.a("number");
      expect(data.memory.heapTotal).to.be.a("number");
      expect(data.memory.heapUsed).to.be.a("number");
      expect(data.memory.external).to.be.a("number");
      expect(data.avgLoad).to.be.a("object");
      expect(data.avgLoad.load1).to.be.a("number");
      expect(data.avgLoad.load5).to.be.a("number");
      expect(data.avgLoad.load15).to.be.a("number");
   });


      //----------------------------------------------------------------------------
   it("registered info functions should be called", function () 
   {
      var f1 = function () {return( {name: "f1", value:5} )};
      var f2 = function () {return( {name: "f2", value:{v1: "v1"}} )};
      var infoFuncs = [f1, f2];

      mfs.metrics.init({extraInfo: infoFuncs });

      var req = httpMocks.createRequest({method: "GET", headers: {'accept': "application/json"}});
      var res = httpMocks.createResponse();

      mfs.metrics.info(req, res, function next() {});

      var data = res._getJSONData();
      expect(data.f1).to.equal(5);
      expect(data.f2).to.be.a("object");
      expect(data.f2.v1).to.equal("v1");
   });


      //----------------------------------------------------------------------------
   it("if totals enabled, request totals should be included", function () 
   {
      mfs.metrics.init({totals: true});

      var req = httpMocks.createRequest({method: "GET", headers: {'accept': "application/json"}});
      var res = httpMocks.createResponse();

      mfs.metrics.info(req, res, function next() {});

      var data = res._getJSONData();
      expect(data.requests).to.be.a("object");
      expect(data.requests.total).to.be.a("number");
      expect(data.requests.success).to.be.a("number");
      expect(data.requests.failure).to.be.a("number");
   });


      //----------------------------------------------------------------------------
   it("if totals enabled, initial values should be zero", function () 
   {
      mfs.metrics.init({totals: true});

      var req = httpMocks.createRequest({method: "GET", headers: {'accept': "application/json"}});
      var res = httpMocks.createResponse();

      mfs.metrics.info(req, res, function next() {});

      var data = res._getJSONData();
      expect(data.requests).to.be.a("object");
      expect(data.requests.total).to.equal(0);
      expect(data.requests.success).to.equal(0);
      expect(data.requests.failure).to.equal(0);
   });


      //----------------------------------------------------------------------------
   it("if totals enabled, successfull requests and failed requests should be tracked", async function () 
   {
      mfs.metrics.init({totals: true});

      var successCnt = 10;
      var failureCnt = 5;
      var i;

      var req = httpMocks.createRequest({method: "GET", headers: {'accept': "application/json"}});
      var res = httpMocks.createResponse({eventEmitter: Emitter});
      res.req = req;

      mfs.metrics.collect(req, res, function next(){});

         // simulate a successful request by emitting the "finish" event
      for (i=0; i<successCnt; i++)
      {
         res.statusCode = 200;
         res.emit("finish");
      }

         // simulate a failed request by emitting the "finish" event
      for (i=0; i<failureCnt; i++)
      {
         res.statusCode = 400;
         res.emit("finish");
      }

      mfs.metrics.info(req, res, function next() {});

      var data = res._getJSONData();
      expect(data.requests).to.be.a("object");
      expect(data.requests.total).to.equal(successCnt + failureCnt);
      expect(data.requests.success).to.equal(successCnt);
      expect(data.requests.failure).to.equal(failureCnt);
   });


      //----------------------------------------------------------------------------
   it("if methods enabled, the initial data should be a empty array", function () 
   {
      mfs.metrics.init({methods: true});

      var req = httpMocks.createRequest({method: "GET", headers: {'accept': "application/json"}});
      var res = httpMocks.createResponse();

      mfs.metrics.info(req, res, function next() {});

      var data = res._getJSONData();
      expect(data.methods).to.be.a("array");
      expect(data.methods.length).to.equal(0);
   });


      //----------------------------------------------------------------------------
   it("if methods enabled, method call data should be tracked", function () 
   {
      var methodName = "myMethod"
      var methodCnt = 10;

      mfs.metrics.init({methods: true});

      var req = httpMocks.createRequest({method: "GET", headers: {'accept': "application/json"}});
      var res = httpMocks.createResponse({eventEmitter: Emitter});
      res.req = req;

      mfs.metrics.collect(req, res, function next(){});
      var mName = mfs.metrics.name(methodName);

         // simulate a request by emitting the "finish" event
      for (let i=0; i<methodCnt; i++)
      {
         mName(req, res, function next() {});
         res.emit("finish");
      }

      mfs.metrics.info(req, res, function next() {});

      var data = res._getJSONData();
      expect(data.methods).to.be.a("array");
      expect(data.methods.length).to.equal(1);

      var methodInfo = data.methods[0];
      expect(methodInfo.name).to.equal(methodName);
      expect(methodInfo.count).to.equal(methodCnt);
      expect(methodInfo.respTime).to.be.a("number");
   });


      //----------------------------------------------------------------------------
   it("if rps enabled, request/second information should be included", function () 
   {
      mfs.metrics.init({rps: true});

      var req = httpMocks.createRequest({method: "GET", headers: {'accept': "application/json"}});
      var res = httpMocks.createResponse();

      mfs.metrics.info(req, res, function next() {});

      var data = res._getJSONData();
      expect(data.avgRPS).to.be.a("object");
      expect(data.avgRPS.rps1).to.be.a("number");
      expect(data.avgRPS.rps5).to.be.a("number");
      expect(data.avgRPS.rps15).to.be.a("number");
   });


      //----------------------------------------------------------------------------
   it("rps enabled, initial values should be zero", async function () 
   {
      this.timeout(30000);
      mfs.metrics.init({rps: true});

      var req = httpMocks.createRequest({method: "GET", headers: {'accept': "application/json"}});
      var res = httpMocks.createResponse({eventEmitter: Emitter});

      mfs.metrics.info(req, res, function next() {});

      var data = res._getJSONData();
      expect(data.avgRPS).to.be.a("object");
      expect(data.avgRPS.rps1).to.equal(0);
      expect(data.avgRPS.rps5).to.equal(0);
      expect(data.avgRPS.rps15).to.equal(0);
   });


      //----------------------------------------------------------------------------
   it("rps enabled, 5 second sample buckets", async function () 
   {
      this.timeout(30000);
      mfs.metrics.init({rps: true});

      var req = httpMocks.createRequest({method: "GET", headers: {'accept': "application/json"}});
      var res = httpMocks.createResponse({eventEmitter: Emitter});
      res.req = req;

      mfs.metrics.collect(req, res, function next(){});

      var doReq = function(resolve, reject){ 
         setTimeout( function(){ res.emit("finish"); resolve(); }, 
         1000 );
      };

         // simulate sending a request every second for 10 seconds
      for (let i=0; i<10; i++)
         await new Promise( doReq );

      mfs.metrics.info(req, res, function next() {});

      var data = res._getJSONData();
      // console.log(data.rpsAvg);
      expect(data.avgRPS).to.be.a("object");
      expect(data.avgRPS.rps1).to.be.greaterThan(0);
      expect(data.avgRPS.rps5).to.be.greaterThan(0);
      expect(data.avgRPS.rps15).to.be.greaterThan(0);
   });


      //----------------------------------------------------------------------------
   it("response should be content-type: application/json", function () 
   {
      mfs.metrics.init({});
      var req = httpMocks.createRequest({method: "GET", headers: {'accept': "application/json"}});
      var res = httpMocks.createResponse();

      mfs.metrics.info(req, res, function next(err) {});

      expect(res.header("content-type")).to.equal("application/json");
   });


      //----------------------------------------------------------------------------
   it("only 'GET' method should be supported", function () 
   {
      mfs.metrics.init({});
      var req = httpMocks.createRequest({method: "POST", headers: {'accept': "application/json"}});
      var res = httpMocks.createResponse();

      mfs.metrics.info(req, res, function next(err) {
         expect(err.message).to.exist;
      });

      expect(res.statusCode).to.equal(404);
   });


      //----------------------------------------------------------------------------
   it("only 'JSON' accept type should be supported", function () 
   {
      mfs.metrics.init({});
      var req = httpMocks.createRequest({method: "GET", headers: {'accept': "application/xml"}});
      var res = httpMocks.createResponse();

      mfs.metrics.info(req, res, function next(err) {
         expect(err.message).to.exist;
      });
      expect(res.statusCode).to.equal(406);
   });


      //----------------------------------------------------------------------------
   it("invalid Accept header - return(next(err)) pattern should be used", function () 
   {
      mfs.metrics.init({});
      var retValue = "AAA";
      var req = httpMocks.createRequest({method: "GET", headers: {'accept': "application/xml"}});
      var res = httpMocks.createResponse();

      var ret = mfs.metrics.info(req, res, function next(err) {
         expect(err.message).to.exist;
         return retValue
      });

      expect(ret).to.equal(retValue);
   });


      //----------------------------------------------------------------------------
   it("invalid method (POST) - return(next(err)) pattern should be used", function () 
   {
      mfs.metrics.init({});
      var retValue = "AAA";
      var req = httpMocks.createRequest({method: "POST", headers: {'accept': "application/json"}});
      var res = httpMocks.createResponse();

      var ret = mfs.metrics.info(req, res, function next(err) {
         expect(err.message).to.exist;
         return retValue
      });

      expect(ret).to.equal(retValue);
   });


      //----------------------------------------------------------------------------
   it("success - return(next()) pattern should NOT be used", function () 
   {
      mfs.metrics.init({});
      var retValue = "AAA";
      var req = httpMocks.createRequest({method: "GET", headers: {'accept': "application/json"}});
      var res = httpMocks.createResponse();

      var ret = mfs.metrics.info(req, res, function next(err) {
         expect(err).to.be.undefined;
         return retValue
      });

      expect(ret).to.be.undefined;
   });


});
