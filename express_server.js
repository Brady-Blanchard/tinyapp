const express = require ("express");
const app = express();
const PORT = 8080; // default port 8080

app.set("view engine", "ejs");

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

app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/urls", (req, res) => {
  const templateVars = { urls: urlDatabase };
  res.render("urls_index", templateVars);
});

app.post("/urls", (req, res) => {
  const shortURL = generateRandomString();
  urlDatabase[shortURL] = req.body.longURL;
  res.redirect(`/urls/${shortURL}`);
});

app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

app.get("/u/:id", (req, res) => {
  const longURL = urlDatabase[req.params.id];
  res.redirect(longURL);
});

app.get("/urls/:id", (req, res) => {
  const templateVars = { id: req.params.id, longURL: urlDatabase[req.params.id] };
  res.render("urls_show", templateVars);
});

app.post("/login", (req, res) => {
  res.cookie(req.body.username, "submitted");
  res.redirect("/urls")
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