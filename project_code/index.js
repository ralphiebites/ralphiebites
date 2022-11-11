const express = require("express");
const app = express();
const pgp = require("pg-promise")();
const bodyParser = require("body-parser");
const session = require("express-session");
const bcrypt = require("bcrypt");
const axios = require("axios");

// Database configuration
const dbConfig = {
    host: "db",
    port: 5432,
    database: process.env.POSTGRES_DB,
    user: process.env.POSTGRES_USER,
    password: process.env.POSTGRES_PASSWORD,
};
const db = pgp(dbConfig);

// Testing database
db.connect()
    .then((obj) => {
        console.log("Database connection successful"); // you can view this message in the docker compose logs
        obj.done(); // success, release the connection;
    })
    .catch((error) => {
        console.log("ERROR:", error.message || error);
    });

// EJS configuration
app.set("view engine", "ejs");
app.use(bodyParser.json());
app.use(
    session({
        secret: "something",
        saveUninitialized: false,
        resave: false,
    })
);

app.use(
    bodyParser.urlencoded({
        extended: true,
    })
);

// GET requests
app.get("/", (req, res) => {
    res.redirect("/login");
});

app.get("/login", (req, res) => {
    res.render("pages/login");
});

app.get("/register", (req, res) => {
    res.render("pages/register");
});

app.get("/market", async (req, res) => {
    res.render('pages/market');
});

app.get("/account", async (req, res) => {
    res.render('pages/account');
});

app.get("/settings", async (req, res) => {
    res.render('pages/settings');
});

app.get("/about_us", async (req, res) => {
    res.render('pages/about_us');
});

app.get("/logout", (req, res) => {
    req.session.destroy();
    res.render("pages/login");
});

// POST requests
app.post("/register", async (req, res) => {
    const hash = await bcrypt.hash(req.body.password, 10);

    const query = "INSERT INTO users (username, password) VALUES ($1, $2);";
    db.any(query, [req.body.username, hash])
        .then(function (data) {
            res.redirect("/login");
        })
        .catch(function (err) {
            res.redirect("/register");
            return console.log(err);
        });
});

app.post("/login", (req, res) => {
    const query = "SELECT password FROM users WHERE username = $1;";
    db.one(query, [req.body.username])
        .then(async function (user) {
            const match = await bcrypt.compare(req.body.password, user.password);

            if (match) {
                req.session.user = {
                    api_key: process.env.API_KEY,
                };
                req.session.save();
                res.redirect("/market");
            } else {
                res.render("pages/login", {
                    error: true,
                    message: err.message,
                });
            }
        })
        .catch(function (err) {
            res.render("pages/login", {
                error: true,
                message: err.message,
            });
        });
});

// Delete Account API Route
app.post('/delete_user', function (req, res) {
    const query = 'DELETE FROM users WHERE student_id=$1';
    db.any(query, [req.body.student_id])
      .then(function (data) {
        res.status(200).json({
          status: 'success',
          data: data,
          message: 'user deleted successfully',
        });
      })
      .catch(function (err) {
        return console.log(err);
      });
});

// Authentication middleware
const auth = (req, res, next) => {
    if (!req.session.user) {
        return res.redirect('/register');
    }
    next();
};

// Authentication required
app.use(auth);

// Listen on port 3000
app.listen(3000);
console.log("Server is listening on port 3000");
