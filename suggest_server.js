var http = require('http');
var fs = require('fs');
var url = require('url');
const {parse} = require('querystring');
const sqlite3 = require('sqlite3').verbose();

let db = new sqlite3.Database(':memory:', (err) => {
  if(err){
    return console.error(err.message);
  }
  console.log('Connected to the in-memory SQlite database.');
});

db.serialize(() => {
  db.each(`CREATE TABLE entries (city VARCHAR(255))`, (err, row) => {
    if(err){
      console.error(err.message);
    }
  });
});

var cities = ["stockholm", "oslo", "helsinki", "reykjavik", "bergen"];
var i;

for(i=0;i<cities.length;i++){
  sql_insert = `INSERT INTO entries (city) VALUES ('` + cities[i] + `')`;

  db.serialize(() => {
    db.each(sql_insert, (err, row) => {
      if(err){
        console.error(err.message);
      }
    });
  });
}

http.createServer(function (req, res){  
  if(req.method == 'POST'){
    var q = url.parse(req.url, true);
    var filename = "." + q.pathname;
    console.log(filename);

    let incoming = '';
    req.on('data', packet => {
      incoming = incoming + packet.toString();
    });
    req.on('end',() => {
      var parse_incoming = parse(incoming);
      
      if(filename == "./suggestion.json"){
        var partial = parse_incoming.partial;

        console.log(partial);
        partial.replace(/\W/g, '');

        var sql_query = `SELECT city FROM entries WHERE city LIKE '` + partial + `%' LIMIT 1`;
        var city = "";
        db.all(sql_query, (err, rows) => {
          rows.forEach(function (row){
            city = row.city;
            console.log(city);
          })

          if(partial.length == 0){
            city = "";
          }      

          var suggestion = {"suggestion":city};
          suggestion_string = JSON.stringify(suggestion);
          res.writeHead(200, {'Content-Type': 'application/json'});
          res.write(suggestion_string);
          res.end();
        });
      }
      else if(filename == "./results"){
        res.writeHead(200, {'Content-Type': 'text/html'});
        res.write("results");
        res.end();
      }
    });    
  }
  else if(req.method === 'GET'){
    var q = url.parse(req.url, true);
    var filename = "." + q.pathname;
    console.log(filename);

    if(filename == "./"){
      fs.readFile('suggest_index.html', function(err, data){
        res.writeHead(200, {'Content-Type': 'text/html'});
        res.write(data);
        res.end();
      });
    }
  }
}).listen(8080);