import { run_kpi_cards_engine } from "./charts/kpi_global_cards.js";
import { render_chart_rendimiento_ponderado } from "./charts/rendimiento_ponderado.js";
import { render_chart_distribucion_estado } from "./charts/distribucion_estado.js";
import { render_chart_actividad_porDia } from "./charts/actividad_porDia.js";
import { render_chart_estado_porGerencia } from "./charts/conformidades_porArea.js";
import { run_kpi_areas_usuarias_engine } from "./charts/kpi_areas_usuarias.js";

export async function init_chart_engine() {
    await chart_engine();
}

async function chart_engine(){
    const raw_data = await get_data();
    if(!raw_data.success){
        return
    }
    run_kpi_cards_engine(raw_data.data);
    render_chart_rendimiento_ponderado(raw_data.data);
    render_chart_distribucion_estado(raw_data.data);
    run_kpi_areas_usuarias_engine(raw_data.data);
}

async function get_data(){
    try {
        const response = await fetch(get_estadisticas_usuario, {
            method: "GET",
            credentials: "include",
            headers: { "Content-Type": "application/json" }
        });

        const result = await response.json();

        if (result.success) {
            return result
        } else {
            return result
        }
    } catch (error) {
        console.error("Error:", error);
        return { success: false };
    }
}