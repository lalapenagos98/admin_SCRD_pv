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
            permiso_lectura_keycloak(token_actual.token, "SICON-REPORTES-ENTIDADES");

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

            //Realizo la peticion para cargar el formulario
            $.ajax({
                type: 'POST',
                data: {"token": token_actual.token, "modulo": "SICON-REPORTES-ENTIDADES"},
                url: url_pv + 'Convocatorias/modulo_buscador_propuestas'
            }).done(function (data) {
                if (data == 'error_metodo')
                {
                    notify("danger", "ok", "Convocatorias:", "Se registro un error en el método, comuníquese con la mesa de ayuda convocatorias@scrd.gov.co");
                } else
                {
                    if (data == 'error')
                    {
                        location.href = url_pv_admin + 'index.html?msg=Su sesión ha expirado, por favor vuelva a ingresar.&msg_tipo=danger';
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

                            $("#entidad").append('<option value="">:: Seleccionar ::</option>');
                            if (json.entidades.length > 0) {
                                $.each(json.entidades, function (key, entidad) {
                                    $("#entidad").append('<option value="' + entidad.id + '"  >' + entidad.nombre + '</option>');
                                });
                            }

                            if (json.entidades.length > 0) {
                                //var selected;
                                $.each(json.estados_propuestas, function (key, estado_propuesta) {
                                    if (estado_propuesta.id != 7)
                                    {
                                        $("#estado_propuesta").append('<option value="' + estado_propuesta.id + '" >' + estado_propuesta.nombre + '</option>');
                                    }
                                });
                            }
                        }
                    }
                }
            });

            $('#entidad, #anio').change(function () {

                $("#reportes_propuestas").css("display", "none");
            });

            $('#buscar').click(function () {

                if ($("#anio").val() == "" || $("#entidad").val() == "")
                {
                    notify("danger", "ok", "Propuestas:", "Debe seleccionar el año y/o la entidad.");
                } else
                {
                    //Realizo la peticion para validar cargar las prouestas a subsanar
                    $.ajax({
                        type: 'POST',
                        data: {"token": token_actual.token, "modulo": "SICON-REPORTES-ENTIDADES", "anio": $("#anio").val(), "entidad": $("#entidad").val()},
                        url: url_pv + 'Reportes/generar_reportes_entidades'
                    }).done(function (data) {

                        if (data == 'error_entidad')
                        {
                            notify("danger", "remove", "Convocatorias:", "No tiene permisos para ver la información de la entidad seleccionada.");
                        } else
                        {

                            if (data == 'error_metodo')
                            {
                                notify("danger", "ok", "Convocatorias:", "Se registro un error en el método, comuníquese con la mesa de ayuda convocatorias@scrd.gov.co");
                            } else
                            {
                                if (data == 'error')
                                {
                                    location.href = url_pv_admin + 'index.html?msg=Su sesión ha expirado, por favor vuelva a ingresar.&msg_tipo=danger';
                                } else
                                {
                                    if (data == 'acceso_denegado')
                                    {
                                        notify("danger", "remove", "Convocatorias:", "No tiene permisos para ver la información.");
                                    } else
                                    {


                                        var json = JSON.parse(data);

                                        $("#reporte_propuestas_estados").empty();
                                        $("#reporte_convocatorias_cerrar").empty();
                                        $("#reporte_convocatorias_cantidad_jurados").empty();
                                        $("#reporte_convocatorias_listado_jurados").empty();
                                        $("#reporte_convocatorias_listado_participantes").empty();
                                        $("#reporte_linea_base_jurados").empty(); // 25-09-2020 WIlmer Gustavo Mogollón Duque Reporte línea base
                                        $("#reporte_ganadores").empty();
                                        $(".fecha_actual").empty();

                                        if (json.error == 'error_metodo')
                                        {
                                            notify("danger", "ok", "Convocatorias:", "Se registro un error en el método, comuníquese con la mesa de ayuda convocatorias@scrd.gov.co");
                                        } else
                                        {
                                            if (json.error == 'error_token')
                                            {
                                                location.href = url_pv_admin + 'index.html?msg=Su sesión ha expirado, por favor vuelva a ingresar.&msg_tipo=danger';
                                            } else
                                            {
                                                if (data == 'acceso_denegado')
                                                {
                                                    notify("danger", "remove", "Convocatorias:", "No tiene permisos para ver la información.");
                                                } else
                                                {
                                                    $("#reportes_propuestas").css("display", "block");

                                                    $("#reporte_propuestas_estados").html(json.reporte_propuestas_estados);
                                                    $("#reporte_convocatorias_cerrar").html(json.reporte_convocatorias_cerrar);
                                                    $("#reporte_convocatorias_cantidad_jurados").html(json.reporte_convocatorias_cantidad_jurados);
                                                    $("#reporte_convocatorias_listado_jurados").html(json.reporte_convocatorias_listado_jurados);
                                                    $("#reporte_convocatorias_listado_participantes").html(json.reporte_convocatorias_listado_participantes);
                                                    $("#reporte_linea_base_jurados").html(json.reporte_linea_base_jurados);   // 25-09-2020 Reporte de línea base jurados             
                                                    $("#reporte_ganadores").html(json.reporte_ganadores);

                                                    $(".fecha_actual").html(json.fecha_actual);

                                                    $('.reporte_convocatorias_listado_participantes').click(function () {
                                                        var json = JSON.parse($(this).attr("rel"));

                                                        $.AjaxDownloader({
                                                            data: json,
                                                            url: url_pv + 'ConvocatoriasFormatos/reporte_listado_entidades_convocatorias_listado_participantes_xls/'
                                                        });

                                                    });

                                                    $('.reporte_propuestas_estados_excel').click(function () {
                                                        var json = JSON.parse($(this).attr("rel"));

                                                        $.AjaxDownloader({
                                                            data: json,
                                                            url: url_pv + 'ConvocatoriasFormatos/reporte_listado_entidades_convocatorias_estado_xls/'
                                                        });

                                                    });

                                                    $('.reporte_convocatorias_cerrar_excel').click(function () {
                                                        var json = JSON.parse($(this).attr("rel"));

                                                        $.AjaxDownloader({
                                                            data: json,
                                                            url: url_pv + 'ConvocatoriasFormatos/reporte_convocatorias_cerrar_xls/'
                                                        });

                                                    });

                                                    $('.reporte_convocatorias_cantidad_jurados').click(function () {
                                                        var json = JSON.parse($(this).attr("rel"));

                                                        $.AjaxDownloader({
                                                            data: json,
                                                            url: url_pv + 'ConvocatoriasFormatos/reporte_listado_entidades_convocatorias_total_jurados_xls/'
                                                        });

                                                    });

                                                    $('.reporte_convocatorias_listado_jurados_btn').click(function () {
                                                        var json = JSON.parse($(this).attr("rel"));

                                                        $.AjaxDownloader({
                                                            data: json,
                                                            url: url_pv + 'ConvocatoriasFormatos/reporte_listado_entidades_convocatorias_listado_jurados_xls/'
                                                        });

                                                    });
                                                    /*
                                                     * 25-09-2020
                                                     * Wilmer Gustavo Mogollón Duque
                                                     * Se incorpora función para reporte de línea base de jurados
                                                     */
                                                    $('.reporte_linea_base_jurados_btn').click(function () {
                                                        var json = JSON.parse($(this).attr("rel"));

                                                        $.AjaxDownloader({
                                                            data: json,
                                                            url: url_pv + 'ConvocatoriasFormatos/reporte_linea_base_jurados_xls/'
                                                        });

                                                    });

                                                    $('.reporte_propuestas_ganadoras').click(function () {
                                                        var json = JSON.parse($(this).attr("rel"));

                                                        $.AjaxDownloader({
                                                            data: json,
                                                            url: url_pv + 'ConvocatoriasFormatos/reporte_ganadores_xls/'
                                                        });

                                                    });

                                                }
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