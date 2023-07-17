const express = require("express");
const cookieParser = require('cookie-parser');
const app = express();
const PORT = 8080; // default port 8080

// setup
app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());


// function to generate a random 6 character alphanumeric string to use for shortURL
const generateRandomString = function() {
  let result = '';
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const length = 6;
  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    result += characters.charAt(randomIndex);
  }
  return result;
};

// function to check if an email is already attached to a user in the users object
const getUserByEmail = function(email) {
  for (const userID in users) {
    const user = users[userID];
    if (user.email === email) {
      return user;
    }
  }
  return false;
};

// object to store urls
const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

// object to store users
const users = {
  userRandomID: {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur",
  },
  user2RandomID: {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk",
  },
};

//////////////////
// GET REQUESTS //
//////////////////

app.get("/", (req, res) => {
  res.send("Hello!");
});

// route to display all of our stored urls
app.get("/urls", (req, res) => {
  const templateVars = {
    user: users[req.cookies["user_id"]],
    urls: urlDatabase,
  };
  res.render("urls_index", templateVars);
});

// route to input a new url to shorten
app.get("/urls/new", (req, res) => {
  const templateVars = {
    user: users[req.cookies["user_id"]]
  };
  if (!templateVars.user) {
    res.redirect("/login");
  } else {
    res.render("urls_new", templateVars);
  }
});

// route to redirect to longURL
app.get("/u/:id", (req, res) => {
  const longURL = urlDatabase[req.params.id];
  res.redirect(longURL);
});

// route to display the data of a specific url
app.get("/urls/:id", (req, res) => {
  const templateVars = {
    user: users[req.cookies["user_id"]],
    id: req.params.id,
    longURL: urlDatabase[req.params.id],
  };
  res.render("urls_show", templateVars);
});

// route to register email and password
app.get("/register", (req, res) => {
  const templateVars = {
    user: users[req.cookies["user_id"]],
  }
  if (templateVars.user) {
    res.redirect("/urls");
  } else {
    res.render("urls_register", templateVars);
  }
});

// route to Login with email and password
app.get("/login", (req, res) => {
  const templateVars = {
    user: users[req.cookies["user_id"]],
  }
  if (templateVars.user) {
    res.redirect("/urls");
  } else {
    res.render("urls_login", templateVars);
  }
});

///////////////////
// POST REQUESTS //
///////////////////

// generates a random shortURL and stores it inside the urldatabase as a key with a value of the longURL
app.post("/urls", (req, res) => {
  const templateVars = {
    user: users[req.cookies["user_id"]],
  }
  if (!templateVars.user) {
    res.status(401).send("Please log in to shorten URLs.");
  } else {
    const shortURL = generateRandomString();
    urlDatabase[shortURL] = req.body.longURL;
    res.redirect(`/urls/${shortURL}`);
  }
});

// logs out by clearing the username cookie and reloading /urls
app.post("/logout", (req, res) => {
  res.clearCookie("user_id");
  res.redirect("/login");
});

// Logs in by checking if the email and password match an existing userID
app.post("/login", (req, res) => {
  if (getUserByEmail(req.body.email) !== false) {
    const user = getUserByEmail(req.body.email)
    console.log(user);
    if (user.password === req.body.password) {
      res.cookie("user_id", user.id);
      res.redirect("/urls");
    } else {
      res.status(403).send("password is incorrect");
    }
  } else {
    res.status(403).send("e-mail cannot be found");
  }
});

// deletes short urls from the urlDatabase
app.post("/urls/:id/delete", (req, res) => {
  delete urlDatabase[req.params.id];
  res.redirect("/urls");
});

// changes the longURL in urlDatabase to a new one defined by user input
app.post("/urls/:id", (req, res) => {
  const url = req.body.longURL;
  urlDatabase[req.params.id] = url;
  res.redirect("/urls");
});


app.post("/register", (req, res) => {
  // checks if the email or password inputs are empty or if the email already exists
  if (req.body.email === "" || req.body.password === "") {
    res.status(400).send("Email or Password was empty");
  }
  if (getUserByEmail(req.body.email) !== false) {
    res.status(400).send("Email already exists");
  }
  // creates an random user_id and stores it as a cookie and an object in the users object
  const randomID = generateRandomString();
  res.cookie("user_id", randomID);
  users[randomID] = {
    id: randomID,
    email: req.body.email,
    password: req.body.password,
  };
  console.log(users);
  res.redirect("/urls");
});

// PORT = 8080
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}`);
});