import express from 'express';
import morgan from 'morgan';

const PORT = 3000;
const host = 'localhost';
const app = express();

const LANGUAGE_DATA = {
  english: {
    path: "/english",
    code: 'en-US',
    flag: "flag_us.png",
    alt: "US Flag",
    title: "Go to US English site",
  },
  french: {
    path: "/french",
    code: 'fr-FR',
    flag: "flag_fr.png",
    alt: "Drapeau de la France",
    title: "Aller sur le site français",
  },
  serbian: {
    path: "/serbian",
    code: 'sr-Cyrl-rs',
    flag: "flag_rs.png",
    alt: "Застава Србије",
    title: "Идите на српски сајт",
  },
}

app.set('views', './views');
app.set('view engine', 'pug');

app.use(express.static('public'));
app.use(morgan('common'));

app.locals.currentPathClass = (path, currentPath) => {
  return path === currentPath ? "current" : "";
};

app.get('/', (req, res) => {
  res.redirect('/english');
});

/** 
 * refactored callback form
 */
// const helloWorld = (view, language) => {
//   return (req, res) => {
//     res.render(view, {
//       countries: Object.values(LANGUAGE_DATA),
//       currentPath: req.path,
//       language,
//     });
//   };
// };
// app.get('/english', helloWorld('hello-world-english', 'en-US'));
// app.get('/french', helloWorld('hello-world-french', 'fr-FR'));
// app.get('/serbian', helloWorld('hello-world-serbian', "sr-Cyrl-rs"));

// parameterized route form
app.get('/:language', (req, res, next) => {
  const language = req.params.language;
  if (!language in LANGUAGE_DATA) {
    next(new Error(`Language not supported: ${language}`));
  } else {
    res.render(`hello-world-${language}`, {
      countries: Object.values(LANGUAGE_DATA),
      currentPath: req.path,
      language: LANGUAGE_DATA[language].code,
    });
  }
});

// app.get('*', (req, res) => {
//   res.statusCode = 404;
//   res.end();
// })

app.use((err, req, res, _next) => {

});

app.listen(PORT, host, () => {
  console.log(`Listening on port ${PORT}...`);
});