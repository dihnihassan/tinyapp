const users = {
  userRandomID: {
    id: "userRandomID",
    email: "a@a.com",
    password: "$2a$10$cekwe.p9kLWj7e5xqYjwV.7EHFf7fXovHeODY031smFqWrh5ldAxm",
  },
  user2RandomID: {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk",
}
};

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


const userLookup = function(email) {
  for (const info in users) {
    // console.log(info);
    if (email === users[info].email) {
      return users[info];
    }
  }
  return null;
};

const generateRandomString = function(str) {
  let randomString = ''
  let characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  for (let i = 0; i < str; i++) {
    randomString += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return randomString;
};

const getUserFromReqs = function(reqObj) {
  const userId = reqObj.session.user_id;
  const user = users[userId];
  if (!user) {
    return null;
  }
  return user;
};

const urlsForUser = function(id) {
  let urlResults = {};
  for (const urls in urlDatabase) {
    if (id === urlDatabase[urls].userID) {
      urlResults[urls] = urlDatabase[urls];
    }

  }
  return urlResults;
};


module.exports = {
  users,
  urlDatabase,
  userLookup,
  generateRandomString,
  getUserFromReqs,
  urlsForUser
};


