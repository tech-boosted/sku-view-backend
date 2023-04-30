const axios = require('axios');
const qs = require('qs');

var secretKey = process.env.SECRETKEY;
var baseUrl = process.env.CLIENT_BASE_URL;
AMAZON_CLIENT_ID = process.env.AMAZON_CLIENT_ID;
AMAZON_CLIENT_SECRECT = process.env.AMAZON_CLIENT_SECRECT;
AMAZON_REDIRECT_URL = process.env.AMAZON_REDIRECT_URL;


const get_access_token_from_refresh_token = async (refresh_token) => {
  console.log('po')
  var result;
  console.log("getting access token from refresh token")
  let data = qs.stringify({
    'grant_type': 'refresh_token',
    'refresh_token': refresh_token,
    'client_id': AMAZON_CLIENT_ID,
    'client_secret': AMAZON_CLIENT_SECRECT
  });

  var headers = {
    'Content-Type': 'application/x-www-form-urlencoded'
  };

  await axios.post('https://api.amazon.com/auth/o2/token', data, { headers: headers })
    .then((response) => {
      console.log('iu')
      console.log("Got access token from refresh token")
      result = {status: true, value: response.data.access_token};
    })
    .catch((error) => {
      console.log('yt')
      console.log("failed access token from refresh token")
      console.log(error.response.data.error_description);
      result = {status: false, value: error.response.data.error_description};
    });
    return result;
}

module.exports = get_access_token_from_refresh_token;