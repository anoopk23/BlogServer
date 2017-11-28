var express = require('express');
var router = express.Router();


//blogs will have only get. "put" will be done while "post"-ing in blogPosts
//post is custom defined in index.js
var blogs = require('./blog').restful;
blogs.methods(['get', 'delete']);
blogs.register(router, '/blogs');
console.log('blog regestered at "/blogs"');

var blogPosts = require('./blogpost').restful;
blogPosts.methods(['get', 'put', 'delete']);
blogPosts.register(router, '/blogposts');
console.log('blogPost regestered at "/blogposts"');

var users = require('./user').restful;
users.methods(['get', 'put', 'post', 'delete']);
users.register(router, '/users');
console.log('user regestered at "/users"');

module.exports =
  {
    router: router,
    blogs: blogs,
    blogPosts: blogPosts,
    users: users
  };
