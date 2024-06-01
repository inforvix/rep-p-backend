const http = require('http');
const fs = require('fs');

const downloadFile = function(url, dest, cb) {
  const file = fs.createWriteStream(dest);
  
  http.get(url, function(response) {
    response.pipe(file);
    file.on('finish', function() {
      file.close(cb);
    });
  });
  
}
module.exports = downloadFile