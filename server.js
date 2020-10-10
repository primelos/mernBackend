const express = require('express')
const mongoose = require('mongoose')
const bodyParser = require('body-parser')
const passport = require('passport')
const app = express()
('dotenv').config()
const users = require('./routes/api/users')

app.use(
    bodyParser.urlencoded({
        extended: false
    })
);
app.use(bodyParser.json());

// db config
const dbKeys = require('./config/keys').mongoURI;
mongoose
    .connect(
        dbKeys,
         {useNewUrlParser: true}
           )
           .then(() => console.log('mongoDB connected'))
           .catch(err => console.log(err))
// passport middleware
app.use(passport.initialize());
// passport config
require('./config/passport')(passport)
// routes
app.use('/api/users', users)

const port =  PORT || 6022
app.listen(port, () => console.log(`server running on ${port}`))