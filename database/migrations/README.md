# Migraciones

No se identificó un sistema de migraciones ni un historial previo. `database/schema.sql` constituye la línea base estructural documentada.

Para cambios futuros se recomienda:

1. un archivo inmutable por cambio;
2. prefijo correlativo y nombre descriptivo, por ejemplo `0001_agregar_claves_foraneas.sql`;
3. transacción cuando PostgreSQL lo permita;
4. precondiciones y validación de datos;
5. procedimiento de reversión;
6. prueba desde una base vacía y desde la última versión publicada;
7. actualización simultánea del esquema, diccionario y changelog.

No añada dumps ni datos reales a esta carpeta.
