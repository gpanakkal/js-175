/**
 * Simulate rolling a die by generating a random number and returning it in the body of the HTTP response.
 */
const HTTP = require('http');
const URL = require('url').URL;
const PORT = 3000;
const BASE_URL = `http://localhost:${PORT}`;
const DEFAULT_DICE_SIDES = 6;

const diceRoll = (min = 1, max = DEFAULT_DICE_SIDES) => Math.floor((Math.random() * max - min + 1) + min);

function getParams(path) {
  const url = new URL(path, BASE_URL);
  const params = url.searchParams;
  console.log(params);
  return params;
}

function getRolls(reqUrl) {
  const diceRollUrl = new URL(reqUrl, BASE_URL);
  const rollCount = Number(diceRollUrl.searchParams.get('rolls'));
  const diceSides = Number(diceRollUrl.searchParams.get('sides'));
  if (rollCount === null && diceSides === null) return [];
  const rolls = new Array(rollCount ?? 1).fill(null)
    .map(() => diceRoll(1, diceSides ?? undefined));
  return rolls;
}

const SERVER = HTTP.createServer((req, res) => {
  // console.log(req); // log the http.IncomingMessage object representing the request 
  console.log({method: req.method, path: req.url});
  if (req.url === '/favicon.ico') {
    res.statusCode = 404;
    res.end();
  } else {
    res.statusCode = 200;
    res.setHeader('Content-Type', 'text/plain');
    const content = getRolls(req.url).join('\n');
    res.write(`${content}\n`);
    res.write(`${req.method} ${req.url}\n`);
    res.end();
  }
});

SERVER.listen(PORT, () => { // listen for incoming TCP connections
  console.log(`Server listening on port ${PORT}...`);
});
