const express = require("express");
const app = express();
const pgp = require("pg-promise")();
const bodyParser = require("body-parser");
const session = require("express-session");
const bcrypt = require("bcrypt");

// Express config
app.use(express.static('resources'));

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

// Authentication requests
app.get("/", (req, res) => {
    res.redirect("/login");
});

app.get("/login", (req, res) => {
    res.render("pages/login");
});

app.get("/register", (req, res) => {
    res.render("pages/register");
});

app.post("/register", async (req, res) => {
    const hash = await bcrypt.hash(req.body.password, 10);
    let email = req.body.email;
    console.log(email);
    const myArray = email.split("@");
    console.log(myArray);
    console.log(!myArray[1].localeCompare("colorado.edu"));
    let errmsg = "err:";
    let flag = -1;
    if (req.body.password && req.body.email) {
        if (req.body.password != req.body.confirm_password) {
            errmsg = "Wrong confirm password entered.";
            flag = 0;
        }
        if (!(myArray[1].localeCompare("colorado.edu") == 0)) {
            console.log(myArray[1]);
            errmsg += " Email has to be colorado.edu.";
            flag = 0;
        }
        if (flag == -1) {
            const query = "INSERT INTO users (username, password, first_name, last_name, email) VALUES ($1, $2, $3, $4, $5);";
            db.any(query, [req.body.username, hash, req.body.first_name, req.body.last_name, email])
                .then(function () {
                    console.log('success');
                    transactions[req.body.username] = { 'giving': 0, "mealsRemaining": 3 };
                    res.render("pages/login");
                })
                .catch(function (err) {
                    console.log(err);
                    res.redirect("/register");
                    return "Error registering";
                });
        } else {
            console.log(errmsg)
            res.render("pages/register", {
                error: true,
                message: errmsg,
            });
        }

    } else {
        console.log(errmsg)
        res.render("pages/register", {
            error: true,
            message: "Didn't enter.",
        });
    }
});

app.post("/login", (req, res) => {
    const query = "SELECT password FROM users WHERE username = $1;";
    db.one(query, [req.body.username])
        .then(async function (user) {
            const match = await bcrypt.compare(req.body.password, user.password);
            if (match) {
                req.session.user = {
                    api_key: process.env.API_KEY,
                    username: req.body.username,
                };
                req.session.save();
                res.redirect("/home");
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

// Authentication middleware
const auth = (req, res, next) => {
    if (!req.session.user) {
        return res.redirect('/login');
    }
    next();
};
app.use(auth);

// Global transactions object
let transactions = {
    'nica6529': {
        'giving': 1,
        'mealsRemaining': 6
    },
    'xame9872': {
        'giving': 1,
        'mealsRemaining': 18
    },
    'aial5632': {
        'giving': 2,
        'mealsRemaining': 3
    },
    'arkl4432': {
        'giving': 0,
        'mealsRemaining': 0
    },
    'soro1783': {
        'giving': 3,
        'mealsRemaining': 16
    },
    'rabi5934': {
        'giving': 8,
        'mealsRemaining': 11
    }
};

// Helper functions
function claimMeal(donor, recipient) {
    transactions[recipient]['mealsRemaining'] += transactions[donor]['giving'];
    transactions[donor]['giving'] = 0;
}

function donateMeal(donor) {
    transactions[donor]['giving'] += 1;
    transactions[donor]['mealsRemaining'] -= 1;
}

async function getDonations() {
    let donations = [];
    const query = 'SELECT * FROM users WHERE username = $1;';

    for (let user in transactions) {
        if (transactions[user]['giving'] > 0) {
            let donor_info = await db.one(query, [user])
                .then((data) => {
                    return {
                        'username': user,
                        'first_name': data.first_name,
                        'last_name': data.last_name,
                        'donating': transactions[user]['giving']
                    };
                })
                .catch((err) => {
                    return console.log(err);
                })

            donations.push(donor_info);
        }
    }

    return donations;
}

// GET requests
app.get("/home", async (req, res) => {
    res.render('pages/home');
});

app.get("/market", async (req, res) => {
    let donations = await getDonations();

    res.render('pages/market',
        {
            user_meals: transactions[req.session.user.username]['mealsRemaining'],
            donations: donations
        });
});

app.get("/account", async (req, res) => {
    const query = 'SELECT * FROM users WHERE username = $1;';
    db.one(query, [req.session.user.username])
        .then(function (data) {
            res.render('pages/account',
                {
                    username: data.username,
                    first_name: data.first_name,
                    last_name: data.last_name,
                    email: data.email,
                    meals: transactions[data.username]['mealsRemaining']
                });
        })
        .catch(function (err) {
            return console.log(err);
        })
});

app.get("/help", async (req, res) => {
    res.render('pages/help');
});

app.get("/logout", (req, res) => {
    req.session.destroy();
    res.render("pages/login");
});

// POST requests
app.post("/claim", async (req, res) => {
    claimMeal(req.body.donor_username, req.session.user.username);

    let donations = await getDonations();

    res.render('pages/market',
        {
            user_meals: transactions[req.session.user.username]['mealsRemaining'],
            donations: donations
        });
});

app.post("/donate", async (req, res) => {
    donateMeal(req.session.user.username);

    let donations = await getDonations();

    res.render('pages/market',
        {
            user_meals: transactions[req.session.user.username]['mealsRemaining'],
            donations: donations
        });
});

app.post('/delete_user', function (req, res) {
    delete transactions[req.session.user.username];

    const query = 'DELETE FROM users WHERE username=$1';
    db.any(query, [req.session.user.username])
        .then(function (data) {
            req.session.destroy();
            res.redirect("/register");
        })
        .catch(function (err) {
            return console.log(err);
        });
});

// Listen on port 3000
app.listen(3000);
console.log("Server is listening on port 3000");
