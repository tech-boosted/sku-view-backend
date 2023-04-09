const express = require('express');
require('dotenv').config();

const router = express.Router();
const auth = require("../middleware/auth");


router.get('/', auth, (req, res) => {
    var data = {
        impressions: 123
    }
    res.status(200)
    res.json({ data })
})

module.exports = router;