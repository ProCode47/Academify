const jwt = require('jsonwebtoken');
const config = require('../config/config')
//import jwt from 'jsonwebtoken'; 

const generateToken = (res, username) => {
  const expiration =  86400000;
  const token = jwt.sign({ username }, config.secretKey, {
    expiresIn: 86400000,
  });
  return res.cookie('yotalk_token', token, {
    expires: new Date(Date.now() + expiration),
    secure: true, // set to true if you're using https
    httpOnly: false,
  }).json({status:"Logged In", username, token});
};
module.exports = generateToken
