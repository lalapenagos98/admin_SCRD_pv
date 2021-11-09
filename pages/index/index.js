//Iniciamos el documento
$(document).ready(function () {
    //Verifico si el token exite en el cliente y verifico que el token este activo en el servidor                
    var token_actual = getLocalStorage(name_local_storage);

    //Verifico si el token esta vacio, para enviarlo a que ingrese de nuevo
    if ($.isEmptyObject(token_actual)) {
        location.href = url_pv_admin + 'index.html?msg=Su sesión ha expirado, por favor vuelva a ingresar.&msg_tipo=danger';
    } else
    {

        //Realizo la peticion para cargar el formulario
        $.ajax({
            type: 'POST',
            data: {"token": token_actual.token},
            url: url_pv + 'Session/consultar_usuario'
        }).done(function (data) {
            if (data == 'error_metodo')
            {
                notify("danger", "ok", "Convocatorias:", "Se registro un error en el método, comuníquese con la mesa de ayuda convocatorias@scrd.gov.co");
            } 
            else
            {
                if (data == 'error_token')
                {
                    location.href = url_pv_admin + 'index.html?msg=Su sesión ha expirado, por favor vuelva a ingresar.&msg_tipo=danger';
                } else
                {
                    if (data == 'error')
                    {
                        location.href = url_pv_admin + 'index.html?msg=Su sesión ha expirado, por favor vuelva a ingresar.&msg_tipo=danger';
                    } 
                    else
                    {
                        var json = JSON.parse(data);
                        if(json.user.primer_nombre==null)
                        {
                           json.user.primer_nombre="";
                        }
                        if(json.user.segundo_nombre==null)
                        {
                           json.user.segundo_nombre="";
                        }
                        if(json.user.primer_apellido==null)
                        {
                           json.user.primer_apellido="";
                        }
                        if(json.user.segundo_apellido==null)
                        {
                           json.user.segundo_apellido="";
                        }
                        $("#nombre_bienvenida").html(json.user.primer_nombre+" "+json.user.segundo_nombre+" "+json.user.primer_apellido+" "+json.user.segundo_apellido);                        
                        
                        if(json.externo=="Si")
                        {                            
                            $(".manuales_externos").css("display","block");
                            $(".manuales_internos").css("display","none");
                        }
                        else
                        {
                            $(".manuales_externos").css("display","none");
                            $(".manuales_internos").css("display","block");
                            
                        }
                    }
                }
            }
        });

    }
});