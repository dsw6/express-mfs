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
   it(`create: valid role should succeed`, function () 
   {
      var user1 = {user: "testUser", pwd: "abcd"};
      var roles = ["role1", "role2", "role3"];
      var users = [user1];

      var auth = mfs.auth({users: users, roles: roles});

      var validRoles = ["role1"];
      
      try { auth.createRV(validRoles); }
      catch(err) {
         expect.fail("valid roles threw error");
      }
   });


      //----------------------------------------------------------------------------
   it(`create: multiple valid roles should succeed`, function () 
   {
      var user1 = {user: "testUser", pwd: "abcd"};
      var roles = ["role1", "role2", "role3"];
      var users = [user1];

      var auth = mfs.auth({users: users, roles: roles});

      var validRoles = ["role1", "role2"];
      
      try { auth.createRV(validRoles); }
      catch(err) {
         expect.fail("valid roles threw error");
      }
   });


      //----------------------------------------------------------------------------
   it(`create: empty role list should fail`, function () 
   {
      var user1 = {user: "testUser", pwd: "abcd"};
      var roles = ["role1", "role2", "role3"];
      var users = [user1];

      var auth = mfs.auth({users: users});

      var validRoles = [];
      
      try { 
         auth.createRV(validRoles); 
         expect.fail("createRV did not throw error");
      }
      catch(err){
         expect(err.message).to.contain("invalid parameter");
      }
   });


      //----------------------------------------------------------------------------
   it(`create: unknown roles should fail`, function () 
   {
      var user1 = {user: "testUser", pwd: "abcd"};
      var roles = ["role1"];
      var users = [user1];

      var auth = mfs.auth({users: users, roles: roles});

      var validRoles = ["uknownRole"];
      
      try { 
         auth.createRV(validRoles); 
         expect.fail("createRV did not throw error");
      }
      catch(err){
         expect(err.message).to.contain("invalid parameter");
      }
   });


      //----------------------------------------------------------------------------
   it(`create: invalid parameter (not an array) should fail`, function () 
   {
      var user1 = {user: "testUser", pwd: "abcd"};
      var roles = ["role1"];
      var users = [user1];

      var auth = mfs.auth({users: users, roles: roles});

      var validRoles = "role1";
      
      try { 
         auth.createRV(validRoles); 
         expect.fail("createRV did not throw error");
      }
      catch(err){
         expect(err.message).to.contain("invalid parameter");
      }
   });


      //----------------------------------------------------------------------------
   it(`create: invalid parameter (array items not strings) should fail`, function () 
   {
      var user1 = {user: "testUser", pwd: "abcd"};
      var roles = ["role1"];
      var users = [user1];

      var auth = mfs.auth({users: users, roles: roles});

      var validRoles = [1, 2];
      
      try { 
         auth.createRV(validRoles); 
         expect.fail("createRV did not throw error");
      }
      catch(err){
         expect(err.message).to.contain("invalid parameter");
      }
   });

});
