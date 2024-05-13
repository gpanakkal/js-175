import HANDLEBARS from 'handlebars';
const { compile } = HANDLEBARS;

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

const LOAN_FORM_TEMPLATE = compile(LOAN_FORM_SOURCE);
const LOAN_OFFER_TEMPLATE = compile(LOAN_OFFER_SOURCE);

export { LOAN_FORM_TEMPLATE, LOAN_OFFER_TEMPLATE };
