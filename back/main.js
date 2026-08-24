import express from "express";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";
import cookieParser from "cookie-parser";
import cors from "cors";

/**
 * Modulos propios
 */
import { create_user } from "./src/POST/create_user.js";
import { login } from "./src/POST/login.js";
import { verifyToken } from "./src/middleware/jwt_auth.js";
import { get_unidades_organicas } from "./src/GET/get_unidades_organicas.js";
import { post_publicar_expediente } from "./src/POST/post_publicar_expediente.js";
import { get_expedientes_enviados_mesa_de_partes } from "./src/GET/get_expedientes_enviados_mesa_de_partes.js";
import { get_expedientes_por_recepcionar_usuarios } from "./src/GET/get_expedientes_por_recepcionar_usuarios.js";
import { post_recepcionar_expediente } from "./src/POST/post_recepcionar_expediente.js";
import { get_expedientes_recepcionados_usuarios } from "./src/GET/get_expedientes_recepcionados_usuarios.js";
import { post_derivar_expediente } from "./src/POST/post_derivar_expediente.js";
import { get_expedientes_derivados_usuarios } from "./src/GET/get_expedientes_derivados_usuarios.js";
import { post_cancelar_expediente } from "./src/POST/post_cancelar_expediente.js";
import { get_expedientes_cancelados_usuarios } from "./src/GET/get_expedientes_cancelados_usuarios.js";
import { post_pagar_expediente } from "./src/POST/post_pagar_expediente.js";
import { get_expedientes_pagados_usuarios } from "./src/GET/get_expedientes_pagados_usuarios.js";
import { get_expedientes } from "./src/GET/get_expedientes.js";
import { obtener_historial_expediente } from "./src/GET/obtener_historial_expediente.js";
import { get_estadisticas_administrador } from "./src/GET/get_estadisticas_administrador.js";
import { post_eliminar_expediente_mp } from "./src/POST/post_eliminar_expediente_mp.js";
import { post_eliminar_expediente_usuario } from "./src/POST/post_eliminar_expediente_usuario.js";
import { post_no_recepcionar_exp_usuario } from "./src/POST/post_no_recepcionar_exp_usuario.js";
import { get_estadisticas_usuario } from "./src/GET/get_estadisticas_usuario.js";

/**
 * Configuración
 */
dotenv.config();
const app = express();
const PORT = 5004; // Cambia el puerto según tus necesidades

app.use(cors({
  origin: true,
  credentials: true,
  exposedHeaders: ["set-cookie"]
}));

app.use(express.json());
app.use(cookieParser());

/**
 * Endpoints públicos
 */
app.post("/create_user", async (req, res) => {
  const data = req.body;
  res.send(await create_user(data));
});

app.post("/login", async (req, res) => {
  const data = req.body;
  const respuesta = await login(data);
  
  const token = jwt.sign(
    { id: respuesta.id,
      rol: respuesta.rol
    }, 
    process.env.SECRET_JWT_KEY, 
    { expiresIn: "48h" }
  );
  
  delete respuesta.id;
  delete respuesta.rol;
  
  res.cookie("access_token", token, {
    httpOnly: true,
    sameSite: "None",
    secure: true,
    path: "/",
    maxAge: 48 * 60 * 60 * 1000
  }).send(respuesta);
});

app.post("/logout", (req, res) => {
  res.clearCookie("access_token", {
    httpOnly: true,
    sameSite: "None",
    secure: true,
    path: "/"
  });
  res.json({ success: true, message: "Sesión cerrada exitosamente." });
});

/**
 * Edpoints mesa de partes
 */
app.get("/get_unidades_organicas", verifyToken, async(req, res) => {
  res.send(await get_unidades_organicas());
});
app.post("/post_publicar_expediente", verifyToken, async(req, res) => {
  res.send(await post_publicar_expediente(req.body));
});
app.get("/get_expedientes_enviados_mesa_de_partes", verifyToken, async(req, res) => {
  res.send(await get_expedientes_enviados_mesa_de_partes());
});
app.post("/post_eliminar_expediente_mp", verifyToken, async(req, res) => {
  res.send(await post_eliminar_expediente_mp(req.body));
});

/**
 * Edpoints usuarios
 */
app.get("/get_expedientes_por_recepcionar_usuarios", verifyToken, async(req, res) => {
  res.send(await get_expedientes_por_recepcionar_usuarios(req.user.id));
});
app.post("/post_recepcionar_expediente", verifyToken, async(req, res) => {
  res.send(await post_recepcionar_expediente(req.body));
});
app.get("/get_expedientes_recepcionados_usuarios", verifyToken, async(req, res) => {
  res.send(await get_expedientes_recepcionados_usuarios(req.user.id));
});
app.post("/post_derivar_expediente", verifyToken, async(req, res) => {
  res.send(await post_derivar_expediente(req.body));
});
app.get("/get_expedientes_derivados_usuarios", verifyToken, async(req, res) => {
  res.send(await get_expedientes_derivados_usuarios(req.user.id));
});
app.post("/post_cancelar_expediente", verifyToken, async(req, res) => {
  res.send(await post_cancelar_expediente(req.body));
});
app.get("/get_expedientes_cancelados_usuarios", verifyToken, async(req, res) => {
  res.send(await get_expedientes_cancelados_usuarios(req.user.id));
});
app.post("/post_pagar_expediente", verifyToken, async(req, res) => {
  res.send(await post_pagar_expediente(req.body));
});
app.get("/get_expedientes_pagados_usuarios", verifyToken, async(req, res) => {
  res.send(await get_expedientes_pagados_usuarios(req.user.id));
});
app.post("/post_eliminar_expediente_usuario", verifyToken, async(req, res) => {
  res.send(await post_eliminar_expediente_usuario(req.body.id, req.user.id));
});
app.post("/post_no_recepcionar_exp_usuario", verifyToken, async(req, res) => {
  res.send(await post_no_recepcionar_exp_usuario(req.body.id, req.user.id));
});
app.get("/get_estadisticas_usuario", verifyToken, async(req, res) => {
  res.send(await get_estadisticas_usuario(req.user.id));
});

/**
 * Edpoints administrador
 */

app.get("/get_expedientes", verifyToken, async(req, res) => {
  res.send(await get_expedientes());
});

app.get("/obtener_historial_expediente", verifyToken, async(req, res) => {
  const id = req.query.id;
  res.send(await obtener_historial_expediente(id));
});

app.get("/get_estadisticas_administrador", verifyToken, async(req, res) => {
  res.send(await get_estadisticas_administrador());
});

/**
 * Endpoints protegidos
 */

app.get("/check_session", verifyToken, (req, res) => {
  res.json({ 
    success: true,
    id_usuario: req.user.id
  });
});

app.get("/check_rol", verifyToken, (req, res) => {
  res.json({
    success: true,
    rol: req.user.rol
  });
});

app.listen(PORT, () => {
  console.log('Servidor levantado en el puerto:', PORT);
});