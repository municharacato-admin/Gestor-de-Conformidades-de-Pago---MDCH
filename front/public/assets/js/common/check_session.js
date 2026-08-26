/* @license Apache-2.0; ver LICENCIA.txt */

fetch(check_session, {
    method: "GET",
    credentials: "include"
  })
  .then(res => res.json())
  .then(data => {
    if (!data.success) {
        window.location.href = "../../../index.html";
    }else{
      window.id_usuario_de_sistema = data.id_usuario;
    }
  });
