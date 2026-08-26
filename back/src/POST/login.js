/* @license Apache-2.0; ver LICENCIA.txt */

/**
 * Dependencias de terceros
 */
import Joi from 'joi';
import bcrypt from "bcrypt";

/**
 * Dependencias propias
 */
import conect from '../../connect_db.js';


export async function login (data) {
    try {
        validar_json(data)
        await comparar_credenciales(data)
        const id_usuario = await obtener_id(data.usuario)
        const rol = await obtener_rol(id_usuario)
        return {
            success: true,
            message: "Login exitoso",
            id: id_usuario,
            rol: rol
        }
    } catch (error) {
        return {
            success: false,
            message: error.message
        }        
    }
}

function validar_json (data){
    const schema = Joi.object({
        usuario: Joi.string().required().min(1),
        contrasenia: Joi.string().required().min(1),
    }).strict();

    const { error, value } = schema.validate(data);

    if (error) {
        throw new Error("Datos faltantes o incorrectos");
    }
}

async function comparar_credenciales(data) {
    try {
        const query = {
            text:"SELECT usuario, contrasenia FROM usuarios WHERE usuario=$1",
            values: [data.usuario]
        }
        const resultado = await conect.query(query)
        
        if(resultado.rowCount === 0){
            throw error
        }

        const verificar_contraseña_correcta  = bcrypt.compareSync(data.contrasenia, resultado.rows[0].contrasenia)

        if(!verificar_contraseña_correcta){
            throw error
        }

    } catch (error) {
        throw new Error("Usuario o contraseña incorrecto")       
    }
}

async function obtener_id(usuario) {
    const query = {
        text:"SELECT id FROM usuarios WHERE usuario = $1",
        values: [usuario]
    }
    const resultado  = await conect.query(query)
    const id = resultado.rows[0].id
    return id
}

async function obtener_rol (id) {
    const query = {
        text:"SELECT id_rol FROM usuarios WHERE id = $1",
        values: [id]
    }
    const resultado  = await conect.query(query)
    const rol = resultado.rows
    return rol
}
