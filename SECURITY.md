# Política de seguridad

## Versiones admitidas

| Versión | Soporte |
| --- | --- |
| 1.0.0 | No hay soporte en esta versión |

## Información que nunca debe publicarse

- archivos `.env`;
- claves JWT, contraseñas, tokens o claves API;
- cadenas de conexión y credenciales PostgreSQL;
- cookies o sesiones;
- respaldos o volcados con datos reales;
- hashes de contraseñas de usuarios reales;
- datos personales, documentos de identidad, correos privados o direcciones internas;
- claves privadas, certificados y logs con información sensible.

## Controles observados en 1.0.0

- las contraseñas creadas por la API se procesan con bcrypt y factor de costo 10;
- el JWT expira a las 48 horas y se guarda en una cookie `HttpOnly`, `Secure` y `SameSite=None`;
- el middleware verifica la firma y responde explícitamente con 401 ante ausencia o expiración y 403 ante token inválido;
- la mayoría de consultas usa parámetros posicionados de PostgreSQL;
- Joi valida estrictamente los cuerpos de inicio de sesión y creación de usuario;
- el navegador envía cookies mediante `credentials: "include"`.

## Requisitos mínimos para producción

- secretos de alta entropía gestionados fuera de Git y con rotación;
- HTTPS de extremo a extremo o terminación TLS confiable;
- CORS limitado al origen exacto del frontend;
- autorización de servidor por rol y pertenencia a unidad;
- deshabilitar o proteger el alta de usuarios después del aprovisionamiento;
- protección CSRF, rate limiting y cabeceras de seguridad;
- validación de todos los cuerpos, parámetros y consultas;
- usuario PostgreSQL con privilegios mínimos, TLS cuando corresponda y backups cifrados;
- logs sin secretos, con control de acceso, retención y alertas;
- análisis de dependencias y pruebas de restauración antes de cada liberación.