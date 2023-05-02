const axios = require('axios');
const download_report = require('./DownloadReport');

const delay = ms => new Promise(res => setTimeout(res, ms * 1000));

const call_report_status_api = async (reportId, access_token) => {
    let result = { status: false, value: null }
    let config = {
        method: 'get',
        maxBodyLength: Infinity,
        url: 'https://advertising-api.amazon.com/reporting/reports/' + reportId,
        headers: {
            'Content-Type': 'application/vnd.createasyncreportrequest.v3+json',
            'Amazon-Advertising-API-ClientId': 'amzn1.application-oa2-client.d6c2ae8330cc4472bece167e1a9b4183',
            'Amazon-Advertising-API-Scope': '3999774442873617',
            'Authorization': 'Bearer ' + access_token
        }
    };

    // Check report status and download
    await axios.request(config).then((response) => {
        let fileStatus = response.data.status;
        let fileUrl = response.data.url;
        if (fileStatus != "PENDING" && fileUrl != null) {
            console.log("fileUrl: ", fileUrl)
            result.status = true;
            result.value = fileUrl;
        } else {
            console.log("Still pending")
            result.status = false;
            result.value = null;
        }
    }).catch((error) => {
        console.log(error);
        console.log("report status failed")
        result.status = false;
        result.value = null;
    });
    return result;
}


const check_report_status = async (reportId, access_token) => {
    var count = 10;
    var result;
    while (count != 0) {
        console.log("count: ", count)
        result = await call_report_status_api(reportId, access_token);
        console.log(result)
        if (result.status) {
            count = 0;
        } else {
            count -= 1;
            await delay(10);
        }
    }
    if(result.status){
        download_report(result.value);
    }
    return;
}

module.exports = check_report_status;