import { init_chart_engine } from "./chart_engine.js";
import { inicializar_por_recepcionar } from "./por_recepcionar.js";
import { inicializar_recepcionados } from "./recepcionados.js";
import { inicializar_derivados } from "./derivados.js";
import { inicializar_cancelados } from "./cancelados.js";
import { inicializar_pagados } from "./pagados.js";

document.addEventListener("DOMContentLoaded", async () => {
    mostrar_preloader("Cargando datos...");
    
    init_chart_engine()
    await inicializar_por_recepcionar();
    await inicializar_recepcionados();
    await inicializar_derivados();
    await inicializar_cancelados();
    await inicializar_pagados();

    ocultar_preloader();
});