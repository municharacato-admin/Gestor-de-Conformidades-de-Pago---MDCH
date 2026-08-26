/* @license Apache-2.0; ver LICENCIA.txt */

export function render_chart_distribucion_estado(data) {

    // 1. preparar datos
    const chartData = calcular_distribucion(data);

    // 2. config
    const config = {
        label: "Distribución de conformidades",
        description: "Proporción según estado actual."
    };

    // 3. DOM - Se agrega sin eliminar lo anterior
    dom_control(config);

    // 4. chart
    render_donut_chart(chartData);
}


function dom_control(config = {}) {

    const container = document.getElementById("chart-card-container");
    if (!container) return;

    // Ya NO limpiamos el contenedor (innerHTML = "")
    // Solo agregamos el nuevo card

    const wrapper = document.createElement("div");
    wrapper.className = "col-12 col-lg-4 mb-3";

    wrapper.innerHTML = `
            <div class="card shadow-sm border-0">
                
                <div class="card-body">

                    <div class="mb-2">
                        <span class="fw-semibold">${config.label}</span>
                    </div>

                    <p class="text-secondary small mb-3">
                        ${config.description}
                    </p>

                    <div class="position-relative w-100" style="height: 220px;">
                        <canvas id="chart_distribucion"></canvas>
                    </div>

                </div>
            </div>
    `;

    container.appendChild(wrapper);
}


function calcular_distribucion(data) {

    const total = Number(data.total_conformidades) || 0;

    const pagados     = Number(data.total_conformidades_pagados)     || 0;
    const enProceso   = Number(data.total_conformidades_enProceso)   || 0;
    const retrasados  = Number(data.total_conformidades_retrasados)  || 0;
    const cancelados  = Number(data.total_conformidades_cancelados)  || 0;

    return {
        labels: ["Pagados", "En Proceso", "Retrasados", "Cancelados"],
        values: [pagados, enProceso, retrasados, cancelados]
    };
}


function render_donut_chart(chartData) {

    const canvas = document.getElementById("chart_distribucion");
    if (!canvas) return;

    const ctx = canvas.getContext("2d");

    new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: chartData.labels,
            datasets: [{
                data: chartData.values,
                backgroundColor: [
                    "#198754", // verde  → Pagados
                    "#ffc107", // amarillo → En Proceso
                    "#dc3545", // rojo    → Retrasados
                    "#6c757d"  // gris    → Cancelados
                ],
                borderWidth: 0
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            cutout: "65%",
            plugins: {
                legend: {
                    position: 'bottom'
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const total = context.dataset.data.reduce((a, b) => a + b, 0);
                            const value = context.raw;
                            const percentage = ((value / total) * 100).toFixed(1);
                            return `${context.label}: ${value} (${percentage}%)`;
                        }
                    }
                }
            }
        }
    });
}
