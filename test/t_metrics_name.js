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


describe("Metrics Method Name MiddleWare", function () 
{
      //----------------------------------------------------------------------------
   it(`create: given a valid "name", method should succeed`, function () 
   {
      mfs.metrics.init({methods: true});

      try { mfs.metrics.name("validName"); }
      catch(err){
         throw(new Error("create function threw error"));
      }
   });


      //----------------------------------------------------------------------------
   it(`create: if "name" is not a string, method should fail`, function () 
   {
      mfs.metrics.init({methods: true});

      try { mfs.metrics.name(123); }
      catch(err){
         expect(err.message).to.contain("invalid parameter");
         return;
      }

      throw(new Error("create function did not throw error"));
   });


      //----------------------------------------------------------------------------
   it(`create: if method tracking is not enabled, method should fail`, function () 
   {
      mfs.metrics.init({methods: false});

      try { mfs.metrics.name("testName"); }
      catch(err){
         expect(err.message).to.contain("not enabled");
         return;
      }

      throw(new Error("create function did not throw error"));
   });


      //----------------------------------------------------------------------------
   it(`create: if methodInfo enabled, method name should not fail`, function () 
   {
      mfs.metrics.init({methodInfo: function(){}});

      mfs.metrics.name("testName");
   });


      //----------------------------------------------------------------------------
   it(`name: when methods enabled, names should be tracked`, function () 
   {
      var req = httpMocks.createRequest();
      var res = httpMocks.createResponse();

         // all metrics functionality must go through collect middleware which initializes
         // tracking information
      mfs.metrics.init({methods: true});
      mfs.metrics.collect(req, res, function next(){});

      var nameFunc = mfs.metrics.name("testName");

      var ret = nameFunc(req, res, function next(err){
         expect(err).to.be.undefined;
         return(1);
      });

      expect(typeof(req.mfsMetrics)).to.equal("object");
      expect(req.mfsMetrics.name).to.equal("testName");
      expect(ret).to.equal(1);
   });

});
