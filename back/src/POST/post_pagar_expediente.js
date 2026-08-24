/**
 * Dependencias propias
 */
import conect from '../../connect_db.js';

export async function post_pagar_expediente(data) {
    try {
        const historial_anterior = await get_historial_anterior (data.id_historial_expediente)
        await pagar_expediente(historial_anterior, data.justificacion);
        await estado_general_expediente(historial_anterior.id_expediente)
        return {
            success: true,
            message: "Expediente pagado"
        };
    } catch (error) {
        return {
            success: false,
            message: error.message
        };
    }
}

async function get_historial_anterior(data) {

    try {
        
        // 🔹 Actualizar estado y fecha recepcion
        const query = {
            text: `
                SELECT
                    id_expediente,
                    id_unidad_destino
                FROM historial_expedientes
                WHERE id = $1;
            `,
            values: [data]
        };

        const resultado = await conect.query(query);

        if (resultado.rowCount === 0) {
            throw new Error("No se insertó ningún registro en la base de datos");
        }

        return resultado.rows[0];

    } catch (error) {
        console.error("Error real:", error);
        throw new Error(error.message || "Ocurrió un error al cancelar el expediente");
    }
}

async function pagar_expediente(historial_anterior, data) {
    const fecha_pago = calcularFechaTerminoLima();

    try {
        
        const query = {
            text: `
                INSERT INTO historial_expedientes
                (id_expediente, id_unidad_origen, id_unidad_destino, fecha_envio, fecha_recepcion, estado, justificacion)
                VALUES ($1, $2, $3, $4, $5, 'Pagado', $6);
            `,
            values: [
                historial_anterior.id_expediente,
                historial_anterior.id_unidad_destino,
                historial_anterior.id_unidad_destino,
                fecha_pago,
                fecha_pago,
                data
            ]
        };

        const resultado = await conect.query(query);

        if (resultado.rowCount === 0) {
            throw new Error("No se insertó ningún registro en la base de datos");
        }

        return 

    } catch (error) {
        console.error("Error real:", error);
        throw new Error(error.message || "Ocurrió un error al pagar el expediente");
    }
}

function calcularFechaTerminoLima(diasHabiles = 8) {
    // 🔹 Obtener fecha actual en Lima
    const ahoraLima = new Date(
        new Date().toLocaleString("en-US", { timeZone: "America/Lima" })
    );

    const fecha = new Date(ahoraLima); // copia

    // 🔹 Función auxiliar para formatear YYYY-MM-DD HH:mm:ss
    const formatear = (f) => {
        const año = f.getFullYear();
        const mes = String(f.getMonth() + 1).padStart(2, "0");
        const dia = String(f.getDate()).padStart(2, "0");
        const hora = String(f.getHours()).padStart(2, "0");
        const min = String(f.getMinutes()).padStart(2, "0");
        const seg = String(f.getSeconds()).padStart(2, "0");
        return `${año}-${mes}-${dia} ${hora}:${min}:${seg}`;
    };

    // 🔹 Fecha de registro (ahora)
    const fecha_recepcion = formatear(ahoraLima);


    return fecha_recepcion;
}

async function estado_general_expediente(id_expediente) {
    try {
        const query = {
            text: `
                UPDATE expedientes
                SET
                    estado = $1
                WHERE id = $2;
            `,
            values: ["Pagado", id_expediente]
        };

        const resultado = await conect.query(query);

        if (resultado.rowCount === 0) {
            throw new Error("No se insertó ningún registro en la base de datos");
        }

        return 

    } catch (error) {
        console.error("Error real:", error);
        throw new Error(error.message || "Ocurrió un error al actualizar el expediente maestro");
    }
}