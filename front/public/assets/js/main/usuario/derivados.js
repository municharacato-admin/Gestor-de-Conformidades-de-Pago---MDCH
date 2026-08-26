/* @license Apache-2.0; ver LICENCIA.txt */

export async function inicializar_derivados() {
    iniciar_data_table();
}

//si no hay derivados, la pestaña no aparecerá

/**
 * Bloque de inicialización y configuracion de DataTable
 */

let tabla = null;
let intervaloActualizacion = null;

export async function iniciar_data_table() {
    if (tabla) return; // Evita reinicializarla

    tabla = new DataTable("#tbl-derivados", {
        ajax: {
            url: get_expedientes_derivados_usuarios,
            type: "GET",
            xhrFields: { withCredentials: true },
            headers: { "Content-Type": "application/json" },
            dataSrc: function(json) {
                if (!json || !json.success || !Array.isArray(json.response)) {
                    console.error("Estructura inesperada:", json);
                    mostrar_ocultar_pestania(false);
                    return [];
                }

                if (json.response.length === 0) {
                    mostrar_ocultar_pestania(false); // 👈 No hay datos → ocultar pestaña
                    return [];
                }

                mostrar_ocultar_pestania(true); // 👈 Sí hay datos → mostrar pestaña
                return json.response; // 👈 Importante: aquí devuelves los datos reales
            },
            error: function(xhr, status, error) {
                console.error("Error AJAX DataTable:", status, error);
            }
        },
        columns: [
            { data: "id", title: "Id de registro", className: "text-start" },
            { data: "numero_expediente", title: "N° Expediente", className: "text-start" },
            { data: "destino", title: "Destino" },
            {
                data: "fecha_derivado",
                title: "Derivado",
                render: data => formatearFechaLima(data)
            },
            {
                data: "fecha_recepcion",
                title: "Recepción",
                render: data =>
                    data === "No recepcionado" ? data : formatearFechaLima(data)
            },
            { data: "justificacion", title: "Justificación" },
            {
                data: null,
                title: "Opciones",
                orderable: false,
                render: (data, type, row) => `
                    <button class="btn btn-sm btn-danger btn-eliminar-exp-usuario" data-id="${row.id}">
                        <i class="bi bi-file-earmark-x-fill"></i>
                    </button>
                `,
                className: "text-center"
            }
        ],

        scrollX: true,
        autoWidth: false,
        responsive: false,
        paging: true,
        searching: true,
        ordering: true,
        order: [[0, "desc"]],
        language: {
  url: 'https://cdn.datatables.net/plug-ins/1.13.7/i18n/es-ES.json'
},

        dom: "<'row mb-2'<'col-sm-12 col-md-6'B><'col-sm-12 col-md-6'f>>" +
             "<'row'<'col-sm-12'tr>>" +
             "<'row'<'col-sm-12 col-md-5'i><'col-sm-12 col-md-7'p>>",

        buttons: [
            {
                extend: "excelHtml5",
                text: '<i class="bi bi-file-earmark-excel"></i> Exportar a Excel',
                className: "btn btn-success",
                titleAttr: "Exportar tabla a Excel",
                title: "Expedientes derivados",
                filename: "expedientes_derivados"
            }
        ]
    });

    // 🔄 Refrescar cada segundo (solo una vez configurado)
    if (!intervaloActualizacion) {
        intervaloActualizacion = setInterval(() => {
            reiniciar_data_table();
        }, 1000); // 1000 ms = 1 segundo
    }
}

async function reiniciar_data_table() {
    if (tabla) {
        tabla.ajax.reload(null, false); // Recarga datos sin perder página
    } else {
        console.warn("La tabla no está inicializada todavía");
    }
}

/**
 * 🔹 Formatea fecha ISO a formato legible (hora local de Lima)
 */
function formatearFechaLima(fechaInput) {
    if (!fechaInput || fechaInput === "No recepcionado") return fechaInput;

    let fecha;

    // 🔹 Caso 1: ISO o formato parseable nativo
    if (!isNaN(Date.parse(fechaInput))) {
        fecha = new Date(fechaInput);
    } 
    // 🔹 Caso 2: formato DD/MM/YYYY HH:mm
    else if (/^\d{2}\/\d{2}\/\d{4}/.test(fechaInput)) {
        const [fechaPart, horaPart = "00:00"] = fechaInput.split(" ");
        const [dia, mes, anio] = fechaPart.split("/");

        fecha = new Date(`${anio}-${mes}-${dia}T${horaPart}:00`);
    } 
    // 🔹 Caso inválido
    else {
        return "Invalid Date";
    }

    if (isNaN(fecha.getTime())) return "Invalid Date";

    return fecha.toLocaleString("es-PE", {
        timeZone: "America/Lima",
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        hour12: false
    });
}

/**
 * oculta/muestra la pestaña de derivados si no tienes derivados
 */
function mostrar_ocultar_pestania(hay_datos) {
    const pestania = document.getElementById("pestania-derivados");
    if(hay_datos){
        pestania.style.display="block";
    }else{
        pestania.style.display="none";
    }
}

/**
 * Listener de botones 
 */

document.querySelector("#derivados").addEventListener("click", async (e) => {
    const btn = e.target.closest(".btn-eliminar-exp-usuario");
    if (!btn) return; // 👈 primero validamos
    const id = btn.dataset.id; 
    await eliminar_expediente_de_derivados(id);
});


async function eliminar_expediente_de_derivados(id) {
    mostrar_preloader("Retornando expediente");

    try {
        const response = await fetch(post_eliminar_expediente_usuario, {
            method: "POST",
            credentials: "include",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id: id })  // Enviar como objeto
        });

        const result = await response.json();
        ocultar_preloader();

        if (result.success) {
            reiniciar_data_table();
            aviso_exito(result.message);
        } else {
            aviso_error(result.message);
        }
    } catch (error) {
        ocultar_preloader();
        console.error("Error:", error);
        aviso_error("Servicio no funcionando.");
    }
}
