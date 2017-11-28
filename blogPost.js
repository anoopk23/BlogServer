// Dependencies
var express = require('express');
var restful = require('node-restful');
// var mongoose = restful.mongoose;

var mongoose = require('mongoose');

var blogPostSchema   = new mongoose.Schema({

  blog: String,

  date: {
    type: Date,
    default: Date.now
  },

  title: String,

  content: String,


  likes:
    {
      type: Number,
      default: 0
    }


},
  {toObject: {virtuals:true}, toJSON: {virtuals: true} });

// blogPostSchema.virtual()

// foriegn key definitions
blogPostSchema.virtual('parentBlog', {
  ref: 'tblblog',
  localField: 'blog',
  foreignField: 'name',
  justOne: true // for many-to-1 relationships
});

module.exports = {
  "restful": restful.model('tblblogpost', blogPostSchema),
  "mongoose": mongoose.model('tblblogpost', blogPostSchema)
};
