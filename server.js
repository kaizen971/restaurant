"use strict";
const express = require("express");
const morgan = require("morgan");
const app = express();
const port = 5500;

app.set("view engine", "pug");

// App middlewares
app.use(morgan("dev"));
app.use("/static", express.static("./static"));

// App routes
app.use("/", require("./router"));
// App initialisation

// Démarrage de l'application Node.js
app.listen(port, () => {
  console.log(`http://localhost:${port}`);
});