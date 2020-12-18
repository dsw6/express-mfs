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
   it(`verify: no schema object should return success`, function () 
   {
      var req = httpMocks.createRequest();
      var res = httpMocks.createResponse();

      var schemaFunc = mfs.schema();

      var ret = schemaFunc(req, res, function next(err) {
         expect(err).to.be.undefined;
         return true;
      });

      expect(ret).to.equal(true);
   });


      //----------------------------------------------------------------------------
   it(`verify: empty schema object should return success`, function () 
   {
      var req = httpMocks.createRequest();
      var res = httpMocks.createResponse();

      var schemaFunc = mfs.schema({});

      var ret = schemaFunc(req, res, function next(err) {
         expect(err).to.be.undefined;
         return true;
      });

      expect(ret).to.equal(true);
   });


      //----------------------------------------------------------------------------
   it(`verify: single req property -> schema function should be called`, function () 
   {
      var reqParams = {a:"a", b:"b"};
      var paramfsunc_called = false;

      var req = httpMocks.createRequest({params: reqParams});
      var res = httpMocks.createResponse();

      var paramfsunc = function (p){
         expect(p).to.be.eql(reqParams);
         paramfsunc_called = true;
         return({error: null, value: null});
      };

      var schemaFunc = mfs.schema({params: paramfsunc});

      var ret = schemaFunc(req, res, function next(err) {
         expect(err).to.be.undefined;
         return true;
      });

      expect(ret).to.equal(true);
      expect(paramfsunc_called).to.be.true;
   });


      //----------------------------------------------------------------------------
   it(`verify: multiple req properties -> schema functions should be called`, function () 
   {
      var reqParams = {a:"a", b:"b"};
      var reqBody = {c:"c", d:"d"};
      var paramfsunc_called = false;
      var bodyFunc_called = false;

      var req = httpMocks.createRequest({params: reqParams, body: reqBody});
      var res = httpMocks.createResponse();

      var paramfsunc = function (p){
         expect(p).to.be.eql(reqParams);
         paramfsunc_called = true;
         return({error: null, value: null});
      };

      var bodyFunc = function (b){
         expect(b).to.be.eql(reqBody);
         bodyFunc_called = true;
         return({error: null, value: null});
      };

      var schemaFunc = mfs.schema({params: paramfsunc, body: bodyFunc});

      var ret = schemaFunc(req, res, function next(err) {
         expect(err).to.be.undefined;
         return true;
      });

      expect(ret).to.equal(true);
      expect(paramfsunc_called).to.be.true;
      expect(bodyFunc_called).to.be.true;
   });


      //----------------------------------------------------------------------------
   it(`verify: no matching req property -> schema function should be called, input should be 'undefined'`, function () 
   {
      var xFunc_called = false;

      var req = httpMocks.createRequest();
      var res = httpMocks.createResponse();

      var xFunc = function (x){
         expect(x).to.be.undefined;
         xFunc_called = true;
         return({error: null, value: null});
      };

      var schemaFunc = mfs.schema({x: xFunc});

      var ret = schemaFunc(req, res, function next(err) {
         expect(err).to.be.undefined;
         return true;
      });

      expect(ret).to.equal(true);
      expect(xFunc_called).to.be.true;
   });


      //----------------------------------------------------------------------------
   it(`verify: schema function returns error -> next(err) should be called`, function () 
   {
      var reqParams = {a:"a", b:"b"};
      var paramfsunc_called = false;

      var req = httpMocks.createRequest({params: reqParams});
      var res = httpMocks.createResponse();

      var paramfsunc = function (p){
         paramfsunc_called = true;
         return({error: true, value: null});
      };

      var schemaFunc = mfs.schema({params: paramfsunc});

      var ret = schemaFunc(req, res, function next(err) {
         expect(err).to.exist;
         return true;
      });

      expect(ret).to.equal(true);
      expect(paramfsunc_called).to.be.true;
   });

      //----------------------------------------------------------------------------
   it(`verify: schema function returns error.message -> next(err) should be called with error message`, function () 
   {
      var errMsg = "my error";
      var reqParams = {a:"a", b:"b"};
      var paramfsunc_called = false;

      var req = httpMocks.createRequest({params: reqParams});
      var res = httpMocks.createResponse();

      var paramfsunc = function (p){
         paramfsunc_called = true;
         return({error: {message: errMsg}, value: null});
      };

      var schemaFunc = mfs.schema({params: paramfsunc});

      var ret = schemaFunc(req, res, function next(err) {
         expect(err.message).to.equal(errMsg);
         return true;
      });

      expect(ret).to.equal(true);
      expect(paramfsunc_called).to.be.true;
   });

      //----------------------------------------------------------------------------
   it(`verify: schema function returns error.statusCode -> res.statusCode should be set`, function () 
   {
      var statusCode = 406;
      var reqParams = {a:"a", b:"b"};
      var paramfsunc_called = false;

      var req = httpMocks.createRequest({params: reqParams});
      var res = httpMocks.createResponse();

      var paramfsunc = function (p){
         paramfsunc_called = true;
         return({error: {statusCode: statusCode}, value: null});
      };

      var schemaFunc = mfs.schema({params: paramfsunc});

      var ret = schemaFunc(req, res, function next(err) {
         expect(err).to.exist;
         return true;
      });

      expect(res.statusCode).to.equal(statusCode);
      expect(paramfsunc_called).to.be.true;
   });


      //----------------------------------------------------------------------------
   it(`verify: schema function returns new req.x value -> req.x value should be set`, function () 
   {
      var reqParams = {a:"a", b:"b"};
      var newParams = {y:"y", z:"z"};
      var paramfsunc_called = false;

      var req = httpMocks.createRequest({params: reqParams});
      var res = httpMocks.createResponse();

      var paramfsunc = function (p){
         paramfsunc_called = true;
         return({error: null, value: newParams});
      };

      var schemaFunc = mfs.schema({params: paramfsunc});

      var ret = schemaFunc(req, res, function next(err) {
         expect(err).to.be.undefined;
         return true;
      });

      expect(req.params).to.equal(newParams);
      expect(paramfsunc_called).to.be.true;
   });   

});
