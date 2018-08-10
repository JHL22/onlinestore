var router = require('express').Router();
var Category = require('../models/category');

var passport = require('passport');
var passportConf = require('../config/passport');



router.get('/add-category', passportConf.isAuthenticated, passportConf.isAdmin, function(req, res, next){
    res.render('admin/add-category', { message: req.flash('success')});
});

router.post('/add-category', passportConf.isAuthenticated, passportConf.isAdmin, function(req, res, next){
    var category = new Category();
    category.name = req.body.name;

    category.save(function(err){
        if (err) return next(err);
        req.flash('success', 'Successfully added a category');
        return res.redirect('/add-category');
    });
});

module.exports = router;
