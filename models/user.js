const { number } = require('joi');
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const Token = require("./token");
const { ACCESS_TOKEN_SECRET, REFRESH_TOKEN_SECRET } = process.env;

//define schema
const userSchema = new mongoose.Schema({
 name:{
        type: String,
        required: true,
        minimum:6,
        
    }, 
  username: { 
    type: String, 
    required: true, 
    unique: true 
},
  email:{
    type: String,
    required: true,
    minimum:6,
    unique:true
},
  password: { 
    type: String, 
    required: true,
    minimum:6
},

role:{
    type: String,
    maximum: 1
},
flag:{
    type: Boolean,
    default: false
}

});

//define schema level methods to create access token and refresh token:
userSchema.methods = {
  createAccessToken: async function () {
    try {
      let { _id, username } = this;
      let accessToken = jwt.sign(
        { user: { _id, username } },
        ACCESS_TOKEN_SECRET,
        {
          expiresIn: "10m",
        }
      );
      return accessToken;
    } catch (error) {
      console.error(error);
      return;
    }
  },
  createRefreshToken: async function () {
    try {
      let { _id, username } = this;
      let refreshToken = jwt.sign(
        { user: { _id, username } },
        REFRESH_TOKEN_SECRET,
        {
          expiresIn: "1d",
        }
      );

      await new Token({ token: refreshToken }).save();
      return refreshToken;
    } catch (error) {
      console.error(error);
      return;
    }
  },
};

//pre save hook to hash password before saving user into the database:
userSchema.pre("save", async function (next) {
  try {
    const salt = await bcrypt.genSalt(10); // generate hash salt of 12 rounds
    let hashedPassword = await bcrypt.hash(this.password, salt); // hash the current user's password
    this.password = hashedPassword;
  } catch (error) {
    console.error(error);
  }
  return next();
});

module.exports = mongoose.model("User", userSchema);