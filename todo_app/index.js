// #region IMPORTS
import express from 'express';
import morgan from 'morgan';
// import todoLists from './lib/seed-data.js';
import TodoList from './lib/todolist.js';
import Todo from './lib/todo.js';
import flash from 'express-flash';
import session from 'express-session';
import store from 'connect-loki';
import { body, validationResult } from 'express-validator';
import { sortTodoLists, sortTodos } from './lib/sort.js';
// #endregion

// #region CONSTANTS
const PORT = 3000;
const HOST = 'localhost';
const app = express();
const LokiStore = store(session);
const COOKIE_MAX_AGE = 30 * 24 * 60 * 60 * 1000; // 30 days in milliseconds 
const MAX_TITLE_LENGTH = 100;
// #endregion

// #region HELPERS
const listTitleIsUnique = (title, { req }) => !req.session.todoLists
  .some((list) => list.title.toLowerCase() === title.toLowerCase());

const todoTitleIsUnique = (list, title) => !list.findByTitle(title);

const getTodoList = (todoListId, todoLists) => {
  return todoLists.find((todoList) => todoList.id === Number(todoListId));
}

const getTodo = (todoListId, todoId, todoLists) => {
  const todoList = getTodoList(todoListId, todoLists);
  if (!todoList) return;
  return todoList.toArray().find((todo) => todo.id === Number(todoId));
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
  cookie: {
    httpOnly: true,
    maxAge: COOKIE_MAX_AGE,
    path: '/',
    secure: false,
  },
  name: 'launch-school-todos-session-id',
  resave: false,
  saveUninitialized: true,
  secret: 'This is not very secure',
  store: new LokiStore({}),
}));

app.use(flash());

app.use((req, res, next) => {
  if(!('todoLists' in req.session)) {
    req.session.todoLists = [];
  }

  next();
});

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
    todoLists: sortTodoLists(req.session.todoLists) });
});

app.get('/lists/new', (req, res) => {
  res.render('new-list');
});

app.get('/lists/:listId', (req, res, next) => {
  const todoList = getTodoList(req.params.listId, req.session.todoLists);
  if (!todoList) {
    next(new Error('List not found'));
  } else {
    res.render('list', {
      todoList,
      todos: sortTodos(todoList),
    });
  }
});

app.get('/lists/:listId/edit', (req, res, next) => {
  const todoList = getTodoList(req.params.listId, req.session.todoLists);
  if (!todoList) {
    next(new Error('List not found'));
  } else {
    res.render('edit-list', {
      todoList,
    });
  }
});

app.post('/lists/:listId/edit',
  [
    body('todoListTitle')
      .trim()
      .isLength({ min: 1 })
      .withMessage('The list title is required.')
      .isLength({ max: MAX_TITLE_LENGTH })
      .withMessage(`Title must be ${MAX_TITLE_LENGTH} characters or fewer.`)
      .custom(listTitleIsUnique)
      .withMessage('A list with this title already exists.'),
  ],
  (req, res, next) => {
    const todoList = getTodoList(req.params.listId, req.session.todoLists);
    if (!todoList) {
      next(new Error('List not found'));
    } else {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        errors.array().forEach((error) => req.flash('error', error.msg));
        res.render(`edit-list`, {
          flash: req.flash(),
          todoList,
          todoListTitle: req.body.todoListTitle,
        });
      } else {
        todoList.setTitle(req.body.todoListTitle);
        req.flash('success', 'List renamed successfully.');
        res.redirect(`/lists/${todoList.id}`);
      }
    }
  }
);

app.post('/lists/:listId/destroy', (req, res, next) => {
  const todoLists = req.session.todoLists;
  const todoList = getTodoList(req.params.listId, todoLists);
  if (!todoList) {
    next(new Error('List not found'));
  } else {
    const index = todoLists.indexOf(todoList);
    todoLists.splice(index, 1);
    req.flash('success', 'List deleted');
    res.redirect('/lists');
  }
});

app.post('/lists',
  [
    body('todoListTitle')
      .trim()
      .isLength({ min: 1 })
      .withMessage('The list title is required.')
      .isLength({ max: MAX_TITLE_LENGTH })
      .withMessage(`Title must be ${MAX_TITLE_LENGTH} characters or fewer.`)
      .custom(listTitleIsUnique)
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
      req.session.todoLists.push(new TodoList(req.body.todoListTitle));
      req.flash('success', 'The todo list has been created.');
      res.redirect('/lists');
    }
  }
);

app.post('/lists/:listId/todos',
  [
    body('todoTitle')
      .trim()
      .isLength({ min: 1 })
      .withMessage('The todo must have a title.')
      .isLength({ max: MAX_TITLE_LENGTH })
      .withMessage(`Title must be ${MAX_TITLE_LENGTH} characters or fewer.`)
  ],
  (req, res, next) => {
    const { listId } = req.params;
    const todoList = getTodoList(listId, req.session.todoLists);
    if (!todoList) {
      next(new Error('List not found'));
    } else {
      const errors = validationResult(req);
      if(!errors.isEmpty()) {
        errors.array().forEach((error) => req.flash('error', error.msg));
        res.render('list', {
          flash: req.flash(),
          todoList,
          todos: sortTodos(todoList),
          todoTitle: req.body.todoTitle,
        });
      } else {
        todoList.add(new Todo(req.body.todoTitle));
        req.flash('success', 'Todo created.');
        res.redirect(`/lists/${listId}`);
      }
    }
  }
);

app.post('/lists/:listId/todos/:todoId/toggle', (req, res, next) => {
  const { listId, todoId } = req.params;
  const todo = getTodo(listId, todoId, req.session.todoLists);
  if (!todo) {
    next(new Error('todo not found'));
    // req.flash('error', 'Todo not found');
    // res.redirect(`/list/${listId}`);
  } else {
    if (todo.isDone()) {
      todo.markUndone();
      req.flash(`${todo.title} marked as not done`);
    } else {
      todo.markDone();
      req.flash(`${todo.title} marked done`);
    }
    res.redirect(`/lists/${listId}`);
  }
});

app.post('/lists/:listId/todos/:todoId/destroy', (req, res, next) => {
  const { listId, todoId } = req.params;
  const todo = getTodo(listId, todoId, req.session.todoLists);
  if (!todo) {
    next(new Error('todo not found'));
  } else {
    const title = todo.title;
    const list = getTodoList(listId, req.session.todoLists);
    const index = list.findIndexOf(todo);
    list.removeAt(index);
    req.flash(`Todo "${title}" deleted`);
    res.redirect(`/lists/${listId}`);
  }
});

app.post('/lists/:listId/complete_all', (req, res, next) => {
  const todoList = getTodoList(req.params.listId, req.session.todoLists);
  if (!todoList) {
    next(new Error('List not found'));
  } else {
    todoList.markAllDone();
    req.flash(`All items marked complete`);
    res.redirect(`/lists/${req.params.listId}`);
  }
});
// #endregion

// #region SERVER INIT

app.listen(PORT, HOST, () => {
  console.log(`Listening on port ${PORT}...`);
});
// #endregion
