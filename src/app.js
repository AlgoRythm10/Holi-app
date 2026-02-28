const express = require('express');
const app = express();

app.use(express.json());
app.get('/', (req, res) => res.send('Holi App API is running!'));
app.use('/api/users', require('./user/user.routes'));

module.exports = app;
