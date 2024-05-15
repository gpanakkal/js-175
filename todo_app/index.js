// #region IMPORTS
import express from 'express';
import morgan from 'morgan';
import todoLists from './lib/seed-data.js';
import TodoList from './lib/todolist.js';
import flash from 'express-flash';
import session from 'express-session';
import { body, validationResult } from 'express-validator';
import { sortTodoLists, sortTodos } from './lib/sort.js';
// #endregion

// #region CONSTANTS
const PORT = 3000;
const HOST = 'localhost';
const app = express();
const MAX_TITLE_LENGTH = 100;
// #endregion

// #region HELPERS
const titleIsUnique = (title) => !todoLists
  .some((list) => list.title.toLowerCase() === title.toLowerCase());

const getTodoList = (todoListId) => {
  return todoLists.find((todoList) => todoList.id === Number(todoListId));
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

app.use((err, req, res, next) => {
  console.log(err);
  res.status(404).send(err.message);
})
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

app.get('/lists/:listId', (req, res) => {
  const todoList = getTodoList(req.params.listId);
  if (!todoList) {
    next(new Error('List not found'));
  } else {
    res.render('list', {
      todoList,
      todos: sortTodos(todoList),
    });
  }
});

app.get('/list/:listId/edit', (req, res) => {
  const todoList = getTodoList(req.params.listId);
  if (!todoList) {
    next(new Error('List not found'));
  } else {
    res.render('list', {
      todoList,
      todos: sortTodos(todoList),
    });
  }
});

app.post('/lists',
  [
    body('todoListTitle')
      .trim()
      .isLength({ min: 1 })
      .withMessage('The list title is required.')
      .isLength({ max: MAX_TITLE_LENGTH })
      .withMessage('Title must be 100 characters or fewer.')
      .custom(titleIsUnique)
      .withMessage('A list with this title already exists.'),
  ],
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      errors.array().forEach((error) => req.flash('error', error.msg));
      res.render('new-list', {
        flash: req.flash(),
        todoListTitle: req.body.todoListTitle,
      });
    } else {
      todoLists.push(new TodoList(req.body.todoListTitle));
      req.flash('success', 'The todo list has been created.');
      res.redirect('/lists');
    }
  }
);
// #endregion

// #region SERVER INIT

app.listen(PORT, HOST, () => {
  console.log(`Listening on port ${PORT}...`);
});
// #endregion
