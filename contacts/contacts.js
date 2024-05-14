import express from 'express';
import morgan from 'morgan';

const PORT = 3000;
const HOST = 'localhost';
const app = express();
const MAX_NAME_LENGTH = 25;

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

const sortContacts = (contacts) => {
  return [...contacts].sort((contactA, contactB) => {
    if (contactA.lastName !== contactB.lastName) {
      return Number(contactA.lastName > contactB.lastName) - 0.5;
    } else if (contactA.firstName !== contactB.firstName) {
      return Number(contactA.firstName > contactB.firstName) - 0.5;
    } else return 0;
  });
};

const validateName = (name, label) => {
  const conditions = [
    [
      (name) => name.length > 0, 
      (label) => `${label} is required.`
    ],
    [
      (name) => name.length < MAX_NAME_LENGTH, 
      (label) => `${label} must be ${MAX_NAME_LENGTH} characters or fewer.`
    ],
    [
      (name) => !(/[^a-z]/i.test(firstName)), 
      (label) => `${label} must only contain letters.`
    ],
  ]

  const errorMessages = [];
  conditions.forEach(([test, errorMsg]) => {
    if (!test(name)) {
      errorMessages.push(errorMsg);
    }
  });
}

app.set('views', './views');
app.set('view engine', 'pug');

app.use(express.static('public'));
app.use(express.urlencoded({ extended: false }));
app.use(morgan('common'));

app.get('/', (req, res) => {
  res.redirect('/contacts');
});

app.get('/contacts', (req, res) => {
  res.render('contacts', {
    contacts: sortContacts(contactData),
  });
});

app.get('/contacts/new', (req, res) => {
  res.render('new-contact-form');
});

app.post('/contacts/new', 
  (req, res, next) => {
    res.locals.errorMessages = [];
    req.body.firstName = req.body.firstName.trim();
    req.body.lastName = req.body.lastName.trim();
    req.body.phoneNumber = req.body.phoneNumber.trim();
    next();
  },
  (req, res, next) => {
    const { firstName } = req.body;
    if (firstName.length === 0) {
      res.locals.errorMessages.push('First name is required.');
    } 
    if (firstName.length > MAX_NAME_LENGTH) {
      res.locals.errorMessages.push(`First name must be ${MAX_NAME_LENGTH} characters or fewer`);
    }
    if (/[^a-z]/i.test(firstName)) {
      res.locals.errorMessages.push(`First name must only contain letters`);
    }

    next();
  },
  (req, res, next) => {
    const { lastName } = req.body;
    if (lastName.length === 0) {
      res.locals.errorMessages.push('Last name is required.');
    } 
    if (lastName.length > MAX_NAME_LENGTH) {
      res.locals.errorMessages.push(`Last name must be ${MAX_NAME_LENGTH} characters or fewer`);
    }
    if (/[^a-z]/i.test(lastName)) {
      res.locals.errorMessages.push(`Last name must only contain letters`);
    }

    next();
  },
  (req, res, next) => {
    if (req.body.phoneNumber.length === 0) {
      res.locals.errorMessages.push('Phone number is required.');
    }
    
    next();
  },
  (req, res, next) => {
    if (res.locals.errorMessages.length > 0) {
      res.render('new-contact-form', {
        errorMessages: res.locals.errorMessages,
      });
    } else {
      next();
    }
  },
  (req, res, next) => {
    const { firstName, lastName, phoneNumber } = req.body;
    contactData.push({ firstName, lastName, phoneNumber });
    res.redirect('/contacts');
  },
);

app.listen(PORT, HOST, () => {
  console.log(`Listening on port ${PORT}...`);
});
