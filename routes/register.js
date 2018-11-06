const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
  res.render('register', {title: 'Register Page'})
})

module.exports = router