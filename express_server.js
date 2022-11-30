function generateRandomString(string) {
  let randomString = '';
  let characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  for (let i =  0; i < string; i++) {
  randomString += characters.charAt(Math.floor(Math.random() * characters.length));
}
  return randomString;
};

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


const express = require("express");
const cookieParser = require('cookie-parser');
const { request } = require("express");
const app = express();
const PORT = 8080; // default port 8080
app.set("view engine", "ejs");

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};


app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.get("/", (req, res) => {
  res.send("Hello!");
});
app.get("/urls", (req, res) => {
  const templateVars = { urls: urlDatabase,
    user: users[req.cookies.user_id]
  };
  res.render("urls_index", templateVars);
});
app.get("/urls/new", (req, res) => {  
  const templateVars = { 
    user: users[req.cookies.user_id]
  };
  res.render("urls_new", templateVars);
});
app.get("/urls/:id", (req, res) => {
  console.log(req.params.id);
  const templateVars = { id: req.params.id, longURL: urlDatabase[req.params.id], 
    user: users[req.cookies.user_id]
  };
  res.render("urls_show", templateVars);
});
app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});
app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});
app.post("/urls", (req, res) => {
  let randomID = generateRandomString(6);
  let longUrl = req.body.longURL;
  urlDatabase[randomID] = longUrl;
  // res.send("Ok"); 
  res.redirect(`/urls/${randomID}`);
});
app.get("/u/:id", (req, res) => {
  const longURL = urlDatabase[req.params.id];
  res.redirect(longURL);
});
app.post("/urls/:id/delete", (req, res) => {
  delete urlDatabase[req.params.id];
  res.redirect("/urls")
})
app.post("/urls/:id/", (req, res) => {
  urlDatabase[req.params.id] = req.body.newURL;
  res.redirect("/urls")
})
app.post("/login", (req, res) => {
  // console.log(req.body);
  let userName = req.body.username;
  // console.log(userName);
  res.cookie("userName", userName);  //
  res.redirect("/urls");
})
app.post("/logout", (req, res) => {
  res.clearCookie("user_id");
  res.redirect("/urls")
})
app.get("/register", (req, res) => {  
  const templateVars = { 
    user: users[req.cookies.user_id]
  };
  res.render("urls_register", templateVars);
});
app.post("/register", (req, res) => {
  const randomUserId = generateRandomString(6);
  let newUser = {id: randomUserId, 
    email: req.body.email, 
    password: req.body.password
  }
  // console.log(randomUserId);
  users[randomUserId] = newUser;
  console.log(users);
  res.cookie("user_id", randomUserId);
  res.redirect("/urls");
})
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});







