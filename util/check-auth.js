require("dotenv").config();
const jwt = require("jsonwebtoken"); //required to decode the token we got
const { AuthenticationError } = require("apollo-server");

// const {SECRET_KEY} = require('../config');   //Used to verify the Token

module.exports = (context) => {
  //cotext = {...headers}
  const authHeader = context.req.headers.authorization;
  if (authHeader) {
    // Bearer ...
    const token = authHeader.split("Bearer ")[1];
    if (token) {
      try {
        const user = jwt.verify(token, process.env.SECRET_KEY);
        return user;
      } catch (err) {
        throw new AuthenticationError("Invalid/Expired token");
      }
    }
    throw new Error("Authentication token must be 'Bearer [token]"); //It is saying the token should be formatted like that
  }
  throw new Error("Authorization header must be provided");
};
