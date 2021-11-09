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
            permiso_lectura_keycloak(token_actual.token, "SICON-PROPUESTAS-VALIDAR");

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
                data: {"token": token_actual.token, "modulo": "SICON-PROPUESTAS-VALIDAR"},
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
                                    //21	Por Subsanar
                                    //23	Rechazada
                                    //24	Habilitada
                                    //33	Recomendada como Ganadora
                                    //34	Ganadora
                                    //44	No Ganadora
                                    if (
                                            estado_propuesta.id == 21 ||
                                            estado_propuesta.id == 23 ||
                                            estado_propuesta.id == 24 ||
                                            estado_propuesta.id == 33 ||
                                            estado_propuesta.id == 34 ||
                                            estado_propuesta.id == 44)
                                    {
                                        $("#estado_propuesta").append('<option value="' + estado_propuesta.id + '" >' + estado_propuesta.nombre + '</option>');
                                    }
                                });
                            }
                        }
                    }
                }
            });

            $('.close').click(function () {
                $("#contratistas").css("display", "none");
                $("#boton_confirma_administrativa_1").removeAttr("disabled");
            });

            $('#buscar').click(function () {

                if ($("#codigo").val() != "")
                {
                    if ($("#busqueda").val() == "0")
                    {
                        //Cargar datos en la tabla actual
                        cargar_tabla(token_actual);

                        $("#busqueda").attr("value", "1");
                    } else
                    {
                        $('#table_list').DataTable().draw();
                    }
                } else
                {
                    $('#table_list').DataTable().ajax.reload( null, false ); 
                }
            } else
            {
                if ($("#convocatoria").val() != "")
                {

                    var mensaje;
                    if ($("#convocatoria option:selected").attr("dir") == "true")
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
                                url: url_pv + 'PropuestasValidar/validar_acceso/' + $("#id_convocatoria").val()
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
                                            if (data == 'ingresar')
                                            {
                                                if ($("#busqueda").val() == "0")
                                                {
                                                    //Cargar datos en la tabla actual
                                                    cargar_tabla(token_actual);

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
                            data: {"modulo": "SICON-PROPUESTAS-VALIDAR", "token": token_actual.token, "anio": $("#anio").val(), "entidad": $("#entidad").val()},
                            url: url_pv + 'PropuestasValidar/select_convocatorias'
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

                                                $("#busqueda").attr("value", "1");
                                            } else
                                            {
                                                $('#table_list').DataTable().ajax.reload( null, false ); 
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
                        data: {"modulo": "SICON-PROPUESTAS-VALIDAR", "token": token_actual.token, "conv": $("#convocatoria").val()},
                        url: url_pv + 'PropuestasValidar/select_categorias'
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

            $("#boton_rechazo_verificacion_1_administrativa").click(function () {
                $('#modal_rechazo_verificacion_1_administrativa').modal('hide');
                $('#modal_confirmar_administrativa_1').modal('show');
            });

            $("#boton_rechazo_verificacion_1_tecnica").click(function () {
                $('#modal_rechazo_verificacion_1_tecnica').modal('hide');
                $('#modal_confirmar_tecnica_1').modal('show');
            });

            $("#boton_confirmar_administrativa_1").click(function () {
                $('#modal_confirmar_administrativa_1').modal('hide');
                guardar_confirmacion(token_actual, $("#estado_actual_propuesta").val(), $("#tipo_verificacion").val());
            });

            $("#boton_confirmar_tecnica_1").click(function () {
                $('#modal_confirmar_tecnica_1').modal('hide');
                guardar_confirmacion(token_actual, $("#estado_actual_propuesta").val(), $("#tipo_verificacion").val());
            });


            $("#boton_confirma_administrativa_1").click(function () {
                $("#numero_verificacion").val('');

                //Valido que todos los documentos administrativos ya estan validados
                var requisitos_administrativos = $('#doc_administrativos_verificacion_1 .validar_administrativos:hidden[value=""]').toArray().length;
                if (requisitos_administrativos <= 0)
                {
                    //Se realiza la validacion con el fin de determinar la propuesta si se rechaza, 
                    //por subsanar o se deja igual
                    var propuesta = $("#propuesta").val();
                    var verificacion = 1;
                    $("#numero_verificacion").val(verificacion);
                    $.ajax({
                        type: 'POST',
                        url: url_pv + 'PropuestasValidar/valida_verificacion',
                        data: {"token": token_actual.token, "modulo": "SICON-PROPUESTAS-VALIDAR", "propuesta": propuesta, "verificacion": verificacion, "tipo_requisito": "Administrativos"},
                    }).done(function (result) {

                        if (result == 'error_metodo')
                        {
                            notify("danger", "ok", "Validar propuestas:", "Se registro un error en el método, comuníquese con la mesa de ayuda convocatorias@scrd.gov.co");
                        } else
                        {
                            if (result == 'error_token')
                            {
                                location.href = url_pv_admin + 'index.html?msg=Su sesión ha expirado, por favor vuelva a ingresar.&msg_tipo=danger';
                            } else
                            {
                                if (result == 'acceso_denegado')
                                {
                                    notify("danger", "remove", "Usuario:", "No tiene permisos para editar información.");
                                } else
                                {
                                    if (result == 'crear_propuesta')
                                    {
                                        notify("danger", "remove", "Validar propuestas:", "El código de la propuesta no es valido.");
                                    } else
                                    {
                                        if (result == 'error')
                                        {
                                            notify("danger", "ok", "Validar propuestas:", "Se registro un error al crear, comuníquese con la mesa de ayuda convocatorias@scrd.gov.co");
                                        } else
                                        {

                                            if (result == 'rechazar')
                                            {
                                                $('#modal_rechazo_verificacion_1_administrativa').modal('show');
                                                $("#estado_actual_propuesta").val("rechazar");
                                            }

                                            if (result == 'subsanar')
                                            {
                                                $('#modal_confirmar_administrativa_1').modal('show');
                                                $("#estado_actual_propuesta").val("subsanar");
                                                $("#tipo_verificacion").val("administrativa");
                                            }

                                            if (result == 'confirmar')
                                            {
                                                $('#modal_confirmar_administrativa_1').modal('show');
                                                $("#estado_actual_propuesta").val("confirmar");
                                                $("#tipo_verificacion").val("administrativa");
                                            }
                                        }
                                    }
                                }
                            }
                        }

                    });
                } else
                {
                    notify("info", "ok", "Validar propuestas:", "Para poder continuar debe verificar todos los documentos administrativos.");
                }

            });

            $("#boton_confirma_administrativa_2").click(function () {
                $("#numero_verificacion").val('');
                //Valido que todos los documentos administrativos ya estan validados
                var requisitos_administrativos = $('#doc_administrativos_verificacion_2 .validar_administrativos:hidden[value=""]').toArray().length;
                if (requisitos_administrativos <= 0)
                {
                    //Se realiza la validacion con el fin de determinar la propuesta si se rechaza, 
                    //por subsanar o se deja igual
                    var propuesta = $("#propuesta").val();
                    var verificacion = 2;
                    $("#numero_verificacion").val(verificacion);
                    $.ajax({
                        type: 'POST',
                        url: url_pv + 'PropuestasValidar/valida_verificacion',
                        data: {"token": token_actual.token, "modulo": "SICON-PROPUESTAS-VALIDAR", "propuesta": propuesta, "verificacion": verificacion, "tipo_requisito": "Administrativos"},
                    }).done(function (result) {

                        if (result == 'error_metodo')
                        {
                            notify("danger", "ok", "Validar propuestas:", "Se registro un error en el método, comuníquese con la mesa de ayuda convocatorias@scrd.gov.co");
                        } else
                        {
                            if (result == 'error_token')
                            {
                                location.href = url_pv_admin + 'index.html?msg=Su sesión ha expirado, por favor vuelva a ingresar.&msg_tipo=danger';
                            } else
                            {
                                if (result == 'acceso_denegado')
                                {
                                    notify("danger", "remove", "Usuario:", "No tiene permisos para editar información.");
                                } else
                                {
                                    if (result == 'crear_propuesta')
                                    {
                                        notify("danger", "remove", "Validar propuestas:", "El código de la propuesta no es valido.");
                                    } else
                                    {
                                        if (result == 'error')
                                        {
                                            notify("danger", "ok", "Validar propuestas:", "Se registro un error al crear, comuníquese con la mesa de ayuda convocatorias@scrd.gov.co");
                                        } else
                                        {

                                            if (result == 'rechazar')
                                            {
                                                $('#modal_rechazo_verificacion_1_administrativa').modal('show');
                                                $("#estado_actual_propuesta").val("rechazar");
                                            }

                                            if (result == 'confirmar')
                                            {
                                                $('#modal_confirmar_administrativa_1').modal('show');
                                                $("#estado_actual_propuesta").val("confirmar");
                                                $("#tipo_verificacion").val("administrativa");
                                            }

                                            if (result == 'cumple')
                                            {
                                                $('#modal_confirmar_administrativa_1').modal('show');
                                                $("#estado_actual_propuesta").val("cumple");
                                                $("#tipo_verificacion").val("administrativa");
                                            }
                                        }
                                    }
                                }
                            }
                        }

                    });
                } else
                {
                    notify("info", "ok", "Validar propuestas:", "Para poder continuar debe verificar todos los documentos administrativos.");
                }

            });

            $("#boton_confirma_tecnica_1").click(function () {
                $("#numero_verificacion").val('');

                var requisitos_tecnicos = $('#doc_tecnicos_verificacion_1 .validar_tecnicos:hidden[value=""]').toArray().length;

                if (requisitos_tecnicos <= 0)
                {
                    //Se realiza la validacion con el fin de determinar la propuesta si se rechaza, 
                    //por subsanar o se deja igual
                    var propuesta = $("#propuesta").val();
                    var verificacion = 1;
                    $("#numero_verificacion").val(verificacion);
                    $.ajax({
                        type: 'POST',
                        url: url_pv + 'PropuestasValidar/valida_verificacion',
                        data: {"token": token_actual.token, "modulo": "SICON-PROPUESTAS-VALIDAR", "propuesta": propuesta, "verificacion": verificacion, "tipo_requisito": "Tecnicos"},
                    }).done(function (result) {

                        if (result == 'error_metodo')
                        {
                            notify("danger", "ok", "Validar propuestas:", "Se registro un error en el método, comuníquese con la mesa de ayuda convocatorias@scrd.gov.co");
                        } else
                        {
                            if (result == 'error_token')
                            {
                                location.href = url_pv_admin + 'index.html?msg=Su sesión ha expirado, por favor vuelva a ingresar.&msg_tipo=danger';
                            } else
                            {
                                if (result == 'acceso_denegado')
                                {
                                    notify("danger", "remove", "Usuario:", "No tiene permisos para editar información.");
                                } else
                                {
                                    if (result == 'crear_propuesta')
                                    {
                                        notify("danger", "remove", "Validar propuestas:", "El código de la propuesta no es valido.");
                                    } else
                                    {
                                        if (result == 'error')
                                        {
                                            notify("danger", "ok", "Validar propuestas:", "Se registro un error al crear, comuníquese con la mesa de ayuda convocatorias@scrd.gov.co");
                                        } else
                                        {

                                            if (result == 'rechazar')
                                            {
                                                $('#modal_rechazo_verificacion_1_tecnica').modal('show');
                                                $("#estado_actual_propuesta").val("rechazar");
                                                $("#tipo_verificacion").val("tecnica");
                                            }

                                            if (result == 'subsanar')
                                            {
                                                $('#modal_confirmar_tecnica_1').modal('show');
                                                $("#estado_actual_propuesta").val("subsanar");
                                                $("#tipo_verificacion").val("tecnica");
                                            }

                                            if (result == 'confirmar')
                                            {
                                                $('#modal_confirmar_tecnica_1').modal('show');
                                                $("#estado_actual_propuesta").val("habilitada");
                                                $("#tipo_verificacion").val("tecnica");
                                            }
                                        }
                                    }
                                }
                            }
                        }

                    });
                } else
                {
                    notify("info", "ok", "Validar propuestas:", "Para poder continuar debe verificar todos los documentos técnicos.");
                }

            });

        }
    }
});

function guardar_confirmacion(token_actual, estado_actual_propuesta, tipo_verificacion) {

    var propuesta = $("#propuesta").val();

    $.ajax({
        type: 'POST',
        url: url_pv + 'PropuestasValidar/guardar_confirmacion',
        data: {"token": token_actual.token, "modulo": "SICON-PROPUESTAS-VALIDAR", "propuesta": propuesta, "estado_actual_propuesta": estado_actual_propuesta, "tipo_verificacion": tipo_verificacion, "verificacion": $("#numero_verificacion").val()},
    }).done(function (result) {

        if (result == 'error_metodo')
        {
            notify("danger", "ok", "Validar propuestas:", "Se registro un error en el método, comuníquese con la mesa de ayuda convocatorias@scrd.gov.co");
        } else
        {
            if (result == 'error_token')
            {
                location.href = url_pv_admin + 'index.html?msg=Su sesión ha expirado, por favor vuelva a ingresar.&msg_tipo=danger';
            } else
            {
                if (result == 'acceso_denegado')
                {
                    notify("danger", "remove", "Usuario:", "No tiene permisos para editar información.");
                } else
                {
                    if (result == 'crear_propuesta')
                    {
                        notify("danger", "remove", "Validar propuestas:", "El código de la propuesta no es valido.");
                    } else
                    {
                        if (result == 'error')
                        {
                            notify("danger", "ok", "Validar propuestas:", "Se registro un error al crear, comuníquese con la mesa de ayuda convocatorias@scrd.gov.co");
                        } else
                        {

                            $('#modal_confirmar_administrativa_1').modal('hide');
                            $('#modal_verificacion_2').modal('hide');
                            $('#modal_verificacion_1').modal('hide');

                            $('#table_list').DataTable().ajax.reload( null, false ); 
                        }
                    }
                }
            }
        }

    });
}

function cargar_tabla(token_actual) {
    $('#table_list').DataTable({
        "language": {
            "url": "../../dist/libraries/datatables/js/spanish.json"
        },
        "searching": false,
        "processing": true,
        "serverSide": true,
        "ordering": false,
        "lengthMenu": [200, 300, 400],
        "ajax": {
            url: url_pv + "PropuestasValidar/buscar_propuestas",
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
                d.modulo = "SICON-PROPUESTAS-VALIDAR";
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

                    //Iconos de verificacion de documentación
                    var icon_admin = '<button type="button" class="btn btn-danger btn-circle btn_tooltip" title="El funcionario no ha terminado de revisar los documentos administrativos."><span class="fa fa-times"></span></button>';
                    var icon_tecni = '<button type="button" class="btn btn-danger btn-circle btn_tooltip" title="El funcionario no ha terminado de revisar los documentos técnicos."><span class="fa fa-times"></span></button>';
                    if (row.verificacion_administrativos) {
                        icon_admin = '<button type="button" class="btn btn-success btn-circle btn_tooltip" title="El funcionario ya termino de revisar los documentos administrativos."><span class="fa fa-check"></span></button>'
                    }
                    if (row.verificacion_tecnicos) {
                        icon_tecni = '<button type="button" class="btn btn-success btn-circle btn_tooltip" title="El funcionario ya termino de revisar los documentos técnicos."><span class="fa fa-check"></span></button>';
                    }
                    $('.btn_tooltip').tooltip();
                    row.verificacion_administrativos = icon_admin;
                    row.verificacion_tecnicos = icon_tecni;

                    //Iconos de numero de verificacion
                    row.btn_verificacion_1 = '<button type="button" lang="' + row.id_propuesta + '" class="btn btn-primary btn_tooltip cargar_verificacion_1" data-toggle="modal" data-target="#modal_verificacion_1" title="Es la primera verificación, la cual consiste en revisar los documentos administrativos y técnicos, con el fin de Habilitar, Rechazar o Subsanar."><span class="fa fa-eye"></span></button><br/><br/><button type="button" dir="' + row.por_que_habilita + '" lang="' + row.id_propuesta + '" class="btn btn-info btn_tooltip cargar_habilitar_1" data-toggle="modal" data-target="#modal_habilitar_1" title="Le permite habilitar la propuesta al estado inicial en la verificación #1, donde la propuesta queda en estado Inscrita y sin confirmar la documentación administrativa y técnica."><span class="fa fa-thumbs-up"></span></button>';

                    row.btn_verificacion_2 = '<button type="button" lang="' + row.id_propuesta + '" class="btn btn-primary btn_tooltip cargar_verificacion_2" data-toggle="modal" data-target="#modal_verificacion_2" title="Es la segunda verificación, la cual consiste en revisar los documentos administrativos que subsano el participante con el fin de Habilitar o Rechazar."><span class="fa fa-eye"></span></button><br/><br/><button type="button" dir="' + row.por_que_habilita + '" lang="' + row.id_propuesta + '" class="btn btn-info btn_tooltip cargar_habilitar_2" data-toggle="modal" data-target="#modal_habilitar_1" title="Le permite habilitar la propuesta al estado inicial en la verificación #2, donde la propuesta queda en estado Subsanada y sin confirmar la segunda verificación."><span class="fa fa-thumbs-up"></span></button>';

                    return row.estado;
                }
            }
        ],
        "drawCallback": function (settings) {
            $('.btn_tooltip').tooltip();
            $('.cargar_verificacion_1').click(function () {
                cargar_verificacion_1(token_actual, $(this).attr("lang"));
            });
            $('.cargar_verificacion_2').click(function () {
                cargar_verificacion_2(token_actual, $(this).attr("lang"));
            });
            $('.cargar_habilitar_1').click(function () {
                //Asigno la propuesta actual
                $("#propuesta").val($(this).attr("lang"));
                $("#numero_habilitar").val("1");
                $("#actual_habilitar").html("1");
                var por_que_habilita = $(this).attr("dir");
                if ($(this).attr("dir") == "null")
                {
                    por_que_habilita = "";
                }
                $(".por_que_habilita").html(por_que_habilita);
            });
            $('.cargar_habilitar_2').click(function () {
                //Asigno la propuesta actual
                $("#propuesta").val($(this).attr("lang"));
                $("#numero_habilitar").val("2");
                $("#actual_habilitar").html("2");
                var por_que_habilita = $(this).attr("dir");
                if ($(this).attr("dir") == "null")
                {
                    por_que_habilita = "";
                }
                $(".por_que_habilita").html(por_que_habilita);
            });
        },
        "columns": [
            {"data": "estado"},
            {"data": "anio"},
            {"data": "entidad"},
            {"data": "convocatoria"},
            {"data": "categoria"},
            {"data": "propuesta"},
            {"data": "codigo"},
            {"data": "participante"},
            {"data": "verificacion_administrativos"},
            {"data": "verificacion_tecnicos"},
            {"data": "btn_verificacion_1"},
            {"data": "btn_verificacion_2"},
            {"data": "ver_reporte"}
        ]
    });
    
    $('.guardar_por_que_habilita').click(function () {
        if ($("#por_que_habilita").val() != "")
        {
            $.ajax({
                type: 'POST',
                url: url_pv + 'PropuestasValidar/guardar_habilitacion',
                data: {"token": token_actual.token, "modulo": "SICON-PROPUESTAS-VALIDAR", "propuesta": $("#propuesta").val(), "numero_habilitar": $("#numero_habilitar").val(), "por_que_habilita": $("#por_que_habilita").val()},
            }).done(function (result) {

                if (result == 'error_metodo')
                {
                    notify("danger", "ok", "Validar propuestas:", "Se registro un error en el método, comuníquese con la mesa de ayuda convocatorias@scrd.gov.co");
                } else
                {
                    if (result == 'error_token')
                    {
                        //location.href = url_pv_admin + 'index.html?msg=Su sesión ha expirado, por favor vuelva a ingresar.&msg_tipo=danger';
                    } else
                    {
                        if (result == 'acceso_denegado')
                        {
                            notify("danger", "remove", "Usuario:", "No tiene permisos para editar información.");
                        } else
                        {
                            if (result == 'crear_propuesta')
                            {
                                notify("danger", "remove", "Validar propuestas:", "El código de la propuesta no es valido.");
                            } else
                            {
                                if (result == 'error')
                                {
                                    notify("danger", "ok", "Validar propuestas:", "Se registro un error al crear, comuníquese con la mesa de ayuda convocatorias@scrd.gov.co");
                                } else
                                {

                                    $('#modal_confirmar_administrativa_1').modal('hide');
                                    $('#modal_verificacion_2').modal('hide');
                                    $('#modal_verificacion_1').modal('hide');
                                    $('#modal_habilitar_1').modal('hide');
                                    $(".por_que_habilita").html('');
                                    $("textarea#por_que_habilita").val('');
                                    $('#table_list').DataTable().draw();
                                }
                            }
                        }
                    }
                }

            });


        } else
        {
            notify("danger", "ok", "Habilitar propuestas:", "La justificación de habilitar la propuesta es obligatoria");
        }
    });
    
}

function cargar_verificacion_1(token_actual, propuesta) {
    //Asigno la propuesta actual
    $("#propuesta").val(propuesta);

    $('#doc_administrativos_verificacion_2 tr').remove();
    $('#doc_administrativos_verificacion_1 tr').remove();
    $('#doc_tecnicos_verificacion_1 tr').remove();

    //Realizo la peticion para cargar el formulario
    $.ajax({
        type: 'POST',
        data: {"token": token_actual.token, "verificacion": 1},
        url: url_pv + 'PropuestasValidar/cargar_propuesta/' + propuesta
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
                if (data == 'error_propuesta')
                {
                    notify("danger", "ok", "Convocatorias:", "El código de la propuesta es incorrecto.");
                } else
                {
                    var json = JSON.parse(data);

                    $('#info_propuesta_verificacion_1').loadJSON(json.propuesta);

                    var html_table = '';
                    $.each(json.administrativos, function (key2, documento) {
                        if (documento.verificacion_1_id === null)
                        {
                            documento.verificacion_1_id = "";
                        }
                        if (documento.verificacion_1_estado === null)
                        {
                            documento.verificacion_1_estado = "";
                        }
                        if (documento.verificacion_1_observacion === null)
                        {
                            documento.verificacion_1_observacion = "";
                        }

                        html_table = html_table + '<tr>';
                        html_table = html_table + '<td>' + documento.orden + ' ' + documento.requisito + '</td>';
                        html_table = html_table + '<td><b>Archivos<b/><br/><br/>';

                        $.each(documento.archivos, function (key, archivo) {
                            html_table = html_table + '<p><a href="javascript:void(0)" onclick="download_file(\'' + archivo.id_alfresco + '\')">' + archivo.nombre + '</a></p>';
                        });
                        html_table = html_table + '<b>Links<b/><br/><br/>';
                        var numero_link = 1;
                        $.each(documento.links, function (key, link) {
                            html_table = html_table + '<p><a href="' + link.link + '" target="_blank">link ' + numero_link + '</a></p>';
                            numero_link++;
                        });
                        html_table = html_table + '</td>';
                        html_table = html_table + '<td>';
                        html_table = html_table + '         <div class="row">';
                        html_table = html_table + '             <div class="col-lg-12">';
                        html_table = html_table + '                 <div class="form-group">';
                        html_table = html_table + '                     <label> Resultado de la verificación</label>';
                        html_table = html_table + '                     <select id="estado_' + documento.id + '" class="form-control estados_administrativos" disabled="disabled">';
                        $.each(json.estados_verificacion_1, function (key, estado) {
                            var selected = '';
                            if (documento.verificacion_1_estado == estado.id)
                            {
                                selected = 'selected="selected"';
                            }
                            if (estado.id != 26)
                            {
                                html_table = html_table + '<option value="' + estado.id + '" ' + selected + '>' + estado.nombre + '</option>';
                            }
                        });

                        var color_boton_guardado = "btn-success";
                        if (documento.verificacion_1_id == "")
                        {
                            color_boton_guardado = "btn-danger";
                        }

                        html_table = html_table + '                     </select>';
                        html_table = html_table + '                 </div>';
                        html_table = html_table + '             </div>';
                        html_table = html_table + '         </div>';
                        html_table = html_table + '         <div class="row">';
                        html_table = html_table + '             <div class="col-lg-12">';
                        html_table = html_table + '                 <div class="form-group">';
                        html_table = html_table + '                     <label>Observaciones</label>';
                        html_table = html_table + '                     <textarea id="observaciones_' + documento.id + '" class="form-control" rows="3">' + documento.verificacion_1_observacion + '</textarea>';
                        html_table = html_table + '                 </div>';
                        html_table = html_table + '             </div>';
                        html_table = html_table + '         </div>';
                        html_table = html_table + '         <div class="row">';
                        html_table = html_table + '             <div class="col-lg-12">';
                        html_table = html_table + '                 <div class="form-group" style="text-align: right">';
                        html_table = html_table + '                     <button id="btn_documento_' + documento.id + '" type="button" class="btn ' + color_boton_guardado + '" onclick="guardar_verificacion_1(\'' + token_actual.token + '\',\'' + documento.id + '\',\'SICON-PROPUESTAS-VALIDAR\',1)">Guardar</button>';
                        html_table = html_table + '                     <input type="hidden" class="validar_administrativos" id="id_documento_' + documento.id + '" value="' + documento.verificacion_1_id + '" />';
                        html_table = html_table + '                 </div>';
                        html_table = html_table + '             </div>';
                        html_table = html_table + '         </div>';
                        html_table = html_table + '</td>';
                        html_table = html_table + '</tr>';
                    });

                    $('#doc_administrativos_verificacion_1 tr').remove();
                    $("#doc_administrativos_verificacion_1").append(html_table);

                    html_table = "";

                    $.each(json.tecnicos, function (key2, documento) {

                        if (documento.verificacion_1_id === null)
                        {
                            documento.verificacion_1_id = "";
                        }
                        if (documento.verificacion_1_estado === null)
                        {
                            documento.verificacion_1_estado = "";
                        }
                        if (documento.verificacion_1_observacion === null)
                        {
                            documento.verificacion_1_observacion = "";
                        }

                        html_table = html_table + '<tr>';
                        html_table = html_table + '<td>' + documento.orden + ' ' + documento.requisito + '</td>';
                        html_table = html_table + '<td><b>Archivos<b/><br/><br/>';

                        $.each(documento.archivos, function (key, archivo) {
                            html_table = html_table + '<p><a href="javascript:void(0)" onclick="download_file(\'' + archivo.id_alfresco + '\')">' + archivo.nombre + '</a></p>';
                        });
                        html_table = html_table + '<b>Links<b/><br/><br/>';
                        var numero_link = 1;
                        $.each(documento.links, function (key, link) {
                            html_table = html_table + '<p><a href="' + link.link + '" target="_blank">link ' + numero_link + '</a></p>';
                        });
                        html_table = html_table + '</td>';
                        html_table = html_table + '<td>';
                        html_table = html_table + '         <div class="row">';
                        html_table = html_table + '             <div class="col-lg-12">';
                        html_table = html_table + '                 <div class="form-group">';
                        html_table = html_table + '                     <label> Resultado de la verificación</label>';
                        html_table = html_table + '                     <select id="estado_' + documento.id + '" class="form-control estados_tecnicos" >';
                        $.each(json.estados_verificacion_1, function (key, estado) {
                            var selected = '';
                            if (documento.verificacion_1_estado == estado.id)
                            {
                                selected = 'selected="selected"';
                            }

                            //Se debe habilitar el estado subsanar en los documentos tecnicos
                            //de modalidad LEP
                            //if(json.modalidad==6)
                            //{
                            //    html_table = html_table + '<option value="' + estado.id + '" ' + selected + '>' + estado.nombre + '</option>';
                            //}
                            //else
                            //{
                            if (estado.id != 27)
                            {
                                html_table = html_table + '<option value="' + estado.id + '" ' + selected + '>' + estado.nombre + '</option>';
                            }
                            //}                                                                                    
                        });

                        var color_boton_guardado = "btn-success";
                        if (documento.verificacion_1_id == "")
                        {
                            var color_boton_guardado = "btn-danger";
                        }

                        html_table = html_table + '                     </select>';
                        html_table = html_table + '                 </div>';
                        html_table = html_table + '             </div>';
                        html_table = html_table + '         </div>';
                        html_table = html_table + '         <div class="row">';
                        html_table = html_table + '             <div class="col-lg-12">';
                        html_table = html_table + '                 <div class="form-group">';
                        html_table = html_table + '                     <label>Observaciones</label>';
                        html_table = html_table + '                     <textarea id="observaciones_' + documento.id + '" class="form-control" rows="3">' + documento.verificacion_1_observacion + '</textarea>';
                        html_table = html_table + '                 </div>';
                        html_table = html_table + '             </div>';
                        html_table = html_table + '         </div>';
                        html_table = html_table + '         <div class="row">';
                        html_table = html_table + '             <div class="col-lg-12">';
                        html_table = html_table + '                 <div class="form-group" style="text-align: right">';
                        html_table = html_table + '                     <button type="button" id="btn_documento_' + documento.id + '" class="btn ' + color_boton_guardado + '" onclick="guardar_verificacion_1(\'' + token_actual.token + '\',\'' + documento.id + '\',\'SICON-PROPUESTAS-VALIDAR\',1)">Guardar</button>';
                        html_table = html_table + '                     <input type="hidden" class="validar_tecnicos" id="id_documento_' + documento.id + '" value="' + documento.verificacion_1_id + '" />';
                        html_table = html_table + '                 </div>';
                        html_table = html_table + '             </div>';
                        html_table = html_table + '         </div>';
                        html_table = html_table + '</td>';
                        html_table = html_table + '</tr>';
                    });

                    $('#doc_tecnicos_verificacion_1 tr').remove();
                    $("#doc_tecnicos_verificacion_1").append(html_table);


                    //Por defecto los documentos tecnicos esta desactivados
                    //$("#doc_tecnicos_verificacion_1").find('input,select,button,textarea').attr("disabled", "disabled");
                    //$("#boton_confirma_tecnica_1").attr("disabled", "disabled");

                    //Se inactiva debido a que estamos en el modulod
                    //de verificar las propuestas rechazadas
                    //
                    //Valido si ya realizaron la verificación administrativa con el fin de habilitar
                    //la documentación tecnica
                    /*
                     if (json.propuesta.verificacion_administrativos)
                     {
                     
                     $("#doc_administrativos_verificacion_1").find('input,select,button,textarea').attr("disabled", "disabled");
                     $("#boton_confirma_administrativa_1").attr("disabled", "disabled");
                     
                     $("#doc_tecnicos_verificacion_1").find('input,select,button,textarea').removeAttr("disabled");
                     $("#boton_confirma_tecnica_1").removeAttr("disabled");                        
                     
                     }
                     */

                    //Se inactiva debido a que estamos en el modulod
                    //de verificar las propuestas rechazadas
                    /*
                     if (json.propuesta.verificacion_tecnicos)
                     {
                     
                     $("#doc_tecnicos_verificacion_1").find('input,select,button,textarea').attr("disabled", "disabled");
                     $("#boton_confirma_tecnica_1").attr("disabled", "disabled");
                     
                     }
                     */

                    //Si la propuesta esta estado por
                    //Registrada
                    //Anulada
                    //Por Subsanar -> id -> se elimina debido a que se puede verificar
                    //                      la documentacion tecnica asi este por subsanar
                    //                      ya que al momento se rechaza
                    //Subsanación Recibida
                    //Rechazada
                    //Habilitada
                    //subsanada
                    //Se inactiva en la 1 verificación los documetos tecnicos                    

                    //Se inactiva debido a que estamos en el modulod
                    //de verificar las propuestas rechazadas
                    /*
                     if (json.propuesta.estado == 7 || json.propuesta.estado == 20 || json.propuesta.estado == 22  || json.propuesta.estado == 23 || json.propuesta.estado == 24 || json.propuesta.estado == 31 )
                     {
                     
                     $("#doc_administrativos_verificacion_1").find('input,select,button,textarea').attr("disabled", "disabled");
                     $("#boton_confirma_administrativa_1").attr("disabled", "disabled");
                     
                     $("#doc_tecnicos_verificacion_1").find('input,select,button,textarea').attr("disabled", "disabled");
                     $("#boton_confirma_tecnica_1").attr("disabled", "disabled");
                     
                     }
                     */
                    if (Object.keys(json.contratistas).length > 0)
                    {
                        $("#contratistas").css("display", "block");

                        var html_table = "";
                        $(".tr_contratistas").remove();
                        $.each(json.contratistas, function (key, contratista) {
                            var nombre_contratista = String(contratista);
                            html_table = html_table + '<tr class="tr_contratistas"><td>' + key + '</td><td>' + nombre_contratista.replace(",", "<br/>") + '</td></tr>';
                        });
                        $("#body_contratistas").append(html_table);

                    } else
                    {
                        $("#contratistas").css("display", "none");
                    }


                    //Solo si es una propuesta en estado por subsanar
                    if (json.propuesta.estado === 21)
                    {
                        $("#boton_confirma_tecnica_1").attr("disabled", "disabled");
                    } else
                    {
                        $("#boton_confirma_tecnica_1").removeAttr("disabled");
                    }

                }
            }
        }
    });
}

function cargar_verificacion_2(token_actual, propuesta) {
    //Asigno la propuesta actual
    $("#propuesta").val(propuesta);

    $('#doc_administrativos_verificacion_2 tr').remove();
    $('#doc_administrativos_verificacion_1 tr').remove();
    $('#doc_tecnicos_verificacion_1 tr').remove();

    //Realizo la peticion para cargar el formulario
    $.ajax({
        type: 'POST',
        data: {"token": token_actual.token, "verificacion": 2},
        url: url_pv + 'PropuestasValidar/cargar_propuesta/' + propuesta
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
                if (data == 'error_propuesta')
                {
                    notify("danger", "ok", "Convocatorias:", "El código de la propuesta es incorrecto.");
                } else
                {
                    var json = JSON.parse(data);

                    $('#info_propuesta_verificacion_2').loadJSON(json.propuesta);

                    var html_table = '';
                    $.each(json.administrativos, function (key2, documento) {
                        if (documento.verificacion_1_id === null)
                        {
                            documento.verificacion_1_id = "";
                        }
                        if (documento.verificacion_1_estado === null)
                        {
                            documento.verificacion_1_estado = "";
                        }
                        if (documento.verificacion_1_observacion === null)
                        {
                            documento.verificacion_1_observacion = "";
                        }

                        html_table = html_table + '<tr>';
                        html_table = html_table + '<td>' + documento.orden + ' ' + documento.requisito + '</td>';
                        html_table = html_table + '<td><b>Archivos<b/><br/><br/>';

                        $.each(documento.archivos, function (key, archivo) {
                            html_table = html_table + '<p><a href="javascript:void(0)" onclick="download_file(\'' + archivo.id_alfresco + '\')">' + archivo.nombre + '</a></p>';
                        });
                        html_table = html_table + '<b>Links<b/><br/><br/>';
                        var numero_link = 1;
                        $.each(documento.links, function (key, link) {
                            html_table = html_table + '<p><a href="' + link.link + '" target="_blank">link ' + numero_link + '</a></p>';
                            numero_link++;
                        });
                        html_table = html_table + '</td>';
                        html_table = html_table + '<td>';
                        html_table = html_table + '         <div class="row">';
                        html_table = html_table + '             <div class="col-lg-12">';
                        html_table = html_table + '                 <div class="form-group">';
                        html_table = html_table + '                     <label> Resultado de la verificación</label>';
                        html_table = html_table + '                     <select id="estado_' + documento.id + '" class="form-control estados_administrativos" >';
                        $.each(json.estados_verificacion_2, function (key, estado) {
                            var selected = '';
                            if (documento.verificacion_1_estado == estado.id)
                            {
                                selected = 'selected="selected"';
                            }

                            html_table = html_table + '<option value="' + estado.id + '" ' + selected + '>' + estado.nombre + '</option>';

                        });

                        var color_boton_guardado = "btn-success";
                        if (documento.verificacion_1_id == "")
                        {
                            color_boton_guardado = "btn-danger";
                        }

                        html_table = html_table + '                     </select>';
                        html_table = html_table + '                 </div>';
                        html_table = html_table + '             </div>';
                        html_table = html_table + '         </div>';
                        html_table = html_table + '         <div class="row">';
                        html_table = html_table + '             <div class="col-lg-12">';
                        html_table = html_table + '                 <div class="form-group">';
                        html_table = html_table + '                     <label>Observaciones</label>';
                        html_table = html_table + '                     <textarea id="observaciones_' + documento.id + '" class="form-control" rows="3">' + documento.verificacion_1_observacion + '</textarea>';
                        html_table = html_table + '                 </div>';
                        html_table = html_table + '             </div>';
                        html_table = html_table + '         </div>';
                        html_table = html_table + '         <div class="row">';
                        html_table = html_table + '             <div class="col-lg-12">';
                        html_table = html_table + '                 <div class="form-group" style="text-align: right">';
                        html_table = html_table + '                     <button id="btn_documento_' + documento.id + '" type="button" class="btn ' + color_boton_guardado + '" onclick="guardar_verificacion_1(\'' + token_actual.token + '\',\'' + documento.id + '\',\'SICON-PROPUESTAS-VALIDAR\',2)">Guardar</button>';
                        html_table = html_table + '                     <input type="hidden" class="validar_administrativos" id="id_documento_' + documento.id + '" value="' + documento.verificacion_1_id + '" />';
                        html_table = html_table + '                 </div>';
                        html_table = html_table + '             </div>';
                        html_table = html_table + '         </div>';
                        html_table = html_table + '</td>';
                        html_table = html_table + '</tr>';
                    });

                    $.each(json.tecnicos, function (key2, documento) {
                        if (documento.verificacion_1_id === null)
                        {
                            documento.verificacion_1_id = "";
                        }
                        if (documento.verificacion_1_estado === null)
                        {
                            documento.verificacion_1_estado = "";
                        }
                        if (documento.verificacion_1_observacion === null)
                        {
                            documento.verificacion_1_observacion = "";
                        }

                        html_table = html_table + '<tr>';
                        html_table = html_table + '<td>' + documento.orden + ' ' + documento.requisito + '</td>';
                        html_table = html_table + '<td><b>Archivos<b/><br/><br/>';

                        $.each(documento.archivos, function (key, archivo) {
                            html_table = html_table + '<p><a href="javascript:void(0)" onclick="download_file(\'' + archivo.id_alfresco + '\')">' + archivo.nombre + '</a></p>';
                        });
                        html_table = html_table + '<b>Links<b/><br/><br/>';
                        var numero_link = 1;
                        $.each(documento.links, function (key, link) {
                            html_table = html_table + '<p><a href="' + link.link + '" target="_blank">link ' + numero_link + '</a></p>';
                            numero_link++;
                        });
                        html_table = html_table + '</td>';
                        html_table = html_table + '<td>';
                        html_table = html_table + '         <div class="row">';
                        html_table = html_table + '             <div class="col-lg-12">';
                        html_table = html_table + '                 <div class="form-group">';
                        html_table = html_table + '                     <label> Resultado de la verificación</label>';
                        html_table = html_table + '                     <select id="estado_' + documento.id + '" class="form-control estados_administrativos" >';
                        $.each(json.estados_verificacion_2, function (key, estado) {
                            var selected = '';
                            if (documento.verificacion_1_estado == estado.id)
                            {
                                selected = 'selected="selected"';
                            }

                            html_table = html_table + '<option value="' + estado.id + '" ' + selected + '>' + estado.nombre + '</option>';

                        });

                        var color_boton_guardado = "btn-success";
                        if (documento.verificacion_1_id == "")
                        {
                            color_boton_guardado = "btn-danger";
                        }

                        html_table = html_table + '                     </select>';
                        html_table = html_table + '                 </div>';
                        html_table = html_table + '             </div>';
                        html_table = html_table + '         </div>';
                        html_table = html_table + '         <div class="row">';
                        html_table = html_table + '             <div class="col-lg-12">';
                        html_table = html_table + '                 <div class="form-group">';
                        html_table = html_table + '                     <label>Observaciones</label>';
                        html_table = html_table + '                     <textarea id="observaciones_' + documento.id + '" class="form-control" rows="3">' + documento.verificacion_1_observacion + '</textarea>';
                        html_table = html_table + '                 </div>';
                        html_table = html_table + '             </div>';
                        html_table = html_table + '         </div>';
                        html_table = html_table + '         <div class="row">';
                        html_table = html_table + '             <div class="col-lg-12">';
                        html_table = html_table + '                 <div class="form-group" style="text-align: right">';
                        html_table = html_table + '                     <button id="btn_documento_' + documento.id + '" type="button" class="btn ' + color_boton_guardado + '" onclick="guardar_verificacion_1(\'' + token_actual.token + '\',\'' + documento.id + '\',\'SICON-PROPUESTAS-VALIDAR\',2)">Guardar</button>';
                        html_table = html_table + '                     <input type="hidden" class="validar_administrativos" id="id_documento_' + documento.id + '" value="' + documento.verificacion_1_id + '" />';
                        html_table = html_table + '                 </div>';
                        html_table = html_table + '             </div>';
                        html_table = html_table + '         </div>';
                        html_table = html_table + '</td>';
                        html_table = html_table + '</tr>';
                    });

                    $('#doc_administrativos_verificacion_2 tr').remove();
                    $("#doc_administrativos_verificacion_2").append(html_table);


                    //Si la propuesta esta estado por
                    //Subsanada
                    //se inactiva funcionalidad debido a que simpre debe estar activa
                    /*
                     
                     $("#doc_administrativos_verificacion_2").find('input,select,button,textarea').attr("disabled", "disabled");
                     $("#boton_confirma_administrativa_2").attr("disabled", "disabled");                                                
                     
                     if (json.propuesta.estado == 31)
                     {
                     
                     $("#doc_administrativos_verificacion_2").find('input,select,button,textarea').removeAttr("disabled");
                     $("#boton_confirma_administrativa_2").removeAttr("disabled");                                                                                               
                     }
                     */

                }
            }
        }
    });
}

//Funcion para descargar archivo
function download_file(cod)
{
    var token_actual = JSON.parse(JSON.stringify(keycloak));
    
    $.AjaxDownloader({
        url: url_pv + 'PropuestasDocumentacion/download_file_back/',
        data: {
            cod: cod,
            token: token_actual.token,
            modulo: "SICON-PROPUESTAS-VERIFICACION"
        }
    });
    
}

//guardar verificacion 1
function guardar_verificacion_1(token_actual, id, modulo, verificacion)
{
    //Debo validar que todos los documentos ya esten verificados
    //Hablar con gato si en la 1 verificacion solo revisan documentación administrativa
    //Eso quiere decir que la documentación tecnica solo se revisa cuando las propuesta
    //Ya pasaron por el proceso de subsanacion
    var estado = $("#estado_" + id).val();
    var observacion = $("#observaciones_" + id).val();
    var propuesta = $("#propuesta").val();
    var convocatoriadocumento = id;
    var id = $("#id_documento_" + id).val();

    var realizar_peticion = true;
    var mensaje_observaciones = 'Las observaciones son obligatorias, al momento de colocar un requisito a subsanar.';
    if ((estado == 26 || estado == 27 || estado == 30) && observacion == "")
    {
        realizar_peticion = false;
        var mensaje_observaciones = 'Las observaciones son obligatorias, al momento de colocar un requisito en no cumple.';
    }

    if (realizar_peticion)
    {
        //Se realiza la peticion con el fin de guardar el registro actual
        $.ajax({
            type: 'POST',
            url: url_pv + 'PropuestasValidar/guardar_verificacion_1',
            data: {"token": token_actual, "modulo": modulo, "propuesta": propuesta, "convocatoriadocumento": convocatoriadocumento, "estado": estado, "observacion": observacion, "verificacion": verificacion, "id": id},
        }).done(function (result) {

            if (result == 'error_metodo')
            {
                notify("danger", "ok", "Validar propuestas:", "Se registro un error en el método, comuníquese con la mesa de ayuda convocatorias@scrd.gov.co");
            } else
            {
                if (result == 'error_token')
                {
                    location.href = url_pv_admin + 'index.html?msg=Su sesión ha expirado, por favor vuelva a ingresar.&msg_tipo=danger';
                } else
                {
                    if (result == 'acceso_denegado')
                    {
                        notify("danger", "remove", "Usuario:", "No tiene permisos para editar información.");
                    } else
                    {
                        if (result == 'crear_propuesta')
                        {
                            notify("danger", "remove", "Validar propuestas:", "El código de la propuesta no es valido.");
                        } else
                        {
                            if (result == 'error')
                            {
                                notify("danger", "ok", "Validar propuestas:", "Se registro un error al crear, comuníquese con la mesa de ayuda convocatorias@scrd.gov.co");
                            } else
                            {
                                if (isNaN(result)) {
                                    notify("danger", "ok", "Validar propuestas:", "Se registro un error al crear, comuníquese con la mesa de ayuda convocatorias@scrd.gov.co");
                                } else
                                {
                                    $("#id_documento_" + convocatoriadocumento).val(result);
                                    $("#btn_documento_" + convocatoriadocumento).removeClass("btn-danger");
                                    $("#btn_documento_" + convocatoriadocumento).addClass("btn-success");

                                    notify("success", "ok", "Validar propuestas:", "Se Guardó con éxito la verificación del documento.");
                                }
                            }
                        }
                    }
                }
            }

        });
    } else
    {
        notify("danger", "ok", "Validar propuestas:", mensaje_observaciones);
    }


}

//guardar guardar_por_que_habilita
function guardar_por_que_habilita()
{
    $('.guardar_por_que_habilita').click(function () {
       if($("#por_que_habilita").val()!="")
        {
            var token_habilitar = getLocalStorage(name_local_storage);
            
            $.ajax({
                type: 'POST',
                url: url_pv + 'PropuestasValidar/guardar_habilitacion',
                data: {"token": token_habilitar.token, "modulo": "Validar propuestas", "propuesta": $("#propuesta").val(), "numero_habilitar": $("#numero_habilitar").val(), "por_que_habilita": $("#por_que_habilita").val()},
            }).done(function (result) {

                if (result == 'error_metodo')
                {
                    notify("danger", "ok", "Validar propuestas:", "Se registro un error en el método, comuníquese con la mesa de ayuda convocatorias@scrd.gov.co");
                } else
                {
                    if (result == 'error_token')
                    {
                        location.href = url_pv_admin + 'index.html?msg=Su sesión ha expirado, por favor vuelva a ingresar.&msg_tipo=danger';
                    } else
                    {
                        if (result == 'acceso_denegado')
                        {
                            notify("danger", "remove", "Usuario:", "No tiene permisos para editar información.");
                        } else
                        {
                            if (result == 'crear_propuesta')
                            {
                                notify("danger", "remove", "Validar propuestas:", "El código de la propuesta no es valido.");
                            } else
                            {
                                if (result == 'error')
                                {
                                    notify("danger", "ok", "Validar propuestas:", "Se registro un error al crear, comuníquese con la mesa de ayuda convocatorias@scrd.gov.co");
                                } else
                                {

                                    $('#modal_confirmar_administrativa_1').modal('hide');
                                    $('#modal_verificacion_2').modal('hide');
                                    $('#modal_verificacion_1').modal('hide');
                                    $('#modal_habilitar_1').modal('hide');
                                    $(".por_que_habilita").html('');
                                    $("textarea#por_que_habilita").val('');
                                    $('#table_list').DataTable().ajax.reload( null, false ); 
                                }
                            }
                        }
                    }
                }

function certificado(id,programa){
    var url = "reporte_propuesta_inscrita_back.php";
    if(programa===2){
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