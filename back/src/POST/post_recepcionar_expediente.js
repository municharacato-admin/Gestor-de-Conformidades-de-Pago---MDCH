/* @license Apache-2.0; ver LICENCIA.txt */

/**
 * Dependencias propias
 */
import conect from '../../connect_db.js';

/**
 * Actualizar historial expediente a "Recepcionado"
 */
export async function post_recepcionar_expediente(data) {
    try {
        await recepcionar_expediente(data.id);
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

async function recepcionar_expediente(data) {
    const fecha_recepcion = calcularFechaTerminoLima();

    try {
        
        // 🔹 Actualizar estado y fecha recepcion
        const query = {
            text: `
                UPDATE historial_expedientes
                SET
                    fecha_recepcion = $1
                WHERE id = $2;
            `,
            values: [fecha_recepcion, data]
        };

        const resultado = await conect.query(query);

        if (resultado.rowCount === 0) {
            throw new Error("No se insertó ningún registro en la base de datos");
        }

        return 

    } catch (error) {
        console.error("Error real:", error);
        throw new Error(error.message || "Ocurrió un error al recepcionar el expediente");
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
