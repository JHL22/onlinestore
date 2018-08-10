var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var FacebookStrategy = require('passport-facebook').Strategy;
var secret = require('../config/secret');
var User = require('../models/user');

var async = require('async');
var Cart = require('../models/cart');

// serialize and deserialize
passport.serializeUser(function(user, done) {
  done(null, user._id); // "done" same as "next" (callback)
});

passport.deserializeUser(function(id, done) {
  User.findById(id, function(err, user) {
    done(err, user);
  });
});

// Middleware
passport.use(
  'local-login',
  new LocalStrategy(
    {
      usernameField: 'email',
      passwordField: 'password',
      passReqToCallback: true
    },
    function(req, email, password, done) {
      User.findOne({ email: email }, function(err, user) {
        if (err) return done(err);

        if (!user) {
          return done(null, false, req.flash('loginMessage', 'Wrong User'));
        }
        if (!user.comparePassword(password)) {
          return done(
            null,
            false,
            req.flash('loginMessage', 'Password Incorrect')
          );
        }
        return done(null, user);
      });
    }
  )
);

passport.use(
  new FacebookStrategy(secret.facebook, function(
    token,
    refreshToken,
    profile,
    done
  ) {
    User.findOne({ facebook: profile.id }, function(err, user) {
      if (err) return done(err);

      if (user) {
        return done(null, user);
      } else {
        async.waterfall([
          function(callback) {
            var newUser = new User();
            newUser.email = profile._json.email;
            newUser.facebook = profile.id;
            newUser.tokens.push({ kind: 'facebook', token: token });
            newUser.profile.name = profile.displayName;
            newUser.profile.picture =
              'https://graph.facebook.com/' +
              profile.id +
              '/picture?type=large';

            newUser.save(function(err) {
              if (err) throw err;

              callback(err, newUser);
            });
          },

          function(newUser) {
            var cart = new Cart();
            cart.owner = newUser._id;
            cart.save(function(err) {
              if (err) return done(err);
              return done(err, newUser);
            });
          }
        ]);
      }
    });
  })
);

// custom function to validate
exports.isAuthenticated = function(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  } else {
    console.log('Not Authenticated');
    res.redirect('/login');
  }
};

// custom function to validate Admin
exports.isAdmin = function(req, res, next) {
  User.findOne({ _id: req.user._id }, function(err, user) {
    if (err) {
      return next('err');
      console.log('error finding user');
    } else if (user.profile.name !== 'admin') {
      console.log('Not Admin');
      res.send(403);
    } else {
      return next();
    }
  });
  // }
};
