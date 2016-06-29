// This runs a publicly visible site where user's computer can connect to.
// cPort is the port number the agent on the user server computer connect to.
// sPort is the port number the client on the public side connect to.

var express = require('express');
var app = express();
var http = require('http');
var spawn = require('child_process').spawn;

var paths = {};  // path -> [cPort, sPort]
var ports = {};  // port -> path

function findPortsForPath(path) {
  var cPort = null;
  var sPort = null;
  for (var i = 1024; i < 32768; i++) {
    if (!ports[i]) {
      if (!cPort) {
        cPort = i;
      } else if (!sPort) {
        sPort = i;
        paths[path] = [cPort, sPort];
        ports[cPort] = path;
        ports[sPort] = path;
	return [cPort, sPort];
      }
    }
  }
  return null;
};

function forward(req, res) {
  console.log('forward');
  var path = req.url;
  var ports = paths[path];
  console.log(path, ports);
  var url = 'http://localhost:' + ports[1];
  var req = http.request(url, function(res1) {
    var headers = res1.headers;
    res.writeHead(res1.statusCode, headers);
    res1.on('data', function(chunk) {
      res.write(chunk);
      res.end();
    });
  });
  req.write('');
  req.end();
};

app.get('/', function(req, res) {
  var path = req.query.p;
  var firstTime = false;
  if (path) {
    var newPorts = findPortsForPath(path);

    var args = ['-L', '-q', newPorts[0], '-p', newPorts[1], '-n', '-g', '3'];

    var daemon = spawn('./tgcd', args);

    daemon.stderr.on('data', function(data) {
      if (!firstTime) {
        firstTime = true;
        res.send('ack: ' + newPorts[0]);
        app.get(path, forward);
      }
      console.log('stderr: ' + data);
    });
  } else {
    res.send('nop');
  }
});

app.listen(2033, function () {
  console.log('TCP Gender Changer Server is listening on port 2033!');
});