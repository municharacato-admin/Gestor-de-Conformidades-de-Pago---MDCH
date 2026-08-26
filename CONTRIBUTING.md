# Contribuir al Gestor de Conformidades de Pago – MDCH

Estas pautas ordenan el desarrollo y la revisión de cambios en el proyecto.

## Preparación

1. Lea `README.md` y `docs/08-desarrollo/guia-desarrollo.md`.
2. Clone el repositorio:

   ```powershell
   git clone https://github.com/municharacato-admin/Gestor-de-Conformidades-de-Pago---MDCH.git
   cd "Gestor de Conformidades de Pago - MDCH"
   git remote -v
   ```

3. Instale por separado las dependencias de `back/` y `front/`.
4. Use únicamente datos ficticios y un archivo `back/.env` local.

## Estrategia Git recomendada

- `main`: versión estable.
- `develop`: integración cuando el equipo decida usar una rama intermedia.
- `feature/<descripcion>`: funcionalidad.
- `fix/<descripcion>`: corrección.
- `docs/<descripcion>`: documentación.

Use nombres breves, minúsculas y guiones, por ejemplo `feature/validar-expediente`.

## Commits

Se recomiendan mensajes en modo imperativo con un tipo:

```text
feat: valida la recepción de expedientes
fix: restringe una consulta a la unidad autenticada
docs: actualiza la instalación de PostgreSQL
test: cubre el cierre de sesión
```

Cada commit debe tener un propósito único y no debe mezclar formateo masivo con cambios funcionales.

## Pull requests

Incluya:

- problema y solución;
- alcance y archivos principales;
- pasos de prueba y resultado;
- impacto en API, base de datos y documentación;
- migración y plan de reversión cuando aplique;
- capturas sin datos reales si cambia la interfaz;

Solicite al menos una revisión técnica. Los cambios de autenticación, permisos, licencia, esquema o datos requieren además revisión del responsable institucional correspondiente.

## Calidad mínima

Antes de enviar:

```powershell
node --check back/main.js
node --check front/main.js
```

Ejecute también las pruebas automatizadas cuando sean incorporadas. Actualmente no hay un script `test` declarado; añadir cobertura es una contribución prioritaria.

Mantenga:

- consultas parametrizadas;
- validación de entrada en el servidor;
- autorización en el backend, nunca solo en la interfaz;
- respuestas consistentes y sin detalles internos;
- transacciones con un cliente PostgreSQL dedicado para operaciones múltiples;
- documentación de endpoints, variables y migraciones.

## Cambios de base de datos

No edite respaldos con datos. Añada una migración numerada y reversible en `database/migrations/`, actualice `database/schema.sql` y el diccionario de datos, y pruebe tanto instalación limpia como actualización.

## Licencia y atribución

Al enviar una contribución, declara que tiene derecho a aportarla y acepta que se distribuya bajo la licencia vigente del proyecto, actualmente declarada como Apache-2.0. Conserve avisos aplicables e identifique archivos modificados.
