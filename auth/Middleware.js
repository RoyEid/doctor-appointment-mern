import jwt from "jsonwebtoken"

const auth = (requiredRole = null) => {
    return async (req, res, next) => {
        let token = req.headers['authorization'] || '';
        if (!token) {
            return res.status(401).json({ message: 'Access denied. No token provided.' });
        }

        // Support "Bearer <token>" and raw token
        if (token.startsWith('Bearer ')) {
            token = token.slice(7);
        }

        if (!token) {
            return res.status(401).json({ message: 'Access denied. No token provided.' });
        }

        jwt.verify(token, process.env.SECRET_KEY, (err, decoded) => {
            if (err || !decoded) {
                return res.status(401).json({ message: 'Invalid or expired token.' });
            } else {
                const normalizedRole = decoded.role || "user";
                req.user = { ...decoded, role: normalizedRole };
                const allowedRoles = Array.isArray(requiredRole) ? requiredRole : [requiredRole];

                if (requiredRole && !allowedRoles.includes(normalizedRole)) {
                    return res.status(403).json({
                        message: 'Access denied. Insufficient permissions.'
                    });
                }
                next();
            }
        });
    }
}

export default auth
