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


describe("Auth Credentials MiddleWare", function () 
{

      //----------------------------------------------------------------------------
   it(`creds: valid user should succeed`, function () 
   {
      var user1 = {user: "testUser", pwd: "password"};
      var users = [user1];
      var b64Creds = Buffer.from(`${user1.user}:${user1.pwd}`).toString("base64");
      var authHdr = `Basic ${b64Creds}`;

      var auth = mfs.auth({users: users});
      var req = httpMocks.createRequest({headers: {authorization: authHdr}});
      var res = httpMocks.createResponse();

      var ret = auth(req, res, function next(err){
         expect(err).to.be.undefined;
         return true;         
      })

      expect(ret).to.equal(true);      
   });


      //----------------------------------------------------------------------------
   var validUserHdrs = [
      {desc: "first",  value: `Basic ${Buffer.from(`testUser1:password`).toString("base64")}`},
      {desc: "middle", value: `Basic ${Buffer.from(`testUser2:password`).toString("base64")}`},
      {desc: "last",   value: `Basic ${Buffer.from(`testUser3:password`).toString("base64")}`}
   ];
   for (let hdr of validUserHdrs)
   it(`create, (${hdr.desc}) multiple users should succeed`, function () 
   {
      var user1 = {user: "testUser1", pwd: "password"};
      var user2 = {user: "testUser2", pwd: "password"};
      var user3 = {user: "testUser3", pwd: "password"};
      var users = [user1, user2, user3];

      var auth = mfs.auth({users: users});
      var req = httpMocks.createRequest({headers: {authorization: hdr.value}});
      var res = httpMocks.createResponse();

      var ret = auth(req, res, function next(err){
         expect(err).to.be.undefined;
         return true;         
      })

   });


      //----------------------------------------------------------------------------
   it(`creds: invalid userName should fail`, function () 
   {
      var user1 = {user: "testUser", pwd: "password"};
      var users = [user1];
      var b64Creds = Buffer.from(`Unknown:${user1.pwd}`).toString("base64");
      var authHdr = `Basic ${b64Creds}`;

      var auth = mfs.auth({users: users});
      var req = httpMocks.createRequest({headers: {authorization: authHdr}});
      var res = httpMocks.createResponse();

      var ret = auth(req, res, function next(err){
         expect(err).to.exist;
         return true;         
      })

      expect(res.statusCode).to.equal(401);
      expect(ret).to.equal(true);      
   });


      //----------------------------------------------------------------------------
   it(`creds: invalid pwd should fail`, function () 
   {
      var user1 = {user: "testUser", pwd: "password"};
      var users = [user1];
      var b64Creds = Buffer.from(`${user1.user}:badPwd`).toString("base64");
      var authHdr = `Basic ${b64Creds}`;

      var auth = mfs.auth({users: users});
      var req = httpMocks.createRequest({headers: {authorization: authHdr}});
      var res = httpMocks.createResponse();

      var ret = auth(req, res, function next(err){
         expect(err).to.exist;
         return true;         
      })

      expect(res.statusCode).to.equal(401);
      expect(ret).to.equal(true);      
   });


      //----------------------------------------------------------------------------
   it(`creds: no authorization header should fail`, function () 
   {
      var user1 = {user: "testUser", pwd: "password"};
      var users = [user1];

      var auth = mfs.auth({users: users});
      var req = httpMocks.createRequest();
      var res = httpMocks.createResponse();

      var ret = auth(req, res, function next(err){
         expect(err).to.exist;
         return true;         
      })

      expect(res.statusCode).to.equal(401);
      expect(ret).to.equal(true);      
   });


      //----------------------------------------------------------------------------
   it(`creds: unknown authorization header format should fail`, function () 
   {
      var user1 = {user: "testUser", pwd: "password"};
      var users = [user1];

      var auth = mfs.auth({users: users});
      var req = httpMocks.createRequest({headers: {authorization: "unknown stuff"}});
      var res = httpMocks.createResponse();

      var ret = auth(req, res, function next(err){
         expect(err).to.exist;
         return true;         
      })

      expect(res.statusCode).to.equal(401);
      expect(ret).to.equal(true);      
   });


      //----------------------------------------------------------------------------
   var malFormedHdrs = [
      {desc: "space delimitor", value: `Basic ${Buffer.from(`testUser password`).toString("base64")}`},
      {desc: "no delimitor", value: `Basic ${Buffer.from(`testUserpassword`).toString("base64")}`},
      {desc: "Basic, no space", value: `Basic${Buffer.from(`testUser:password`).toString("base64")}`},
      {desc: "Basic, colon delimitor", value: `Basic:${Buffer.from(`testUser:password`).toString("base64")}`},
      {desc: "Basic, misspelled", value: `Basc ${Buffer.from(`testUser:password`).toString("base64")}`},
   ]
   for (let hdr of malFormedHdrs)      
   it(`creds: (${hdr.desc}) malformed authorization header should fail`, function () 
   {
      var user1 = {user: "testUser", pwd: "password"};
      var users = [user1];

      var auth = mfs.auth({users: users});
      var req = httpMocks.createRequest({headers: {authorization: hdr.value}});
      var res = httpMocks.createResponse();

      var ret = auth(req, res, function next(err){
         expect(err).to.exist;
         return true;         
      })

      expect(res.statusCode).to.equal(401);
      expect(ret).to.equal(true);      
   });

      //----------------------------------------------------------------------------
   var extraWhiteSpaceHdrs = [
      {desc: "leading white space", value: `  Basic ${Buffer.from(`testUser:password`).toString("base64")}`},
      {desc: "trailing white space", value: `Basic ${Buffer.from(`testUser:password`).toString("base64")}   `},
      {desc: "trailing white space", value: `Basic ${Buffer.from(`testUser:password`).toString("base64")}   `},
      {desc: "middle white space", value: `Basic     ${Buffer.from(`testUser:password`).toString("base64")}`},
   ]
   for (let hdr of extraWhiteSpaceHdrs)      
   it(`creds: (${hdr.desc}) white space in header should succeed`, function () 
   {
      var user1 = {user: "testUser", pwd: "password"};
      var users = [user1];

      var auth = mfs.auth({users: users});
      var req = httpMocks.createRequest({headers: {authorization: hdr.value}});
      var res = httpMocks.createResponse();

      var ret = auth(req, res, function next(err){
         expect(err).to.be.undefined;
         return true;         
      })

      expect(ret).to.equal(true);      
   });


});
