// Add to Heroku.  Server will recognize the values.

module.exports = {
  database: process.env.MONGO_URI,
  port: 3000,
  secretKey: process.env.SECRET_OR_KEY,

  facebook: {
    clientID: process.env.FACEBOOK_ID,
    clientSecret: process.env.FACEBOOK_SECRET,
    profileFields: ['emails', 'displayName'],
    callbackURL: 'http://localhost:3000/auth/facebook/callback'
  }
};
