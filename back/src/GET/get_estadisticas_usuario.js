/* @license Apache-2.0; ver LICENCIA.txt */

import conect from '../../connect_db.js';

export async function get_estadisticas_usuario (id_usuario){
    try {

        const response = await buscar_bd(id_usuario);

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

async function buscar_bd(id_usuario){
    try {
        return {
            total_conformidades: await get_total_conformidades(id_usuario),
            total_conformidades_enProceso: await get_total_conformidades_enProceso(id_usuario),
            total_conformidades_retrasados: await get_total_conformidades_retrasados(id_usuario),
            total_conformidades_cancelados: await get_total_conformidades_cancelados(id_usuario),
            total_conformidades_pagados: await get_total_conformidades_pagados(id_usuario),
            total_conformidades_sinRecepcion: await get_total_conformidades_sinRecepcion(id_usuario),
            total_conformidades_porArea: await get_total_conformidades_porArea(id_usuario),
            actividad_porDia: await get_actividad_porDia(id_usuario),
            Kpis_porGerencia: await get_Kpis_porGerencia(id_usuario)
        };
    } catch (error) {
        console.log(error.message)
        return error.message
    }
}

async function get_Kpis_porGerencia(id_usuario) {
    try {
        const query = {
            
            text: `
WITH usuario_unidad AS (
    SELECT id_unidad_organica
    FROM usuarios
    WHERE id = $1
),

primer_movimiento AS (
    SELECT DISTINCT ON (h.id_expediente)
        h.id_expediente,
        h.id_unidad_destino AS id_area_usuaria
    FROM historial_expedientes h
    JOIN usuario_unidad uu 
        ON h.id_unidad_destino = uu.id_unidad_organica
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
        
        COUNT(*) FILTER (WHERE estado_final IN ('en_proceso', 'retrasado')) AS pipeline_total,
        COUNT(*) FILTER (WHERE estado_final IN ('en_proceso', 'retrasado') AND etapa = 'area_usuaria')    AS pipeline_area_usuaria,
        COUNT(*) FILTER (WHERE estado_final IN ('en_proceso', 'retrasado') AND etapa = 'administracion') AS pipeline_administracion,
        COUNT(*) FILTER (WHERE estado_final IN ('en_proceso', 'retrasado') AND etapa = 'logistica')      AS pipeline_logistica,
        COUNT(*) FILTER (WHERE estado_final IN ('en_proceso', 'retrasado') AND etapa = 'contabilidad')   AS pipeline_contabilidad,
        COUNT(*) FILTER (WHERE estado_final IN ('en_proceso', 'retrasado') AND etapa = 'tesoreria')      AS pipeline_tesoreria,
        
        COUNT(*) FILTER (WHERE estado_final = 'retrasado') AS pipeline_retrasados,
        
        COUNT(*) FILTER (WHERE estado_final = 'retrasado' AND etapa = 'area_usuaria')    AS retrasados_area_usuaria,
        COUNT(*) FILTER (WHERE estado_final = 'retrasado' AND etapa = 'administracion') AS retrasados_administracion,
        COUNT(*) FILTER (WHERE estado_final = 'retrasado' AND etapa = 'logistica')      AS retrasados_logistica,
        COUNT(*) FILTER (WHERE estado_final = 'retrasado' AND etapa = 'contabilidad')   AS retrasados_contabilidad,
        COUNT(*) FILTER (WHERE estado_final = 'retrasado' AND etapa = 'tesoreria')      AS retrasados_tesoreria,
        
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

        CASE
            WHEN pipeline_logistica     = GREATEST(pipeline_area_usuaria, pipeline_administracion, pipeline_logistica, pipeline_contabilidad, pipeline_tesoreria) THEN 'logistica'
            WHEN pipeline_contabilidad  = GREATEST(pipeline_area_usuaria, pipeline_administracion, pipeline_logistica, pipeline_contabilidad, pipeline_tesoreria) THEN 'contabilidad'
            WHEN pipeline_administracion = GREATEST(pipeline_area_usuaria, pipeline_administracion, pipeline_logistica, pipeline_contabilidad, pipeline_tesoreria) THEN 'administracion'
            WHEN pipeline_tesoreria     = GREATEST(pipeline_area_usuaria, pipeline_administracion, pipeline_logistica, pipeline_contabilidad, pipeline_tesoreria) THEN 'tesoreria'
            ELSE 'area_usuaria'
        END AS cuello_botella,

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
        };

        const resultado = await conect.query(query.text, [id_usuario]);
        return resultado.rows;

    } catch (error) {
        console.log(error.message);
        return error.message;
    }
}

async function get_actividad_porDia(id_usuario){
    try {
        const query = {
            text: `
WITH usuario_unidad AS (
    SELECT id_unidad_organica
    FROM usuarios
    WHERE id = $1
),
primer_movimiento AS (
    SELECT DISTINCT ON (h.id_expediente)
        h.id_expediente,
        h.id_unidad_destino
    FROM historial_expedientes h
    JOIN usuario_unidad uu 
        ON h.id_unidad_destino = uu.id_unidad_organica
    WHERE h.id_unidad_origen = 26
    ORDER BY h.id_expediente, h.fecha_envio
)

SELECT 
    DATE(e.fecha_hora_creacion) AS fecha,
    COUNT(*) AS total
FROM expedientes e
JOIN primer_movimiento pm ON pm.id_expediente = e.id
GROUP BY DATE(e.fecha_hora_creacion)
ORDER BY fecha;
            `
        }
        const resultado = await conect.query(query.text, [id_usuario]);
        return resultado.rows;
    } catch (error) {
        console.log(error.message)
        return error.message
    }
}

async function get_total_conformidades_porArea(id_usuario){
    try {
        const query = {
            text: `
WITH usuario_unidad AS (
    SELECT id_unidad_organica
    FROM usuarios
    WHERE id = $1
)

SELECT 
    u.nombre AS unidad,
    COUNT(DISTINCT h.id_expediente) AS total
FROM historial_expedientes h
JOIN unidades_organicas u 
    ON u.id = h.id_unidad_destino
JOIN usuario_unidad uu
    ON h.id_unidad_destino = uu.id_unidad_organica
WHERE h.id_unidad_origen = 26
GROUP BY u.nombre
ORDER BY total DESC;
            `
        }
        const resultado = await conect.query(query.text, [id_usuario]);
        return resultado.rows;
    } catch (error) {
        console.log(error.message)
        return error.message
    }
}

async function get_total_conformidades_sinRecepcion(id_usuario){
    try {
        const query = {
            text: `
WITH usuario_unidad AS (
    SELECT id_unidad_organica
    FROM usuarios
    WHERE id = $1
),
ultimo_movimiento AS (
    SELECT DISTINCT ON (h.id_expediente)
        h.id_expediente,
        h.id_unidad_destino,
        h.fecha_recepcion
    FROM historial_expedientes h
    ORDER BY h.id_expediente, h.fecha_envio DESC
)

SELECT COUNT(*) AS sin_recepcion
FROM ultimo_movimiento um
JOIN usuario_unidad uu 
    ON um.id_unidad_destino = uu.id_unidad_organica
WHERE um.fecha_recepcion IS NULL;
            `
        }

        const resultado = await conect.query(query.text, [id_usuario]);

        return Number(resultado.rows[0].sin_recepcion);

    } catch (error) {
        console.log(error.message)
        return 0;
    }
}

async function get_total_conformidades_pagados(id_usuario){
    try {
        const query = {
            text: `
WITH usuario_unidad AS (
    SELECT id_unidad_organica
    FROM usuarios
    WHERE id = $1
),
primer_movimiento AS (
    SELECT DISTINCT ON (h.id_expediente)
        h.id_expediente
    FROM historial_expedientes h
    JOIN usuario_unidad uu 
        ON h.id_unidad_destino = uu.id_unidad_organica
    WHERE h.id_unidad_origen = 26
    ORDER BY h.id_expediente, h.fecha_envio
)

SELECT COUNT(*) AS total_conformidades_pagados
FROM expedientes e
JOIN primer_movimiento pm ON pm.id_expediente = e.id
WHERE e.estado = 'Pagado';
            `
        }
        const resultado = await conect.query(query.text, [id_usuario]);
        return resultado.rows[0].total_conformidades_pagados;
    } catch (error) {
        console.log(error.message)
        return error.message
    }
}

async function get_total_conformidades_cancelados(id_usuario){
    try {
        const query = {
            text: `
WITH usuario_unidad AS (
    SELECT id_unidad_organica
    FROM usuarios
    WHERE id = $1
),
primer_movimiento AS (
    SELECT DISTINCT ON (h.id_expediente)
        h.id_expediente
    FROM historial_expedientes h
    JOIN usuario_unidad uu 
        ON h.id_unidad_destino = uu.id_unidad_organica
    WHERE h.id_unidad_origen = 26
    ORDER BY h.id_expediente, h.fecha_envio
)

SELECT COUNT(*) AS total_conformidades_cancelados
FROM expedientes e
JOIN primer_movimiento pm ON pm.id_expediente = e.id
WHERE e.estado = 'Cancelado';
            `
        }
        const resultado = await conect.query(query.text, [id_usuario]);
        return resultado.rows[0].total_conformidades_cancelados;
    } catch (error) {
        console.log(error.message)
        return error.message
    }
}

async function get_total_conformidades_retrasados(id_usuario){
    try {
        const query = {
            text: `
WITH usuario_unidad AS (
    SELECT id_unidad_organica
    FROM usuarios
    WHERE id = $1
),
primer_movimiento AS (
    SELECT DISTINCT ON (h.id_expediente)
        h.id_expediente
    FROM historial_expedientes h
    JOIN usuario_unidad uu 
        ON h.id_unidad_destino = uu.id_unidad_organica
    WHERE h.id_unidad_origen = 26
    ORDER BY h.id_expediente, h.fecha_envio
)

SELECT COUNT(*) AS total_conformidades_retrasadas
FROM expedientes e
JOIN primer_movimiento pm ON pm.id_expediente = e.id
WHERE e.estado = 'En proceso'
  AND NOW() > e.fecha_hora_termino;
            `
        }
        const resultado = await conect.query(query.text, [id_usuario]);
        return resultado.rows[0].total_conformidades_retrasadas;
    } catch (error) {
        console.log(error.message)
        return error.message
    }
}

async function get_total_conformidades_enProceso(id_usuario){
    try {
        const query = {
            text: `
WITH usuario_unidad AS (
    SELECT id_unidad_organica
    FROM usuarios
    WHERE id = $1
),
primer_movimiento AS (
    SELECT DISTINCT ON (h.id_expediente)
        h.id_expediente
    FROM historial_expedientes h
    JOIN usuario_unidad uu 
        ON h.id_unidad_destino = uu.id_unidad_organica
    WHERE h.id_unidad_origen = 26
    ORDER BY h.id_expediente, h.fecha_envio
)

SELECT COUNT(*) AS total_conformidades_en_proceso
FROM expedientes e
JOIN primer_movimiento pm ON pm.id_expediente = e.id
WHERE e.estado = 'En proceso'
  AND NOW() <= e.fecha_hora_termino;
            `
        }
        const resultado = await conect.query(query.text, [id_usuario]);
        return resultado.rows[0].total_conformidades_en_proceso;
    } catch (error) {
        console.log(error.message)
        return error.message
    }
}

async function get_total_conformidades(id_usuario){
    try {
        const query = {
            text: `
WITH usuario_unidad AS (
    SELECT id_unidad_organica
    FROM usuarios
    WHERE id = $1
),
primer_movimiento AS (
    SELECT DISTINCT ON (h.id_expediente)
        h.id_expediente
    FROM historial_expedientes h
    JOIN usuario_unidad uu 
        ON h.id_unidad_destino = uu.id_unidad_organica
    WHERE h.id_unidad_origen = 26
    ORDER BY h.id_expediente, h.fecha_envio
)

SELECT COUNT(*) AS total_conformidades
FROM expedientes e
JOIN primer_movimiento pm ON pm.id_expediente = e.id;
            `
        }
        const resultado = await conect.query(query.text, [id_usuario]);
        return resultado.rows[0].total_conformidades;
    } catch (error) {
        console.log(error.message)
        return error.message
    }
}
