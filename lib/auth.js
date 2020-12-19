/*
 * express-mfs
 *
 * Copyright(c) 2020 David Ward
 * MIT Licensed
 */

"use strict";

const debug = require("debug")("express-mfs:auth");

   /* Module exports
   */
module.exports = createAuth;

/**
 * Authentication Middleware
 *
 * Create authentication middleware to basic auth credentials
 * 
 * @param {Object}   opts - options for the client auth verifier
 * @param {string[]} opts.roles  - list of valid roles, optional
 * @param {Object[]} opts.users  - list of user objects, required
 *
 * opts example:
 * {
 *    roles: ["role1", "role2"],
 *    users: [ 
 *       {user:"user1", pwd:"pwd1", roles:["role1"]}, 
 *       {user:"user2", pwd:"pwd2", roles:["role1", "role2"]}
 *    ]
 * }
 *
 * A user consists of a username, pwd, and optional role value.  If a user role is specified, it must 
 * be in the list of valid roles.
 * 
 * When a request arrives, the authentication middleware validates the basic authentication credentials
 * against the list of configured users.  
 * 
 * If the user is invalid the middleware returns 401-Not Authorized.
 * 
 * If the user has an assigned list of roles, the middleware configures the roles for use during the role
 * verification middleware.
 * 
 * The role verification middleware assigns a specific group of roles to a route and validates the 
 * request has a user with an allowed role.  If the user doesn't have an allowed role, the middleware
 * return 401-Not Authorized.
 */
function createAuth(opts)
{
   opts = opts || {};
   debug(`createAuth - opts: ${JSON.stringify(opts)}`);

   const _roles = opts.roles || [];  // optional
   const _users = opts.users;

   if (typeof(opts) !== "object")
      throw new Error("express-mfs: invalid parameter, opts must be an object");      

         // validate the roles
   if (!Array.isArray(_roles))
      throw new Error("express-mfs: invalid parameter: opts.roles must be an array");

   for (let role of _roles)
   {
      if (typeof(role) !== "string")
         throw new Error("express-mfs: invalid parameter: opts.roles must be an array of strings");
   }

         // validate the users -> if a user has a role assignment, it must be a valid role
   if (!_users)
      throw new Error("express-mfs: invalid parameter: opts.users - not found");

   if (!Array.isArray(_users))
      throw new Error("express-mfs: invalid parameter: opts.users is not an array");

   for (let user of _users)
   {
      if (typeof(user) !== "object")
         throw new Error("express-mfs: invalid parameter: opts.users must be an array of objects");

      if (!user.user || !user.pwd)
         throw new Error("express-mfs: invalid parameter: user object must have properties: user, pwd");

      if (user.roles)
      {
         if (!Array.isArray(user.roles))
            throw new Error("express-mfs: invalid parameter: opts.users[].roles is not an array");

         for (let role of user.roles)
         {
            if (typeof(role) !== "string")
               throw new Error("express-mfs: invalid parameter: opts.users[].role not a string");

            if (!_roles.includes(role))
               throw new Error("express-mfs: invalid parameter: invalid users[].role value");
         }
      }
   }

   var authFunc = credsMiddleware;
   authFunc.createRV = createRoleVerifier;
   return(authFunc);

   // A closure is used to provide context (_users, _roles) for the authentication 
   // middlewares

   // =============================================================================
   // Authentication Middleware
   //    checks basic auth credentials in the request authorization header
   // =============================================================================
   function credsMiddleware(req, res, next)
   {
      var BASIC_AUTH_REGEX = /^\s*Basic\s+(\S+)\s*$/i;      // " Basic xxxx_Base64_encoded_xxxxxxxxxx  "
      var CREDS_REGEX = /^(.*?):(.*)$/;                     // "user:pwd"
      var auth_header = req.headers.authorization || "";
      var match;
      var credStr;

         // match header format ( Basic xxxxxxxxxxx )
      match = BASIC_AUTH_REGEX.exec(auth_header);
      if (!match)
      {
         debug("credsMiddleware: no basic auth header found");
         res.statusCode = 401;
         return( next(new Error("express-mfs: not authorized")) );
      }

         // match the username:pwd format
      credStr = Buffer.from(match[1], "base64").toString();
      match = CREDS_REGEX.exec(credStr);
      if (!match)
      {
         debug("credsMiddleware: no username:pwd found");
         res.statusCode = 401;
         return( next(new Error("express-mfs: not authorized")) );
      }

         // match[1] -> username,  match[2] -> pwd
      for (let user of _users)
      {
         if (user.user === match[1] && user.pwd === match[2])
         {
            req.mfsAuth = {user:user.user, roles:user.roles};
            return( next() );
         }
      }

         // error, no match found
      debug("credsMiddleware: no user match found");
      res.statusCode = 401;
      return( next(new Error("express-mfs: not authorized")) );
   }


   /**
    * Create authz role verifier 
    * @param {string[]} validRoles  - array of approved roles
    */       
   function createRoleVerifier(validRoles)
   {
      const _validRoles = validRoles;

      debug("createRoleVerifier - roles: " + JSON.stringify(validRoles));

      if (!Array.isArray(validRoles))
         throw new Error("express-mfs: invalid parameter: validRoles must be an array");

      if (0 === validRoles.length)
         throw new Error("express-mfs: invalid parameter: no roles specified");

      for (let role of validRoles)
      {
         if (typeof(role) !== "string")
            throw new Error("express-mfs: invalid parameter: validRoles must be an array of strings");

         if (!_roles.includes(role))
            throw new Error("express-mfs: invalid parameter: unknown role value");
      }

      return(roleMiddleware);

      // =============================================================================
      // Authorization Middleware
      //    checks a user's roles against the list of approved roles
      // =============================================================================
      function roleMiddleware(req, res, next)
      {
         if ( !req.mfsAuth || !req.mfsAuth.roles )
         {
            debug("roleMiddleware: no req.mfsAuth.roles data found");
            res.statusCode = 401;
            return( next(new Error("express-mfs: not authorized")) );
         }
         
         for (let userRole of req.mfsAuth.roles)
            if (_validRoles.includes(userRole)) return( next() );

         debug("roleMiddleware: no role match found");
         res.statusCode = 401;
         return( next(new Error("express-mfs: not authorized")) );
      }
   }
}
