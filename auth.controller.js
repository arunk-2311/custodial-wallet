const config = require("../config/auth.config");
const db = require("../models");
const Joi = require("joi");
const User = db.user;

var jwt = require("jsonwebtoken");
var bcrypt = require("bcryptjs");

exports.signup = (req, res) => {
  const user = new User({
    email: req.body.email,
    password: bcrypt.hashSync(req.body.password, 8),
  });

  const { error } = validateUser({
    email: req.body.email,
    password: bcrypt.hashSync(req.body.password, 8),
  });

  if (error) return res.status(400).send(error.details[0].message);

  user.save((err, u) => {
    if (err) {
      res.status(500).send({ message: err });
      return;
    } else {
      console.log(u._id);
    }
  });

  res.send({ message: "User was registered successfully!" });
};

exports.signin = (req, res) => {
  User.findOne({
    email: req.body.email,
  }).exec((err, user) => {
    if (err) {
      res.status(500).send({ message: err });
      return;
    }

    if (!user) {
      return res.status(404).send({ message: "User Not found." });
    }

    var passwordIsValid = bcrypt.compareSync(req.body.password, user.password);

    if (!passwordIsValid) {
      return res.status(401).send({
        accessToken: null,
        message: "Invalid Password!",
      });
    }

    var token = jwt.sign({ id: user.id }, config.secret, {
      expiresIn: 86400, // 24 hours
    });

    res.status(200).send({
      id: user._id,
      email: user.email,
      accessToken: token,
    });
  });
};

const validateUser = (user) => {
  const schema = Joi.object({
    email: Joi.string().email().min(5).max(50).required(),
    password: Joi.string().required(),
  });
  return schema.validate(user);
};
