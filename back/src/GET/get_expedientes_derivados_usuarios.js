/* @license Apache-2.0; ver LICENCIA.txt */

/**
 * Dependencias propias
 */
import conect from '../../connect_db.js';

export async function get_expedientes_derivados_usuarios(id_usuario) {
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
    ud.nombre AS destino,
    he.fecha_envio AS fecha_derivado,
    COALESCE(
        TO_CHAR(he.fecha_recepcion, 'DD/MM/YYYY HH24:MI'),
        'No recepcionado'
    ) AS fecha_recepcion,
    he.justificacion
FROM historial_expedientes he
JOIN expedientes e ON he.id_expediente = e.id
JOIN unidades_organicas ud ON he.id_unidad_destino = ud.id
WHERE he.id_unidad_origen = $1
ORDER BY he.fecha_envio DESC;
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
