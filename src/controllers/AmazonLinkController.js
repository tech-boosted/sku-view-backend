const express = require('express');
const auth = require('../middleware/auth');
const User = require('../models/User');
const jwt = require("jsonwebtoken");
const url = require('url');
const axios = require('axios');
const qs = require('qs');
const router = express.Router();
const get_access_token_from_refresh_token = require('../helper/AmazonAccessFromRefresh');
const get_amazon_profiles = require('../helper/AmazonProfiles');
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

router.get('/listProfiles', auth, async (req, response) => {

    var access_token = '';
    var refresh_token = '';
    // Get access and refresh token from DB
    await User.findOne({ _id: req.user.user.id }).then(async (user) => {
        access_token = user.credentials.amazon.access_token;
        refresh_token = user.credentials.amazon.refresh_token;

        // Get amazon profiles associated to access token
        let profiles_result = await get_amazon_profiles(access_token);
        if (profiles_result['status']) {
            // Return profiles
            response.status(200)
            response.json({ message: "success", data: profiles_result['value'] })
            return;
        } else {
            if (profiles_result['value'] == 401) {
                // Access token expired
                // Get new access token
                var new_access_token_result = await get_access_token_from_refresh_token(refresh_token);
                if (new_access_token_result['status']) {
                    var new_access_token = new_access_token_result['value'];

                    // Update the user's access token in the DB
                    await User.findByIdAndUpdate({ _id: req.user.user.id }, { 'credentials.amazon.access_token': new_access_token }, { new: true })
                        .then(async (res) => {
                            console.log("user updated with new access token");
                            // Get profiles using new access token
                            let profiles_result_with_new_access_token = await get_amazon_profiles(new_access_token);

                            if (profiles_result_with_new_access_token['status']) {
                                // Return profiles
                                console.log("Got profiles")
                                response.status(200);
                                response.json({ message: "success", data: profiles_result_with_new_access_token['value'] });
                                return;
                            } else {
                                // Failed to get profiles using new access token
                                response.status(500);
                                response.json({ message: profiles_result_with_new_access_token['value'] });
                                return;
                            }
                        }).catch((err) => {
                            console.log(err)
                            response.status(500)
                            response.json({ message: "Something went wrong, try again" })
                            return;
                        })
                } else {
                    // New access token fetch failed
                    console.log(new_access_token_result['value']);
                    response.status(500)
                    response.json({ message: new_access_token_result['value'] })
                    return;
                }
            } else {
                console.log("Failed to fetch profiles " + err);
                // unknown error
                response.status(500)
                response.json({ message: profiles_result['value'] })
                return;
            }
        }
    }).catch((err) => {
        console.log("User not found " + err);
        response.status(500)
        response.json({ message: "User not found " + err })
        return;
    })
});

router.post('/setProfile', auth, async (request, response) => {

    const { profile_id } = request.body;
    if(profile_id){
        await User.findByIdAndUpdate({ _id: request.user.user.id }, { 'credentials.amazon.profile_id': profile_id }, { new: true })
        .then((res)=>{
            response.status(200)
            response.json({ message: "Profile ID updated" })
        })
        .catch((err)=>{
            response.status(500)
            response.json({ message: "Could not update profile ID" })
        })
    }else{
        response.status(500)
        response.json({ message: "Invalid Profile ID" })
    }
})


module.exports = router;