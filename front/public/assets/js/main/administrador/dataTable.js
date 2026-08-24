import { abrir_modal_historial } from "./ver_historial.js"
let Tabla;

export async function construir_data_table() {
    mostrar_preloader("Cargando información")
    const data = await obtener_exp()
    if (!data.success) {
        ocultar_preloader();
        aviso_error(data.message);
        return
    }
    construir_tabla(data.data)
    ocultar_preloader();
}

async function obtener_exp() {
    try {
        const response = await fetch(get_expedientes, {
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

function construir_tabla(data) {

    if ($.fn.DataTable.isDataTable("#tabla")) {
        Tabla.destroy();
    }

    Tabla = $("#tabla").DataTable({
        data,
        scrollX: true,
        autoWidth: false,
        responsive: false,
        order: [],
        language: {
            url: "https://cdn.datatables.net/plug-ins/1.13.5/i18n/es-ES.json"
        },
        columnDefs: [
            { targets: "_all", orderable: false, className: "align-middle" },
            { targets: [3, 4], className: "text-center" },
            { targets: [1], className: "text-start" }
        ],
        columns: [
            { data: "id", title: "ID", visible: false },
            { data: "numero_expediente", title: "N° Expediente", className: "text-start" },
            { data: "ultima_oficina", title: "Oficina", className: "text-start" },
            {
                data: "estado",
                title: "Estado",
                render: estado => {
                    let color = "secondary";
                    if (estado === "En proceso") color = "warning";
                    else if (estado === "Pagado") color = "success";
                    else if (estado === "Cancelado") color = "danger";
                    return `<h3 class="badge bg-${color}">${estado}</h3>`;
                }
            },
            {
                data: "fecha_hora_termino",
                title: "Expira",
                render: (fecha, type, row) => {
                    const idCelda = `countdown-${row.id}`;
                    const fechaLocal = new Date(fecha);
                    // Inicialmente muestra el tiempo restante (placeholder)
                    const diff = fechaLocal - new Date();
                    const minutos = Math.floor(diff / 60000);
                    return `<span id="${idCelda}" data-expira="${fechaLocal.toISOString()}">
                    ${minutos > 0 ? minutos + " min" : "Expirado"}
                </span>`;
                }
            },
            {
                data: null,
                title: "Opciones",
                className: "text-center",
                render: row => `
                    <button class="btn btn-primary btn-sm p-1 btn-historial" 
                        data-id="${row.id}" 
                        style="cursor:pointer">
                        <i class="bi bi-clock-history"></i>
                    </button>
                `
            }
        ],
        dom: 'Bfrtip',
        buttons: [
            {
                extend: 'excelHtml5',
                text: 'Exportar Excel',
                className: 'btn btn-success'
            }
        ]
    });
    iniciar_countdown();
}

export async function refrescar_datos_tabla() {
    try {
        const data = await obtener_exp();
        if (!data.success) {
            aviso_error("No se pudo actualizar la tabla.");
            return;
        }

        Tabla.clear();           // Limpia la data existente
        Tabla.rows.add(data.data); // Agrega nueva data
        Tabla.draw();            // Redibuja sin destruir
    } catch (error) {
        console.error(error);
        aviso_error("Error actualizando la tabla");
    }
}

$(document).on("click", ".btn-historial", async function() {
    const id = $(this).data("id");
    await abrir_modal_historial(id);
});

function iniciar_countdown() {
    setInterval(() => {
        $("[id^='countdown-']").each(function () {
            const span = $(this);
            const fechaExpira = new Date(span.data("expira"));
            const ahora = new Date();
            const diff = fechaExpira - ahora;

            if (diff <= 0) {
                span.text("Expirado");
                span.removeClass("text-success text-warning").addClass("text-danger");
                return;
            }

            const dias = Math.floor(diff / (1000 * 60 * 60 * 24));
            const horas = Math.floor((diff / (1000 * 60 * 60)) % 24);
            const minutos = Math.floor((diff / (1000 * 60)) % 60);
            const segundos = Math.floor((diff / 1000) % 60);

            let texto = "";
            if (dias > 0) texto += `${dias}d `;
            if (horas > 0 || dias > 0) texto += `${horas}h `;
            if (minutos >= 0) texto += `${minutos}m `;
            texto += `${segundos}s`;

            // Cambiar color según cercanía al vencimiento
            span
                .removeClass("text-success text-warning text-danger")
                .addClass(
                    diff < 3600000 ? "text-warning" :  // < 1h
                    diff < 86400000 ? "text-success" : // < 1 día
                    "text-secondary"                   // >= 1 día
                );

            span.text(texto);
        });
    }, 1000);
}
