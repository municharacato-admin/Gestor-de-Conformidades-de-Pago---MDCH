# Manual de administración

> Documentación liberada bajo Apache License 2.0. Consulte LICENSE y LICENCIA.txt.

## Acceso al módulo

Inicie sesión con una cuenta que tenga el perfil Administrador. El sistema abre el panel general y carga los expedientes registrados.

## Consulta de expedientes

La tabla principal permite:

- buscar por número, estado o unidad;
- ordenar las columnas;
- revisar la oficina actual y el tiempo restante;
- exportar los resultados a Excel;
- abrir el historial de un expediente.

Para consultar el recorrido, ubique el expediente y seleccione el botón de historial. El cuadro muestra los movimientos, las unidades de origen y destino, las fechas y las justificaciones registradas.

## Indicadores

El panel presenta:

- totales por estado;
- distribución de expedientes;
- actividad diaria;
- conformidades por área;
- rendimiento por unidad orgánica;
- expedientes retrasados y pendientes de recepción.

Los controles de cada gráfico permiten aplicar los filtros disponibles. En las tarjetas por área, **Ver historial** abre el detalle de los expedientes asociados.

## Catálogos y cuentas

La versión actual no incluye pantallas para administrar cuentas, roles ni unidades orgánicas. Estas operaciones se realizan mediante los procedimientos técnicos definidos por la entidad.

## Operación

- Confirme que el backend, el frontend y PostgreSQL estén disponibles.
- Revise que la URL del backend configurada en el frontend corresponda al ambiente.
- Mantenga actualizados los catálogos de unidades y roles.
- Ejecute las copias de respaldo y las tareas de mantenimiento conforme al calendario institucional.
- Registre los cambios de versión en `CHANGELOG.md`.

## Cierre de sesión

Seleccione **Cerrar sesión** en el menú lateral al terminar la consulta.
