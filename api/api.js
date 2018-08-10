var router = require('express').Router();
var async = require('async');
var faker = require('faker');
var Category = require('../models/category');
var Product = require('../models/product');



// Search 
router.post('/search', function(req, res, next){
  Product
    .find({ query_string: { query: req.body.search_term}})
    .populate( 'category')
    .exec( function(err, results){
      if (err) return next (err);
      res.json(results);
    });
});


// Create fake data for categories using async
router.get('/:name', function(req, res, next){
    async.waterfall([
        function(callback) {
            Category.findOne({ name: req.params.name }, function(err, category){
                if (err) return next(err);
                callback(null, category);
            });
        },

        function(category, callback) {
            for (var i = 0; i < 30; i ++) {
                var product = new Product();
                product.category = category._id;
                product.name = faker.commerce.productName();
                product.price = faker.commerce.price();
                product.image = faker.image.image();

                product.save();
            }
        }
    ]);

    res.json({ message: 'Success' });
});

module.exports = router;
