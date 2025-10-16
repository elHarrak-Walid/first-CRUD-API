//const fsPromises = require('fs').promises;
//const path = require('path');
const User = require('../model/user');

/*const usersDB = {
  users: require('../model/users.json'),
  setUsers: function(data) { this.users = data }
};*/

const handleLogout = async (req, res) => {
  const cookies = req.cookies;

  //! 1️⃣ Check if the cookie exists
  if (!cookies?.jwt) return res.sendStatus(204); //! No content — already logged out
  const refreshToken = cookies.jwt?.replace(/^<|>$/g, '');

  //! 2️⃣ Find user who owns this refresh token
 // const foundUser = usersDB.users.find(u => u.refreshToken === refreshToken);
//! When you do User.findOne(), Mongoose returns a document object that internally has: {
//! doc: { /* your raw data */ },
//! save: function() { ... },
//! remove: function() { ... },
//! ...
  const foundUser = await User.findOne({refreshToken}).exec();
 
  if (!foundUser) {
    //! No user owns it — maybe cookie already expired
    res.clearCookie('jwt', {  httpOnly: true, sameSite: 'lax', secure: false });
    return res.sendStatus(204);
  }

  //! 3️⃣ update  refresh token from user in the "database"
  //! methode 1

  foundUser.refreshToken="";
  const result= await foundUser.save();
    console.log(result);

   //usersDB.users = usersDB.users.map(u => {
  //if (u.refreshToken === refreshToken) {
   // return { ...u, refreshToken: '' }; /
  //}return u; // leave others unchanged});
   //! methode 2
  /*const otherUsers = usersDB.users.filter(u => u.refreshToken !== refreshToken);
  //! If you add a property after spreading, it overrides the previous value of that key.
  const currentUser = { ...foundUser, refreshToken: '' };
  usersDB.setUsers([...otherUsers, currentUser]);

  await fsPromises.writeFile(
    path.join(__dirname, '..', 'model', 'users.json'),
    JSON.stringify(usersDB.users)
  );*/

  //! 4️⃣ Clear the cookie from client browser
  res.clearCookie('jwt', { httpOnly: true, sameSite: 'lax', secure: false });

  // 5️⃣ Respond success
  res.sendStatus(204); // No content
};

module.exports = { handleLogout };
