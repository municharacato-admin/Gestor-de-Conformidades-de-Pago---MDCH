# Documentación del Gestor de Conformidades de Pago – MDCH

Este índice distingue la documentación derivada del código y SQL revisados de los manuales DOCX heredados. El código ejecutable y el esquema observado tienen prioridad cuando una fuente histórica los contradice.

## Diagnóstico documental

| Área | Estado | Observación |
| --- | --- | --- |
| Identificación y alcance | Documentado | nombre, entidad indicada, funciones y exclusiones; estado institucional pendiente |
| Arquitectura | Documentado | refleja frontend, API, PostgreSQL y dependencias externas reales |
| Instalación | Parcialmente reproducible | faltan prueba integral con PostgreSQL y estrategia local de cookie/HTTPS |
| Base de datos | Documentado | DDL seguro y seed ficticio; dump original bloquea publicación |
| API | Documentado | 24 endpoints y defectos actuales; contrato requiere normalización |
| Manuales | Documentado | flujos reales por perfil y limitaciones de interfaz |
| Desarrollo y mantenimiento | Documentado | estructura, convenciones propuestas y operación |
| Seguridad | Auditada | existen hallazgos críticos sin corregir |
| Pruebas | Diseñadas | no hay suite automatizada en el repositorio |
| Despliegue | Condicionado | no autorizado hasta cerrar los bloqueos |
| Software Público | En preparación | faltan decisiones legales, saneamiento y evidencias institucionales |

## Fuente y criterio

Orden de autoridad usado:

1. código actual en `back/` y `front/`;
2. DDL y datos observados en `database/bk-clean.sql`, sin reproducir contenido sensible;
3. metadatos de paquetes e historial Git disponible;
4. manuales DOCX heredados como evidencia contextual;
5. afirmaciones institucionales, legales u operativas solo cuando estén confirmadas.

Toda información no demostrable se marca **PENDIENTE DE DEFINIR** o **PENDIENTE DE CONFIRMACIÓN**.

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
- [Manual de administrador](07-manual-administrador/manual-administrador.md)

### Desarrollo y mantenimiento

- [Estructura del proyecto](08-desarrollo/estructura-proyecto.md)
- [Guía de desarrollo](08-desarrollo/guia-desarrollo.md)
- [Convenciones](08-desarrollo/convenciones.md)
- [Mantenimiento](08-desarrollo/mantenimiento.md)

### Seguridad, pruebas y despliegue

- [Seguridad](09-seguridad/seguridad.md)
- [Plan de pruebas](10-pruebas/plan-pruebas.md)
- [Checklist de producción](11-despliegue/checklist-produccion.md)

### Preparación de Software Público

- [Ficha de software](12-software-publico/ficha-software.md)
- [Requisitos de publicación](12-software-publico/requisitos-publicacion.md)
- [Evidencias](12-software-publico/evidencias.md)
- [Checklist de publicación](12-software-publico/checklist-publicacion.md)
- [Auditoría de publicación](12-software-publico/auditoria-publicacion.md)
- [Prueba de reproducibilidad](12-software-publico/prueba-reproducibilidad.md)

### Gobernanza del repositorio

- [README principal](../README.md)
- [Licencia](../LICENSE)
- [Aviso de licencia](../LICENCIA.txt)
- [Autoría](../AUTHORS.md)
- [Atribuciones](../NOTICE)
- [Cambios](../CHANGELOG.md)
- [Política de seguridad](../SECURITY.md)
- [Contribución](../CONTRIBUTING.md)

## DOCX heredados

Los siguientes archivos se conservaron sin alterarlos porque pertenecían al material entregado. **No forman parte del paquete publicable** mientras no se saneen contenido, capturas, propiedades y metadatos:

| Archivo | Utilidad contextual | Discrepancia principal |
| --- | --- | --- |
| `1 - Manual de usuarios.docx` | roles y flujo funcional | nombre y versión heredados |
| `Manual de Instalación.docx` | procedimiento histórico | versiones, carpetas y variables no coinciden con el repositorio |
| `Entrega-desarrollo-lvl-mp.docx` | funciones de mesa de partes | afirma validación en tres capas no demostrada |
| `Entrega-desarrollo-lvl-area-usuaria.docx` | retroceso de recepción/derivación | afirma controles de BD que el esquema no contiene |
| `Entrega-desarrollo-lvl-administrador.docx` | alcance de indicadores | describe interfaz, no controles de acceso |



## Mantenimiento

Actualice la documentación en el mismo cambio que modifique:

- rutas o sobres de API;
- variables, puertos o despliegue;
- esquema, migraciones o catálogos;
- roles, estados y reglas de transición;
- métricas;
- dependencias y versión;
- licencia, responsables o canales.

No incorpore capturas, dumps, `.env`, JWT, contraseñas, hashes ni ejemplos con expedientes reales.
