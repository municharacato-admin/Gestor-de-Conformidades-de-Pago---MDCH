/* @license Apache-2.0; ver LICENCIA.txt */

import { iniciar_data_table, reiniciar_data_table } from "./data_table.js";

document.addEventListener("DOMContentLoaded", async () => {

    //Iniciacion de inputs
    //iniciar_ipt_fecha_hora(); (Decicion en debate, por el momento se cree que no es necesario ese control)
    await iniciar_ipt_unidad_organica();
    document.getElementById("btn-registrar-expediente").addEventListener("click", async () => {
        await registrar_expediente();
    });
    await iniciar_data_table();
});

function iniciar_ipt_fecha_hora() {
    flatpickr("#ipt-fecha-hora", {
        enableTime: true,
        dateFormat: "Y-m-d H:i",
        locale: "es",
        time_24hr: true,
        minDate: "today"
    });
}

function reiniciar_formulario_registro() {
    /* const input = document.querySelector("#ipt-fecha-hora");

    if (input && input._flatpickr) {
        // Si Flatpickr está activo
        input._flatpickr.clear();
    } else if (input) {
        // Si es un input normal
        input.value = "";
    } */

    document.getElementById("ipt-numero-expediente").value = "";

    if (unidadesChoices) {
        // Reinicia el select de Choices.js al placeholder
        unidadesChoices.removeActiveItems();
        unidadesChoices.setChoiceByValue("");
    } else {
        // Si no hay instancia activa de Choices (caso raro)
        document.getElementById("ipt-unidad-organica").value = "";
    }
}


// fuera de la función, para poder reutilizarla / destruir la instancia si hace falta
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

function validar_inputs() {
    const unidad = document.getElementById("ipt-unidad-organica").value.trim();
    const numero = document.getElementById("ipt-numero-expediente").value.trim();

    if (!unidad || !numero) {
        return false;
    }
    return true;
}

async function registrar_expediente() {
    mostrar_preloader();
    if (validar_inputs()) {
        try {
            const response = await fetch(post_publicar_expediente, {
                method: "POST",
                credentials: "include",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    unidad_organica: document.getElementById("ipt-unidad-organica").value.trim(),
                    numero_expediente: document.getElementById("ipt-numero-expediente").value.trim()
                })
            });

            const result = await response.json();
            ocultar_preloader();

            if (result.success) {
                reiniciar_formulario_registro();
                reiniciar_data_table();
                aviso_exito("Expediente enviado");
            } else {
                aviso_error(result.message);
            }
        } catch (error) {
            ocultar_preloader();
            console.error("Error:", error);
            aviso_error("Error inesperado al enviar el expediente.");
        }
    } else {
        aviso_informacion("Por favor, complete todos los campos.");
    }

}
