var createError = require("http-errors");
var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");
var mongoose = require("mongoose");
mongoose.connect("mongodb://localhost/ytki");
var session = require("express-session");
var Hero = require("./models/hero").Hero;

var heroesRouter = require("./routes/heroes");
var indexRouter = require("./routes/index");
var usersRouter = require("./routes/users");

var app = express();

// view engine setup
app.engine("ejs", require("ejs-locals"));

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));
app.use(express.static(path.join(__dirname, "bower_components")));

var MongoStore = require("connect-mongo");
app.use(
    session({
        secret: "TheYtki",
        cookie: { maxAge: 60 * 1000 },
        store: MongoStore.create({ mongoUrl: "mongodb://localhost/ytki" }),
    })
);

app.use(function (req, res, next) {
    req.session.counter = req.session.counter + 1 || 1;
    next();
});

app.use(function (req, res, next) {
    res.locals.nav = [];

    Hero.find(null, { _id: 0, title: 1, nick: 1 }, function (err, result) {
        if (err) throw err;
        res.locals.nav = result;
        next();
    });
});

app.use(require("./middleware/createMenu.js"));
app.use(require("./middleware/createUser.js"));

app.use("/", indexRouter);
app.use("/users", usersRouter);
app.use("/heroes", heroesRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
    next(createError(404));
    return
});

// error handler
app.use(function (err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get("env") === "development" ? err : {};

    // render the error page
    res.status(err.status || 500);
    res.render("error");
});

module.exports = app;
