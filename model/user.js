const mongoose = require('mongoose');
const schema = mongoose.Schema
const userSchema = schema({
   username: { type: String, required: true }, 
    roles: {
        User: {type: Number, default: 12700},
        Admin: Number,
       Editor: Number,
         },
        password: { type: String, required: true },
        refreshToken:String
})

module.exports = mongoose.model("User", userSchema )