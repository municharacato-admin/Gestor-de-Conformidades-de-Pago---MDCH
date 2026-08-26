/* @license Apache-2.0; ver LICENCIA.txt */

import { construir_data_table } from "./dataTable.js"
import { init_chart_engine } from "./chart_engine.js";

document.addEventListener("DOMContentLoaded", ()=>{
    init_chart_engine()
    construir_data_table();
})
