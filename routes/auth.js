const Joi = require('joi');
const _ = require('lodash');
const bcrypt = require('bcrypt')
const validator = require('../middleware/validator')
const { User } = require('../models/user')
const express = require('express');
const router = express.Router();

router.post('/', validator(validate), async (req, res) => {
  let user = await User.findOne({ email: req.body.email })
  if (!user) return res.status(400).send('Invalid email or password');

  const validPassword = await bcrypt.compare(req.body.password, user.password);
  if (!validPassword) return res.status(400).send('Invalid email or password');

  const token = user.generateAuthToken();
  req.session.token = token;
  res.header('x-auth-token', token).send(`Welcome ${user.name}`)
  res.end();
});
function validate(req) {
  const schema = {
    email: Joi.string().min(5).max(255).required(),
    password: Joi.string().min(5).max(255).required()
  }

  return Joi.validate(req, schema);
}

module.exports = router;
