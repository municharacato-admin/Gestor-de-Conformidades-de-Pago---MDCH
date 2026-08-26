# Flujo de información

> Documentación liberada bajo Apache License 2.0. Consulte LICENSE y LICENCIA.txt.

## Inicio de sesión

```mermaid
sequenceDiagram
    actor U as Usuario
    participant F as index.html
    participant A as API /login
    participant D as PostgreSQL
    participant R as router.html
    U->>F: ingresa credenciales
    F->>F: JustValidate comprueba no vacío
    F->>A: POST JSON + credentials
    A->>A: Joi valida forma mínima
    A->>D: consulta usuario y hash
    D-->>A: credenciales/rol
    A-->>F: JSON + cookie access_token
    F->>R: redirección
    R->>A: GET /check_session + cookie
    A-->>R: sesión e ID
    R->>A: GET /check_rol + cookie
    A-->>R: rol
    R-->>U: vista por rol
```

## Registro inicial

```mermaid
sequenceDiagram
    actor MP as Mesa de partes
    participant V as Vista MP
    participant A as API
    participant D as PostgreSQL
    MP->>V: número y unidad destino
    V->>V: comprobar campos no vacíos
    V->>A: POST /post_publicar_expediente
    A->>A: sin esquema de body
    A->>D: comprobar número
    A->>A: calcular ahora y +8 días L-V
    A->>D: INSERT expedientes
    A->>D: INSERT historial origen 26
    A-->>V: success/message
    V->>A: refrescar listado
    A-->>V: envíos iniciales
```

Las dos inserciones no comparten transacción.

## Atención y derivación

```mermaid
sequenceDiagram
    actor O as Unidad orgánica
    participant V as Vista usuario
    participant A as API
    participant D as PostgreSQL
    V->>A: GET pendientes
    A->>D: buscar unidad del JWT y movimientos sin recepción
    D-->>A: filas
    A-->>V: bandeja
    O->>V: recepcionar
    V->>A: POST {"id": id_historial}
    A->>A: sin esquema ni pertenencia
    A->>D: UPDATE fecha_recepcion
    O->>V: derivar + destino + justificación
    V->>V: exigir destino/justificación
    V->>A: POST /post_derivar_expediente
    A->>A: sin esquema ni autorización por unidad
    A->>D: leer movimiento anterior
    A->>D: INSERT nuevo movimiento
    A-->>V: resultado
```

## Validación real

| Flujo | Cliente | API/BD |
| --- | --- | --- |
| login/alta | login comprueba campos no vacíos | Joi valida forma mínima; restricciones únicas en alta |
| registro MP | comprueba unidad y número; fecha ignorada | sin Joi; consulta duplicado no atómica |
| recepción | ID tomado de la fila | sin esquema ni control de pertenencia |
| derivación/cancelación | campos obligatorios en la UI | sin Joi, máquina de estados o pertenencia |
| pago | botón condicionado por UUID | backend no verifica Tesorería, rol o unidad |
| reversión/eliminación | botón por fila | algunas condiciones SQL de unidad/último movimiento |

La palabra «validación» en el flujo no implica defensa en tres capas. El esquema no contiene FKs, CHECK o triggers y el servidor debe validar todo dato del navegador.

## Terminación

```mermaid
stateDiagram-v2
    [*] --> EnProceso: registro inicial
    EnProceso --> EnProceso: recepción/derivación
    EnProceso --> Cancelado: cancelar
    EnProceso --> Pagado: registrar pago
    Cancelado --> [*]
    Pagado --> [*]
```

La recepción no es un estado de columna; se representa con `fecha_recepcion`. La base no impide transiciones posteriores, duplicadas o inválidas.

## Consultas e indicadores

```mermaid
flowchart LR
    E[(expedientes)] --> Q[Consultas SQL/CTE]
    H[(historial_expedientes)] --> Q
    U[(unidades_organicas)] --> Q
    Q --> API[respuesta data/response]
    API --> DT[DataTables]
    API --> CH[Chart.js]
    DT --> X[Excel]
```

Los indicadores se calculan bajo demanda. El frontend de usuario actualiza tablas por sondeo, pero no refresca los KPI al mismo ritmo.

## Datos sensibles por frontera

| Flujo | Datos | Tratamiento requerido |
| --- | --- | --- |
| login | usuario y contraseña | HTTPS; nunca loguear contraseña |
| cookie | JWT con UUID y rol | `HttpOnly`, rotación y no capturar |
| API | número, oficinas, fechas, justificación | autorización por unidad/rol |
| BD | hash bcrypt y trazabilidad | privilegios mínimos y backups cifrados |
| exportación | listados | control de acceso y custodia del archivo |
| evidencias | capturas | solo datos ficticios |

## Dependencias ocultas identificadas

- IDs de rol 1–3;
- IDs de unidad 8, 25–29;
- UUID de habilitación de pago en el cliente;
- URL base editada manualmente;
- origen 26 para primer movimiento;
- acceso a Internet para CDNs.
