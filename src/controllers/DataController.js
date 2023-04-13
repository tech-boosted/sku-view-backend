const express = require('express');
require('dotenv').config();

const router = express.Router();
const auth = require("../middleware/auth");

var useAuth = auth.useAuth

router.get('/', useAuth, (req, res) => {
    var data = {
        impressions: 123
    }
    res.status(200)
    res.json({ data })
})

module.exports = router;