# Convenciones

## Convenciones del proyecto

Estas describen el código, no necesariamente prácticas recomendadas.

| Área | Observación |
| --- | --- |
| Módulos | ESM |
| Archivos backend | verbos/nombres en `snake_case` |
| Endpoints | ruta igual al nombre de función, con prefijos `get_`/`post_` |
| Funciones | mayormente `snake_case` |
| Variables | mezcla de español y abreviaturas |
| SQL | consultas inline y placeholders PostgreSQL |
| Respuesta | `success` y `message`/`response`/`data` |
| Fechas | mezcla de timestamp, strings y formatos |
| Frontend | funciones globales y módulos por vista |
| Formato | comillas y punto y coma no uniformes |

## Recomendaciones nuevas

### JavaScript

- un único formatter/linter aprobado;
- `camelCase` para variables/funciones;
- `PascalCase` para clases;
- `UPPER_SNAKE_CASE` para constantes reales;
- nombres de archivos consistentes, preferiblemente `kebab-case` o convención elegida;
- `async/await` con `try/catch/finally`;
- sin `console.log` de producción;
- JSDoc solo donde aporte contrato/decisión.

No renombre masivamente sin pruebas porque frontend y rutas tienen referencias directas.

### API

Para una versión futura:

```text
/api/v1/sessions
/api/v1/expedientes
/api/v1/expedientes/:id/movimientos
```

Use sustantivos, métodos HTTP y códigos semánticos. La API actual se conserva/documenta hasta planificar compatibilidad.

### Respuesta

Éxito:

```json
{
  "data": {},
  "meta": {}
}
```

Error:

```json
{
  "error": {
    "code": "CODIGO_ESTABLE",
    "message": "Mensaje público"
  },
  "request_id": "valor-ficticio"
}
```

### SQL

- palabras clave en mayúsculas;
- tablas/columnas `snake_case`;
- parámetros, nunca interpolación;
- transacción por caso de uso;
- migraciones inmutables;
- FK/check/índices con nombres explícitos;
- no `SELECT *` en contratos.

### Seguridad

- deny by default;
- permiso por ruta;
- validar ID y pertenencia;
- errores públicos genéricos;
- no secretos/PII en logs;
- acciones destructivas auditadas;
- datos ficticios en pruebas/docs.

### Commits

Formato recomendado:

```text
feat: agrega validación de transición
fix: impide JWT en login fallido
docs: completa el diccionario de datos
```

### Documentación

- español formal;
- rutas/nombres exactos;
- ejemplos ficticios;
- actualizar en el mismo PR;
- Mermaid simple y validable;
- enlaces relativos.

## Compatibilidad

Todo cambio de convención que afecte rutas, JSON, base o nombres globales exige plan de migración y compatibilidad; una recomendación no implica que ya esté implementada.
