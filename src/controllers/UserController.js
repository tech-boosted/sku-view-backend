const express = require('express');
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
require('dotenv').config();
const auth = require("../middleware/auth");
const User = require('../models/User');

var useCookie = auth.useCookie
var useAuth = auth.useAuth

secretKey = process.env.SECRETKEY
tokenExpiryTime = process.env.TOKENEXPIRYTIME

router.get('/allUsers', useCookie, (req, res) => {
    User.find()
        .then((items) => res.json(items))
})

router.post("/login", (req, res) => {
    const { email, password } = req.body;

    User.findOne({ email: email }).then((user) => {
        if (user) {
            bcrypt.compare(password, user.password).then((isMatch) => {
                if (isMatch) {
                    var userInfo = {
                        "firstname": user.firstname,
                        "lastname": user.lastname,
                        "company": user.company,
                        "phone_number": user.phone_number,
                        "email": user.email,
                    }
                    const payload = {
                        user: {
                            id: user.id
                        }
                    };

                    jwt.sign(payload, secretKey, { expiresIn: tokenExpiryTime }, (err, token) => {
                        if (err) {
                            console.log(err)
                            console.log("jwt token failed")
                            res.status(200);
                            res.json({ message: 'token failed' })
                        } else {
                            res.cookie("token", token)
                            res.status(200).json({
                                userInfo, token
                            });
                        }
                    });
                } else {
                    res.status(401);
                    res.send({ message: "Wrong credentials" })
                }
            }).catch((err) => {
                console.log("Password compare failed")
                res.status(200);
                res.json({ message: 'Compare failed' })
            })
        } else {
            console.log("Not registered")
            res.status(200);
            res.json({ message: 'Not Registered' })
        }
    }).catch((err) => {
        console.log(err)
        console.log("Failed findOne")
        res.status(200);
        res.json({ message: 'Failed to connect to DB' })

    })
});

router.post("/register", (req, res) => {
    const { body } = req;
    const { firstname, lastname, company, phone_number, email, password } = body;
    User.findOne({ email: email }).then((user) => {
        if (user) {
            res.status(200);
            res.send({ message: "user already exist" })
        } else {
            const user = new User({ firstname, lastname, company, phone_number, email, password })
            bcrypt.genSalt(10, (err, salt) => {
                bcrypt.hash(user.password, salt, (err, hash) => {
                    if (err) {
                        console.log(err)
                        console.log("failed to encrypt password")
                        res.status(500);
                        res.json({ message: 'failed' })
                    } else {
                        user.password = hash;
                        user.save().then(() => {
                            const payload = {
                                user: {
                                    id: user.id
                                }
                            };
                            jwt.sign(payload, secretKey, { expiresIn: tokenExpiryTime }, (err, token) => {
                                var userInfo = {
                                    "firstname": user.firstname,
                                    "lastname": user.lastname,
                                    "company": user.company,
                                    "phone_number": user.phone_number,
                                    "email": user.email,
                                }
                                if (err) {
                                    console.log(err)
                                    console.log("jwt token failed")
                                    res.status(500);
                                    res.json({ message: 'token failed' })
                                } else {
                                    res.cookie("token", token)
                                    res.status(200)
                                    res.json({
                                        userInfo, token
                                    });
                                }
                            });

                        }).catch((err) => {
                            console.log("Failed to create user")
                            res.status(500);
                            res.json({ message: "Failed to create user" })
                        })
                    }
                })
            })
        }
    }).catch((err) => {
        console.log(err)
        console.log("Failed findOne")
        res.status(500);
        res.json({ message: 'Failed to connect to DB' })

    })
})


router.post("/logout", useAuth, (req, res) => {
    var bearerToken = req.headers.authorization;
    var token = bearerToken.slice(7);
    jwt.sign(token, "", { expiresIn: 1 }, (logout, err) => {
        if (logout) {
            res.cookie("token", "")
            res.status(200);
            res.json({ message: "You have been Logged Out" })
        } else {
            res.send({ msg: "Error" });
        }
    });
});

module.exports = router;