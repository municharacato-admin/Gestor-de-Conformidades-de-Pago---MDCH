/* @license Apache-2.0; ver LICENCIA.txt */

document.addEventListener("DOMContentLoaded", function() {

    function aviso_exito (titulo){
      Swal.fire({
        title: titulo,
        icon: "success",
        iconColor: "white",
        toast: true, 
        position: 'center',
        showConfirmButton: false,
        timer: 3000,
        timerProgressBar: true,
        customClass: {
          popup: 'bg-success text-white'  // Agrega las clases de Bootstrap
        },
        didOpen: (toast) => {
          toast.addEventListener('mouseenter', Swal.stopTimer);
          toast.addEventListener('mouseleave', Swal.resumeTimer);
        }
      });
    }
    
    function aviso_error (titulo){
      Swal.fire({
        title: titulo,
        icon: "error",
        iconColor: "white",
        toast: true, 
        position: 'center',
        showConfirmButton: false,
        timer: 3000,
        timerProgressBar: true,
        customClass: {
          popup: 'bg-danger text-white'  // Agrega las clases de Bootstrap
        },
        didOpen: (toast) => {
          toast.addEventListener('mouseenter', Swal.stopTimer);
          toast.addEventListener('mouseleave', Swal.resumeTimer);
        }
      });
    }

    function aviso_peligro (titulo){
      Swal.fire({
        title: titulo,
        icon: "warning",
        iconColor: "white",
        toast: true, 
        position: 'center',
        showConfirmButton: false,
        timer: 3000,
        timerProgressBar: true,
        customClass: {
          popup: 'bg-warning text-white'  // Agrega las clases de Bootstrap
        },
        didOpen: (toast) => {
          toast.addEventListener('mouseenter', Swal.stopTimer);
          toast.addEventListener('mouseleave', Swal.resumeTimer);
        }
      });
    }

    function aviso_informacion (titulo){
      Swal.fire({
        title: titulo,
        icon: "info",
        iconColor: "white",
        toast: true, 
        position: 'center',
        showConfirmButton: false,
        timer: 3000,
        timerProgressBar: true,
        customClass: {
          popup: 'bg-info text-white'  // Agrega las clases de Bootstrap
        },
        didOpen: (toast) => {
          toast.addEventListener('mouseenter', Swal.stopTimer);
          toast.addEventListener('mouseleave', Swal.resumeTimer);
        }
      });
    }

    function aviso_pregunta (titulo){
      Swal.fire({
        title: titulo,
        icon: "question",
        iconColor: "white",
        toast: true, 
        position: 'center',
        showConfirmButton: false,
        timer: 3000,
        timerProgressBar: true,
        customClass: {
          popup: 'bg-secondary text-white'  // Agrega las clases de Bootstrap
        },
        didOpen: (toast) => {
          toast.addEventListener('mouseenter', Swal.stopTimer);
          toast.addEventListener('mouseleave', Swal.resumeTimer);
        }
      });
    }

    window.aviso_exito = aviso_exito;
    window.aviso_error = aviso_error;
    window.aviso_peligro = aviso_peligro;
    window.aviso_informacion = aviso_informacion;
    window.aviso_pregunta = aviso_pregunta;
})
