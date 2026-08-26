# Publicación como Software Público Peruano

> Documentación liberada bajo Apache License 2.0. Consulte LICENSE y LICENCIA.txt.

## Marco aplicable

La publicación se realiza mediante la [Plataforma Nacional de Software Público Peruano](https://www.softwarepublico.gob.pe/), de acuerdo con el [Decreto Supremo N.° 051-2018-PCM](https://www.gob.pe/institucion/pcm/normas-legales/3107-051-2018-pcm) y la Directiva N.° 001-2019-PCM/SEGDI.

## Contenido del repositorio

| Requisito | Ubicación |
| --- | --- |
| Código fuente | `back/` y `front/` |
| Forma ejecutable | aplicación Node.js ejecutada desde el código fuente |
| Licencia | `LICENSE` y `LICENCIA.txt` |
| Atribuciones | `NOTICE` y `THIRD_PARTY_NOTICES.md` |
| Diccionario de datos | `docs/04-base-datos/diccionario-datos.md` |
| Manual de usuario | `docs/06-manual-usuario/manual-usuario.md` |
| Manual de administración | `docs/07-manual-administrador/manual-administrador.md` |
| Instalación y configuración | `docs/03-instalacion/` |
| Documentación técnica | `docs/02-arquitectura/`, `docs/05-api/` y `docs/08-desarrollo/` |
| Pruebas | `docs/10-pruebas/plan-pruebas.md` |
| Historial de versiones | `CHANGELOG.md` |

Node.js ejecuta directamente los archivos JavaScript, por lo que este proyecto no genera un binario propio. Las dependencias se resuelven con los archivos `package-lock.json` de cada módulo.

## Trámite institucional

1. Designar mediante resolución al responsable de Software Público de la entidad.
2. Confirmar la titularidad de los derechos patrimoniales y la licencia aplicable con el área legal.
3. Completar el formulario de inscripción de la plataforma.
4. Adjuntar la resolución de designación y `LICENCIA.txt`.
5. Remitir la solicitud mediante el servicio [Publicar software en la Plataforma Nacional de Software Público Peruano](https://www.gob.pe/14979-publicar-software-en-la-plataforma-nacional-de-software-publico).

La Secretaría de Gobierno y Transformación Digital comunica el resultado del trámite y coordina la incorporación al catálogo.

## Revisión previa a una versión

- actualizar la versión en ambos `package.json`;
- ejecutar una instalación limpia con `npm ci`;
- comprobar la inicialización de PostgreSQL;
- ejecutar el plan de pruebas;
- verificar los enlaces de la documentación;
- actualizar `CHANGELOG.md`, `NOTICE` y el inventario de terceros;
- crear una etiqueta Git con la versión publicada.
