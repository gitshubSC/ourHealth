const express = require("express");
const app = express();
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");


const config = require("./config/key");

const { User } = require("./models/user");

mongoose.connect(config.mongoURI,
    {
        useNewUrlParser: true, useUnifiedTopology: true
        , useCreateIndex: true
    })
    .then(() => console.log('MongoDB is connected!'))
    .catch(err => console.log(err));


app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cookieParser());


// need body-parser to read req(in json), puts req into user model
app.post('/api/users/register', (req, res) => {
    const user = new User(req.body)

    user.save((err, doc) => {
        if (err) return res.json({ success: false, err });

        return res.status(200).json({
            success: true,
            userData: doc
        })
    })
})



app.listen(5000);