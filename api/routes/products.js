const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const multer = require('multer');
const checkAuth = require('../middleware/check-auth');

const storage = multer.diskStorage({
    destination: function(req, file, cb) {
      cb(null, './uploads/');
    },
    filename: function(req, file, cb) {
        cb(null, new Date().toISOString().replace(/:/g, '-') + file.originalname);
    }
  });
  
  const fileFilter = (req, file, cb) => {
    // reject a file
    if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png') {
      cb(null, true);
    } else {
      cb(null, false);
    }
  };
  
  const upload = multer({
    storage: storage,
    fileFilter: fileFilter
  });

const Product = require('../models/product');

// Only a slash because in app.js we are routing all routes with customers to this
router.get('/', (req, res, next) => {
    Product.find()
        // Select tells which variables to return when API is called
        .select('name price _id description productImage')
        .exec()
        .then(docs => {
            const response = {
                // Docs is an array returned when api is called
                count: docs.length,
                products: docs.map(doc => {
                    return {
                        _id: doc._id,
                        name: doc.name,
                        price: doc.price,
                        description: doc.description,
                        productImage: doc.productImage,
                        request: {
                            type: "GET",
                            url: "https://customer-manager-api.herokuapp.com/products/" + doc._id
                        }
                    }
                })
            }
            res.status(200).json(response);
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({error: err});
        })
});

router.post('/', checkAuth, upload.single('productImage'), (req, res, next) => {
    console.log(req.file);
    const product = new Product({
        // Auto create unique ID
        _id: new mongoose.Types.ObjectId(),
        name: req.body.name,
        price: req.body.price,
        description: req.body.description,
        productImage: req.file.path
    })
    // Stores in database
    product.save()
        .then(result => {
            console.log(result);
            res.status(201).json({
                message: 'Stored product successfully',
                createdProduct: {
                    _id: result._id,
                    name: result.name,
                    price: result.price,
                    description: result.description,
                    productImage: result.productImage,
                    request: {
                        type: 'GET',
                        url: "https://customer-manager-api.herokuapp.com/products/" + result._id
                    }
                }
            })
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({
                error: err
            })
        });
});

router.get('/:id', (req, res, next) => {
    const id = req.params.id;
    Product.findById(id)
        .select("_id name price productImage")
        .exec()
        .then(doc => {
            console.log(doc);
            if(doc) {
                res.status(200).json({
                    product: doc,
                    request: {
                        type: 'GET',
                        description: 'GET_ALL_PRODUCTS',
                        url: 'https://customer-manager-api.herokuapp.com/products'
                    }
                });
            } else {
                res.status(404).json({message: 'No valid entry found for provided ID'});
            }
        })
        .catch(err =>{
            console.log(err);
            res.status(500).json({error: err})
        });
});

router.patch('/:id', checkAuth, (req, res, next) => {
    const id = req.params.id;
    const updateOps = {};
    // Only change what is passed through
    // Example: if called with firstName only - only change firstName and so on
    // On Postman, body should be in this format due to ops.propName
    // [
    //     { "propName": "name", "value": "Iron Man Helmet" }
    // ]
    for(const ops of req.body) {
        updateOps[ops.propName] = ops.value;
    }
    // $set needed to update
    Product.update({_id: id}, {$set: updateOps})
        .exec()
        .then(result => {
            console.log(result);
            res.status(200).json({
                message: 'Product updated!',
                request: {
                    type: 'GET',
                    url: 'https://customer-manager-api.herokuapp.com/products/' + id
                }
            })
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({
                error: err
            })
        });
});

router.delete('/:id', checkAuth, (req, res, next) => {
    const id = req.params.id;
    Product.remove({_id: id})
        .exec()
        .then(result => {
            res.status(200).json({
                message: "Product deleted",
                request: {
                    type: 'POST',
                    description: 'CREATE_NEW_PRODUCT',
                    url: 'https://customer-manager-api.herokuapp.com/products',
                    body: {name: 'String', price: "Number"}
                }
            });
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({
                error: err
            })
        });
});

module.exports = router;