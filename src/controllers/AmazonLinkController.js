const express = require('express');
const auth = require('../middleware/auth');
const User = require('../models/User');
const jwt = require("jsonwebtoken");
const url = require('url');
const axios = require('axios');
const qs = require('qs');
const router = express.Router();
require('dotenv').config();

var secretKey = process.env.SECRETKEY;
var baseUrl = process.env.CLIENT_BASE_URL;
AMAZON_CLIENT_ID = process.env.AMAZON_CLIENT_ID;
AMAZON_CLIENT_SECRECT = process.env.AMAZON_CLIENT_SECRECT;
AMAZON_REDIRECT_URL = process.env.AMAZON_REDIRECT_URL;

router.get('/', auth, async (req, res) => {
    var url = `https://www.amazon.com/ap/oa?scope=advertising::campaign_management&response_type=code&client_id=${AMAZON_CLIENT_ID}&state=${req.token}&redirect_uri=${AMAZON_REDIRECT_URL}`;
    res.status(200);
    res.json({ url });
})

router.get('/callback', async (req, res) => {

    let q = url.parse(req.url, true).query;

    if (q.error) {
        console.log('Error:' + q.error);
        res.status(500)
        res.json({ message: "something went wrong" })
    } else {

        var code = q.code;
        let data = qs.stringify({
            'grant_type': 'authorization_code',
            'code': code,
            'redirect_uri': AMAZON_REDIRECT_URL,
            'client_id': AMAZON_CLIENT_ID,
            'client_secret': AMAZON_CLIENT_SECRECT
        });
        let access_token_url = 'https://api.amazon.com/auth/o2/token';
        let headers = { 'Content-Type': 'application/x-www-form-urlencoded' };

        await axios.post(access_token_url, data, { headers: headers }).then((response) => {

            console.log(JSON.stringify(response.data));

            var access_token = response.data.access_token;
            var refresh_token = response.data.refresh_token;

            var user_token = q.state;
            const user = jwt.verify(user_token, secretKey);

            var newObj = {
                access_token: access_token,
                refresh_token: refresh_token,
                connected: true
            }

            User.findByIdAndUpdate({ _id: user.user.id }, { 'credentials.amazon': newObj }, { new: true }).then((response) => {
                console.log("user updated")
                res.status(301)
                res.redirect(baseUrl + "/settings/channels/amazon/success")
            }).catch((err) => {
                console.log(err)
                res.status(500)
                res.json({ message: "Something went wrong" })
            })

        }).catch((error) => {
            console.log(error.response.data.error_description);
            res.status(500)
            res.json({ message: error.response.data.error_description })
        });
    }
})

module.exports = router;