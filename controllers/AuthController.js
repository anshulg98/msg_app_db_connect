const User = require("../models/user");
const Token = require("../models/token");
const bcrypt = require('bcryptjs');
const jwt = require("jsonwebtoken");
const { ACCESS_TOKEN_SECRET, REFRESH_TOKEN_SECRET } = process.env;
//const {regVal, logVal, changePass, read} = require ('../validate')

exports.signup = async (req, res) => {
  try {
    

    // const {error, value}= regVal(req.body);

    // if (error){ console.log(error);
    //  return res.status(400).send(error.details[0].message);}


    //check if username is already taken:
    let reguser = await User.findOne({ username: req.body.username });
    if (reguser) {
      return res.status(400).json({ error: "Username taken." });
    } 
    // else if (req.body.confirm_password!= req.body.password){
    //     return res.json({error:"Pasword and Confrim Password donot match"});
    // }
        
      const user = new User({
        name: req.body.name,
        username:req.body.username,
        email: req.body.email,
        password: req.body.password,
        confirm_password: req.body.confirm_password,
        role: req.body.role
    });

    const saveuser= await user.save();
    res.send({saveuser});

    
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal Server Error!" });
  }
};
exports.login = async (req, res) => {
  try {
    const {username, password} = req.body;

    // const {error, value}= logVal(req.body);
    // if (error){ console.log(error);
    //     return res.status(400).send(error.details[0].message);}
    //check if user exists in database:
    let userr = await User.findOne({ username });
    //send error if no user found:
    console.log(userr)
    if (!userr) {
      return res.status(404).json({ error: "No user found!" });
    } else {
      //check if password is valid:
      const valid = await bcrypt.compare(password, userr.password);
      if (valid) {
        //generate a pair of tokens if valid and send
        let accessToken = await userr.createAccessToken();
        let refreshToken = await userr.createRefreshToken();
        await User.findByIdAndUpdate(userr._id, { $set: { flag: true } });

        return res.status(201).json({ accessToken, refreshToken });
      } else {
        //send error if password is invalid
        return res.status(401).json({ error: "Invalid password!" });
      }
    }
    

  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal Server Error!" });
  }
};
exports.generateRefreshToken = async (req, res) => {
  try {
    //get refreshToken
    const { refreshToken } = req.body;
    //send error if no refreshToken is sent
    if (!refreshToken) {
      return res.status(403).json({ error: "Access denied,token missing!" });
    } else {
      //query for the token to check if it is valid:
      const tokenDoc = await Token.findOne({ token: refreshToken });
      //send error if no token found:
      if (!tokenDoc) {
        return res.status(401).json({ error: "Token expired!" });
      } else {
        //extract payload from refresh token and generate a new access token and send it
        const payload = jwt.verify(tokenDoc.token, REFRESH_TOKEN_SECRET);
        const accessToken = jwt.sign({ user: payload }, ACCESS_TOKEN_SECRET, {
          expiresIn: "10m",
        });
        return res.status(200).json({ accessToken });
      }
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal Server Error!" });
  }
};
exports.logout = async (req, res) => {
  try {
    //delete the refresh token saved in database:
    const { refreshToken } = req.body; //req.header("x-auth-token");
    await Token.findOneAndDelete({ token: refreshToken });
    return res.status(200).json({ success: "User logged out!" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal Server Error!" });
  }
};
exports.list=async(req,res)=>{
  try{
    let userlst= await User.find({},{_id:0,username:1, flag:1,id:1,active:1, image:1})
    return res.status(201).json({userlst})
  }
  catch(error){
    console.log(error);
    return res.status(500).json({ error: "Internal Server Error!" });
  }
};