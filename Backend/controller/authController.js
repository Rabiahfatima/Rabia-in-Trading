const Joi = require("joi");
const User = require("../models/user");
const bcrypt = require("bcryptjs");
const UserDto = require('../dto/user');
const JWTService = require('../services/JWTServices')
const RefreshToken = require('../models/JWT');
const user = require("../models/user");
const auth = require("../middleware/auth");

const passwordPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,25}$/;

const authController = {
  // Register
  async register(req, res, next) {
    // 1 Validate user input
    const userRegisterSchema = Joi.object({
      name: Joi.string().max(30).required(),
      username: Joi.string().min(4).max(30).required(),
      email: Joi.string().email().required(),
      password: Joi.string().pattern(passwordPattern).required(),
      confirmpassword: Joi.ref("password"),
    });
    // 2 validation error
    const { error } = userRegisterSchema.validate(req.body);
    if (error) {
      return next(error);
    }
    // 3 email/username exist
    const { email, name, username, password } = req.body;
    try {
      const emailInUse = await User.exists({ email });
      const userNameInUse = await User.exists({ username });
      if (emailInUse) {
        const error = {
          status: 401,
          message: "Email already in use",
        };
        return next(error);
      }
      if (userNameInUse) {
        const error = {
          status: 402,
          message: "UserName already in use",
        };
        return next(error);
      }
    } catch (error) {
      return next(error);
    }
    // 4 Hash password
    const hashedpassword = await bcrypt.hash(password, 10);
    //  5 Store data in DB
    let accessToken ;
    let refreshToken;
    let user;
   try{
    const userInDB = new User({
      name,
      email,
      username,
      password: hashedpassword,
    });

    user = await userInDB.save();

    accessToken = JWTService.accessToken({_id: user._id}, '30m')
    refreshToken = JWTService.refreshToken({_id: user._id}, '60m')

    // Store refreshTken in DB
   await JWTService.saveRefreshToken(refreshToken, user._id) 

   }catch(error){ return next(error)}

   res.cookie('accessToken', accessToken, {
    maxAge: 1000 *60 *60 *24,
    httpOnly: true
   })

   res.cookie('refreshToken', refreshToken, {
    maxAge: 1000 *60 *60 *24,
    httpOnly: true
   })

    // 6 Send responce
    return res.status(201).json({ user, auth: true });
  },




  async login(req, res, next) {
    // 1 Validate User
    const userLoginSchema = Joi.object({
      username: Joi.string().max(30).required(),
      password: Joi.string().pattern(passwordPattern),
    });
    // 2 Error if validation isSecureContext
    const { error } = userLoginSchema.validate(req.body);
    if (error) {
      return next(error);
    }
    // 3 match username & password
    const { username, password } = req.body;
    let user;
    try {
       user = await User.findOne({ username });
      if (!user) {
        const error = {
          status: 401,
          message: "Invalid Username!",
        };
        return next(error);
      }
    } catch (error) {
      return next(error);
    }
    // 4 match password
    try{
        const match = await bcrypt.compare(password, user.password)
        if(!match){
            const error ={
                status: 401,
                message: "Invalid Password!"
            }
            return next(error)
        }

    }catch(error){ return next(error)}

    // Cookie
    accessToken = JWTService.accessToken({_id: user._id}, '30m')
    refreshToken = JWTService.refreshToken({_id: user._id}, '60m')

    // Update refresh token
    try{
      await RefreshToken.updateOne({
         _id: user._id,
      },
      {token: refreshToken}
    )
    }catch(error){ return next(error)}
    
   res.cookie('accessToken', accessToken, {
    maxAge: 1000 *60 *60 *24,
    httpOnly: true
   })

   res.cookie('refreshToken', refreshToken, {
    maxAge: 1000 *60 *60 *24,
    httpOnly: true
   })

    // 5 send response
    const UserDtos = new UserDto(user)
    return res.status(200).json({user: UserDtos, auth: true})


  },




  async logout(req, res, next) {
    console.log(req.user)
    // 1 dlt refresh token
    const { refreshToken } = req.cookies
    try{
      await RefreshToken.deleteOne({token: refreshToken})
    }catch(error){ return next(error)}

    res.clearCookie('accessToken');
    res.clearCookie('refreshToken');
    // 2 send respnse
    return res.status(200).json({user: null, auth: false})
  },


  async refresh(req, res, next){
    // 1 get refresh token
    const originalRefreshToken = req.cookies.refreshToken
    // 2 verify refresh token
    let id;
    try{
      id = JWTService.verifyRefreshToken(originalRefreshToken)._id
    }catch(e){
      const error={
        status: 401,
        message:"Invalid"
      }
      return next(error)
    }

    try{
      const match = RefreshToken.findOne({_id: id, token: originalRefreshToken})
      if(!match){
        const error={
          status: 401,
        message:"Invalid"
        }
        return next(error)
      }
    }catch(error){return next(error)}
    // 3 generate new token
    try{
      const accessToken = JWTService.accessToken({_id: id}, '30m')
    const refreshTken = JWTService.refreshToken({_id: id}, '30m')
    await RefreshToken.updateOne({_id: id}, {token: refreshTken})

    // 4 update DB / response
    res.cookie('accessToken', accessToken, {
      maxAge: 1000* 60*60*24,
      httpOnly: true
    });
    res.cookie('refreshToken', refreshTken, {
      maxAge: 1000* 60*60*24,
      httpOnly: true
    });

    }catch(error){returnnext(error)}

    const user =await User.findOne({_id: id})
      const userDto= new UserDto(user)
    res.status(200).json({user: userDto, auth: true})

  }

};
module.exports = authController;
