# Guía de desarrollo

> Documentación liberada bajo Apache License 2.0. Consulte LICENSE y LICENCIA.txt.

## Preparación

Siga [instalación para desarrollo](../03-instalacion/instalacion-desarrollo.md). Trabaje con una base desechable, usuarios ficticios y secretos locales.

## Comandos actuales

Backend:

```powershell
cd back
npm ci
npm run dev
```

Frontend:

```powershell
cd front
npm ci
npm run dev
```

No hay build, lint o tests declarados.

## Flujo recomendado

1. issue/requisito y criterio de aceptación;
2. amenaza/impacto en datos;
3. rama `feature/*`, `fix/*` o `docs/*`;
4. implementación pequeña;
5. pruebas automatizadas y manuales;
6. actualización de API, esquema/manuales;
7. revisión;
8. preproducción;
9. changelog/migración;
10. pull request.

## Arquitectura que debe respetarse

### Código actual

Las rutas están en `back/main.js` y llaman una función con SQL. Para cambios mínimos mantenga consultas parametrizadas y nunca confíe en el cliente.

### Evolución recomendada

```text
route → autenticación/autorización → validación
      → caso de uso → repositorio PostgreSQL
      → mapper/DTO → respuesta HTTP
```

Introduzca esta separación gradualmente y con pruebas; no reescriba todos los módulos en un cambio no verificable.

## Añadir un endpoint

1. defina método, ruta, rol/capacidad y recurso;
2. escriba primero casos de éxito, validación y acceso denegado;
3. cree un esquema Joi para body/query/params;
4. resuelva el usuario y su unidad en servidor;
5. use SQL parametrizado;
6. use transacción con un `PoolClient` si hay más de una escritura;
7. retorne códigos y JSON uniformes;
8. no exponga errores internos;
9. registre el endpoint en la [documentación de la API](../05-api/api.md);
10. actualice frontend solo después del contrato.

## Añadir un módulo

Backend:

1. mantenga el módulo acotado a un caso de uso y evite importar objetos de la interfaz;
2. ubique temporalmente consultas en `src/GET` o mutaciones en `src/POST` mientras exista la arquitectura actual;
3. exporte una función explícita, regístrela en `main.js` y aplique autenticación, permiso y esquema;
4. si introduce una capa de servicio/repositorio nueva, documente la frontera y migre gradualmente con pruebas.

Frontend:

1. ubique lógica compartida en `assets/js/common` o `methods` y la específica bajo el perfil correspondiente en `assets/js/main`;
2. use módulos ES para código propio, sin añadir secretos ni identidades;
3. importe el módulo desde la vista o motor correspondiente;
4. documente campos, endpoint, estados de carga/error y accesibilidad;
5. elimine intervalos/listeners al abandonar la vista y añada pruebas.

## Transacción PostgreSQL

Patrón recomendado:

```javascript
const client = await pool.connect();
try {
  await client.query("BEGIN");
  // sentencias parametrizadas con client.query(...)
  await client.query("COMMIT");
} catch (error) {
  await client.query("ROLLBACK");
  throw error;
} finally {
  client.release();
}
```

No use `pool.query("BEGIN")` para agrupar sentencias.

## Autenticación y autorización

Antes de nuevas funciones, corrija el login y cree permisos de servidor. Una ruta debe comprobar:

- token válido asociado a usuario existente;
- rol/capacidad;
- unidad o alcance del recurso;
- estado/transición;
- entrada.

No use visibilidad de botones, URL de página, IDs codificados o claims sin revalidación como barrera.

## Validación

Defina:

- tipos y requeridos;
- `trim`;
- límites de longitud/tamaño;
- enums;
- formato de UUID/entero/fecha;
- destinos permitidos;
- justificación requerida;
- campos adicionales prohibidos;
- reglas de negocio y concurrencia.

## Fechas

Normalice API a ISO 8601 con zona o UTC. No mezcle timestamps sin zona y cadenas localizadas. La regla de ocho días debe extraerse a un servicio/calendario probado, incluyendo decisión sobre feriados.

## Estados

Modele una máquina de estados y bloquee:

- recibir un movimiento ajeno/ya recibido;
- derivar sin recepción;
- cancelar/pagar terminales;
- terminal duplicado;
- editar un expediente fuera de alcance.

Base y aplicación deben reforzarse mutuamente.

## Frontend

- centralice Fetch y manejo de 401/403;
- use `textContent` para datos;
- no codifique identidades/permisos;
- cierre preloaders en `finally`;
- confirme acciones destructivas;
- reduzca sondeo y cancele intervalos;
- normalice fechas/errores;
- mantenga accesibilidad;
- no coloque secretos en JavaScript.

## Base de datos

Cada cambio requiere:

- migración;
- precheck;
- rollback;
- actualización de `schema.sql` y diccionario;
- prueba en vacía y actualización;
- prueba de datos huérfanos/duplicados;
- medición de índices.

## Pruebas

Prioridad inicial:

1. login inválido sin cookie;
2. matriz de roles;
3. aislamiento de unidades;
4. transiciones;
5. transacciones;
6. XSS/CSRF;
7. contratos API;
8. instalación de esquema;
9. cálculos KPI/plazo;
10. concurrencia.

Consulte el [plan](../10-pruebas/plan-pruebas.md).

## Revisión de seguridad

Antes del commit:

```powershell
git diff --check
git status --short
```

Use las herramientas institucionales de revisión de dependencias y análisis estático. Incluya los archivos binarios y volcados de datos en la revisión correspondiente.

## Definición de terminado

- criterio cumplido;
- pruebas pasan;
- acceso negativo probado;
- sin secreto/dato real;
- documentación/contrato/migración actualizados;
- logs adecuados;
- revisión aprobada;
- rollback definido;
- changelog cuando corresponda.
