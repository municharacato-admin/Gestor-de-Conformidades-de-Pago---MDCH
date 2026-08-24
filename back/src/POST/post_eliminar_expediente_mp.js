import conect from '../../connect_db.js';

export async function post_eliminar_expediente_mp(data) {
    try {

        const numero_expediente = data.id;

        await conect.query('BEGIN');

        const validacion = await conect.query(
            `
            SELECT 
                COUNT(h.*) AS total_movimientos,
                MAX(h.fecha_recepcion) AS fecha_recepcion,
                MAX(h.id_unidad_origen) AS origen,
                MAX(e.id) AS id_expediente
            FROM expedientes e
            LEFT JOIN historial_expedientes h 
                ON h.id_expediente = e.id
            WHERE e.numero_expediente = $1
            `,
            [numero_expediente]
        );

        const row = validacion.rows[0];

        if (!row || !row.id_expediente) {
            await conect.query('ROLLBACK');
            return {
                success: false,
                message: 'No existe el expediente'
            };
        }

        const total = parseInt(row.total_movimientos, 10);
        const recepcionado = row.fecha_recepcion !== null;
        const origen = row.origen;

        if (total !== 1) {
            await conect.query('ROLLBACK');
            return {
                success: false,
                message: `Tiene ${total} movimientos`
            };
        }

        if (parseInt(origen) !== 26) {
            await conect.query('ROLLBACK');
            return {
                success: false,
                message: `Origen inválido (${origen})`
            };
        }

        if (recepcionado) {
            await conect.query('ROLLBACK');
            return {
                success: false,
                message: 'Ya fue recepcionado'
            };
        }

        const id_expediente = row.id_expediente;

        await conect.query(
            `DELETE FROM historial_expedientes WHERE id_expediente = $1`,
            [id_expediente]
        );

        await conect.query(
            `DELETE FROM expedientes WHERE id = $1`,
            [id_expediente]
        );

        await conect.query('COMMIT');

        return {
            success: true,
            message: 'Eliminado correctamente'
        };

    } catch (error) {

        await conect.query('ROLLBACK');

        return {
            success: false,
            message: error.message
        };
    }
}