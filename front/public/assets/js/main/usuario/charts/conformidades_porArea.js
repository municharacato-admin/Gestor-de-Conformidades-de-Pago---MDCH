export function render_chart_estado_porGerencia(data) {

    if (!data || !data.Kpis_porGerencia) {
        console.error("Datos inválidos:", data);
        return;
    }

    const chartData = calcular_estado_porGerencia(data);

    render_dom();

    render_stacked_chart(chartData);
}

function render_dom() {

    const container = document.getElementById("chart-card-container");
    if (!container) return;

    const wrapper = document.createElement("div");
    wrapper.className = "col-12 mb-3";

    wrapper.innerHTML = `
        <div class="card shadow-sm border-0" id="card_estado_gerencias">
            <div class="card-body">
                <div class="mb-2">
                    <span class="fw-semibold">Estado por Gerencia</span>
                </div>
                <p class="text-secondary small mb-3">
                    Distribución de conformidades por estado en cada gerencia.
                </p>

                <div class="position-relative w-100" style="height: 80vh;">
                    <canvas id="chart_estado_gerencias"></canvas>
                </div>
            </div>
        </div>
    `;

    container.appendChild(wrapper);
}

function calcular_estado_porGerencia(data) {

    const dataset = data.Kpis_porGerencia;

    const sorted = dataset
        .map(item => ({
            area: item.area_usuaria.trim(),
            retrasados: Number(item.retrasados) || 0,
            proceso: Number(item.en_proceso) || 0,
            pagados: Number(item.pagados) || 0
        }))
        .sort((a, b) => 
            (b.retrasados + b.proceso + b.pagados) - 
            (a.retrasados + a.proceso + a.pagados)
        );

    return {
        labels: sorted.map(i => i.area),
        retrasados: sorted.map(i => i.retrasados),
        proceso: sorted.map(i => i.proceso),
        pagados: sorted.map(i => i.pagados)
    };
}

let chartInstance = null;

function render_stacked_chart(chartData) {

    const ctx = document
        .getElementById("chart_estado_gerencias")
        .getContext("2d");

    if (chartInstance) {
        chartInstance.destroy();
    }

    chartInstance = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: chartData.labels,
            datasets: [
                {
                    label: "Retrasados",
                    data: chartData.retrasados,
                    backgroundColor: "rgba(255, 0, 0, 0.6)"
                },
                {
                    label: "En proceso",
                    data: chartData.proceso,
                    backgroundColor: "rgba(255, 165, 0, 0.6)"
                },
                {
                    label: "Pagados",
                    data: chartData.pagados,
                    backgroundColor: "rgba(21, 255, 0, 0.6)" // tu color
                }
            ]
        },
        options: {
            indexAxis: 'y', // horizontal
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { position: 'top' },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return `${context.dataset.label}: ${context.parsed.x}`;
                        }
                    }
                }
            },
            scales: {
                x: {
                    stacked: true,
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Cantidad'
                    }
                },
                y: {
                    stacked: true,
                    title: {
                        display: true,
                        text: 'Gerencias'
                    }
                }
            }
        }
    });
}