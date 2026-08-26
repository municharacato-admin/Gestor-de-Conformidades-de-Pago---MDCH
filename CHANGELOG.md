# Changelog

> Documentación liberada bajo Apache License 2.0. Consulte LICENSE y LICENCIA.txt.

Todos los cambios relevantes del proyecto se documentarán en este archivo.

El formato se basa en [Keep a Changelog](https://keepachangelog.com/es-ES/1.1.0/) y el proyecto usa [versionado semántico](https://semver.org/lang/es/) como convención propuesta.

## [Sin publicar]

### Añadido

- Manuales de usuario y administración en Markdown.
- Guía de publicación como Software Público Peruano.
- Inventario de componentes de terceros y notas de licencia en el código fuente.
- Metadatos del repositorio y comandos de inicio en ambos módulos.

### Cambiado

- Reglas de exclusión para archivos de entorno y lockfiles reproducibles.
- Joi actualizado a 18.2.5.

### Eliminado

- Documentos binarios sustituidos por documentación mantenible en Markdown.

## [1.0.0]

### Added

- Autenticación mediante usuario, contraseña con bcrypt y JWT en cookie `HttpOnly`.
- Perfiles de interfaz para administración, mesa de partes y unidades orgánicas.
- Registro, envío, recepción, derivación, cancelación, pago y consulta de expedientes.
- Historial de movimientos entre unidades orgánicas.
- Paneles estadísticos, indicadores de estado y tablas exportables.
- Backend HTTP con Express y persistencia en PostgreSQL.
- Frontend estático servido con Express.
