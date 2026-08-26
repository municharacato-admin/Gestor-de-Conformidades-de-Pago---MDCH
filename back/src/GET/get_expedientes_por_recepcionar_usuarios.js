/* @license Apache-2.0; ver LICENCIA.txt */

/**
 * Dependencias propias
 */
import conect from '../../connect_db.js';

export async function get_expedientes_por_recepcionar_usuarios(id_usuario) {
    try {
        const id_unidad_organica_consultante = await obtener_id_unidad_organica(id_usuario);
        const data = await obtener_datos(id_unidad_organica_consultante);
        return {
            success: true,
            response: data
        };
    } catch (error) {
        console.error("Error en endpoint:", error);
        return {
            success: false,
            message: error.message || "Error interno al obtener los expedientes"
        };
    }
}

async function obtener_id_unidad_organica(id_usuario) {
    const query = {
        text: `
            SELECT id_unidad_organica
            FROM usuarios
            WHERE id = $1;
        `,
        values: [id_usuario]
    };

    try {
        const { rows } = await conect.query(query);
        return rows.length > 0 ? rows[0].id_unidad_organica : null;
    } catch (error) {
        console.error("Error en obtener_id_unidad_organica:", error);
        throw new Error("Error en la consulta a la base de datos");
    }
}

async function obtener_datos(id_unidad_organica) {
    const query = {
        text: `
            SELECT
                he.id,
                e.numero_expediente AS numero_expediente,
                uo.nombre AS origen,
                he.fecha_envio
            FROM historial_expedientes he
            JOIN expedientes e ON he.id_expediente = e.id
            JOIN unidades_organicas uo ON he.id_unidad_origen = uo.id
            WHERE he.id_unidad_destino = $1
            AND he.fecha_recepcion IS NULL;
        `,
        values: [id_unidad_organica]
    };

    try {
        const { rows } = await conect.query(query);
        return rows;
    } catch (error) {
        console.error("Error en obtener_datos:", error);
        throw new Error("Error en la consulta a la base de datos");
    }
}
