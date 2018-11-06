const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
  req.session
  res.render('login', {title: 'Login page'})
})

module.exports = router