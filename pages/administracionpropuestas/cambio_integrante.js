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
            permiso_lectura_keycloak(token_actual.token, "SICON-PROPUESTAS-CAMBIO-INTEGRANTE");

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
                data: {"token": token_actual.token, "modulo": "SICON-PROPUESTAS-CAMBIO-INTEGRANTE"},
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

                if ($("#anio").val() == "")
                {
                    notify("danger", "ok", "Propuestas:", "Debe seleccionar el año");
                } else
                {
                    if ($("#entidad").val() != "")
                    {
                        $.ajax({
                            type: 'POST',
                            data: {"modulo": "SICON-PROPUESTAS-CAMBIO-INTEGRANTE", "token": token_actual.token, "anio": $("#anio").val(), "entidad": $("#entidad").val()},
                            url: url_pv + 'PropuestasCambioIntegrante/select_convocatorias'
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
                        data: {"modulo": "SICON-PROPUESTAS-CAMBIO-INTEGRANTE", "token": token_actual.token, "conv": $("#convocatoria").val()},
                        url: url_pv + 'PropuestasCambioIntegrante/select_categorias'
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
                    
                    $.ajax({
                        type: 'POST',
                        data: {"modulo": "SICON-PROPUESTAS-CAMBIO-INTEGRANTE", "token": token_actual.token, "conv": $("#convocatoria").val()},
                        url: url_pv + 'PropuestasCambioIntegrante/select_propuestas'
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

                                    $('#propuestas').find('option').remove();
                                    $("#propuestas").append('<option value="">:: Seleccionar ::</option>');
                                    $.each(json, function (key, value) {
                                        $("#propuestas").append('<option value="' + value.id + '">' + value.nombre + '</option>');
                                    });
                                    
                                    $("#propuestas").selectpicker('refresh');
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
                        $("#panel_periodo_actual").css("display", "none");
                        notify("danger", "ok", "Convocatorias:", "Debe seleccionar la " + mensaje + ".");
                    } else
                    {
                        
                        if ($("#propuestas").val() == "")
                        {
                            $("#panel_periodo_actual").css("display", "none");
                            notify("danger", "ok", "Convocatorias:", "Debe seleccionar la propuesta.");
                        } else
                        {            
                            //Cargar datos en la tabla actual
                            cargar_tabla(token_actual);
                        }
                    }

                } else
                {
                    $("#panel_periodo_actual").css("display", "none");
                    notify("danger", "ok", "Propuestas:", "Debe seleccionar la convocatoria");
                }

            });

            $('#enviar_notificaciones').click(function () {

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
                        //Realizo la peticion para enviar las notificaciones
                        $.ajax({
                            type: 'POST',
                            data: {"token": token_actual.token},
                            url: url_pv + 'PropuestasCambioIntegrante/enviar_notificaciones/' + $("#id_convocatoria").val()
                        }).done(function (data) {

                            if (data == 'error_metodo')
                            {
                                notify("danger", "ok", "Convocatorias:", "Se registro un error en el método, comuníquese con la mesa de ayuda convocatorias@scrd.gov.co");
                            } else
                            {
                                if (data == 'error_token')
                                {
                                    location.href = url_pv_admin + 'index.html?msg=Su sesión ha expirado, por favor vuelva a ingresar.&msg_tipo=danger';
                                } else
                                {
                                    if (data == 'error_fecha_cierre')
                                    {
                                        notify("danger", "ok", "Convocatorias:", "La convocatoria no se encuentra disponible para ver las propuestas inscritas.");
                                    } else
                                    {
                                        if (data == 'error_envio')
                                        {
                                            notify("danger", "ok", "Subsanación:", "En algunas propuesta reporta error de envió de notificación, comuníquese con la mesa de ayuda convocatorias@scrd.gov.co");
                                        } else
                                        {
                                            if (data == 'ingresar')
                                            {
                                                notify("success", "ok", "Subsanación:", "Se envia las notificaciones con éxito.");
                                                $('#table_list').DataTable().draw();

                                            } else
                                            {
                                                notify("danger", "ok", "Convocatorias:", "Se registro un error en el método, comuníquese con la mesa de ayuda convocatorias@scrd.gov.co");
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

function cargar_tabla(token_actual) {
    $('#table_list').DataTable({
        "language": {
            "url": "../../dist/libraries/datatables/js/spanish.json"
        },
        "processing": true,
        "destroy": true,
        "serverSide": true,
        "ordering": false,
        "searching": false,
        "bLengthChange": false,
        "ajax": {
            url: url_pv + "PropuestasCambioIntegrante/cargar_tabla_integrantes_cambio",
            data: {"token": token_actual.token, "modulo": "SICON-PROPUESTAS-CAMBIO-INTEGRANTE", "p": $("#propuestas").val()},
            type: "POST"
        },
        "drawCallback": function (settings) {
            $(".check_activar_t").attr("checked", "true");
            $(".check_activar_f").removeAttr("checked");
            //Cargo el formulario, para crear o editar
            cargar_formulario(token_actual);
        },
        "columns": [
            {"data": "tipo_documento"},
            {"data": "numero_documento"},
            {"data": "primer_nombre"},
            {"data": "segundo_nombre"},
            {"data": "primer_apellido"},
            {"data": "segundo_apellido"},
            {"data": "representante"},
            {"data": "rol"},
            {"data": "estado_cambio_integrante"},
            {"data": "acciones"}
        ],
        "columnDefs": [{
                "targets": 6,
                "render": function (data, type, row, meta) {
                    if ($("#tipo").val() == "EquipoTrabajo")
                    {
                        if (row.director == true)
                        {
                            row.director = "<b>Sí</b>";
                        } else
                        {
                            row.director = "No";
                        }
                        return row.director;
                    } else
                    {
                        if (row.representante == true)
                        {
                            row.representante = "<b>Principal</b>";
                        }

                        if (row.estado_cambio_integrante == null)
                        {
                            row.estado_cambio_integrante = 'Sin iniciar';
                        }

                        if (row.representante_suplente == true)
                        {
                            row.representante = "<b>Suplente</b>";
                        }

                        if (row.representante == false && row.representante_suplente == false)
                        {
                            row.representante = "<b>No aplica</b>";
                        }


                        return row.representante;
                    }
                }
            }
        ]
    });
}

