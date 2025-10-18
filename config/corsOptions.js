const allowedOrigins= require('./allowedOrigins');

const corsOptions = {
  origin: (origin, callback) => {
    // ✅ Allow requests with no origin (like mobile apps or curl)
    if (!origin) return callback(null, true);

    // ✅ Always allow localhost or 127.0.0.1 (any port)
    if (origin.startsWith('http://localhost:') || origin.startsWith('http://127.0.0.1:')) {
      return callback(null, true);
    }

    // ✅ Allow your production origins
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    // ❌ Otherwise, reject
    callback(new Error('Not allowed by CORS'));
  },
  credentials: true, // if you use cookies or tokens
};

/*const corsOptions = {
  origin: (origin, callback) => {
    if (allowedOrigins.indexOf(origin) !== -1  || !origin ) { // !origin for same-origin or server-to-server
      callback(null, true);
    } else {
    //! the callback calles the middleware that handels the errors (the one who had a hanller function with 4 parameters)
      callback(new Error('Not allowed by CORS'));
    }
  }
};*/

module.exports= corsOptions;