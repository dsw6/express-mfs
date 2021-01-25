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
         expect.fail("create function threw error");
      }
   });


      //----------------------------------------------------------------------------
   it(`create: if "name" is not a string, method should fail`, function () 
   {
      mfs.metrics.init({methods: true});

      try { 
         mfs.metrics.name(123); 
         expect.fail("create function did not throw error");
      }
      catch(err){
         expect(err.message).to.contain("invalid parameter");
      }
   });


      //----------------------------------------------------------------------------
   it(`create: method tracking not enabled, method should not fail`, function () 
   {
      mfs.metrics.init({methods: false});

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


      //----------------------------------------------------------------------------
   it(`name: when methods not enabled, names should not be tracked`, function () 
   {
      var req = httpMocks.createRequest();
      var res = httpMocks.createResponse();

         // all metrics functionality must go through collect middleware which initializes
         // tracking information
      mfs.metrics.init({methods: false});
      mfs.metrics.collect(req, res, function next(){});

      var nameFunc = mfs.metrics.name("testName");

      var ret = nameFunc(req, res, function next(err){
         expect(err).to.be.undefined;
         return(1);
      });

      expect(req.mfsMetrics).to.not.exist;
      expect(ret).to.equal(1);
   });


      //----------------------------------------------------------------------------
   it(`name: when methodInfo function exists, names should be tracked`, function () 
   {
      var req = httpMocks.createRequest();
      var res = httpMocks.createResponse();

         // all metrics functionality must go through collect middleware which initializes
         // tracking information
      mfs.metrics.init({ methodInfo: function(){} });
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
