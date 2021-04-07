/*
 * Se inactiva problemas con la verificacion del token
 * 19 de mayo 2020
$(document).ready(function () {

    //Validar si el navegador soporta localStorage, si no lo soporta lo envia directamente a la pagina de error
    issetLocalStorage();

    //Verifico si el token exite en el cliente y verifico que el token este activo en el servidor
    //Si el token no esta activo o se presenta un error se elimina la variable del session storage
    var token_actual = getLocalStorage(name_local_storage);
    
    //Verifico si el token esta vacio, para enviarlo a que ingrese de nuevo
    if( $.isEmptyObject(token_actual)){       
        location.href='../../index.html?msg=Su sesión ha expirado, por favor vuelva a ingresar.&msg_tipo=danger';
    }
    else
    {
        $.ajax({
            // En data puedes utilizar un objeto JSON, un array o un query string
            data: {"token": token_actual.token},
            //Cambiar a type: POST si necesario
            type: "POST",
            // URL a la que se enviará la solicitud Ajax
            url: url_pv + 'Session/verificar_token/',
        })
        .done(function (data, textStatus, jqXHR) {
            if (console && console.log) {
                if (data == 'error_metodo')
                {
                    removeLocalStorage(name_local_storage);
                    location.href='pages/index/index.html?msg=Se registro un error en el método, comuníquese con la mesa de ayuda convocatorias@scrd.gov.co&msg_tipo=danger';                            
                } 
                else
                {
                    if (data == 'false')
                    {
                        removeLocalStorage(name_local_storage);
                        location.href='../../index.html?msg=Su sesión ha expirado, por favor vuelva a ingresar.&msg_tipo=danger';
                    }
                }

            }
            else
            {
                location.href='pages/index/index.html?msg=Se registro un error, comuníquese con la mesa de ayuda convocatorias@scrd.gov.co&msg_tipo=danger';
            }
        })
        .fail(function (jqXHR, textStatus, errorThrown) {
            if (console && console.log) {  
                removeLocalStorage(name_local_storage);
                location.href='pages/index/index.html?msg=Se registro un error, comuníquese con la mesa de ayuda convocatorias@scrd.gov.co .'+ textStatus+'&msg_tipo=danger';
            }
        });
    }     
});
*/      