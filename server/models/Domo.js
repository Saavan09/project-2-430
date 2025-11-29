const mongoose = require('mongoose');
const _ = require('underscore');

const setName = (name) => _.escape(name).trim();

// possible domo class names
const allowedClasses = ['Fighter', 'Tank', 'Healer', 'Debuffer'];

const DomoSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    set: setName,
  },
  age: {
    type: Number,
    min: 0,
    required: true,
  },
  classType: {
    type: String,
    trim: true,
    required: true,
  },
  owner: {
    type: mongoose.Schema.ObjectId,
    required: true,
    ref: 'Account',
  },
  createdDate: {
    type: Date,
    default: Date.now,
  },
});

DomoSchema.statics.toAPI = (doc) => ({
  name: doc.name,
  age: doc.age,
  classType: doc.classType,
});

const DomoModel = mongoose.model('Domo', DomoSchema);
DomoModel.allowedClasses = allowedClasses;
module.exports = DomoModel;
