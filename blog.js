// Dependencies
var express = require('express');
var restful = require('node-restful');

// var mongoose = restful.mongoose;
var mongoose = require('mongoose');
var blogSchema   = new mongoose.Schema({

  name: {
    type: String,
    validate: {
      validator: function(v) {
        var regexp = /^\s*\S+\s*$/;
        return regexp.test(v)
      },
      message: "name should not contain spaces"
    },
    unique: true
  },

  title: {
    type: String,
    default: "Untitled"
  },

  about: {
    type: String,
    default: ""
  },

  category: {
    type: String,
    enum: ['Technology', 'Music', 'Celebrity', 'TV', 'Fun'],
    required: [true, "category is required and should be one of 'Technology', 'Music', 'Celebrity', 'TV' or 'Fun'"]
  },

  user: { type: mongoose.Schema.Types.ObjectId, ref: 'tbluser' },

  blogPosts: {
    type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'tblblogpost' }],
    default: []
  },

  followers: {
    type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'tblblog' }],
    default: []
  },

  following: {
    type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'tblblog' }],
    default: []
  },

  date: {
    type: Date,
    default: Date.now
  }

});

// blogSchema.set('toObject', {virtuals: true});
// blogSchema.set('toJSON', {virtuals: true});
//
// // foriegn key definitions
// blogSchema.virtual('posts', {
//   ref: 'tblblogpost',
//   localField: 'blogPosts',
//   foreignField: 'blog',
//   justOne: true // for many-to-1 relationships
// });


module.exports = {
  "restful": restful.model('tblblog', blogSchema),
  "mongoose": mongoose.model('tblblog', blogSchema)
};
