//! Login → Get accessToken + refreshToken
//! ↓
//! AccessToken used for protected requests
//! ↓
//! When accessToken expires (15 min)
//! ↓
//! Frontend detects 403 OR checks exp field
//! ↓
//! Send /refresh with refreshToken (in cookie)
//! ↓
//! Backend verifies refreshToken, returns new accessToken
//! ↓
//! Frontend retries request with new accessToken
const jwt = require('jsonwebtoken');
const User = require('../model/user');
const ROLES_LIST = require('../config/rolesListe');
/*const usersDB = {
  users: require('../model/users.json'),
  setUsers: function (data) { this.users = data }
};*/

const handelRefresh = async (req, res) => {
  const cookies = req.cookies;
  console.log("cookies", cookies);
  if (!cookies?.jwt) return res.sendStatus(401); //! no cookie, no refresh token Unauthorized

  const refreshToken = cookies.jwt?.replace(/^<|>$/g, '');
  console.log("refreshToken", refreshToken);


  //! ✅ Check if refresh token exists for a user in the DB
  //! This checks if the refresh token is one that the server issued and stored.
  //! If the user logged out, or if the token was stolen/revoked, it won’t be in the DB.
  //! → 403 Forbidden.
  //!On logout, you usually delete the refresh token from your database 
  //!This is called revocation. If you only used jwt.verify without checking the DB:
  //! That refresh token is still cryptographically valid until it expires.
  //! So the user (or an attacker who stole it) could still use it to get new access tokens.

  //const foundUser = usersDB.users.find(u => u.refreshToken === refreshToken);
  const foundUser = await User.findOne({refreshToken}).exec();
  console.log("foundUser", foundUser);

  if (!foundUser) return res.sendStatus(403); //! Forbidden — invalid refresh token

  //! ✅ Verify the refresh token
  jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (err, decoded) => {
    if (err || foundUser.username !== decoded.username)
      return res.sendStatus(403); //! token invalid or doesn't match user
    let roles = Object.values(foundUser.roles)
    //! ✅ Create a new access token
    if (foundUser.username === 'walid') {
            console.log("the user equale to walid")
            roles = [...new Set([...roles, ROLES_LIST.admin, ROLES_LIST.editor])];
          }
          console.log("roles", roles);
    const accessToken = jwt.sign(
      {
        "userInfo": {
          "username": decoded.username,
          "roles": roles
        }
      },

      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: '2m' }
    );

    res.json({ accessToken });
  });
}

module.exports = { handelRefresh }