# Mantenimiento

## Calendario sugerido

| Frecuencia | Actividad |
| --- | --- |
| continua | monitoreo, alertas, incidentes, capacidad |
| semanal | errores, accesos denegados, backups |
| mensual | parches, dependencias, restauración muestral, cuentas |
| trimestral | permisos, vulnerabilidades, carga, documentación |
| por versión | pruebas, migración, SBOM/licencias, rollback |
| anual | continuidad, titularidad/licencia, responsables, pentest según riesgo |

La frecuencia final debe aprobarse institucionalmente.

## Dependencias

1. versionar lockfiles;
2. revisar changelog y compatibilidad;
3. escanear vulnerabilidades;
4. probar en rama;
5. actualizar una familia a la vez;
6. revisar también `assets/addons` y CDNs;
7. registrar decisión de riesgo;
8. actualizar SBOM/NOTICE.

No aplique automáticamente actualizaciones mayores en producción.

## Base de datos

- migraciones versionadas;
- análisis de índices/consultas;
- `VACUUM/ANALYZE` administrados por PostgreSQL y monitoreados;
- integridad maestro/historial;
- crecimiento de tablas/secuencias;
- backup/restauración;
- parches;
- revisión de privilegios.

## Mantenimiento preventivo de aplicación

- eliminar sondeo innecesario;
- paginar listados del lado servidor;
- revisar tiempos de KPI;
- rotar secretos;
- renovar certificados;
- probar expiración y revocación;
- revisar logs/alertas;
- verificar recursos CDN;
- probar navegadores/accesibilidad.

## Backups

Debe existir:

- inventario de qué se respalda;
- frecuencia, retención y cifrado;
- custodia y acceso;
- copia fuera de falla común;
- restauración comprobada;
- RPO/RTO;
- registro de éxito/fallo;
- eliminación segura.

No almacene backups en Git.

## Recuperación

Runbook mínimo:

1. declarar incidente y preservar evidencia;
2. detener escrituras si hay corrupción;
3. elegir punto de recuperación aprobado;
4. restaurar en instancia aislada;
5. validar esquema, conteos e integridad;
6. rotar secretos si aplica;
7. reanudar con autorización;
8. documentar pérdida/tiempo/acciones;
9. corregir causa.

## Auditoría

La aplicación no tiene log de auditoría inmutable. Se recomienda registrar actor, permiso, expediente, transición, origen, hora, resultado y `request_id`, sin contraseña/cookie/hash. Defina controles contra alteración y retención legal.

## Gestión de versiones

- SemVer como convención;
- tag firmado/protegido cuando sea posible;
- changelog;
- commit y esquema asociados;
- artefacto reproducible;
- fecha, responsable y aprobación;
- soporte/fin de vida.

La versión mostrada en UI debe unificarse con el paquete.

## Deuda prioritaria

1. seguridad crítica;
2. dump con datos;
3. transacciones/integridad;
4. tests/CI/lockfiles;
5. configuración por entorno;
6. observabilidad;
7. rendimiento/paginación del lado servidor;
8. métricas y regla de negocio;
9. accesibilidad/cadena de suministro;
10. documentación administrativa.
