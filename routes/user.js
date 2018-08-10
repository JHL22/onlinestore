var router = require('express').Router();
var User = require('../models/user');
var Cart = require('../models/cart');
var async = require('async');
var passport = require('passport');
var passportConf = require('../config/passport');



router.get('/login', function(req, res){
    if (req.user) return res.redirect('/');

    // Send "message" to Signup page
    res.render('accounts/login', { message: req.flash('loginMessage')});
});

router.post('/login', passport.authenticate('local-login', {
    successRedirect: '/profile',
    failureRedirect: '/login',
    failureFlash: true
}));

router.get('/profile', passportConf.isAuthenticated, function(req, res, next){
  User
    .findOne({ _id: req.user._id })
    .populate('history.item')
    .exec(function(err, foundUser){
      if (err) return next (err);

      res.render('accounts/profile', { user: foundUser});
    });
});

router.get('/signup', function(req, res, next){
    res.render('accounts/signup', {
        errors: req.flash('errors')
    });
});

// Create a new user
router.post('/signup', function(req, res, next){

    async.waterfall([
        function(callback) {
            var user = new User();

            user.profile.name = req.body.name;
            user.email = req.body.email;
            user.password = req.body.password;
            // user.profile.picture = user.gravatar();
            User.findOne({ email: req.body.email }, function(err, existingUser){

                if (existingUser) {

                    // Send "errors" message to Signup page
                    req.flash('errors', 'Account with that email address already exists');
                    return res.redirect('/signup');

                } else {
                    user.save(function(err, user) {
                        if (err) return next(err);
                        callback(null, user);
                    });
                }
            });
        },

        // Pass user object as parameter in callback
        function(user) {
            var cart = new Cart();
            cart.owner = user._id; //every cart only belongs to one user
            cart.save(function(err){
                if (err) return next(err);

                // Add session to server and cookie to browser
                req.logIn(user, function(err){ //user = new saved user
                    if (err) return next(err);
                    res.redirect('/profile');
                });
            });
        }
    ]);
});

router.get('/logout', function(req, res, next){
    req.logout();
    res.redirect('/');
});

router.get('/edit-profile', function(req, res, next){
    res.render('accounts/edit-profile', {message: req.flash('success')});
});

router.post('/edit-profile', function(req, res, next){
    User.findOne({ _id: req.user._id }, function(err, user){

        if (err) return next(err);

        // replace existing data with new input
        if (req.body.name) user.profile.name = req.body.name;
        if (req.body.address) user.address = req.body.address;

        user.save(function(err){
            if (err) return next(err);
            req.flash('success', 'Successfully Edited your profile');
            return res.redirect('/edit-profile');
        });
    });
});

router.get('/auth/facebook', passport.authenticate('facebook', {scope: 'email'}));

router.get('/auth/facebook/callback', passport.authenticate('facebook', {
  successRedirect: '/profile',
  failureRedirect: '/login'
}));

module.exports = router;
