var router = require('express').Router();
var User = require('../models/user');
var Product = require('../models/product');
var Category = require('../models/category');
var Cart = require('../models/cart');
var User = require('../models/user');

////////////////////////////////////////////////
var passport = require('passport');
var passportConf = require('../config/passport');

////////////////////////////////////////////////

var async = require('async');

var stripe = require('stripe')('sk_test_Yc2Y2J6lqHsafOtSdf6euTYO');

// Pagination function
function paginate(req, res, next) {
  var perPage = 9;
  var page = req.params.page;

  Product.find()
    .skip(perPage * page)
    .limit(perPage)
    .populate('category')
    .exec(function(err, products) {
      if (err) return next(err);
      Product.count().exec(function(err, count) {
        if (err) return next(err);
        res.render('main/product-main', {
          products: products,
          pages: count / perPage
        });
      });
    });
}

router.get('/cart', passportConf.isAuthenticated, function(req, res, next) {
  Cart.findOne({ owner: req.user._id })
    .populate('items.item')
    .exec(function(err, foundCart) {
      if (err) return next(err);
      res.render('main/cart', {
        foundCart: foundCart,
        message: req.flash('remove')
      });
    });
});

router.post('/product/:product_id', function(req, res, next) {
  Cart.findOne({ owner: req.user._id }, function(err, cart) {
    // cart.items.push({
    cart.items.concat({
      item: req.body.product_id,
      price: parseFloat(req.body.priceValue),
      quantity: parseInt(req.body.quantity)
    });

    cart.total = (cart.total + parseFloat(req.body.priceValue)).toFixed(2);

    cart.save(function(err) {
      if (err) return next(err);
      return res.redirect('/cart');
    });
  });
});

router.post('/remove', function(req, res, next) {
  Cart.findOne({ owner: req.user._id }, function(err, foundCart) {
    foundCart.items.pull(String(req.body.item));

    foundCart.total = (foundCart.total - parseFloat(req.body.price)).toFixed(2);
    foundCart.save(function(err, found) {
      if (err) return next(err);
      req.flash('remove', 'Successfully removed');
      res.redirect('/cart');
    });
  });
});

// Search routes

router.post('/search', function(req, res, next) {
  res.redirect('/search?q=' + req.body.q);
  console.log(req.body.q);
});

router.get('/search', function(req, res, next) {
  Product.find({ $text: { $search: req.query.q } })
    .populate('category')
    .exec(function(err, data) {
      if (err) return next(err);
      res.render('main/search-result', {
        query: req.query.q,
        data: data
      });
      console.log(data);
    });
});

// Render Products using pagination
router.get('/', function(req, res, next) {
  if (req.user) {
    paginate(req, res, next);
  } else {
    res.render('main/home');
  }
});

router.get('/page/:page', function(req, res, next) {
  paginate(req, res, next);
});

router.get('/about', function(req, res) {
  res.render('main/about');
});

// Render Category page
router.get('/products/:id', function(req, res, next) {
  Product.find({ category: req.params.id })
    .populate('category') // gets all the data of the object itself.  data type must be ObjectId
    .exec(function(err, products) {
      // execute anonymous function for multiple methods (.find + .populate))
      if (err) return next(err);
      res.render('main/category', {
        products: products
      });
    });
});

// Render Product page
router.get('/product/:id', function(req, res, next) {
  Product.findById({ _id: req.params.id }, function(err, product) {
    if (err) return next(err);
    res.render('main/product', {
      product: product
    });
  });
});

// Payment Route
router.post('/payment', function(req, res, next) {
  var stripeToken = req.body.stripeToken;
  var currentCharges = Math.round(req.body.stripeMoney * 100); // Stripe is in cents so multiply by 100 for dollar - round up
  stripe.customers
    .create({
      source: stripeToken
    })
    .then(function(customer) {
      return stripe.charges.create({
        amount: currentCharges,
        currency: 'usd',
        customer: customer.id
      });
    })
    .then(function(charge) {
      async.waterfall([
        function(callback) {
          Cart.findOne({ owner: req.user._id }, function(err, cart) {
            callback(err, cart);
          });
        },
        function(cart, callback) {
          User.findOne({ _id: req.user._id }, function(err, user) {
            if (user) {
              for (var i = 0; i < cart.items.length; i++) {
                user.history.push({
                  item: cart.items[i].item,
                  paid: cart.items[i].price
                });
              }

              user.save(function(err, user) {
                if (err) return next(err);
                callback(err, user);
              });
            }
          });
        },
        function(user) {
          Cart.update(
            { owner: user._id },
            { $set: { items: [], total: 0 } },
            function(err, updated) {
              if (updated) {
                res.redirect('/profile');
              }
            }
          );
        }
      ]);
    });
});

module.exports = router;
