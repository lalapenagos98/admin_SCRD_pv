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
            permiso_lectura_keycloak(token_actual.token, "SICON-REPORTES-CONVOCATORIAS");

            //Cargamos el menu principal
            $.ajax({
                type: 'POST',
                data: {"token": token_actual.token, "id": getURLParameter('id'), "m": getURLParameter('m'), "p": getURLParameter('p'), "sub": getURLParameter('sub')},
                url: url_pv + 'Administrador/menu'
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
                data: {"token": token_actual.token, "modulo": "SICON-REPORTES-CONVOCATORIAS"},
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

                $("#categoria option[value='']").prop('selected', true);
                $("#convocatoria option[value='']").prop('selected', true);
                $("#categoria").attr("disabled", "disabled");

                $("#reportes_propuestas").css("display", "none");

                if ($("#anio").val() == "")
                {
                    notify("danger", "ok", "Propuestas:", "Debe seleccionar el año");
                } else
                {
                    if ($("#entidad").val() != "")
                    {
                        $.ajax({
                            type: 'POST',
                            data: {"modulo": "SICON-REPORTES-CONVOCATORIAS", "token": token_actual.token, "anio": $("#anio").val(), "entidad": $("#entidad").val()},
                            url: url_pv + 'Reportes/select_convocatorias'
                        }).done(function (data) {
                            if (data == 'error_metodo')
                            {
                                notify("danger", "ok", "Usuarios:", "Se registro un error en el método, comuníquese con la mesa de ayuda convocatorias@scrd.gov.co");
                            } else
                            {
                                if (data == 'error_token')
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

                                        $('#convocatoria').find('option').remove();
                                        $("#convocatoria").append('<option value="">:: Seleccionar ::</option>');
                                        $.each(json, function (key, value) {
                                            $("#convocatoria").append('<option dir="' + value.tiene_categorias + '" lang="' + value.diferentes_categorias + '" value="' + value.id + '">' + value.nombre + '</option>');
                                        });

                                        $("#convocatoria").selectpicker('refresh');

                                    }
                                }
                            }
                        });
                    }
                }

            });

            $('#convocatoria').change(function () {

                $("#reportes_propuestas").css("display", "none");

                if ($("#convocatoria option:selected").attr("dir") == "true")
                {
                    $("#categoria").removeAttr("disabled")
                } else
                {
                    $("#categoria").attr("disabled", "disabled");
                }

                if ($("#convocatoria").val() != "")
                {
                    $.ajax({
                        type: 'POST',
                        data: {"modulo": "SICON-REPORTES-CONVOCATORIAS", "token": token_actual.token, "conv": $("#convocatoria").val()},
                        url: url_pv + 'Reportes/select_categorias'
                    }).done(function (data) {
                        if (data == 'error_metodo')
                        {
                            notify("danger", "ok", "Usuarios:", "Se registro un error en el método, comuníquese con la mesa de ayuda convocatorias@scrd.gov.co");
                        } else
                        {
                            if (data == 'error_token')
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

                                    $('#categoria').find('option').remove();
                                    $("#categoria").append('<option value="">:: Seleccionar ::</option>');
                                    $.each(json, function (key, value) {
                                        $("#categoria").append('<option value="' + value.id + '">' + value.nombre + '</option>');
                                    });
                                }
                            }
                        }
                    });
                }

            });

            $('#buscar').click(function () {

                if ($("#convocatoria").val() != "")
                {

                    var mensaje;
                    if ($("#convocatoria option:selected").attr("dir") == "true")
                    {
                        $("#id_convocatoria").val($("#categoria").val());
                        mensaje = "categoría";

                    } else
                    {
                        $("#id_convocatoria").val($("#convocatoria").val());
                        mensaje = "convocatoria";
                    }

                    if ($("#id_convocatoria").val() == "")
                    {
                        notify("danger", "ok", "Convocatorias:", "Debe seleccionar la " + mensaje + ".");
                    } else
                    {
                        //Realizo la peticion para validar cargar las prouestas a subsanar
                        $.ajax({
                            type: 'POST',
                            data: {"token": token_actual.token, "modulo": "SICON-REPORTES-CONVOCATORIAS", "convocatoria": $("#id_convocatoria").val(), "entidad": $("#entidad").val(), "anio": $("#anio").val()},
                            url: url_pv + 'Reportes/generar_reportes'
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
                                            $("#reporte_propuestas_participantes").empty();
                                            $("#reporte_convocatorias_listado_contratistas").empty();
                                            $("#reporte_convocatorias_listado_no_inscritas").empty();
                                            $("#reporte_convocatorias_listado_inscritas_pdac").empty();
                                            $("#reporte_jurados_postulados").empty();//20-07-2020 -- Jurados postulados
                                            $("#reporte_evaluacion_jurados").empty();//11-08-2020 -- Evaluación de Jurados postulados
                                            $("#reporte_convocatorias_listado_participantes").empty();
                                            $(".fecha_actual").empty();

                                            var reporte_propuestas_estados = Morris.Bar({
                                                element: 'reporte_propuestas_estados',
                                                xkey: 'device',
                                                ykeys: ['geekbench'],
                                                labels: ['Total'],
                                                barRatio: 0.4,
                                                xLabelAngle: 35,
                                                hideHover: 'auto'
                                            });

                                            var reporte_propuestas_participantes = Morris.Bar({
                                                element: 'reporte_propuestas_participantes',
                                                xkey: 'device',
                                                ykeys: ['geekbench'],
                                                labels: ['Total'],
                                                barRatio: 0.4,
                                                xLabelAngle: 35,
                                                hideHover: 'auto'
                                            });

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

                                                        $(".fecha_actual").html(json.fecha_actual);

                                                        reporte_propuestas_estados.setData(json.reporte_propuestas_estados);

                                                        reporte_propuestas_participantes.setData(json.reporte_propuestas_participantes);

                                                        $("#reporte_convocatorias_listado_contratistas").html(json.reporte_convocatorias_listado_contratistas);

                                                        $("#reporte_convocatorias_listado_no_inscritas").html(json.reporte_convocatorias_listado_no_inscritas);

                                                        $("#reporte_convocatorias_listado_inscritas_pdac").html(json.reporte_convocatorias_listado_inscritas_pdac);

                                                        $("#reporte_jurados_postulados").html(json.reporte_jurados_postulados);

                                                        $("#reporte_evaluacion_jurados").html(json.reporte_evaluacion_jurados);//11-08-2020 Reporte de evaluación jurados

                                                        $("#reporte_convocatorias_listado_participantes").html(json.reporte_convocatorias_listado_participantes);


                                                        $("#reporte_planillas_evaluacion").html(json.reporte_planillas_evaluacion);


                                                        $('.reporte_convocatorias_listado_contratistas').click(function () {
                                                            var json = JSON.parse($(this).attr("rel"));

                                                            $.AjaxDownloader({
                                                                data: json,
                                                                url: url_pv + 'ConvocatoriasFormatos/reporte_listado_entidades_convocatorias_listado_contratistas_xls/'
                                                            });

                                                        });

                                                        $('.reporte_convocatorias_listado_no_inscritas').click(function () {
                                                            var json = JSON.parse($(this).attr("rel"));

                                                            $.AjaxDownloader({
                                                                data: json,
                                                                url: url_pv + 'ConvocatoriasFormatos/reporte_listado_entidades_convocatorias_no_inscritas_xls/'
                                                            });

                                                        });

                                                        $('.reporte_convocatorias_listado_inscritas_pdac').click(function () {
                                                            var json = JSON.parse($(this).attr("rel"));

                                                            $.AjaxDownloader({
                                                                data: json,
                                                                url: url_pv + 'ConvocatoriasFormatos/reporte_convocatorias_listado_inscritas_pdac_xls/'
                                                            });

                                                        });



                                                        $('.reporte_convocatorias_listado_participantes').click(function () {
                                                            var json = JSON.parse($(this).attr("rel"));

                                                            $.AjaxDownloader({
                                                                data: json,
                                                                url: url_pv + 'ConvocatoriasFormatos/reporte_listado_entidades_convocatorias_listado_participantes_xls/'
                                                            });

                                                        });

                                                        $('#btn_planillas').click(function () {
                                                            var ronda = $("#ronda").val();
                                                            var deliberacion = $("#deliberacion").val();
                                                            var codigos = $("#codigos").val();
                                                            if (ronda == "")
                                                            {
                                                                notify("danger", "remove", "Reportes:", "Debe seleccionar una ronda.");
                                                            } else
                                                            {
                                                                window.open(url_pv_report + 'reporte_planillas_evaluacion.php?ronda=' + ronda + '&deliberacion=' + deliberacion + '&codigos=' + codigos, '_blank');
                                                            }
                                                        });

                                                        /*
                                                         * 20-07-2020
                                                         * Wilmer Gustavo Mogollón Duque
                                                         */
                                                        $('.reporte_jurados_postulados').click(function () {

                                                            var convocatoria = $("#convocatoria").val();

                                                            window.open(url_pv_report + 'reporte_jurados_postulados.php?convocatoria=' + convocatoria, '_blank');


                                                        });

                                                        /*
                                                         * 11-08-2020
                                                         * Wilmer Gustavo Mogollón Duque
                                                         */
                                                        $('.reporte_evaluacion_jurados').click(function () {

                                                            var convocatoria = $("#convocatoria").val();

                                                            window.open(url_pv_report + 'reporte_evaluacion_jurados.php?convocatoria=' + convocatoria, '_blank');


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

                } else
                {
                    notify("danger", "ok", "Propuestas:", "Debe seleccionar la convocatoria");
                }

            });
        }
    }
});