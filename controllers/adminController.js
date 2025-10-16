// adminController.js
const usersDB = {
  users: require('../model/users.json'),
  setUsers: function (data) { this.users = data }
};
const fsPromises = require('fs').promises;
const path = require('path');
const ROLES_LIST = require('../config/roles_list');

const updateUserRole = async (req, res) => {
  const { username, role } = req.body;

  if (!username || !role) return res.status(400).json({ message: 'Username and role are required' });

  const user = usersDB.users.find(u => u.username === username);
  if (!user) return res.status(404).json({ message: 'User not found' });

  user.roles = { [role]: ROLES_LIST[role] };
  usersDB.setUsers([...usersDB.users]);
  await fsPromises.writeFile(
    path.join(__dirname, '..', 'model', 'users.json'),
    JSON.stringify(usersDB.users)
  );

  res.status(200).json({ message: `Role updated to ${role}` });
};

module.exports = { updateUserRole };
