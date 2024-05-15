import express from 'express';
import morgan from 'morgan';
import todoLists from './lib/seed-data.js';

// #region CONSTANTS
const PORT = 3000;
const HOST = 'localhost';
const app = express();
// #endregion

// #region HELPERS
const sortTodoLists = (lists) => lists
  .toSorted((a, b) => ((a.title.toLowerCase() > b.title.toLowerCase()) - 0.5))
  .toSorted((a, b) => (a.isDone() - b.isDone()))
// #endregion

// #region TEMPLATING ENGINE
app.set('views', './views');
app.set('view engine', 'pug');
// #endregion

// #region MIDDLEWARE
app.use(morgan('common'));
app.use(express.static('public'));
// #endregion

//  #region ROUTES
app.get('/', (req, res) => {
  res.render('lists', { todoLists: sortTodoLists(todoLists) });
});
// #endregion

// #region SERVER INIT

app.listen(PORT, HOST, () => {
  console.log(`Listening on port ${PORT}...`);
});
// #endregion
