/* @license Apache-2.0; ver LICENCIA.txt */

export async function inicializar_recepcionados() {
    iniciar_data_table();
}

/**
 * Bloque de inicialización y configuracion de DataTable
 */

let tabla = null;
let intervaloActualizacion = null;
const modal_derivar_expediente = new bootstrap.Modal(document.getElementById('modal-derivar-expediente'));
const modal_cancelar_expediente = new bootstrap.Modal(document.getElementById('modal-cancelar-expediente'));

export async function iniciar_data_table() {
    if (tabla) return; // Evita reinicializarla

    tabla = new DataTable("#tbl-recepcionados", {
        ajax: {
            url: get_expedientes_recepcionados_usuarios,
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
                data: "fecha_recepcion",
                title: "Recepcionado",
                render: data => formatearFechaLima(data)
            },
            { data: "justificacion", title: "Justificación" },
            {
                data: null,
                title: "Opciones",
                orderable: false,
                render: (data, type, row) => generarBotones(row.id),
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
                title: "Expedientes recepcionados",
                filename: "expedientes_recepcionados",
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

async function reiniciar_data_table() {
    if (tabla) {
        tabla.ajax.reload(null, false); // Recarga datos sin perder página
    } else {
        console.warn("La tabla no está inicializada todavía");
    }
}

/**
 * 🔹 Genera los botones según el usuario
 */
function generarBotones(id) {
    const botonesBase = `
        <button class="btn btn-sm btn-primary btn-derivar-exp" data-id="${id}">
            Derivar exp.
        </button>
        <br>
        <button class="btn btn-sm btn-danger btn-no-recepcionar-exp-usuario mt-2" data-id="${id}">
            <i class="bi bi-file-earmark-x-fill"></i>
        </button>
        <br>
        <button class="btn btn-sm btn-warning mt-2 btn-cancelar-exp" data-id="${id}">
            Cancelar exp.
        </button>
    `;

    // 👇 ID de usuario de tesorería (falta generar)
    const ID_USUARIO_ESPECIAL = "bb00ebf5-7f75-4ce9-9ab5-f4efffce57bb";

    // Si el usuario actual es el especial, agrega el botón adicional
    if (window.id_usuario_de_sistema === ID_USUARIO_ESPECIAL) {
        return (
            botonesBase +
            `
            <br>
            <button class="btn mt-2 btn-sm btn-danger btn-pagado" data-id="${id}">
                Confirmar pago
            </button>
            `
        );
    }

    return botonesBase;
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

/**
 * Funcionalidades de la logica para derivar expediente
 */
let unidadesChoices = null;

async function iniciar_ipt_unidad_organica() {
    try {
        const response = await fetch(get_unidades_organicas, {
            method: "GET",
            credentials: "include",
            headers: { "Content-Type": "application/json" }
        });

        const result = await response.json();

        if (!result.success) {
            return { success: false, message: "Ocurrió un error en el servidor" };
        }

        const select = document.getElementById("ipt-unidad-organica");
        select.innerHTML = "";

        // 1) Crear y añadir la opción placeholder VACÍA al principio
        const placeholderOption = document.createElement("option");
        placeholderOption.value = ""; // <-- valor vacío
        placeholderOption.textContent = "Selecciona una unidad orgánica";
        placeholderOption.selected = true;   // que esté seleccionada por defecto
        placeholderOption.disabled = true;   // opcional: que no sea seleccionable después
        placeholderOption.hidden = true;     // opcional: esconderla en la lista desplegable
        select.appendChild(placeholderOption);

        // 2) Añadir las opciones reales después
        result.response.forEach(item => {
            const option = document.createElement("option");
            option.value = item.id;
            option.textContent = item.nombre;
            select.appendChild(option);
        });

        // 3) Si había una instancia previa de Choices, destruirla
        if (unidadesChoices) {
            unidadesChoices.destroy();
            unidadesChoices = null;
        }

        // 4) Crear la nueva instancia y guardarla
        unidadesChoices = new Choices(select, {
            searchEnabled: true,
            placeholder: true,
            placeholderValue: 'Selecciona una unidad orgánica',
            itemSelectText: ''
        });

        return { success: true };
    } catch (error) {
        console.error("Error:", error);
        return { success: false, message: "Error de conexión" };
    }
}

function reiniciar_formulario_derivar_exp() {   
    document.getElementById("ipt-derivar-exp-container").value = "";
    if (unidadesChoices) {
        unidadesChoices.removeActiveItems();
        unidadesChoices.setChoiceByValue("");
    } else {
        document.getElementById("ipt-unidad-organica").value = "";
    }
    document.getElementById("ipt-justificacion-derivar").value = "";
}

function verificar_inputs_derivar_exp() {
    const id_historial_expediente = document.getElementById("ipt-derivar-exp-container").value.trim();
    const unidad_organica = document.getElementById("ipt-unidad-organica").value.trim();
    const justificacion = document.getElementById("ipt-justificacion-derivar").value.trim();

    if (!id_historial_expediente || !unidad_organica || !justificacion) {
        return false;
    }
    return true;
}

async function derivar_expediente() {
    mostrar_preloader("Derivando...");
    if (verificar_inputs_derivar_exp()) {
        try {
            const response = await fetch(post_derivar_expediente, {
                method: "POST",
                credentials: "include",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    id_historial_expediente: document.getElementById("ipt-derivar-exp-container").value.trim(),
                    unidad_organica: document.getElementById("ipt-unidad-organica").value.trim(),
                    justificacion: document.getElementById("ipt-justificacion-derivar").value.trim(),
                })
            });

            const result = await response.json();
            ocultar_preloader();
            modal_derivar_expediente.hide();
            if (result.success) {
                reiniciar_formulario_derivar_exp();
                reiniciar_data_table();
                aviso_exito("Expediente derivado");
            } else {
                aviso_error(result.message);
            }
        } catch (error) {
            modal_derivar_expediente.hide();
            ocultar_preloader();
            console.error("Error:", error);
            aviso_error("Error inesperado al derivar el expediente.");
        }
    } else {
        aviso_informacion("Por favor, complete todos los campos.");
    }

}

document.addEventListener("DOMContentLoaded", async () => {
    await iniciar_ipt_unidad_organica();
});

document.querySelector("#tbl-recepcionados").addEventListener("click", async (e) => {
    const btn = e.target.closest(".btn-derivar-exp");
    if (!btn) return; 
    const id = btn.dataset.id;
    reiniciar_formulario_derivar_exp();
    document.getElementById('ipt-derivar-exp-container').value = id;
    modal_derivar_expediente.show();
});

document.querySelector("#btn-derivar-exp").addEventListener("click", async (e) => {
    if (verificar_inputs_derivar_exp()) {
        await derivar_expediente();
    }else{
        aviso_error("Complete todos los campos obligatorios.");
    }
});

/**
 * Funcionalidades de la logica para cancelar expediente
 */

function reiniciar_formulario_cancelar_exp() {   
    document.getElementById("ipt-cancelar-exp-container").value = "";
    document.getElementById("ipt-justificacion-cancelar").value = "";
}

function verificar_inputs_cancelar_exp() {
    const id_historial_expediente = document.getElementById("ipt-cancelar-exp-container").value.trim();
    const justificacion = document.getElementById("ipt-justificacion-cancelar").value.trim();

    if (!id_historial_expediente || !justificacion) {
        return false;
    }
    return true;
}

async function cancelar_expediente() {
    mostrar_preloader("Cancelando...");
    if (verificar_inputs_cancelar_exp()) {
        try {
            const response = await fetch(post_cancelar_expediente, {
                method: "POST",
                credentials: "include",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    id_historial_expediente: document.getElementById("ipt-cancelar-exp-container").value.trim(),
                    justificacion: document.getElementById("ipt-justificacion-cancelar").value.trim(),
                })
            });

            const result = await response.json();
            ocultar_preloader();
            modal_cancelar_expediente.hide();
            if (result.success) {
                reiniciar_formulario_cancelar_exp();
                reiniciar_data_table();
                aviso_exito("Expediente cancelado");
            } else {
                aviso_error(result.message);
            }
        } catch (error) {
            modal_cancelar_expediente.hide();
            ocultar_preloader();
            console.error("Error:", error);
            aviso_error("Error inesperado al cancelar el expediente.");
        }
    } else {
        aviso_informacion("Por favor, complete todos los campos.");
    }

}

document.querySelector("#tbl-recepcionados").addEventListener("click", async (e) => {
    const btn = e.target.closest(".btn-cancelar-exp");
    if (!btn) return; 
    const id = btn.dataset.id;
    reiniciar_formulario_cancelar_exp();
    document.getElementById('ipt-cancelar-exp-container').value = id;
    modal_cancelar_expediente.show();
});

document.querySelector("#btn-cancelar-exp").addEventListener("click", async (e) => {
    if (verificar_inputs_cancelar_exp()) {
        await cancelar_expediente();
    }else{
        aviso_error("Complete todos los campos obligatorios.");
    }
});

/**
 * Funcionalidades de la logica para confirmar pago 
 */

async function pagar_expediente(id) {
    mostrar_preloader("Registrando pago...");
        try {
            const response = await fetch(post_pagar_expediente, {
                method: "POST",
                credentials: "include",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    id_historial_expediente: id
                })
            });

            const result = await response.json();
            ocultar_preloader();
            if (result.success) {
                reiniciar_data_table();
                aviso_exito("Pago registrado");
            } else {
                aviso_error(result.message);
            }
        } catch (error) {
            console.error("Error:", error);
            aviso_error("Error inesperado al registrar pago.");
        }
}

document.querySelector("#tbl-recepcionados").addEventListener("click", async (e) => {
    const btn = e.target.closest(".btn-pagado");
    if (!btn) return; 
    const id = btn.dataset.id;
    pagar_expediente(id);
});

/**
 * Funcionalidades de la logica para no recepcionar
 */

async function no_recepcionar(id) {
    mostrar_preloader("Retornando expediente");

    try {
        const response = await fetch(post_no_recepcionar_exp_usuario, {
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

document.querySelector("#tbl-recepcionados").addEventListener("click", async (e) => {
    const btn = e.target.closest(".btn-no-recepcionar-exp-usuario");
    if (!btn) return; 
    const id = btn.dataset.id;
    no_recepcionar(id);
});
