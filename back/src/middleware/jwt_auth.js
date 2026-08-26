/* @license Apache-2.0; ver LICENCIA.txt */

import jwt from "jsonwebtoken";

export const verifyToken = (req, res, next) => {
  const token = req.cookies.access_token;

  if (!token) {
    return res.status(401).json({
      success: false,
      message: "Acceso no autorizado. Token no proporcionado."
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.SECRET_JWT_KEY);

    // Guardar ambos para usarlos según la necesidad de cada ruta
    req.user = {
      id: decoded.id,
      rol: decoded.rol
    };

    next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        success: false,
        message: "Sesión expirada. Por favor vuelve a iniciar sesión."
      });
    }

    return res.status(403).json({
      success: false,
      message: "Token inválido."
    });
  }
};
