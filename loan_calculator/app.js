const HTTP = require('http');
const URL = require('url').URL;
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

const HTML_START = `
<!DOCTYPE html>
<html lang='en'>
  <head>
    <meta charset='utf-8'>
    <title>Loan Calculator</title>
    <style type="text/css">
      body {
        background: rgba(250, 250, 250);
        font-family: sans-serif;
        color: rgb(50, 50, 50);
      }

      article {
        width: 100%;
        max-width: 40rem;
        margin: 0 auto;
        padding: 1rem 2rem;
      }

      h1 {
        font-size: 2.5rem;
        text-align: center;
      }

      table {
        font-size: 1.5rem;
      }
    
      th {
        text-align: right;
      }

      td {
        text-align: center;
      }

      th, td {
        padding: 0.5rem;
      }
    </style>
  </head>
  <body>
    <article>
      <h1>Loan Calculator</h1>
      <table>
        <tbody>`;

const HTML_END = `
        </tbody>
      </table>
    </article>
  </body>
</html>`;

function tableRow(rowTitle, rowValues, attributes = '') {
  const dataCells = rowValues.map((value) => `<td ${attributes}>${value}</td>`);
  return `
          <tr>
            <th>${rowTitle}:</th>
            ${dataCells.join('\n')}
          </tr>`;
}

function incrementLinks(loan) {
  const newAmountLink = (newValue, label) => `<a href="/?amount=${newValue}&duration=${loan.duration.value}">${label}</a>`
  const incrementAmount = newAmountLink(loan.amount.value + AMOUNT_INCREMENT, `+ $${AMOUNT_INCREMENT}`);
  const decrementAmount = newAmountLink(loan.amount.value - AMOUNT_INCREMENT, `- $${AMOUNT_INCREMENT}`);
  
  const newDurationLink = (newValue, label) => `<a href="/?amount=${loan.amount.value}&duration=${newValue}">${label}</a>`
  const incrementYears = newDurationLink(loan.duration.value + DURATION_INCREMENT, `+ ${DURATION_INCREMENT} year`);
  const decrementYears = newDurationLink(loan.duration.value - DURATION_INCREMENT, `- ${DURATION_INCREMENT} year`);
  
  return { incrementAmount, decrementAmount, incrementYears, decrementYears };
}

function generateTable (loan) {
  const textLines = Object.values(loan).map((value) => value.str);
  const links = incrementLinks(loan);
  const rows = textLines.map((line) => {
    const [title, value] = line.split(': ');
    const values = [value];
    if (title === 'Amount') {
      values.unshift(links.decrementAmount);
      values.push(links.incrementAmount);
    } else if (title === 'Duration') {
      values.unshift(links.decrementYears);
      values.push(links.incrementYears);
    } else {
      return tableRow(title, values, `colspan='3'`);
    }
    return tableRow(title, values);
  });

  return rows.join('\n');
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
    amount: {
      value: principal,
      str: `Amount: $${principal}`,
    },
    duration: {
      value: durationYears,
      str: `Duration: ${durationYears} years`,
    },
    APR: {
      value: APR,
      str: `APR: ${APR}%`,
    },
    payment: {
      value: payment,
      str: `Monthly payment: $${payment}`,
    },
  }
}

const SERVER = HTTP.createServer((req, res) => {
  console.log({ method: req.method, url: req.url });
  const loan = loanValues(req.url);
  res.statusCode = 200;
  res.setHeader('Content-Type', 'text/html');
  const content = [HTML_START, generateTable(loan), HTML_END].join('\n');
  res.write(`${content}\n`);
  res.end();
});

SERVER.listen(PORT, () => {
  console.log(`Listening on port ${PORT}...`);
});