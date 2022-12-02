function generateRandomString(string) {
  let randomString = '';
  let characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  for (let i = 0; i < string; i++) {
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

// const userLookup = function (email, database) {
//   for (const info in users) {
//     // console.log(info);
//     if (email === users[info].email) {
//       return users[info];
//     }
//   }
//   return null;
// }

const getUserFromReqs = function (req) {
  const userId = req.session.user_id;
  const user = users[userId];
  if (!user) {
    return null;
  }
  return user;
}

const urlsForUser = function (id) {
  let urlResults = {};
  for (const urls in urlDatabase) {
    // console.log("This is for user URLS", urlDatabase[urls]);
    if (id === urlDatabase[urls].userID) {
      urlResults[urls] = urlDatabase[urls];
    }

  } 
  // console.log(urlResults);
  return urlResults;
}

const express = require("express");
const cookieSession = require('cookie-session');
const bcrypt = require("bcryptjs");
const { request } = require("express");
const userLookup = require('./helpers');
const app = express();
const PORT = 8080; // default port 8080
app.set("view engine", "ejs");

// const urlDatabase = {
//   "b2xVn2": "http://www.lighthouselabs.ca",
//   "9sm5xK": "http://www.google.com"
// };

const urlDatabase = {
  b6UTxQ: {
    longURL: "https://www.tsn.ca",
    userID: "aJ48lW",
  },
  i3BoGr: {
    longURL: "https://www.google.ca",
    userID: "aJ48lW",
  },
};

app.use(express.urlencoded({ extended: true }));
app.use(cookieSession({ 
  name: 'session',
  keys: ['key1, key2']
}));

app.get("/", (req, res) => {
  res.send("Hello!");
});
app.get("/urls", (req, res) => {
  const user = getUserFromReqs(req);
  if (!user) {
    res.send("Login or Register to view URLs")
    return
  }
  const userUrls = urlsForUser(req.session.user_id);
  const templateVars = {
    urls: userUrls,
    user: users[req.session.user_id],
  };
  res.render("urls_index", templateVars);
});
app.get("/urls/new", (req, res) => {
  const user = getUserFromReqs(req);
  // let userCookie = req.cookies.user_id;
  if (!user) {
    res.redirect("/login")
    return
  }
  const templateVars = {
    user: user
  };
  res.render("urls_new", templateVars);

});
app.get("/urls/:id", (req, res) => {
  // console.log(req.params.id);
  const user = getUserFromReqs(req);
  if (!user) {
    res.send("Please login to view page");
    // res.redirect("/login")
    return
  }
// console.log(urlDatabase[req.params.id]);
// console.log(req.cookies.user_id); 

if (urlDatabase[req.params.id].userID !== req.session.user_id) {
    return res.send("This user does not own this URL");
  }
  // console.log(urlDatabase[req.params.id]);
  // console.log({user});
  // console.log(req.params.id);
  const longURL = urlDatabase[req.params.id].longURL;
  const templateVars = {
    id: req.params.id,
    longURL: longURL,
    user: users[req.session.user_id]
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
  const user = getUserFromReqs(req);
  if (!user) {
    res.send("Please login!")
    return
  }
  let randomID = generateRandomString(6);
  let longURL = req.body.longURL;
  let userID = req.session.user_id;
  urlDatabase[randomID] = { longURL, userID };
  // console.log(urlDatabase[randomID]);
  // console.log({ longURL, userID });
  // res.send("Ok"); 
  res.redirect(`/urls/${randomID}`);
});
app.get("/u/:id", (req, res) => {
  const longURL = urlDatabase[req.params.id];
  if (!longURL) {
    res.send("Error no shortURL");
    return;
  }
 
  res.redirect(longURL);
});
app.post("/urls/:id/delete", (req, res) => {
  if (!urlDatabase[req.params.id]) {
    res.status(400).send("The URL doesn't exist")
    return;
  }
  if (!req.session.user_id) {
    return res.status(401).send("User is not logged in");
  }
  if (urlDatabase[req.params.id].userID !== req.session.user_id) {
    return res.status(403).send("This user does not own this URL");
  }
  delete urlDatabase[req.params.id];
  res.redirect("/urls")
})
app.post("/urls/:id/", (req, res) => {
  urlDatabase[req.params.id].longURL = req.body.newURL;
  res.redirect("/urls")
})
app.post("/login", (req, res) => {
  // console.log(req.body);
  const user = userLookup(req.body.email);
  console.log(user);
  console.log(bcrypt.compareSync(req.body.password, user.password))
  if (!user) {
    return res.sendStatus(403);
  } else if (bcrypt.compareSync(req.body.password, user.password)) {
    // console.log(users);
    req.session.user_id = user.id
    res.redirect("/urls");
  }
  else {
    return res.sendStatus(403);
  }
});
app.post("/logout", (req, res) => {
  res.clearCookie("session");
  res.redirect("/login")
})
app.get("/register", (req, res) => {
  const user = getUserFromReqs(req);

  // let userCookie = req.cookies.user_id;
  if (user) {
    res.redirect("/urls")
    return
  }
  const templateVars = {
    user: user
  };
  res.render("urls_register", templateVars);
});
app.post("/register", (req, res) => {
  let user = userLookup(req.body.email);
  console.log(user);

  if (req.body.email === "" || req.body.password === "") {
    // console.log("Email or Password empty")
    return res.send("Email or Password empty", 400);
  }
  if (user) {
    // console.log("Email already exists");
    return res.send("Email already exists", 400);
  }

  const randomUserId = generateRandomString(6);

  let newUser = {
    id: randomUserId,
    email: req.body.email,
    password: bcrypt.hashSync(req.body.password, 10)
  }
  // console.log(randomUserId);
  console.log("THIS IS FOR NEW USER", newUser);
  users[randomUserId] = newUser;
  console.log("THIS IS FOR USER", users);
  req.session.user_id = randomUserId;
  res.redirect("/urls");

})
app.get("/login", (req, res) => {
  let userCookie = req.session.user_id;
  if (userCookie) {
    res.redirect("/urls")
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







