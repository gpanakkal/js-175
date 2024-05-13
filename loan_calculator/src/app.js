import { createServer } from 'http';
import { router, PORT } from './router.js';
import FINALHANDLER from 'finalhandler';

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

const SERVER = createServer((req, res) => {
  router(req, res, FINALHANDLER(req, res));
});

SERVER.listen(PORT, () => {
  console.log(`Listening on port ${PORT}...`);
});