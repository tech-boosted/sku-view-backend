const express = require('express');
const auth = require("../middleware/auth");
const create_report = require('../helper/AmazonCreateReport');
require('dotenv').config();

const router = express.Router();

router.get('/', auth, async (req, res) => {
    var data = {
        impressions: 123
    }

    var access_token = '';
    var refresh_token = '';
    // Get access and refresh token from DB
    await User.findOne({ _id: req.user.user.id }).then(async (user) => {
        access_token = user.credentials.amazon.access_token;
    })
    create_report(access_token);
    res.status(200)
    res.json({ data })
})

module.exports = router;