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


describe("Authentication MiddleWare", function () 
{

      //----------------------------------------------------------------------------
   it(`create: empty opts should thow an error`, function () 
   {
      try { 
         mfs.auth({}); 
         expect.fail("mfs.auth create function did not throw error");
      }
      catch(err){
         expect(err.message).to.contain("invalid parameter");
      }
   });


      //----------------------------------------------------------------------------
   it(`create: no opts should thow an error`, function () 
   {
      try { 
         mfs.auth(); 
         expect.fail("mfs.auth create function did not throw error");
      }
      catch(err){
         expect(err.message).to.contain("invalid parameter");
      }
   });


      //----------------------------------------------------------------------------
   it(`create: non object opts should thow an error`, function () 
   {
      try { 
         mfs.auth(123); 
         expect.fail("mfs.auth create function did not throw error");
      }
      catch(err){
         expect(err.message).to.contain("invalid parameter");
      }
   });

      //----------------------------------------------------------------------------
   it(`create: 1 valid user should succeed`, function () 
   {
      var user1 = {user: "testUser", pwd: "abcd"};
      var users = [user1];

      mfs.auth({users: users});
   });


      //----------------------------------------------------------------------------
   it(`create: multiple valid users should succeed`, function () 
   {
      var user1 = {user: "testUser1", pwd: "abcd"};
      var user2 = {user: "testUser2", pwd: "abcd"};
      var users = [user1, user2];

      mfs.auth({users: users});
   });


      //----------------------------------------------------------------------------
   it(`create: user not an object should throw error`, function () 
   {

      var user1 = "abc";
      var users = [user1];

      try { 
         mfs.auth({users: users}); 
         expect.fail("mfs.auth create function did not throw error");
      }
      catch(err){
         expect(err.message).to.contain("invalid parameter");
      }
   });


      //----------------------------------------------------------------------------
   it(`create: user without user property should throw error`, function () 
   {

      var user1 = {pwd: "adddd"};
      var users = [user1];

      try { 
         mfs.auth({users: users}); 
         expect.fail("mfs.auth create function did not throw error");
      }
      catch(err){
         expect(err.message).to.contain("invalid parameter");
      }

   });


      //----------------------------------------------------------------------------
   it(`create: user without user pwd should throw error`, function () 
   {

      var user1 = {user: "myUser"};
      var users = [user1];

      try { 
         mfs.auth({users: users}); 
         expect.fail("mfs.auth create function did not throw error");
      }
      catch(err){
         expect(err.message).to.contain("invalid parameter");
      }
   });


      //----------------------------------------------------------------------------
   it(`create: user with other properties should not throw error`, function () 
   {

      var user1 = {user: "myUser", pwd: "addd", other: "adfsdf"};
      var users = [user1];

      try { mfs.auth({users: users}); }
      catch(err){
         expect.fail("mfs.auth create function threw error");
      }
   });


      //----------------------------------------------------------------------------
   it(`create: 1 role should succeed`, function () 
   {
      var user1 = {user: "testUser", pwd: "abcd"};
      var roles = ["role1"];
      var users = [user1];

      try { mfs.auth({users: users, roles: roles}); }
      catch(err){
         expect.fail("1 valid role threw error");
      }
   });


      //----------------------------------------------------------------------------
   it(`create: multiple roles should succeed`, function () 
   {
      var user1 = {user: "testUser", pwd: "abcd"};
      var roles = ["role1", "role2"];
      var users = [user1];

      try { mfs.auth({users: users, roles: roles}); }
      catch(err){
         expect.fail("multiple valid roles threw error");
      }
   });


      //----------------------------------------------------------------------------
   it(`create: invalid opt.roles should throw error`, function () 
   {

      var user1 = {user: "myUser"};
      var users = [user1];
      var roles = "must be an array";

      try { 
         mfs.auth({users: users, roles:"must be array"}); 
         expect.fail("mfs.auth create function did not throw error");
      }
      catch(err){
         expect(err.message).to.contain("invalid parameter");
      }
   });


      //----------------------------------------------------------------------------
   it(`create: invalid roles (not strings) should throw error`, function () 
   {

      var user1 = {user: "myUser"};
      var users = [user1];
      var roles = [1, 2]; // must be a string

      try { 
         mfs.auth({users: users, roles: roles}); 
         expect.fail("mfs.auth create function did not throw error");
      }
      catch(err){
         expect(err.message).to.contain("invalid parameter");
      }
   });


      //----------------------------------------------------------------------------
   it(`create: user with valid role should succeed`, function () 
   {
      var user1 = {user: "testUser", pwd: "abcd", roles: ["role1"]};
      var roles = ["role1", "role2"];
      var users = [user1];

      mfs.auth({users: users, roles: roles});
   });

      //----------------------------------------------------------------------------
   it(`create: user with unknown role should fail`, function () 
   {
      var user1 = {user: "testUser", pwd: "abcd", roles: ["Unknown"]};
      var roles = ["role1", "role2"];
      var users = [user1];

      try { 
         mfs.auth({users: users, roles: roles}); 
         expect.fail("mfs.auth create function did not throw error");
      }
      catch(err){
         expect(err.message).to.contain("invalid parameter");
      }
   });


      //----------------------------------------------------------------------------
   it(`create: user with empty roles should succeed`, function () 
   {
      var user1 = {user: "testUser", pwd: "abcd", roles: []};
      var roles = ["role1", "role2"];
      var users = [user1];

      mfs.auth({users: users, roles: roles});
   });


      //----------------------------------------------------------------------------
   it(`create: user with undefined roles should succeed`, function () 
   {
      var user1 = {user: "testUser", pwd: "abcd", roles: undefined};
      var roles = ["role1", "role2"];
      var users = [user1];

      mfs.auth({users: users, roles: roles});
   });


      //----------------------------------------------------------------------------
   it(`create: user with null role should succeed`, function () 
   {
      var user1 = {user: "testUser", pwd: "abcd", roles: null};
      var roles = ["role1", "role2"];
      var users = [user1];

      mfs.auth({users: users, roles: roles});
   });


      //----------------------------------------------------------------------------
   it(`create: user with bad roles (not array) should fail`, function () 
   {
      var user1 = {user: "testUser", pwd: "abcd", roles: 1234};
      var roles = ["role1", "role2"];
      var users = [user1];

      try { 
         mfs.auth({users: users, roles: roles}); 
         expect.fail("mfs.auth create function did not throw error");
      }
      catch(err){
         expect(err.message).to.contain("invalid parameter");
      }
   });


      //----------------------------------------------------------------------------
   it(`create: user with unknown roles (no roles defined) should fail`, function () 
   {
      var user1 = {user: "testUser", pwd: "abcd", roles: ["role1"]};
      var users = [user1];

      try { 
         mfs.auth({users: users}); 
         expect.fail("mfs.auth create function did not throw error");
      }
      catch(err){
         expect(err.message).to.contain("invalid parameter");
      }
   });


});
