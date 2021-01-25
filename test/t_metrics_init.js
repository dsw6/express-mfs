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


describe("Metrics Initialization", function () 
{

      //----------------------------------------------------------------------------
   it(`init: empty object opts should succeed`, function () 
   {
      try { mfs.metrics.init({}); }
      catch(err){
         expect.fail("init threw error");
      }
   });


      //----------------------------------------------------------------------------
   it(`init: no opts should succeed`, function () 
   {
      try { mfs.metrics.init({}); }
      catch(err){
         expect.fail("init threw error");
      }
   });


      //----------------------------------------------------------------------------
   it(`init: non object opts should thow an error`, function () 
   {
      try { 
         mfs.metrics.init(123); 
         expect.fail("init did not throw error");
      }
      catch(err){
         expect(err.message).to.contain("invalid parameter");
      }
   });


      //----------------------------------------------------------------------------
   it(`init: opt.totals=true should succeed`, function () 
   {
      try { mfs.metrics.init({totals: true}); }
      catch(err){
         expect.fail("init threw error");
      }
   });


      //----------------------------------------------------------------------------
   it(`init: opt.totals=false should succeed`, function () 
   {
      try { mfs.metrics.init({totals: false}); }
      catch(err){
         expect.fail("init threw error");
      }
   });


      //----------------------------------------------------------------------------
   it(`init: opt.totals=123 should thow an error`, function () 
   {
      try { 
         mfs.metrics.init({totals: 123}); 
         expect.fail("init did not throw error");
      }
      catch(err){
         expect(err.message).to.contain("invalid parameter");
      }
   });


      //----------------------------------------------------------------------------
   it(`init: opt.methods=true should succeed`, function () 
   {
      try { mfs.metrics.init({methods: true}); }
      catch(err){
         expect.fail("init threw error");
      }
   });


      //----------------------------------------------------------------------------
   it(`init: opt.methods=false should succeed`, function () 
   {
      try { mfs.metrics.init({methods: false}); }
      catch(err){
         expect.fail("init threw error");
      }
   });


      //----------------------------------------------------------------------------
   it(`init: opt.methods=123 should thow an error`, function () 
   {
      try { 
         mfs.metrics.init({methods: 123}); 
         expect.fail("init did not throw error");
      }
      catch(err){
         expect(err.message).to.contain("invalid parameter");
      }
   });


      //----------------------------------------------------------------------------
   it(`init: opt.rps=true should succeed`, function () 
   {
      try { mfs.metrics.init({rps: true}); }
      catch(err){
         expect.fail("init threw error");
      }
   });


      //----------------------------------------------------------------------------
   it(`init: opt.rps=false should succeed`, function () 
   {
      try { mfs.metrics.init({rps: false}); }
      catch(err){
         expect.fail("init threw error");
      }
   });


      //----------------------------------------------------------------------------
   it(`init: opt.rps=123 should thow an error`, function () 
   {
      try { 
         mfs.metrics.init({rps: 123}); 
         expect.fail("init did not throw error");
      }
      catch(err){
         expect(err.message).to.contain("invalid parameter");
      }
   });


      //----------------------------------------------------------------------------
   it(`init: opt.timingFunc=function should succeed`, function () 
   {
      try { mfs.metrics.init({methodInfo: function (){} }); }
      catch(err){
         expect.fail("init threw error");
      }
   });


      //----------------------------------------------------------------------------
   it(`init: opt.timingFunc=non_function should thow an error`, function () 
   {
      try { 
         mfs.metrics.init({methodInfo: 123}); 
         expect.fail("init did not throw error");
      }
      catch(err){
         expect(err.message).to.contain("invalid parameter");
      }
   });


      //----------------------------------------------------------------------------
   it(`init: opt.infoFuncs=[f1, f2] should succeed`, function () 
   {
      var f1 = function () {};
      var f2 = function () {};
      var infoFuncs = [f1, f2];

      try { mfs.metrics.init({extraInfo: infoFuncs }); }
      catch(err){
         expect.fail("init threw error");
      }
   });


      //----------------------------------------------------------------------------
   it(`init: opt.infoFuncs=not_array should fail`, function () 
   {
      var f1 = function () {};
      var infoFuncs = f1;

      try { 
         mfs.metrics.init({extraInfo: infoFuncs }); 
         expect.fail("init did not throw error");
      }
      catch(err){
         expect(err.message).to.contain("invalid parameter");
      }
   });


      //----------------------------------------------------------------------------
   it(`init: opt.infoFuncs=[ not functions ] should fail`, function () 
   {
      var infoFuncs = [1, 2];

      try { 
         mfs.metrics.init({extraInfo: infoFuncs }); 
         expect.fail("init did not throw error");
      }
      catch(err){
         expect(err.message).to.contain("invalid parameter");
      }
   });


});
