const express = require('express');
const auth = require('../middleware/auth');
const User = require('../models/User');
require('dotenv').config();

const router = express.Router();

AMAZON_CLIENT_ID = process.env.AMAZON_CLIENT_ID;
AMAZON_CLIENT_SECRECT = process.env.AMAZON_CLIENT_SECRECT;
AMAZON_REDIRECT_URL = process.env.AMAZON_REDIRECT_URL;

router.get('/', auth, (req, res) => {
    var url = `https://www.amazon.com/ap/oa?scope=advertising::campaign_management&response_type=code&client_id=${AMAZON_CLIENT_ID}&state=State&redirect_uri=${AMAZON_REDIRECT_URL}`;
    res.status(200);
    res.json({ message: url });
})

module.exports = router;