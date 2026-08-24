import conect from '../../connect_db.js';

export async function post_no_recepcionar_exp_usuario(id_historial, id_usuario) {

    try {

        const query = {
            text: `
                UPDATE historial_expedientes h
                SET fecha_recepcion = NULL
                FROM usuarios u
                WHERE h.id = $1
                  AND u.id = $2
                  -- validar que es el último movimiento del expediente
                  AND h.id = (
                      SELECT id
                      FROM historial_expedientes
                      WHERE id_expediente = h.id_expediente
                      ORDER BY fecha_envio DESC, id DESC
                      LIMIT 1
                  )
                  -- validar que la recepción fue de tu área
                  AND h.id_unidad_destino = u.id_unidad_organica
                  -- validar que sí está recepcionado
                  AND h.fecha_recepcion IS NOT NULL
                RETURNING h.id;
            `,
            values: [id_historial, id_usuario]
        };

        const result = await conect.query(query);

        if (result.rowCount === 0) {
            throw new Error('No se puede revertir la recepción (no es el último movimiento, no pertenece a tu área o no está recepcionado)');
        }

        return {
            success: true,
            message: 'Recepción revertida correctamente'
        };

    } catch (error) {
        console.error(error);
        return {
            success: false,
            message: error.message
        };
    }
}