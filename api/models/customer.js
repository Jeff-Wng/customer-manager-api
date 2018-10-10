const mongoose = require('mongoose');

const customerSchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    firstName: {type: String, required: true},
    lastName: {type: String, required: true},
    email: {type: String, required: true},
    gender: {type: String, required: true},
    city: {type: String, required: true},
    state: {type: String, required: true},
    profileImg: {type: String, default: 'uploads/male.jpg'}
});

module.exports = mongoose.model('Customer', customerSchema);