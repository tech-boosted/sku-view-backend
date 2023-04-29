const express = require('express');
const auth = require('../middleware/auth');
const User = require('../models/User');
const jwt = require("jsonwebtoken");
const url = require('url');
const axios = require('axios');
const qs = require('qs');
const router = express.Router();
const get_access_token_from_refresh_token = require('../helper/AmazonAccessFromRefresh');
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

router.get('/profile', auth, async (req, res) => {

    var access_token = '';
    var refresh_token = '';
    await User.findOne({ _id: req.user.user.id }).then((user) => {
        if (user) {
            access_token = user.credentials.amazon.access_token;
            refresh_token = user.credentials.amazon.refresh_token;
            var headers = {
                'Amazon-Advertising-API-ClientId': AMAZON_CLIENT_ID,
                'Authorization': 'Bearer ' + access_token
            }
            axios.get('https://advertising-api.amazon.com/v2/profiles', { headers: headers }).then((res) => {
                res.status(200)
                res.json({ message: "Got profiles" })
            }).catch(async (err) => {
                console.log("profile failure")
                if (err.response.status == 401) { // access_token expired
                    console.log("profile failure 401")
                    var result = await get_access_token_from_refresh_token(refresh_token);
                    var new_access_token = '';
                    if (result['status']) {
                        new_access_token = result['value'];
                        console.log("new_access_token: ", new_access_token);
                        res.status(200)
                        res.json({ message: "Try Again" })
                        return;
                    }
                    res.status(500);
                    res.json({ message: "Something went wrong" });
                    return;
                }
                res.status(500);
                res.json({ message: "Something went wrong" });
                return;
            })
        }
    }).catch((err) => {
        console.log("User not found");
        res.status(500)
        res.json({ message: "User not found" })
    })
})

module.exports = router;