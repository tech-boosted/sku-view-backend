const axios = require('axios');
const zlib = require('zlib');

const download_report = (zip_url) => {

    let finaldata;
    
    axios.get(zip_url, { headers: { 'Accept-Encoding': 'gzip', responseType: 'stream' } }).then(async response => {
        console.log(response.data);

        // Calling gzip method
        zlib.gzip(response.data, (err, buffer) => {

            // Calling unzip method
            zlib.gunzip(buffer, (err, buffer) => {

                console.log(buffer.toString('utf8'));
                finaldata = buffer.toString('utf8');
            })
        })
    }).catch((err) => {
        console.log(err)
    })
    return;
}

module.exports = download_report;