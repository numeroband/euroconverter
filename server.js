var fs = require('fs');
var xml2js = require('xml2js');
var http = require('http');
var request = require('request');
var url = require('url');
var path = require('path');
 

function getValue(data, date, value) {
  var length = data.length;
  for (var i = 0; date && i < length; ++i) {
    var dateData = data[i];
    if (date > new Date(dateData.time)) {
      return {
        date: dateData.time, 
        value: (value * dateData.rate)
      }; 
    }
  }

  return {error:'Wrong date'};
}

function strToDate(strDate) {
  dateArray = strDate.split(/[-/]/);
  return (dateArray && dateArray.length == 3) ? new Date(dateArray[2], dateArray[1] - 1, dateArray[0]) : null;
}

function convert(data, queryData, res) {
  var result = [];
  var lines = queryData.data.split(/\r?\n/);
  for (var i = 0; i < lines.length; ++i) {
    var line = lines[i].split(/\t/);
    var value = getValue(data, strToDate(line[0]), new Number(line[1]));
    result.push(value);
  }

  res.writeHead(200, {'Content-Type': 'application/json'});
  res.end(JSON.stringify(result));
}

function notFound(res) {
  res.writeHead(404, {'Content-Type': 'text/html'});
  res.end('<html><body><h1>404: Not Found</body></html>');
}

function staticFile(pathname, res) {
  var contentType;
  switch (path.extname(pathname)) {
    case '.html':
      contentType = 'text/html';
      break;
    case '.js':
      contentType = 'application/javascript';
      break;
    default:
      notFound(res);
      return;
  }

  var filePath = path.join(__dirname, 'static', pathname);
  var stream = fs.createReadStream(filePath);
  stream.resume();

  stream.on('open', function() {
    res.writeHead(200, {'Content-Type': contentType});
    stream.pipe(res);
  });

  stream.on('error', function() {
    notFound(res);
  });
}

function startServer(data) {
  var ipaddress = process.env.OPENSHIFT_NODEJS_IP || '127.0.0.1';
  var port      = process.env.OPENSHIFT_NODEJS_PORT || 1337;

  http.createServer(function (req, res) {
    var parsedUrl = url.parse(req.url, true);
    var pathname = parsedUrl.pathname;

    if (pathname == '/convert') {
      convert(data, parsedUrl.query, res);
      return;
    } 

    if (pathname == '/') {
      pathname = '/index.html';
    }

    staticFile(pathname, res);
  }).listen(port, ipaddress);
  console.log('Server running at http://' + ipaddress + ':' + port + '/');
}

function parseData(xmlData) {
  console.log('Parsing data');
  xml2js.parseString(xmlData, function (err, result) {
    var data = result['gesmes:Envelope'].Cube[0].Cube;
    var length = data.length;
    var output = new Array();
    for (var i = 0; i < length; ++i) {
      var dayData = data[i];
      output[i] = {};
      output[i].time = dayData.$.time;
      output[i].rate = Number(dayData.Cube[0].$.rate);
    }

    fs.writeFileSync(__dirname + '/data.json', JSON.stringify(output));
    startServer(output);
  });
}

function downloadData() {
  console.log('Fetching data');
  request('http://www.ecb.europa.eu/stats/eurofxref/eurofxref-hist.xml', function (error, response, body) {
    console.log('Data received');
    if (!error && response.statusCode == 200) {
      parseData(body);
    }
  })
}

function readData(file, type) {
  console.log('Reading ' + file);
  fs.readFile(file, function(err, data) {
    switch (type) {
      case 'xml':
        parseData(data);
        break;
      case 'json':
        startServer(JSON.parse(data));
        break;
    }
  });
}

if (process.argv.length > 2 && process.argv[2] == 'cache')
{
  readData(__dirname + '/data.json', 'json');
} else {
  downloadData();
}
