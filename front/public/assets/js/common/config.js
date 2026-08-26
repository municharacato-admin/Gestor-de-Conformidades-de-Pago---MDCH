/* @license Apache-2.0; ver LICENCIA.txt */

// Puede definirse globalThis.GCP_CONFIG.apiBaseUrl antes de cargar este archivo.
const configuredBaseUrl = globalThis.GCP_CONFIG?.apiBaseUrl;
const base_url = new URL(
  configuredBaseUrl ?? `${window.location.protocol}//${window.location.hostname}:5004/`
).href;

const login = base_url + "login";
const check_session = base_url + "check_session";
const check_rol = base_url + "check_rol";
const logout = base_url + "logout";
const get_unidades_organicas = base_url + "get_unidades_organicas";
const post_publicar_expediente = base_url + "post_publicar_expediente";
const get_expedientes_enviados_mesa_de_partes = base_url + "get_expedientes_enviados_mesa_de_partes";
const get_expedientes_por_recepcionar_usuarios = base_url + "get_expedientes_por_recepcionar_usuarios";
const post_recepcionar_expediente = base_url + "post_recepcionar_expediente";
const get_expedientes_para_recepcionar_usuarios = base_url + "get_expedientes_para_recepcionar_usuarios";
const get_expedientes_recepcionados_usuarios = base_url + "get_expedientes_recepcionados_usuarios";
const post_derivar_expediente = base_url + "post_derivar_expediente";
const get_expedientes_derivados_usuarios = base_url + "get_expedientes_derivados_usuarios";
const post_cancelar_expediente = base_url + "post_cancelar_expediente";
const get_expedientes_cancelados_usuarios = base_url + "get_expedientes_cancelados_usuarios";
const post_pagar_expediente = base_url + "post_pagar_expediente";
const get_expedientes_pagados_usuarios = base_url + "get_expedientes_pagados_usuarios";
const get_expedientes = base_url + "get_expedientes";
const obtener_historial_expediente = base_url + "obtener_historial_expediente";
const get_estadisticas_administrador = base_url + "get_estadisticas_administrador";
const post_eliminar_expediente_mp = base_url + "post_eliminar_expediente_mp";
const post_eliminar_expediente_usuario = base_url + "post_eliminar_expediente_usuario";
const post_no_recepcionar_exp_usuario = base_url + "post_no_recepcionar_exp_usuario";
const get_estadisticas_usuario = base_url + "get_estadisticas_usuario";
