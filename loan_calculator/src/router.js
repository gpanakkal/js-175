import ROUTER from 'router';
import SERVE_STATIC from 'serve-static';
import { URL } from 'url';
import QUERYSTRING from 'querystring';

import { LOAN_FORM_TEMPLATE, LOAN_OFFER_TEMPLATE } from './templates.js';
import { createLoanOffer, DEFAULT_APR } from './loanCalculator.js';

const PORT = 3000;
const BASE_URL = `http://localhost:${PORT}`;
const router = ROUTER();
router.use(SERVE_STATIC('public'));

function render(template, data) {
  let html = template(data);
  return html;
}

function getLoanParams(reqUrl) {
  const url = new URL(reqUrl, BASE_URL);
  const amount = Number(url.searchParams.get('amount'));
  const duration = Number(url.searchParams.get('duration'));
  const apr = Number(url.searchParams.get('apr'));
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
    data.apr = Number(data.apr);
    callback(data);
  });
}

router.get('/', (req, res) => {
  const content = render(LOAN_FORM_TEMPLATE, {apr: DEFAULT_APR});

  res.statusCode = 200;
  res.setHeader('Content-Type', 'text/html');
  res.write(`${content}\n`);
  res.end();
});

router.get('/loan-offer', (req, res) => {
  const data = createLoanOffer(getLoanParams(req.url));
  console.log(data);
  const content = render(LOAN_OFFER_TEMPLATE, data);

  res.statusCode = 200;
  res.setHeader('Content-Type', 'text/html');
  res.write(`${content}\n`);
  res.end();
});

router.post('/loan-offer', (req, res) => {
  parseFormData(req, (parsedData) => {
    const data = createLoanOffer(parsedData);
    const content = render(LOAN_OFFER_TEMPLATE, data);

    res.statusCode = 200;
    res.setHeader('Content-Type', 'text/html');
    res.write(`${content}\n`);
    res.end();
  });
});

router.get('*', (req, res) => {
  res.statusCode = 404;
  res.end();
});

export { router, PORT };
