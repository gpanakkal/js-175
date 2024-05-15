import express from 'express';
import morgan from 'morgan';
import todoLists from './lib/seed-data.js';
import TodoList from './lib/todolist.js';
import flash from 'express-flash';
import session from 'express-session';
import { body, validationResult } from 'express-validator';

// #region CONSTANTS
const PORT = 3000;
const HOST = 'localhost';
const app = express();
const MAX_TITLE_LENGTH = 100;
// #endregion

// #region HELPERS
const sortTodoLists = (lists) => lists
  .toSorted((a, b) => ((a.title.toLowerCase() > b.title.toLowerCase()) - 0.5))
  .toSorted((a, b) => (a.isDone() - b.isDone()));

const validateTitle = (req, res) => {
  const { todoListTitle } = req.body;
  const title = todoListTitle.trim();
  if (title.length === 0) {
    req.flash('error', 'A title was not provided.');
    res.render('new-list', {
      flash: req.flash(),
    });
  } else if (title.length > MAX_TITLE_LENGTH) {
    req.flash('error', 'Title must be 100 characters or fewer.');
    res.render('new-list', {
      flash: req.flash(),
      todoListTitle,
    });
  } else if (todoLists.some((todoList) => todoList.title === title)) {
    req.flash('error', 'A list with this title already exists.');
    res.render('new-list', {
      flash: req.flash(),
      todoListTitle,
    });
  } else {
    todoLists.push(new TodoList(title));
    req.flash('success', 'The todo list has been created');
    res.redirect('/lists');
  }
}
// #endregion

// #region TEMPLATING ENGINE
app.set('views', './views');
app.set('view engine', 'pug');
// #endregion

// #region MIDDLEWARE
app.use(morgan('common')); // logs HTTP requests
app.use(express.static('public')); // uses public as the start point for relative path fetching of  static assets
app.use(express.urlencoded({ extended: false })); // required for form submissions
app.use(session({
  name: 'launch-school-todos-session-id',
  resave: false,
  saveUninitialized: true,
  secret: 'This is not very secure',
}));
app.use(flash());
app.use((req, res, next) => {
  res.locals.flash = req.session.flash;
  delete req.session.flash;
  next();
});
// #endregion

//  #region ROUTES
app.get('/', (req, res) => {
  res.redirect('/lists');
});

app.get('/lists', (req, res) => {
  res.render('lists', { 
    todoLists: sortTodoLists(todoLists) });
});

app.get('/lists/new', (req, res) => {
  res.render('new-list');
});

app.post('/lists', (req, res) => {
  validateTitle(req, res);
})
// #endregion

// #region SERVER INIT

app.listen(PORT, HOST, () => {
  console.log(`Listening on port ${PORT}...`);
});
// #endregion
