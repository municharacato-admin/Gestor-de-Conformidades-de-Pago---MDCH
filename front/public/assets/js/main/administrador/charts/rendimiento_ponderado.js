export function render_chart_rendimiento_ponderado(data){

    // 1. calcular KPI
    const value = calcular_rendimiento_global(data);

    // 2. configuración centralizada (single source of truth)
    const config = {
        label: "Rendimiento ponderado",
        description: "Rendimiento general de las conformidades.",
        suffix: "%",
        thresholds: {
            success: 75,
            warning: 50
        }
    };

    // 3. construir DOM dinámico
    dom_control(config, value);

    // 4. renderizar chart
    render_gauge_chart(value, config);
}


function dom_control(config = {}, value = 0) {

    const container = document.getElementById("chart-card-container");
    if (!container) return;

    container.innerHTML = "";

    const defaultConfig = {
        label: "Rendimiento",
        description: "Indicador",
        thresholds: {
            success: 75,
            warning: 50
        },
        colors: {
            success: "success",
            warning: "warning",
            danger: "danger"
        }
    };

    const cfg = {
        ...defaultConfig,
        ...config,
        thresholds: { ...defaultConfig.thresholds, ...config.thresholds },
        colors: { ...defaultConfig.colors, ...config.colors }
    };

    // color dinámico del badge
    let badgeColor;
    if (value >= cfg.thresholds.success) badgeColor = cfg.colors.success;
    else if (value >= cfg.thresholds.warning) badgeColor = cfg.colors.warning;
    else badgeColor = cfg.colors.danger;

    const wrapper = document.createElement("div");
    wrapper.className = "col-12 col-lg-8 mb-3";

    wrapper.innerHTML = `
            <div class="card shadow-sm border-0">
                
                <div class="card-body">

                    <div class="d-flex justify-content-between align-items-center mb-2">
                        <span class="fw-semibold">${cfg.label}</span>
                        <span class="badge bg-${badgeColor} text-light border">
                            ${value}%
                        </span>
                    </div>

                    <p class="text-secondary small mb-3">
                        ${cfg.description}
                    </p>

                    <div class="position-relative w-100" style="height: 220px;">
                        <canvas id="chart_rendimientoPonderado"></canvas>
                    </div>

                </div>
            </div>
    `;

    container.appendChild(wrapper);
}


function calcular_rendimiento_global(data) {

    /*
    ============================================================
    MODELO DE CÁLCULO DE RENDIMIENTO DE CONFORMIDADES
    ============================================================

    CAPA 1: FLUJO PRINCIPAL (estados excluyentes)

        score_base =
            (pagados * 1.0) +
            (enProceso * 0.5) +
            (retrasados * -0.7) +
            (cancelados * -0.3)

        rendimiento_base = (score_base / total) * 100


    CAPA 2: PENALIZACIÓN ESTRUCTURAL (estado transversal)

        penalizacion = (sinRecepcion / total) * 40


    ECUACIÓN FINAL:

        rendimiento_final =
            ((pagados*1.0 + enProceso*0.5 - retrasados*0.7 - cancelados*0.3) / total) * 100
            -
            ((sinRecepcion / total) * 40)


    NORMALIZACIÓN:

        si rendimiento_final < 0   → 0
        si rendimiento_final > 100 → 100

    ============================================================
    */

    const total = Number(data.total_conformidades) || 0;
    const pagados = Number(data.total_conformidades_pagados) || 0;
    const enProceso = Number(data.total_conformidades_enProceso) || 0;
    const retrasados = Number(data.total_conformidades_retrasados) || 0;
    const cancelados = Number(data.total_conformidades_cancelados) || 0;
    const sinRecepcion = Number(data.total_conformidades_sinRecepcion) || 0;

    if (total === 0) return 0;

    const score_base =
        (pagados * 1.0) +
        (enProceso * 0.5) +
        (retrasados * -0.7) +
        (cancelados * -0.3);

    const rendimiento_base = (score_base / total) * 100;

    const penalizacion = (sinRecepcion / total) * 40;

    let rendimiento_final = rendimiento_base - penalizacion;

    if (rendimiento_final < 0) rendimiento_final = 0;
    if (rendimiento_final > 100) rendimiento_final = 100;

    return Math.round(rendimiento_final);
}


function render_gauge_chart(value, config = {}) {

    const canvas = document.getElementById("chart_rendimientoPonderado");
    if (!canvas) return;

    const ctx = canvas.getContext("2d");

    const defaultConfig = {
        value: null,
        label: "Rendimiento",
        suffix: "%",

        thresholds: {
            success: 75,
            warning: 50
        },

        colors: {
            success: "#198754",
            warning: "#ffc107",
            danger: "#dc3545",
            background: "#e9ecef",
            textSecondary: "#6c757d"
        },

        gauge: {
            cutout: "75%",
            rotation: -90,
            circumference: 180
        },

        typography: {
            valueFont: "bold 36px sans-serif",
            labelFont: "13px sans-serif"
        },

        layout: {
            valueOffsetY: 0,
            labelOffsetY: 18
        },

        behavior: {
            showTooltip: false,
            showLegend: false
        }
    };

    const cfg = {
        ...defaultConfig,
        ...config,
        thresholds: { ...defaultConfig.thresholds, ...config.thresholds },
        colors: { ...defaultConfig.colors, ...config.colors },
        gauge: { ...defaultConfig.gauge, ...config.gauge },
        typography: { ...defaultConfig.typography, ...config.typography },
        layout: { ...defaultConfig.layout, ...config.layout },
        behavior: { ...defaultConfig.behavior, ...config.behavior }
    };

    const finalValue = cfg.value !== null ? cfg.value : value;

    const chartData = [finalValue, 100 - finalValue];

    let color;
    if (finalValue >= cfg.thresholds.success) color = cfg.colors.success;
    else if (finalValue >= cfg.thresholds.warning) color = cfg.colors.warning;
    else color = cfg.colors.danger;

    new Chart(ctx, {
        type: 'doughnut',
        data: {
            datasets: [{
                data: chartData,
                backgroundColor: [color, cfg.colors.background],
                borderWidth: 0,
                cutout: cfg.gauge.cutout
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            rotation: cfg.gauge.rotation,
            circumference: cfg.gauge.circumference,
            plugins: {
                legend: { display: cfg.behavior.showLegend },
                tooltip: { enabled: cfg.behavior.showTooltip }
            }
        },
        plugins: [
            {
                id: 'centerText',
                afterDraw(chart) {
                    const { ctx, chartArea } = chart;
                    if (!chartArea) return;

                    const x = chartArea.left + (chartArea.right - chartArea.left) / 2;
                    const y = chartArea.top + (chartArea.bottom - chartArea.top) / 1.4;

                    ctx.save();

                    ctx.textAlign = 'center';
                    ctx.fillStyle = color;
                    ctx.font = cfg.typography.valueFont;
                    ctx.fillText(
                        finalValue + cfg.suffix,
                        x,
                        y + cfg.layout.valueOffsetY
                    );

                    ctx.font = cfg.typography.labelFont;
                    ctx.fillStyle = cfg.colors.textSecondary;
                    ctx.fillText(
                        cfg.label,
                        x,
                        y + cfg.layout.labelOffsetY
                    );

                    ctx.restore();
                }
            }
        ]
    });
}