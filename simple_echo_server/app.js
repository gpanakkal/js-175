const HTTP = require('http');

const PORT = 3000;

const SERVER = HTTP.createServer((req, res) => {
  // console.log(req); // log the http.IncomingMessage object representing the request 
  console.log({method: req.method, path: req.url});
  if (req.url === '/favicon.ico') {
    res.statusCode = 404;
    res.end();
  } else {
    res.statusCode = 200;
    res.setHeader('Content-Type', 'text/plain');
    res.write(`${req.method} ${req.url}\n`);
    res.end();
  }
});

SERVER.listen(PORT, () => { // listen for incoming TCP connections
  console.log(`Server listening on port ${PORT}...`);
});
