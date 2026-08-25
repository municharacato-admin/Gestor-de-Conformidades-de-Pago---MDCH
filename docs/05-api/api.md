# API HTTP

## Convenciones reales

- URL local del backend: `http://localhost:5004`.
- No existe prefijo `/api` ni versionado.
- Cuerpos: JSON.
- Autenticación: cookie `access_token`; no se admite Bearer token.
- El navegador debe usar `credentials: "include"`.
- Salvo los errores del middleware JWT, los errores de negocio se devuelven con HTTP 200 y `success: false`.
- Los ejemplos usan datos ficticios.

### Sobres, tipos y fechas

Los listados usan `{"success":true,"response":[...]}`; los indicadores usan `{"success":true,"data":{...}}`. No existe un esquema formal ni normalización uniforme:

- los `COUNT(*)` de PostgreSQL suelen llegar como strings;
- los `timestamp without time zone` no formateados pasan por `pg`/JSON y suelen verse como ISO, pero su interpretación depende de la zona del proceso;
- envíos de mesa de partes formatea recepción como `YYYY-MM-DD HH:mm`;
- derivados formatea recepción como `DD/MM/YYYY HH:mm`;
- historial formatea recepción como `YYYY-MM-DD HH:mm:ss`;
- cuando no existe recepción, esos campos formateados contienen el literal `"No recepcionado"` en vez de `null`;
- justificación puede ser `null`, salvo en historial, que usa `"Sin justificación"`.

Ejemplo común de error funcional, normalmente HTTP 200:

```json
{
  "success": false,
  "message": "Mensaje de error"
}
```

Los errores 401/403 del middleware se detallan en [Códigos de respuesta](codigos-respuesta.md). Los ejemplos de error por endpoint no son una enumeración exhaustiva: algunas excepciones internas se propagan como `message`.

## Resumen

| Método | Ruta | Perfil previsto | Protección real |
| --- | --- | --- | --- |
| POST | `/create_user` | aprovisionamiento | pública |
| POST | `/login` | todos | pública |
| POST | `/logout` | todos | pública |
| GET | `/check_session` | todos | JWT |
| GET | `/check_rol` | todos | JWT |
| GET | `/get_unidades_organicas` | mesa de partes/unidad | JWT |
| POST | `/post_publicar_expediente` | mesa de partes | JWT, sin rol |
| GET | `/get_expedientes_enviados_mesa_de_partes` | mesa de partes | JWT, sin rol |
| POST | `/post_eliminar_expediente_mp` | mesa de partes | JWT, sin rol |
| GET | `/get_expedientes_por_recepcionar_usuarios` | unidad orgánica | JWT |
| POST | `/post_recepcionar_expediente` | unidad orgánica | JWT, sin pertenencia |
| GET | `/get_expedientes_recepcionados_usuarios` | unidad orgánica | JWT |
| POST | `/post_derivar_expediente` | unidad orgánica | JWT, sin pertenencia |
| GET | `/get_expedientes_derivados_usuarios` | unidad orgánica | JWT |
| POST | `/post_cancelar_expediente` | unidad orgánica | JWT, sin pertenencia |
| GET | `/get_expedientes_cancelados_usuarios` | unidad orgánica | JWT |
| POST | `/post_pagar_expediente` | unidad orgánica | JWT, sin pertenencia |
| GET | `/get_expedientes_pagados_usuarios` | unidad orgánica | JWT |
| POST | `/post_eliminar_expediente_usuario` | unidad orgánica | JWT y condición SQL de unidad |
| POST | `/post_no_recepcionar_exp_usuario` | unidad orgánica | JWT y condición SQL de unidad |
| GET | `/get_estadisticas_usuario` | unidad orgánica | JWT |
| GET | `/get_expedientes` | administrador | JWT, sin rol |
| GET | `/obtener_historial_expediente` | administrador/unidad | JWT, sin rol |
| GET | `/get_estadisticas_administrador` | administrador | JWT, sin rol |

## Autenticación y sesión

### POST /create_user

- **Descripción:** crea un usuario con UUID y contraseña bcrypt.
- **Autenticación:** ninguna.
- **Rol:** no se controla; el solicitante escoge cualquier `id_rol`.
- **Parámetros:** ninguno.
- **Body:** los cuatro campos son strings obligatorios no vacíos; no admite campos extra.

```json
{
  "id_unidad_organica": "27",
  "id_rol": "3",
  "usuario": "usuario_demo",
  "contrasenia": "ElegirLocalmente-UnaClave-Temporal"
}
```

- **Éxito, HTTP 200:** `{"success":true,"message":"Usuario registrado"}`.
- **Errores, HTTP 200:** `{"success":false,"message":"Datos faltantes o incorrectos"}`, usuario duplicado —el mensaje permite inferir que existe— o fallo de base de datos.

Este endpoint solo debe usarse para aprovisionamiento local controlado hasta que cuente con autorización administrativa.

### POST /login

- **Descripción:** valida usuario y contraseña y establece la cookie JWT.
- **Autenticación:** ninguna.
- **Rol:** todos.
- **Body:** `usuario` y `contrasenia`, strings no vacíos y sin campos extra.

```json
{
  "usuario": "usuario_demo",
  "contrasenia": "clave-elegida-localmente"
}
```

- **Éxito, HTTP 200:** `{"success":true,"message":"Login exitoso"}` y cookie.
- **Error funcional, HTTP 200:** `{"success":false,"message":"Usuario o contraseña incorrecto"}`; Joi puede devolver `"Datos faltantes o incorrectos"`.
- **Defecto conocido:** también se firma una cookie ante error; véase [Autenticación](autenticacion.md).

### POST /logout

- **Descripción:** solicita al navegador borrar `access_token`.
- **Autenticación:** ninguna.
- **Rol:** todos.
- **Body y parámetros:** ninguno.
- **Éxito, HTTP 200:** `{"success":true,"message":"Sesión cerrada exitosamente."}`.
- **Errores:** no se implementan errores específicos ni revocación de servidor.

### GET /check_session

- **Descripción:** comprueba la cookie y expone el ID del payload.
- **Autenticación:** JWT.
- **Rol:** cualquiera.
- **Entrada:** ninguna.
- **Éxito, HTTP 200:** `{"success":true,"id_usuario":"uuid-ficticio"}`.
- **Errores:** 401 sin token/expirado; 403 token inválido.
- **Efecto del defecto de login:** un JWT emitido sin ID puede devolver `{"success":true}` porque JSON omite la propiedad `undefined`.

### GET /check_rol

- **Descripción:** devuelve el claim de rol.
- **Autenticación:** JWT.
- **Rol:** cualquiera.
- **Entrada:** ninguna.
- **Éxito, HTTP 200:**

```json
{
  "success": true,
  "rol": [
    { "id_rol": 3 }
  ]
}
```

- **Errores:** 401 o 403 del middleware.
- **Efecto del defecto de login:** un JWT sin rol puede devolver `{"success":true}`.

## Catálogos y mesa de partes

### GET /get_unidades_organicas

- **Descripción:** lista unidades excepto los IDs codificados 25 y 26.
- **Autenticación:** JWT.
- **Rol previsto:** mesa de partes y unidad orgánica; no se aplica en servidor.
- **Entrada:** ninguna.
- **Éxito, HTTP 200:** `{"success":true,"response":[{"id":27,"nombre":"Unidad de demostración"}]}`.
- **Error, HTTP 200:** `{"success":false,"message":"..."}`.

### POST /post_publicar_expediente

- **Descripción:** registra el maestro, calcula vencimiento a ocho días de lunes a viernes y crea el primer envío desde la unidad 26.
- **Autenticación:** JWT.
- **Rol previsto:** mesa de partes; no se aplica.
- **Body:**

```json
{
  "numero_expediente": "EXP-DEMO-0001",
  "unidad_organica": 27
}
```

- **Éxito, HTTP 200:** `{"success":true,"message":"Expediente registrado y enviado"}`.
- **Errores, HTTP 200:** número ya existente o fallo de escritura.
- **Nota:** no hay esquema Joi ni transacción entre las dos inserciones.

### GET /get_expedientes_enviados_mesa_de_partes

- **Descripción:** lista todos los movimientos cuyo origen es la unidad 26; el SQL no verifica que sean el primer movimiento.
- **Autenticación:** JWT.
- **Rol previsto:** mesa de partes; no se aplica.
- **Entrada:** ninguna.
- **Éxito, HTTP 200:**

```json
{
  "success": true,
  "response": [{
    "numero_expediente": "EXP-DEMO-0001",
    "origen": "Mesa de partes de demostración",
    "destino": "Unidad de demostración",
    "fecha_envio": "2026-08-24T15:00:00.000Z",
    "fecha_recepcion": "No recepcionado"
  }]
}
```

- **Error, HTTP 200:** sobre común `success:false`.

### POST /post_eliminar_expediente_mp

- **Descripción:** elimina físicamente maestro e historial cuando solo existe el primer movimiento, su origen es 26 y aún no fue recibido.
- **Autenticación:** JWT.
- **Rol previsto:** mesa de partes; no se aplica.
- **Body:** `id` contiene el **número** de expediente, no su ID entero.

```json
{
  "id": "EXP-DEMO-0001"
}
```

- **Éxito, HTTP 200:** `{"success":true,"message":"Eliminado correctamente"}`.
- **Errores, HTTP 200:** expediente inexistente, múltiples movimientos, origen inválido o ya recibido.
- **Nota:** el intento de transacción usa `Pool.query` y no garantiza una única conexión.

## Unidad orgánica

### GET /get_expedientes_por_recepcionar_usuarios

- **Descripción:** lista movimientos destinados a la unidad del usuario cuya fecha de recepción es nula.
- **Autenticación:** JWT; usa `req.user.id` para obtener la unidad.
- **Rol previsto:** unidad orgánica.
- **Entrada:** ninguna.
- **Éxito, HTTP 200:**

```json
{
  "success": true,
  "response": [{
    "id": 1001,
    "numero_expediente": "EXP-DEMO-0001",
    "origen": "Mesa de partes de demostración",
    "fecha_envio": "2026-08-24T15:00:00.000Z"
  }]
}
```

- **Error, HTTP 200:** `success:false`.

### POST /post_recepcionar_expediente

- **Descripción:** establece la fecha de recepción de un movimiento.
- **Autenticación:** JWT.
- **Rol previsto:** unidad orgánica; no comprueba pertenencia.
- **Body:** `id` es el ID entero de `historial_expedientes`.

```json
{ "id": 1001 }
```

- **Éxito, HTTP 200:** `{"success":true,"message":"Expediente recepcionado"}`.
- **Error, HTTP 200:** movimiento inexistente o error de consulta.

### GET /get_expedientes_recepcionados_usuarios

- **Descripción:** lista expedientes activos recibidos por la unidad que aún no fueron reenviados.
- **Autenticación:** JWT; unidad derivada del usuario.
- **Rol previsto:** unidad orgánica.
- **Entrada:** ninguna.
- **Éxito, HTTP 200:**

```json
{
  "success": true,
  "response": [{
    "id": 1001,
    "numero_expediente": "EXP-DEMO-0001",
    "origen": "Mesa de partes de demostración",
    "fecha_recepcion": "2026-08-24T16:00:00.000Z",
    "justificacion": null
  }]
}
```

- **Error, HTTP 200:** `success:false`.

### POST /post_derivar_expediente

- **Descripción:** crea un movimiento `En proceso` desde el destino del movimiento anterior hacia otra unidad.
- **Autenticación:** JWT.
- **Rol previsto:** unidad orgánica; no comprueba pertenencia.
- **Body:**

```json
{
  "id_historial_expediente": 1001,
  "unidad_organica": 28,
  "justificacion": "Derivación de demostración"
}
```

- **Éxito, HTTP 200:** `{"success":true,"message":"Expediente recepcionado"}`. El texto es inconsistente con la operación real.
- **Error, HTTP 200:** historial inexistente o fallo de escritura.

### GET /get_expedientes_derivados_usuarios

- **Descripción:** lista movimientos salientes de la unidad.
- **Autenticación:** JWT; unidad derivada del usuario.
- **Rol previsto:** unidad orgánica.
- **Entrada:** ninguna.
- **Éxito, HTTP 200:**

```json
{
  "success": true,
  "response": [{
    "id": 1002,
    "numero_expediente": "EXP-DEMO-0001",
    "destino": "Segunda unidad de demostración",
    "fecha_derivado": "2026-08-24T17:00:00.000Z",
    "fecha_recepcion": "No recepcionado",
    "justificacion": "Derivación de demostración"
  }]
}
```

- **Error, HTTP 200:** `success:false`.

### POST /post_cancelar_expediente

- **Descripción:** crea un movimiento terminal `Cancelado` y actualiza el maestro.
- **Autenticación:** JWT.
- **Rol previsto:** unidad orgánica; no comprueba pertenencia o transición.
- **Body:**

```json
{
  "id_historial_expediente": 1001,
  "justificacion": "Cancelación ficticia para prueba"
}
```

- **Éxito, HTTP 200:** `{"success":true,"message":"Expediente cancelado"}`.
- **Error, HTTP 200:** historial inexistente o fallo parcial.

### GET /get_expedientes_cancelados_usuarios

- **Descripción:** lista movimientos terminales cancelados vinculados a la unidad.
- **Autenticación:** JWT.
- **Rol previsto:** unidad orgánica.
- **Entrada:** ninguna.
- **Éxito, HTTP 200:**

```json
{
  "success": true,
  "response": [{
    "id": 1003,
    "numero_expediente": "EXP-DEMO-0002",
    "fecha_cancelado": "2026-08-24T18:00:00.000Z",
    "justificacion": "Cancelación ficticia para prueba"
  }]
}
```

- **Error, HTTP 200:** `success:false`.

### POST /post_pagar_expediente

- **Descripción:** crea un movimiento terminal `Pagado` y actualiza el maestro.
- **Autenticación:** JWT.
- **Rol previsto:** unidad orgánica; no comprueba pertenencia o transición.
- **Body:**

```json
{
  "id_historial_expediente": 1001,
  "justificacion": "Pago de demostración"
}
```

El backend lee `justificacion` pero no la valida. El frontend actual envía solo `id_historial_expediente`, por lo que normalmente se guarda `null`.

- **Éxito, HTTP 200:** `{"success":true,"message":"Expediente pagado"}`.
- **Error, HTTP 200:** historial inexistente o fallo parcial.

### GET /get_expedientes_pagados_usuarios

- **Descripción:** lista pagos asociados a la unidad.
- **Autenticación:** JWT.
- **Rol previsto:** unidad orgánica.
- **Entrada:** ninguna.
- **Éxito, HTTP 200:**

```json
{
  "success": true,
  "response": [{
    "id": 1004,
    "numero_expediente": "EXP-DEMO-0003",
    "fecha_pagado": "2026-08-24T19:00:00.000Z"
  }]
}
```

`fecha_pagado` corresponde a `fecha_envio` del movimiento terminal.
- **Error, HTTP 200:** `success:false`.

### POST /post_eliminar_expediente_usuario

- **Descripción:** elimina la última derivación saliente si pertenece a la unidad y no fue recibida.
- **Autenticación:** JWT y condición SQL basada en `req.user.id`.
- **Rol previsto:** unidad orgánica.
- **Body:** `{"id":1002}`, donde `id` es historial.
- **Éxito, HTTP 200:** `{"success":true,"message":"Derivación eliminada correctamente"}`.
- **Error, HTTP 200:** `{"success":false,"message":"Expediente ya ha sido recepcionado"}` u otro detalle.

### POST /post_no_recepcionar_exp_usuario

- **Descripción:** revierte una recepción poniendo `fecha_recepcion` en nulo si es el último movimiento, pertenece a la unidad y estaba recibido.
- **Autenticación:** JWT y condición SQL basada en `req.user.id`.
- **Rol previsto:** unidad orgánica.
- **Body:** `{"id":1001}`.
- **Éxito, HTTP 200:** `{"success":true,"message":"Recepción revertida correctamente"}`.
- **Error, HTTP 200:** movimiento no elegible o error de consulta.

### GET /get_estadisticas_usuario

- **Descripción:** genera indicadores para la unidad inicial asociada al usuario.
- **Autenticación:** JWT.
- **Rol previsto:** unidad orgánica.
- **Entrada:** ninguna.
- **Éxito, HTTP 200:**

```json
{
  "success": true,
  "data": {
    "total_conformidades": "10",
    "total_conformidades_enProceso": "4",
    "total_conformidades_retrasados": "1",
    "total_conformidades_cancelados": "2",
    "total_conformidades_pagados": "3",
    "total_conformidades_sinRecepcion": 1,
    "total_conformidades_porArea": [],
    "actividad_porDia": [],
    "Kpis_porGerencia": []
  }
}
```

- **Error observable:** los helpers capturan la mayoría de fallos y pueden mantener `success:true` con un mensaje de error —o `0` en una métrica— dentro de `data`; no debe interpretarse como éxito confiable.

## Administración

### GET /get_expedientes

- **Descripción:** lista todos los expedientes con la última oficina y orden por estado/vencimiento.
- **Autenticación:** JWT.
- **Rol previsto:** administrador; no se aplica.
- **Entrada:** ninguna.
- **Éxito, HTTP 200:**

```json
{
  "success": true,
  "response": [{
    "id": 501,
    "numero_expediente": "EXP-DEMO-0001",
    "fecha_hora_termino": "2026-09-03T15:00:00.000Z",
    "estado": "En proceso",
    "ultima_oficina": "Unidad de demostración"
  }]
}
```

`ultima_oficina` puede ser `null`.
- **Error, HTTP 200:** `success:false`.

### GET /obtener_historial_expediente

- **Descripción:** recupera cronológicamente el historial de un expediente maestro.
- **Autenticación:** JWT.
- **Rol previsto:** administrador y vistas de historial; no se aplica.
- **Query:** `id`, ID entero del maestro.

```http
GET /obtener_historial_expediente?id=501
```

- **Éxito, HTTP 200:**

```json
{
  "success": true,
  "response": [{
    "origen": "Mesa de partes de demostración",
    "destino": "Unidad de demostración",
    "fecha_envio": "2026-08-24T15:00:00.000Z",
    "fecha_recepcion": "2026-08-24 16:00:00",
    "estado": "En proceso",
    "justificacion": "Sin justificación"
  }]
}
```

- **Error, HTTP 200:** `success:false`. No hay validación del parámetro.

### GET /get_estadisticas_administrador

- **Descripción:** genera los mismos grupos de indicadores que la vista por usuario, con alcance global.
- **Autenticación:** JWT.
- **Rol previsto:** administrador; no se aplica.
- **Entrada:** ninguna.
- **Éxito, HTTP 200:**

```json
{
  "success": true,
  "data": {
    "total_conformidades": "0",
    "total_conformidades_enProceso": "0",
    "total_conformidades_retrasados": "0",
    "total_conformidades_cancelados": "0",
    "total_conformidades_pagados": "0",
    "total_conformidades_sinRecepcion": "0",
    "total_conformidades_porArea": [],
    "actividad_porDia": [],
    "Kpis_porGerencia": []
  }
}
```

- **Error observable:** como en estadísticas de usuario, puede conservar `success:true` con valores internos erróneos.

## Campos de KPIs

Cada fila de `Kpis_porGerencia` incluye:

- `id_area_usuaria`, `area_usuaria` y `total`;
- `pagados`, `cancelados`, `retrasados` y `en_proceso`;
- `pipeline_total`, `pipeline_area_usuaria`, `pipeline_administracion`, `pipeline_logistica`, `pipeline_contabilidad` y `pipeline_tesoreria`;
- `pipeline_retrasados`, `retrasados_area_usuaria`, `retrasados_administracion`, `retrasados_logistica`, `retrasados_contabilidad` y `retrasados_tesoreria`;
- `promedio_dias_pago` y `promedio_dias_retrasados`;
- `detalle_expedientes`, con objetos `pipeline` y `retrasados`; cada uno agrupa `area_usuaria`, `administracion`, `logistica`, `contabilidad` y `tesoreria`, cuyos elementos son `{"id_expediente":501,"numero_expediente":"EXP-DEMO-0001"}`;
- `cuello_botella` y `oficina_mas_retrasada`.

Los conteos de `pg` suelen serializarse como strings. El consumidor debe tratar la respuesta actual con cautela hasta normalizar el contrato.

Semánticas relevantes:

- `total_conformidades_sinRecepcion` de Administrador cuenta todas las filas de historial sin recepción, mientras la variante Usuario limita el cálculo al último movimiento;
- `promedio_dias_pago` calcula `fecha_hora_termino - fecha_hora_creacion` de expedientes pagados, no tiempo real hasta el pago;
- `promedio_dias_retrasados` calcula la duración del último movimiento, no los días posteriores al vencimiento;
- `total_conformidades_porArea` contiene filas `{"unidad":"Unidad de demostración","total":"1"}`;
- `actividad_porDia` contiene filas `{"fecha":"2026-08-24","total":"1"}`.

## Endpoint configurado pero inexistente

El frontend define `get_expedientes_para_recepcionar_usuarios` en `config.js`, pero `back/main.js` no registra esa ruta. No debe considerarse parte de la API.
