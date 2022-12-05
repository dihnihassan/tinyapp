const express = require("express");
const cookieSession = require('cookie-session');
const bcrypt = require("bcryptjs");
const { 
  users,
  urlDatabase, 
  userLookup,
  generateRandomString, 
  getUserFromReqs,
  urlsForUser, 
} = require('./helpers');

const app = express();
const PORT = 8080;
app.set("view engine", "ejs");

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(cookieSession({
  name: 'session',
  keys: ['key1, key2']
}));


// Root Path
app.get("/", (req, res) => {
  const user = getUserFromReqs(req);

  if (!user) {
    return res.redirect("/login");
  }

  return res.redirect("/urls");
});

// Route to show URLs for User
app.get("/urls", (req, res) => {
  const user = getUserFromReqs(req);

  if (!user) {
    return res.send("<div>Please Login or Register to Continue</div>");
  }

  const userUrls = urlsForUser(req.session.user_id);

  const templateVars = {
    urls: userUrls,
    user: users[req.session.user_id],
  };

  res.render("urls_index", templateVars);
});

// Route to visit Create New URLs Page
app.get("/urls/new", (req, res) => {
  const user = getUserFromReqs(req);

  if (!user) {
    res.redirect("/login");
    return;
  }

  const templateVars = {
    user: user
  };

  res.render("urls_new", templateVars);
});

// Route to visit newly created URLs by logged in user
app.get("/urls/:id", (req, res) => {
  const user = getUserFromReqs(req);

  if (!user) {
    return res.send("Please login to view page");
  }

  if (urlDatabase[req.params.id].userID !== req.session.user_id) {
    return res.send("This user does not own this URL");
  }

  const longURL = urlDatabase[req.params.id].longURL;

  const templateVars = {
    id: req.params.id,
    longURL,
    user,
  };

  res.render("urls_show", templateVars);
});


app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});


app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

//Adds new URL to database 
app.post("/urls", (req, res) => {
  const user = getUserFromReqs(req);

  if (!user) {
    res.send("Please login!");
    return;
  }

  let randomID = generateRandomString(6);
  let longURL = req.body.longURL;
  let userID = req.session.user_id;

  urlDatabase[randomID] = { longURL, userID };

  res.redirect(`/urls/${randomID}`);
});

//Route to visit longURL 
app.get("/u/:id", (req, res) => {
  const urlObj = urlDatabase[req.params.id];

  if (!urlObj) {
    return res.send("Error no shortURL");
  }

  res.redirect(urlObj.longURL);
});

 
app.post("/urls/:id/delete", (req, res) => {
  if (!urlDatabase[req.params.id]) {
    res.status(400).send("The URL doesn't exist");
    return;
  }

  if (!req.session.user_id) {
    return res.status(401).send("User is not logged in");
  }

  if (urlDatabase[req.params.id].userID !== req.session.user_id) {
    return res.status(403).send("This user does not own this URL");
  }

  delete urlDatabase[req.params.id];
  res.redirect("/urls");
});

 
app.post("/urls/:id/", (req, res) => {
  urlDatabase[req.params.id].longURL = req.body.newURL;
  res.redirect("/urls");
});


app.post("/login", (req, res) => {
  const user = userLookup(req.body.email, users);
  const hash = bcrypt.hashSync("abcd", 10);

  if (!user) {
    return res.status(403).send("User does not exist");
  } 
  
  const compare = bcrypt.compareSync(req.body.password, user.password);

  if (!compare) {
    return res.status(403).send("Password is incorrect");
  } 

  req.session.user_id = user.id;
  res.redirect("/urls");

});

 
app.post("/logout", (req, res) => {
  res.clearCookie("session");
  res.redirect("/login");
});

// Route to register new user
app.get("/register", (req, res) => {
  const user = getUserFromReqs(req);

  if (user) {
    res.redirect("/urls");
    return;
  }

  const templateVars = {
    user: user
  };

  res.render("urls_register", templateVars);
});

 
app.post("/register", (req, res) => {
  
  if (req.body.email === "" || req.body.password === "") {
    return res.status(400).send("Email or Password empty");
  }

  let user = userLookup(req.body.email);

  if (user) {
    return res.status(400).send("Email already exists");
  }

  const randomUserId = generateRandomString(6);

  let newUser = {
    id: randomUserId,
    email: req.body.email,
    password: bcrypt.hashSync(req.body.password, 10)
  }

  users[randomUserId] = newUser;
  req.session.user_id = randomUserId;
  res.redirect("/urls");

});


app.get("/login", (req, res) => {
  let userCookie = req.session.user_id;

  if (userCookie) {
    res.redirect("/urls");
  } else {
    const templateVars = {
      user: users[req.session.user_id]
    };
    res.render("urls_login", templateVars);
  }
});


app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});







