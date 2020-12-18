/*
 * express-mfs
 *
 * Copyright(c) 2020 David Ward
 * MIT Licensed
 */

"use strict";

// ==========================================================================================
// ping middleware
//
// mfs.ping:
//    The middleware provides an API-friendly json response ("pong").  Every API needs a simple
//    "I'm Alive" endpoint.
//
// ==========================================================================================

const express = require("express");
const mfs = require("../lib");

const API_PORT = 3000;

const app = express();


app.get("/ping", mfs.ping);

   // handle unknown routes
app.use(mfs.unknown);

   // handle all errors
app.use(mfs.error);


app.listen(API_PORT);
console.log(`API Service Listening On Port: ${API_PORT}`);

