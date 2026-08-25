# Changelog

Todos los cambios relevantes del proyecto se documentarán en este archivo.

El formato se basa en [Keep a Changelog](https://keepachangelog.com/es-ES/1.1.0/) y el proyecto usa [versionado semántico](https://semver.org/lang/es/) como convención propuesta.

## [1.0.0]

### Added

- Autenticación mediante usuario, contraseña con bcrypt y JWT en cookie `HttpOnly`.
- Perfiles de interfaz para administración, mesa de partes y unidades orgánicas.
- Registro, envío, recepción, derivación, cancelación, pago y consulta de expedientes.
- Historial de movimientos entre unidades orgánicas.
- Paneles estadísticos, indicadores de estado y tablas exportables.
- Backend HTTP con Express y persistencia en PostgreSQL.
- Frontend estático servido con Express.

No se inventan versiones anteriores: `1.0.0` es la versión declarada en ambos `package.json`.
