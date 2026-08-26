/* @license Apache-2.0; ver LICENCIA.txt */

const modal = new bootstrap.Modal(document.getElementById("modal_historial"));
const contenedor_body_historial = document.getElementById("contenedor-body-historial");

const biblioteca_iconos = [
    `<i class="bi bi-repeat"></i>`,//icono "En proceso"
    `<i class="bi bi-cash-stack"></i>`,// pagado
    `<i class="bi bi-x-circle"></i>`// cancelado
]

const biblioteca_color_background_contenedor_linea_tiempo = [
    `color-contenedor-icono-tiempo-linea-en-proceso`,
    `color-contenedor-icono-tiempo-linea-pagado`,
    `color-contenedor-icono-tiempo-linea-cancelado`
]

const biblioteca_color_cartel_estado_expediente_color_estado = [
    `cartel-estado-expediente-color-estado-en-proceso`,
    `cartel-estado-expediente-color-estado-pagado`,
    `cartel-estado-expediente-color-estado-cancelado`
]

export async function abrir_modal_historial(id) {
    mostrar_preloader("Construyendo historial...");
    let historial = await get_historial_expediente(id);

    if (!historial.success) {
        ocultar_preloader();
        aviso_error(historial.message);
        return;
    }

    construir_historial(historial.data);

    ocultar_preloader();
    modal.show();
}

async function get_historial_expediente(id) {
    try {
        const url = `${obtener_historial_expediente}?id=${id}`;
        const response = await fetch(url, {
            method: "GET",
            credentials: "include",
            headers: { "Content-Type": "application/json" }
        });

        const result = await response.json();

        if (result.success) {
            return { success: true, data: result.response };
        } else {
            return { success: false, message: "Ocurrió un error en el servidor" };
        }
    } catch (error) {
        console.error("Error:", error);
        return { success: false, message: "Error de conexión" };
    }
}

function htmlToElement(html) {
    const template = document.createElement('template');
    template.innerHTML = html.trim();
    return template.content.firstChild;
}

function set_color_background_contenedor_linea_tiempo(estado) {
    switch (estado) {
        case "En proceso":
            return biblioteca_color_background_contenedor_linea_tiempo[0];
        case "Pagado":
            return biblioteca_color_background_contenedor_linea_tiempo[1];
        case "Cancelado":
            return biblioteca_color_background_contenedor_linea_tiempo[2];
        default:
            break;
    }
}

function set_icono_biblioteca_iconos(estado) {
    switch (estado) {
        case "En proceso":
            return biblioteca_iconos[0];
        case "Pagado":
            return biblioteca_iconos[1];
        case "Cancelado":
            return biblioteca_iconos[2];
        default:
            break;
    }
}

function set_color_biblioteca_color_cartel_estado_expediente_color_estado(estado){
    switch (estado) {
        case "En proceso":
            return biblioteca_color_cartel_estado_expediente_color_estado[0];
        case "Pagado":
            return biblioteca_color_cartel_estado_expediente_color_estado[1];
        case "Cancelado":
            return biblioteca_color_cartel_estado_expediente_color_estado[2];
        default:
            break;
    }
}

function formatearFechaHora(fechaStr) {
    const no_recepcionado = `
        <span class="text-danger">
            &nbsp;<i class="bi bi-exclamation-triangle"></i>&nbsp;No recepcionado
        </span>
    `;
    if (!fechaStr) return no_recepcionado; // null, undefined o vacío

    const fecha = new Date(fechaStr.replace(" ", "T")); // asegurar compatibilidad con ISO

    if (isNaN(fecha)) return no_recepcionado; // fecha inválida

    const dia = String(fecha.getDate()).padStart(2, "0");
    const mes = String(fecha.getMonth() + 1).padStart(2, "0");
    const anio = fecha.getFullYear();
    const horas = String(fecha.getHours()).padStart(2, "0");
    const minutos = String(fecha.getMinutes()).padStart(2, "0");

    return `${dia}/${mes}/${anio} - ${horas}:${minutos}`;
}

function set_block_justificacion(justificacion){
    const bloque_justificacion = `
        <div class="col-12">
            <div class="card card-contenedor-justificacion">
                <div class="card-body">
                    <span class="fw-bold">
                        Justificación:
                    </span>
                    &nbsp;
                    ${justificacion}
                </div>
            </div>
        </div>
    `;
    
    if(justificacion === "Sin justificación"){
        return ""
    }else{
        return bloque_justificacion
    }    
}

function construir_historial(historial) {
    console.log(historial)
    contenedor_body_historial.innerHTML = "";
    historial.forEach(element => {
        const plantilla_linea_tiempo = `
        <div class="col-1 contenedor-tiempo-linea">
            <div class="linea-tiempo"></div>
            <div class="contenedor-icono-tiempo-linea ${set_color_background_contenedor_linea_tiempo(element.estado)}">
                ${set_icono_biblioteca_iconos(element.estado)}
            </div>
        </div>
    `;
        contenedor_body_historial.appendChild(htmlToElement(plantilla_linea_tiempo));

        const plantilla_card_expediente = `
        <div class="col-11 pt-3 pb-3">
            <div class="card card-contenedor-informacion-historial">
                <div class="card-body">
                    <div class="row g-3">
                        <div class="col-lg-10 col-md-12 text-center text-lg-start">
                            <span class="cartel-unidad-organica">
                                ${element.origen}
                            </span>
                            &nbsp;
                            <i class="bi bi-signpost-split-fill" style="font-size: 1.2rem;"></i>
                            &nbsp;
                            <span class="cartel-unidad-organica">
                                ${element.destino}
                            </span>
                        </div>
                        <div class="col-lg-2 col-md-12 text-center text-lg-end">
                            <span class="cartel-estado-expediente ${set_color_biblioteca_color_cartel_estado_expediente_color_estado(element.estado)}">
                                ${element.estado}
                            </span>
                        </div>
                        <div class="col-md-12 col-lg-6 text-center fw-bold">
                            <i class="bi bi-send"></i>&nbsp;&nbsp;Enviado: ${formatearFechaHora(element.fecha_envio)}
                        </div>
                        <div class="col-md-12 col-lg-6 text-center fw-bold">
                            <i class="bi bi-send-check"></i>&nbsp;&nbsp;Recepcionado: ${formatearFechaHora(element.fecha_recepcion)}
                        </div>
                        ${set_block_justificacion(element.justificacion)}
                    </div>
                </div>
            </div>
        </div>
    `;
        contenedor_body_historial.appendChild(htmlToElement(plantilla_card_expediente));
    });

}
