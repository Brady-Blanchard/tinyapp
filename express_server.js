const express = require ("express");
const cookieParser = require('cookie-parser');
const app = express();
const PORT = 8080; // default port 8080

// setup
app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());


// function to generate a random 6 character alphanumeric string to use for shortURL
function generateRandomString() {
  let result = '';
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const length = 6;
  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    result += characters.charAt(randomIndex);
  }
  return result;
}

// object to store urls
const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};


app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/urls", (req, res) => {
  const templateVars = {
    username: req.cookies["username"],
    urls: urlDatabase,
  };
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  const templateVars = {
    username: req.cookies["username"]
  };
  res.render("urls_new", templateVars);
});

app.get("/u/:id", (req, res) => {
  const longURL = urlDatabase[req.params.id];
  res.redirect(longURL);
});

app.get("/urls/:id", (req, res) => {
  const templateVars = {
    username: req.cookies["username"],
    id: req.params.id, 
    longURL: urlDatabase[req.params.id],
  };
  res.render("urls_show", templateVars);
});

// generates a random shortURL and stores it inside the urldatabase as a key with a value of the longURL
app.post("/urls", (req, res) => {
  const shortURL = generateRandomString();
  urlDatabase[shortURL] = req.body.longURL;
  res.redirect(`/urls/${shortURL}`);
});

// submits the username as a cookie to login
app.post("/login", (req, res) => {
  res.cookie("username", req.body.username);
  res.redirect("/urls");
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
  console.log(urlDatabase);
  res.redirect("/urls");
});

// PORT = 8080
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}`);
});