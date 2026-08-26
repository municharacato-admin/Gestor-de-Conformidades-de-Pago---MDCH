/* @license Apache-2.0; ver LICENCIA.txt */

/**
 * Dependencias propias
 */
import conect from '../../connect_db.js';

export async function obtener_historial_expediente (id){
    try {
        const response = await obtener_datos(id);
        return{
            success: true,
            response: response
        }
    } catch (error) {
        return {
            success: false,
            message: error.message
        }
    }
}

async function obtener_datos(id){
    try{
        const query = {
            text: `
                SELECT 
                    uo_origen.nombre AS origen,
                    uo_destino.nombre AS destino,
                    h.fecha_envio,
                    COALESCE(
                        TO_CHAR(h.fecha_recepcion, 'YYYY-MM-DD HH24:MI:SS'),
                        'No recepcionado'
                    ) AS fecha_recepcion,
                    h.estado,
                    COALESCE(h.justificacion, 'Sin justificación') AS justificacion
                FROM historial_expedientes h
                LEFT JOIN unidades_organicas uo_origen 
                    ON uo_origen.id = h.id_unidad_origen
                LEFT JOIN unidades_organicas uo_destino 
                    ON uo_destino.id = h.id_unidad_destino
                WHERE h.id_expediente = $1
                ORDER BY h.fecha_envio ASC;
            `,
            values: [id]
        }
        const resultado = await conect.query(query);
        return resultado.rows;
    }catch (error){
        throw new Error("Error en la consulta")
    }
}
