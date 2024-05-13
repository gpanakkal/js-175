const DEFAULT_APR = 5;
const AMOUNT_INCREMENT = 100;
const DURATION_INCREMENT = 1;

function monthlyPayment(amount, durationYears, APR) {
  const MONTHS_PER_YEAR = 12;
  const aprToUse = APR || DEFAULT_APR;
  const MPR = aprToUse / MONTHS_PER_YEAR;
  const durationMonths = durationYears * MONTHS_PER_YEAR;
  const denom = 1 - ((1 + MPR / 100) ** -durationMonths);
  const monthlyInterest = amount * (MPR / 100) / denom;
  return monthlyInterest.toFixed(2);
}

function createLoanOffer(data) {
  const apr = data.apr || DEFAULT_APR;
  return {
    ...data,
    apr,
    payment: monthlyPayment(data.amount, data.duration, data.apr),
    amountIncrement: data.amount + AMOUNT_INCREMENT,
    amountDecrement: data.amount - AMOUNT_INCREMENT,
    durationIncrement: data.duration + DURATION_INCREMENT,
    durationDecrement: data.duration - DURATION_INCREMENT,
  }
}

export { createLoanOffer, DEFAULT_APR };