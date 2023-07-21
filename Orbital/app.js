const express = require("express");
const app = express();
const userRouter = require("./routes/userRoutes")
const listRouter = require("./routes/listRoutes")
const renderInitialPage = require("./views/initialRender");
const path = require("path");

// Set view engine to EJS
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// Serve static files from the "public" folder
app.use(express.static(path.join(__dirname, "public")));

// Enables parsing of JSON data in request bodies
app.use(express.json());

// Navigate to userRouter whenever the root route is requested
app.use("/", userRouter);

// Navigate to listRouter whenever the lists route is requested
app.use("/:username/lists", listRouter);

// Render the initial EJS file before defining your routers
app.use(renderInitialPage);



module.exports = app;