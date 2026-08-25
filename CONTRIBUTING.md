# Contribuir al Gestor de Conformidades de Pago – MDCH

Gracias por contribuir. Estas reglas son una propuesta para ordenar el trabajo; el historial disponible no demuestra que ya se aplique una estrategia de ramas formal.

## Preparación

1. Lea `README.md`, `SECURITY.md` y `docs/08-desarrollo/guia-desarrollo.md`.
2. Cree un fork o clone el repositorio. La URL pública oficial está
   **PENDIENTE DE DEFINIR**; cuando se publique, use:

   ```powershell
   git clone <URL_REPOSITORIO>
   cd "Gestor de Conformidades de Pago - MDCH"
   git remote -v
   ```

   Si trabaja desde un fork, clone su URL y configure el repositorio
   institucional como remoto `upstream`.
3. Instale por separado las dependencias de `back/` y `front/`.
4. Use únicamente datos ficticios y un archivo `back/.env` local.
5. Verifique que ninguna credencial, respaldo ni dato personal se incluya en el cambio.

## Estrategia Git recomendada

- `main`: versiones publicables.
- `develop`: integración cuando el equipo decida usar una rama intermedia.
- `feature/<descripcion>`: funcionalidad.
- `fix/<descripcion>`: corrección.
- `docs/<descripcion>`: documentación.
- `security/<descripcion>`: corrección de seguridad coordinada de manera privada.

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
- impacto en API, base de datos, seguridad y documentación;
- migración y plan de reversión cuando aplique;
- capturas sin datos reales si cambia la interfaz;
- checklist de secretos y datos personales.

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

## Seguridad

No abra un issue público para una vulnerabilidad explotable. Siga `SECURITY.md`. Si descubre un secreto o dato personal en el historial, detenga la publicación y comuníquelo por el canal privado institucional cuando sea designado.

## Licencia y atribución

Al enviar una contribución, declara que tiene derecho a aportarla y acepta que se distribuya bajo la licencia vigente del proyecto, actualmente declarada como Apache-2.0. Conserve avisos aplicables e identifique archivos modificados.
