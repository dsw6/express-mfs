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


describe("Metrics Collection MiddleWare", function () 
{
   // NOTE:  The response mock doesn't have a reference to the request object.  In express
   // the res.req property is available, manually set it for the tests

   var successCodes = [200, 201, 250, 299];
   var failureCodes = [100, 300, 400, 500];

      //----------------------------------------------------------------------------
   for (let code of successCodes)
   {
      it(`totals: (${code}) 200 level codes should be tracked as success`, function () 
      {
         var req = httpMocks.createRequest();
         var res = httpMocks.createResponse({eventEmitter: Emitter});
         res.req = req;
         res.statusCode = code;

         mfs.metrics.init({totals: true});

         var ret = mfs.metrics.collect(req, res, function next(err){
            expect(err).to.be.undefined;
            return(1);
         });

         res.end();  // triggers the appropriate end events

         var metrics = mfs.metrics.getMetrics();

         expect(metrics.requests).to.exist;
         expect(metrics.requests.total).to.equal(1);
         expect(metrics.requests.success).to.equal(1);
         expect(ret).to.equal(1);
      });
   }


      //----------------------------------------------------------------------------
   for (let code of failureCodes)
   {
      it(`totals: (${code}) non-200 level codes should be tracked as failure`, function () 
      {
         var req = httpMocks.createRequest();
         var res = httpMocks.createResponse({eventEmitter: Emitter});
         res.req = req;
         res.statusCode = code;

         mfs.metrics.init({totals: true});

         var ret = mfs.metrics.collect(req, res, function next(err){
            expect(err).to.be.undefined;
            return(1);
         });

         res.end();  // triggers the appropriate end events

         var metrics = mfs.metrics.getMetrics();

         expect(metrics.requests).to.exist;
         expect(metrics.requests.total).to.equal(1);
         expect(metrics.requests.failure).to.equal(1);
         expect(ret).to.equal(1);
      });
   }

      //----------------------------------------------------------------------------
   it(`totals: count should increase with each call`, function () 
   {
      var req = httpMocks.createRequest();
      var res = httpMocks.createResponse({eventEmitter: Emitter});
      res.req = req;
      res.statusCode = 200;

      mfs.metrics.init({totals: true});

      var ret = mfs.metrics.collect(req, res, function next(err){
         expect(err).to.be.undefined;
         return(1);
      });

         // manually emit the "finish" event to simulate multiple requests
      for (let i=0; i<10; i++)
         res.emit("finish"); 

      var metrics = mfs.metrics.getMetrics();

      expect(metrics.requests).to.exist;
      expect(metrics.requests.total).to.equal(10);
      expect(metrics.requests.success).to.equal(10);
      expect(ret).to.equal(1);
   });


      //----------------------------------------------------------------------------
   it(`totals: if not enabled, no request totals should be collected`, function () 
   {
      var req = httpMocks.createRequest();
      var res = httpMocks.createResponse({eventEmitter: Emitter});
      res.req = req;
      res.statusCode = 200;

      mfs.metrics.init({totals: false});

      var ret = mfs.metrics.collect(req, res, function next(err){
         expect(err).to.be.undefined;
         return(1);
      });

         // manually emit the "finish" event to simulate multiple requests
      for (let i=0; i<10; i++)
         res.emit("finish"); 

      var metrics = mfs.metrics.getMetrics();

      expect(metrics.requests).to.not.exist;
      expect(ret).to.equal(1);
   });


      //----------------------------------------------------------------------------
   it(`methods: if enabled, method level data should be collected`, function () 
   {
      var req = httpMocks.createRequest();
      var res = httpMocks.createResponse({eventEmitter: Emitter});
      res.req = req;
      res.statusCode = 200;

      mfs.metrics.init({methods: true});

      var ret = mfs.metrics.collect(req, res, function next(err){
         expect(err).to.be.undefined;
         return(1);
      });

         // manually emit the "finish" event to simulate multiple requests
         // the method name is update each time to simulate different methods
      for (let i=0; i<10; i++)
      {
         mfs.metrics.name(`method${i}`)(req, res, function next(){});
         res.emit("finish"); 
      }

      var metrics = mfs.metrics.getMetrics();

      expect(metrics.methods).to.be.a("array");
      expect(metrics.methods.length).to.equal(10);
      expect(metrics.methods[0].name).to.be.a("string");
      expect(metrics.methods[0].count).to.be.a("number");
      expect(metrics.methods[0].respTime).to.be.a("number");

      expect(ret).to.equal(1);
   });


      //----------------------------------------------------------------------------
   it(`methodInfo function: if set, function should be called`, function () 
   {
      var req = httpMocks.createRequest();
      var res = httpMocks.createResponse({eventEmitter: Emitter});
      res.req = req;

      var methodFuncCalled = false;

      var methodInfo = function (name, dur, myReq) {
         expect(dur).to.be.a("number");
         expect(name).to.be.a("string");
         expect(myReq).to.be.a("object");
         expect(myReq).to.equal(req);
         methodFuncCalled = true;
      };

      mfs.metrics.init({methodInfo: methodInfo});

      mfs.metrics.collect(req, res, function next(err){});

      res.end();

      expect(methodFuncCalled).to.equal(true);
   });

});
