const fs = require('fs');
const request = require('request');

function upload(email, password, path) {
  let size = fs.lstatSync(path).size;
  let bytes = 0;

  let formData = {
    'url': 'https://api.streamable.com/upload',
    'file': fs.createReadStream(path).on('data', (chunk) => {
      console.log(bytes += chunk.length, size);
    })
  };

  let credentials = `${email}:${password}`;
  let authorization = Buffer.from(credentials).toString('base64');

  request.post({
    url: 'https://api.streamable.com/upload',
    formData: formData,
    headers: {
      authorization: `Basic ${authorization}`
    }
  }, function(err, response, body) {
    if (err) {
      return console.error('upload failed:', err);
    }
    //console.log('Server responded with:', response);
    console.log('https://streamable.com/' + JSON.parse(body).shortcode);
  });
}

export default {upload};