const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const multer = require('multer');
const checkAuth = require('../middleware/check-auth');

const Customer = require('../models/customer');

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
    limits: {
      fileSize: 1024 * 1024 * 5
    },
    fileFilter: fileFilter
  });

// Only a slash because in app.js we are routing all routes with customers to this
router.get('/', (req, res, next) => {
    Customer.find()
        // Select tells which variables to return when API is called
        .select('_id firstName lastName email gender city state profileImage')
        .exec()
        .then(docs => {
            const response = {
                // Docs is an array returned when api is called
                count: docs.length,
                customers: docs.map(doc => {
                    return {
                        _id: doc._id,
                        firstName: doc.firstName,
                        lastName: doc.lastName,
                        email: doc.email,
                        gender: doc.gender,
                        city: doc.city,
                        state: doc.state,
                        profileImage: doc.profileImage,
                        request: {
                            type: "GET",
                            url: "https://customer-manager-api.herokuapp.com/customers/" + doc._id
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

router.post('/', checkAuth, upload.single('profileImage'), (req, res, next) => {
    // If a profile picture is uploaded from client side, use that
    // else use default profile picture
    let img = null;
    if(req.file) {
        img = req.file.path;
    } else {
        img = req.body.profileImage;
    }
    const customer = new Customer({
        // Auto create unique ID
        _id: new mongoose.Types.ObjectId(),
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        email: req.body.email,
        gender: req.body.gender,
        city: req.body.city,
        state: req.body.state,
        profileImage: img
    })
    // Stores in database
    customer.save()
        .then(result => {
            console.log(result);
            res.status(201).json({
                message: 'Created customer successfully',
                createdCustomer: {
                    _id: result._id,
                    firstName: result.firstName,
                    lastName: result.lastName,
                    email: req.body.email,
                    gender: req.body.gender,
                    city: req.body.city,
                    state: req.body.state,
                    profileImage: req.body.profileImage,
                    request: {
                        type: 'GET',
                        url: "https://customer-manager-api.herokuapp.com/customers/" + result._id
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
    Customer.findById(id)
        .select("_id firstName lastName email gender city state profileImg")
        .exec()
        .then(doc => {
            console.log(doc);
            if(doc) {
                res.status(200).json({
                    customer: doc,
                    request: {
                        type: 'GET',
                        description: 'GET_ALL_CUSTOMERS',
                        url: 'https://customer-manager-api.herokuapp.com/customers'
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
    //     { "propName": "firstName", "value": "Adam" }
    // ]
    for(const ops of req.body) {
        updateOps[ops.propName] = ops.value;
    }
    // $set needed to update
    Customer.update({_id: id}, {$set: updateOps})
        .exec()
        .then(result => {
            console.log(result);
            res.status(200).json({
                message: 'Customer updated!',
                request: {
                    type: 'GET',
                    url: 'https://customer-manager-api.herokuapp.com/customers/' + id
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
    Customer.remove({_id: id})
        .exec()
        .then(result => {
            res.status(200).json({
                message: "Customer deleted",
                request: {
                    type: 'GET',
                    url: 'https://customer-manager-api.herokuapp.com/customer',
                    body: {firstName: 'String', lastName: "String", email: "String", gender: "String", city: "String", state: "String", profileImg: "String"}
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