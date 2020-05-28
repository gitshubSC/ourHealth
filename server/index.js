const express = require("express");
const app = express();
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");



const config = require("./config/key");

const { User } = require("./models/user");
const { auth } = require("./middleware/auth");

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

app.get("/", (req,res)=>{
    res.json({" Deployed": "heroku"});
});

// get req from auth in auth.js
//send data from auth to client
app.get("/api/user/auth", auth, (req, res) => {
    res.status(200).json({
        _id: req._id,
        isAuth: true,
        email: req.user.email,
        name: req.user.name,
        lastname: req.user.lastname,
        role: req.user.role

    })

})


// need body-parser to read req(in json), puts req into user model
app.post('/api/users/register', (req, res) => {
    const user = new User(req.body)


    //saving into mongoDB
    user.save((err, doc) => {
        if (err) return res.json({ success: false, err });

        return res.status(200).json({
            success: true,
            userData: doc
        })
    })
})

app.post("/api/user/login", (req, res) => {
    //Search for email
    User.findOne({ email: req.body.email }, (err, user) => {
        if (!user)
            return res.json({
                loginSucess: false,
                message: "Auth failed, email not found"
            });
        //compare Password

        user.comparePassword(req.body.password, (err, isMatch) => {
            if (!isMatch) {
                return res.json({
                    loginSuccess: false,
                    message: " wrong password"

                });
            }
        });
        //generateToken
        user.generateToken((err, user) => {
            if (err) return res.status(400).send(err);
            res.cookie("user_auth", user.token)
                .status(200)
                .json({
                    loginSuccess: true
                });
        });

    });


});
app.get("/api/user/logout", auth, (req, res) => {
    User.findOneAndUpdate({ _id: req.user._id }, { token: "" }, (err, doc) => {
        if (err) return res.json({ success: false, err })
        return res.status(200).send({
            success: true
        })
    })


});

const port = process.env.PORT || 5000



app.listen(port, () => {
    console.log(`Server Listening on ${port}`)
  });