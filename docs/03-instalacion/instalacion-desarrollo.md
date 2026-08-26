# Instalación para desarrollo

> Documentación liberada bajo Apache License 2.0. Consulte LICENSE y LICENCIA.txt.

## 1. Clonar

```powershell
git clone https://github.com/municharacato-admin/Gestor-de-Conformidades-de-Pago---MDCH.git
cd "Gestor-de-Conformidades-de-Pago---MDCH"
```

## 2. Preparar PostgreSQL

Cree una base vacía, un propietario/migrador y un rol de ejecución. En una sesión interactiva de `psql`, `\password` evita escribir claves en el documento o historial:

```sql
CREATE ROLE gestor_owner LOGIN;
CREATE ROLE gestor_app LOGIN;
\password gestor_owner
\password gestor_app
CREATE DATABASE gestor_conformidades OWNER gestor_owner ENCODING 'UTF8';
```

Cargue estructura y catálogos:

```powershell
psql -v ON_ERROR_STOP=1 --host localhost --port 5432 --username gestor_owner --dbname gestor_conformidades --file database/schema.sql
psql -v ON_ERROR_STOP=1 --host localhost --port 5432 --username gestor_owner --dbname gestor_conformidades --file database/seed.example.sql
psql -v ON_ERROR_STOP=1 --host localhost --port 5432 --username gestor_owner --dbname gestor_conformidades --file database/grants.example.sql
```

## 3. Instalar backend

Antes de crear `back/.env`, puede comprobar desde la raíz que el archivo está excluido del control de versiones:

```powershell
git check-ignore -v back/.env
```

Después instale las dependencias fijadas y copie el ejemplo:

```powershell
cd back
npm ci
Copy-Item .env.example .env
```

Edite `back/.env` con valores locales:

```env
PORT=5004
CORS_ORIGIN=http://localhost:5003
DB_HOST=localhost
DB_PORT=5432
DB_NAME=gestor_conformidades
DB_USER=gestor_app
DB_PASSWORD=REEMPLAZAR_LOCALMENTE
SECRET_JWT_KEY=GENERAR_UN_VALOR_LARGO_Y_ALEATORIO
```

Inicie:

```powershell
npm run dev
```

Debe mostrar que escucha en 5004. No existe endpoint de salud.

## 4. Configurar frontend

El frontend usa de forma predeterminada el host de la página y el puerto `5004` para la API. Use `localhost` de forma consistente; mezclarlo con `127.0.0.1` cambia el contexto de cookies/origen.

En otra terminal:

```powershell
cd front
npm ci
npm run dev
```

Debe escuchar en `http://localhost:5003`.

## 5. Crear usuarios ficticios

El seed no incluye credenciales. Con el backend local levantado, invoque `POST /create_user` para cada perfil necesario. Este ejemplo de PowerShell 7 solicita la clave sin mostrarla y crea tres cuentas ficticias:

```powershell
$apiLocal = "http://localhost:5004"
$claveSegura = Read-Host "Clave temporal de laboratorio" -AsSecureString
$claveTemporal = ConvertFrom-SecureString $claveSegura -AsPlainText

$cuentasDemo = @(
  @{ id_unidad_organica = "25"; id_rol = "1"; usuario = "administrador_demo" },
  @{ id_unidad_organica = "26"; id_rol = "2"; usuario = "mesa_partes_demo" },
  @{ id_unidad_organica = "30"; id_rol = "3"; usuario = "unidad_demo" }
)

foreach ($cuentaDemo in $cuentasDemo) {
  $cuentaDemo.contrasenia = $claveTemporal
  Invoke-RestMethod -Method Post -Uri "$apiLocal/create_user" `
    -ContentType "application/json" -Body ($cuentaDemo | ConvertTo-Json)
}

Remove-Variable claveTemporal, claveSegura
```

Para la interfaz, los roles son 1 administrador, 2 mesa de partes y 3 unidad orgánica. Cada usuario necesita una unidad distinta porque el esquema actual impone unicidad en `id_unidad_organica`.

No deje `/create_user` expuesto fuera del entorno aislado.

## 6. Acceder

1. abra `http://localhost:5003`;
2. use una credencial ficticia creada localmente;
3. confirme la redirección;
4. registre un expediente ficticio desde mesa de partes;
5. recíbalo/derívelo desde una unidad;
6. consulte historial e indicadores.

## 7. Problemas de cookie local

La cookie es `Secure; SameSite=None`, mientras los procesos locales usan HTTP. Algunos navegadores tratan `localhost` como contexto seguro, pero el comportamiento puede variar. Si no se conserva:

- confirme que usa `localhost` en ambos servicios;
- revise `Set-Cookie` y bloqueos en DevTools sin copiar el token;
- pruebe HTTPS local;
- implemente una configuración de cookie específica por entorno antes de continuar.

No elimine `HttpOnly` ni desactive seguridad en código compartido como solución permanente.

## 8. Detener

Use `Ctrl+C` en cada terminal. El código no implementa apagado ordenado del pool; cierre la instancia de desarrollo si quedaron conexiones.

## 9. Validación mínima

Vuelva a la raíz del repositorio antes de ejecutar:

```powershell
cd ..
node --check back/main.js
node --check front/main.js
```

Revise el [plan de pruebas](../10-pruebas/plan-pruebas.md). No hay `npm test` disponible.
