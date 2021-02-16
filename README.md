# express-mfs

This package provides a set of middlewares to help in creating web services.  Web services are not general purpose web applications and have unique needs.  This package tries to focus on those needs.


  - [Installation](#installation)
  - [Functionality](#authentication)
    - [Authentication](#authentication)
    - [JSON](#json)
    - [Schema](#schema)
    - [Service Info](#service-info)
    - [Ping](#ping)
    - [Unknown](#unknown)
    - [Error](#error)
    - [Metrics](#metrics)
  - [Examples](#examples)
  - [Troubleshooting](#troubleshooting)
  - [License](#license)

## Installation

This is a [node.js](https://nodejs.org) module available through the
[npm registry](https://www.npmjs.com/). 

```sh
$ npm install @dsw/express-mfs
```


## Authentication
The authentication functionality is used to validate HTTP basic authentication credentials and restrict access to APIs based on roles.  

Roles can be defined and assigned to groups of APIs.  Only users with approved roles will be able to access a protected API.  

### **<span style="color:blue">mfs.auth(opts)</span>**  
Creates an authentication middleware function that validates HTTP basic authentication credentials.  

```
opts:
{
   roles:      array, (optional) list of roles that can be assigned to a user
   users:      array, list of users
}

user object:
{
   user:       string, username,
   pwd:        string, user password,
   roles:      array, (optional) approved roles for the user
}
```
  
Example:
```
{
   roles: ["role1", "role2"],
   users: [ 
      {user:"user1", pwd:"pwd1", roles:["role1"]}, 
      {user:"user2", pwd:"pwd2", roles:["role1, "role2"]}
   ]
}
```

If roles are specified for a user object, the roles must be in the master list of roles.

When a request arrives, the middleware validates the basic authentication credentials against the list of configured users. 401-Not Authorized is returned when validation fails.
 
### **<span style="color:blue">mfs.createRV(roles)</span>**  
Creates a role verification middleware function that verifies the request has a user with an approved role.  If the user doesn't have an allowed role, the middleware returns 401-Not Authorized.  

Configuration Options

* `roles`: an array of allowed roles

Example: `mfs.createRV(["role1", "role2"])`

If the role verification middleware is used, it must be used in conjunction with a properly configured authentication middleware.


```javascript
const express = require('express');
const mfs = require('express-mfs');
const app = express();

const validRoles = ["group1", "group2", "group3"];
const validUsers = [
   {user: "user1", pwd: "password1", roles: ["group1", "group2"]},
   {user: "user2", pwd: "password2", roles: "group2"},
   {user: "user3", pwd: "password3"}
];

   // create authentiation and role middlewares
const auth = mfs.auth({roles: validRoles, users: validUsers});
const rvRole1 = auth.createRV(["role1"]);
const rvRole2 = auth.createRV(["role2"]);

     // only requests with valid user credentials will be allowed
app.use(auth);

   // any user can access this api, no roles checked
app.get("/ping", mfs.ping);

   // access restricted to users assigned a role of group1
app.get("/route1", rvRole1, function(req, res){....});

   // access restricted to users assigned a role of group2
app.get("/route2", rvRole2, function(req, res){....});

app.use(mfs.error);
app.listen(80);
```


## JSON

### **<span style="color:blue">mfs.json.accept</span>** 
Verifies an accept header is present and specifies JSON responses are acceptable.  If the JSON is not acceptable, the middleware invokes the next(err) path and sets statusCode=406 (Not Acceptable).  

```javascript
const express = require('express');
const mfs = require('express-mfs');
const app = express();

   // requests must accept a JSON payload, accept: application/json
app.get("/hello", mfs.json.accept, function(req, res){
   res.json({msg: "hello"});
});

app.listen(80);
```


### **<span style="color:blue">mfs.json.content</span>**  
Verifies the content-type header specifies JSON content. It does not verify the actual content is valid JSON data.   If JSON content is not specified, the middleware invokes the next(err) path and sets statusCode=400 (Bad Request).

If the request has no content (ex: GET request), the middleware does not verify
the content-type header.

```javascript
const express = require('express');
const mfs = require('express-mfs');
const app = express();

   // requests must send JSON payload, content-type: application/json
app.post("/hello", mfs.json.content, function(req, res){
   // do some work with the json payload
   res.status(204).end();
});

app.listen(80);
```


### **<span style="color:blue">mfs.json.only</span>**  
Verifies JSON is specified in both accept and content-type headers.

```javascript
const express = require('express');
const mfs = require('express-mfs');
const app = express();

   // all requests must accept JSON and send JSON
app.use(mfs.json.only);

app.get("/hello", function(req, res){
   res.json({msg: "GET: hello"});
});

app.listen(80);
```


## Schema

The schema functionality is used to validate any property of the express
'request' middleware input parameter.  

### **<span style="color:blue">mfs.schema(vObject)</span>**  
Creates a schema verification middleware function.  vObject is an object containing validation functions.  The object property names match the express request object property names.  Any property that exists on the express request object can be validated.

**vObject Example**
```
{
   body:  function checkBodyProp(body) {...},         // validates req.body
   query: function checkQueryProp(query) {...},       // validates req.query
   params: function checkParamsProp(params) {...},    // validate req.params
   ....
}
```

**Validation Function**:  
A function that accepts one input, the request propery, and returns a 
validation result object.  


```javascript
   // --- req.query schema verification function 
function(query){

   if (query.name !== "jim") 
      return( {error: {message:"query.name must equal 'jim'", statusCode:400} });

      // no errors found
   return({error: null});
}
```

**Validation Result**:  
An object with an 'error' and 'value' property.  

The presence of an error property, indicates the validation failed.  The error property should be an object with an error message and a HTTP status code.

If the value property is present, the new value is assigned to the 
request property.  This provides an mechanism for the validation 
function to modify the request property as part of the validation process.

Example:
```
{
   error: {message: "error message", statusCode: 400},
   value: new value for request property 
}   
 ```


```javascript
const express = require('express');
const mfs = require('express-mfs');
const app = express();

// ========== Schema Verification Functions ==============================

   // --- req.query validation --------
const vQuery = function(query){

   if (query.name !== "jim") 
      return( {error: {message:"invalid query.name", statusCode:400} });

   return({error: null}); // passed validation
};

   // --- req.params validation --------
const vParams = function(params){

   if (parms.userId !== "1234567890") 
      return( {error: {message:"user not found", statusCode:404} });

   return({error: null}); // passed validation
};
// =======================================================================

   // create schema validation middleware
const vSchema = mfs.schema({query: vQuery, params: vParams});

app.get("/accounts/:userId",  vSchema,  function(req, res){...});

app.use(mfs.error);
app.listen(80);
```


## Service Info

### **<span style="color:blue">mfs.info</span>**
Provides a "service information" endpoint for the service.  The middleware returns information about the platform:  node version, cpus, arch, hostname, etc. and basic application information from the package.json file.

```javascript
const express = require('express');
const mfs = require('express-mfs');
const app = express();

app.get("/serviceInfo", mfs.info);
app.listen(80);
```

Example response:
```
{
   "name": "my-microservice",
   "description": "example service",
   "version": "1.0.0",
   "dependencies": {
      "express": "^4.13.4",      
      "debug": "^4.1.1",
      "express-mfs": "^1.0.0",
   },
   "nodeVersion": "v12.16.3",
   "hostname": "XXXXXXXX",
   "platform": "win32",
   "arch": "x64",
   "cpus": 12,
   "startDate": "Tue, 30 Jun 2020 16:39:14 GMT",
   "upTime": "0d:0h:0m:4s",
   "pid": 153392
}
```

## Ping

### **<span style="color:blue">mfs.ping</span>**  
A simple "I'm Alive" endpoint.  Provides a json response with the message "pong".  

```javascript
const express = require('express');
const mfs = require('express-mfs');
const app = express();

app.get("/ping", mfs.ping);
app.listen(80);
```

Example response:
```
{
   "message": "pong"
}
```

## Unknown

### **<span style="color:blue">mfs.unknown</span>**  
Provides a standardized way to handle unknown routes.  The middleware creates an error object with a "unknown route" messagea, sets the response statusCode=404 (Not Found) and invokes the next(err) path.  

When used with the mfs.error middleware, an friendly JSON error response is returned.

```javascript
const express = require('express');
const mfs = require('express-mfs');
const app = express();

app.get("/ping", mfs.ping);

app.use(mfs.unknown);  
app.use(mfs.error);  // return a JSON error response

app.listen(80);
```


## Error

### **<span style="color:blue">mfs.error**  
Provides basic error handling functionality.  The middleware sets the HTTP response status code and sends a JSON error message.

The following logic is used for determining the HTTP status code and error message:

   - HTTP response status code: errorMiddleware(err, req, res, next):
  
      - err.statusCode exists => res.statusCode = err.statusCode
      - res.statusCode, not specified:  res.statusCode = 500 (Internal Server Error)
  
   - Response Payload:
      - NODE_ENV = production  => payload = err.message 
      - NODE_ENV != production => payload = err.message and err.stack

Below is an example response for an unknown route (404 status code):

```
{
   "message": "POST /abc/xyz unknown route"
}
```

## Metrics
The metrics functionality is used to collect and report operational statistics for the service.  The inititialization function is used to define which metrics to collect and report on.

### **<span style="color:blue">mfs.metrics.init(opts)</span>**  
Used to initialized the stats functionality.  The opts input specifies what stats to collect.  

```
opts:
{
   totals:     boolean, collect request totals - success/failures
   rps:        boolean, collect requests per second
   methods:    boolean, collect method details
   methodInfo: function, report method details to this function
   extraInfo:  [functions], array of functions to provide custom stats
                  for the mfs.metrics.info middleware
}
```

**methodInfo Function**:

When provided, the methodInfo function will be invoked with details about each method. The function must have the following signature:

```
methodInfo(name, duration, req)
      - name:        friendly name assigned to the method
      - duration:    how long the method took, in milliseconds
      - req:         the express request object
```

**extraInfo Function**:

Information functions are used to provide custom stats that will included in the **<span style="color:blue">mfs.metrics.info</span>** middleware response.  An information function accepts no inputs and returns an object with two properties:  "name" and "value".

extraInfo function response example:  
```
{
   name:  "poolInfo", 
   value: {poolSize: 3, poolErrors: 5} 
}
```
### **<span style="color:blue">mfs.metrics.collect</span>**  
This middleware configures the incoming request for metrics collection.  When collecting method details, the middleware should be used early in the express middleware stack to ensure method timing data is correctly captured.

### **<span style="color:blue">mfs.metrics.name(name)</span>**  
Returns a middleware function that assigns a name to a route.  The assigned name is used in the method details report and passed to the registered method information function.  If a specific name isn't assigned to a route, the `req.originalUrl` property is used for a route name.  

### **<span style="color:blue">mfs.metrics.setName(req, name)</span>**  
Used to set a route name inside a middleware function.  The "req" parameter is the middleware "req" parameter.  This can be useful when the name depends on processing done inside of the middleware.

### **<span style="color:blue">mfs.metrics.info</span>**  
Provides a metrics endpoint for the service. The middleware returns the data that has been collected for the service.

```javascript
const express = require('express');
const mfs = require('express-mfs');
const app = express();

   // initialize the stats module
mfs.metrics.init({totals: true, rps: true, methods: true});

   // collect data for all requests
app.use(mfs.metrics.collect);

   // provide a friendly name for a route
app.get("/route1", mfs.metrics.name("route1"), function(req, res){
   res.json({msg: `hello from ${req.originalUrl}`});
});

   // method that returns metrics information
app.get("/service/metrics", mfs.metrics.name("serviceMetrics"), mfs.metrics.info);

app.use(mfs.error);
app.listen(80);
```

Metrics info example response.  

The properties: "startDate", "upTime", "memory", "avgLoad" are always
present.  

- opts.totals=true, the "requests" property is present.  
- opts.rps=true, the "avgRPS" property is present.  
- opts.methods=true, the "methods" property is present.  
```
{
   "startDate": "Tue, 08 Dec 2020 22:22:20 GMT",
   "upTime": "0d:0h:0m:15s",
   "memory": {
      "rss": 29331456,
      "heapTotal": 7712768,
      "heapUsed": 6022248,
      "external": 1269079
   },
   "avgLoad": {
      "load1": 0,
      "load5": 0,
      "load15": 0
   },
   "requests": {
      "total": 4,
      "success": 4,
      "failure": 0
   },
   "avgRPS": {
      "rps1": 0.12,
      "rps5": 0.03,
      "rps15": 0.01
   },
   "methods": [
      {
         "name": "route1",
         "count": 3,
         "respTime": 2.29
      },
      {
         "name": "serviceStats",
         "count": 1,
         "respTime": 1.89
      }
   ]
}
```


## Examples

The project contains multiple examples.  The examples can be found here:

* [Authentication](https://github.com/dsw6/express-mfs/blob/master/examples/app_auth.js)

* [Authentication Roles](https://github.com/dsw6/express-mfs/blob/master/examples/app_auth_roles.js)

* [JSON](https://github.com/dsw6/express-mfs/blob/master/examples/app_json.js)
  
* [Schema](https://github.com/dsw6/express-mfs/blob/master/examples/app_schema.js)
  
* [Info](https://github.com/dsw6/express-mfs/blob/master/examples/app_info.js)
  
* [Ping](https://github.com/dsw6/express-mfs/blob/master/examples/app_ping.js)
  
* [Unknown](https://github.com/dsw6/express-mfs/blob/master/examples/app_unknown.js)
  
* [Error](https://github.com/dsw6/express-mfs/blob/master/examples/app_error.js)

* [Metrics](https://github.com/dsw6/express-mfs/blob/master/examples/app_metrics.js)
 

## Troubleshooting

The project uses the [debug package](https://www.npmjs.com/package/debug) which will log information to console.error.

The package uses the debug prefix `express-mfs:`.  To enable the debug messages for all components, use the wildcard format when setting the DEBUG environment variable:

```sh
$ DEBUG=express-mfs:* node yourApp.js 
```

## License

[MIT License](http://www.opensource.org/licenses/mit-license.php)



