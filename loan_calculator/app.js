const HTTP = require('http');
const URL = require('url').URL;
const QUERYSTRING = require('querystring');
const HANDLEBARS = require('handlebars');
const FS = require('fs');
const PATH = require('path');

const MIME_TYPES = {
  '.css': 'text/css',
  '.js': 'application/javascript',
  '.jpg': 'image/jpeg',
  '.png': 'image/png',
  '.ico': 'image/x-icon',
}

const PORT = 3000;
const BASE_URL = `http://localhost:${PORT}`;
const DEFAULT_APR = 5;
const AMOUNT_INCREMENT = 100;
const DURATION_INCREMENT = 1;

/**
 * Build a loan calculator.
 * - APR fixed at 5%
 * - loan amount ($) and duration (years) passed in as query string params
 * - calculate the monthly loan payment
 * - display the following:
 *   - loan amount (principal) in dollars
 *   - loan duration in years
 *   - APR as a percentage
 *   - monthly payment in dollars
 */
const LOAN_FORM_SOURCE = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Loan Calculator</title>
  <link rel="stylesheet" href="/assets/style.css">
</head>
<body>
  <article>
    <h1>Loan Calculator</h1>
    <form action="/loan-offer" method="post">
      <p>All loans are offered at an APR of {{apr}}%</p>
      <label for="amount">How much do you want to borrow (in dollars)?</label>
      <input type="number" name="amount" id="amount" value="">
      <label for="duration">How much time do you want to pay back your loan?</label>
      <input type="number" name="duration" id="duration" value="">
      <input type="submit" name="" value="Get loan offer!"> 
    </form>
  </article>
</body>
</html>
`;

const LOAN_OFFER_SOURCE = `
<!DOCTYPE html>
<html lang='en'>
  <head>
    <meta charset='utf-8'>
    <title>Loan Calculator</title>
    <link rel="stylesheet" href="/assets/style.css">
  </head>
  <body>
    <article>
      <h1>Loan Calculator</h1>
      <table>
        <tbody>
          <tr>
            <th>Amount:</th>
            <td>
              <a href='/loan-offer?amount={{amountDecrement}}&duration={{duration}}'>- $100</a>
            </td>
            <td>$ {{amount}}</td>
            <td>
              <a href='/loan-offer?amount={{amountIncrement}}&duration={{duration}}'>+ $100</a>
            </td>
          </tr>
          <tr>
            <th>Duration:</th>
            <td>
              <a href='/loan-offer?amount={{amount}}&duration={{durationDecrement}}'>- 1 year</a>
            </td>
            <td>{{duration}} years</td>
            <td>
              <a href='/loan-offer?amount={{amount}}&duration={{durationIncrement}}'>+ 1 year</a>
            </td>
          </tr>
          <tr>
            <th>APR:</th>
            <td colspan='3'>{{apr}}%</td>
          </tr>
          <tr>
            <th>Monthly payment:</th>
            <td colspan='3'>$ {{payment}}</td>
          </tr>
        </tbody>
      </table>
    </article>
  </body>
</html>
`;

const LOAN_FORM_TEMPLATE = HANDLEBARS.compile(LOAN_FORM_SOURCE);
const LOAN_OFFER_TEMPLATE = HANDLEBARS.compile(LOAN_OFFER_SOURCE);


function render(template, data) {
  let html = template(data);
  return html;
}

function getPathname(path) {
  return new URL(path, BASE_URL).pathname;
}

function getLoanParams(reqUrl) {
  const url = new URL(reqUrl, BASE_URL);
  const amount = Number(url.searchParams.get('amount'));
  const duration = Number(url.searchParams.get('duration'));
  const apr = Number(url.searchParams.get('apr') ?? DEFAULT_APR);
  return { amount, duration, apr };
}

function parseFormData(req, callback) {
  let body = '';
  req.on('data', (chunk) => {
    body += chunk.toString();
  });

  req.on('end', () => {
    const data = QUERYSTRING.parse(body);
    data.amount = Number(data.amount);
    data.duration = Number(data.duration);
    data.apr = Number(data.apr ?? DEFAULT_APR);
    callback(data);
  });
}

function monthlyPayment(amount, durationYears, APR = DEFAULT_APR) {
  const MONTHS_PER_YEAR = 12;
  const MPR = APR / MONTHS_PER_YEAR;
  const durationMonths = durationYears * MONTHS_PER_YEAR;
  const denom = 1 - ((1 + MPR / 100) ** -durationMonths);
  const monthlyInterest = amount * (MPR / 100) / denom;
  return monthlyInterest.toFixed(2);
}

function createLoanOffer(data) {
  return {
    ...data,
    payment: monthlyPayment(data.amount, data.duration, data.apr),
    amountIncrement: data.amount + AMOUNT_INCREMENT,
    amountDecrement: data.amount - AMOUNT_INCREMENT,
    durationIncrement: data.duration + DURATION_INCREMENT,
    durationDecrement: data.duration - DURATION_INCREMENT,
  }
}

const SERVER = HTTP.createServer((req, res) => {
  console.log({ method: req.method, url: req.url });
  const path = getPathname(req.url);
  let fileExtension = PATH.extname(path);
  FS.readFile(`./public${path}`, (err, data) => {
    if (data) {
      res.statusCode = 200;
      res.setHeader('Content-Type', `${MIME_TYPES[fileExtension]}`)
      res.write(`${data}\n`);
      res.end();
    } else {
      if (req.method === 'GET' && path === '/') {
        const content = render(LOAN_FORM_TEMPLATE, {apr: DEFAULT_APR});
    
        res.statusCode = 200;
        res.setHeader('Content-Type', 'text/html');
        res.write(`${content}\n`);
        res.end();
      } else if (req.method === 'GET' && path === '/loan-offer') {
        const data = createLoanOffer(getLoanParams(req.url));
        console.log(data);
        const content = render(LOAN_OFFER_TEMPLATE, data);
    
        res.statusCode = 200;
        res.setHeader('Content-Type', 'text/html');
        res.write(`${content}\n`);
        res.end();
      } else if (req.method === 'POST' && path === '/loan-offer') {
        parseFormData(req, (parsedData) => {
          const data = createLoanOffer(parsedData);
          const content = render(LOAN_OFFER_TEMPLATE, data);

          res.statusCode = 200;
          res.setHeader('Content-Type', 'text/html');
          res.write(`${content}\n`);
          res.end();
        });
      } else {
        res.statusCode = 400;
        res.end();
      }
    }
  });
});

SERVER.listen(PORT, () => {
  console.log(`Listening on port ${PORT}...`);
});