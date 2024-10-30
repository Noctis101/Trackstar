const express = require('express');
const { body } = require('express-validator');
const userController = require('../controllers/user');
const User = require('../models/user');
const validation = require('../handlers/validation');
const tokenHandler = require('../handlers/tokenHandler');

const router = express.Router();

router.post(
  '/sign-up',
  [
    body('username')
      .isLength({ min: 7 })
      .withMessage('Username must be at least 7 characters')
      .custom(async (value) => {
        const user = await User.findOne({ username: value });
        if (user) {
          throw new Error('Username taken');
        }
      }),
    body('password')
      .isLength({ min: 7 })
      .withMessage('Password must be at least 7 characters'),
    body('confirmPassword')
      .isLength({ min: 7 })
      .withMessage('Confirm Password must be at least 7 characters')
      .custom(async (value, { req }) => {
        if (value !== req.body.password) {
          throw new Error('Passwords do not match');
        }
        return true;
      }),
  ],
  validation.validate,
  userController.register
);

router.post(
  '/login',
  [
    body('username')
      .isLength({ min: 7 })
      .withMessage('Username must be at least 7 characters'),
    body('password')
      .isLength({ min: 7 })
      .withMessage('Password must be at least 7 characters'),
  ],
  validation.validate,
  userController.login
);

router.post('/verify-token', tokenHandler.verifyToken, (req, res) => {
  res.status(200).json({ user: req.user });
});

module.exports = router;
