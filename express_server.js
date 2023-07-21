const { getUserByEmail } = require("./helpers");
const express = require("express");
const cookieSession = require('cookie-session');
const bcrypt = require("bcryptjs");
const app = express();
const PORT = 8080; // default port 8080

// setup
app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));
app.use(cookieSession({
  name: 'session',
  keys: ['key1', 'key2'],
}));


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



// function to return URLS when the userID is equal to the id of the current logged in user
const urlsForUser = function(database, req) {
  const userURLs = {}; 
  for (const url in database) {
    if (database[url].userID === req.session.user_id) {
      userURLs[url] = database[url];
    }
  }
  return userURLs;
};

// object to store urls
const urlDatabase = {
  "b2xVn2": {
    longURL:"http://www.lighthouselabs.ca",
    userID: "userRandomID",
  },
  "9sm5xK": {
    longURL:"https://www.google.ca",
    userID: "userRandomID",
  },
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
    user: users[req.session.user_id],
    urls: urlsForUser(urlDatabase, req),
  };
  res.render("urls_index", templateVars);
});

// route to input a new url to shorten
app.get("/urls/new", (req, res) => {
  const templateVars = {
    user: users[req.session.user_id]
  };
  if (!templateVars.user) {
    res.redirect("/login");
  } else {
    res.render("urls_new", templateVars);
  }
});

// route to redirect to longURL
app.get("/u/:id", (req, res) => {
  if (!urlDatabase[req.params.id]) {
    res.send("The short URL you entered does not exist")
  } else {
    const longURL = urlDatabase[req.params.id].longURL;
    res.redirect(longURL);
  }
});

// route to display the data of a specific url
app.get("/urls/:id", (req, res) => {
  if (!urlDatabase[req.params.id]) {
    res.send("URL does not exist");
  }
  const templateVars = {
    user: users[req.session.user_id],
    id: req.params.id,
    longURL: urlDatabase[req.params.id].longURL,
  };
  if (!req.session.user_id) {
    res.send("Must be logged in to view a URL");
  } else if (req.session.user_id !== urlDatabase[req.params.id].userID) {
    res.send("You do not own this URL");
  } else {
    res.render("urls_show", templateVars);
  }
});

// route to register email and password
app.get("/register", (req, res) => {
  const templateVars = {
    user: users[req.session.user_id],
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
    user: users[req.session.user_id],
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

// generates a random shortURL and stores it inside the urldatabase
app.post("/urls", (req, res) => {
  const templateVars = {
    user: users[req.session.user_id],
  }
  if (!templateVars.user) {
    res.status(401).send("Please log in to shorten URLs.");
  } else {
    const shortURL = generateRandomString();
    urlDatabase[shortURL] = {
      longURL: req.body.longURL,
      userID: req.session.user_id,
    };
    res.redirect(`/urls/${shortURL}`);
  }
});

// logs out by clearing the username cookie and reloading /urls
app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect("/login");
});

// Logs in by checking if the email and password match an existing userID
app.post("/login", (req, res) => {
  if (getUserByEmail(req.body.email, users) !== undefined) {
    const user = getUserByEmail(req.body.email, users);
    if (bcrypt.compareSync(req.body.password, user.password)) {
      req.session.user_id = user.id;
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
  if (!urlDatabase[req.params.id]) {
    res.send("URL does not exist");
  } else if (!req.session.user_id) {
    res.send("You must be logged in to delete URLs");
  } else if (req.session.user_id !== urlDatabase[req.params.id].userID) {
    res.send("You do not own this URL");
  } else {
    delete urlDatabase[req.params.id];
    res.redirect("/urls");
  }
});

// changes the longURL in urlDatabase to a new one defined by user input
app.post("/urls/:id", (req, res) => {
  if (!urlDatabase[req.params.id]) {
    res.send("URL does not exist")
  } else if (!req.session.user_id) {
    res.send("Must be logged in to view a URL");
  } else if (req.session.user_id !== urlDatabase[req.params.id].userID) {
    res.send("You do not own this URL");
  } else {
    const url = req.body.longURL;
    urlDatabase[req.params.id].longURL = url;
    res.redirect("/urls");
  }
});


app.post("/register", (req, res) => {
  // checks if the email or password inputs are empty or if the email already exists
  if (req.body.email === "" || req.body.password === "") {
    res.status(400).send("Email or Password was empty");
  } else if (getUserByEmail(req.body.email, users) !== undefined) {
      res.status(400).send("Email already exists");
  } else {
    // creates a random user_id and stores it as a cookie and an object in the users object
    const randomID = generateRandomString();
    req.session.user_id = randomID;
    const password = req.body.password;
    const hashedPassword = bcrypt.hashSync(password, 10);
    users[randomID] = {
      id: randomID,
      email: req.body.email,
      password: hashedPassword,
    };
    res.redirect("/urls");
  }
});

// PORT = 8080
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}`);
});