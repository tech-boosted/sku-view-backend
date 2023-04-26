const express = require('express');
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
require('dotenv').config();
const auth = require("../middleware/auth");
const User = require('../models/User');
const axios = require('axios');

secretKey = process.env.SECRETKEY
tokenExpiryTime = process.env.TOKENEXPIRYTIME

// router.get('/delete', auth, (req, res) => {
//     User.deleteMany({}).then(()=>{res.status(200);res.json({message: "done"})})
// })

// router.get('/update', auth, (req, res) => {
//     User.findByIdAndUpdate({ _id: "64472552f979efb62744983d" }, { credentials: { google: { access_token: "hello_token" } } })
//     .then((res) => {
//         console.log(res)
//     })
//     res.status(200);
//     res.json({ message: "done" });
// })

router.get('/allUsers', auth, (req, res) => {
    User.find()
        .then((items) => res.json(items))
})

router.get('/userInfo', auth, async (req, res) => {

    // setTimeout(() => {
    //     let headers = {
    //         Authorization: `Bearer ${req.token}`
    //     }
    //     axios.get("http://localhost:8080/api/data", { headers: headers }).then((res) => {
    //         console.log(res.data.data);
    //     }).catch((err) => {
    //         console.log(err.response.data)
    //     })
    // }, 5000)

    User.findOne({ _id: req.user.user.id }).then((user) => {
        if (user) {
            var credentialsObj = {
                amazon: {
                    connected: user.credentials.amazon.connected
                },
                google: {
                    connected: user.credentials.google.connected
                },
                facebook: {
                    connected: user.credentials.facebook.connected
                }
            }
            var userInfo = {
                "firstname": user.firstname,
                "lastname": user.lastname,
                "company": user.company,
                "phone_number": user.phone_number,
                "email": user.email,
                "credentials": credentialsObj
            }
            res.status(200)
            res.json(userInfo)
        }
    })
})

router.post("/login", (req, res) => {
    const { email, password } = req.body;

    User.findOne({ email: email }).then((user) => {
        if (user) {
            bcrypt.compare(password, user.password).then((isMatch) => {
                if (isMatch) {
                    var credentialsObj = {
                        amazon: {
                            connected: user.credentials.amazon.connected
                        },
                        google: {
                            connected: user.credentials.google.connected
                        },
                        facebook: {
                            connected: user.credentials.facebook.connected
                        }
                    }
                    var userInfo = {
                        "firstname": user.firstname,
                        "lastname": user.lastname,
                        "company": user.company,
                        "phone_number": user.phone_number,
                        "email": user.email,
                        "credentials": credentialsObj
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
                            res.status(500);
                            res.json({ message: 'Something went wrong' })
                        } else {
                            res.cookie("token", token)
                            res.status(200).json({
                                userInfo, token
                            });
                        }
                    });
                } else {
                    res.status(401);
                    res.send({ message: "Invalid credentials" })
                }
            }).catch((err) => {
                console.log("Password compare failed")
                res.status(500);
                res.json({ message: 'Something went wrong' })
            })
        } else {
            console.log("Not registered")
            res.status(401);
            res.json({ message: 'Not Registered. Please register to continue.' })
        }
    }).catch((err) => {
        console.log(err)
        console.log('Failed to connect to DB')
        res.status(500);
        res.json({ message: 'Something went wrong' });

    })
});

router.post("/register", (req, res) => {
    const { body } = req;
    const { firstname, lastname, company, phone_number, email, password } = body;
    User.findOne({ email: email }).then((user) => {
        if (user) {
            res.status(409);
            res.send({ message: "User already exists. Please login to continue" })
        } else {
            const user = new User({ firstname, lastname, company, phone_number, email, password })
            bcrypt.genSalt(10, (err, salt) => {
                bcrypt.hash(user.password, salt, (err, hash) => {
                    if (err) {
                        console.log(err)
                        console.log("failed to encrypt password")
                        res.status(500);
                        res.json({ message: 'Something went wrong' });
                    } else {
                        user.password = hash;
                        user.save().then(() => {
                            const payload = {
                                user: {
                                    id: user.id
                                }
                            };
                            jwt.sign(payload, secretKey, { expiresIn: tokenExpiryTime }, (err, token) => {
                                var credentialsObj = {
                                    amazon: {
                                        connected: user.credentials.amazon.connected
                                    },
                                    google: {
                                        connected: user.credentials.google.connected
                                    },
                                    facebook: {
                                        connected: user.credentials.facebook.connected
                                    }
                                }
                                var userInfo = {
                                    "firstname": user.firstname,
                                    "lastname": user.lastname,
                                    "company": user.company,
                                    "phone_number": user.phone_number,
                                    "email": user.email,
                                    "credentials": credentialsObj
                                }
                                if (err) {
                                    console.log(err)
                                    console.log("jwt token failed")
                                    res.status(500);
                                    res.json({ message: 'Something went wrong' });
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
        console.log('Failed to connect to DB')
        res.status(500);
        res.json({ message: 'Something went wrong' });

    })
})


router.post("/logout", auth, (req, res) => {
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