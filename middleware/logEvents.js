const { format } = require('date-fns');
const { v4: uuid } = require('uuid');
const fs = require('fs');
const fsPromises = require('fs').promises;
const path = require('path');

const logEvents = async (message,fileName) => {
  const dateTime = `${format(new Date(), 'yyyyMMdd\tHH:mm:ss')}`;
  const logItem = `${dateTime}\t${uuid()}\t${message}\n`;
    console.log(logItem);

  try {
    if (!fs.existsSync(path.join(__dirname, '..','logs'))) {
      await fsPromises.mkdir(path.join(__dirname, '..','logs'));
    }

    await fsPromises.appendFile(
      path.join(__dirname, '..','logs', fileName),logItem);
  } catch (err) {
    console.error(err);
  }
};


const logger= (req,res,next)=>{
logEvents(`request url: ${req.url} \t request origin: ${req.headers.origin} \t request method: ${req.method}`,'reqLog.txt')
console.log(`request url: ${req.url} \t request method: ${req.method}`);
next();
}
module.exports = {logger, logEvents};