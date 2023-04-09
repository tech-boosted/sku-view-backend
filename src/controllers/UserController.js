const express = require('express');
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
require('dotenv').config();
const auth = require("../middleware/auth");
const User = require('../models/User');

secretKey = process.env.SECRETKEY

router.get('/allUsers', auth, (req, res) => {
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

                    jwt.sign(payload, secretKey, { expiresIn: 100 }, (err, token) => {
                        if (err) {
                            console.log(err)
                            console.log("jwt token failed")
                            res.status(200);
                            res.json({ message: 'token failed' })
                        } else {
                            res.cookie("token", token)
                            res.status(200).json({
                                userInfo
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

const salt = bcrypt.genSalt(10);
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
                    if (err) throw console.log(err);
                    user.password = hash;
                    user.save().then(() => {
                        const payload = {
                            user: {
                                id: user.id
                            }
                        };

                        jwt.sign(payload, secretKey, { expiresIn: 100 }, (err, token) => {
                            if (err) {
                                res.send(err);
                            } else {
                                res.cookie("token", token)
                                res.status(200).json({
                                    token
                                });
                            }
                        });
                    }).catch((err) => res.send(err))
                })
            })
        }
    }).catch((err) => {
        console.log(err);
        res.send(err)
    })
})

module.exports = router;