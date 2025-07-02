// server.js
// where your node app starts

var fs = require('fs');

// init project
var express = require('express');
var app = express();

function checkHttps(req, res, next){
  // protocol check, if http, redirect to https
  
  if(req.get('X-Forwarded-Proto').indexOf("https")!=-1){
    //console.log("https, yo")
    return next()
  } else {
    //console.log("just http")
    res.redirect('https://' + req.hostname + req.url);
  }
}

app.all('*', checkHttps)

// we've started you off with Express, 
// but feel free to use whatever libs or frameworks you'd like through `package.json`.

// http://expressjs.com/en/starter/static-files.html
app.use(express.static('public'));

function getFilesInDirectory(dir) {
  return [].concat(...fs.readdirSync(dir).map(name => {
    const path = dir + '/' + name;
    const stats = fs.statSync(path);
    if (stats.isDirectory()) {
      return getFilesInDirectory(path);
    } else if (stats.isFile()) {
      return [path];
    } 
    return [];
  }));
}

app.get("/md", function (request, response) {
  response.header("Cache-Control", "max-age=0");
  const files = {};
  getFilesInDirectory('md').sort().forEach(path => {
    const fileName = path.replace(/md\/(.*)\.md/, '$1'); //trim off "md/" and ".md"
    files[fileName] = fs.readFileSync(path, 'utf8');
  });
  response.send(files);
});

// http://expressjs.com/en/starter/basic-routing.html
app.get("/", function (request, response) {
  response.sendFile(__dirname + '/views/index.html');
});

app.get("/offline", function (request, response) {
  response.sendFile(__dirname + '/views/offline.html');
});

app.get("/manifest.json", function (request, response) {
  response.sendFile(__dirname + '/views/manifest.json');
});

app.get("*", function (request, response) {
  response.sendFile(__dirname + '/views/404.html');
});

// listen for requests :)
var listener = app.listen(process.env.PORT, function () {
  console.log('Your app is listening on port ' + listener.address().port);
});
