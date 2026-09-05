const fs = require('fs');
let code = fs.readFileSync('backend/src/middlewares/authMiddleware.js', 'utf8');

code += `
export const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (token) {
      const decoded = verifyToken(token);
      const user = await User.findByPk(decoded.id);
      if (user) {
        req.user = user;
      }
    }
    next();
  } catch (error) {
    next();
  }
};
`;

fs.writeFileSync('backend/src/middlewares/authMiddleware.js', code);
