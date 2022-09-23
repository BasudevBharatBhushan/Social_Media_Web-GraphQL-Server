require("dotenv").config();
const bcrypt = require("bcryptjs"); /*- npm i bcryptjs*/
const jwt = require("jsonwebtoken"); /*- npm i jsonwebtoken*/
const { UserInputError } = require("apollo-server");

const {
  validateRegisterInput,
  ValidateLoginInput,
  validateLoginInput,
} = require("../../util/validators");
// const {SECRET_KEY} = require('../../config');
const User = require("../../models/User");

function generateToken(user) {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      username: user.username,
    },
    process.env.SECRET_KEY,
    { expiresIn: "1h" }
  );
}

module.exports = {
  Mutation: {
    async login(_, { input: { username, password } }) {
      const { valid, errors } = validateLoginInput(username, password);
      const user = await User.findOne({ username });

      if (!valid) {
        throw new UserInputError("Errors", { errors });
      }

      if (!user) {
        errors.general = "User not found";
        throw new UserInputError("User not found", { errors });
      }

      const match = await bcrypt.compare(password, user.password);
      if (!match) {
        errors.general = "Wrong Credentials";
        throw new UserInputError("Wrong Credentials", { errors });
      }

      const token = generateToken(user);
      return {
        ...user._doc,
        id: user._id,
        token,
      };
    },
    async register(
      _,
      {
        registerInput: { username, email, password, confirmPassword },
      } /*register( _ , args , context , info){*/
    ) {
      /*-Validate User Data-*/
      const { valid, errors } = validateRegisterInput(
        username,
        email,
        password,
        confirmPassword
      );
      if (!valid) {
        throw new UserInputError("Errors", { errors });
      }

      /*-Make Sure user doesn't already exist-*/
      const user = await User.findOne({ username });
      if (user) {
        throw new UserInputError("Username is taken", {
          errors: {
            username: "This username is taken",
          },
        });
      }
      //hash password and create an auth token
      password = await bcrypt.hash(password, 12);
      const newUser = new User({
        email: email,
        username: username,
        password: password,
        createdAt: new Date().toISOString(),
      });

      const res = await newUser.save();

      const token = generateToken(res);

      return {
        ...res._doc,
        id: res._id,
        token,
      };
    },
  },
};
