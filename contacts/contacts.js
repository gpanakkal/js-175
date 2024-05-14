import express from 'express';
import morgan from 'morgan';

const PORT = 3000;
const HOST = 'localhost';
const app = express();

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

    next();
  },
  (req, res, next) => {
    if (req.body.firstName.length === 0) {
      res.locals.errorMessages.push('First name is required.');
    }

    next();
  },
  (req, res, next) => {
    if (req.body.lastName.length === 0) {
      res.locals.errorMessages.push('Last name is required.');
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

// (req, res) => {
//   const errorMessages = [];
//   const { firstName, lastName, phoneNumber } = req.body;
//   if (firstName.length === 0) {
//     errorMessages.push('First name is required.');
//   }
//   if (lastName.length === 0) {
//     errorMessages.push('Last name is required.');
//   }
//   if (phoneNumber.length === 0) {
//     errorMessages.push('Phone number is required.');
//   }
//   if (errorMessages.length > 0) {
//     res.render('new-contact-form', {
//       errorMessages,
//     });
//   } else {
//     contactData.push({ firstName, lastName, phoneNumber });
//     res.redirect('/contacts');
//   }
// }
);

app.listen(PORT, HOST, () => {
  console.log(`Listening on port ${PORT}...`);
});
