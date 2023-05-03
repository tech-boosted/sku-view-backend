const express = require('express');
require('dotenv').config();

const router = express.Router();
const auth = require("../middleware/auth");

const dummyChartData = require("../ExampleCode/DummyData");
const dummyDateData = require("../ExampleCode/DateData");
router.get('/', auth, (req, res) => {
    var data = {
        dummyChartData: dummyChartData,
        dummyDateData: dummyDateData
    }
    res.status(200)
    res.json({ data })
})

module.exports = router;