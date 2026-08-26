/* @license Apache-2.0; ver LICENCIA.txt */

export async function inicializar_cancelados() {
    iniciar_data_table();
}

//si no hay cancelados, la pestaña no aparecerá

/**
 * Bloque de inicialización y configuracion de DataTable
 */

let tabla = null;
let intervaloActualizacion = null;

export async function iniciar_data_table() {
    if (tabla) return; // Evita reinicializarla

    tabla = new DataTable("#tbl-cancelados", {
        ajax: {
            url: get_expedientes_cancelados_usuarios,
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
            {
                data: "fecha_cancelado",
                title: "Cancelado",
                render: data => formatearFechaLima(data)
            },
            { data: "justificacion", title: "Justificación" }
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
                title: "Expedientes cancelados",
                filename: "expedientes_cancelados"
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
function formatearFechaLima(fechaISO) {
    if (!fechaISO || fechaISO === "Fecha corrupta") return fechaISO;

    const fecha = new Date(fechaISO);
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
    const pestania = document.getElementById("pestania-cancelados");
    if(hay_datos){
        pestania.style.display="block";
    }else{
        pestania.style.display="none";
    }
}
