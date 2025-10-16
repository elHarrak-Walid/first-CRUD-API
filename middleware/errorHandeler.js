const  {logEvents}=require('./logEvents');


const erroeHandeler = (err,req, res,next) => {
  logEvents(`err name: ${err.name} \t err message :${err.message}`,'errorLog.txt')
  res.status(500).send(err.message);
  
}

module.exports = erroeHandeler;