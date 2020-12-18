/*
 * express-mfs
 *
 * Copyright(c) 2020 David Ward
 * MIT Licensed
 */

"use strict";

// ==========================================================================================
// authentication middleware with user roles
//
// The authentication middleware is used to validate basic authentication credentials
//
// Initialize the middleware with opts, specifying the list of valid users and roles.
//
// opts example:
// {
//    roles: ["role1", "role2"],
//    users: [ {user:"user1", pwd:"pwd1", roles:["role1"]}, {user:"user2", pwd:"pwd2", roles:["role2"]}]
// }
//
// A user consists of a username, pwd, and optional roles list.  If user roles are specified, they must 
// be in the list of valid roles.
// 
// When a request arrives, the authentication middleware validates the basic authentication credentials
// against the list of configured users. If the user is invalid the middleware returns 401-Not Authorized.
// 
// The role verification middleware assigns a specific group of roles to a route and validates the 
// request has a user with an allowed role.  If the user doesn't have an allowed role, the middleware
// returns 401-Not Authorized.
//
// ==========================================================================================

const express = require("express");
const mfs = require("../lib");
const API_PORT = 3000;

const validRoles = ["role1", "role2", "role3"];
const validUsers = [
   {user: "user1", pwd: "password1", roles: ["role1", "role2"]},
   {user: "user2", pwd: "password2", roles: "role2"},
   {user: "user3", pwd: "password3"}
];

   // create authentiation and role middlewares
const auth = mfs.auth({roles: validRoles, users: validUsers});
const rvRole1 = auth.createRV(["role1"]);
const rvRole2 = auth.createRV(["role2"]);


const app = express();

   // all requests must accept JSON and send JSON
app.use(mfs.json.only);


   // only requests with valid user credentials will be allowed
app.use(auth);


   // any user can access this api, no roles checked
app.get("/auth/route1", function(req, res){
   res.json({  
         msg: `hello from ${req.originalUrl}`
   });
});


   // access restricted to users with role1
app.get("/auth/route2", rvRole1, function(req, res){
   res.json({  
         msg: `hello from ${req.originalUrl}`
   });
});


   // access restricted to users with role2
app.get("/auth/route3", rvRole2, function(req, res){
   res.json({  
         msg: `hello from ${req.originalUrl}`
   });
});


   // handle unknown routes
app.use(mfs.unknown);

   // handle errors
app.use(mfs.error);


app.listen(API_PORT);
console.log(`API Service Listening On Port: ${API_PORT}`);



