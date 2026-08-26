# Base de datos

## Motor y alcance

El sistema usa PostgreSQL mediante `pg 8.16.3`. La estructura de referencia corresponde a PostgreSQL 17.6.

Para una instalación nueva use:

- `schema.sql`: estructura sin datos;
- `seed.example.sql`: catálogos mínimos y ficticios;
- `grants.example.sql`: privilegios de ejemplo para el rol local de ejecución;
- `migrations/`: espacio para cambios futuros.

## Crear roles y base

Ejecute en una sesión interactiva de `psql` como un administrador local. `\password` solicita cada clave sin escribirla en el script o historial:

```sql
CREATE ROLE gestor_owner LOGIN;
CREATE ROLE gestor_app LOGIN;
\password gestor_owner
\password gestor_app
CREATE DATABASE gestor_conformidades OWNER gestor_owner
    ENCODING 'UTF8';
```

`gestor_owner` es el propietario/migrador; `gestor_app` es el rol que usa Node.js. No configure `postgres` ni `gestor_owner` en el backend.

## Cargar estructura

Desde la raíz:

```powershell
psql -v ON_ERROR_STOP=1 --host localhost --port 5432 --username gestor_owner --dbname gestor_conformidades --file database/schema.sql
```

Para los catálogos ficticios:

```powershell
psql -v ON_ERROR_STOP=1 --host localhost --port 5432 --username gestor_owner --dbname gestor_conformidades --file database/seed.example.sql
psql -v ON_ERROR_STOP=1 --host localhost --port 5432 --username gestor_owner --dbname gestor_conformidades --file database/grants.example.sql
```

`psql` solicitará la contraseña si no se configuró un mecanismo local de autenticación.

## Migraciones

`database/migrations/` no contiene migraciones ejecutables actuales; su [README](migrations/README.md) define la convención propuesta. Para cada cambio, añada una migración nueva e inmutable, pruebe instalación limpia y actualización, y sincronice `schema.sql` y el diccionario. No edite un dump para representar una migración.

## Configurar el backend

Antes de copiar credenciales, corrija y verifique la regla de exclusión de
`back/.env`: la forma `//.env` presente en el `.gitignore` revisado no lo
excluye. Confírmelo con `git check-ignore -v back/.env` y no continúe si el
archivo no está ignorado. Después, copie `back/.env.example` como `back/.env`
y asigne valores locales:

```env
CORS_ORIGIN=http://localhost:5003
DB_HOST=localhost
DB_PORT=5432
DB_NAME=gestor_conformidades
DB_USER=gestor_app
DB_PASSWORD=REEMPLAZAR_LOCALMENTE
SECRET_JWT_KEY=GENERAR_LOCALMENTE_UN_SECRETO_LARGO
```

`CORS_ORIGIN` todavía no es usada por `back/main.js`. Los valores anteriores son marcadores de configuración local.

## Crear el primer usuario de prueba

Para crear un usuario de prueba:

1. inicie el backend;
2. elija una contraseña temporal local;
3. invoque `POST /create_user` con una unidad del seed y el rol necesario;

Ejemplo de forma, sin una clave real:

```json
{
  "id_unidad_organica": "30",
  "id_rol": "3",
  "usuario": "usuario_demo",
  "contrasenia": "<CLAVE_TEMPORAL_ELEGIDA_LOCALMENTE>"
}
```

## Permisos

El código actual usa lectura/inserción en `usuarios`, lectura en `unidades_organicas`, y lectura/escritura en `expedientes` e `historial_expedientes`. No consulta `roles` en el flujo HTTP. Las inserciones runtime usan las secuencias de expedientes e historial; el alta de usuario genera el UUID en Node.js.

`database/grants.example.sql` contiene el siguiente permiso mínimo aproximado para el código actual y se ejecuta como `gestor_owner`:

```sql
GRANT CONNECT ON DATABASE gestor_conformidades TO gestor_app;
GRANT USAGE ON SCHEMA public TO gestor_app;
GRANT SELECT, INSERT ON TABLE public.usuarios TO gestor_app;
GRANT SELECT ON TABLE public.unidades_organicas TO gestor_app;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.expedientes TO gestor_app;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.historial_expedientes TO gestor_app;
GRANT USAGE, SELECT ON SEQUENCE public.expedientes_id_seq TO gestor_app;
GRANT USAGE, SELECT ON SEQUENCE public.historial_expedientes_id_seq TO gestor_app;
```

Ajuste los privilegios por caso de uso y vuelva a verificarlos después de cada migración; todos los perfiles HTTP comparten la misma cuenta `gestor_app`.

## Validación

```sql
\dt public.*
\d public.expedientes
\d public.historial_expedientes
\d public.roles
\d public.unidades_organicas
\d public.usuarios
SELECT id, nombre FROM public.roles ORDER BY id;
```

## Backups y restauración

- cifre y restrinja backups;
- defina retención y ubicación institucional;
- use `pg_dump --schema-only` para evidencia estructural;
- pruebe restauración en un entorno aislado;
- verifique la integridad del archivo restaurado.
