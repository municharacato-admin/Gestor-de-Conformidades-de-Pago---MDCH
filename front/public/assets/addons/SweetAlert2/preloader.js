document.addEventListener("DOMContentLoaded", function() {
    function mostrar_preloader(texto) {
        Swal.fire({
            title: texto,
            html: '<div class="loader"></div>',
            allowOutsideClick: false,
            showConfirmButton: false,
            didOpen: () => {
                Swal.showLoading(); 
            }
        });
    }

    function ocultar_preloader() {
        Swal.close();
    }

    window.mostrar_preloader = mostrar_preloader;
    window.ocultar_preloader = ocultar_preloader;


});