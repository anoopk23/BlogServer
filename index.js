// Dependencies
var express = require('express');
var mongoose = require('mongoose');
var bodyParser = require('body-parser');
var fs = require('fs');
var path = require("path");

var api = require('./api');


var blogs = api.blogs;
var blogPosts = api.blogPosts;
var users = api.users;

var upload_image = require("./image_upload.js");

const name = 'app';


//API list:
// add new blog: POST @ /api/blogs (will also add user)
// get a blog with id: GET @ /api/blogs/:id
// change a blog with id: PUT @ /api/blogs/:id (can only change following and title)
// to get the followers, following and posts of blog with id: GET @ /api/blogs/:id/<x>
// to add the blogPosts: POST @ /api/blogposts
// default put for blogposts
// to get parent blog of blogpost with id: GET @ /api/blogposts/:id/blog (response is deep populated blog)


// Mongo DB
mongoose.connect('mongodb://anoop.k2310:qwerty123@ds161455.mlab.com:61455/blog-app-db', function(err) {

  if (err) {
    console.log('error connecting db with following error:');
    console.log(err);
  }
  else{
    console.log('connected to db');
  }
});

// Express
var app = express();
// Add headers
app.use(function (req, res, next) {

  // Website you wish to allow to connect
  res.setHeader('Access-Control-Allow-Origin', 'http://localhost:4200');

  // Request methods you wish to allow
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');

  // Request headers you wish to allow
  res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');

  // Set to true if you need the website to include cookies in the requests sent
  // to the API (e.g. in case you use sessions)
  res.setHeader('Access-Control-Allow-Credentials', true);

  // Pass to next layer of middleware
  // console.log('header below:');
  // console.log(res);
  next();
});

app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());


//blogSchema routes
// req.body = {user, blog(without-user-property)}

// {
//   "user" : {
//   "username": "vincent",
//     "password": "qwerty123",
//     "email" : "v@q.com"
//   },
//   "blog" : {
//   "name" : "poptv",
//     "category": "TV"
//   }
// }
app.route('/api/blogs')

  .get(function(req, res) {
    blogs.find({})
      .populate('user')
      .exec(function (err, blogs) {
        if(err)
          res.json(err)
        else
          res.json(blogs);
      })
  })
  .post(function (req, res) {
    var resp = {};
    // console.log(req.body.user);
    var user = new users(req.body.user);
    // users.create(req.body.user, function (err, doc) {
    //   if(err)
    //     res.json(err);
    //   else {
    //     //user doc is created. Now create blog doc
    //     var blog = req.body.blog;
    //     blog.user = (doc._id);
    //     // console.log(doc);
    //     blogs.create(blog, function (err, blog_doc) {
    //       // blog_doc is created
    //       if(err)
    //         res.json(err);
    //       else {
    //         res.json(blog_doc);
    //       }
    //     })
    //   }
    // })

    user.save(function (err, doc) {
      if(err)
        res.json(err);
      else {
        //user doc is created. Now create blog doc
        var blog = new blogs(req.body.blog);
        blog.user = (doc._id);
        // console.log(doc);
        blog.save(function (err, blog_doc) {
          // blog_doc is created
          if(err)
            res.json(err);
          else {
            res.json(blog_doc);
          }
        })
      }
    })
  })






//override the /api/blog/:_id parameter with :blogname
//now it will search by name(which is also unique) instead of _id
// put should only update title, following and followers and nothing else
// var  blogs = require('./blog').mongoose;

// {
//   "title": "Popular on TV now!",
//    "about": "Asnmans",
//   "newFollowing": ""
// }

app.route('/api/blogs/:blogname')
  .get(function (req, res) {
    blogs.findOne({name: req.params.blogname}, function(err, docs) {
      if(err)
        res.json(err);

    }).populate('user')
      .exec(function (err, blog) {
        if(err)
          res.json(err)
        else
          res.json(blog)
      })
  })
  .put(function (req, res) {
    const query = {"name": req.params.blogname};
    console.log(query);
    const toUpdate = {title: req.body.title, about: req.body.about,
      username: req.body.username, password: req.body.password};
    const newFollowing = req.body.newFollowing;

    // console.log(toUpdate);
    blogs.findOneAndUpdate(query, {$set: toUpdate}, {new: true}, function (err, doc) {

      if(err)
        res.send(500, {error: err});

      console.log(doc._id + "," + newFollowing);

      if(newFollowing != '' || newFollowing != doc._id) //should not follow empty or self
      {
        //find the blog who is being followed and add to its followers
        blogs.findOne({_id: newFollowing}, function (err, being_followed_doc) {
          if(err)
            res.json(err);

          being_followed_doc.followers.push(doc._id);
          being_followed_doc.save();

          //save the doc who started follow newFollowing
          doc.following.push(newFollowing);
          doc.save();

        })


      }


      // res.json(doc);
    })
  })

// const query = {"name": req.params.blogname};
// const toUpdate = {title: req.body.title};
// const newFollowing = req.body.newFollowing;
//
// // console.log(toUpdate);
// blogs.findOneAndUpdate(query, {$set: toUpdate}, {new: true}, function (err, doc) {
//   // console.log(doc);
//
//   if(err)
//     res.send(500, {error: err});
//   if(newFollowing != '')
//   {
//     //find the blog who is being followed and add to its followers
//     blogs.findOne({_id: newFollowing}, function (err, being_followed_doc) {
//       if(err)
//         res.json(err);
//
//       being_followed_doc.followers.push(doc._id);
//       being_followed_doc.save();
//     })
//
//     //save the doc who started follow newFollowing
//     doc.following.push(newFollowing);
//     doc.save();
//   }
//
//
//   res.json(doc);
// })

//followers
app.route('/api/blogs/:blogname/followers')
  .get(function (req, res) {
    blogs.findOne({name: req.params.blogname}, function(err, doc) {
      if(err)
        res.json(err);

    }).populate('followers')
      .exec(function (err, blog) {
        if(err)
          res.json(err);

        res.json(blog.followers);

      })
  })

//following
app.route('/api/blogs/:blogname/following')
  .get(function (req, res) {
    blogs.findOne({name: req.params.blogname}, function(err, doc) {
      if(err)
        res.json(err);

    }).populate({path: 'following', populate: {path: 'blogPosts', model: 'tblblogpost'}})
      .exec(function (err, blog) {
        if(err)
          res.json(err);

        res.json(blog.following);

      })
  })

//blogposts get
app.route('/api/blogs/:blogname/blogposts')
  .get(function (req, res) {
    blogs.findOne({name: req.params.blogname}, function(err, doc) {
      if(err)
        res.json(err);

      // doc.blogPosts.forEach(function (item) {
      //   console.log(Object.prototype.toString.call(item));
      // });

    }).populate('blogPosts')
      .exec(function (err, blog) {
        if(err)
          res.json(err);

        res.json(blog.blogPosts);

      })
  })


app.route('/api/blogs/:blogname/user')
  .get(function (req, res) {
    blogs.findOne({name: req.params.blogname}, function(err, doc) {
      if(err)
        res.json(err);

      // doc.user.forEach(function (item) {
      //   console.log(Object.prototype.toString.call(item));
      // });

    }).populate('user')
      .exec(function (err, blog) {
        if(err)
          res.json(err);

        res.json(blog.user);

      })
  })
// blogpost post
// req.body = {blogpostSchema} with blog.name as blogname instead of blog._id as blog
// and without likes and date as they will get their default values at first
// and later the values as provided by frontend
// {
//   "blog": "chasing",
//   "title": "Popular on TV now!",
//   "content": "1. Stranger Things\n2. Mr. Robot\n3. American Horror Story: Roanoke\n4. The Walking Dead\n5. Bachelor in Paradise\n6. Pretty Little Liars\n7. Game of Thrones"
//
// }
app.route('/api/blogposts')
  .post(function (req, res) {
    blogs.findOne({name: req.body.blog}, function (err, blog_doc) {
      if(err)
        res.json(err);
      //blogpost that need to be posted
      const blogpost = req.body;
      // blogpost.blog = blog_doc.name;
      // console.log(blogpost);
      blogPosts.create(blogpost, function (err, blogpost_doc) {
        if(err)
          res.json(err)
        else {
          var posts = blog_doc.blogPosts;
          posts.push(blogpost_doc._id);
          blogs.findOneAndUpdate({name: blog_doc.name}, {$set: {blogPosts: posts}}, function (err, doc) {
            if (err)
              res.json(err);
          })

          res.json(blogpost_doc);
        }
      })
    })
  })

//use default put

//to get blog for the blogpost
app.route('/api/blogposts/:id/blog')
  .get(function (req, res) {
    blogPosts.findOne({_id: req.params.id}, function (err, doc) {
      if(err)
        res.json(err);

      // console.log("1" + doc);

    }).populate({
      path: 'parentBlog',
      populate: {
        path: 'user',
        model: 'tbluser'
      }
    }).exec(function (err, blogpost) {
        if(err){
          // console.log(err);
          res.json(err);
        }
        // console.log("2" + blogpost)
        res.json(blogpost.parentBlog);

      })
  });


//
// Routes
app.use('/api', api.router);

// Image POST handler.
app.post("/image_upload", function (req, res) {
  upload_image(req, function(err, data) {

    if (err) {
      return res.status(404).end(JSON.stringify(err));
    }
    // console.log(data);
    res.send(data);
  });
});



// Create folder for uploading files.
var filesDir = path.join(path.dirname(require.main.filename), "uploads");

if (!fs.existsSync(filesDir)){
  fs.mkdirSync(filesDir);
}

// Image GET handler
app.get("/uploads/:name", function (req, res) {

  // console.log(__dirname + '\\' + req.params.name);
  // res.json({'file_name' :(__dirname + '\\' + req.params.name)});
  res.sendFile(__dirname + '\\uploads\\' + req.params.name);
})


// Start Server
app.listen(3000);
console.log('API is running on port 3000')
