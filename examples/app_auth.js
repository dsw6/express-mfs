/*
 * express-mfs
 *
 * Copyright(c) 2020 David Ward
 * MIT Licensed
 */

"use strict";

// ==========================================================================================
// Authentication Middleware
//
// The authentication middleware is used to valid basic authentiation credentials
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

const validUsers = [
   {user: "user1", pwd: "password1"},
   {user: "user2", pwd: "password2"},
   {user: "user3", pwd: "password3"}
];

const app = express();


   // all requests must accept JSON and send JSON
app.use(mfs.json.only);


   // only requests with valid user credentials will be allowed
app.use(mfs.auth({users: validUsers}));

app.get("/auth/route1",  function(req, res){
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



