const router = require('express').Router({ mergeParams: true });
const { param } = require('express-validator');
const sectionController = require('../controllers/section');
const validation = require('../handlers/validation');

router.post(
  '/',
  param('boardId').custom(value => {
    if (!validation.isObjectId(value)) {
      return Promise.reject('Invalid id');
    } else return Promise.resolve();
  }),
  validation.validate,
  sectionController.create
);

router.put(
  '/:sectionId',
  param('boardId').custom(value => {
    if (!validation.isObjectId(value)) {
      return Promise.reject('Invalid boardId');
    } else return Promise.resolve();
  }),
  param('sectionId').custom(value => {
    if (!validation.isObjectId(value)) {
      return Promise.reject('Invalid sectionId');
    } else return Promise.resolve();
  }),
  validation.validate,
  sectionController.update
);

router.delete(
  '/:sectionId',
  param('boardId').custom(value => {
    if (!validation.isObjectId(value)) {
      return Promise.reject('Invalid boardId');
    } else return Promise.resolve();
  }),
  param('sectionId').custom(value => {
    if (!validation.isObjectId(value)) {
      return Promise.reject('Invalid sectionId');
    } else return Promise.resolve();
  }),
  validation.validate,
  sectionController.delete
);

module.exports = router;
