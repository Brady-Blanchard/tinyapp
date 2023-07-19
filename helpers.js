// function to check if an email is already attached to a user in the users database object
const getUserByEmail = function(email, database) {
  for (const userID in database) {
    const user = database[userID];
    if (user.email === email) {
      return user;
    }
  }
};

module.exports = {
  getUserByEmail
};
