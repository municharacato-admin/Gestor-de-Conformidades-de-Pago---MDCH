/**
 * Dependencias propias
 */
import conect from '../../connect_db.js';

/**
 * Actualizar historial expediente a "Recepcionado"
 */
export async function post_derivar_expediente(data) {
    try {
        const historial_anterior = await get_historial_anterior (data.id_historial_expediente)
        await derivar_expediente(historial_anterior, data);
        return {
            success: true,
            message: "Expediente recepcionado"
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
                    id_unidad_destino,
                    estado
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
        throw new Error(error.message || "Ocurrió un error al recepcionar el expediente");
    }
}

async function derivar_expediente(historial_anterior, data) {
    const fecha_derivacion = calcularFechaTerminoLima();

    try {
        
        const query = {
            text: `
                INSERT INTO historial_expedientes
                (id_expediente, id_unidad_origen, id_unidad_destino, fecha_envio, estado, justificacion)
                VALUES ($1, $2, $3, $4, 'En proceso', $5);
            `,
            values: [
                historial_anterior.id_expediente,
                historial_anterior.id_unidad_destino,
                data.unidad_organica,
                fecha_derivacion,
                data.justificacion
            ]
        };

        const resultado = await conect.query(query);

        if (resultado.rowCount === 0) {
            throw new Error("No se insertó ningún registro en la base de datos");
        }

        return 

    } catch (error) {
        console.error("Error real:", error);
        throw new Error(error.message || "Ocurrió un error al derivar el expediente");
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