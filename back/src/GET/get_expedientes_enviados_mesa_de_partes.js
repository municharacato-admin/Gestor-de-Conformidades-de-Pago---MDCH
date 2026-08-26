/* @license Apache-2.0; ver LICENCIA.txt */

/**
 * Dependencias propias
 */
import conect from '../../connect_db.js';

export async function get_expedientes_enviados_mesa_de_partes() {
    try {
        const expedientes = await obtener_datos();
        return {
            success: true,
            response: expedientes
        };
    } catch (error) {
        console.error("Error en get_expedientes_enviados_mesa_de_partes:", error);
        return {
            success: false,
            message: error.message || "Error interno al obtener los expedientes"
        };
    }
}

async function obtener_datos() {
    const query = {
        text: `
            SELECT 
                e.numero_expediente,
                uo.nombre AS origen,
                ud.nombre
                AS destino,
                he.fecha_envio,
                COALESCE(TO_CHAR(he.fecha_recepcion, 'YYYY-MM-DD HH24:MI'), 'No recepcionado') AS fecha_recepcion
            FROM historial_expedientes he
            JOIN expedientes e ON he.id_expediente = e.id
            JOIN unidades_organicas uo ON he.id_unidad_origen = uo.id
            JOIN unidades_organicas ud ON he.id_unidad_destino = ud.id
            WHERE he.id_unidad_origen = $1;
        `,
        values: [26]
    };

    try {
        const { rows } = await conect.query(query);
        return rows;
    } catch (error) {
        console.error("Error en obtener_datos:", error);
        throw new Error("Error en la consulta a la base de datos");
    }
}
