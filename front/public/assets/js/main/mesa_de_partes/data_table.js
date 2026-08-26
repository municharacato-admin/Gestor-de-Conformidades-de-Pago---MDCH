/* @license Apache-2.0; ver LICENCIA.txt */

let tablaExpedientes = null;
let intervaloActualizacion = null; // 🕒 control del intervalo

export async function iniciar_data_table() {
    if (tablaExpedientes) return; // Evita reinicializarla

    tablaExpedientes = new DataTable("#tabla", {
        ajax: {
            url: get_expedientes_enviados_mesa_de_partes,
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
            { data: "numero_expediente", title: "N° Expediente", className: "text-start" },
            { data: "origen", title: "Origen" },
            { data: "destino", title: "Destino" },
            {
                data: "fecha_envio",
                title: "Enviado",
                render: data => formatearFechaLima(data)
            },
            {
                data: "fecha_recepcion",
                title: "Recepción",
                render: data =>
                    data === "No recepcionado" ? data : formatearFechaLima(data)
            },
            {
                data: null,
                title: "Opciones",
                orderable: false,
                render: (data, type, row) => `
                    <button class="btn btn-sm btn-danger btn-eliminar-exp" data-id="${row.numero_expediente}">
                        <i class="bi bi-file-earmark-x-fill"></i>
                    </button>
                `,
                className: "text-center"
            }
        ],

        scrollX: true,
        autoWidth: false,
        responsive: true,
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
                exportOptions: { columns: ":visible" }
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

export async function reiniciar_data_table() {
    if (tablaExpedientes) {
        tablaExpedientes.ajax.reload(null, false); // Recarga datos sin perder página
    } else {
        console.warn("La tabla no está inicializada todavía");
    }
}

/**
 * Listener de botones 
 */

document.querySelector("#tabla").addEventListener("click", async (e) => {
    const btn = e.target.closest(".btn-eliminar-exp");
    if (!btn) return; // 👈 primero validamos
    const id = btn.dataset; 
    await recepcionar_expediente(id);
});


async function recepcionar_expediente(id) {
    mostrar_preloader("Eliminando expediente");

    try {
        const response = await fetch(post_eliminar_expediente_mp, {
            method: "POST",
            credentials: "include",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(id)
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
