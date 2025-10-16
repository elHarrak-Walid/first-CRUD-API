const fsPromises = require('fs').promises;
const path = require('path');

const usersFile = path.join(__dirname, '..', 'model','users.json');

async function getUsers() {
  const data = await fsPromises.readFile(usersFile, 'utf8');
  return JSON.parse(data);
}

async function setUsers(users) {
  await fsPromises.writeFile(usersFile, JSON.stringify(users, null, 2));
}

module.exports = { getUsers, setUsers };
