import conect from '../../connect_db.js';

export async function get_estadisticas_administrador (){
    try {

        const response = await buscar_bd();

        return{
            success: true,
            data: response
        }
    } catch (error) {
        return {
            success: false,
        }
    }
}

async function buscar_bd(){
    try {
        return {
            total_conformidades: await get_total_conformidades(),
            total_conformidades_enProceso: await get_total_conformidades_enProceso(),
            total_conformidades_retrasados: await get_total_conformidades_retrasados(),
            total_conformidades_cancelados: await get_total_conformidades_cancelados(),
            total_conformidades_pagados: await get_total_conformidades_pagados(),
            total_conformidades_sinRecepcion: await get_total_conformidades_sinRecepcion(),
            total_conformidades_porArea: await get_total_conformidades_porArea(),
            actividad_porDia: await get_actividad_porDia(),
            Kpis_porGerencia: await get_Kpis_porGerencia()
        };
    } catch (error) {
        console.log(error.message)
        return error.message
    }
}

async function get_Kpis_porGerencia(){
    try {
        const query = {
text:`
WITH primer_movimiento AS (
    SELECT DISTINCT ON (h.id_expediente)
        h.id_expediente,
        h.id_unidad_destino AS id_area_usuaria
    FROM historial_expedientes h
    WHERE h.id_unidad_origen = 26
    ORDER BY h.id_expediente, h.fecha_envio
),

ultimo_movimiento AS (
    SELECT DISTINCT ON (h.id_expediente)
        h.id_expediente,
        h.id_unidad_destino,
        h.fecha_envio,
        h.fecha_recepcion
    FROM historial_expedientes h
    ORDER BY h.id_expediente, h.fecha_envio DESC
),

base AS (
    SELECT
        e.id,
        e.numero_expediente,
        pm.id_area_usuaria,
        uo.nombre AS area_usuaria,
        e.estado,
        e.fecha_hora_creacion,
        e.fecha_hora_termino,
        um.id_unidad_destino AS unidad_actual,
        um.fecha_envio,
        um.fecha_recepcion
    FROM expedientes e
    JOIN primer_movimiento pm ON pm.id_expediente = e.id
    JOIN ultimo_movimiento um ON um.id_expediente = e.id
    JOIN unidades_organicas uo ON uo.id = pm.id_area_usuaria
),

clasificado AS (
    SELECT *,
        CASE
            WHEN unidad_actual = id_area_usuaria THEN 'area_usuaria'
            WHEN unidad_actual = 8  THEN 'administracion'
            WHEN unidad_actual = 29 THEN 'logistica'
            WHEN unidad_actual = 28 THEN 'contabilidad'
            WHEN unidad_actual = 27 THEN 'tesoreria'
            ELSE 'otros'
        END AS etapa,

        CASE
            WHEN estado = 'Pagado'    THEN 'pagado'
            WHEN estado = 'Cancelado' THEN 'cancelado'
            WHEN NOW() > fecha_hora_termino THEN 'retrasado'
            ELSE 'en_proceso'
        END AS estado_final,

        EXTRACT(EPOCH FROM (COALESCE(fecha_recepcion, NOW()) - fecha_envio)) / 86400.0 AS tiempo_actual_dias,
        EXTRACT(EPOCH FROM (fecha_hora_termino - fecha_hora_creacion)) / 86400.0 AS tiempo_total_dias
    FROM base
),

agregado AS (
    SELECT
        c.id_area_usuaria,
        c.area_usuaria,
        
        COUNT(*) AS total,
        COUNT(*) FILTER (WHERE estado_final = 'pagado')     AS pagados,
        COUNT(*) FILTER (WHERE estado_final = 'cancelado')  AS cancelados,
        COUNT(*) FILTER (WHERE estado_final = 'retrasado')  AS retrasados,
        COUNT(*) FILTER (WHERE estado_final = 'en_proceso') AS en_proceso,
        
        -- PIPELINE
        COUNT(*) FILTER (WHERE estado_final IN ('en_proceso', 'retrasado')) AS pipeline_total,
        COUNT(*) FILTER (WHERE estado_final IN ('en_proceso', 'retrasado') AND etapa = 'area_usuaria')    AS pipeline_area_usuaria,
        COUNT(*) FILTER (WHERE estado_final IN ('en_proceso', 'retrasado') AND etapa = 'administracion') AS pipeline_administracion,
        COUNT(*) FILTER (WHERE estado_final IN ('en_proceso', 'retrasado') AND etapa = 'logistica')      AS pipeline_logistica,
        COUNT(*) FILTER (WHERE estado_final IN ('en_proceso', 'retrasado') AND etapa = 'contabilidad')   AS pipeline_contabilidad,
        COUNT(*) FILTER (WHERE estado_final IN ('en_proceso', 'retrasado') AND etapa = 'tesoreria')      AS pipeline_tesoreria,
        
        -- RETRASOS
        COUNT(*) FILTER (WHERE estado_final = 'retrasado') AS pipeline_retrasados,
        
        COUNT(*) FILTER (WHERE estado_final = 'retrasado' AND etapa = 'area_usuaria')    AS retrasados_area_usuaria,
        COUNT(*) FILTER (WHERE estado_final = 'retrasado' AND etapa = 'administracion') AS retrasados_administracion,
        COUNT(*) FILTER (WHERE estado_final = 'retrasado' AND etapa = 'logistica')      AS retrasados_logistica,
        COUNT(*) FILTER (WHERE estado_final = 'retrasado' AND etapa = 'contabilidad')   AS retrasados_contabilidad,
        COUNT(*) FILTER (WHERE estado_final = 'retrasado' AND etapa = 'tesoreria')      AS retrasados_tesoreria,
        
-- PROMEDIOS
ROUND(AVG(CASE
    WHEN estado_final = 'pagado'
    THEN tiempo_total_dias END), 2) AS promedio_dias_pago,

ROUND(AVG(CASE
    WHEN estado_final = 'retrasado'
    THEN tiempo_actual_dias END), 2) AS promedio_dias_retrasados,

JSON_BUILD_OBJECT(

    'pipeline',

    JSON_BUILD_OBJECT(

        'area_usuaria',
        COALESCE(
            JSON_AGG(
                JSON_BUILD_OBJECT(
                    'id_expediente', c.id,
                    'numero_expediente', c.numero_expediente
                )
            ) FILTER (
                WHERE estado_final IN ('en_proceso','retrasado')
                AND etapa = 'area_usuaria'
            ),
            '[]'::json
        ),

        'administracion',
        COALESCE(
            JSON_AGG(
                JSON_BUILD_OBJECT(
                    'id_expediente', c.id,
                    'numero_expediente', c.numero_expediente
                )
            ) FILTER (
                WHERE estado_final IN ('en_proceso','retrasado')
                AND etapa = 'administracion'
            ),
            '[]'::json
        ),

        'logistica',
        COALESCE(
            JSON_AGG(
                JSON_BUILD_OBJECT(
                    'id_expediente', c.id,
                    'numero_expediente', c.numero_expediente
                )
            ) FILTER (
                WHERE estado_final IN ('en_proceso','retrasado')
                AND etapa = 'logistica'
            ),
            '[]'::json
        ),

        'contabilidad',
        COALESCE(
            JSON_AGG(
                JSON_BUILD_OBJECT(
                    'id_expediente', c.id,
                    'numero_expediente', c.numero_expediente
                )
            ) FILTER (
                WHERE estado_final IN ('en_proceso','retrasado')
                AND etapa = 'contabilidad'
            ),
            '[]'::json
        ),

        'tesoreria',
        COALESCE(
            JSON_AGG(
                JSON_BUILD_OBJECT(
                    'id_expediente', c.id,
                    'numero_expediente', c.numero_expediente
                )
            ) FILTER (
                WHERE estado_final IN ('en_proceso','retrasado')
                AND etapa = 'tesoreria'
            ),
            '[]'::json
        )

    ),

    'retrasados',

    JSON_BUILD_OBJECT(

        'area_usuaria',
        COALESCE(
            JSON_AGG(
                JSON_BUILD_OBJECT(
                    'id_expediente', c.id,
                    'numero_expediente', c.numero_expediente
                )
            ) FILTER (
                WHERE estado_final = 'retrasado'
                AND etapa = 'area_usuaria'
            ),
            '[]'::json
        ),

        'administracion',
        COALESCE(
            JSON_AGG(
                JSON_BUILD_OBJECT(
                    'id_expediente', c.id,
                    'numero_expediente', c.numero_expediente
                )
            ) FILTER (
                WHERE estado_final = 'retrasado'
                AND etapa = 'administracion'
            ),
            '[]'::json
        ),

        'logistica',
        COALESCE(
            JSON_AGG(
                JSON_BUILD_OBJECT(
                    'id_expediente', c.id,
                    'numero_expediente', c.numero_expediente
                )
            ) FILTER (
                WHERE estado_final = 'retrasado'
                AND etapa = 'logistica'
            ),
            '[]'::json
        ),

        'contabilidad',
        COALESCE(
            JSON_AGG(
                JSON_BUILD_OBJECT(
                    'id_expediente', c.id,
                    'numero_expediente', c.numero_expediente
                )
            ) FILTER (
                WHERE estado_final = 'retrasado'
                AND etapa = 'contabilidad'
            ),
            '[]'::json
        ),

        'tesoreria',
        COALESCE(
            JSON_AGG(
                JSON_BUILD_OBJECT(
                    'id_expediente', c.id,
                    'numero_expediente', c.numero_expediente
                )
            ) FILTER (
                WHERE estado_final = 'retrasado'
                AND etapa = 'tesoreria'
            ),
            '[]'::json
        )

    )

) AS detalle_expedientes

FROM clasificado c
GROUP BY c.id_area_usuaria, c.area_usuaria
),

alertas AS (
    SELECT
        id_area_usuaria,

        -- CUELLO DE BOTELLA
        CASE
            WHEN pipeline_logistica     = GREATEST(pipeline_area_usuaria, pipeline_administracion, pipeline_logistica, pipeline_contabilidad, pipeline_tesoreria) THEN 'logistica'
            WHEN pipeline_contabilidad  = GREATEST(pipeline_area_usuaria, pipeline_administracion, pipeline_logistica, pipeline_contabilidad, pipeline_tesoreria) THEN 'contabilidad'
            WHEN pipeline_administracion = GREATEST(pipeline_area_usuaria, pipeline_administracion, pipeline_logistica, pipeline_contabilidad, pipeline_tesoreria) THEN 'administracion'
            WHEN pipeline_tesoreria     = GREATEST(pipeline_area_usuaria, pipeline_administracion, pipeline_logistica, pipeline_contabilidad, pipeline_tesoreria) THEN 'tesoreria'
            ELSE 'area_usuaria'
        END AS cuello_botella,

        -- OFICINA MÁS RETRASADA (corregido)
        CASE
            WHEN pipeline_retrasados = 0 THEN NULL

            WHEN retrasados_logistica     = GREATEST(retrasados_area_usuaria, retrasados_administracion, retrasados_logistica, retrasados_contabilidad, retrasados_tesoreria) THEN 'logistica'
            WHEN retrasados_contabilidad  = GREATEST(retrasados_area_usuaria, retrasados_administracion, retrasados_logistica, retrasados_contabilidad, retrasados_tesoreria) THEN 'contabilidad'
            WHEN retrasados_administracion = GREATEST(retrasados_area_usuaria, retrasados_administracion, retrasados_logistica, retrasados_contabilidad, retrasados_tesoreria) THEN 'administracion'
            WHEN retrasados_tesoreria     = GREATEST(retrasados_area_usuaria, retrasados_administracion, retrasados_logistica, retrasados_contabilidad, retrasados_tesoreria) THEN 'tesoreria'
            ELSE 'area_usuaria'
        END AS oficina_mas_retrasada

    FROM agregado
)

SELECT
    a.*,
    al.cuello_botella,
    al.oficina_mas_retrasada
FROM agregado a
JOIN alertas al 
    ON al.id_area_usuaria = a.id_area_usuaria
ORDER BY a.total DESC;
`
        }
        const resultado = await conect.query(query);
        return resultado.rows;
    } catch (error) {
        console.log(error.message)
        return error.message
    }
}/*

text:`

`
*/

async function get_actividad_porDia(){
    try {
        const query = {
            text: `
SELECT 
    DATE(fecha_hora_creacion) AS fecha,
    COUNT(*) AS total
FROM expedientes
GROUP BY DATE(fecha_hora_creacion)
ORDER BY fecha;
            `
        }
        const resultado = await conect.query(query);
        return resultado.rows;
    } catch (error) {
        console.log(error.message)
        return error.message
    }
}

async function get_total_conformidades_porArea(){
    try {
        const query = {
            text: `
SELECT 
    u.nombre AS unidad,
    COUNT(DISTINCT h.id_expediente) AS total
FROM historial_expedientes h
JOIN unidades_organicas u 
    ON u.id = h.id_unidad_destino
WHERE h.id_unidad_origen = 26
GROUP BY u.nombre
ORDER BY total DESC;
            `
        }
        const resultado = await conect.query(query);
        return resultado.rows;
    } catch (error) {
        console.log(error.message)
        return error.message
    }
}

async function get_total_conformidades_sinRecepcion(){
    try {
        const query = {
            text: `
SELECT COUNT(*) AS conformidades_sinRecepcion
FROM historial_expedientes
WHERE fecha_recepcion IS NULL;
            `
        }
        const resultado = await conect.query(query);
        return resultado.rows[0].conformidades_sinrecepcion;
    } catch (error) {
        console.log(error.message)
        return error.message
    }
}

async function get_total_conformidades_pagados(){
    try {
        const query = {
            text: `
SELECT COUNT(*) AS total_conformidades_pagados
FROM expedientes
WHERE estado = 'Pagado';
            `
        }
        const resultado = await conect.query(query);
        return resultado.rows[0].total_conformidades_pagados;
    } catch (error) {
        console.log(error.message)
        return error.message
    }
}

async function get_total_conformidades_cancelados(){
    try {
        const query = {
            text: `
SELECT COUNT(*) AS total_conformidades_cancelados
FROM expedientes
WHERE estado = 'Cancelado';
            `
        }
        const resultado = await conect.query(query);
        return resultado.rows[0].total_conformidades_cancelados;
    } catch (error) {
        console.log(error.message)
        return error.message
    }
}

async function get_total_conformidades_retrasados(){
    try {
        const query = {
            text: `
SELECT COUNT(*) AS total_conformidades_retrasadas
FROM expedientes
WHERE estado = 'En proceso'
  AND NOW() > fecha_hora_termino;
            `
        }
        const resultado = await conect.query(query);
        return resultado.rows[0].total_conformidades_retrasadas;
    } catch (error) {
        console.log(error.message)
        return error.message
    }
}

async function get_total_conformidades_enProceso(){
    try {
        const query = {
            text: `
SELECT COUNT(*) AS total_conformidades_en_proceso
FROM expedientes
WHERE estado = 'En proceso'
  AND NOW() <= fecha_hora_termino;
            `
        }
        const resultado = await conect.query(query);
        return resultado.rows[0].total_conformidades_en_proceso;
    } catch (error) {
        console.log(error.message)
        return error.message
    }

}

async function get_total_conformidades(){
    try {
        const query = {
            text: `
SELECT COUNT(*) AS total_conformidades
FROM expedientes;
            `
        }
        const resultado = await conect.query(query);
        return resultado.rows[0].total_conformidades;
    } catch (error) {
        console.log(error.message)
        return error.message
    }

}