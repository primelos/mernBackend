const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const keys = require("../../config/keys");

const validateRegisterInput = require("../../validation/register");
const validateLoginInput = require("../../validation/login");

const User = require("../../Models/Users");

router.post("/register", (req, res) => {
  // for validation
  const { errors, isValid } = validateRegisterInput(req.body);
  // check validation
  if (!isValid) {
    return res.status(400).json(errors);
  }
  User.findOne({ email: req.body.email }).then((returnedStuff) => {
    if (returnedStuff) {
      return res.status(400).json({ email: "Email already exists!" });
    } else {
      const newUser = new User({
        name: req.body.name,
        email: req.body.email,
        password: req.body.password,
      });
      // saving user with request information to database
      bcrypt.genSalt(10, (err, salt) => {
        bcrypt.hash(newUser.password, salt, (err, hash) => {
          if (err) throw err;
          newUser.password = hash;
          newUser
            .save()
            .then((user) => res.json(user))
            .catch((err) => console.log(err));
        });
      });
    }
  });
});

router.post('/login', (req, res) => {
    // Form validation
    const {errors, isValid } = validateLoginInput(req.body)
    // Check validation
    if(!isValid) {
        return res.status(400).json(errors)
    }
    const email = req.body.email
    const password = req.body.password
    // find user by email
    User.findOne ({ email: email }).then(user => {
        // check if user exists
        if(!user) {
            return res.status(404).json({ emailnotfound: 'Email not found'
            })
        }
        // Check password
        bcrypt.compare(password, user.password).then(isMatch => {
            if(isMatch) {
                // User Matched
                // Create JWT Payload
                const payload = {
                    id: user.id,
                    name: user.name
                }
                // sign token
                jwt.sign(
                    payload,
                    keys.secretOrKey,
                    {
                        expiresIn: 1800
                    },
                    (err, token) => {
                        res.json({
                            success: true,
                            token: 'Bearer ' + token 
                        })
                    }
                )
            } else {
                return res
                    .status(400)
                    .json({ passwordincorrect: 'Password incorrect'})
            }
        })
    })
})

module.exports = router;
