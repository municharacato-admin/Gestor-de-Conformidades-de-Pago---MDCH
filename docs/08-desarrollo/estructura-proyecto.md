# Estructura del proyecto

## Árbol funcional

```text
/
├── back/
│   ├── .env.example
│   ├── connect_db.js
│   ├── main.js
│   ├── package.json
│   └── src/
│       ├── GET/
│       ├── POST/
│       └── middleware/
├── front/
│   ├── main.js
│   ├── package.json
│   └── public/
│       ├── index.html
│       └── assets/
│           ├── addons/
│           ├── css/
│           ├── img/
│           ├── js/
│           └── views/
├── database/
│   ├── README.md
│   ├── schema.sql
│   ├── seed.example.sql
│   ├── grants.example.sql
│   ├── migrations/
│   └── bk-clean.sql
├── docs/
└── archivos de gobierno del proyecto
```

## Raíz

| Archivo | Propósito |
| --- | --- |
| `README.md` | entrada, instalación rápida y enlaces |
| `LICENSE` / `LICENCIA.txt` | licencia oficial declarada y resumen institucional |
| `AUTHORS.md` / `NOTICE` | autoría y atribución |
| `CHANGELOG.md` | versiones |
| `SECURITY.md` | reporte y mínimos de seguridad |
| `CONTRIBUTING.md` | colaboración |

## Backend

### `main.js`

Configura Express, CORS, JSON, cookies, JWT, 24 rutas y escucha en 5004. Es el punto de entrada y concentra demasiadas responsabilidades.

### `connect_db.js`

Carga `.env` y exporta `pg.Pool`.

### `src/GET`

Once módulos de consulta:

- catálogos;
- bandejas por estado/movimiento;
- listado global;
- historial;
- indicadores de administrador/usuario.

### `src/POST`

Diez módulos:

- login y creación de usuario;
- registro/recepción/derivación;
- cancelación/pago;
- reversión/eliminación.

### `src/middleware`

`jwt_auth.js` lee/verifica la cookie y llena `req.user`.

## Frontend

### `main.js`

Servidor estático en 5003.

### `public/index.html`

Formulario de login.

### `assets/views`

- `router.html`: redirección por rol;
- `administrador/index.html`: consulta global/KPI;
- `mp/index.html`: registro inicial;
- `usuario/index.html`: bandejas de unidad.

### `assets/js/common`

URL de API, sesión, logout, tema y ajuste de rutas.

### `assets/js/main`

Funciones por perfil, DataTables, gráficos e historial.

### `assets/js/form_validations` y `assets/js/methods`

- `form_validations/` contiene la validación cliente de login con JustValidate;
- `methods/GET/` y `methods/POST/` encapsulan algunas solicitudes comunes, como login y carga de unidades;
- la mayor parte del consumo de API sigue distribuida en `assets/js/main/`.

### `assets/css` e `assets/img`

- `css/` contiene estilos propios de línea de tiempo y tarjetas/KPI;
- `img/` contiene recursos gráficos de la interfaz. Origen, licencia y autorización de marca deben inventariarse antes de redistribuir.

### `assets/addons`

Copias locales de bibliotecas minificadas. Algunas vistas también usan CDN; debe inventariarse licencia y versión.

## Base de datos

- `schema.sql`: estructura reproducible sin datos;
- `seed.example.sql`: catálogos ficticios;
- `grants.example.sql`: permisos locales de ejemplo para el rol runtime;
- `migrations/`: convención futura;
- `bk-clean.sql`: respaldo aportado con cuentas/hashes y contadores históricos, no publicable.

## Documentación

`docs/` contiene esta documentación Markdown y cinco documentos DOCX heredados:

- manual de instalación;
- manual general de usuarios;
- entregas por administrador, mesa de partes y área usuaria.

Los DOCX se conservan como fuente histórica y deben sanitizarse/versionarse; la documentación Markdown basada en código es la referencia técnica de este análisis.
