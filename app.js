const express = require('express');
const app = express();
// Morgan logs onto console data for each request, time, route, etc
const morgan = require('morgan');
const mongoose = require('mongoose');

const customerRoutes = require('./api/routes/customers');
const productsRoutes = require('./api/routes/products');
const ordersRoutes = require('./api/routes/orders');
const userRoutes = require('./api//routes/users');

mongoose.connect(
    'mongodb://customer-manager-admin:' + 
    process.env.MONGO_ATLAS_PW + 
    '@customer-manager-shard-00-00-ueeys.mongodb.net:27017,customer-manager-shard-00-01-ueeys.mongodb.net:27017,customer-manager-shard-00-02-ueeys.mongodb.net:27017/test?ssl=true&replicaSet=Customer-Manager-shard-0&authSource=admin&retryWrites=true',
    {useNewUrlParser: true}
);

app.use(morgan('dev'));
// Makes the uploads file public so images can be seen
app.use(express.static('uploads'));
app.use('/uploads', express.urlencoded({extended: false}));
app.use(express.json());

app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    if(req.method === 'OPTIONS') {
        res.header('Access-Control-Allow-Methods', 'PUT, POST, PATCH, DELETE, GET');
        return res.status(200).json({});
    }
    next();
});

// Routes which should handle requests 
app.use('/customers', customerRoutes);
app.use('/products', productsRoutes);
app.use('/orders', ordersRoutes);
app.use('/users', userRoutes);

app.use((req, res, next) => {
    const error = new Error('Not found');
    error.status = 404;
    next(error);
});

app.use((error, req, res, next) => {
    res.status(error.status || 500);
    res.json({
        error: {
            message: error.message
        }
    })
})

module.exports = app;