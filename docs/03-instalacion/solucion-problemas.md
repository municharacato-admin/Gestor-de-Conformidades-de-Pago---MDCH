# Solución de problemas

| Problema | Causa probable | Solución |
| --- | --- | --- |
| `psql` no existe | cliente PostgreSQL no instalado o fuera de PATH | instale las herramientas y reabra terminal |
| conexión rechazada | servicio detenido, host/puerto/firewall | verifique servicio y variables sin imprimir la contraseña |
| autenticación PostgreSQL falla | usuario/clave/`pg_hba.conf` | valide el rol localmente y rote si fue expuesto |
| tabla no existe | `schema.sql` no ejecutado o base equivocada | confirme `current_database()` y cargue con `ON_ERROR_STOP` |
| rol/unidad no aparece | seed no aplicado | ejecute `seed.example.sql` en entorno de prueba |
| `.env` inexistente | no se copió el ejemplo | copie `back/.env.example` y complete localmente |
| JWT no firma | `SECRET_JWT_KEY` vacío | genere/configure el secreto y reinicie |
| sesión no persiste | cookie `Secure` en HTTP, host mezclado o CORS | use `localhost` consistente, revise HTTPS/origen/atributos |
| error CORS | proxy/navegador o credenciales mal configuradas; tras endurecer CORS, origen no permitido | alinee URL exacta, proxy, CORS y `credentials:include` |
| permiso denegado en archivos/servicio | cuenta sin acceso, ACL o servicio PostgreSQL restringido | compruebe propietario/permisos y ejecute con la cuenta prevista; no eleve la aplicación a administrador |
| frontend llama dominio de ejemplo | `config.js` sin editar | configure `base_url` con barra final |
| puerto 5003/5004 ocupado | otro proceso | identifique el proceso; los puertos aún están fijos |
| frontend muestra 404 de assets | se inició desde otra carpeta | ejecute `npm run dev` dentro de `front/` |
| `npm install` falla | red, proxy, versión Node o binario bcrypt | revise error, versión probada y acceso al registro |
| backend no inicia | dependencia ausente, sintaxis, puerto o configuración | ejecute `node --check back/main.js`, reinstale dependencias y revise el primer error sin imprimir secretos |
| tabla vacía | usuario sin unidad/datos o API falló | revise Network y el sobre `success/response` |
| indicadores vacíos/erróneos | consultas o IDs especiales no coinciden | verifique seed/IDs y logs sanitizados |
| demasiadas solicitudes | sondeo por segundo | corrija intervalos/backoff; no aumente pool sin medir |
| preloader queda visible | error de red no cierra UI | recargue y registre defecto; corregir `finally` |
| no aparece botón de pago | UUID del cliente no coincide | no modifique el UUID: implemente permisos de servidor |
| respuesta 401 | cookie ausente/expirada | vuelva a iniciar sesión después de corregir login |
| respuesta 403 | JWT inválido | borre cookie, revise secreto/host y autentique de nuevo |
| error 200 con `success:false` | contrato actual de negocio | lea `message`; normalizar códigos es pendiente |
| caracteres/fechas extraños | formato/zona heterogéneos | use UTF-8 y normalice API a ISO 8601 |
| CDN no carga | Internet, CSP o URL externa | empaquete recursos o autorice fuente aprobada |

## Diagnóstico seguro

Puede registrar:

- versión de Node/npm/PostgreSQL;
- código HTTP y ruta;
- hora;
- `request_id` cuando se implemente;
- mensaje público;
- pasos con datos ficticios.

No comparta:

- `.env`;
- cookies/JWT;
- contraseñas o hashes;
- filas de `usuarios`;
- dump;
- números/justificaciones reales;
- capturas con datos personales.

## Escalamiento

Si desea implementar mejoras de escalamiento y funcionalidad contactarse con los autores.