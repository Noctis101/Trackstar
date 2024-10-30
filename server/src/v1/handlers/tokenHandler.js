const jsonwebtoken = require('jsonwebtoken');
const User = require('../models/user');

const tokenDecode = (req) => {
  const bearerHeader = req.headers['authorization'];
  if (bearerHeader) {
    const bearer = bearerHeader.split(' ')[1];
    try {
      const tokenDecoded = jsonwebtoken.verify(
        bearer,
        process.env.TOKEN_SECRET_KEY
      );
      return tokenDecoded;
    } catch (error) {
      console.error('Error decoding token:', error.message);
      return false;
    }
  } else {
    console.error('Authorization header not found');
    return false;
  }
};

exports.verifyToken = async (req, res, next) => {
  const tokenDecoded = tokenDecode(req);
  if (tokenDecoded) {
    try {
      const user = await User.findById(tokenDecoded.id);
      if (!user) {
        console.error('User not found for token:', tokenDecoded.id);
        return res.status(401).json('Unauthorized');
      }
      req.user = user;
      next();
    } catch (error) {
      console.error('Error finding user:', error.message);
      res.status(500).json('Internal Server Error');
    }
  } else {
    console.error('Token not decoded');
    res.status(401).json('Unauthorized');
  }
};
