var http = require('http');
var fs = require('fs');
const {parse} = require('querystring');
var url = require('url');

class Leaf{
  constructor(content, id, children){
    this.content = content;
    this.id = id;
    this.children = children;
  }
}

function print_tree(leaf){
  if(leaf == null){
    return;
  }

  console.log(leaf.content + " " + leaf.id);
  
  var i;
  for(i=0;i < leaf.children.length;i++){
    print_tree(leaf.children[i]);
  }
}

function add_child(leaf, parent_id, content, id){
  if(leaf == null){
    return;
  }
 
  if(leaf.id == parent_id){
    leaf.children.push(new Leaf(content, id, []));
    return;
  }
 
  var i;
  for(i=0;i < leaf.children.length;i++){
    add_child(leaf.children[i], parent_id, content, id);
  }
}

var count = 0;
var root = null;

root = new Leaf("Hello, double click on a comment to reply...", count, []);
count = count+1;

http.createServer(function (req, res){
  if(req.method === 'POST'){
    let incoming = '';
    req.on('data', packet => {
      incoming = incoming + packet.toString();
    });
    req.on('end',() => {
      parse_incoming = parse(incoming);
      var new_content = parse_incoming.send_new_content;
      var parent_id = parse_incoming.send_parent_id;

      console.log(new_content);
      console.log(parent_id);
      
      add_child(root, parent_id, new_content, count);
      count = count+1;
      
      fs.readFile('forum_index.html', function(err, data){
        res.writeHead(200, {'Content-Type': 'text/html'});
        res.write(data);
        res.end();
      });
    });
  }
  else if(req.method === 'GET'){
    var q = url.parse(req.url, true);
    var filename = "." + q.pathname;

    if(filename == "./"){
      fs.readFile('forum_index.html', function(err, data){
        res.writeHead(200, {'Content-Type': 'text/html'});
        res.write(data);
        res.end();
      });
    }
    else if(filename == "./forum_tree.json"){
      var tree_string;
      tree_string = JSON.stringify(root);
      res.writeHead(200, {'Content-Type': 'application/json'});
      res.write(tree_string);
      console.log(tree_string);
      res.end();
    }
    else if(filename == "./forum_reply"){
      fs.readFile('forum_reply.html', function(err, data){
        res.writeHead(200, {'Content-Type': 'text/html'});
        res.write(data);
        res.end();
      });
    }
  }
}).listen(8080);