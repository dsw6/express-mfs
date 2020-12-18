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


describe("Unknown Middleware", function () 
{
      //----------------------------------------------------------------------------
   it("the 'next' function should be called with an error object", function () 
   {
      var method = "POST";
      var url = "http://something.com/x";
      var req = httpMocks.createRequest({method: method, originalUrl: url});
      var res = httpMocks.createResponse();

      var err = mfs.unknown(req, res, function next(err) { return(err) });

      expect(err).to.be.an('error');
      expect(err.message).to.contain(method);
      expect(err.message).to.contain(url);
   });


      //----------------------------------------------------------------------------
   it("res.statusCode should be 404", function () 
   {
      var req = httpMocks.createRequest();
      var res = httpMocks.createResponse();

      mfs.unknown(req, res, function next(err) {});

      expect(res.statusCode).to.equal(404);
   });


      //----------------------------------------------------------------------------
   it("if a respone was sent (req.headersSent=true), should do nothing and invoke next()", function () 
   {
      var req = httpMocks.createRequest();
      var res = httpMocks.createResponse();
      res.headersSent = true;

      var retVal = "AAA";
      var ret = mfs.unknown(req, res, function next(err){
         expect(err).to.be.undefined;
         return(retVal);
      });

      expect(ret).to.equal(retVal);
   });


      //----------------------------------------------------------------------------
   it("if a respone was sent (req.finished=true), should do nothing and invoke next()", function () 
   {
      var req = httpMocks.createRequest();
      var res = httpMocks.createResponse();
      res.finished = true;

      var retVal = "AAA";
      var ret = mfs.unknown(req, res, function next(err){
         expect(err).to.be.undefined;
         return(retVal);
      });

      expect(ret).to.equal(retVal);
   });

});
