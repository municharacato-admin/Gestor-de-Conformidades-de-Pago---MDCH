/* @license Apache-2.0; ver LICENCIA.txt */

export function run_kpi_cards_engine(data) {
    render_cards(data);
}

function render_cards(data) {
    const container = document.getElementById("kpis-card-container");

    if (!container) return;

    const diccionario = create_dicctionary(data)

    const cards = diccionario.map(item => create_card(item));

    container.innerHTML = cards.join("");
}

function create_card({ title, value, icon, color }) {
    return `
        <div class="col-sm-12 col-md-4 col-lg-3 mb-3">
            <div class="card stat-card position-relative shadow-sm border-0">
                
                <div class="accent-bar bg-${color}"></div>

                <div class="card-body d-flex align-items-center p-3">

                    <div class="stat-icon text-${color} text-center">
                        ${icon}
                    </div>

                    <div class="ms-3 flex-grow-1">
                        <p class="mb-1 small text-secondary fw-bold">${title}</p>
                        <h3 class="mb-0 fw-bold text-${color}">
                            ${format_number(value)}
                        </h3>
                    </div>

                </div>
            </div>
        </div>
    `;
}

function format_number(num) {
    return new Intl.NumberFormat("es-PE").format(num);
}

function create_dicctionary(data){
    return [
        {
            title: "Total conformidades",
            value: data.total_conformidades,
            icon: '<i class="bi bi-bar-chart-fill"></i>',
            color: "primary"
        },{
            title: "Pagados",
            value: data.total_conformidades_pagados,
            icon: '<i class="bi bi-check-circle-fill"></i>',
            color: "success"
        },{
            title: "En proceso",
            value: data.total_conformidades_enProceso,
            icon: '<i class="bi bi-clock-fill"></i>',
            color: "warning"
        },{
            title: "Retrasados",
            value: data.total_conformidades_retrasados,
            icon: '<i class="bi bi-hourglass-bottom"></i>',
            color: "danger"
        },{
            title: "Sin recepción",
            value: data.total_conformidades_sinRecepcion,
            icon: '<i class="bi bi-watch"></i>',
            color: "info"
        },{
            title: "Cancelados",
            value: data.total_conformidades_cancelados,
            icon: '<i class="bi bi-x-circle-fill"></i>',
            color: "danger"
        }
    ]
}
