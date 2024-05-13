import express from 'express';
import morgan from 'morgan';

const PORT = 3000;
const host = 'localhost';
const app = express();

app.set('views', './views');
app.set('view engine', 'pug');

app.use(express.static('public'));
app.use(morgan('common'));

const writeLog = (req, res) => {
  const timeStamp = String(new Date()).substring(4, 24);
  console.log(`${timeStamp} ${req.method} ${req.originalUrl} ${res.statusCode}`);
}

const showEnglishView = (req, res) => {
  res.render('hello-world-english');
  // writeLog(req, res);
}
app.get('/', (req, res) => {
  res.redirect('/english');
  // writeLog(req, res);
});

app.get('/english', showEnglishView);

app.get('/french', (req, res) => {
  res.render('hello-world-french');
  // writeLog(req, res);
});

app.get('/serbian', (req, res) => {
  res.render('hello-world-serbian');
  // writeLog(req, res);
});

app.get('*', (req, res) => {
  res.statusCode = 404;
  res.end();
})

app.listen(PORT, host, () => {
  console.log(`Listening on port ${PORT}...`);
});