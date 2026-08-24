/**
 * Dependencias propias
 */
import conect from '../../connect_db.js';

/**
 * Registro de expediente
 * registro en historial de expedientes
 */
export async function post_publicar_expediente(data) {
    try {
        const info_expediente_registrado = await registrar_expediente_db(data);
        await registrar_historial_expediente_inicial(info_expediente_registrado, data.unidad_organica);
        return {
            success: true,
            message: "Expediente registrado y enviado"
        };
    } catch (error) {
        return {
            success: false,
            message: error.message
        };
    }
}

async function registrar_expediente_db(data) {
    const { fecha_registro, fecha_termino } = calcularFechaTerminoLima();

    try {
        // 🔹 Validación: verificar duplicado
        const verificar = {
            text: `SELECT 1 FROM expedientes WHERE numero_expediente = $1 LIMIT 1`,
            values: [data.numero_expediente]
        };
        const existe = await conect.query(verificar);

        if (existe.rowCount > 0) {
            throw new Error("El número de expediente ya existe");
        }

        // 🔹 Insertar nuevo expediente y devolver su id
        const query = {
            text: `
                INSERT INTO expedientes (numero_expediente, fecha_hora_creacion, fecha_hora_termino, estado)
                VALUES ($1, $2, $3, 'En proceso')
                RETURNING id
            `,
            values: [data.numero_expediente, fecha_registro, fecha_termino]
        };

        const resultado = await conect.query(query);

        if (resultado.rowCount === 0) {
            throw new Error("No se insertó ningún registro en la base de datos");
        }

        // ✅ Retornar el id del expediente insertado
        return {
            id_expediente: resultado.rows[0].id,
            fecha_registro
        }

    } catch (error) {
        console.error("Error real:", error);
        throw new Error(error.message || "Ocurrió un error al registrar el expediente");
    }
}

async function registrar_historial_expediente_inicial(info_expediente_registrado, id_unidad_destino, id_unidad_origen = 26/*Id Mesa de partes */, estado = "En proceso") {
    
    try {
        const query = {
            text: `
                INSERT INTO historial_expedientes (id_expediente, id_unidad_origen, id_unidad_destino, fecha_envio, estado)
                VALUES ($1, $2, $3, $4, $5)
            `,
            values: [
                info_expediente_registrado.id_expediente,
                id_unidad_origen,
                id_unidad_destino,
                info_expediente_registrado.fecha_registro,
                estado
            ]
        };

        const resultado = await conect.query(query);

        if (resultado.rowCount === 0) {
            throw new Error("No se insertó ningún registro en la base de datos");
        }

    } catch (error) {
        console.error("Error real:", error);
        throw new Error(error.message || "Ocurrió un error al registrar el expediente");
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
    const fecha_registro = formatear(ahoraLima);

    // 🔹 Sumar días hábiles
    while (diasHabiles > 0) {
        fecha.setDate(fecha.getDate() + 1);
        const diaSemana = fecha.getDay(); // 0=Dom,6=Sab
        if (diaSemana !== 0 && diaSemana !== 6) diasHabiles--;
    }

    // 🔹 Fijar hora límite a 16:00:00
    fecha.setHours(16, 0, 0, 0);

    const fecha_termino = formatear(fecha);

    return { fecha_registro, fecha_termino };
}