const jwt = require('jsonwebtoken');
const User = require('../models/User');

exports.protect = async (req, res, next) => {
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
    }
    
    if (!token) {
        return res.status(401).json({ success: false, message: 'No token provided' });
    }
    
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Some auth flows only include user id in the token.
        // Hydrate role/name/email from DB so role checks are reliable everywhere.
        if (!decoded.role) {
            const user = await User.findById(decoded.id || decoded._id).select('_id name email role');
            if (!user) {
                return res.status(401).json({ success: false, message: 'Invalid token user' });
            }

            req.user = {
                id: String(user._id),
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
            };
        } else {
            req.user = decoded;
        }

        next();
    } catch (err) {
        return res.status(401).json({ success: false, message: 'Invalid token' });
    }
};

exports.auth = async (req, res, next) => {
    try {
        const token = req.header('Authorization')?.replace('Bearer ', '');
        if (!token) {
            return res.status(401).json({ message: 'No token, authorization denied' });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.id || decoded._id);
        if (!user) {
            return res.status(401).json({ message: 'Token is not valid' });
        }

        req.user = user;
        next();
    } catch (error) {
        res.status(401).json({ message: 'Token is not valid' });
    }
};

exports.requireRole = (role) => (req, res, next) => {
    if (req.user.role !== role) {
        return res.status(403).json({ message: `Access denied. ${role} role required.` });
    }
    return next();
};
