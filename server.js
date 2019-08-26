var http = require('http');
var fs = require('fs');
var url = require('url');
var canv = require('canvas');
var querystring = require('querystring');

http.createServer(function (req, res){
  req.setEncoding('binary'); 
  
  if(req.method == 'POST'){
    let incoming = '';
    req.on('data', packet => {
      incoming = incoming + packet.toString();
    });

    req.on('end',() => {
      var note = querystring.parse(incoming, '\r\n', ':');

      if(note['Content-Type'].indexOf("image") != -1){
        var entire_data = incoming.toString();           
        content_type = note['Content-Type'].substring(1);
        var upper_boundary = entire_data.indexOf(content_type) + content_type.length; 
        var shorter_data = entire_data.substring(upper_boundary); 
        var binary_data = shorter_data.replace(/^\s\s*/, '').replace(/\s\s*$/, '');

        fs.writeFile("temporary.png", binary_data, 'binary', function(err){
          res.end();
        });
      } 
    });
  }
  else if(req.method === 'GET'){
    var q = url.parse(req.url, true);
    var filename = "." + q.pathname;
    console.log(filename);

    if(filename == "./"){
      fs.readFile('index.html', function(err, data){
        res.writeHead(200, {'Content-Type': 'text/html'});
        res.write(data);
        res.end();
      });
    }
  }
}).listen(8080);