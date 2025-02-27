if (process.env.NODE_ENV !== "production") {
    require("dotenv").config();
}

// mongodb+srv://first-user:<password>@cluster0.xfai2kl.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0

//console.log(process.env.CLOUDINARY_SECRET);

const express = require("express");
const path = require("path");
const mongoose = require("mongoose");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const session = require("express-session");
const flash = require("connect-flash");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const mongoSanitize = require('express-mongo-sanitize');
const helmet = require("helmet");
const MongoStore = require("connect-mongo");
const User = require("./models/user");

const ExpressError = require("./utils/ExpressError");

const homeRoutes = require("./routes/home");
const campgroundRoutes = require("./routes/campgrounds");
const reviewRoutes = require("./routes/reviews");
const userRoutes = require("./routes/users");

const dbUrl = process.env.DB_URL || "mongodb://127.0.0.1:27017/yelp-camp";//process.env.DB_URL;

mongoose.connect(dbUrl);
//Or just simply .then() és .catch()
const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
    console.log("Database connected");
})

const app = express();
const port = 3000;

app.engine("ejs", ejsMate);

app.set("view engine", "ejs");
app.set("Views", path.join(__dirname, "views"));

app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.use(express.static(path.join(__dirname, "public")));
app.use(flash());
app.use(mongoSanitize());
app.use(helmet({ contentSecurityPolicy: false }));

/* const scriptSrcUrls = [
    "https://api.mapbox.com/",
    "https://cdn.jsdelivr.net/",
];

const styleSrcUrls = [
    "https://api.mapbox.com/",
    "https://cdn.jsdelivr.net/"
];

const connectSrcUrls = [
    "https://api.mapbox.com/",
]; */

const fontSrcUrls = [];
////
const scriptSrcUrls = [
    "https://stackpath.bootstrapcdn.com/",
    "https://api.tiles.mapbox.com/",
    "https://api.mapbox.com/",
    "https://kit.fontawesome.com/",
    "https://cdnjs.cloudflare.com/",
    "https://cdn.jsdelivr.net",
    "https://kit-free.fontawesome.com/",
];
const styleSrcUrls = [
    "https://kit-free.fontawesome.com/",
    "https://stackpath.bootstrapcdn.com/",
    "https://api.mapbox.com/",
    "https://api.tiles.mapbox.com/",
    "https://fonts.googleapis.com/",
    "https://use.fontawesome.com/",
    "https://cdn.jsdelivr.net/"
];
const connectSrcUrls = [
    "https://api.mapbox.com/",
    "https://a.tiles.mapbox.com/",
    "https://b.tiles.mapbox.com/",
    "https://events.mapbox.com/",
];

app.use(helmet.contentSecurityPolicy({
    directives: {
        defaultSrc: [],
        connectSrc: ["'self'", ...connectSrcUrls],
        scriptSrc: ["'unsafe-inline'", "'self'", ...scriptSrcUrls],
        styleSrc: ["'self'", "'unsafe-inline'", ...styleSrcUrls],
        workerSrc: ["'self'", "blob:"],
        objectSrc: [],
        imgSrc: [
            "'self'",
            "blob:",
            "data:",
            "https://res.cloudinary.com/dp2xr7jgj/", ///in place of dp2xr7.. supposed to be my cloudinary name
            "https://images.unsplash.com",
        ],
        fontSrc: ["'self'", ...fontSrcUrls],
    },
}));

const secret = process.env.SECRET;

const store = MongoStore.create({
    mongoUrl: dbUrl,
    touchAfter: 24 * 60 * 60,
    crypto: {
        secret
    }
});

store.on("error", function (e) {
    console.log("SESSION STORE ERROR", e)
})

const sessionConfig = {
    store,
    name: "session",
    secret,
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true,
        //secure: true,
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
        maxAge: 1000 * 60 * 60 * 24 * 7
    }
}

app.use(session(sessionConfig));

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req, res, next) => {
    res.locals.currentUser = req.user;
    res.locals.success = req.flash("success");
    res.locals.error = req.flash("error");
    next();
})

app.use("/home", homeRoutes);
app.use("/", userRoutes);
app.use("/campgrounds", campgroundRoutes);
app.use("/campgrounds/:id/reviews", reviewRoutes)

app.all("*", (req, res, next) => {
    next(new ExpressError("Page not Found", 404));
})

app.use((err, req, res, next) => {
    if (!err.message) err.message = "Something went wrong";
    if (!err.statusCode) err.statusCode = 500;
    res.status(err.statusCode).render("error", { err });
})

app.listen(port, () => {
    console.log(`Serving on port ${port}:`);
})