const mongoose = require("mongoose");
const bcrypt = require('bcrypt');
const saltRounds = 10;
const jwt = require("jsonwebtoken");


const userSchema = mongoose.Schema({

    name: {
        type: String,
        maxlength: 50
    },
    email: {
        type: String,
        trim: true,
        unique: 1
    },
    password: {
        type: String,
        minglength: 5
    },
    lastname: {
        type: String,
        maxlength: 50
    },
    role: {
        type: Number,
        default: 0
    },
    image: String,
    token: {
        type: String,
    },
    tokenExp: {
        type: Number
    }

})

//before saving password , generate salt and hashing
userSchema.pre("save", function (next) {
    var user = this;

    if (user.isModified("password")) {


        bcrypt.genSalt(saltRounds, function (err, salt) {
            if (err) return next(err); //proceed to save when err occurs

            bcrypt.hash(user.password, salt, function (err, hash) {
                if (err) return next(err);
                user.password = hash
                next()
            })
        })
    } else {
        next()
    }
});

// comparing plain pw with database pw
userSchema.methods.comparePassword = function(plainPassword,callback){
        bcrypt.compare(plainPassword,this.password, function(err, isMatch){
            if(err) return callback(err);
            callback(null,isMatch)
        })

}


// generate token using user_id and secret

userSchema.methods.generateToken = function(callback){
    var user = this;
    var token = jwt.sign(user._id.toHexString(), "secret")

    user.token = token;
    user.save(function(err, user){
        if(err) return callback(err)
        callback(null, user);
    })
}

userSchema.statics.findByToken = function(token, callback){
        var user = this;

        jwt.verify(token,"secret", function(err,decodeId){
            // find user_id and token
            user.findOne({"_id":decodeId, "token": token},function(err,user){
                if(err) return callbacl(err);
                callback(null,user); // sent to auth.js findBytoken()
            })
        })
}

const User = mongoose.model("User", userSchema)


module.exports = { User }