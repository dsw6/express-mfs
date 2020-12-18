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


describe("Auth Role MiddleWare", function () 
{

      //----------------------------------------------------------------------------
   it(`verify: user with valid role should succeed`, function () 
   {
      var user1 = {user: "testUser", pwd: "abcd", roles: ["role1"]};
      var roles = ["role1", "role2", "role3"];
      var users = [user1];
      var b64Creds = Buffer.from(`${user1.user}:${user1.pwd}`).toString("base64");
      var authHdr = `Basic ${b64Creds}`;

      var auth = mfs.auth({users: users, roles: roles});
      var validRoles = ["role1"];
      var rv = auth.createRV(validRoles);

      var req = httpMocks.createRequest({headers: {authorization: authHdr}});
      var res = httpMocks.createResponse();

      auth(req, res, function next(){});

      var ret = rv(req, res, function next(err){
         expect(err).to.be.undefined;
         return true;             
      });

      expect(ret).to.equal(true);   
   });


      //----------------------------------------------------------------------------
   it(`verify: user with multiple roles (one valid) should succeed`, function () 
   {
      var user1 = {user: "testUser", pwd: "abcd", roles: ["role2", "role1"]};
      var roles = ["role1", "role2", "role3"];
      var users = [user1];
      var b64Creds = Buffer.from(`${user1.user}:${user1.pwd}`).toString("base64");
      var authHdr = `Basic ${b64Creds}`;

      var auth = mfs.auth({users: users, roles: roles});
      var validRoles = ["role1"];
      var rv = auth.createRV(validRoles);

      var req = httpMocks.createRequest({headers: {authorization: authHdr}});
      var res = httpMocks.createResponse();

      auth(req, res, function next(){});

      var ret = rv(req, res, function next(err){
         expect(err).to.be.undefined;
         return true;             
      });

      expect(ret).to.equal(true);   
   });


      //----------------------------------------------------------------------------
   it(`verify: user with multiple roles (all valid) should succeed`, function () 
   {
      var user1 = {user: "testUser", pwd: "abcd", roles: ["role2", "role1"]};
      var roles = ["role1", "role2", "role3"];
      var users = [user1];
      var b64Creds = Buffer.from(`${user1.user}:${user1.pwd}`).toString("base64");
      var authHdr = `Basic ${b64Creds}`;

      var auth = mfs.auth({users: users, roles: roles});
      var validRoles = ["role1", "role2"];
      var rv = auth.createRV(validRoles);

      var req = httpMocks.createRequest({headers: {authorization: authHdr}});
      var res = httpMocks.createResponse();

      auth(req, res, function next(){});

      var ret = rv(req, res, function next(err){
         expect(err).to.be.undefined;
         return true;             
      });

      expect(ret).to.equal(true);   
   });


      //----------------------------------------------------------------------------
   it(`verify: user with invalid role should fail`, function () 
   {
      var user1 = {user: "testUser", pwd: "abcd", roles: ["role2"]};
      var roles = ["role1", "role2", "role3"];
      var users = [user1];
      var b64Creds = Buffer.from(`${user1.user}:${user1.pwd}`).toString("base64");
      var authHdr = `Basic ${b64Creds}`;

      var auth = mfs.auth({users: users, roles: roles});
      var validRoles = ["role1"];
      var rv = auth.createRV(validRoles);

      var req = httpMocks.createRequest({headers: {authorization: authHdr}});
      var res = httpMocks.createResponse();

      auth(req, res, function next(){});

      var ret = rv(req, res, function next(err){
         expect(err).to.exist;
         return true;             
      });

      expect(res.statusCode).to.equal(401);
      expect(ret).to.equal(true);   
   });


      //----------------------------------------------------------------------------
   it(`verify: user with multiple roles (all invalid) should fail`, function () 
   {
      var user1 = {user: "testUser", pwd: "abcd", roles: ["role2", "role3"]};
      var roles = ["role1", "role2", "role3"];
      var users = [user1];
      var b64Creds = Buffer.from(`${user1.user}:${user1.pwd}`).toString("base64");
      var authHdr = `Basic ${b64Creds}`;

      var auth = mfs.auth({users: users, roles: roles});
      var validRoles = ["role1"];
      var rv = auth.createRV(validRoles);

      var req = httpMocks.createRequest({headers: {authorization: authHdr}});
      var res = httpMocks.createResponse();

      auth(req, res, function next(){});

      var ret = rv(req, res, function next(err){
         expect(err).to.exist;
         return true;             
      });

      expect(res.statusCode).to.equal(401);
      expect(ret).to.equal(true);   
   });


      //----------------------------------------------------------------------------
   it(`verify: user with no role should fail`, function () 
   {
      var user1 = {user: "testUser", pwd: "abcd"};
      var roles = ["role1", "role2", "role3"];
      var users = [user1];
      var b64Creds = Buffer.from(`${user1.user}:${user1.pwd}`).toString("base64");
      var authHdr = `Basic ${b64Creds}`;

      var auth = mfs.auth({users: users, roles: roles});
      var validRoles = ["role1"];
      var rv = auth.createRV(validRoles);

      var req = httpMocks.createRequest({headers: {authorization: authHdr}});
      var res = httpMocks.createResponse();

      auth(req, res, function next(){});

      var ret = rv(req, res, function next(err){
         expect(err).to.exist;
         return true;             
      });

      expect(res.statusCode).to.equal(401);
      expect(ret).to.equal(true);   
   });


      //----------------------------------------------------------------------------
   it(`verify: user with no auth information should fail`, function () 
   {
      var user1 = {user: "testUser", pwd: "abcd", roles: ["role1"]};
      var roles = ["role1", "role2", "role3"];
      var users = [user1];
      var b64Creds = Buffer.from(`${user1.user}:${user1.pwd}`).toString("base64");
      var authHdr = `Basic ${b64Creds}`;

      var auth = mfs.auth({users: users, roles: roles});
      var validRoles = ["role1"];
      var rv = auth.createRV(validRoles);

      var req = httpMocks.createRequest({headers: {authorization: authHdr}});
      var res = httpMocks.createResponse();

            // the auth middleware sets up the request's user information,
            // not calling the middleware means no information will be present 
      // auth(req, res, function next(){});

      var ret = rv(req, res, function next(err){
         expect(err).to.exist;
         return true;             
      });

      expect(res.statusCode).to.equal(401);
      expect(ret).to.equal(true);   
   });


});
