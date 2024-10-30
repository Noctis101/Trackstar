const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const { schemaOptions } = require('./schemaOptions');

const sectionSchema = new Schema({
  board: {
    type: Schema.Types.ObjectId,
    ref: 'Board',
    required: true
  },
  icon: {
    type: String,
    default: '📃'
  },
  title: {
    type: String,
    default: ''
  }
}, schemaOptions);

module.exports = mongoose.model('Section', sectionSchema);