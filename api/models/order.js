const mongoose = require('mongoose');

const orderSchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    customerId: {type: String, required: true},
    // ref: 'Product' - connects this product to the product schema
    product: {type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true},
    quantity: {type: Number, default: 1, required: true},
});

module.exports = mongoose.model('Order', orderSchema);