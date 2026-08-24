/**
 * Dependencias de terceros
 */
import Joi from 'joi';
import { randomUUID } from 'crypto';
import bcrypt from "bcrypt";

/**
 * Dependencias propias
 */
import conect from '../../connect_db.js';

export async function create_user (data){
    try {
        validar_json(data)
        await verificar_duplicidad(data.usuario)
        data.id = randomUUID()
        data.contrasenia = bcrypt.hashSync(data.contrasenia, 10)
        await crear_en_bd(data)
        return {
            success: true,
            message: "Usuario registrado"
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
        id_unidad_organica: Joi.string().required().min(1),
        id_rol: Joi.string().required().min(1),
        usuario: Joi.string().required().min(1),
        contrasenia: Joi.string().required().min(1),
    }).strict();

    const { error, value } = schema.validate(data);

    if (error) {
      throw new Error("Datos faltantes o incorrectos");
    }
}

async function verificar_duplicidad(usuario) {
    const query = {
        text: `
            SELECT * FROM usuarios WHERE usuario=$1
        `,
        values: [
            usuario
        ]
    }
    
    try {
        const resultado = await conect.query(query)   
        
        if(resultado.rows.length > 0){
            throw new Error("Usuario ya registrado");
        }
    } catch (error) {
        if (error.message === "Usuario ya registrado") {
            throw error;
        }
        throw new Error("Ocurrió un error al consultar a la base de datos");
    }
}

async function crear_en_bd(data) {
    try {
        const query = {
            text: `
                INSERT INTO usuarios (id, id_unidad_organica, id_rol, usuario, contrasenia)
                VALUES ($1, $2, $3, $4, $5)
            `,
            values: [
                data.id,
                data.id_unidad_organica,
                data.id_rol,
                data.usuario,
                data.contrasenia
            ]
        };

        const resultado = await conect.query(query);

        if (resultado.rowCount === 0) {
            throw new Error("No se insertó ningún registro en la base de datos");
        }

    } catch (error) {
        console.error("Error real:", error);
        throw new Error("Ocurrió un error al registrar el nuevo usuario");
    }
}
