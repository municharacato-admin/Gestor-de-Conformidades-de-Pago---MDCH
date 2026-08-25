# Códigos de respuesta

## Códigos explícitos en la versión 1.0.0

| Código | Uso real | Ejemplo |
| --- | --- | --- |
| 200 | todas las respuestas funcionales, incluidos errores de negocio | `{"success":false,"message":"Usuario ya registrado"}` |
| 401 | cookie ausente o JWT expirado | acceso no autorizado o sesión expirada |
| 403 | JWT inválido | token inválido |

Los handlers no establecen `201`, `400`, `404`, `409`, `422` ni `500`. Express puede producir respuestas propias ante JSON mal formado, ruta inexistente o excepción no controlada, pero no existe un contrato JSON del proyecto para esos casos.

## Semántica actual

El consumidor debe comprobar el cuerpo además del HTTP:

```javascript
const response = await fetch(url, options);
const data = await response.json();

if (!response.ok || data.success === false) {
  // tratar como error
}
```

Esta semántica dificulta observabilidad, caché, clientes automatizados y pruebas.

## Contrato recomendado, no implementado

La siguiente tabla es una meta de normalización y no describe el código actual:

| Código | Uso recomendado |
| --- | --- |
| 200 | consulta o mutación exitosa sin creación |
| 201 | recurso creado |
| 400 | JSON o parámetros con formato inválido |
| 401 | credenciales ausentes, inválidas o expiradas |
| 403 | usuario autenticado sin permiso |
| 404 | recurso inexistente |
| 409 | duplicidad o transición incompatible |
| 422 | datos con forma válida pero regla de negocio incumplida |
| 500 | error interno con mensaje público genérico |

Una futura versión debe añadir un manejador global y una estructura uniforme, por ejemplo:

```json
{
  "success": false,
  "code": "EXPEDIENTE_NO_ENCONTRADO",
  "message": "No se encontró el expediente solicitado",
  "request_id": "identificador-ficticio"
}
```

`request_id` no está implementado actualmente.
