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
                    notify("danger", "ok", "Convocatorias:", "Por favor actualizar la página, debido a que su sesión caduco");
                } else
                {
                    $("#menu_principal").html(result);
                }
            });

            //Realizo la peticion para cargar el formulario
            $.ajax({
                type: 'POST',
                data: {"token": token_actual.token, "modulo": "SICON-AJUSTAR-INTEGRANTES"},
                url: url_pv + 'Convocatorias/modulo_buscador_propuestas'
            }).done(function (data) {
                if (data == 'error_metodo')
                {
                    notify("danger", "ok", "Convocatorias:", "Se registro un error en el método, comuníquese con la mesa de ayuda convocatorias@scrd.gov.co");
                } else
                {
                    if (data == 'error_token')
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

                            $("#entidad").append('<option value="">:: Seleccionar ::</option>');
                            if (json.entidades.length > 0) {
                                $.each(json.entidades, function (key, entidad) {
                                    $("#entidad").append('<option value="' + entidad.id + '"  >' + entidad.nombre + '</option>');
                                });
                            }

                            if (json.entidades.length > 0) {
                                //var selected;
                                $.each(json.estados_propuestas, function (key, estado_propuesta) {
                                    if (estado_propuesta.id != 7 && estado_propuesta.id != 20)
                                    {
                                        $("#estado_propuesta").append('<option value="' + estado_propuesta.id + '" >' + estado_propuesta.nombre + '</option>');
                                    }
                                });
                            }
                        }
                    }
                }
            });

            $('#buscar').click(function () {

                if ($("#codigo").val() != "")
                {

                    if ($("#busqueda").val() == "0")
                    {
                        //Cargar datos en la tabla actual
                        $('#table_list').DataTable({
                            "language": {
                                "url": "../../dist/libraries/datatables/js/spanish.json"
                            },
                            "searching": false,
                            "processing": true,
                            "serverSide": true,
                            "ordering": false,
                            "lengthMenu": [50, 75, 100],
                            "ajax": {
                                url: url_pv + "PropuestasJuntasAgrupaciones/buscar_propuestas",
                                data: function (d) {
                                    var params = new Object();
                                    params.anio = $('#anio').val();
                                    params.entidad = $('#entidad').val();
                                    params.convocatoria = $("#id_convocatoria").val();
                                    params.categoria = $('#categoria').val();
                                    params.codigo = $('#codigo').val();
                                    params.estado = $('#estado_propuesta').val();
                                    d.params = JSON.stringify(params);
                                    d.token = token_actual.token;
                                    d.modulo = "SICON-AJUSTAR-INTEGRANTES";
                                },
                                type: "POST"
                            },
                            "columnDefs": [{
                                    "targets": 0,
                                    "render": function (data, type, row, meta) {
                                        //Verificar cual es la categoria padre
                                        var categoria = row.convocatoria;
                                        if (row.categoria != null) {
                                            row.convocatoria = row.categoria;
                                            row.categoria = categoria;
                                        }
                                        return row.estado;
                                    }
                                }
                            ],
                            "columns": [
                                {"data": "estado"},
                                {"data": "anio"},
                                {"data": "entidad"},
                                {"data": "convocatoria"},
                                {"data": "categoria"},
                                {"data": "propuesta"},
                                {"data": "codigo"},
                                {"data": "participante"},
                                {"data": "ver_propuesta"},
                                {"data": "ver_reporte"}
                            ]
                        });

                        $("#busqueda").attr("value", "1");
                    } else
                    {
                        $('#table_list').DataTable().draw();
                    }
                } else
                {
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
                            //Realizo la peticion para validar acceso a la convocatoria
                            $.ajax({
                                type: 'POST',
                                data: {"token": token_actual.token},
                                url: url_pv + 'PropuestasJuntasAgrupaciones/validar_acceso/' + $("#id_convocatoria").val()
                            }).done(function (data) {
                                if (data == 'error_metodo')
                                {
                                    notify("danger", "ok", "Convocatorias:", "Se registro un error en el método, comuníquese con la mesa de ayuda convocatorias@scrd.gov.co");
                                } else
                                {
                                    if (data == 'error_token')
                                    {
                                        notify("danger", "ok", "Convocatorias:", "Por favor actualizar la página, debido a que su sesión caduco");
                                    } else
                                    {
                                        if (data == 'error_fecha_cierre')
                                        {
                                            notify("danger", "ok", "Convocatorias:", "La convocatoria no se encuentra disponible para ver las propuestas inscritas.");
                                        } else
                                        {
                                            if (data == 'ingresar')
                                            {
                                                if ($("#busqueda").val() == "0")
                                                {
                                                    //Cargar datos en la tabla actual
                                                    $('#table_list').DataTable({
                                                        "language": {
                                                            "url": "../../dist/libraries/datatables/js/spanish.json"
                                                        },
                                                        "searching": false,
                                                        "processing": true,
                                                        "serverSide": true,
                                                        "ordering": false,
                                                        "lengthMenu": [50, 75, 100],
                                                        "ajax": {
                                                            url: url_pv + "PropuestasJuntasAgrupaciones/buscar_propuestas",
                                                            data: function (d) {
                                                                var params = new Object();
                                                                params.anio = $('#anio').val();
                                                                params.entidad = $('#entidad').val();
                                                                params.convocatoria = $("#id_convocatoria").val();
                                                                params.categoria = $('#categoria').val();
                                                                params.codigo = $('#codigo').val();
                                                                params.estado = $('#estado_propuesta').val();
                                                                d.params = JSON.stringify(params);
                                                                d.token = token_actual.token;
                                                                d.modulo = "SICON-AJUSTAR-INTEGRANTES";
                                                            },
                                                            type: "POST"
                                                        },
                                                        "columnDefs": [{
                                                                "targets": 0,
                                                                "render": function (data, type, row, meta) {
                                                                    //Verificar cual es la categoria padre
                                                                    var categoria = row.convocatoria;
                                                                    if (row.categoria != null) {
                                                                        row.convocatoria = row.categoria;
                                                                        row.categoria = categoria;
                                                                    }
                                                                    return row.estado;
                                                                }
                                                            }
                                                        ],
                                                        "columns": [
                                                            {"data": "estado"},
                                                            {"data": "anio"},
                                                            {"data": "entidad"},
                                                            {"data": "convocatoria"},
                                                            {"data": "categoria"},
                                                            {"data": "propuesta"},
                                                            {"data": "codigo"},
                                                            {"data": "participante"},
                                                            {"data": "ver_propuesta"},
                                                            {"data": "ver_reporte"}
                                                        ]
                                                    });

                                                    $("#busqueda").attr("value", "1");
                                                } else
                                                {
                                                    $('#table_list').DataTable().draw();
                                                }
                                            } else
                                            {
                                                notify("danger", "ok", "Convocatorias:", "Se registro un error en el método, comuníquese con la mesa de ayuda convocatorias@scrd.gov.co");
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
                }

            });

            $('#entidad, #anio').change(function () {

                $("#categoria option[value='']").prop('selected', true);
                $("#convocatoria option[value='']").prop('selected', true);
                $("#categoria").attr("disabled", "disabled");

                if ($("#anio").val() == "")
                {
                    notify("danger", "ok", "Propuestas:", "Debe seleccionar el año");
                } else
                {
                    if ($("#entidad").val() != "")
                    {
                        $.ajax({
                            type: 'POST',
                            data: {"modulo": "SICON-AJUSTAR-INTEGRANTES", "token": token_actual.token, "anio": $("#anio").val(), "entidad": $("#entidad").val()},
                            url: url_pv + 'PropuestasJuntasAgrupaciones/select_convocatorias'
                        }).done(function (data) {
                            if (data == 'error_metodo')
                            {
                                notify("danger", "ok", "Usuarios:", "Se registro un error en el método, comuníquese con la mesa de ayuda convocatorias@scrd.gov.co");
                            } else
                            {
                                if (data == 'error_token')
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
                        data: {"modulo": "SICON-AJUSTAR-INTEGRANTES", "token": token_actual.token, "conv": $("#convocatoria").val()},
                        url: url_pv + 'PropuestasJuntasAgrupaciones/select_categorias'
                    }).done(function (data) {
                        if (data == 'error_metodo')
                        {
                            notify("danger", "ok", "Usuarios:", "Se registro un error en el método, comuníquese con la mesa de ayuda convocatorias@scrd.gov.co");
                        } else
                        {
                            if (data == 'error_token')
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

        }
    }
});

function certificado(id, programa) {
    var url = "reporte_propuesta_inscrita_back.php";
    if (programa === 2) {
        url = "reporte_propuesta_inscrita_pdac_back.php";
    }

    var token_actual = JSON.parse(JSON.stringify(keycloak));

    $.AjaxDownloader({
        url: url_pv_report + url,
        data: {
            id: id,
            token: token_actual.token,
            modulo: "SICON-PROPUESTAS-VERIFICACION"
        }
    });

}