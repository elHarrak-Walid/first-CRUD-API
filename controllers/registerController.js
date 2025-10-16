//const fsPromises = require('fs').promises;
//const path = require('path');
const bcrypt = require('bcrypt');
const User = require('../model/user');
/*const usersDB = {
  users: require('../model/users.json'),
  setUsers: function(data) { this.users = data }
}*/
const handleNewUser = async (req, res) => {
    const { user, pwd } = req.body;

    if (!user || !pwd) return res.status(400).json({ 'message': 'Username and password are required.' });
    //! check for duplicate usernames in the db
   // const duplicate = await usersDB.users.find(u => u.username === user).length > 0;
   //const duplicate = await usersDB.users.find(u => u.username === user).length > 0;
   const duplicate = await User.findOne({username:user}).exec();
if (duplicate) return res.status(409).json({'message': 'this name has already used'});
    //! encrypt the password
    try {
        const hashedPwd = await bcrypt.hash(pwd, 10);

    //! store the new user
    //! method 1
//const newUser = new User({ id: 123, username: user, password: hashedPwd });
// const result = await newUser.save();
    //! method 2
    const result=await User.create({id:123,username:user,password:hashedPwd});
    console.log(result);
    /*const newUsers = {
        "username": user,
        "pwd": hashedPwd,
      //! all the people who register will be given the user role
        "roles": {
            "user": 12700
        },
    };
    usersDB.setUsers([...usersDB.users, newUsers]);
    await fsPromises.writeFile(
        path.join(__dirname, '..', 'model', 'users.json'), JSON.stringify(usersDB.users)  );
        
        console.log(usersDB.users) ;*/

        res.status(201).json({ 'success': `New user ${user} created!` });
    } 
    
    catch (error) {
        res.status(500).json({'message': error.message})
    }
    
  

   
   
}

module.exports= {handleNewUser};

