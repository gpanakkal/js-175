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
      (name) => !(/[^a-z\s]/i.test(name)), 
      (label) => `${label} must contain only letters.`
    ],
    [
      (fullName) => (!Object.values(contactData)
        .map((contact) => `${contact.firstName} ${contact.lastName}`)
        .includes(fullName)), 
      () => `Full name must be unique.`
    ],
  ]

  const errorMessages = [];
  conditions.forEach(([test, errorMsg]) => {
    if (!test(name)) {
      errorMessages.push(errorMsg(label));
    }
  });

  return errorMessages;
}

const isValidPhoneNumber = (number) => {
  const regex = /\d{3}-\d{3}-\d{4}/;
  return regex.test(number);
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
    res.locals.firstName = req.body.firstName.trim();
    res.locals.lastName = req.body.lastName.trim();
    res.locals.phoneNumber = req.body.phoneNumber.trim();
    next();
  },
  (req, res, next) => {
    res.locals.errorMessages.push(...validateName(res.locals.firstName, 'First name'));

    next();
  },
  (req, res, next) => {
    res.locals.errorMessages.push(...validateName(res.locals.lastName, 'Last name'));

    next();
  },
  (req, res, next) => {
    const fullName = `${res.locals.firstName} ${res.locals.lastName}`;
    res.locals.errorMessages.push(...validateName(fullName, 'Full name'));

    next();
  },
  (req, res, next) => {
    const phoneNumber = res.locals.phoneNumber;
    if (phoneNumber.length === 0) {
      res.locals.errorMessages.push('Phone number is required.');
    }
    if (!isValidPhoneNumber(phoneNumber)) {
      res.locals.errorMessages.push('Phone number format should be ###-###-####.');
    }
    next();
  },
  (req, res, next) => {
    if (res.locals.errorMessages.length > 0) {
      res.render('new-contact-form', {
        errorMessages: res.locals.errorMessages,
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
    contactData.push({ firstName, lastName, phoneNumber });
    res.redirect('/contacts');
  },
);

app.listen(PORT, HOST, () => {
  console.log(`Listening on port ${PORT}...`);
});
