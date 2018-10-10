const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
    try {
        // JWT token is in the headers
        // Authorization: bearers jwt_token
        const token = req.headers.authorization.split(" ")[1];
        const decoded = jwt.verify(token, process.env.JWT_KEY);
        req.userData = decoded;
        next();
    } catch (error) {
        return res.status(401).json({
            message: 'Auth failed'
        })
    }
}