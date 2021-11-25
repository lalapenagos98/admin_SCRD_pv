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
            //Valido el id de la propuesta
            if (Number.isInteger(parseInt(getURLParameter('m'))))
            {
                //Vacio el id
                $("#id").attr('value', "");
                //Asignamos el valor a input conv
                $("#propuesta").attr('value', getURLParameter('m'));

                //Realizo la peticion para cargar el formulario
                $.ajax({
                    type: 'POST',
                    data: {"token": token_actual.token, "idp": $("#propuesta").attr('value'), "modulo": "SICON-AJUSTAR-INTEGRANTES"},
                    url: url_pv + 'PropuestasJuntasAgrupaciones/formulario_integrante'
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

                                //Cargos el select de tipo de documento
                                $('#tipo_documento').find('option').remove();
                                $("#tipo_documento").append('<option value="">:: Seleccionar ::</option>');
                                if (json.tipo_documento.length > 0) {
                                    $.each(json.tipo_documento, function (key, array) {
                                        $("#tipo_documento").append('<option value="' + array.id + '" >' + array.descripcion + '</option>');
                                    });
                                }

                                //Cargo el participante de la pripuesta
                                $("#participante").attr('value', json.participante);

                                $("#cod").html(json.codigo);

                                //Valido formulario
                                validator_form(token_actual);

                                //Cargar datos de la tabla
                                cargar_tabla(token_actual);

                            }
                        }
                    }
                });

                //Limpio el formulario de los anexos
                $('#nuevo_integrante').on('hidden.bs.modal', function () {
                    $("#formulario_principal")[0].reset();
                    $("#por_que_actualiza_text").html("");
                    $("#id").val("");
                });

                //Limpio el formulario de los anexos
                $('#nuevo_integrante_pj').on('hidden.bs.modal', function () {
                    $("#formulario_principal_pj")[0].reset();
                    $("#por_que_actualiza_text_pj").html("");
                    $("#id_pj").val("");
                });


            } else
            {
                location.href = url_pv_admin + 'pages/administracionpropuestas/listar_juntas_agrupaciones.html?msg=El código de la propuesta no es valido.&msg_tipo=danger';
            }
        }
    }

});

function validator_form(token_actual) {
    //Se debe colocar debido a que el calendario es un componente diferente
    $('.calendario').on('changeDate show', function (e) {
        $('.formulario_principal').bootstrapValidator('revalidateField', 'fecha_nacimiento');
    });
    //Validar el formulario
    $('.formulario_principal').bootstrapValidator({
        feedbackIcons: {
            valid: 'glyphicon glyphicon-ok',
            invalid: 'glyphicon glyphicon-remove',
            validating: 'glyphicon glyphicon-refresh'
        },
        fields: {
            tipo_documento: {
                validators: {
                    notEmpty: {message: 'El tipo de documento de identificación es requerido'}
                }
            },
            numero_documento: {
                validators: {
                    notEmpty: {message: 'El número de documento de identificación es requerido'}
                }
            },
            primer_nombre: {
                validators: {
                    notEmpty: {message: 'El primer nombre es requerido'}
                }
            },
            primer_apellido: {
                validators: {
                    notEmpty: {message: 'El primer apellido es requerido'}
                }
            },
            rol: {
                validators: {
                    notEmpty: {message: 'El rol es requerido'}
                }
            },
            por_que_actualiza: {
                validators: {
                    notEmpty: {message: 'La justificación de la actualización es requerido'}
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
        $('#formulario_principal').attr('action', url_pv + 'PropuestasJuntasAgrupaciones/crear_integrante');

        //Se realiza la peticion con el fin de guardar el registro actual
        $.ajax({
            type: 'POST',
            url: $form.attr('action'),
            data: $form.serialize() + "&modulo=SICON-AJUSTAR-INTEGRANTES&token=" + token_actual.token
        }).done(function (result) {
            var result = result.trim();

            if (result == 'error')
            {
                notify("danger", "ok", "Integrantes:", "Se registro un error, comuníquese con la mesa de ayuda convocatorias@scrd.gov.co");
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
                            notify("danger", "ok", "Integrantes:", "Se registro un error, comuníquese con la mesa de ayuda convocatorias@scrd.gov.co");
                        } else
                        {
                            if (result == 'error_representante')
                            {
                                notify("danger", "ok", "Integrantes:", "No puede registrar mas de un representante.");
                            } else
                            {
                                if (isNaN(result)) {
                                    notify("danger", "ok", "Integrantes:", "Se registro un error, comuníquese con la mesa de ayuda convocatorias@scrd.gov.co");
                                } else
                                {
                                    notify("success", "ok", "Integrantes:", "Se Guardó con el éxito el integrante.");
                                    cargar_tabla(token_actual);
                                }
                            }
                        }
                    }
                }
            }

        });

        $form.bootstrapValidator('disableSubmitButtons', false).bootstrapValidator('resetForm', true);
        bv.resetForm();
        $('#nuevo_integrante').modal('toggle');

    });

    //Validar el formulario
    $('.formulario_principal_pj').bootstrapValidator({
        feedbackIcons: {
            valid: 'glyphicon glyphicon-ok',
            invalid: 'glyphicon glyphicon-remove',
            validating: 'glyphicon glyphicon-refresh'
        },
        fields: {
            numero_documento: {
                validators: {
                    notEmpty: {message: 'El número de Nit es requerido'},
                    numeric: {message: 'Debe ingresar solo numeros'}
                }
            },
            primer_nombre: {
                validators: {
                    notEmpty: {message: 'La razón Social es requerida'}
                }
            },
            dv: {
                validators: {
                    notEmpty: {message: 'El dv es requerido'},
                    numeric: {message: 'Debe ingresar solo numeros'}
                }
            },
            por_que_actualiza: {
                validators: {
                    notEmpty: {message: 'La justificación de la actualización es requerido'}
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
        $('#formulario_principal_pj').attr('action', url_pv + 'PropuestasJuntasAgrupaciones/crear_integrante');

        //Se realiza la peticion con el fin de guardar el registro actual
        $.ajax({
            type: 'POST',
            url: $form.attr('action'),
            data: $form.serialize() + "&modulo=SICON-AJUSTAR-INTEGRANTES&token=" + token_actual.token
        }).done(function (result) {
            var result = result.trim();

            if (result == 'error')
            {
                notify("danger", "ok", "Integrantes:", "Se registro un error, comuníquese con la mesa de ayuda convocatorias@scrd.gov.co");
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
                            notify("danger", "ok", "Integrantes:", "Se registro un error, comuníquese con la mesa de ayuda convocatorias@scrd.gov.co");
                        } else
                        {
                            if (result == 'error_representante')
                            {
                                notify("danger", "ok", "Integrantes:", "No puede registrar mas de un representante.");
                            } else
                            {
                                if (isNaN(result)) {
                                    notify("danger", "ok", "Integrantes:", "Se registro un error, comuníquese con la mesa de ayuda convocatorias@scrd.gov.co");
                                } else
                                {
                                    notify("success", "ok", "Integrantes:", "Se Guardó con el éxito el integrante.");
                                    cargar_tabla(token_actual);
                                }
                            }
                        }
                    }
                }
            }

        });

        $form.bootstrapValidator('disableSubmitButtons', false).bootstrapValidator('resetForm', true);
        bv.resetForm();
        $('#nuevo_integrante_pj').modal('toggle');

    });

}

function cargar_tabla(token_actual)
{
    $('#table_registros').DataTable({
        "language": {
            "url": "../../dist/libraries/datatables/js/spanish.json"
        },
        "processing": true,
        "destroy": true,
        "serverSide": true,
        "ordering": false,
        "lengthMenu": [10, 20, 30],
        "ajax": {
            url: url_pv + "PropuestasJuntasAgrupaciones/cargar_tabla_integrantes",
            data: {"token": token_actual.token, "participante": $("#participante").attr('value'), "propuesta": $("#propuesta").attr('value'), "modulo": "SICON-AJUSTAR-INTEGRANTES", "tipo": $("#tipo").attr('value')},
            type: "POST"
        },
        "drawCallback": function (settings) {
            $(".check_activar_t").attr("checked", "true");
            $(".check_activar_f").removeAttr("checked");
            //Cargo el formulario, para crear o editar
            cargar_formulario(token_actual);
        },
        "columns": [
            {"data": "representante"},
            {"data": "tipo_documento"},
            {"data": "numero_documento"},
            {"data": "primer_nombre"},
            {"data": "segundo_nombre"},
            {"data": "primer_apellido"},
            {"data": "segundo_apellido"},
            {"data": "rol"},
            {"data": "acciones"}
        ],
        "columnDefs": [{
                "targets": 0,
                "render": function (data, type, row, meta) {
                    if (row.representante == true)
                    {
                        row.representante = "Sí";
                    } else
                    {
                        row.representante = "No";
                    }
                    return row.representante;
                }
            }
        ]
    });

}

function cargar_formulario(token_actual)
{
    $(".cargar_formulario").click(function () {
        //Cargo el id actual        
        $("#id").attr('value', $(this).attr('title'))
        //Realizo la peticion para cargar el formulario
        $.ajax({
            type: 'POST',
            data: {"token": token_actual.token, "propuesta": $("#propuesta").attr('value'), "participante": $("#participante").attr('value'), "conv": $("#conv").attr('value'), "modulo": "SICON-AJUSTAR-INTEGRANTES", "m": getURLParameter('m'), "id": $("#id").attr('value')},
            url: url_pv + 'PropuestasJuntasAgrupaciones/editar_integrante/'
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

                    //Cargo el formulario con los datos
                    $('#formulario_principal').loadJSON(json.participante);

                    $('#por_que_actualiza_text').html(json.por_que_actualiza_text);

                    $("#representante option[value='" + json.participante.representante + "']").prop('selected', true);

                    $("#active option[value='" + json.participante.active + "']").prop('selected', true);

                    $('#nuevo_integrante').modal('toggle');
                }
            }
        });
    });

    $(".cargar_formulario_pj").click(function () {
        //Cargo el id actual        
        $("#id").attr('value', $(this).attr('title'))
        //Realizo la peticion para cargar el formulario
        $.ajax({
            type: 'POST',
            data: {"token": token_actual.token, "propuesta": $("#propuesta").attr('value'), "participante": $("#participante").attr('value'), "conv": $("#conv").attr('value'), "modulo": "SICON-AJUSTAR-INTEGRANTES", "m": getURLParameter('m'), "id": $("#id").attr('value')},
            url: url_pv + 'PropuestasJuntasAgrupaciones/editar_integrante/'
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

                    //Cargo el formulario con los datos
                    $('#formulario_principal_pj').loadJSON(json.participante);

                    $('#por_que_actualiza_text_pj').html(json.por_que_actualiza_text);

                    $('#nuevo_integrante_pj').modal('toggle');
                }
            }
        });
    });
}