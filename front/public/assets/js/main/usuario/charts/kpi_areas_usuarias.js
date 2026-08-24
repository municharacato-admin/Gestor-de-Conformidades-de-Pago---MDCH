import { init_button_listener } from "../view_history_per_user.js";

export function run_kpi_areas_usuarias_engine(data) {
    const datos = procesamiento_datos(data);
    render_cards(datos);
}

function procesamiento_datos(data) {

    const pesos = {
        w_pagados: 1,
        w_en_proceso: 0.5,
        w_retrasados: -1,
        w_cancelados: 1
    };

    return data.Kpis_porGerencia.map(item => {

        // --- Normalización ---
        const total = Number(item.total) || 0;
        const pagados = Number(item.pagados) || 0;
        const retrasados = Number(item.retrasados) || 0;
        const en_proceso = Number(item.en_proceso) || 0;
        const cancelados = Number(item.cancelados) || 0;

        const pipeline_total = Number(item.pipeline_total) || 0;
        const pipeline_area_usuaria = Number(item.pipeline_area_usuaria) || 0;
        const pipeline_administracion = Number(item.pipeline_administracion) || 0;
        const pipeline_logistica = Number(item.pipeline_logistica) || 0;
        const pipeline_contabilidad = Number(item.pipeline_contabilidad) || 0;
        const pipeline_tesoreria = Number(item.pipeline_tesoreria) || 0;

        const retrasados_area_usuaria = Number(item.retrasados_area_usuaria) || 0;
        const retrasados_administracion = Number(item.retrasados_administracion) || 0;
        const retrasados_logistica = Number(item.retrasados_logistica) || 0;
        const retrasados_contabilidad = Number(item.retrasados_contabilidad) || 0;
        const retrasados_tesoreria = Number(item.retrasados_tesoreria) || 0;

        const pct = (val, base) => base === 0 ? 0 : Math.round((val / base) * 100);

        // --- Porcentajes pipeline (planos) ---
        const pipeline_area_usuaria_pct = pct(pipeline_area_usuaria, pipeline_total);
        const pipeline_administracion_pct = pct(pipeline_administracion, pipeline_total);
        const pipeline_logistica_pct = pct(pipeline_logistica, pipeline_total);
        const pipeline_contabilidad_pct = pct(pipeline_contabilidad, pipeline_total);
        const pipeline_tesoreria_pct = pct(pipeline_tesoreria, pipeline_total);

        // --- Porcentajes retrasados (planos) ---
        const retrasados_area_usuaria_pct = pct(retrasados_area_usuaria, retrasados);
        const retrasados_administracion_pct = pct(retrasados_administracion, retrasados);
        const retrasados_logistica_pct = pct(retrasados_logistica, retrasados);
        const retrasados_contabilidad_pct = pct(retrasados_contabilidad, retrasados);
        const retrasados_tesoreria_pct = pct(retrasados_tesoreria, retrasados);

        // --- Rendimiento ---
        let rendimiento = "N/A";

        if (total > 0) {
            const score =
                pagados * pesos.w_pagados +
                en_proceso * pesos.w_en_proceso +
                retrasados * pesos.w_retrasados +
                cancelados * pesos.w_cancelados;

            const score_min = total * pesos.w_retrasados;
            const score_max = total * pesos.w_pagados;

            if (score_max !== score_min) {
                let normalized = (score - score_min) / (score_max - score_min);
                let scaled = normalized * 100;

                // clamp + entero
                rendimiento = Math.round(Math.max(0, Math.min(100, scaled)));
            }
        }

        return {
            ...item,

            pipeline_area_usuaria_pct,
            pipeline_administracion_pct,
            pipeline_logistica_pct,
            pipeline_contabilidad_pct,
            pipeline_tesoreria_pct,

            retrasados_area_usuaria_pct,
            retrasados_administracion_pct,
            retrasados_logistica_pct,
            retrasados_contabilidad_pct,
            retrasados_tesoreria_pct,

            rendimiento,

            promedio_dias_pago: item.promedio_dias_pago ?? "N/A",
            promedio_dias_retrasados: item.promedio_dias_retrasados ?? "N/A"
        };
    });
}

function render_cards(datos) {
    const container = document.getElementById("kpi-cards-container");


    if (!container) return;

    const cards = render_cards_engine(datos)

    container.innerHTML = cards.join("");
    
    init_button_listener(datos)    
}

function render_cards_engine(datos) {

    const getHeaderConfig = (rendimiento) => {
        const color = getColorByRendimiento(rendimiento);

        if (rendimiento === "N/A") {
            return { class: "neutral", icon: "bi-dash-circle", label: "N/A", color };
        }
        if (rendimiento >= 75) {
            return { class: "good", icon: "bi-emoji-laughing-fill", label: "Good", color };
        }
        if (rendimiento >= 26) {
            return { class: "mid", icon: "bi-emoji-neutral-fill", label: "Regular", color };
        }
        return { class: "bad", icon: "bi-emoji-frown-fill", label: "Crítico", color };
    };

    return datos.map(item => {

        const header = getHeaderConfig(item.rendimiento);
        const idSafe = item.area_usuaria.replace(/\s+/g, "-").toLowerCase();

        return `
        <div class="col-12 mb-3" data-idArea="${item.id_area_usuaria}">
            <div class="card">
                <div class="card-body">

                    <!-- Header -->
                    <div class="area-card-header ${header.class}">
                        <div class="area-icon">
                            <i class="bi ${header.icon}"></i>
                        </div>
                        <div class="area-content">
                            <span class="area-usuaria-title">${item.area_usuaria}</span>
                            <span class="area-usuaria-subtitle">${item.total} Conformidades</span>
                        </div>
                        <div class="area-flag">${header.label}</div>
                    </div>

                    <!-- Accordion (solo uno abierto) -->
                    <div class="accordion mt-3 mb-3" id="acc-${idSafe}">

                        <div class="accordion-item">
                            <h2 class="accordion-header">
                                <button class="accordion-button" data-bs-toggle="collapse" data-bs-target="#pipe-${idSafe}">
                                    Flujo de carga activa
                                </button>
                            </h2>
                            <div id="pipe-${idSafe}" class="accordion-collapse collapse show" data-bs-parent="#acc-${idSafe}">

                                ${renderFila("Área usuaria", item.pipeline_area_usuaria, item.pipeline_area_usuaria_pct, getHint("area_usuaria", item, "pipeline"))}
                                ${renderFila("Administración", item.pipeline_administracion, item.pipeline_administracion_pct, getHint("administracion", item, "pipeline"))}
                                ${renderFila("Logística", item.pipeline_logistica, item.pipeline_logistica_pct, getHint("logistica", item, "pipeline"))}
                                ${renderFila("Contabilidad", item.pipeline_contabilidad, item.pipeline_contabilidad_pct, getHint("contabilidad", item, "pipeline"))}
                                ${renderFila("Tesorería", item.pipeline_tesoreria, item.pipeline_tesoreria_pct, getHint("tesoreria", item, "pipeline"))}

                            </div>
                        </div>

                        <div class="accordion-item">
                            <h2 class="accordion-header">
                                <button class="accordion-button collapsed" data-bs-toggle="collapse" data-bs-target="#ret-${idSafe}">
                                    Flujo de retrasados
                                </button>
                            </h2>
                            <div id="ret-${idSafe}" class="accordion-collapse collapse" data-bs-parent="#acc-${idSafe}">

                                ${renderFila("Área usuaria", item.retrasados_area_usuaria, item.retrasados_area_usuaria_pct, getHint("area_usuaria", item, "retrasados"))}
                                ${renderFila("Administración", item.retrasados_administracion, item.retrasados_administracion_pct, getHint("administracion", item, "retrasados"))}
                                ${renderFila("Logística", item.retrasados_logistica, item.retrasados_logistica_pct, getHint("logistica", item, "retrasados"))}
                                ${renderFila("Contabilidad", item.retrasados_contabilidad, item.retrasados_contabilidad_pct, getHint("contabilidad", item, "retrasados"))}
                                ${renderFila("Tesorería", item.retrasados_tesoreria, item.retrasados_tesoreria_pct, getHint("tesoreria", item, "retrasados"))}

                            </div>

                        </div>

                    </div>
                    
                    <button type="button" class="btn btn-info w-100 btn-ver-historial text-white">Ver historial</button>

                </div>

                <!-- Footer rendimiento -->
                <div class="card-footer py-2">
                    <div class="d-flex align-items-center gap-2 mb-1">
                        <span class="small text-muted">Rendimiento</span>
                        <span class="ms-auto fw-bold text-${header.color}">
                            ${item.rendimiento}%
                        </span>
                    </div>
                    <div class="progress" style="height:5px;">
                        <div class="progress-bar bg-${header.color}" style="width:${item.rendimiento}%"></div>
                    </div>
                </div>

            </div>
        </div>
        `;
    });
}

function renderFila(nombre, valor, pct, hintClass = "") {

    const color = getColorByPct(pct);

    return `
    <div class="kpi-row ${hintClass}">
        <div class="kpi-col kpi-col-area">${nombre}</div>
        <div class="kpi-col kpi-col-progress">
            <div class="progress">
                <div class="progress-bar bg-${color}" style="width:${pct}%">${pct}%</div>
            </div>
        </div>
        <div class="kpi-col kpi-col-value">${valor}</div>
    </div>
    `;
}

function getHint(areaKey, item, tipo) {

    const esRetraso = item.oficina_mas_retrasada === areaKey;
    const esCuello = item.cuello_botella === areaKey;

    // prioridad absoluta: retrasados
    if (esRetraso) return "hint-retrasado";

    // solo aplica cuello en pipeline
    if (tipo === "pipeline" && esCuello) return "hint-cuello-botella";

    return "";
}

function getColorByPct(pct) {
    if (pct >= 75) return "danger";
    if (pct >= 26) return "warning";
    return "success";
}

function getColorByRendimiento(r) {
    if (r === "N/A") return "secondary";
    if (r < 26) return "danger";
    if (r < 75) return "warning";
    return "success";
}