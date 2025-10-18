
//! require('dotenv') loads the dotenv package. 
//! .config() reads your .env file automatically and loads all the KEY=VALUE pairs into process.env, which is a built-in Node.js object.
require('dotenv').config();
const {logger} = require('./middleware/logEvents');
const errorHandeler = require('./middleware/errorHandeler');
const credentials =require('./middleware/credentials');
const { verifyJWT } = require('./middleware/verifyJWT');
const cors=require('cors')
const path = require('path');
const express = require('express');
const app= express();
const PORT = process.env.PORT || 3500;
const corsOptions = require('./config/corsOptions')
const mongoose=require("mongoose")
const connectDB = require('./config/dbConn')
connectDB();

//! we use the credential  midllware (jobe setting the  'res.header("Access-Control-Allow-Credentials",true'  for the allowedOrigins ) 
//! before the cors don't trow an error
app.use(credentials)

//! using cors middleware (details in the nodjs cours) 
app.use(cors(corsOptions));

//?===================================================================================================================================
//?===================================================================================================================================
//! costum requests logger middleware  handeler
app.use(logger);

//?===================================================================================================================================
//?===================================================================================================================================
//! built-in middleware of express for  urlencoded (form data)
app.use(express.urlencoded({ extended: true }));

//! serve static files
app.use('/',express.static(path.join(__dirname, 'public')));
app.use('/subdir',express.static(path.join(__dirname, 'public')));

//! built-in middleware of express 
app.use(express.json());
app.use(require('cookie-parser')());
//! applies logger middleware to ALL requests starting with /api
//! GET /api/users, POST /api/orders, etc.
//app.use('/api', logger);  

//?===================================================================================================================================
//?===================================================================================================================================
//! routing 
//! " Whenever a request starts with /employees, pass control to whatever is exported from ./routes/apis/employees."
//! Full workflow for GET http://localhost:3500/employees/2 : 
// //! the Request comes in: GET /employees/2. then Express checks middlewares in order.
//! It finds: app.use('/employees', router). ✅ URL starts with /employees, so this router will handle it.
//! It “strips” the prefix (/employees) before passing control to the router. Inside the router, the remaining path is just /2.
//! Router checks its rules:
//! Does / match? ❌ No.
//! Does /:id match? ✅ Yes (id=2).
//!Calls the controller:
//? views
app.use('/',require('./routes/root'));
app.use('/subdir',require('./routes/subdir'));
//? API's
app.use('/register',require('./routes/apis/register'));
app.use('/auth',require('./routes/apis/auth'));
app.use('/refresh', require('./routes/apis/refresh'));
app.use('/logout', require('./routes/apis/logout'));
// app.use(verifyJWT);
app.use('/employees',verifyJWT,require('./routes/apis/employees'));




//?===================================================================================================================================
//?===================================================================================================================================
//!  '*' → means If a request didn’t match any of my earlier routes, catch it here
//! methode 1:
app.get(/.*/,(req, res)=>{   
res.status(404).sendFile('./view/404.html',{root:__dirname})
console.log(`request url: ${req.url} \trequest method :${req.method}`)});

//! Using Express middleware "app.use" as part of the routing system like app.get, app.post, etc. (as fallback) 
//! but is usually intended for middleware, not routing.
//! methode 2:
/*app.use((req, res) => {
  res.status(404).sendFile('./view/404.html', { root: __dirname });
  console.log(`request url: ${req.url} \t request method: ${req.method}`);
});*/

//! Using Express middleware "app.all" as part of the routing system 
//!  the Purpose: Define a route handler for all HTTP methods on a given path.
//! It’s part of the routing system (like app.get, app.post, etc.), but instead of just GET or POST, it matches all. and Supports regex:
//! Why this is useful?
//! req.accepts() checks what the client prefers.
//! Because different clients want different response formats:
//! Browsers expect HTML → get 404.html.
//! API clients expect JSON → get { "error": "404 Not Found" }.
//! CLI tools like curl usually work best with plain text.
//! methode 3:
app.all(/.*/, (req, res) => {
  res.status(404);

  if (req.accepts('html')) {
    res.sendFile(path.join(__dirname, 'view', '404.html'));
  } 
  else if (req.accepts('json')) {
    res.json({ error: '404 Not Found' });
  } 
  else {
    res.type('txt').send('404 Not Found');
  }
});

//! we cannot use "app.use" because it not support  regex for the path (only string prefixes like /api).
//!  Usually used for “apply this middleware for all requests starting with this path”.
//! applies logger middleware to ALL requests starting with /api
//! GET /api/users, POST /api/orders, etc.
//! exmaple app.use('/api', logger);  
//?===================================================================================================================================
//?===================================================================================================================================


//! costum error handeler middleware  
app.use(errorHandeler);

//! lestining to an the open event emmited from mongoose when the conection happen then we start the server
mongoose.connection.once("open",()=>{
  console.log('Connected to MongoDB database:', mongoose.connection.name);
  //! Express : “Okay, I’ll start the real HTTP server and begin accepting requests. I already know what to do for each route because you registered them earlier.”
  app.listen(PORT, '0.0.0.0',() => console.log(`Server running on port ${PORT}`));
})

//res.sendFile(path.join(__dirname, 'view','index.html') )});