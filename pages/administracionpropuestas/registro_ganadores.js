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
            permiso_lectura_keycloak(token_actual.token, "SICON-PROPUESTAS-GANADORES");

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
                data: {"token": token_actual.token, "modulo": "SICON-PROPUESTAS-GANADORES"},
                url: url_pv + 'Convocatorias/modulo_buscador_propuestas'
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

                            //Cargos el select de localidades
                            $('#certifica').find('option').remove();
                            $("#certifica").append('<option value="">:: Seleccionar ::</option>');
                            if (json.certifica.length > 0) {
                                $.each(json.certifica, function (key, usuario) {
                                    var selected = '';
                                    $("#certifica").append('<option value="' + usuario.id + '" ' + selected + ' >' + usuario.username + ' - ' + usuario.primer_nombre + ' ' + usuario.segundo_nombre + ' ' + usuario.primer_apellido + ' ' + usuario.segundo_apellido + '</option>');
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

                            validator_form(token_actual);

                            //Valido cual va a hacer el estado de la propuesta
                            $('.estado_btn').click(function () {
                                $("#estado").val($(this).attr("title"));
                            });

                            $('#no_ganador').click(function () {
                                //Se realiza la peticion con el fin de guardar el registro actual
                                $.ajax({
                                    type: 'POST',
                                    url: url_pv + 'PropuestasGanadoras/editar_propuesta',
                                    data: "id=" + $("#id").val() + "&estado=44&modulo=SICON-PROPUESTAS-GANADORES&token=" + token_actual.token
                                }).done(function (result) {
                                    var result = result.trim();

                                    if (result == 'error')
                                    {
                                        notify("danger", "ok", "Propuestas:", "Se registro un error, comuníquese con la mesa de ayuda convocatorias@scrd.gov.co");
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
                                                if (result == 'error_metodo')
                                                {
                                                    notify("danger", "ok", "Propuestas:", "Se registro un error, comuníquese con la mesa de ayuda convocatorias@scrd.gov.co");
                                                } else
                                                {
                                                    if (isNaN(result)) {
                                                        notify("danger", "ok", "Propuestas:", "Se registro un error, comuníquese con la mesa de ayuda convocatorias@scrd.gov.co");
                                                    } else
                                                    {
                                                        notify("success", "ok", "Propuestas:", "Se Guardó con el éxito la propuesta, No Ganadora.");
                                                        cargar_tabla(token_actual);
                                                    }
                                                }
                                            }
                                        }
                                    }

                                });
                            });
                        }
                    }
                }
            });

            $('#buscar').click(function () {
                cargar_tabla(token_actual);
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
                            data: {"modulo": "SICON-PROPUESTAS-GANADORES", "token": token_actual.token, "anio": $("#anio").val(), "entidad": $("#entidad").val()},
                            url: url_pv + 'PropuestasGanadoras/select_convocatorias'
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
                        data: {"modulo": "SICON-PROPUESTAS-GANADORES", "token": token_actual.token, "conv": $("#convocatoria").val()},
                        url: url_pv + 'PropuestasGanadoras/select_categorias'
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


            //Limpio el formulario de los anexos
            $('#ver_propuesta').on('hidden.bs.modal', function () {
                $("#formulario_principal")[0].reset();
                $("#id").val("");
                $("#estado").val("");
                $(".text_limpiar").val("");
            });

        }
    }
});


function validator_form(token_actual) {
    //Se debe colocar debido a que el calendario es un componente diferente
    $('.calendario').on('changeDate show', function (e) {
        $('.formulario_principal').bootstrapValidator('revalidateField', 'fecha_resolucion');
    });
    //Validar el formulario
    $('.formulario_principal').bootstrapValidator({
        feedbackIcons: {
            valid: 'glyphicon glyphicon-ok',
            invalid: 'glyphicon glyphicon-remove',
            validating: 'glyphicon glyphicon-refresh'
        },
        fields: {
            numero_resolucion: {
                validators: {
                    notEmpty: {message: 'El número de resolución es requerido'}
                }
            },
            fecha_resolucion: {
                validators: {
                    notEmpty: {message: 'La fecha de resolución es requerido'}
                }
            },
            monto_asignado: {
                validators: {
                    notEmpty: {message: 'El monto asignado es requerido'},
                    integer: {message: 'Debe ingresar solo números'}
                }
            },
            codigo_presupuestal: {
                validators: {
                    notEmpty: {message: 'El código presupuestal es requerido'}
                }
            },
            codigo_proyecto_inversion: {
                validators: {
                    notEmpty: {message: 'El código proyecto de inversión es requerido'}
                }
            },
            cdp: {
                validators: {
                    notEmpty: {message: 'El CDP es requerido'}
                }
            },
            crp: {
                validators: {
                    notEmpty: {message: 'El CRP es requerido'}
                }
            }
        }
    }).on('success.form.bv', function (e) {
        // Prevent form submission
        e.preventDefault();
        // Get the form instance
        var $form = $(e.target);

        // Get the BootstrapValidator instance
        var bv = $form.data('bootstrapValidator');

        // Valido si el id existe, con el fin de eviarlo al metodo correcto
        $('#formulario_principal').attr('action', url_pv + 'PropuestasGanadoras/editar_propuesta');

        //Se realiza la peticion con el fin de guardar el registro actual
        $.ajax({
            type: 'POST',
            url: $form.attr('action'),
            data: $form.serialize() + "&modulo=SICON-PROPUESTAS-GANADORES&token=" + token_actual.token
        }).done(function (result) {
            var result = result.trim();

            if (result == 'error')
            {
                notify("danger", "ok", "Propuestas:", "Se registro un error, comuníquese con la mesa de ayuda convocatorias@scrd.gov.co");
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
                        if (result == 'error_metodo')
                        {
                            notify("danger", "ok", "Propuestas:", "Se registro un error, comuníquese con la mesa de ayuda convocatorias@scrd.gov.co");
                        } else
                        {
                            if (isNaN(result)) {
                                notify("danger", "ok", "Propuestas:", "Se registro un error, comuníquese con la mesa de ayuda convocatorias@scrd.gov.co");
                            } else
                            {
                                notify("success", "ok", "Propuestas:", "Se Guardó con el éxito la propuesta.");
                                cargar_tabla(token_actual);
                            }
                        }
                    }
                }
            }

        });

        $form.bootstrapValidator('disableSubmitButtons', false).bootstrapValidator('resetForm', true);
        bv.resetForm();
        $('#ver_propuesta').modal('toggle');

    });

}

function cargar_tabla(token_actual)
{

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
                    url: url_pv + "PropuestasGanadoras/buscar_propuestas",
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
                        d.modulo = "SICON-PROPUESTAS-GANADORES";
                    },
                    type: "POST"
                },
                "drawCallback": function (settings) {
                    //Cargo el formulario, para crear o editar
                    cargar_formulario(token_actual);
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
                    {"data": "ver_propuesta"}
                ]
            });

            $("#busqueda").attr("value", "1");
        } else
        {
            $('#table_list').DataTable().ajax.reload(null, false);
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
                    url: url_pv + 'PropuestasGanadoras/validar_acceso/' + $("#id_convocatoria").val()
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
                                                url: url_pv + "PropuestasGanadoras/buscar_propuestas",
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
                                                    d.modulo = "SICON-PROPUESTAS-GANADORES";
                                                },
                                                type: "POST"
                                            },
                                            "drawCallback": function (settings) {
                                                //Cargo el formulario, para crear o editar
                                                cargar_formulario(token_actual);
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
                                                {"data": "ver_propuesta"}
                                            ]
                                        });

                                        $("#busqueda").attr("value", "1");
                                    } else
                                    {
                                        $('#table_list').DataTable().ajax.reload(null, false);
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

}

function cargar_formulario(token_actual)
{
    $(".cargar_formulario").click(function () {
        //Cargo el id actual        
        $("#id").attr('value', $(this).attr('title'))
        //Realizo la peticion para cargar el formulario
        $.ajax({
            type: 'POST',
            data: {"token": token_actual.token, "propuesta": $("#propuesta").attr('value'), "participante": $("#participante").attr('value'), "conv": $("#conv").attr('value'), "modulo": "SICON-PROPUESTAS-GANADORES", "m": getURLParameter('m'), "id": $("#id").attr('value')},
            url: url_pv + 'PropuestasGanadoras/consultar_propuesta/'
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
                    var json = JSON.parse(data);

                    //var href_cer = url_pv_report + 'reporte_certificacion.php?entidad=' + json[1].entidad + '&tp=' + json[1].tp + '&id=' + json[0].codigo + '&token=' + token_actual.token;

                    $("#generar_certificado").attr('onclick', "certificado('" + json[1].entidad + "','" + json[1].tp + "','" + json[0].codigo + "')");

                    //Cargo el formulario con los datos
                    $('#formulario_principal').loadJSON(json[0]);
                }
            }
        });
    });

}


function certificado(entidad,tp,id){
    var url = "reporte_certificacion_back.php";
    
    var token_actual = JSON.parse(JSON.stringify(keycloak));

    $.AjaxDownloader({
        url: url_pv_report + url,
        data: {
            id: id,
            entidad: entidad,
            tp: tp,
            token: token_actual.token,
            modulo: "SICON-PROPUESTAS-GANADORES"
        }
    });

}