const express = require('express');
const app = express();
const port= process.env.PORT || 7000;
const logger = require('morgan');
const path = require('path');
const flash = require('connect-flash');
const mongoose = require('mongoose');
const User = require('./models/User.js');
const Post = require('./models/Post.js');
const Comment = require('./models/Comment');
const bcrypt = require('bcryptjs');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const {globalVariables} = require('./config/globalConfig');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy
const {isLoggedIn} = require('./config/authorization');
const multer= require('multer');
const cloudinary = require('cloudinary').v2;
const moment = require('moment');

const storage = multer.diskStorage({
    filename: function(req, file, callback){
        callback(null, Date.now() + file.originalname );
    }
});

const upload = multer({storage: storage});

// setup cloudinary upload
cloudinary.config({
    cloud_name: 'dytgyjswa',
    api_key: '566243367268936',
    api_secret: 'Jecd_SOqhdoCUc_ccqUXExjOKT8'
});

// DB connection

mongoose.connect("mongodb+srv://Debchee:Ubique7Dinma7@cluster0.wjqefe5.mongodb.net/?retryWrites=true&w=majority")
.then(response => console.log('Database Connected Successfully'))
.catch(error => console.log(`Database connection error: ${error}`))


// Cookie configuration
app.use(cookieParser());


// Session configuration

app.use(session({
    secret: 'HFDSFFGjgggvdffgghhh988',
    resave: true,
    saveUninitialized: true,
    cookie: {
        maxAge: Date.now() + 3600000
    },
    store: MongoStore.create({
      mongoUrl: 'mongodb+srv://Debchee:Ubique7Dinma7@cluster0.wjqefe5.mongodb.net/?retryWrites=true&w=majority',
      ttl: 365 * 24 * 60 * 60 // = 14 days. Default
    })
  }));

//   passport configuration

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy({usernameField: 'email', passReqToCallback: true}, 
async(req, email, password, done) => {
    await User.findOne({email})
    .then((user)=> {
        if(!user){
            return done(null, false, req.flash('eror-message', 'User not found. Please register and try again'))
        }
    bcrypt.compare(password, user.password, (err, passwordMatch) => {
        if (err){
            return err;
        }
        if (!passwordMatch) 
        return done(null, false, req.flash('error-message','Incorrect Passport'))
        return done(null,user, req.flash('success-message', 'Login Successful'));
    })

    })

}));

passport.serializeUser(function(user, done){
    done(null, user.id);
});
passport.deserializeUser(function(id, done){
    User.findById(id, function(err, user){
        done(err, user)
    })
})

//   flash setup
  app.use(flash());

//   global variable set up
  app.use(globalVariables);


// morgan setup
app.use(logger('dev'));

// set up View Engine to use EJS
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// set up moment
app.locals.moment = moment;

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());
app.use(express.urlencoded({extended : true}))

app.get('/', async (req,res) => {
    const allPosts = await Post.find({}).sort({ _id: -1 });
    res.render('home', {allPosts});
});

app.get('/login', (req,res) => {
    res.render('login');
});

// post route for login

app.post('/user/login', passport.authenticate('local', {
    failureRedirect: '/login',
    successRedirect: '/',
    session: true
}))

app.get('/register', (req,res) => {
    res.render('register');
});

app.post('/user/register', async (req,res) => {
    let{username,
    password, 
    email, 
    summary, 
    image
} = req.body;

const userExists = await User.findOne({ email });
if (userExists) {
    req.flash("error-message","User already exists");
   return res.redirect("back");
}

const salt= await  bcrypt.genSalt(10);
const hashedPassword= await bcrypt.hash(password, salt);

const newUser = new User({
    username,
    password: hashedPassword,
    email,
    summary,
    image
});
    
 await newUser.save(); 
 
 req.flash("success-message", "Registration Succesful");
 res.redirect("/login");
});

app.get('/newpost',(req,res) => {
    res.render('newPost');
});

app.post('/newpost', isLoggedIn, upload.single('mediaFile'), async (req,res) => {
    try {
        let {title, content} = req.body;
        let mediaType= '';
        if(req.file.mimetype === 'video/mp4'){
            mediaType= 'video';
        }else{
            mediaType= 'image';
        }
    const uploadedFile= await cloudinary.uploader.upload(req.file.path, {resource_type: mediaType});

    if(!uploadedFile){
        req.flash("error-message", "Error while uploading file!!")
        return res.redirect('back')
    }

    let newPost = new Post({
        title,
        content, 
        mediaType,
        mediaFile: uploadedFile.secure_url,
        author:req.user._id
    });

    await newPost.save();
    req.flash("success-message", "Post created")
        res.redirect('back')

    }catch(err) {
        console.log("Error from upload::: ", err)
    }
});

app.get('/viewPost/:postId', async (req,res) => {
    let singlePost = await Post.findOne({_id: req.params.postId})
    .populate("author")
    .populate({
       path: 'comments',

       options: {sort : {_id: -1}},
       populate: {
           path: 'user'
       }
    });
    console.log(singlePost);
    res.render('viewPost', {singlePost});
});

app.get('/user/profile', isLoggedIn, (req,res) => {
    res.render('profile');
});

app.post('/comment/:postId', async (req, res) => {
    let {comment} = req.body;
    let post = await Post.findOne({_id: req.params.postId});

    let newComment = new Comment({
        comment: comment, 
        user: req.user._id
    });

    await newComment.save();

    post.push(newComment._id);
    await post.save();

});

app.get('/user/logout',(req, res) => {
    req.logout(function(err) {
        if (err) return next (err)
            req.flash("success-message", "User logged out successfully")
            res.redirect('/login')
    });
    
})

app.listen(port, ()=> console.log(`Server running on ${port}`));

