const express = require('express');
const app = express();
const port= 7000;
const logger = require('morgan');
const path = require('path');

// morgan setup
app.use(logger('dev'));

// set up View Engine to use EJS
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req,res) => {
    const allPosts = [
        {
            img: '/assets/images/Blogging-pana.svg',
            title: 'First Post',
            content: "Some quick example text to build on the card title and make up the bulk of the card's content."
        },

        {
            img: '/assets/images/image1.jpg',
            title: 'Second Post',
            content: "Some quick example text to build on the card title and make up the bulk of the card's content."
        },

        {
            img: '/assets/images/image1.jpg',
            title: 'Third Post',
            content: "Some quick example text to build on the card title and make up the bulk of the card's content."
        },

        {
            img: '/assets/images/image1.jpg',
            title: 'Card Title',
            content: "Some quick example text to build on the card title and make up the bulk of the card's content."
        },

        {
            img: '/assets/images/image1.jpg',
            title: 'Card Title',
            content: "Some quick example text to build on the card title and make up the bulk of the card's content."
        },

        {
            img: '/assets/images/image1.jpg',
            title: 'Card Title',
            content: "Some quick example text to build on the card title and make up the bulk of the card's content."
        },

        {
            img: '/assets/images/image1.jpg',
            title: 'Card Title',
            content: "Some quick example text to build on the card title and make up the bulk of the card's content."
        },

        {
            img: '/assets/images/image1.jpg',
            title: 'Card Title',
            content: "Some quick example text to build on the card title and make up the bulk of the card's content."
        }
    ];



    res.render('home', {allPosts});
});

app.get('/login', (req,res) => {
    res.render('login');
});

app.get('/register', (req,res) => {
    res.render('register');
});

app.get('/newpost', (req,res) => {
    res.render('newPost');
});



app.listen(port, ()=> console.log(`Server running on ${port}`));

