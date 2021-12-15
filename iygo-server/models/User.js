const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const UserSchema = mongoose.Schema({
    name: {
        type: String,
        required: [true, "Please provide a name"],
        trim: true,
        minLength: 3,
        maxLength: 50
    },
    email: {
        type: String,
        required: [true, "Please provide an email"],
        minLength: 3,
        maxLength: 50,
        match: [
            /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
            "Please provide a valid email"
        ],
        unique: [true, "Email already registered"]
    },
    password: {
        type: String,
        required: [true, "Please provide a password"],
        minLength: 6
    },
    created_at: {
        type: Date,
        default: Date.now()
    }
});

UserSchema.pre('save', async function(/*next*/){
    const salt = await bcrypt.genSalt(10);
    // this refers to the document ie the UserSchema
    this.password = await bcrypt.hash(this.password, salt);
    // next not needed but can be used
    //next();
});

UserSchema.methods.createJWT = function(){
    return jwt.sign(
        {userId: this._id, name: this.name},
        process.env.JWT_SECRET,
        {expiresIn: process.env.JWT_LIFETIME}
    );
};

UserSchema.methods.comparePassword = async function(candidatePassword){
    const isMatch = await bcrypt.compare(candidatePassword, this.password);
    return isMatch;
};

module.exports = mongoose.model('User', UserSchema);