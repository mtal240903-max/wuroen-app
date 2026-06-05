const jwt = require('jsonwebtoken');
const User = require('../../models/User');

module.exports = async (req, res, next) => {
    try {
        const header = req.headers.authorization;
        if (header?.startsWith('Bearer ')) {
            const token = header.split(' ')[1];
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            req.user = await User.findById(decoded.id).select('-password');
        }
    } catch (e) { 
        /* Token invalide ou absent — on continue simplement sans req.user */ 
    }
    return next();
};