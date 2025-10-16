const User = require('../model/user');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
// const { getUsers, setUsers } = require('../config/usersDB');
const ROLES_LIST = require('../config/rolesListe');
//const usersDB = {
//users: require('../model/users.json'),
//setUsers: function (data) { this.users = data } }

const handleLogin = async (req, res) => {
  const { user, pwd } = req.body;

  //! 1️⃣ Check if username and password are provided
  if (!user || !pwd) {
    return res.status(400).json({ 'message': 'Username and password are required.' });
  }

  //! 2️⃣ Find the user in the database
  // const users = await getUsers();

  //! foundUser points to the same memory location as the first object in users.
  //! They are not separate copies — they are two references to the same object. 
  //! it modifies the object inside users directly.
  // const foundUser = users.find(u => u.username === user);
  const foundUser = await User.findOne({ username: user }).exec();


  if (!foundUser) return res.status(401).json({ 'message': 'No user with this name' }); //! Unauthorized

  try {
    //! 3️⃣ Compare input password with hashed password stored
    const match = await bcrypt.compare(pwd, foundUser.password);
    if (match) {

      //! Generate tokens
      //! Why JWT uses Base64URL
      //! JWTs contain more than just readable text:
      //! Header: { alg: "HS256", typ: "JWT" } → text
      //! Payload: { username: "Walid", iat: 1738812660 } → includes numbers
      //! Signature: cryptographic hash → binary data
      //! HTTP/JSON can send text safely, but binary data like the signature cannot travel raw.
      //! ✅ So we Base64URL-encode each part to make it text-safe.
      //! Now all three parts (header.payload.signature) can travel over HTTP safely.
      //! When the server receives it, it decodes back to binary to verify the signature.

      //! 3️⃣  dynamically give specific users extra roles
      //! Why overwriting roles at every login is bad : It changes data too often — login should not modify your database unless necessary.
      //! It can cause race conditions if multiple logins happen fast.
      //!It mixes authentication (verifying identity) with authorization (managing user roles). Those are two separate responsibilities.
      /*if (foundUser.username === 'walid') {
        const newRoles = ['admin', 'editor']; 

        newRoles.forEach(role => {
          foundUser.roles[role] = ROLES_LIST[role]; // assign from the role list
        });

        const result = await foundUser.save();
        console.log(result);
      }*/

      let roles = Object.values(foundUser.roles)
      //! The schema defines only three fields inside roles:
      //! roles: {User: { type: Number, default: 12700 },Admin: Number,Editor: Number}
      //! In the database, your user only has "User": 12700 stored.When you do: 
      //! let roles = Object.values(foundUser.roles)
      //!  Mongoose converts that to [12700, undefined, undefined], but JavaScript drops trailing undefineds, so you see [12700, undefined].
      if (foundUser.username === 'walid') {
        console.log("the user equale to walid")
        roles = [...new Set([...roles, ROLES_LIST.admin, ROLES_LIST.editor])];
      }
      console.log("roles", roles);
      const accessToken = jwt.sign(
        {
          "userInfo": {
            "username": user,
            "roles": roles
          }
        },
        process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: '2m' }
      );

      const refreshToken = jwt.sign(
        { "username": user },
        process.env.REFRESH_TOKEN_SECRET,
        { expiresIn: '1d' }
      );

      //! create a refreshToken property in the founded user object and set it
      //! methode 1 (better)
      //usersDB.setUsers(
      //usersDB.users.map(u =>
      //u.username === foundUser.username ? { ...u, refreshToken } : u ));
      //! this line { ...u, refreshToken } is equale to {username: u.username,pwd: u.pwd,refreshToken: refreshToken}

      //! methode 2
      foundUser.refreshToken = refreshToken;
      const result = await foundUser.save(); //! ✅ Updates the refreshToken in the "users" array
      console.log(result);

      //! persist changes (e.g., write to DB/file) (not nesscairy the line above already changed the array )
      // usersDB.setUsers([...usersDB.users]);

      //! persist refresh token to users.json
      //! methode 1
      // await fsPromises.writeFile(
      //path.join(__dirname, '..', 'model', 'users.json'),
      //JSON.stringify(usersDB.users, null, 2) // formatted for readability );
      //! methode 2
      //await setUsers(users);

      //! send refresh token in HttpOnly cookie
      //! Once the cookie is set with res.cookie(), the browser automatically includes it in future requests to the same domain.
      //! You don’t need to manually add it to headers or request bodies.
      //! So if your cookie is named jwt, every request to your backend will include it in the HTTP headers like this:
      res.cookie('jwt', refreshToken, {
        httpOnly: true,
        sameSite: 'lax',
        secure: false,//! only https
        maxAge: 24 * 60 * 60 * 1000
      });

      //! ✅ Password is correct so sent the accessToken 
      //! If you send the access token in an HttpOnly cookie:
      //! The frontend can’t read it (so it can’t add Authorization: Bearer <token> headers).
      //! The only way to use it is to rely on the browser automatically including it in every request — like a session cookie.
      res.status(200).json(
        {
          success: `${foundUser.username} logged in!`,
          accessToken
        });
    } else {
      //! ❌ Password is incorrect
      res.status(401).json({ 'message': ' Incorrect Password ' }); //! Unauthorized
    }
  } catch (error) {
    res.status(500).json({ 'message': error.message });
  }
}

module.exports = { handleLogin };
