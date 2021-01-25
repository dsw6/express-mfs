/*
 * express-mfs
 *
 * Copyright(c) 2020 David Ward
 * MIT Licensed
 */


"use strict";

const httpMocks = require('node-mocks-http');
const expect = require("chai").expect;
const mfs = require("../lib");


describe("Metrics Method setName", function () 
{
   // all metrics functionality must go through collect middleware which initializes
   // tracking information

      //----------------------------------------------------------------------------
   it(`given a valid "name", method should succeed`, function () 
   {
      var req = httpMocks.createRequest();
      var res = httpMocks.createResponse();

      mfs.metrics.init({methods: true});
      mfs.metrics.collect(req, res, function next(){});

      try { 
         mfs.metrics.setName(req, "validName"); 
      } 
      catch(err){
         expect.fail("setName function threw an unexpected error");
      }
   });


      //----------------------------------------------------------------------------
   it(`if "name" is not a string, method should fail`, function () 
   {
      var req = httpMocks.createRequest();
      var res = httpMocks.createResponse();

      mfs.metrics.init({methods: true});
      mfs.metrics.collect(req, res, function next(){});

      try { 
         mfs.metrics.setName(req, 123); 
         expect.fail("setName function did not throw an error");
      }
      catch(err){
         expect(err.message).to.contain("invalid parameter");
      }

   });


      //----------------------------------------------------------------------------
   it(`if "name" is not specified, method should fail`, function () 
   {
      var req = httpMocks.createRequest();
      var res = httpMocks.createResponse();

      mfs.metrics.init({methods: true});
      mfs.metrics.collect(req, res, function next(){});

      try { 
         mfs.metrics.setName(req); 
         expect.fail("setName function did not throw an error");
      }
      catch(err){
         expect(err.message).to.contain("invalid parameter");
      }
   });

      //----------------------------------------------------------------------------
   it(`method tracking not enabled, method should not fail`, function () 
   {
      var req = httpMocks.createRequest();
      var res = httpMocks.createResponse();

      mfs.metrics.init({methods: true});
      mfs.metrics.collect(req, res, function next(){});

      try { 
         mfs.metrics.setName(req, "name"); 
      }
      catch(err){
         expect.fail("setName function threw an unexpected error");
      }
   });


      //----------------------------------------------------------------------------
   it(`when methods enabled, names should be tracked`, function () 
   {
      var testVal = "testName";
      var req = httpMocks.createRequest();
      var res = httpMocks.createResponse();

      mfs.metrics.init({methods: true});
      mfs.metrics.collect(req, res, function next(){});

      mfs.metrics.setName(req, testVal); 

      expect(typeof(req.mfsMetrics)).to.equal("object");
      expect(req.mfsMetrics.name).to.equal(testVal);
   });


      //----------------------------------------------------------------------------
   it(`when methods not enabled, names should not be tracked`, function () 
   {
      var testVal = "testName";      
      var req = httpMocks.createRequest();
      var res = httpMocks.createResponse();

      mfs.metrics.init({methods: false});
      mfs.metrics.collect(req, res, function next(){});

      mfs.metrics.setName(req, testVal); 

      expect(req.mfsMetrics).to.not.exist;
   });


      //----------------------------------------------------------------------------
   it(`when methodInfo function exists, names should be tracked`, function () 
   {
      var testVal = "testName";
      var req = httpMocks.createRequest();
      var res = httpMocks.createResponse();

      mfs.metrics.init({ methodInfo: function(){} });
      mfs.metrics.collect(req, res, function next(){});

      mfs.metrics.setName(req, testVal); 

      expect(typeof(req.mfsMetrics)).to.equal("object");
      expect(req.mfsMetrics.name).to.equal(testVal);
   });

});
