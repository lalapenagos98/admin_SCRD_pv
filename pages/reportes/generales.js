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
            permiso_lectura_keycloak(token_actual.token, "SICON-REPORTES-GENERALES");

            //Cargamos el menu principal
            $.ajax({
                type: 'POST',
                data: {"token": token_actual.token, "id": getURLParameter('id'), "m": getURLParameter('m'), "p": getURLParameter('p'), "sub": getURLParameter('sub')},
                url: url_pv + 'Administrador/menu_funcionario'
            }).done(function (result) {
                if (result == 'error_token')
                {
                    notify("danger", "ok", "Convocatorias:", "Por favor actualizar la página, debido a que su sesión caduco");
                } else
                {
                    $("#menu_principal").html(result);
                }
            });

            //Realizo la peticion para cargar el formulario
            $.ajax({
                type: 'POST',
                data: {"token": token_actual.token, "modulo": "SICON-REPORTES-GENERALES"},
                url: url_pv + 'Convocatorias/modulo_buscador_propuestas'
            }).done(function (data) {
                if (data == 'error_metodo')
                {
                    notify("danger", "ok", "Convocatorias:", "Se registro un error en el método, comuníquese con la mesa de ayuda convocatorias@scrd.gov.co");
                } else
                {
                    if (data == 'error')
                    {
                        notify("danger", "ok", "Convocatorias:", "Por favor actualizar la página, debido a que su sesión caduco");
                    } else
                    {
                        if (data == 'acceso_denegado')
                        {
                            notify("danger", "remove", "Convocatorias:", "No tiene permisos para ver la información.");
                        } else
                        {
                            var json = JSON.parse(data);

                            $("#anio").append('<option value="">:: Seleccionar ::</option>');
                            if (json.anios.length > 0) {
                                $.each(json.anios, function (key, anio) {
                                    $("#anio").append('<option value="' + anio + '"  >' + anio + '</option>');
                                });
                            }
                        }
                    }
                }
            });

            $('#anio').change(function () {

                $("#reportes_propuestas").css("display", "none");
            });

            $('#buscar').click(function () {

                if ($("#anio").val() == "")
                {
                    notify("danger", "ok", "Propuestas:", "Debe seleccionar el año.");
                } else
                {
                    //Realizo la peticion para validar cargar las prouestas a subsanar
                    $.ajax({
                        type: 'POST',
                        data: {"token": token_actual.token, "modulo": "SICON-REPORTES-GENERALES", "anio": $("#anio").val()},
                        url: url_pv + 'Reportes/generar_reportes_generales'
                    }).done(function (data) {

                        if (data == 'error_metodo')
                        {
                            notify("danger", "ok", "Convocatorias:", "Se registro un error en el método, comuníquese con la mesa de ayuda convocatorias@scrd.gov.co");
                        } else
                        {
                            if (data == 'error')
                            {
                                notify("danger", "ok", "Convocatorias:", "Por favor actualizar la página, debido a que su sesión caduco");
                            } else
                            {
                                if (data == 'acceso_denegado')
                                {
                                    notify("danger", "remove", "Convocatorias:", "No tiene permisos para ver la información.");
                                } else
                                {

                                    var json = JSON.parse(data);

                                    $("#reporte_pn").empty();
                                    $("#reporte_inhabilidades_propuesta").empty();
                                    $(".fecha_actual").empty();

                                    if (json.error == 'error_metodo')
                                    {
                                        notify("danger", "ok", "Convocatorias:", "Se registro un error en el método, comuníquese con la mesa de ayuda convocatorias@scrd.gov.co");
                                    } else
                                    {
                                        if (json.error == 'error_token')
                                        {
                                            notify("danger", "ok", "Convocatorias:", "Por favor actualizar la página, debido a que su sesión caduco");
                                        } else
                                        {
                                            if (data == 'acceso_denegado')
                                            {
                                                notify("danger", "remove", "Convocatorias:", "No tiene permisos para ver la información.");
                                            } else
                                            {
                                                $("#reportes_propuestas").css("display", "block");

                                                $("#reporte_pn").html(json.reporte_pn);
                                                $("#reporte_inhabilidades_propuesta").html(json.reporte_inhabilidades_propuesta);
                                                $(".fecha_actual").html(json.fecha_actual);

                                                //Valido que sea solo numeros
                                                $('.input-number').on('input', function () {
                                                    this.value = this.value.replace(/[^0-9]/g, '');
                                                });

                                                $('#btn_pn').click(function () {
                                                    var numero_documento = $("#pn_numero_documento").val();
                                                    if (numero_documento == "")
                                                    {
                                                        notify("danger", "remove", "Reportes:", "Debe ingresar el número de documento.");
                                                    } else
                                                    {
                                                        $.AjaxDownloader({
                                                            url: url_pv_report + 'reporte_persona_natural_back.php',
                                                            data: {
                                                                nd: numero_documento,
                                                                anio: $("#anio").val(),
                                                                token: token_actual.token,
                                                                modulo: "SICON-PROPUESTAS-VERIFICACION"
                                                            }
                                                        });                                                                                                                
                                                    }
                                                });

                                                $('#btn_inhabilidades').click(function () {
                                                    var codigos = $("#inhabilidades_codigos").val();
                                                    $.AjaxDownloader({
                                                        url: url_pv_report + 'reporte_inhabilidades_propuestas_back.php',
                                                        data: {
                                                            codigos: codigos,
                                                            token: token_actual.token,
                                                            modulo: "SICON-PROPUESTAS-VERIFICACION"
                                                        }
                                                    });                                                    
                                                });
                                            }
                                        }
                                    }
                                }
                            }
                        }

                    });
                }
            });
        }
    }
});

