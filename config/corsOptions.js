const allowedOrigins= require('./allowedOrigins');

const corsOptions = {
  origin: (origin, callback) => {
    if (allowedOrigins.indexOf(origin) !== -1  || !origin ) { // !origin for same-origin or server-to-server
      callback(null, true);
    } else {
    //! the callback calles the middleware that handels the errors (the one who had a hanller function with 4 parameters)
      callback(new Error('Not allowed by CORS'));
    }
  }
};

module.exports= corsOptions;