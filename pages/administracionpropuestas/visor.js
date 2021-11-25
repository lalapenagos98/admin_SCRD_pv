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
            permiso_lectura_keycloak(token_actual.token, "SICON-AJUSTAR-INTEGRANTES");

            //Cargamos el menu principal
            $.ajax({
                type: 'POST',
                data: {"token": token_actual.token, "id": getURLParameter('id'), "m": getURLParameter('m'), "p": getURLParameter('p'), "sub": getURLParameter('sub')},
                url: url_pv + 'Administrador/menu_funcionario'
            }).done(function (result) {
                if (result == 'error_token')
                {
                    location.href = url_pv_admin + 'index.html?msg=Su sesión ha expirado, por favor vuelva a ingresar.&msg_tipo=danger';
                } else
                {
                    $("#menu_principal").html(result);
                }
            });

            $("#id").attr('value', getURLParameter('id'));

            $("#ext").attr('value', getURLParameter('ext'));

            $("#name").attr('value', getURLParameter('name'));

            $.ajax({
                type: 'POST',
                url: url_pv + 'PropuestasDocumentacion/visor/',
                data: {"cod": $("#id").val(), "token": token_actual.token, "modulo": "SICON-PROPUESTAS-VERIFICACION"},
            }).done(function (result) {
                var b64 = "";
                if ($("#ext").val() == "pdf")
                {
                    b64 = "data:application/pdf;base64," + result;
                    $("#visor_pdf").css("display", "block");
                    PDFObject.embed(b64, "#visor_pdf");
                }

                if ($("#ext").val() == "jpg" || $("#ext").val() == "gif", $("#ext").val() == "png")
                {
                    b64 = "data:image/" + $("#ext").val() + ";base64," + result;
                    $("#visor_img").css("display", "block");
                    $("#visor_img").attr("src", b64);
                    $("#visor_img").attr("title", $("#name").val());
                    $("#visor_img").attr("alt", $("#name").val());
                }
            });

            $("#link_descargar").click(function () {
                //Verifico si el token exite en el cliente y verifico que el token este activo en el servidor                
                var token_actual = getLocalStorage(name_local_storage);

                //Verifico si el token esta vacio, para enviarlo a que ingrese de nuevo
                if ($.isEmptyObject(token_actual)) {
                    location.href = url_pv_admin + 'index.html?msg=Su sesión ha expirado, por favor vuelva a ingresar.&msg_tipo=danger';
                } else
                {
                    $.AjaxDownloader({
                        url: url_pv + 'PropuestasDocumentacion/download_file/',
                        data: {
                            cod: $("#id").val(),
                            token: token_actual.token,
                            modulo: "Verificación de propuestas"
                        }
                    });
                }
            });
        }
    }

});