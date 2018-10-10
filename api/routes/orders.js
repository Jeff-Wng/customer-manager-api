const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const checkAuth = require('../middleware/check-auth');

const Order = require('../models/order');
const Product = require('../models/product');

//checkAuth
router.get('/:customerId', (req, res, next) => {
    Order.find({customerId: req.params.customerId})
        .select("_id quantity product customerId")
        .exec()
        .then(docs => {
            res.status(200).json({
                count: docs.length,
                orders: docs.map(doc => {
                    return {
                        _id: doc._id,
                        product: doc.product,
                        quantity: doc.quantity,
                        customerId: doc.customerId,
                        request: {
                            type: "GET",
                            url: "http://localhost:3000/orders/" + doc._id
                        },
                        productInfo: {
                            tpye: 'GET',
                            url: "http://localhost:3000/products/" + doc.product
                        },
                        customerInfo: {
                            type: "GET",
                            url: "http://localhost:3000/customers/" + doc.customerId
                        }
                    }
                })
            });
        })
        .catch(err => {
            res.status(500).json({
                error: err
            })
        })
    
})

router.post('/', checkAuth, (req, res, next) => {
    // Make sure we can't creat eorders for products we don't have
    Product.findById(req.body.product)
        .then(product => {
            // Product returns as an array
            // Check if product array is empty, if it is than product doesn't exists
            if(!product) {
                return res.status(404).json({
                    message: 'Product not found'
                })
            }
            const order = new Order({
                _id: mongoose.Types.ObjectId(),
                customerId: req.body.customerId,
                product: req.body.product,
                quantity: req.body.quantity,
            });
            return order.save()
        })
        .then(result => {
            console.log(result);
            res.status(200).json({
                message: 'Order created!',
                createdOrder: {
                    _id: result._id,
                    customerId: result.customerId,
                    product: result.product,
                    quantity: result.quantity,
                    customer: result.customer
                },
                request: {
                    type: "GET",
                    url: "http://localhost:3000/orders/" + result._id
                },
                productInfo: {
                    tpye: 'GET',
                    url: "http://localhost:3000/products/" + result.product
                },
                customerInfo: {
                    type: "GET",
                    url: "http://localhost:3000/customers/" + result.customer
                }
            });
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({
                error: err
            })
        })
})

router.get('/:orderId', (req, res, next) => {
    Order.findById(req.params.orderId)
        .select("_id product quantity customer")
        .exec()
        .then(order => {
            // If order doesn't exist
            if(!order) {
                return res.status(404).json({
                    message: 'Order not found'
                })
            }
            res.status(200).json({
                order: order,
                request: {
                    type: "GET",
                    url: "http://localhost:3000/orders"
                }
            })
        })
        .catch(err => {
            res.status(500).json({
                error: err
            })
        })
})

router.delete('/:orderId', checkAuth, (req, res, next) => {
    Order.remove({_id: req.params.orderId})
        .exec()
        .then(result => {
           res.status(200).json({
                message: 'Order deleted',
                requerst: {
                    type: "POST",
                    description: "CREATE_NEW_ORDER",
                    url: "http://localhost:3000/orders",
                    body: {product: 'ID', quantity: "Number", customer: "ID"}
                }
           })
        })
        .catch(err => {
            res.status(500).json({
                error: err
            })
        })
})

module.exports = router;