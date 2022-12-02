module.exports = {
  userLookup: function(email, database) {
    for (const info in database) {
      // console.log(info);
      if (email === database[info].email) {
        return database[info];
      }
    }
    return null;
  },
};



