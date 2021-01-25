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


describe("Schema Validation MiddleWare", function () 
{

      //----------------------------------------------------------------------------
   it(`create: no input should succeed`, function () 
   {
      try { mfs.schema(); }
      catch(err){
         expect.fail("create threw error");
      }
   });


      //----------------------------------------------------------------------------
   it(`create: empty schema object should succeed`, function () 
   {
      try { mfs.schema({}); }
      catch(err){
         expect.fail("create threw error");
      }
   });


      //----------------------------------------------------------------------------
   it(`create: non object should fail`, function () 
   {
      try { 
         mfs.schema(5.5); 
         expect.fail("schema create function did not throw error");
      }
      catch(err){
         expect(err.message).to.contain("invalid parameter");
      }
   });

});
