//Array del consumo con el back
keycloak.init(initOptions).then(function (authenticated) {
    //Si no esta autenticado lo obliga a ingresar al keycloak
    if (authenticated === false)
    {
        keycloak.login();
    } else
    {
        //Guardamos el token en el local storage
        if (typeof keycloak === 'object') {

            var token_actual = JSON.parse(JSON.stringify(keycloak));

            //Verifica si el token actual tiene acceso de lectura
            permiso_lectura_keycloak(token_actual.token, "SICON-HOME-FUNCIONARIO");
            
            //Cargamos el menu principal
            $.ajax({
                type: 'POST',
                data: {"token": token_actual.token, "id": getURLParameter('id'), "m": getURLParameter('m'), "p": getURLParameter('p'), "sub": getURLParameter('sub')},
                url: url_pv + 'Administrador/menu_funcionario'
            }).done(function (result) {
                if (result == 'error_token')
                {
                    //location.href = url_pv_admin + 'index_funcionario.html?msg=Su sesión ha expirado, por favor vuelva a ingresar.&msg_tipo=danger';
                } else
                {
                    $("#menu_principal").html(result);
                }
            });

            //Muestra los manuales del funcionario
            $.ajax({
                type: 'POST',
                data: {"token": token_actual.token, modulo: "SICON-HOME-FUNCIONARIO"},
                url: url_pv + 'Session/permiso_lectura_keycloak/'
            }).done(function (data) {
                if (data == 'ok')
                {
                    $(".manuales_internos").css("display", "block");
                }        
            });
            
            
            /*
            if (json.externo == "Si")
            {
                $(".manuales_externos").css("display", "block");
                $(".manuales_internos").css("display", "none");
            } else
            {
                $(".manuales_externos").css("display", "none");
                $(".manuales_internos").css("display", "block");

            }
            */

            /*Se inactiva, para despues colocar los nombres de los datos del keycloak
            $.ajax({
                type: 'POST',
                data: {"token": token_actual.token},
                url: url_pv + 'Session/consultar_usuario'
            }).done(function (data) {
                if (data == 'error_metodo')
                {
                    notify("danger", "ok", "Convocatorias:", "Se registro un error en el método, comuníquese con la mesa de ayuda convocatorias@scrd.gov.co");
                } else
                {
                    if (data == 'error_token')
                    {
                        //location.href = url_pv_admin + 'index_funcionario.html?msg=Su sesión ha expirado, por favor vuelva a ingresar.&msg_tipo=danger';
                    } else
                    {
                        if (data == 'error')
                        {
                            location.href = url_pv_admin + 'index_funcionario.html?msg=Su sesión ha expirado, por favor vuelva a ingresar.&msg_tipo=danger';
                        } else
                        {
                            var json = JSON.parse(data);
                            if (json.user.primer_nombre == null)
                            {
                                json.user.primer_nombre = "";
                            }
                            if (json.user.segundo_nombre == null)
                            {
                                json.user.segundo_nombre = "";
                            }
                            if (json.user.primer_apellido == null)
                            {
                                json.user.primer_apellido = "";
                            }
                            if (json.user.segundo_apellido == null)
                            {
                                json.user.segundo_apellido = "";
                            }
                            $("#nombre_bienvenida").html(json.user.primer_nombre + " " + json.user.segundo_nombre + " " + json.user.primer_apellido + " " + json.user.segundo_apellido);

                            if (json.externo == "Si")
                            {
                                $(".manuales_externos").css("display", "block");
                                $(".manuales_internos").css("display", "none");
                            } else
                            {
                                $(".manuales_externos").css("display", "none");
                                $(".manuales_internos").css("display", "block");

                            }
                        }
                    }
                }
            });
            */
        }
    }
}).catch(function () {
    location.href = url_pv_admin + 'error_keycloak.html';
});    