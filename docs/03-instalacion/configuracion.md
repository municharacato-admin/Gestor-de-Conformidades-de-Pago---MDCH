# Configuración

> Documentación liberada bajo Apache License 2.0. Consulte LICENSE y LICENCIA.txt.

## Backend

`back/.env.example` declara:

| Variable | Requerida por esta guía | Descripción | Ejemplo ficticio |
| --- | --- | --- | --- |
| `PORT` | no | puerto de la API; usa `5004` si se omite | `5004` |
| `CORS_ORIGIN` | sí | uno o más orígenes exactos del frontend, separados por comas | `http://localhost:5003` |
| `DB_HOST` | sí | host PostgreSQL | `localhost` |
| `DB_PORT` | sí | puerto PostgreSQL | `5432` |
| `DB_NAME` | sí | base | `gestor_conformidades` |
| `DB_USER` | sí | rol de aplicación | `gestor_app` |
| `DB_PASSWORD` | sí | secreto del rol | `REEMPLAZAR_LOCALMENTE` |
| `SECRET_JWT_KEY` | sí | secreto de firma JWT | `GENERAR_LOCALMENTE` |

El código no valida estas variables y `pg` puede aplicar valores predeterminados en ciertos entornos. Para una instalación explícita y reproducible, esta guía exige declarar todas las variables de base y el secreto.



El código no valida estas variables al iniciar. Una variable vacía fallará al conectar o firmar durante una solicitud.

### Valores aún definidos en código

- vigencia JWT: 48 horas;
- atributos de cookie;
- zona `America/Lima`;
- plazo: ocho días de lunes a viernes;
- IDs de roles/unidades;
- límites del pool;
- TLS PostgreSQL.

## Frontend

La URL vive en:

```text
front/public/assets/js/common/config.js
```

Valor distribuido:

```javascript
const configuredBaseUrl = globalThis.GCP_CONFIG?.apiBaseUrl;
const base_url = new URL(
  configuredBaseUrl ?? `${window.location.protocol}//${window.location.hostname}:5004/`
).href;
```

De forma predeterminada usa el host actual y el puerto `5004`. Para una API en otra URL, defina antes de cargar el módulo:

```html
<script>
  globalThis.GCP_CONFIG = { apiBaseUrl: "https://api.ejemplo.gob.pe/" };
</script>
```

`new URL()` normaliza la barra final. El navegador no consume variables `.env` directamente.

## CORS

La API convierte `CORS_ORIGIN` en una lista separada por comas y valida cada origen:

```javascript
const allowedOrigins = process.env.CORS_ORIGIN.split(",");
```

Las solicitudes sin cabecera `Origin`, como las de herramientas de servidor, se aceptan. Con cookies no use `*`.

## Cookies

| Atributo | Actual | Consideración |
| --- | --- | --- |
| `HttpOnly` | true | evita lectura directa desde JS |
| `Secure` | true | requiere HTTPS |
| `SameSite` | None | requiere protección CSRF |
| `Path` | / | envía a todas las rutas del host API |
| duración | 48 h | duración de la sesión |

Si frontend/API comparten sitio, evalúe `SameSite=Lax/Strict` según los flujos reales. La decisión debe probarse, no asumirse.

## PostgreSQL

`connect_db.js` no admite variables para TLS, pool, timeouts o nombre de aplicación.

## Secretos

- no use valores de ejemplo;
- genere secretos con herramienta aprobada;
- no los coloque en `front/`;
- restrinja lectura del `.env`;
- rote ante sospecha;
- no muestre variables completas en logs;
- documente propietario y fecha de rotación fuera del repositorio.

## Configuración por ambiente recomendada

| Elemento | Desarrollo | Producción |
| --- | --- | --- |
| URL | localhost | dominio HTTPS aprobado |
| cookies | política local segura | `Secure` y política SameSite/CSRF aprobada |
| CORS | origen local exacto | origen productivo exacto |
| PostgreSQL | instancia desechable | servicio restringido/backups |
| datos | ficticios | datos autorizados |
| logs | consola sin secretos | estructurados y centralizados |

Los dominios, secretos, cookies, base de datos y observabilidad deben definirse para cada ambiente.
