# Diccionario de datos

> Documentación liberada bajo Apache License 2.0. Consulte LICENSE y LICENCIA.txt.

## expedientes

Registro maestro y plazo general.

| Campo | Tipo | Nulo | PK | FK | Descripción |
| --- | --- | --- | --- | --- | --- |
| `id` | integer | no | sí | no | Identificador generado por `expedientes_id_seq`. |
| `numero_expediente` | text | no | no | no | Identificador administrativo ingresado por mesa de partes. No es único físicamente. |
| `fecha_hora_creacion` | timestamp without time zone | no | no | no | Fecha de registro calculada en el backend. |
| `fecha_hora_termino` | timestamp without time zone | no | no | no | Vencimiento calculado a ocho días de lunes a viernes. |
| `estado` | text | no | no | no | Estado maestro: el código usa `En proceso`, `Cancelado` o `Pagado`. |

## historial_expedientes

Movimientos entre unidades y eventos terminales.

| Campo | Tipo | Nulo | PK | FK | Descripción |
| --- | --- | --- | --- | --- | --- |
| `id` | integer | no | sí | no | Identificador generado por `historial_expedientes_id_seq`. |
| `id_expediente` | integer | no | no | lógica → expedientes.id | Maestro relacionado; no hay FK física. |
| `id_unidad_origen` | integer | no | no | lógica → unidades_organicas.id | Unidad que envía o registra el evento. |
| `id_unidad_destino` | integer | no | no | lógica → unidades_organicas.id | Unidad que recibe; en terminales coincide con origen. |
| `fecha_envio` | timestamp without time zone | no | no | no | Momento del envío/evento. |
| `fecha_recepcion` | timestamp without time zone | sí | no | no | Momento de recepción; nulo significa pendiente. |
| `estado` | text | no | no | no | Estado del movimiento. |
| `justificacion` | text | sí | no | no | Motivo de derivación, cancelación u otro evento. |

## roles

Catálogo usado por el router del frontend.

| Campo | Tipo | Nulo | PK | FK | Descripción |
| --- | --- | --- | --- | --- | --- |
| `id` | integer | no | sí | no | Identificador generado por `roles_id_seq`. |
| `nombre` | text | sí | no | no | Nombre único. El respaldo contiene Administrador, Mesa de partes y usuario. |

El frontend interpreta 1 como administrador, 2 como mesa de partes y 3 como usuario de unidad.

## unidades_organicas

Catálogo de oficinas/áreas.

| Campo | Tipo | Nulo | PK | FK | Descripción |
| --- | --- | --- | --- | --- | --- |
| `id` | integer | no | sí | no | Identificador generado por `unidades_organicas_id_seq`. |
| `nombre` | text | sí | no | no | Nombre único de la unidad. |

El código contiene IDs especiales. Consulte [Relaciones y acoplamientos](relaciones.md).

## usuarios

Credenciales locales y adscripción.

| Campo | Tipo | Nulo | PK | FK | Descripción |
| --- | --- | --- | --- | --- | --- |
| `id` | uuid | no | sí | no | UUID generado por Node.js. |
| `id_unidad_organica` | integer | no | no | lógica → unidades_organicas.id | Unidad del usuario; físicamente único. |
| `id_rol` | integer | no | no | lógica → roles.id | Rol usado por el frontend; no hay FK física. |
| `usuario` | text | no | no | no | Nombre de inicio de sesión, único. |
| `contrasenia` | text | no | no | no | Hash bcrypt, definido como único. Nunca debe exponerse. |

## Índices

El volcado no declara índices adicionales. PostgreSQL crea índices implícitos para PK y restricciones `UNIQUE`. Las columnas de unión y filtro del historial carecen de índices explícitos.
