# Documentación del Gestor de Conformidades de Pago – MDCH

> Documentación liberada bajo Apache License 2.0. Consulte LICENSE y LICENCIA.txt.

Este índice reúne la documentación funcional y técnica del sistema. El código y el esquema de base de datos vigentes son la referencia para su mantenimiento.

## Catálogo

### Descripción

- [Descripción general](01-descripcion-general/descripcion-general.md)

### Arquitectura

- [Arquitectura de software](02-arquitectura/arquitectura-software.md)
- [Arquitectura del backend](02-arquitectura/arquitectura-backend.md)
- [Arquitectura del frontend](02-arquitectura/arquitectura-frontend.md)
- [Flujos de información](02-arquitectura/flujo-informacion.md)

### Instalación y operación

- [Requisitos](03-instalacion/requisitos.md)
- [Instalación de desarrollo](03-instalacion/instalacion-desarrollo.md)
- [Configuración](03-instalacion/configuracion.md)
- [Despliegue de producción](03-instalacion/despliegue-produccion.md)
- [Solución de problemas](03-instalacion/solucion-problemas.md)

### Base de datos

- [Modelo de datos](04-base-datos/modelo-datos.md)
- [Diccionario de datos](04-base-datos/diccionario-datos.md)
- [Relaciones](04-base-datos/relaciones.md)
- [Inicialización](04-base-datos/inicializacion.md)
- [Guía de archivos SQL](../database/README.md)
- [Permisos de ejecución de ejemplo](../database/grants.example.sql)

### API

- [Catálogo de API](05-api/api.md)
- [Autenticación](05-api/autenticacion.md)
- [Códigos de respuesta](05-api/codigos-respuesta.md)

### Uso y administración

- [Manual de usuario](06-manual-usuario/manual-usuario.md)
- [Manual de administración](07-manual-administrador/manual-administrador.md)

### Desarrollo y mantenimiento

- [Estructura del proyecto](08-desarrollo/estructura-proyecto.md)
- [Guía de desarrollo](08-desarrollo/guia-desarrollo.md)
- [Convenciones](08-desarrollo/convenciones.md)
- [Mantenimiento](08-desarrollo/mantenimiento.md)

### Publicación

- [Software Público Peruano](09-publicacion-software-publico.md)

### Pruebas

- [Plan de pruebas](10-pruebas/plan-pruebas.md)

### Gobernanza del repositorio

- [README principal](../README.md)
- [Licencia](../LICENSE)
- [Aviso de licencia](../LICENCIA.txt)
- [Autoría](../AUTHORS.md)
- [Atribuciones](../NOTICE)
- [Componentes de terceros](../THIRD_PARTY_NOTICES.md)
- [Cambios](../CHANGELOG.md)
- [Contribución](../CONTRIBUTING.md)

## Mantenimiento

Actualice la documentación en el mismo cambio que modifique:

- rutas o sobres de API;
- variables, puertos o despliegue;
- esquema, migraciones o catálogos;
- roles, estados y reglas de transición;
- métricas;
- dependencias y versión;
- licencia, responsables o canales.
