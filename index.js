const express = require("express");
const app = express();
const mongoose = require("mongoose");

mongoose.connect("mongodb+srv://sc:pw123@cluster0-h2vv6.mongodb.net/test?retryWrites=true&w=majority",
    { useNewUrlParser: true })
    .then(() => console.log('MongoDB is connected!'))
    .catch(err => console.log(err));

app.get('/', (req, res) => {
    res.send("Hello World");
});

app.listen(5000);