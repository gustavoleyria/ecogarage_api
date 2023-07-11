const { Schema, model } = require("mongoose");

const userSchema = new Schema({
  email: {
    type: String,
    required: true,
    unique: true,
  },
  cellphone:{
    type: String,
    required: true,
    unique: true
  },
  role: {
    type: String,
    enum: ["ADMIN", "OPERATOR", "BLOCKED"],
    default: "OPERATOR"
  },
  avatar: {
    type: String,
    default: "defaultUsers.png",
  },
  password: {
    type: String,
    required: true,
    minlength: 5,
    maxlength: 100
    // match: /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])[\w.$!@#%&]{5,10}$/,    
  },
  created_at: {
    type: Date,
    default: Date.now,
  },
});

const User = model("User", userSchema, "users");

module.exports = User;
