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

const INVALID_ACCEPT = "express-mfs: invalid accept header";
const INVALID_CONTENT = "express-mfs: invalid content-type header";


describe("JSON MiddleWares", function () 
{
   var accept_validMediaTypes = ["application/json", "*/*", "application/*" ];
   var accept_invalidMediaTypes = ["application/xml", "abc/*", "" ];

   var content_validMediaTypes = ["application/json"];
   var content_invalidMediaTypes = ["application/*", "*/*", "application/xml", ""];

      //----------------------------------------------------------------------------
   for (let type of accept_validMediaTypes) {
      it(`accept - '${type}' should be valid`, function () 
      {
         var result = true;
         var req = httpMocks.createRequest({headers: {accept: type}});
         var res = httpMocks.createResponse();

         var ret = mfs.json.accept(req, res, function next(err) {
            expect(err).to.be.undefined;
            return result;
         });

         expect(ret).to.equal(result);
      });
   }


      //----------------------------------------------------------------------------
   for (let type of accept_invalidMediaTypes) {
      it(`accept - '${type}' should NOT be valid`, function () 
      {
         var req = httpMocks.createRequest({headers: {accept: type}});
         var res = httpMocks.createResponse();

         var err = mfs.json.accept(req, res, function next(err) { return err });

         expect(err.message).to.equal(INVALID_ACCEPT);
         expect(res.statusCode).to.equal(406);
      });
   }


      //----------------------------------------------------------------------------
   it(`accept - (no header) should NOT be valid`, function () 
   {
      var req = httpMocks.createRequest();
      var res = httpMocks.createResponse();

      var err = mfs.json.accept(req, res, function next(err) { return err });

      expect(err.message, "Invalid err.message").to.equal(INVALID_ACCEPT);
      expect(res.statusCode).to.equal(406);
   });


      //----------------------------------------------------------------------------
   for (let type of content_validMediaTypes) {
      it(`content - '${type}' should be valid`, function () 
      {
            // set content-length to simulate a request body
         var result = true;
         var req = httpMocks.createRequest({headers: {"content-length": 20, "content-type": type}});
         var res = httpMocks.createResponse();

         var ret = mfs.json.content(req, res, function next(err) {
            expect(err).to.be.undefined;
            return result;
         });

         expect(ret).to.equal(result);
      });
   }


      //----------------------------------------------------------------------------
   for (let type of content_invalidMediaTypes) {
      it(`content - '${type}' should NOT be valid`, function () 
      {
         var req = httpMocks.createRequest({headers: {"content-length": 20, "content-type": type}});
         var res = httpMocks.createResponse();

         var err = mfs.json.content(req, res, function next(err) {return err});

         expect(err.message).to.equal(INVALID_CONTENT);
         expect(res.statusCode).to.equal(400);
      });
   }


      //----------------------------------------------------------------------------
   it(`content - (no content) should be valid`, function () 
   {
      var result = true;
      var req = httpMocks.createRequest();
      var res = httpMocks.createResponse();

      var ret = mfs.json.content(req, res, function next(err) { 
         expect(err).to.be.undefined;
         return result;
      });

      expect(ret).to.equal(result);
   });


      //----------------------------------------------------------------------------
   for (let type of accept_validMediaTypes) {
      it(`only - accept:'${type}', content:(no content) should be valid`, function () 
      {
         var result = true;
         var req = httpMocks.createRequest({headers: {accept: type}});
         var res = httpMocks.createResponse();

         var ret = mfs.json.accept(req, res, function next(err) {
            expect(err).to.be.undefined;
            return result;
         });

         expect(ret).to.equal(result);
      });
   }


      //----------------------------------------------------------------------------
   for (let type of accept_invalidMediaTypes) {
      it(`only - accept:'${type}', content:(no content) should NOT be valid`, function () 
      {
         var req = httpMocks.createRequest({headers: {accept: type}});
         var res = httpMocks.createResponse();

         var err = mfs.json.accept(req, res, function next(err) { return err });

         expect(err.message).to.equal(INVALID_ACCEPT);
         expect(res.statusCode).to.equal(406);
      });
   }


      //----------------------------------------------------------------------------
   it(`only - accept:(not specified), content:(no content) should NOT be valid`, function () 
   {
      var req = httpMocks.createRequest();
      var res = httpMocks.createResponse();

      var err = mfs.json.accept(req, res, function next(err) { return err });

      expect(err.message).to.equal(INVALID_ACCEPT);
      expect(res.statusCode).to.equal(406);
   });


      //----------------------------------------------------------------------------
   for (let type of accept_validMediaTypes) {
      it(`only - accept:'${type}' content:'application/json' should be valid`, function () 
      {
         var result = true;
         var req = httpMocks.createRequest({headers: {accept: type, "content-length": 20, "content-type": "application/json"}});
         var res = httpMocks.createResponse();

         var ret = mfs.json.only(req, res, function next(err) {
            expect(err).to.be.undefined;
            return result;
         });

         expect(ret).to.equal(result);
      });
   }


      //----------------------------------------------------------------------------
   for (let type of content_validMediaTypes) {
      it(`only - accept:'application/json', content:'${type}' should be valid`, function () 
      {
         var result = true;
         var req = httpMocks.createRequest({headers: {accept: "application/json", "content-length": 20, "content-type": type}});
         var res = httpMocks.createResponse();

         var ret = mfs.json.only(req, res, function next(err) {
            expect(err).to.be.undefined;
            return result;
         });

         expect(ret).to.equal(result);
      });
   }


      //----------------------------------------------------------------------------
   for (let type of content_invalidMediaTypes) {
      it(`only - accept:'application/json', content:'${type}' should NOT be valid`, function () 
      {
         var req = httpMocks.createRequest({headers: {accept: "application/json", "content-length": 20, "content-type": type}});
         var res = httpMocks.createResponse();

         var err = mfs.json.only(req, res, function next(err) { return err });

         expect(err.message).to.equal(INVALID_CONTENT);
         expect(res.statusCode).to.equal(400);
      });
   }

});
