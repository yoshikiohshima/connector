var http = require('http');
var spawn = require('child_process').spawn;

var addr = process.argv[2] || '127.0.0.1';
var path = process.argv[3] || '/abc';

var port = process.argv[4] || '3000';

console.log('addr: ' + addr);
console.log('path: ' + path);
var req = http.request('http://' + addr + ':2033?p=' + path, function(res) {
  res.setEncoding('utf8');
  res.on('data', function(chunk) {
    var ary = chunk.split(' ');
    if (ary[0] == 'ack:') { 
      var cmd = './tgcd -C -s localhost:' + '3000 -c ' + addr + ':' + ary[1];

      var args = ['-C', '-g', '3', '-n', '-s', 'localhost:' + port, '-c', addr + ':' + ary[1]];
      console.log(args.join(' '));
      var daemon = spawn('./tgcd', args);

      daemon.stderr.on('data', function(data) {
        console.log('stderr:' + data);
      });
    }
  });
});

req.write('');
req.end();

