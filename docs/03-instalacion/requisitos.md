# Requisitos del sistema

## Requisitos técnicos

| Componente | Evidencia | Estado |
| --- | --- | --- |
| Node.js | ESM y `node --watch`; sin campo `engines` | estable lts |
| npm | scripts en ambos `package.json` | obligatorio |
| PostgreSQL | volcado originado en 17.6 y generado con pg_dump 18.4 | compatibilidad funcional |
| Navegador | Fetch, módulos ES, Canvas, Intl, localStorage | navegador moderno |

El análisis se realizó con Node.js `24.19.0` y npm `11.17.0` disponibles en la estación, pero eso no constituye una versión institucional soportada. Se recomienda fijar y probar una versión LTS antes de liberar.

## Servidor

### Obligatorios

- sistema operativo que soporte Node.js y PostgreSQL;
- Node.js compatible con ESM, `--watch` y las dependencias declaradas;
- npm;
- PostgreSQL compatible con el esquema;
- conectividad TCP entre API y PostgreSQL;
- puertos `5003` y `5004` disponibles en desarrollo, porque están fijos;
- espacio para aplicación, base, logs y backups;
- reloj sincronizado.

### Recomendados para producción

- Linux de soporte prolongado o plataforma equivalente administrada;
- reverse proxy con HTTPS;
- servicio de procesos/reinicio;
- red privada para PostgreSQL;
- almacén de secretos;
- monitorización y logs centralizados;
- backup cifrado.

No hay mediciones para fijar CPU, memoria o almacenamiento. Como punto de partida de una prueba, no como requisito garantizado:

- 2 vCPU;
- 2–4 GB de RAM para aplicación, dimensionando PostgreSQL por separado;
- almacenamiento según filas, índices, logs, retención y backups.

## Cliente

### Obligatorios

- JavaScript habilitado;
- cookies habilitadas;
- soporte de `fetch`, async/await y módulos;
- Canvas para gráficos;
- acceso al origen del frontend y a recursos CDN actuales.

### Recomendados

- versión vigente de Edge, Chrome o Firefox aprobada por la entidad;
- resolución de escritorio para paneles densos; la resolución mínima no fue definida;
- permitir descargas Excel.

## Red y puertos

| Flujo | Puerto por defecto | Exposición |
| --- | --- | --- |
| navegador → frontend | 5003 en desarrollo | vía HTTPS/reverse proxy en producción |
| navegador → backend | 5004 en desarrollo | vía HTTPS/reverse proxy; no directo |
| backend → PostgreSQL | 5432 habitual | solo red privada |

PostgreSQL puede usar otro puerto mediante `DB_PORT`. Los puertos Node no son configurables por entorno en la versión actual.

## Dependencias externas

El frontend carga parte de DataTables, Chart.js, iconos, fuentes y recursos asociados desde Internet. Sin acceso a esos CDNs la interfaz puede perder funcionalidad o estilo. La lista/integridad de recursos debe consolidarse antes de un despliegue cerrado.

## Limitaciones de los requisitos actuales

- no hay lockfiles;
- no hay Dockerfile ni imagen;
- no hay `engines`;
- no hay pruebas de navegador o carga;
- no hay definición de disponibilidad, RPO o RTO;
- no hay soporte offline;
- no hay scripts de producción.
