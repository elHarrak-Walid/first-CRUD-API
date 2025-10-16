const jwt = require('jsonwebtoken');
//! veryfing he access token that sent from te frontend
function verifyJWT(req, res, next) {
    console.log('JWT middleware running...');
    //! we need to acces the  Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
    const authHeader = req.headers['authorization'];
    if (!authHeader) return res.sendStatus(401);
//!  [Bearer,eyJhbGciOiJIUzI1NiIs...]
    const token = authHeader.split(' ')[1];

//!  When the frontend sends a JWT to the server:
//!  The token looks like this: header.payload.signature
//!  The server takes the header and payload parts from the token you sent.
//!  It rebuilds a new signature using its secret key (process.env.ACCESS_TOKEN_SECRET):
//!  It then compares that newSignature to the signature part that came from your token.
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
         
        //! decoded = the payload (ex: { username: 'Walid', exp: 1234 })
        if (err) {
            console.log('JWT failed -> 403');
            return res.sendStatus(403);  } //! invalid token

//! The frontend does NOT send a user property.
//! The middleware creates it on the server side, from the JWT that was sent in the headers.
//! This is server-generated and guaranteed to be authentic (because the JWT was verified).
        req.user = decoded.userInfo.username; 
        req.roles = decoded.userInfo.roles; 
        next();  // continue to next middleware/route
    });
}

module.exports={verifyJWT}