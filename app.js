const http = require('http');

const hostname = '0.0.0.0';
const PORT = process.env.PORT || 3000;

const jsdom = require("jsdom");
const { JSDOM } = jsdom;

const server = http.createServer((req, res) => {
  res.statusCode = 200;
  res.setHeader('Content-Type', 'text/plain');
  
  
  JSDOM.fromURL("https://www.ufc.com/events", options).then(dom => {
	console.log(dom.serialize());
  });

  res.end('Hello World');
});

server.listen(PORT, hostname, () => {
  console.log(`Server running at http://${hostname}:${PORT}/`);
});