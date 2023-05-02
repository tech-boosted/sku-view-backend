const axios = require('axios');
const check_report_status = require('./AmazonReportStatus');

const create_report = async (access_token) => {

    let data = JSON.stringify({
        "name": "SP Report Exmaple",
        "startDate": "2023-02-10",
        "endDate": "2023-02-15",
        "configuration": {
            "adProduct": "SPONSORED_PRODUCTS",
            "groupBy": [
                "advertiser"
            ],
            "columns": [
                "advertisedSku",
                "impressions",
                "clicks",
                "spend",
                "sales1d",
                "campaignId",
                "date"
            ],
            "reportTypeId": "spAdvertisedProduct",
            "timeUnit": "DAILY",
            "format": "GZIP_JSON"
        }
    });

    let config = {
        method: 'post',
        maxBodyLength: Infinity,
        url: 'https://advertising-api.amazon.com/reporting/reports',
        headers: {
            'Content-Type': 'application/vnd.createasyncreportrequest.v3+json',
            'Amazon-Advertising-API-ClientId': 'amzn1.application-oa2-client.d6c2ae8330cc4472bece167e1a9b4183',
            'Amazon-Advertising-API-Scope': '3999774442873617',
            'Authorization': 'Bearer ' + access_token,
        },
        data: data
    };

    console.log("creating report")
    // Generate report
    axios.request(config).then((response) => {
        let reportId = response.data.reportId;
        console.log("got report id")
        if (reportId) {
            check_report_status(reportId, access_token);
        }
    }).catch(async (error) => {
        console.log(error);
        console.log(error.response.data);
        console.log("report generate failed")
        // if (error.response.status == 401) {
        //     var new_access_token_result = await get_access_token_from_refresh_token(refresh_token);
        //     if (new_access_token_result['status']) {
        //         var new_access_token = new_access_token_result['value'];
        //     }
        // }
    });
    return;
}

module.exports = create_report;