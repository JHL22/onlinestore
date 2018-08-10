var mongoose = require('mongoose');
var bcrypt = require('bcrypt-nodejs');
var SALT_WORK_FACTOR = 10;
var Schema = mongoose.Schema;


/* The user schema attributes / characteristics / fields */
var UserSchema = new Schema({

    email: { type: String, unique: true, lowercase: true},
    password: String,

    facebook: String,
    tokens: Array,

    profile: {
        name: { type: String, default: ''},
        admin: {type: String, default: 'false'},
        picture: { type: String, default: ''}
    },

    address: String,
    history: [{
        paid: { type: Number, default: 0},
        item: { type: Schema.Types.ObjectId, ref: 'Product'}
    }]
});

/* Hash the password before we save it to the database */
UserSchema.pre('save', function(next){
    var user = this;
    // only hash the password if it has been modified (or is new)
    if (!user.isModified('password')) return next();

    // generate a salt
    bcrypt.genSalt(SALT_WORK_FACTOR, function(err, salt){
        if (err) return next(err);

        // hash the password using our new salt
        bcrypt.hash(user.password, salt, null, function(err, hash){
            if (err) return next(err);

            // override the cleartext password with the hashed one
            user.password = hash;
            next();
        });
    });
});

/* compare password in the database and the one that the user types in */
UserSchema.methods.comparePassword = function(password) {
    return bcrypt.compareSync(password, this.password);
};




module.exports = mongoose.model('User', UserSchema);
