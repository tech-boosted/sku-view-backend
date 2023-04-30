const axios = require('axios');

AMAZON_CLIENT_ID = process.env.AMAZON_CLIENT_ID;
AMAZON_CLIENT_SECRECT = process.env.AMAZON_CLIENT_SECRECT;

const get_amazon_profiles = async (access_token) => {
    console.log('ab')
    var result;
    var headers = {
        'Amazon-Advertising-API-ClientId': AMAZON_CLIENT_ID,
        'Authorization': 'Bearer ' + access_token
    }
    // Get all profiles with the associated access token
    await axios.get('https://advertising-api.amazon.com/v2/profiles', { headers: headers }).then((res) => {
        console.log('cd')
        console.log("Got profiles")
        result = { status: true, value: res.data };
    }).catch((err) => {
        console.log('ef')
        if (err.response.status == 401) { // access_token expired
            console.log("profile failure 401")
            console.log('gh')
            result = { status: false, value: err.response.status };
        } else {
            result = { status: false, value: err.response.statusText };
        }
    })
    return result;
}

module.exports = get_amazon_profiles;