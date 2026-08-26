# Relaciones y restricciones

> Documentación liberada bajo Apache License 2.0. Consulte LICENSE y LICENCIA.txt.

## Relaciones usadas por la aplicación

| Desde | Hacia | Cardinalidad lógica | Evidencia |
| --- | --- | --- | --- |
| historial_expedientes.`id_expediente` | expedientes.`id` | muchos a uno | joins de listados e historial |
| historial_expedientes.`id_unidad_origen` | unidades_organicas.`id` | muchos a uno | nombres de origen |
| historial_expedientes.`id_unidad_destino` | unidades_organicas.`id` | muchos a uno | bandejas por destino |
| usuarios.`id_unidad_organica` | unidades_organicas.`id` | uno a uno físico, muchos a uno conceptualmente | asociación del usuario |
| usuarios.`id_rol` | roles.`id` | muchos a uno | login y router |

Ninguna está respaldada por `FOREIGN KEY` en el volcado.

## Integridad actual

- El backend depende de joins para omitir o enriquecer datos; una referencia huérfana puede ocultar movimientos.
- La aplicación elimina historial antes del maestro solo en un flujo específico.
- No hay `ON DELETE` ni `ON UPDATE`.
- Cancelar y pagar escriben historial y maestro por separado.

## Acoplamientos de IDs

| ID | Dependencia |
| --- | --- |
| rol 1 | vista administrador |
| rol 2 | vista mesa de partes |
| rol 3 | vista unidad orgánica |
| unidad 26 | origen de mesa de partes |
| unidades 25 y 26 | exclusión de destinos |
| unidades 8, 27, 28 y 29 | etapas de KPIs |

Además, el frontend habilita pago comparando el usuario con un UUID fijo. Ese valor no se reproduce en esta documentación ni en los seeds; debe sustituirse por autorización de rol/capacidad en el servidor.

## Migración recomendada

Antes de añadir restricciones:

1. buscar referencias huérfanas;
2. decidir qué hacer con duplicados y nulos;
3. confirmar si una unidad debe admitir varios usuarios;
4. normalizar roles, estados y unidades especiales;
5. añadir `UNIQUE (numero_expediente)` si la regla institucional lo confirma;
6. crear FKs e índices de forma controlada;
7. probar todas las transiciones y restauración.

Ejemplo conceptual, **no ejecutable sin validación previa**:

```sql
-- Aplicar después de normalizar los datos existentes
ALTER TABLE historial_expedientes
  ADD CONSTRAINT fk_historial_expediente
  FOREIGN KEY (id_expediente) REFERENCES expedientes(id);
```

No se incorporó al `schema.sql` porque alteraría la estructura actual.
