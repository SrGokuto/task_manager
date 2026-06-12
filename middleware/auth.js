import jwt from 'jsonwebtoken';

export const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({
      error: 'Token no proporcionado'
    });
  }

  const token = authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({
      error: 'Token no proporcionado'
    });
  }

  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET
    );

    req.userId = decoded.uid;
    req.userEmail = decoded.email;
    req.userRole = decoded.role || 'user';

    next();
  } catch (error) {
    return res.status(401).json({
      error: 'Token inválido'
    });
  }
};

export const requireRole = (role) => {
  return (req, res, next) => {
    if (!req.userRole) {
      return res.status(403).json({
        error: 'Rol no disponible'
      });
    }

    if (req.userRole !== role) {
      return res.status(403).json({
        error: 'Acceso denegado'
      });
    }

    next();
  };
};

export const requireAdmin = (req, res, next) => {
  if (req.userRole !== 'admin') {
    return res.status(403).json({
      error: 'Solo administradores'
    });
  }

  next();
};