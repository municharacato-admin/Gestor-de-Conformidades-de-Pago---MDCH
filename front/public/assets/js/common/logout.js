document.addEventListener('DOMContentLoaded', () => {
    const cerrarSesion = document.getElementById("cerrar_sesion");
    if (cerrarSesion) {
      cerrarSesion.addEventListener("click", (e) => {
        e.preventDefault(); // Previene el salto por el <a href="#">
        fetch(logout, {
          method: "POST",
          credentials: "include"
        })
        .then(res => res.json())
        .then(data => {
          if (data.success) {
            window.location.href = "../../../index.html";
          } else {
            aviso_error("No se pudo cerrar sesión.");
          }
        })
        .catch(err => {
          console.error("Error cerrando sesión", err);
        });
      });
    }
  });