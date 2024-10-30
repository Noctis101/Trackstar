const router = require('express').Router();
const { param } = require('express-validator');
const boardController = require('../controllers/board');
const validation = require('../handlers/validation');
const tokenHandler = require('../handlers/tokenHandler');

router.post(
  '/',
  tokenHandler.verifyToken,
  boardController.create
);

router.get(
  '/',
  tokenHandler.verifyToken,
  boardController.getAll
);

router.put(
  '/',
  tokenHandler.verifyToken,
  boardController.updatePosition
);

router.get(
  '/bookmarks',
  tokenHandler.verifyToken,
  boardController.getBookmarks
);

router.put(
  '/bookmarks',
  tokenHandler.verifyToken,
  boardController.updateBookmarkPosition
);

router.get(
  '/:boardId',
  param('boardId').custom(value => {
    if (!validation.isObjectId(value)) {
      return Promise.reject('Invalid id');
    } else return Promise.resolve();
  }),
  validation.validate,
  tokenHandler.verifyToken,
  boardController.getOne
);

router.put(
  '/:boardId',
  param('boardId').custom(value => {
    if (!validation.isObjectId(value)) {
      return Promise.reject('Invalid id');
    } else return Promise.resolve();
  }),
  validation.validate,
  tokenHandler.verifyToken,
  boardController.update
);

router.delete(
  '/:boardId',
  param('boardId').custom(value => {
    if (!validation.isObjectId(value)) {
      return Promise.reject('Invalid id');
    } else return Promise.resolve();
  }),
  validation.validate,
  tokenHandler.verifyToken,
  boardController.delete
);

module.exports = router;
