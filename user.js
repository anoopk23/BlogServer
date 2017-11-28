// Dependencies
var express = require('express');
var restful = require('node-restful');
// var mongoose = restful.mongoose;
var mongoose = require('mongoose');

var userSchema   = new mongoose.Schema({

  username: {
    type: String,
    required: [true, "username is required."],
    unique: true
  },

  password: {
    type: String,
    validate: {
      validator: function(v) {
        return v.length >= 8
      },
      message: 'password should have atleast 8 characters!'
    }

  },

  email: {
    type: String,
    validate: {
      validator: function (v) {
        var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        return re.test(v);
      },
      message: 'email is invalid!'
    },
    unique: true
  },

  isAdmin: {
    type: Boolean,
    default: false
  }
});



module.exports = {
  "restful": restful.model('tbluser', userSchema),
  "mongoose": mongoose.model('tbluser', userSchema)
};
