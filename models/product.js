var mongoose = require('mongoose');
// var mongoosastic = require('mongoosastic');
var Schema = mongoose.Schema;

var ProductSchema = new Schema({
    category: { type: Schema.Types.ObjectId, ref: 'Category'},
    name: String,
    price: Number,
    image: String
});
ProductSchema.index({'$**': 'text'});

// ProductSchema.plugin(mongoosastic, {
//     hosts: [
//         'localhost:9200'
//     ]
// });


module.exports = mongoose.model('Product', ProductSchema);


// curl-XGET 'localhost:9200'
