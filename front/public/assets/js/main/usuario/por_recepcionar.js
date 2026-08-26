/* @license Apache-2.0; ver LICENCIA.txt */

export async function inicializar_por_recepcionar() {
    iniciar_data_table();
}

/**
 * Bloque de inicialización y configuracion de DataTable
 */

let tabla = null;
let intervaloActualizacion = null;

export async function iniciar_data_table() {
    if (tabla) return; // Evita reinicializarla

    tabla = new DataTable("#tbl-no-recepcionados", {
        ajax: {
            url: get_expedientes_por_recepcionar_usuarios,
            type: "GET",
            xhrFields: { withCredentials: true },
            headers: { "Content-Type": "application/json" },
            dataSrc: function(json) {
                if (!json || !json.success || !Array.isArray(json.response)) {
                    console.error("Estructura inesperada:", json);
                    return [];
                }
                return json.response;
            },
            error: function(xhr, status, error) {
                console.error("Error AJAX DataTable:", status, error);
            }
        },
        columns: [
            { data: "id", title: "Id de registro", className: "text-start" },
            { data: "numero_expediente", title: "N° Expediente", className: "text-start" },
            { data: "origen", title: "Origen" },
            {
                data: "fecha_envio",
                title: "Enviado",
                render: data => formatearFechaLima(data)
            },
            {
                data: null,
                title: "Opciones",
                orderable: false,
                render: (data, type, row) => `
                    <button class="btn btn-sm btn-primary btn-recepcionar-exp" data-id="${row.id}">
                        Recepcionar
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
                title: "Expedientes por recepcionar",
                filename: "expedientes_por_recepcionar",
                exportOptions: { columns: ":visible:not(:last-child)" }
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

/**
 * 🔹 Formatea fecha ISO a formato legible (hora local de Lima)
 */
function formatearFechaLima(fechaISO) {
    if (!fechaISO || fechaISO === "No recepcionado") return fechaISO;

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

async function reiniciar_data_table() {
    if (tabla) {
        tabla.ajax.reload(null, false); // Recarga datos sin perder página
    } else {
        console.warn("La tabla no está inicializada todavía");
    }
}

/**
 * Listener de botones de recepcionar
 */

document.querySelector("#tbl-no-recepcionados").addEventListener("click", async (e) => {
    const btn = e.target.closest(".btn-recepcionar-exp");
    if (!btn) return; // 👈 primero validamos
    const id = btn.dataset.id; // 👈 ahora sí accedemos al dataset
    await recepcionar_expediente(id);
});


async function recepcionar_expediente(id) {
    mostrar_preloader("Recepcionando");

    try {
        const response = await fetch(post_recepcionar_expediente, {
            method: "POST",
            credentials: "include",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id: id })
        });

        const result = await response.json();
        ocultar_preloader();

        if (result.success) {
            reiniciar_data_table();
            aviso_exito("Expediente recepcionado");
        } else {
            aviso_error(result.message);
        }
    } catch (error) {
        ocultar_preloader();
        console.error("Error:", error);
        aviso_error("Error inesperado al recepcionar el expediente.");
    }
}
