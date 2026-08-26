# Plan de pruebas

> Documentación liberada bajo Apache License 2.0. Consulte LICENSE y LICENCIA.txt.

## Estado

No existen scripts ni archivos de pruebas automatizadas en `back/package.json` o `front/package.json`. Todos los casos se inicializan como **PENDIENTE DE EJECUCIÓN**.

## Entorno

- base creada desde `schema.sql` y `seed.example.sql`;
- usuarios y expedientes exclusivamente ficticios;
- un usuario por perfil y al menos dos unidades;
- reloj/zona `America/Lima` controlados;
- navegador moderno;
- logs de prueba sin tokens ni contraseñas;
- backup/restore en instancia desechable.

## Casos funcionales

| ID | Caso | Entrada | Resultado esperado | Estado |
| --- | --- | --- | --- | --- |
| F-01 | login válido | usuario/clave ficticios | 200, `success:true`, cookie segura | PENDIENTE DE EJECUCIÓN |
| F-02 | login inválido | clave incorrecta | 401, sin cookie | PENDIENTE DE EJECUCIÓN |
| F-03 | logout | sesión válida | cookie eliminada y acceso posterior denegado | PENDIENTE DE EJECUCIÓN |
| F-04 | enrutamiento de rol | roles 1, 2, 3 | vista correcta | PENDIENTE DE EJECUCIÓN |
| F-05 | catálogo | sesión MP | unidades permitidas sin 25/26 | PENDIENTE DE EJECUCIÓN |
| F-06 | registrar expediente | número nuevo y destino | maestro + un historial, plazo correcto | PENDIENTE DE EJECUCIÓN |
| F-07 | duplicado concurrente | mismo número en paralelo | un registro; conflicto controlado | PENDIENTE DE EJECUCIÓN |
| F-08 | eliminar inicial | no recibido, un movimiento | eliminación atómica | PENDIENTE DE EJECUCIÓN |
| F-09 | bloquear eliminación | ya recibido | sin borrado | PENDIENTE DE EJECUCIÓN |
| F-10 | bandeja pendiente | envío a unidad | solo destino correcto | PENDIENTE DE EJECUCIÓN |
| F-11 | recibir | último movimiento propio | fecha de recepción establecida | PENDIENTE DE EJECUCIÓN |
| F-12 | revertir recepción | último movimiento propio | fecha vuelve a nulo | PENDIENTE DE EJECUCIÓN |
| F-13 | derivar | destino y justificación | nuevo movimiento correcto | PENDIENTE DE EJECUCIÓN |
| F-14 | eliminar derivación | último envío no recibido | se elimina solo ese movimiento | PENDIENTE DE EJECUCIÓN |
| F-15 | cancelar | movimiento activo y motivo | evento y maestro Cancelado atómicos | PENDIENTE DE EJECUCIÓN |
| F-16 | pagar | permiso y movimiento activo | evento y maestro Pagado atómicos | PENDIENTE DE EJECUCIÓN |
| F-17 | impedir terminal duplicado | expediente Pagado/Cancelado | transición rechazada | PENDIENTE DE EJECUCIÓN |
| F-18 | historial | expediente con varias áreas | orden cronológico y campos correctos | PENDIENTE DE EJECUCIÓN |
| F-19 | búsqueda/orden | múltiples filas | resultado visible correcto | PENDIENTE DE EJECUCIÓN |
| F-20 | exportación | tabla filtrada | Excel sin datos ajenos | PENDIENTE DE EJECUCIÓN |
| F-21 | KPI | dataset calculable | cifras coinciden con consulta aprobada | PENDIENTE DE EJECUCIÓN |
| F-22 | plazo fin de semana | registro cercano a viernes | suma 8 días L-V según regla | PENDIENTE DE EJECUCIÓN |

F-02, F-07, F-15, F-16 y F-17 no coinciden con garantías actuales y deben usarse como pruebas de regresión después de la corrección.

## Seguridad

| ID | Caso | Entrada | Resultado esperado | Estado |
| --- | --- | --- | --- | --- |
| S-01 | bypass login | credenciales falsas | 401 y ausencia de `Set-Cookie` | PENDIENTE DE EJECUCIÓN |
| S-02 | ruta admin con rol usuario | JWT rol 3 | 403 | PENDIENTE DE EJECUCIÓN |
| S-03 | publicar con rol usuario | JWT rol 3 | 403 | PENDIENTE DE EJECUCIÓN |
| S-04 | mutar movimiento ajeno | ID de otra unidad | 403/404 sin cambio | PENDIENTE DE EJECUCIÓN |
| S-05 | alta anónima | sin cookie | 401/403 | PENDIENTE DE EJECUCIÓN |
| S-06 | origen CORS no permitido | dominio externo | sin ACAO y solicitud rechazada | PENDIENTE DE EJECUCIÓN |
| S-07 | CSRF | cookie válida sin token/origen | mutación rechazada | PENDIENTE DE EJECUCIÓN |
| S-08 | JWT alterado | firma inválida | 403 | PENDIENTE DE EJECUCIÓN |
| S-09 | JWT expirado | token vencido | 401 | PENDIENTE DE EJECUCIÓN |
| S-10 | fuerza bruta | intentos repetidos | limitación y evento auditado | PENDIENTE DE EJECUCIÓN |
| S-11 | XSS almacenado | justificación con HTML | texto inerte, sin ejecución | PENDIENTE DE EJECUCIÓN |
| S-12 | SQL injection | payloads en campos/ID | consulta segura y validación | PENDIENTE DE EJECUCIÓN |
| S-13 | cuerpo excesivo | JSON grande | rechazo controlado | PENDIENTE DE EJECUCIÓN |
| S-14 | secreto en logs | errores de auth/BD | ningún secreto/hash/token | PENDIENTE DE EJECUCIÓN |
| S-15 | análisis de repositorio | escáner de secretos/PII | cero hallazgos críticos | PENDIENTE DE EJECUCIÓN |

## API y errores

| ID | Caso | Entrada | Resultado esperado | Estado |
| --- | --- | --- | --- | --- |
| A-01 | JSON mal formado | cuerpo truncado | 400 JSON uniforme | PENDIENTE DE EJECUCIÓN |
| A-02 | campos faltantes | body sin requerido | 400/422 uniforme | PENDIENTE DE EJECUCIÓN |
| A-03 | recurso inexistente | ID ficticio ausente | 404 | PENDIENTE DE EJECUCIÓN |
| A-04 | duplicidad | mismo número dos veces | 409 | PENDIENTE DE EJECUCIÓN |
| A-05 | excepción BD | conexión interrumpida | 500 genérico + `request_id` | PENDIENTE DE EJECUCIÓN |
| A-06 | ruta inexistente | `GET /ruta-ficticia` | 404 JSON | PENDIENTE DE EJECUCIÓN |
| A-07 | contratos listados | listado vacío/con una fila | esquema `response` consistente | PENDIENTE DE EJECUCIÓN |
| A-08 | contratos KPI | dataset ficticio calculable | números, no errores embebidos | PENDIENTE DE EJECUCIÓN |

Los códigos recomendados no están implementados aún.

## Base de datos

| ID | Caso | Entrada | Resultado esperado | Estado |
| --- | --- | --- | --- | --- |
| DB-01 | instalación limpia | base vacía + schema/seed/grants | 5 tablas, 4 secuencias y catálogos ficticios | PENDIENTE DE EJECUCIÓN |
| DB-02 | idempotencia del seed | ejecutar seed dos veces | sin duplicados ni error | PENDIENTE DE EJECUCIÓN |
| DB-03 | ausencia de datos reales | consultar conteos/formatos | 0 usuarios y 0 expedientes tras seed | PENDIENTE DE EJECUCIÓN |
| DB-04 | referencias huérfanas | dataset ficticio controlado | precheck identifica todas | PENDIENTE DE EJECUCIÓN |
| DB-05 | número duplicado | dos altas concurrentes | unicidad o conflicto controlado | PENDIENTE DE EJECUCIÓN |
| DB-06 | consistencia maestro/historial | fallar segunda escritura | rollback total | PENDIENTE DE EJECUCIÓN |
| DB-07 | plan de consultas | volumen ficticio acordado | índices/tiempos dentro del umbral | PENDIENTE DE EJECUCIÓN |
| DB-08 | concurrencia de mutación | acciones simultáneas | una transición válida, sin parciales | PENDIENTE DE EJECUCIÓN |
| DB-09 | backup/restore | base ficticia cifrada | restauración íntegra comprobada | PENDIENTE DE EJECUCIÓN |
| DB-10 | migración de integridad | prechecks + FK/CHECK aprobados | actualización y rollback verificados | PENDIENTE DE EJECUCIÓN |

## Rendimiento básico

| ID | Caso | Entrada | Resultado esperado | Estado |
| --- | --- | --- | --- | --- |
| R-01 | login y listados | volumen ficticio representativo | latencia bajo umbral **PENDIENTE DE DEFINIR** | PENDIENTE DE EJECUCIÓN |
| R-02 | sondeo concurrente | usuarios/tiempo **PENDIENTES DE DEFINIR** | sin saturar API/BD | PENDIENTE DE EJECUCIÓN |
| R-03 | estadísticas | dataset ficticio amplio | nueve consultas medidas y optimizadas | PENDIENTE DE EJECUCIÓN |
| R-04 | bcrypt/pool/memoria | concurrencia acordada | recursos dentro de umbral | PENDIENTE DE EJECUCIÓN |
| R-05 | paginación futura | múltiples páginas | API limita filas y mantiene filtros | PENDIENTE DE EJECUCIÓN |
| R-06 | carga básica prolongada | duración **PENDIENTE DE DEFINIR** | sin fuga, errores o crecimiento no acotado | PENDIENTE DE EJECUCIÓN |

## Navegador y accesibilidad

- Chrome/Edge/Firefox en versiones institucionalmente soportadas;
- diseño móvil y escritorio;
- navegación por teclado;
- etiquetas, foco, contraste y lectores;
- CDN caído;
- sesión expirada durante tabla;
- red lenta y errores sin preloader bloqueado;
- tema claro/oscuro/sistema.

## Evidencias

Para cada ejecución registre versión/commit, fecha, entorno, caso, resultado, evidencia sanitizada, defecto y responsable. No capture contraseñas, cookies, UUID reales, hashes ni expedientes institucionales.
