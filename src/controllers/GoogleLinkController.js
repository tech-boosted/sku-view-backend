const express = require('express');
const { google } = require('googleapis');
const url = require('url');
const auth = require('../middleware/auth');
const User = require('../models/User');
require('dotenv').config();
const jwt = require("jsonwebtoken");
const router = express.Router();

var secretKey = process.env.SECRETKEY;
var baseUrl = process.env.CLIENT_BASE_URL;
var CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
var CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
var REDIRECT_URL = process.env.GOOGLE_REDIRECT_URL;

/**
 * To use OAuth2 authentication, we need access to a CLIENT_ID, CLIENT_SECRET, AND REDIRECT_URI.
 * To get these credentials for your application, visit
 * https://console.cloud.google.com/apis/credentials.
 */
const oauth2Client = new google.auth.OAuth2(
    CLIENT_ID,
    CLIENT_SECRET,
    REDIRECT_URL
);
let userCredential = null;


router.get('/', auth, (req, res) => {

    // console.log("req.token: ", req.token)
    // Access scopes for read-only Drive activity.
    const scopes = [
        'https://www.googleapis.com/auth/adwords'
    ];

    // Generate a url that asks permissions for the Drive activity scope
    const authorizationUrl = oauth2Client.generateAuthUrl({
        // 'online' (default) or 'offline' (gets refresh_token)
        access_type: 'offline',
        /** Pass in the scopes array defined above.
          * Alternatively, if only one scope is needed, you can pass a scope URL as a string */
        scope: scopes,
        // Enable incremental authorization. Recommended as a best practice.
        include_granted_scopes: true,
        state: JSON.stringify({ token: req.token }),
    });
    console.log("authorizationUrl: ", authorizationUrl);
    res.status(200)
    res.json({ url: authorizationUrl })
});

router.get('/callback', async (req, res) => {

    let q = url.parse(req.url, true).query;

    if (q.error) { // An error response e.g. error=access_denied
        console.log('Error:' + q.error);
        res.status(500)
        res.json({ message: "something went wrong" })
    } else {
        // Get user from token sent from client-app
        var user_token = JSON.parse(q.state).token;
        const user = jwt.verify(user_token, secretKey);

        // Get access and refresh tokens (if access_type is offline)
        let { tokens } = await oauth2Client.getToken(q.code);
        oauth2Client.setCredentials(tokens);

        /** Save credential to the global variable in case access token was refreshed.
          * ACTION ITEM: In a production app, you likely want to save the refresh token
          *              in a secure persistent database instead. */
        userCredential = tokens;

        // console.log("userCredential: ", userCredential)

        var access_token = userCredential.access_token;
        var refresh_token = userCredential.refresh_token;

        var newObj = {
            google: {
                access_token: access_token,
                refresh_token: refresh_token,
                connected: true
            }
        }
        User.findByIdAndUpdate({ _id: user.user.id }, { credentials: newObj }, { new: true }).then((response) => {
            console.log("user updated")
            res.status(301)
            res.redirect(baseUrl + "/settings/channels/google/success")
        }).catch((err) => {
            console.log(err)
            res.status(500)
            res.json({ message: "Something went wrong" })
        })
    }
})


module.exports = router;