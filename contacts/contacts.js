import express from 'express';
import morgan from 'morgan';
import { body, validationResult } from 'express-validator';
import session from 'express-session';
import store from 'connect-loki';
import flash from 'express-flash';

//#region constants
const PORT = 3000;
const HOST = 'localhost';
const app = express();
const LokiStore = store(session);

const MAX_NAME_LENGTH = 25;
const SESSION_MAXIMUM_AGE =  31 * 24 * 60 * 60 * 1000; // 31 days in milliseconds

const contactData = [
  {
    firstName: 'Mike',
    lastName: 'Jones',
    phoneNumber: '281-330-8004',
  },
  {
    firstName: "Jenny",
    lastName: "Keys",
    phoneNumber: "768-867-5309",
  },
  {
    firstName: "Max",
    lastName: "Entiger",
    phoneNumber: "214-748-3647",
  },
  {
    firstName: "Alicia",
    lastName: "Keys",
    phoneNumber: "515-489-4608",
  },
];
//#endregion
//#region helper functions
const sortContacts = (contacts) => {
  return [...contacts].sort((contactA, contactB) => {
    if (contactA.lastName !== contactB.lastName) {
      return Number(contactA.lastName > contactB.lastName) - 0.5;
    } else if (contactA.firstName !== contactB.firstName) {
      return Number(contactA.firstName > contactB.firstName) - 0.5;
    } else return 0;
  });
};

const capitalize = (str) => str.split('. ')
  .map((sentence) => sentence? sentence[0].toUpperCase() + sentence.slice(1) : '')
  .join('. ');

const validateName = (name, label) => {
  return body(name)
  .trim()
  .isLength({ min: 1 })
  .withMessage(`${capitalize(label)} is required.`)
  .bail()
  .isLength({ max: MAX_NAME_LENGTH })
  .withMessage(`${capitalize(label)} is too long. Maximum length is ${MAX_NAME_LENGTH} characters.`)
  .isAlpha()
  .withMessage(`${capitalize(label)} must contain only letters.`);
};

const clone = (obj) => JSON.parse(JSON.stringify(obj));
//#endregion
// templating engine
app.set('views', './views');
app.set('view engine', 'pug');

//#region middleware
app.use(express.static('public'));
app.use(express.urlencoded({ extended: false }));
app.use(morgan('common'));

app.use(session({
  cookie: {
    httpOnly: true,
    maxAge: SESSION_MAXIMUM_AGE,
    path: '/',
    secure: false,
  },
  name: 'launch-school-contacts-manager-session-id',
  resave: false,
  saveUninitialized: true,
  secret: 'this is not very secure',
  store: new LokiStore({}),
}));

app.use(flash());

app.use((req, res, next) => {
  if (!('contactData' in req.session)) {
    req.session.contactData = clone(contactData);
  }

  next();
});

app.use((req, res, next) => {
  res.locals.flash = req.session.flash;
  delete req.session.flash;
  next();
})
//#endregion
//#region routes
app.get('/', (req, res) => {
  res.redirect('/contacts');
});

app.get('/contacts', (req, res) => {
  res.render('contacts', {
    contacts: sortContacts(req.session.contactData),
  });
});

app.get('/contacts/new', (req, res) => {
  res.render('new-contact-form');
});

app.post('/contacts/new', 
  [
    validateName('firstName', 'first name'),
    validateName('lastName', 'last name'),

    body('phoneNumber')
      .trim()
      .isLength({ min: 1 })
      .withMessage('Phone number is required.')
      .bail()
      .matches(/^\d{3}-\d{3}-\d{4}$/)
      .withMessage('Phone number format should be ###-###-####.')
  ],
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      errors.array().forEach((error) => req.flash('error', error.msg));
      req.flash('info', "I'm a doctor, not a bricklayer.");
      res.render('new-contact-form', {
        flash: req.flash(),
        firstName: res.locals.firstName,
        lastName: res.locals.lastName,
        phoneNumber: res.locals.phoneNumber,
      });
    } else {
      next();
    }
  },
  (req, res, next) => {
    const { firstName, lastName, phoneNumber } = req.body;
    req.session.contactData.push({ firstName, lastName, phoneNumber });
    req.flash('success', 'New contact added!');
    res.redirect('/contacts');
  },
);
//#endregion
// server init
app.listen(PORT, HOST, () => {
  console.log(`Listening on port ${PORT}...`);
});
