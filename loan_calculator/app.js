const HTTP = require('http');
const URL = require('url').URL;
const HANDLEBARS = require('handlebars');
const FS = require('node:fs');

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
 * - display the following in plain text, one per line:
 *   - loan amount (principal) in dollars
 *   - loan duration in years
 *   - APR as a percentage
 *   - monthly payment in dollars
 * 
 * monthlyPayment():
 * - given a principal, duration, and APR
 * - get monthly interest rate (MPR): APR / 12
 * - get duration in months: duration * 12
 * - denom: 1 - (1 + MPR) ** -durationMonths
 * - monthly interest: principal * MPR / denom
 * - return monthly interest
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
    <form action="/loan-offer" method="get">
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
  const principal = Number(url.searchParams.get('amount'));
  const durationYears = Number(url.searchParams.get('duration'));
  const APR = Number(url.searchParams.get('apr') ?? DEFAULT_APR);
  return { principal, durationYears, APR };
}

function monthlyPayment(principal, durationYears, APR = DEFAULT_APR) {
  const MONTHS_PER_YEAR = 12;
  const MPR = APR / MONTHS_PER_YEAR;
  const durationMonths = durationYears * MONTHS_PER_YEAR;
  const denom = 1 - ((1 + MPR / 100) ** -durationMonths);
  const monthlyInterest = principal * (MPR / 100) / denom;
  return monthlyInterest.toFixed(2);
}

function loanValues(reqUrl) {
  const { principal, durationYears, APR } = getLoanParams(reqUrl);
  const payment = monthlyPayment(principal, durationYears, APR);
  return {
    amount: principal,
    duration: durationYears,
    apr: APR,
    payment,
  }
}

function createTemplateData(loan) {
  return {
    ...loan,
    amountIncrement: loan.amount + AMOUNT_INCREMENT,
    amountDecrement: loan.amount - AMOUNT_INCREMENT,
    durationIncrement: loan.duration + DURATION_INCREMENT,
    durationDecrement: loan.duration - DURATION_INCREMENT,
  }
}

const SERVER = HTTP.createServer((req, res) => {
  console.log({ method: req.method, url: req.url });
  const path = getPathname(req.url);
  if (path === '/') {
    const content = render(LOAN_FORM_TEMPLATE, {apr: DEFAULT_APR});

    res.statusCode = 200;
    res.setHeader('Content-Type', 'text/html');
    res.write(`${content}\n`);
    res.end();
  } else if (path === '/loan-offer') {
    const loan = loanValues(req.url);
    const data = createTemplateData(loan);
    const content = render(LOAN_OFFER_TEMPLATE, data);

    res.statusCode = 200;
    res.setHeader('Content-Type', 'text/html');
    res.write(`${content}\n`);
    res.end();
  } else {
    res.statusCode = 400;
    res.end();
  }
});

SERVER.listen(PORT, () => {
  console.log(`Listening on port ${PORT}...`);
});