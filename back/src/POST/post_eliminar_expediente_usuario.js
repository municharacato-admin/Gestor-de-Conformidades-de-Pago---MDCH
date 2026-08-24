import conect from '../../connect_db.js';

export async function post_eliminar_expediente_usuario(id_historial, id_usuario) {

    try {

        const query = {
            text: `
                DELETE FROM historial_expedientes h
                USING usuarios u
                WHERE h.id = $1
                  AND u.id = $2
                  -- validar que sea el último
                  AND h.id = (
                      SELECT id
                      FROM historial_expedientes
                      WHERE id_expediente = h.id_expediente
                      ORDER BY fecha_envio DESC, id DESC
                      LIMIT 1
                  )
                  AND h.id_unidad_origen = u.id_unidad_organica
                  AND h.fecha_recepcion IS NULL
                RETURNING h.id;
            `,
            values: [id_historial, id_usuario]
        };

        const result = await conect.query(query);

        if (result.rowCount === 0) {
            throw new Error('Expediente ya ha sido recepcionado');
        }

        return {
            success: true,
            message: 'Derivación eliminada correctamente'
        };

    } catch (error) {
        console.error(error);
        return {
            success: false,
            message: error.message
        };
    }
}