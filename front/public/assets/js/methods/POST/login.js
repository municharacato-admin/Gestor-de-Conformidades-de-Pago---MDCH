/* @license Apache-2.0; ver LICENCIA.txt */

function verificar_login() {
    mostrar_preloader("Verificando...")
    const usuario = document.querySelector('#usuario').value;
    const contrasenia = document.querySelector('#contrasenia').value;

    const datos = {
        usuario: usuario,
        contrasenia: contrasenia
    };

    fetch(login,{
        method: "POST",
        headers: {
            'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify(datos)
    })
    .then(response => response.json())
    .then(data => {
      ocultar_preloader()
      if (!data.success){
        aviso_error(data.message);
      }else if (data.success) {
        window.location.href = "./assets/views/router.html";
      }else{
        aviso_error(data.message);
      }
    })
    .catch(error => {
      aviso_error('Error en la solicitud');
    });

}
