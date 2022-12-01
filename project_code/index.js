const express = require("express");
const app = express();
const pgp = require("pg-promise")();
const bodyParser = require("body-parser");
const session = require("express-session");
const bcrypt = require("bcrypt");

let transactions = {
    'jopt6529': {
        'action': 'give',
        'mealsRemaining': 5
    },
    'pasm9872': {
        'action': 'get',
        'mealsRemaining': 9
    },
    'sejk5632': {
        'action': 'get',
        'mealsRemaining': 3
    },
    'rikl4432': {
        'action': 'none',
        'mealsRemaining': 0
    },
    'benw1783': {
        'action': 'none',
        'mealsRemaining': 19
    },
    'lojf5934': {
        'action': 'give',
        'mealsRemaining': 19
    }
};

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

// Helper functions
function match() {
    for (let key in transactions) { // iterate over accountID
        if (transactions[key]["action"] == "get") {
            for (let key2 in transactions) {
                if (transactions[key2]["action"] == "give") {
                    transactions[key]["mealsRemaining"] += 1; // increase meal
                    transactions[key2]["mealsRemaining"] -= 1; // decreasee meal

                    // after transaction is done set action to none
                    transactions[key]["action"] = "none";
                    transactions[key2]["action"] = "none";

                    return true; // know the transactions happened

                }
            }
        }

    }
    return false;
}

function inTransactions(accountID) {
    for (let key in transactions) {
        if (key == accountID) {
            return true;
        }
    }

    return false;
}

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
        if (req.body.password != req.body.ConfirmPassword) {
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


const auth = (req, res, next) => {
    if (!req.session.user) {
        return res.redirect('/register');
    }
    next();
};
app.use(auth);

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
        });
    })
    .catch(function (err) {
        return console.log(err);
    })
});


app.get("/market", async (req, res) => {
    res.render('pages/market');
});

app.get("/settings", async (req, res) => {
    res.render('pages/settings');
});

app.get("/about_us", async (req, res) => {
    res.render('pages/about_us');
});

app.get("/help", async (req, res) => {
    res.render('pages/help');
});

app.get("/logout", (req, res) => {
    req.session.destroy();
    res.render("pages/login");
});

app.get("/get", (req, res) => {
    let accountID = req.session.user.username;

    if (inTransactions(accountID)) {
        transactions[accountID] = { "action": "get", "mealsRemaining": transactions[accountID]["mealsRemaining"] };
    } else {
        transactions[accountID] = { "action": "get", "mealsRemaining": 19 };
    }

    let transactionSuccess = match();

    if (transactionSuccess) {
        console.log("Success");
    } else {
        console.log("Fail");
    }
});

app.get("/give", (req, res) => {
    let accountID = req.session.user.username;

    if (inTransactions(accountID)) {
        transactions[accountID] = { "action": "give", "mealsRemaining": transactions[accountID]["mealsRemaining"] };
    } else {
        transactions[accountID] = { "action": "give", "mealsRemaining": 19 };
    }

    let transactionSuccess = match();

    if (transactionSuccess) {
        console.log("Transaction success!");
    } else {
        console.log("Transaction fail!");
    }
});

// POST requests

app.post('/delete_user', function (req, res) {
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

// Authentication middleware


// Listen on port 3000
app.listen(3000);
console.log("Server is listening on port 3000");
