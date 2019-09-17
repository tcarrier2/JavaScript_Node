var http = require('http');
var fs = require('fs');
var url = require('url');
var canv = require('canvas');
var querystring = require('querystring');
const sqlite3 = require('sqlite3').verbose();
var mkdirp = require('mkdirp');

let db = new sqlite3.Database(':memory:', (err) => {
  if(err){
    return console.error(err.message);
  }
  console.log('Connected to the in-memory SQlite database.');
});

db.serialize(() => {
  db.each(`CREATE TABLE all_image_filenames (image_filename VARCHAR(255))`, (err, row) => {
    if(err){
      console.error(err.message);
    }
  });
});

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

        var image_file_info = note['Content-Disposition'].split('; ');
        var image_filename = image_file_info[2].substring(10, image_file_info[2].length-1);

        mkdirp("archives", function(err){
          if(err){
            return;
          }
          fs.writeFile("archives/" + image_filename, binary_data, 'binary', function(err){});
        });

        sql_insert = `INSERT INTO all_image_filenames (image_filename) VALUES ('` + image_filename + `')`;

        db.serialize(() => {
          db.each(sql_insert, (err, row) => {
            if(err){
              console.error(err.message);
            }
          });
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
    else if(filename == "./results"){
      fs.readFile('results.html', function(err, data){  
        res.writeHead(200, {'Content-Type': 'text/html'});
        res.write(data);
        res.end();
      });
    }
    else if(filename == "./all_image_filenames.json"){
      var all_image_filenames_object = {}
      all_image_filenames_object.array = [];

      db.all(`SELECT image_filename FROM all_image_filenames`, (err, rows) => {
        rows.forEach(function (row){
          all_image_filenames_object.array.push(row.image_filename);
        })
        all_image_filenames_string = JSON.stringify(all_image_filenames_object);
        res.writeHead(200, {'Content-Type': 'application/json'});
        res.write(all_image_filenames_string);
        res.end();
        if(err){
          console.error(err.message);
        }
      });
    }
    else if(filename.includes("jpeg") || filename.includes("jpg") || filename.includes("png")){
      var image_filename;
      image_filename = "archives" + q.pathname;

      fs.readFile(image_filename, function(err, data){
        if(err){
          res.end();
          return;
        }  
        res.writeHead(200, {'Content-Type': 'image/jpeg'});
        res.write(data);
        res.end();
      });
    }
  }
}).listen(8080);