# Configuración

## Backend

`back/.env.example` declara:

| Variable | Requerida por esta guía | Descripción | Ejemplo ficticio |
| --- | --- | --- | --- |
| `CORS_ORIGIN` | prevista | origen exacto del frontend; actualmente no se usa | `http://localhost:5003` |
| `DB_HOST` | sí | host PostgreSQL | `localhost` |
| `DB_PORT` | sí | puerto PostgreSQL | `5432` |
| `DB_NAME` | sí | base | `gestor_conformidades` |
| `DB_USER` | sí | rol de aplicación | `gestor_app` |
| `DB_PASSWORD` | sí | secreto del rol | `REEMPLAZAR_LOCALMENTE` |
| `SECRET_JWT_KEY` | sí | secreto de firma JWT | `GENERAR_LOCALMENTE` |

El código no valida estas variables y `pg` puede aplicar valores predeterminados en ciertos entornos. Para una instalación explícita y reproducible, esta guía exige declarar todas las variables de base y el secreto.



El código no valida estas variables al iniciar. Una variable vacía fallará al conectar o firmar durante una solicitud.

### No configurables por entorno

- backend: puerto `5004`;
- frontend: puerto `5003`;
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
const base_url = "https://example-domain.com/";
```

Debe terminar en `/` porque las rutas se concatenan. No hay variables de entorno para el navegador.

## CORS

Aunque existe `CORS_ORIGIN`, la API usa:

```javascript
cors({
  origin: true,
  credentials: true,
  exposedHeaders: ["set-cookie"]
})
```

Producción debe reemplazarlo por una lista exacta y rechazar otros orígenes. Con cookies no use `*`.

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

Esta separación no está implementada aún.
