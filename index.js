
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
var cookies = require("cookie-parser");
require('dotenv').config();

const user_routes = require("./src/controllers/UserController");
const data_routes = require("./src/controllers/DataController");

const PORT = process.env.PORT || 3001;
const app = express();
app.use(express.json());
app.use(cors());
app.use(cookies());
app.use(express.urlencoded({ extended: true }))

app.use('/api/user', user_routes)
app.use('/api/data', data_routes)

mongoose.connect(process.env.MONGO_URI,{
    useNewUrlParser:true,
    useUnifiedTopology:true
});()=>{
    console.log("connected to DB")
}

app.listen(PORT, console.log("Server started on port: " + PORT))

