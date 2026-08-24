/**
 * Dependencias propias
 */
import conect from '../../connect_db.js';

export async function get_expedientes (){
    try {
        const response = await obtener_datos();
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

async function obtener_datos(){
    try{
        const query = {
            text: `SELECT 
    e.id,
    e.numero_expediente,
    e.fecha_hora_termino,
    e.estado,
    u.nombre AS ultima_oficina
FROM expedientes e
LEFT JOIN (
    SELECT DISTINCT ON (id_expediente)
        id_expediente,
        id_unidad_destino
    FROM historial_expedientes
    ORDER BY 
        id_expediente,
        COALESCE(fecha_recepcion, fecha_envio) DESC,
        id DESC
) h ON h.id_expediente = e.id
LEFT JOIN unidades_organicas u 
    ON u.id = h.id_unidad_destino

ORDER BY
    -- 1. Prioridad de estado
    CASE 
        WHEN e.estado = 'En proceso' THEN 1
        WHEN e.estado = 'Pagado' THEN 2
        WHEN e.estado = 'Cancelado' THEN 3
        ELSE 4
    END,

    -- 2. Dentro de "En proceso": primero los vencidos
    CASE 
        WHEN e.estado = 'En proceso' 
             AND e.fecha_hora_termino < NOW() THEN 1
        WHEN e.estado = 'En proceso' THEN 2
        ELSE 3
    END,

    -- 3. Orden por antigüedad (más antiguos primero)
    e.fecha_hora_termino ASC;`
        }
        const resultado = await conect.query(query);
        return resultado.rows;
    }catch (error){
        throw new Error("Error en la consulta")
    }
}