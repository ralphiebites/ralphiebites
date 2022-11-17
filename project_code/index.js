const express = require("express");
const app = express();
const pgp = require("pg-promise")();
const bodyParser = require("body-parser");
const session = require("express-session");
const bcrypt = require("bcrypt");
const axios = require("axios");

let transactions = {}; // global variable 

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

function match()
{
    for (let key in transactions) { // iterate over accountID
        if(transactions[key]["action"] == "get")
        {
            for(let key2 in transactions)
            {
                if(transactions[key2]["action"] == "give")
                {
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

app.get("/give", (req, res) => {
    const query = 'SELECT accountID FROM users WHERE username = $1;';
    db.any(query, [req.body.username])
        .then(function (data) {
            let accountID = data.accountID;
            // let transactions; 
            transactions[accountID] =  {"action": "give", "mealsRemaining": 10}; 
            console.log(transactions[1234]["action"]); // should print give 
            let transactionSuccess = match();
            if(transactionSuccess)
            {
                console.log("Success");
            }else{
                console.log("fail"); 
            }  
                      
        })
        .catch(function(err) {
            return console.log(err);
        })
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
