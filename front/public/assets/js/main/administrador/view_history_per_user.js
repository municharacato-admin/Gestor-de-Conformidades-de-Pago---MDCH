
import { abrir_modal_historial } from "./ver_historial.js"
let universal_data;
const modal = new bootstrap.Modal(document.getElementById("modal_historial_expedientes_uo"));
const contenedor_body_historial = document.getElementById("contenedor-body-historial-por-uo");

export async function init_button_listener(data_set){
    universal_data = data_set;

    document.getElementById('kpi-cards-container').addEventListener('click', async function(e) {
        const boton = e.target.closest('.btn-ver-historial');

        if (!boton) return;

        const card = boton.closest('[data-idarea]');

        if (!card) return;

        const idArea = card.dataset.idarea;

        await history_viewver(idArea);

    });
}

async function history_viewver(id_area, all_data = universal_data){
    mostrar_preloader("Construyendo historial...");
    const area_obj = all_data.find(item => item.id_area_usuaria === Number(id_area))
    if(!area_obj){
        ocultar_preloader();
        aviso_error("No se encontro el registro de la Unidad Organica")
        return
    }
    history_constructor(area_obj.detalle_expedientes);
    ocultar_preloader()
    modal.show();
}

function history_constructor(data){

    const AREA_LABELS = {
        area_usuaria: "Área Usuaria",
        administracion: "Administración",
        logistica: "Logística",
        contabilidad: "Contabilidad",
        tesoreria: "Tesorería"
    };

    contenedor_body_historial.innerHTML = "";

    Object.entries(data).forEach(([grupo, areas]) => {

        let totalExpedientes = 0;

        Object.values(areas).forEach(expedientes => {
            totalExpedientes += expedientes.length;
        });

        let html = `
            <div class="col-12 mb-4">
                <div class="card shadow-sm">
                    <div class="card-header d-flex justify-content-between align-items-center">
                        <strong>
                            ${
                                grupo === "pipeline"
                                    ? '<i class="bi bi-kanban"></i> Pipeline'
                                    : '<i class="bi bi-exclamation-triangle"></i> Retrasados'
                            }
                        </strong>
                        <span class="badge bg-primary">
                            ${totalExpedientes} expedientes
                        </span>
                    </div>
                    <div class="card-body">
        `;

        Object.entries(areas).forEach(([area, expedientes]) => {

            html += `
                <div class="mb-3">
                    <h6 class="border-bottom pb-2">
                        ${AREA_LABELS[area] ?? area}
                        <span class="badge bg-info ms-2">
                            ${expedientes.length}
                        </span>
                    </h6>
            `;

            if (expedientes.length === 0) {

                html += `
                    <small class="text-muted">
                        Sin expedientes registrados
                    </small>
                `;

            } else {

                html += `<div class="d-flex flex-wrap gap-2">`;

                expedientes.forEach(exp => {

                    html += `
                        <button
                            type="button"
                            class="btn btn-sm btn-outline-primary btn-expediente"
                            data-id="${exp.id_expediente}"
                            data-numero="${exp.numero_expediente}">
                            ${exp.numero_expediente}
                        </button>
                    `;

                });

                html += `</div>`;
            }

            html += `</div>`;
        });

        html += `
                    </div>
                </div>
            </div>
        `;

        contenedor_body_historial.insertAdjacentHTML("beforeend", html);
    });

    contenedor_body_historial
        .querySelectorAll(".btn-expediente")
        .forEach(btn => {

            btn.addEventListener("click", async() => {
                modal.hide()
                abrir_modal_historial(Number(btn.dataset.id))
                console.log({
                    id_expediente: Number(btn.dataset.id),
                    numero_expediente: btn.dataset.numero
                });

            });

        });

}