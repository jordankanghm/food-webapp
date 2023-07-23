// Require
// Linking buttons to requests for saved lists
// Linking food and event Trends
// Working out the logic for recommendations

const express = require("express");
const app = express();
const userRouter = require("./routes/userRoutes")
const listRouter = require("./routes/listRoutes")
const searchHistoryRouter = require("./routes/searchHistoryRoutes")
const renderInitialPage = require("./views/initialRender");
const path = require("path");

// Set view engine to EJS
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// Serve static files from the "public" folder
app.use(express.static(path.join(__dirname, "public")));

// Render the initial EJS file before defining your routers
app.use("/", renderInitialPage);

// Enables parsing of JSON data in request bodies
app.use(express.json());

// Navigate to userRouter whenever the root route is requested
app.use("/", userRouter);

// Navigate to listRouter whenever the lists route is requested
app.use("/:username/lists", listRouter);

// Navigate to searchHistoryRouter whenever the searchHistory route is requested
app.use("/:username/searchHistory", searchHistoryRouter);

module.exports = app;