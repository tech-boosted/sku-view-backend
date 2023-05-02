
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const fs = require('fs');
const https = require('https');
const http = require('http');
var cookies = require("cookie-parser");
require('dotenv').config();

const user_routes = require("./src/controllers/UserController");
const data_routes = require("./src/controllers/DataController");
const google_link_routes = require("./src/controllers/GoogleLinkController");
const amazon_link_routes = require("./src/controllers/AmazonLinkController");
const amazon_report_routes = require("./src/controllers/AmazonReportGenerator");

const PORT = process.env.PORT || 3001;
const ENV = process.env.ENV;
const SSL_KEY_PATH = process.env.SSL_KEY_PATH;
const SSL_CERT_PATH = process.env.SSL_CERT_PATH;
const app = express();

app.use(express.json());
app.use(cors());
app.use(cookies());
app.use(express.urlencoded({ extended: true }))

app.use('/api/user', user_routes)
app.use('/api/data', data_routes)
app.use('/api/link/google', google_link_routes)
app.use('/api/link/amazon', amazon_link_routes)
app.use('/api/report/amazon', amazon_report_routes)

mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}); () => {
    console.log("connected to DB")
}

if (ENV == "dev") {
    app.listen(PORT, console.log("Server started on port: " + PORT))
} else {
    // Listen both http & https ports
    const httpServer = http.createServer(app);
    const httpsServer = https.createServer({
        key: fs.readFileSync(SSL_KEY_PATH),
        cert: fs.readFileSync(SSL_CERT_PATH),
    }, app);

    // httpServer.listen(PORT, () => {
    //     console.log('HTTP Server running on port 80');
    // });

    httpsServer.listen(PORT, () => {
        console.log('HTTPS Server running on port 443');
    });

}

