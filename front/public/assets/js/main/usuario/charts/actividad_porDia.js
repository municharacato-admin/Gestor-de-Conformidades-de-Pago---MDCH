/* @license Apache-2.0; ver LICENCIA.txt */

export function render_chart_actividad_porDia(data) {
    // Verificar que data existe y tiene la estructura esperada
    if (!data || !data.actividad_porDia) {
        console.error("Datos inválidos:", data);
        if (typeof aviso_error === 'function') {
            aviso_error("No se pudieron cargar los datos de actividad");
        }
        return;
    }

    // Guardamos los datos originales para poder filtrarlos después
    const originalData = data;

    // 1. Preparar datos iniciales (últimos 30 días por defecto)
    const chartData = calcular_actividad_porDia(originalData, null, 30);

    // 2. Config
    const config = {
        label: "Actividad por Día",
        description: "Cantidad de conformidades registradas por fecha."
    };

    // 3. DOM + Datepicker
    dom_control(config, originalData);

    // 4. Renderizar gráfico
    render_line_chart(chartData);
}

function dom_control(config = {}, originalData) {
    const container = document.getElementById("chart-card-container");
    if (!container) return;

    const wrapper = document.createElement("div");
    wrapper.className = "col-12 mb-3";

    wrapper.innerHTML = `
        <div class="card shadow-sm border-0">
            <div class="card-body">
                <div class="mb-2">
                    <span class="fw-semibold">${config.label}</span>
                </div>
                <p class="text-secondary small mb-3">${config.description}</p>
                
                <!-- Datepicker -->
                <div class="row g-2 mb-3">
                    <div class="col-6">
                        <label class="form-label small text-muted">Desde</label>
                        <input type="date" id="dateFrom" class="form-control form-control-sm">
                    </div>
                    <div class="col-6">
                        <label class="form-label small text-muted">Hasta</label>
                        <input type="date" id="dateTo" class="form-control form-control-sm">
                    </div>
                </div>
                <button id="btnAplicarFiltro" class="btn btn-primary mb-3">Aplicar Filtro</button>

                <div class="position-relative w-100" style="height: 240px;">
                    <canvas id="chart_actividadPorDia"></canvas>
                </div>
            </div>
        </div>
    `;

    container.appendChild(wrapper);

    // Configurar fechas por defecto (últimos 7 días)
    const today = new Date();
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(today.getDate() - 7);

    // Ajustar a UTC para evitar problemas de zona horaria
    document.getElementById("dateFrom").value = formatDateUTC(thirtyDaysAgo);
    document.getElementById("dateTo").value = formatDateUTC(today);

    // Evento del botón Aplicar
    document.getElementById("btnAplicarFiltro").addEventListener('click', () => {
        const fromStr = document.getElementById("dateFrom").value;
        const toStr = document.getElementById("dateTo").value;

        if (!fromStr || !toStr) {
            if (typeof aviso_error === 'function') {
                aviso_error("Por favor selecciona ambas fechas");
            }
            return;
        }

        const newChartData = calcular_actividad_porDia(originalData, fromStr, toStr);
        
        if (newChartData && newChartData.labels && newChartData.labels.length > 0) {
            updateLineChart(newChartData);
        } else if (typeof aviso_error === 'function') {
            aviso_error("No hay datos en el rango de fechas seleccionado");
        }
    });
}

// Función auxiliar para formatear fechas en UTC
function formatDateUTC(date) {
    return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, '0')}-${String(date.getUTCDate()).padStart(2, '0')}`;
}

function calcular_actividad_porDia(data, fromDate = null, toDate = null) {
    // Verificar que data y actividad_porDia existan
    if (!data || !data.actividad_porDia || !Array.isArray(data.actividad_porDia)) {
        console.error("Estructura de datos incorrecta:", data);
        return { labels: [], values: [] };
    }

    // Procesar los datos respetando la zona horaria UTC
    let actividad = data.actividad_porDia.map(item => {
        // Crear fecha UTC correctamente
        const fechaUTC = new Date(item.fecha);
        // Ajustar a la fecha local sin offset
        const fechaLocal = new Date(fechaUTC.getUTCFullYear(), fechaUTC.getUTCMonth(), fechaUTC.getUTCDate());
        
        return {
            fecha: fechaLocal,
            total: Number(item.total) || 0
        };
    });

    // Filtrar por rango de fechas
    if (fromDate && toDate) {
        const start = new Date(fromDate);
        const end = new Date(toDate);
        end.setHours(23, 59, 59, 999);

        actividad = actividad.filter(item => 
            item.fecha >= start && item.fecha <= end
        );
    } 
    else if (typeof toDate === "number") {
        // Si toDate es número → es cantidad de días atrás
        const daysAgo = new Date();
        daysAgo.setDate(daysAgo.getDate() - toDate);
        daysAgo.setHours(0, 0, 0, 0);
        
        actividad = actividad.filter(item => item.fecha >= daysAgo);
    }

    // Ordenar por fecha ascendente
    actividad.sort((a, b) => a.fecha - b.fecha);

    const labels = [];
    const values = [];

    actividad.forEach(item => {
        const dia = String(item.fecha.getDate()).padStart(2, '0');
        const mes = String(item.fecha.getMonth() + 1).padStart(2, '0');
        const año = item.fecha.getFullYear();
        labels.push(`${dia}/${mes}/${año}`);
        values.push(item.total);
    });

    return { labels, values };
}

// Instancia global del chart
let actividadChartInstance = null;

function render_line_chart(chartData) {
    const canvas = document.getElementById("chart_actividadPorDia");
    if (!canvas) return;

    const ctx = canvas.getContext("2d");

    if (actividadChartInstance) {
        actividadChartInstance.destroy();
    }

    // Verificar que hay datos para mostrar
    if (!chartData.labels || chartData.labels.length === 0) {
        // Mostrar mensaje de no datos
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.font = "14px Arial";
        ctx.fillStyle = "#999";
        ctx.textAlign = "center";
        ctx.fillText("No hay datos para mostrar", canvas.width/2, canvas.height/2);
        return;
    }

    actividadChartInstance = new Chart(ctx, {
        type: 'line',
        data: {
            labels: chartData.labels,
            datasets: [{
                label: "Conformidades registradas",
                data: chartData.values,
                borderColor: "rgb(21, 255, 0)",
                backgroundColor: "rgba(21, 255, 0, 0.15)",
                borderWidth: 3,
                tension: 0.4,
                pointRadius: 3.5,
                pointHoverRadius: 6,
                fill: true
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: true, position: 'top' },
                tooltip: { 
                    mode: 'index', 
                    intersect: false,
                    callbacks: {
                        label: function(context) {
                            return `Conformidades: ${context.parsed.y}`;
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    title: { display: true, text: 'Cantidad' },
                    ticks: { stepSize: 1, precision: 0 }
                },
                x: {
                    title: { display: true, text: 'Fecha' },
                    ticks: { 
                        maxTicksLimit: 15, 
                        autoSkip: true,
                        maxRotation: 45,
                        minRotation: 45
                    }
                }
            }
        }
    });
}

function updateLineChart(chartData) {
    if (actividadChartInstance) {
        actividadChartInstance.data.labels = chartData.labels;
        actividadChartInstance.data.datasets[0].data = chartData.values;
        actividadChartInstance.update();
    } else {
        // Si no existe la instancia, crear una nueva
        render_line_chart(chartData);
    }
}
