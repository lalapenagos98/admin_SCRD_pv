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
            permiso_lectura_keycloak(token_actual.token, "SICON-AJUSTAR-CONVOCATORIAS");

            //Cargamos el menu principal
            $.ajax({
                type: 'POST',
                data: {"token": token_actual.token, "id": getURLParameter('id'), "m": getURLParameter('m'), "p": getURLParameter('p'), "sub": getURLParameter('sub'), "modulo": "SICON-AJUSTAR-CONVOCATORIAS-UPDATE"},
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
            if ($("#id").val() != "") {

                //Establesco los text area html
                if (CKEDITOR.env.ie && CKEDITOR.env.version < 9)
                    CKEDITOR.tools.enableHtml5Elements(document);

                CKEDITOR.config.height = 150;
                CKEDITOR.config.width = 'auto';
                CKEDITOR.replace('nuevo_descripcion');
                CKEDITOR.replace('descripcion');
                CKEDITOR.replace('descripcion_cp');

                $('#editar_convocatoria').on('hidden.bs.modal', function () {
                    CKEDITOR.instances.nuevo_descripcion.setData('');
                    $("#nuevo_nombre").val("");
                    $("#nuevo_orden").val("");
                    $("#nuevo_seudonimo option[value='false']").prop("selected", true);

                    $("#numero_estimulos").val("");
                    $("#valor_total_estimulos").val("");
                    $("#bolsa_concursable option[value='false']").prop("selected", true);
                    $("#descripcion_bolsa").val("");

                });

                //Limpio el formulario de los perfiles de los jurados
                $('#perfiles_jurados_modal').on('hidden.bs.modal', function () {
                    $("#id_cpj").attr('value', '');
                    $("#perfiles_jurados_modal select option:selected").removeAttr("selected");
                    $("#perfiles_jurados_modal select option:selected").prop("selected", false);
                    $("#perfiles_jurados_modal input[type=text] , #perfiles_jurados_modal textarea").each(function () {
                        this.value = ''
                    });
                });

                //Realizo la peticion para cargar el formulario
                $.ajax({
                    type: 'POST',
                    data: {"token": token_actual.token, "id": $("#id").attr('value')},
                    url: url_pv + 'Convocatoriaspublicas/search/'
                }).done(function (data) {
                    if (data == 'error_metodo')
                    {
                        notify("danger", "ok", "Convocatorias:", "Se registro un error en el método, comuníquese con la mesa de ayuda convocatorias@scrd.gov.co");
                    } else
                    {
                        if (data == 'error')
                        {
                            location.href = 'list.html?msg=Debe seleccionar una convocatoria, para poder continuar.&msg_tipo=danger';
                        } else
                        {
                            if (data == 'error_token')
                            {
                                notify("danger", "ok", "Convocatorias:", "Por favor actualizar la página, debido a que su sesión caduco");
                            } else
                            {
                                var json = JSON.parse(data);

                                if (typeof json.convocatoria.id === 'number') {

                                    $(".regresar").attr("onclick", "location.href='update_publicas.html?id=" + $("#id").attr('value') + "'");

                                    //Valido si la convocatoria tiene categorias
                                    if (json.convocatoria.tiene_categorias == false)
                                    {
                                        notify("danger", "ok", "Convocatorias:", "La convocatoria no tiene habilitada la opción de crear categorías, para habilitarla debe seleccionar (Sí) en el campo ¿Tiene categorias? de la seccion Información General.");
                                        $("#page-wrapper").css("display", "none");
                                    }

                                    //Valido si la convocatoria tiene categorias
                                    if (json.convocatoria.diferentes_categorias == false)
                                    {
                                        $(".diferentes_requisitos").css("display", "none");
                                    }

                                }
                            }
                        }
                    }
                });


                $('#detalle_especie_modal').on('hidden.bs.modal', function () {
                    $("#id_especie").attr("value", "");
                    $("#form_validator_especie").bootstrapValidator('disableSubmitButtons', false).bootstrapValidator('resetForm', true);
                    $("#form_validator_especie").data('bootstrapValidator').resetForm();
                });

                $('#distribucion_bolsa_modal').on('hidden.bs.modal', function () {
                    $("#id_bolsa").attr("value", "");
                    $("#form_validator_bolsa").bootstrapValidator('disableSubmitButtons', false).bootstrapValidator('resetForm', true);
                    $("#form_validator_bolsa").data('bootstrapValidator').resetForm();
                });


                //Cargar datos de la tabla de categorias
                cargar_tabla(token_actual);

            } else
            {
                location.href = 'list.html?msg=Debe seleccionar una convocatoria, para poder continuar.&msg_tipo=danger';
            }

            //guardar registro de convocatoria perfil participante
            $("#guardar_cp").click(function () {
                if ($("#id_cp").val() != "") {
                    //Realizo la peticion con el fin de editar el registro del perfil de la convocatoria

                    var values_perfil = {active: "TRUE", descripcion_perfil: CKEDITOR.instances.descripcion_cp.getData(), modulo: "SICON-AJUSTAR-CONVOCATORIAS", token: token_actual.token};

                    $.ajax({
                        type: 'PUT',
                        url: url_pv + 'Convocatoriasparticipantes/edit/' + $("#id_cp").attr('value'),
                        data: $.param(values_perfil)
                    }).done(function (result) {
                        if (result == 'error')
                        {
                            notify("danger", "ok", "Convocatorias:", "Se registro un error, comuníquese con la mesa de ayuda convocatorias@scrd.gov.co");
                        } else
                        {
                            if (result == 'acceso_denegado')
                            {
                                notify("danger", "remove", "Usuario:", "No tiene permisos para editar información.");
                            } else
                            {
                                if (result == 'error_token')
                                {
                                    notify("danger", "ok", "Convocatorias:", "Por favor actualizar la página, debido a que su sesión caduco");
                                } else
                                {
                                    if (isNaN(result))
                                    {
                                        notify("danger", "ok", "Convocatorias:", "Se registro un error, comuníquese con la mesa de ayuda convocatorias@scrd.gov.co");
                                    } else
                                    {
                                        notify("info", "ok", "Convocatorias:", "Se edito el perfil de participante con éxito.");
                                        //Activo en perfil de la convocatoria actual
                                        $(".tipo_participante_" + $("#id_tipo_participante").val()).attr('checked', true);
                                        $(".tipo_participante_" + $("#id_tipo_participante").val()).prop("checked", true);

                                        //Limpio el formulario
                                        $("#id_cp").attr('value', '');
                                        $("#id_tipo_participante").attr('value', '');
                                        CKEDITOR.instances.descripcion_cp.setData('');
                                        $("#tipo_participante_cp").html('');

                                        cargar_tabla_perfiles_participante(token_actual);
                                    }
                                }
                            }
                        }
                    });
                } else
                {
                    if ($("#id_tipo_participante").val() != "") {
                        //Se realiza la peticion con el fin de guardar el registro de la convocatoria participante
                        $.ajax({
                            type: 'POST',
                            url: url_pv + 'Convocatoriasparticipantes/new/',
                            data: "active=TRUE&descripcion_perfil=" + CKEDITOR.instances.descripcion_cp.getData() + "&convocatoria=" + $("#id_categoria").val() + "&tipo_participante=" + $("#id_tipo_participante").val() + "&modulo=SICON-AJUSTAR-CONVOCATORIAS&token=" + token_actual.token
                        }).done(function (result) {

                            if (result == 'error')
                            {
                                notify("danger", "ok", "Convocatorias:", "Se registro un error, comuníquese con la mesa de ayuda convocatorias@scrd.gov.co");
                            } else
                            {
                                if (result == 'acceso_denegado')
                                {
                                    notify("danger", "remove", "Convocatorias:", "No tiene permisos para editar información.");
                                } else
                                {
                                    if (result == 'error_token')
                                    {
                                        notify("danger", "ok", "Convocatorias:", "Por favor actualizar la página, debido a que su sesión caduco");
                                    } else
                                    {
                                        if (isNaN(result)) {
                                            notify("danger", "ok", "Convocatorias:", "Se registro un error, comuníquese con la mesa de ayuda convocatorias@scrd.gov.co");
                                        } else
                                        {
                                            notify("info", "ok", "Convocatorias:", "Se creo el perfil de participante con éxito.");

                                            //Activo en perfil de la convocatoria actual
                                            $(".tipo_participante_" + $("#id_tipo_participante").val()).attr('checked', true);
                                            $(".tipo_participante_" + $("#id_tipo_participante").val()).prop("checked", true);

                                            //Limpio el formulario
                                            $("#id_cp").attr('value', '');
                                            $("#id_tipo_participante").attr('value', '');
                                            CKEDITOR.instances.descripcion_cp.setData('');
                                            $("#tipo_participante_cp").html('');

                                            cargar_tabla_perfiles_participante(token_actual);
                                        }
                                    }
                                }
                            }

                        });
                    } else
                    {
                        notify("danger", "ok", "Convocatorias:", "No ha seleccionado ningun perfil del participante");
                    }
                }
            });

            validator_form(token_actual);
            $(".check_activar_t").attr("checked", "true");
        }
    }
});

function validator_form(token_actual) {
    //Validar el formulario de editar la categoria
    $('.form_edit_convocatoria').bootstrapValidator({
        feedbackIcons: {
            valid: 'glyphicon glyphicon-ok',
            invalid: 'glyphicon glyphicon-remove',
            validating: 'glyphicon glyphicon-refresh'
        },
        fields: {
            nombre: {
                validators: {
                    notEmpty: {message: 'El nombre de la convocatoria es requerido'}
                }
            },
            tipo_estimulo: {
                validators: {
                    notEmpty: {message: 'El tipo de estímulo es requerido'}
                }
            },
            valor_total_estimulos: {
                validators: {
                    notEmpty: {message: 'El valor total de recursos que entregará la convocatoria es requerido'},
                    numeric: {message: 'Debe ingresar solo numeros'}
                }
            },
            numero_estimulos: {
                validators: {
                    numeric: {message: 'Debe ingresar solo numeros'}
                }
            },
            orden: {
                validators: {
                    notEmpty: {message: 'El orden es requerido'},
                    numeric: {message: 'Debe ingresar solo numeros'}
                }
            },
        }
    }).on('success.form.bv', function (e) {
        // Prevent form submission
        e.preventDefault();
        // Get the form instance
        var $form = $(e.target);

        // Get the BootstrapValidator instance
        var bv = $form.data('bootstrapValidator');

        var values = $form.serializeArray();

        values.find(input => input.name == 'descripcion').value = CKEDITOR.instances.descripcion.getData();


        //Se realiza la peticion con el fin de guardar el registro actual
        $.ajax({
            type: 'PUT',
            url: url_pv + 'Convocatoriaspublicas/edit_categoria/' + $("#id").attr('value'),
            data: $.param(values) + "&modulo=SICON-AJUSTAR-CONVOCATORIAS&token=" + token_actual.token
        }).done(function (result) {

            if (result == 'error')
            {
                notify("danger", "ok", "Convocatorias:", "Se registro un error, comuníquese con la mesa de ayuda convocatorias@scrd.gov.co");
            } else
            {
                if (result == 'error_token')
                {
                    notify("danger", "ok", "Convocatorias:", "Por favor actualizar la página, debido a que su sesión caduco");
                } else
                {
                    if (result == 'acceso_denegado')
                    {
                        notify("danger", "remove", "Usuario:", "No tiene permisos para editar información.");
                    } else
                    {
                        if (isNaN(result)) {
                            notify("danger", "ok", "Convocatorias:", "Se registro un error, comuníquese con la mesa de ayuda convocatorias@scrd.gov.co");
                        } else
                        {
                            notify("success", "ok", "Convocatorias:", "Se edito la categoría con éxito.");
                            //Cargar datos de la tabla de categorias
                            cargar_tabla(token_actual);
                        }
                    }
                }
            }

        });
    });

    //Validar el formulario de la bolsa
    $('.form_validator_bolsa').bootstrapValidator({
        feedbackIcons: {
            valid: 'glyphicon glyphicon-ok',
            invalid: 'glyphicon glyphicon-remove',
            validating: 'glyphicon glyphicon-refresh'
        },
        fields: {
            orden: {
                validators: {
                    notEmpty: {message: 'El número de estímulos a otorgar es requerido'},
                    numeric: {message: 'Debe ingresar solo numeros'}
                }
            },
            valor_recurso: {
                validators: {
                    notEmpty: {message: 'El valor individual por estímulo es requerido'},
                    numeric: {message: 'Debe ingresar solo numeros'}
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

        // Enviar datos del formulario para guardar
        if ($("#id_bolsa").val() == "") {
            //Se realiza la peticion con el fin de guardar el registro actual
            $.ajax({
                type: 'POST',
                url: url_pv + 'Convocatoriasrecursos/new/',
                data: $form.serialize() + "&modulo=SICON-AJUSTAR-CONVOCATORIAS&token=" + token_actual.token + "&convocatoria=" + $("#id_categoria").attr('value')
            }).done(function (result) {

                if (result == 'error')
                {
                    notify("danger", "ok", "Convocatoria recurso:", "Se registro un error, comuníquese con la mesa de ayuda convocatorias@scrd.gov.co");
                } else
                {
                    if (result == 'acceso_denegado')
                    {
                        notify("danger", "remove", "Usuario:", "No tiene permisos para editar información.");
                    } else
                    {
                        if (isNaN(result)) {
                            notify("danger", "ok", "Convocatoria recurso:", "Se registro un error, comuníquese con la mesa de ayuda convocatorias@scrd.gov.co");
                        } else
                        {
                            notify("success", "ok", "Convocatoria recurso:", "Se creó el registro con éxito.");
                            cargar_tabla_registros(token_actual, 'tbody_distribuciones_bolsas', 'Bolsa');
                        }
                    }
                }

            });
        } else {
            //Realizo la peticion con el fin de editar el registro actual
            $.ajax({
                type: 'PUT',
                url: url_pv + 'Convocatoriasrecursos/edit/' + $("#id_bolsa").attr('value'),
                data: $form.serialize() + "&modulo=SICON-AJUSTAR-CONVOCATORIAS&token=" + token_actual.token
            }).done(function (result) {
                if (result == 'error')
                {
                    notify("danger", "ok", "Convocatoria recurso:", "Se registro un error, comuníquese con la mesa de ayuda convocatorias@scrd.gov.co");
                } else
                {
                    if (result == 'acceso_denegado')
                    {
                        notify("danger", "remove", "Usuario:", "No tiene permisos para editar información.");
                    } else
                    {
                        if (isNaN(result))
                        {
                            notify("danger", "ok", "Convocatoria recurso:", "Se registro un error, comuníquese con la mesa de ayuda convocatorias@scrd.gov.co");
                        } else
                        {
                            notify("info", "ok", "Convocatoria recurso:", "Se edito el registro con éxito.");
                            cargar_tabla_registros(token_actual, 'tbody_distribuciones_bolsas', 'Bolsa');
                        }
                    }
                }
            });
        }

        //Eliminó contenido del formulario
        $("#id_bolsa").attr("value", "");
        $form.bootstrapValidator('disableSubmitButtons', false).bootstrapValidator('resetForm', true);
        bv.resetForm();
    });

    //Validar el formulario de la especie
    $('.form_validator_especie').bootstrapValidator({
        feedbackIcons: {
            valid: 'glyphicon glyphicon-ok',
            invalid: 'glyphicon glyphicon-remove',
            validating: 'glyphicon glyphicon-refresh'
        },
        fields: {
            orden: {
                validators: {
                    notEmpty: {message: 'El orden es requerido'},
                    numeric: {message: 'Debe ingresar solo numeros'}
                }
            },
            recurso_no_pecuniario: {
                validators: {
                    notEmpty: {message: 'El tipo de estímulo no pecuniario es requerido'}
                }
            },
            valor_recurso: {
                validators: {
                    notEmpty: {message: 'La valoración del recurso no pecuniario es requerido'},
                    numeric: {message: 'Debe ingresar solo numeros'}
                }
            },
            descripcion_recurso: {
                validators: {
                    notEmpty: {message: 'La descripción del recurso no pecuniario es requerida'}
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

        // Enviar datos del formulario para guardar
        if ($("#id_especie").val() == "") {
            //Se realiza la peticion con el fin de guardar el registro actual
            $.ajax({
                type: 'POST',
                url: url_pv + 'Convocatoriasrecursos/new/',
                data: $form.serialize() + "&modulo=SICON-AJUSTAR-CONVOCATORIAS&token=" + token_actual.token + "&convocatoria=" + $("#id_categoria").attr('value')
            }).done(function (result) {

                if (result == 'error')
                {
                    notify("danger", "ok", "Convocatoria recurso:", "Se registro un error, comuníquese con la mesa de ayuda convocatorias@scrd.gov.co");
                } else
                {
                    if (result == 'acceso_denegado')
                    {
                        notify("danger", "remove", "Usuario:", "No tiene permisos para editar información.");
                    } else
                    {
                        if (result == 'error_token')
                        {
                            notify("danger", "ok", "Convocatorias:", "Por favor actualizar la página, debido a que su sesión caduco");
                        } else
                        {
                            if (isNaN(result)) {
                                notify("danger", "ok", "Convocatoria recurso:", "Se registro un error, comuníquese con la mesa de ayuda convocatorias@scrd.gov.co");
                            } else
                            {
                                notify("success", "ok", "Convocatoria recurso:", "Se creó el registro con éxito.");
                                cargar_tabla_registros(token_actual, 'tbody_distribuciones_especie', 'Especie');
                            }
                        }
                    }
                }

            });
        } else {
            //Realizo la peticion con el fin de editar el registro actual
            $.ajax({
                type: 'PUT',
                url: url_pv + 'Convocatoriasrecursos/edit/' + $("#id_especie").attr('value'),
                data: $form.serialize() + "&modulo=SICON-AJUSTAR-CONVOCATORIAS&token=" + token_actual.token
            }).done(function (result) {
                if (result == 'error')
                {
                    notify("danger", "ok", "Convocatoria recurso:", "Se registro un error, comuníquese con la mesa de ayuda convocatorias@scrd.gov.co");
                } else
                {
                    if (result == 'acceso_denegado')
                    {
                        notify("danger", "remove", "Usuario:", "No tiene permisos para editar información.");
                    } else
                    {
                        if (result == 'error_token')
                        {
                            notify("danger", "ok", "Convocatorias:", "Por favor actualizar la página, debido a que su sesión caduco");
                        } else
                        {
                            if (isNaN(result))
                            {
                                notify("danger", "ok", "Convocatoria recurso:", "Se registro un error, comuníquese con la mesa de ayuda convocatorias@scrd.gov.co");
                            } else
                            {
                                notify("info", "ok", "Convocatoria recurso:", "Se edito el registro con éxito.");
                                cargar_tabla_registros(token_actual, 'tbody_distribuciones_especie', 'Especie');
                            }
                        }
                    }
                }
            });
        }

        //Eliminó contenido del formulario
        $("#id_especie").attr("value", "");
        $form.bootstrapValidator('disableSubmitButtons', false).bootstrapValidator('resetForm', true);
        bv.resetForm();
    });

    //Validar el formulario principal
    $('.form_validator_jurado').bootstrapValidator({
        feedbackIcons: {
            valid: 'glyphicon glyphicon-ok',
            invalid: 'glyphicon glyphicon-remove',
            validating: 'glyphicon glyphicon-refresh'
        },
        fields: {
            myClass: {
                selector: '.validacion_general',
                validators: {
                    notEmpty: {
                        message: 'Este campo es requerido'
                    }
                }
            },
            descripcion_perfil: {
                validators: {
                    notEmpty: {message: 'El perfil del jurado es requerido'}
                }
            },
            campo_experiencia: {
                validators: {
                    notEmpty: {message: 'Los campos de experiencia son requeridos'}
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

        // Enviar datos del formulario para guardar
        if ($("#id_cpj").val() == "") {
            //Se realiza la peticion con el fin de guardar el registro actual
            $.ajax({
                type: 'POST',
                url: url_pv + 'Convocatoriasparticipantes/new/',
                data: $form.serialize() + "&tipo_participante=" + $("#tipo_participante").val() + "&modulo=SICON-AJUSTAR-CONVOCATORIAS&token=" + token_actual.token + "&convocatoria=" + $("#id_categoria").attr('value') + "&cantidad_perfil_jurado=" + $("#cantidad_perfil_jurado").val()
            }).done(function (result) {

                if (result == 'error')
                {
                    notify("danger", "ok", "Convocatoria perfil:", "Se registro un error, comuníquese con la mesa de ayuda convocatorias@scrd.gov.co");
                } else
                {
                    if (result == 'error_token')
                    {
                        notify("danger", "ok", "Convocatorias:", "Por favor actualizar la página, debido a que su sesión caduco");
                    } else
                    {
                        if (result == 'acceso_denegado')
                        {
                            notify("danger", "remove", "Usuario:", "No tiene permisos para editar información.");
                        } else
                        {
                            if (result == 'error_maximo_jurados')
                            {
                                notify("danger", "remove", "Convocatoria perfil:", "No puede exceder el máximo de perfiles como jurado para esta convocatoria.");
                            } else
                            {
                                if (isNaN(result)) {
                                    notify("danger", "ok", "Convocatoria perfil:", "Se registro un error, comuníquese con la mesa de ayuda convocatorias@scrd.gov.co");
                                } else
                                {
                                    cargar_tabla_perfiles_jurado(token_actual);
                                    notify("success", "ok", "Convocatoria perfil:", "Se creó el perfil del jurado con éxito.");
                                }
                            }
                        }
                    }
                }
            });
        } else {
            //Realizo la peticion con el fin de editar el registro actual
            $.ajax({
                type: 'PUT',
                url: url_pv + 'Convocatoriasparticipantes/edit/' + $("#id_cpj").attr('value'),
                data: $form.serialize() + "&modulo=SICON-AJUSTAR-CONVOCATORIAS&token=" + token_actual.token
            }).done(function (result) {
                if (result == 'error')
                {
                    notify("danger", "ok", "Convocatoria perfil:", "Se registro un error, comuníquese con la mesa de ayuda convocatorias@scrd.gov.co");
                } else
                {
                    if (result == 'error_token')
                    {
                        notify("danger", "ok", "Convocatorias:", "Por favor actualizar la página, debido a que su sesión caduco");
                    } else
                    {
                        if (result == 'acceso_denegado')
                        {
                            notify("danger", "remove", "Usuario:", "No tiene permisos para editar información.");
                        } else
                        {
                            if (isNaN(result))
                            {
                                notify("danger", "ok", "Convocatoria perfil:", "Se registro un error, comuníquese con la mesa de ayuda convocatorias@scrd.gov.co");
                            } else
                            {
                                cargar_tabla_perfiles_jurado(token_actual);

                                notify("info", "ok", "Convocatoria perfil:", "Se edito el perfil del jurado con éxito.");
                            }
                        }
                    }
                }
            });
        }

        $("#perfiles_jurados_modal select option:selected").removeAttr("selected");
        $("#perfiles_jurados_modal select option:selected").prop("selected", false);
        $("#perfiles_jurados_modal input[type=text] , #perfiles_jurados_modal textarea").each(function () {
            this.value = ''
        });

        //Eliminó contenido del formulario
        $("#id_cpj").attr("value", "");
        $form.bootstrapValidator('disableSubmitButtons', false).bootstrapValidator('resetForm', true);
        bv.resetForm();
    });
}

function cargar_tabla(token_actual)
{
    $('#table_categorias').DataTable({
        "language": {
            "url": "../../dist/libraries/datatables/js/spanish.json"
        },
        "processing": true,
        "destroy": true,
        "serverSide": true,
        "lengthMenu": [20, 30, 40],
        columnDefs: [
            {orderable: false, targets: '_all'}
        ],
        "ajax": {
            url: url_pv + "Convocatoriaspublicas/all",
            data: {"token": token_actual.token, "convocatoria": $("#id").attr('value')},
            type: "POST"            
        },
        "drawCallback": function (settings) {
            $(".check_activar_t").attr("checked", "true");
            $(".check_activar_f").removeAttr("checked");
            acciones_categoria(token_actual);
        },
        "columns": [
            {"data": "orden"},
            {"data": "nombre"},
            {"data": "descripcion"},
            {"data": "activar_registro"},
            {"data": "acciones"}
        ]
    });

}

function acciones_categoria(token_actual)
{
    //Valido si tiene bolsa concursable                                    
    $('#tipo_estimulo').on('change', function () {
        if ($(this).val() == 2 || $(this).val() == 3)
        {
            $(".class_tipo_estimulo").removeAttr("disabled");
        } else
        {
            $(".class_tipo_estimulo").attr("disabled", "disabled");
        }

    });

    //Valido si tiene bolsa concursable
    $("#bolsa_concursable").on('change', function () {
        if ($(this).val() == "true")
        {
            $(".class_bolsa_concursable").removeAttr("disabled");
            $("input[name='numero_estimulos']").attr("disabled", "disabled");
            $("input[name='numero_estimulos']").val("");
        } else
        {
            $("input[name='numero_estimulos']").removeAttr("disabled");
            $(".class_bolsa_concursable").attr("disabled", "disabled");
        }
    });

    //Limpio el formulario de los perfiles de los participantes
    $('#editar_convocatoria').on('hidden.bs.modal', function () {
        $("#id_cp").attr('value', '');
        CKEDITOR.instances.descripcion_cp.setData('');
        $("#tipo_participante_cp").html('');
    })

    //Permite realizar la carga respectiva de la categoria
    $(".btn_categoria").click(function () {
        $("#id_categoria").attr('value', $(this).attr("title"));
        $("#convocatoria_padre_categoria").attr('value', getURLParameter('id'));


        //Realizo la peticion para cargar el formulario
        $.ajax({
            type: 'POST',
            data: {"token": token_actual.token, "id": $(this).attr("title")},
            url: url_pv + 'Convocatoriaspublicas/search/'
        }).done(function (data) {
            if (data == 'error_metodo')
            {
                notify("danger", "ok", "Convocatorias:", "Se registro un error en el método, comuníquese con la mesa de ayuda convocatorias@scrd.gov.co");
            } else
            {
                if (data == 'error')
                {
                    notify("danger", "ok", "Convocatorias:", "El convocatoria no se encuentra registrado, por favor registrarse");
                } else
                {
                    var json = JSON.parse(data);

                    //Cargo los checks de quienes pueden participar
                    $('#quienes_pueden_participar').html("<label>¿Quién puede participar?</label><br/>");
                    $("#tbody_tipos_participantes").find("tr").remove();
                    if (json.tipos_participantes.length > 0) {
                        $.each(json.tipos_participantes, function (key, tipo_participante) {
                            var checked = '';
                            if (tipo_participante.active == true)
                            {
                                checked = 'checked="checked"';
                            }

                            $("#quienes_pueden_participar").append('<label class="checkbox-inline"><input class="tipo_participante tipo_participante_' + tipo_participante.id + '" value="' + tipo_participante.id + '" type="checkbox" ' + checked + ' disabled="disabled">' + tipo_participante.nombre + '</label>');

                            $("#tbody_tipos_participantes").append('<tr><td>' + tipo_participante.nombre + '</td><td><button type="button" class="btn btn-warning btn-update-convocatoria-participante" lang="' + tipo_participante.id_cp + '" title="' + tipo_participante.id + '" dir="' + tipo_participante.nombre + '"><span class="glyphicon glyphicon-edit"></span></button></td></tr>');
                        });
                    }

                    //Cargo los perfiles de los jurados en esta convocatoria
                    $("#tbody_perfiles_jurados").find("tr").remove();
                    if (json.perfiles_jurados.length > 0) {
                        $.each(json.perfiles_jurados, function (key, perfil_jurado) {
                            var checked = '';
                            if (perfil_jurado.active == true)
                            {
                                checked = "checked='checked'";
                            }
                            $("#tbody_perfiles_jurados").append('<tr><td>' + perfil_jurado.orden + '</td><td>' + perfil_jurado.descripcion_perfil + '</td><td><input onclick="activar_perfil_jurado(' + perfil_jurado.id + ',' + $("#id").attr('value') + ',\'' + token_actual.token + '\')" type="checkbox" ' + checked + '></td><td><button type="button" class="btn btn-warning btn-update-convocatoria-jurados-' + perfil_jurado.id + '" onclick="cargar_perfil_jurado(' + perfil_jurado.id + ')" lang="' + JSON.stringify(perfil_jurado).replace(/\"/g, "&quot;") + '"><span class="glyphicon glyphicon-edit"></span></button></td></tr>');
                        });
                    }

                    //Cargo los la distribucion de bolsas
                    $("#tbody_distribuciones_bolsas").find("tr").remove();
                    if (json.distribuciones_bolsas.length > 0) {
                        $.each(json.distribuciones_bolsas, function (key, distribucion_bolsa) {
                            var checked = '';
                            if (distribucion_bolsa.active == true)
                            {
                                checked = "checked='checked'";
                            }
                            $("#tbody_distribuciones_bolsas").append('<tr><td>' + distribucion_bolsa.orden + '</td><td>' + distribucion_bolsa.valor_recurso + '</td><td><input onclick="activar_registro(' + distribucion_bolsa.id + ',\'' + token_actual.token + '\')" type="checkbox" ' + checked + '></td><td><button type="button" class="btn btn-warning btn-update-distribucion-registro-' + distribucion_bolsa.id + '" onclick="cargar_registro(' + distribucion_bolsa.id + ',\'form_validator_bolsa\')" lang="' + JSON.stringify(distribucion_bolsa).replace(/\"/g, "&quot;") + '"><span class="glyphicon glyphicon-edit"></span></button></td></tr>');
                        });
                    }

                    //Cargo los la distribucion de especies
                    $("#tbody_distribuciones_especie").find("tr").remove();
                    if (json.distribuciones_especies.length > 0) {
                        $.each(json.distribuciones_especies, function (key, distribucion_especie) {
                            var checked = '';
                            if (distribucion_especie.active == true)
                            {
                                checked = "checked='checked'";
                            }
                            $("#tbody_distribuciones_especie").append('<tr><td>' + distribucion_especie.orden + '</td><td>' + distribucion_especie.nombre_recurso_no_pecuniario + '</td><td>' + distribucion_especie.valor_recurso + '</td><td><input onclick="activar_registro(' + distribucion_especie.id + ',\'' + token_actual.token + '\')" type="checkbox" ' + checked + '></td><td><button type="button" class="btn btn-warning btn-update-distribucion-registro-' + distribucion_especie.id + '" onclick="cargar_registro(' + distribucion_especie.id + ',\'form_validator_especie\')" lang="' + JSON.stringify(distribucion_especie).replace(/\"/g, "&quot;") + '"><span class="glyphicon glyphicon-edit"></span></button></td></tr>');
                        });
                    }

                    //para habilitar formulario de convocatoria participante
                    $(".btn-update-convocatoria-participante").click(function () {
                        $("#id_cp").val($(this).attr("lang"));
                        $("#id_tipo_participante").val($(this).attr("title"));
                        $("#tipo_participante_cp").html($(this).attr("dir"));

                        //Se carga el contenido html debido a que estaba presentando problemas al cargarlo desde una propiedad html
                        $.ajax({
                            type: 'POST',
                            data: {"token": token_actual.token},
                            url: url_pv + 'Convocatoriasparticipantes/search/' + $(this).attr("lang")
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
                                    if (data == 'error')
                                    {
                                        notify("danger", "ok", "Usuarios:", "Se registro un error en el método, comuníquese con la mesa de ayuda convocatorias@scrd.gov.co");
                                    } else
                                    {
                                        var json = JSON.parse(data);
                                        CKEDITOR.instances.descripcion_cp.setData(json.descripcion_perfil);
                                    }
                                }
                            }
                        });

                    });

                    //Creamos los participantes en la convocatoria
                    $('.tipo_participante').click(function () {
                        var tipo_participante = $(this).val();
                        if ($(this).prop('checked')) {
                            //Se realiza la peticion con el fin de guardar el registro de la convocatoria participante
                            $.ajax({
                                type: 'POST',
                                url: url_pv + 'Convocatoriasparticipantes/new/',
                                data: "convocatoria=" + $("#id_categoria").val() + "&tipo_participante=" + $(this).val() + "&modulo=SICON-AJUSTAR-CONVOCATORIAS&token=" + token_actual.token
                            }).done(function (result) {

                                if (result == 'error')
                                {
                                    notify("danger", "ok", "Convocatorias:", "Se registro un error, comuníquese con la mesa de ayuda convocatorias@scrd.gov.co");
                                } else
                                {
                                    if (result == 'acceso_denegado')
                                    {
                                        notify("danger", "remove", "Convocatorias:", "No tiene permisos para editar información.");
                                    } else
                                    {
                                        if (result == 'error_token')
                                        {
                                            notify("danger", "ok", "Convocatorias:", "Por favor actualizar la página, debido a que su sesión caduco");
                                        } else
                                        {
                                            if (isNaN(result)) {
                                                notify("danger", "ok", "Convocatorias:", "Se registro un error, comuníquese con la mesa de ayuda convocatorias@scrd.gov.co");
                                            } else
                                            {
                                                notify("success", "ok", "Convocatorias:", "Se creó el perfil del participante con éxito.");
                                                cargar_tabla_perfiles_participante(token_actual)
                                            }
                                        }
                                    }
                                }

                            });
                        } else
                        {
                            //Se realiza la peticion para desactivar la convocatoria participante
                            $.ajax({
                                type: 'DELETE',
                                data: {"token": token_actual.token, "modulo": "SICON-AJUSTAR-CONVOCATORIAS", "convocatoria": $("#id_categoria").val(), "tipo_participante": $(this).val()},
                                url: url_pv + 'Convocatoriasparticipantes/delete'
                            }).done(function (data) {
                                if (data == 'Si' || data == 'No')
                                {
                                    if (data == 'Si')
                                    {
                                        notify("info", "ok", "Convocatorias:", "Se activó el perfil del participante con éxito.");
                                    } else
                                    {
                                        notify("info", "ok", "Convocatorias:", "Se inactivo el perfil del participante con éxito.");
                                    }
                                } else
                                {
                                    if (data == 'acceso_denegado')
                                    {
                                        notify("danger", "remove", "Convocatorias:", "Acceso denegado.");
                                    } else
                                    {
                                        notify("danger", "ok", "Convocatorias:", "Se registro un error en el método, comuníquese con la mesa de ayuda convocatorias@scrd.gov.co");
                                    }
                                }
                            });
                        }
                    });

                    //Cargo el select de los recursos no pecuniarios
                    $('#recurso_no_pecuniario').find('option').remove();
                    $("#recurso_no_pecuniario").append('<option value="">:: Seleccionar ::</option>');
                    if (json.recursos_no_pecunarios.length > 0) {
                        $.each(json.recursos_no_pecunarios, function (key, recurso_no_pecuniario) {
                            $("#recurso_no_pecuniario").append('<option value="' + recurso_no_pecuniario.id + '" >' + recurso_no_pecuniario.nombre + '</option>');
                        });
                    }

                    //Cargo el select de tipos de estimulos
                    $('#tipo_estimulo').find('option').remove();
                    $("#tipo_estimulo").append('<option value="">:: Seleccionar ::</option>');
                    if (json.tipos_estimulos.length > 0) {
                        $.each(json.tipos_estimulos, function (key, tipo_estimulo) {
                            var selected = '';
                            if (tipo_estimulo.id == json.convocatoria.tipo_estimulo)
                            {
                                selected = 'selected="selected"';
                            }
                            $("#tipo_estimulo").append('<option value="' + tipo_estimulo.id + '" ' + selected + ' >' + tipo_estimulo.nombre + '</option>');
                        });
                    }

                    //Habilito los modales dependiendo del tipo de estimulo
                    if ($("#tipo_estimulo").val() == 2 || $("#tipo_estimulo").val() == 3)
                    {
                        $(".class_tipo_estimulo").removeAttr("disabled");
                    } else
                    {
                        $(".class_tipo_estimulo").attr("disabled", "disabled");
                    }

                    //Habilito los modales dependiendo del tipo de estimulo
                    if ($("#tipo_estimulo").val() == 2)
                    {
                        $(".class_bolsa_concursable").attr("disabled", "disabled");
                    } else
                    {
                        $(".class_bolsa_concursable").removeAttr("disabled");
                    }

                    $('#form_edit_convocatoria').loadJSON(json.convocatoria);
                    //Se realiza este set debido a que los boolean no lo toma con load json
                    $("#seudonimo option[value='" + json.convocatoria.seudonimo + "']").prop('selected', true);
                    $("#bolsa_concursable option[value='" + json.convocatoria.bolsa_concursable + "']").prop('selected', true);
                    $("#descripcion_bolsa").val(json.convocatoria.descripcion_bolsa);
                    //Verifico si es bolsa concursable
                    if ($("#bolsa_concursable").val() == "true")
                    {
                        $(".class_bolsa_concursable").removeAttr("disabled");
                        $("input[name='numero_estimulos']").attr("disabled", "disabled");
                        $("input[name='numero_estimulos']").val("");
                    } else
                    {
                        $(".class_bolsa_concursable").attr("disabled", "disabled");
                        $("input[name='numero_estimulos']").removeAttr("disabled");
                    }

                    //Se realiza este set en cada text area html debido a que jste no es compatible con load json                    
                    CKEDITOR.instances.descripcion.setData(json.convocatoria.descripcion);
                    $("#orden").val(json.convocatoria.orden);

                    //Cargo el select de cantidad de jurados
                    $('#cantidad_perfil_jurado').find('option').remove();
                    $('#orden_perfil_jurado').find('option').remove();
                    $("#cantidad_perfil_jurado").append('<option value="">:: Seleccionar ::</option>');
                    if (json.cantidad_perfil_jurados.length > 0) {
                        $.each(json.cantidad_perfil_jurados, function (key, cantidad_perfil_jurado) {
                            var selected = '';
                            if (cantidad_perfil_jurado == json.convocatoria.cantidad_perfil_jurado)
                            {
                                selected = 'selected="selected"';
                            }
                            $("#cantidad_perfil_jurado").append('<option value="' + cantidad_perfil_jurado + '" ' + selected + ' >' + cantidad_perfil_jurado + '</option>');
                            $("#orden_perfil_jurado").append('<option value="' + cantidad_perfil_jurado + '" >' + cantidad_perfil_jurado + '</option>');
                        });
                    }

                    //Cargo el select de areas de conocimientos
                    $('#area_conocimiento').find('option').remove();
                    if (json.areas_conocimientos.length > 0) {
                        $.each(json.areas_conocimientos, function (key, area_conocimiento) {
                            $("#area_conocimiento").append('<option value="' + area_conocimiento.nombre + '" >' + area_conocimiento.nombre + '</option>');
                        });
                    }

                    //Cargo el select de niveles educativos
                    $('#nivel_educativo').find('option').remove();
                    if (json.niveles_educativos.length > 0) {
                        $.each(json.niveles_educativos, function (key, nivel_educativo) {
                            $("#nivel_educativo").append('<option value="' + nivel_educativo.nombre + '" >' + nivel_educativo.nombre + '</option>');
                        });
                    }

                    //Cargo el select de areas
                    $('#area_perfil').find('option').remove();
                    if (json.areas.length > 0) {
                        $.each(json.areas, function (key, area) {
                            $("#area_perfil").append('<option value="' + area.nombre + '" >' + area.nombre + '</option>');
                        });
                    }



                }
            }
        });


    });

    //Permite activar o eliminar una categoria
    $(".activar_categoria").click(function () {

        var active = "false";
        if ($(this).prop('checked')) {
            active = "true";
        }


        $.ajax({
            type: 'DELETE',
            data: {"token": token_actual.token, "modulo": "SICON-AJUSTAR-CONVOCATORIAS", "active": active},
            url: url_pv + 'Convocatoriaspublicas/delete_categoria/' + $(this).attr("title")
        }).done(function (data) {
            if (data == 'ok')
            {
                if (active == "true")
                {
                    notify("info", "ok", "Convocatorias:", "Se activó la categoría con éxito.");
                } else
                {
                    notify("info", "ok", "Convocatorias:", "Se inactivo la categoría con éxito.");
                }
            } else
            {
                if (data == 'acceso_denegado')
                {
                    notify("danger", "remove", "Convocatorias:", "Acceso denegado.");
                } else
                {
                    notify("danger", "ok", "Convocatorias:", "Se registro un error en el método, comuníquese con la mesa de ayuda convocatorias@scrd.gov.co");
                }
            }
        });
    });
}

//Carga la tabla de los recursos de la convocatoria
function cargar_tabla_registros(token_actual, tbody, tipo_recurso) {
    $.ajax({
        type: 'POST',
        data: {"token": token_actual.token, "convocatoria": $("#id_categoria").val(), "tipo_recurso": tipo_recurso},
        url: url_pv + 'Convocatoriasrecursos/select_convocatoria'
    }).done(function (data) {
        if (data == 'error_metodo')
        {
            notify("danger", "ok", "Usuarios:", "Se registro un error en el método, comuníquese con la mesa de ayuda convocatorias@scrd.gov.co");
        } else
        {
            if (data == 'error')
            {
                notify("danger", "ok", "Usuarios:", "El usuario no se encuentra registrado, por favor registrarse");
            } else
            {
                var json = JSON.parse(data);
                if (json.length > 0) {
                    $("#" + tbody).find("tr").remove();
                    $.each(json, function (key, distribucion_bolsa) {
                        var checked = '';
                        if (distribucion_bolsa.active == true)
                        {
                            checked = "checked='checked'";
                        }

                        if (tipo_recurso == "Bolsa")
                        {

                            $("#" + tbody).append('<tr><td>' + distribucion_bolsa.orden + '</td><td>' + distribucion_bolsa.valor_recurso + '</td><td><input onclick="activar_registro(' + distribucion_bolsa.id + ',\'' + token_actual.token + '\')" type="checkbox" ' + checked + '></td><td><button type="button" class="btn btn-warning btn-update-distribucion-registro-' + distribucion_bolsa.id + '" onclick="cargar_registro(' + distribucion_bolsa.id + ',\'form_validator_bolsa\')" lang="' + JSON.stringify(distribucion_bolsa).replace(/\"/g, "&quot;") + '"><span class="glyphicon glyphicon-edit"></span></button></td></tr>');
                        } else
                        {
                            $("#" + tbody).append('<tr><td>' + distribucion_bolsa.orden + '</td><td>' + distribucion_bolsa.nombre_recurso_no_pecuniario + '</td><td>' + distribucion_bolsa.valor_recurso + '</td><td><input onclick="activar_registro(' + distribucion_bolsa.id + ',\'' + token_actual.token + '\')" type="checkbox" ' + checked + '></td><td><button type="button" class="btn btn-warning btn-update-distribucion-registro-' + distribucion_bolsa.id + '" onclick="cargar_registro(' + distribucion_bolsa.id + ',\'form_validator_especie\')" lang="' + JSON.stringify(distribucion_bolsa).replace(/\"/g, "&quot;") + '"><span class="glyphicon glyphicon-edit"></span></button></td></tr>');
                        }


                    });
                }
            }
        }
    });
}

//Funcion para activar o desactivar los recursos del estimulo
function activar_registro(id, token_actual) {
    $.ajax({
        type: 'DELETE',
        data: {"token": token_actual, "modulo": "SICON-AJUSTAR-CONVOCATORIAS"},
        url: url_pv + 'Convocatoriasrecursos/delete/' + id
    }).done(function (data) {
        if (data == 'Si' || data == 'No')
        {
            if (data == 'Si')
            {
                notify("info", "ok", "Convocatoria recurso:", "Se activó el registro con éxito.");
            } else
            {
                notify("danger", "ok", "Convocatoria recurso:", "Se inactivo el registro con éxito.");
            }
        } else
        {
            if (data == 'acceso_denegado')
            {
                notify("danger", "remove", "Convocatorias:", "Acceso denegado.");
            } else
            {
                notify("danger", "ok", "Convocatorias:", "Se registro un error en el método, comuníquese con la mesa de ayuda convocatorias@scrd.gov.co");
            }
        }
    });
}

//Carga el registro el registro del recurso de la convocatoria
function cargar_registro(id, form) {
    var json_update = JSON.parse($(".btn-update-distribucion-registro-" + id).attr("lang"));
    $('#' + form).loadJSON(json_update);
}

//Funcion para activar o desactivar participante
function activar_participante(tipo_participante, convocatoria, token_actual) {
    //Se realiza la peticion para desactivar la convocatoria participante
    $.ajax({
        type: 'DELETE',
        data: {"token": token_actual, "modulo": "SICON-AJUSTAR-CONVOCATORIAS", "convocatoria": convocatoria, "tipo_participante": tipo_participante},
        url: url_pv + 'Convocatoriasparticipantes/delete'
    }).done(function (data) {
        if (data == 'Si' || data == 'No')
        {
            if (data == 'Si')
            {
                notify("info", "ok", "Convocatorias:", "Se activó el perfil del participante con éxito.");
                $(".tipo_participante_" + tipo_participante).attr('checked', true);
                $(".tipo_participante_" + tipo_participante).prop("checked", true);
            } else
            {
                notify("info", "ok", "Convocatorias:", "Se inactivo el perfil del participante con éxito.");
                $(".tipo_participante_" + tipo_participante).attr('checked', false);
                $(".tipo_participante_" + tipo_participante).prop("checked", false);
            }
        } else
        {
            if (data == 'acceso_denegado')
            {
                notify("danger", "remove", "Convocatorias:", "Acceso denegado.");
            } else
            {
                notify("danger", "ok", "Convocatorias:", "Se registro un error en el método, comuníquese con la mesa de ayuda convocatorias@scrd.gov.co");
            }
        }
    });
}

//Carga la tabla de los perfiles de los participantes
function cargar_tabla_perfiles_participante(token_actual) {
    $.ajax({
        type: 'POST',
        data: {"token": token_actual.token, "convocatoria": $("#id_categoria").val()},
        url: url_pv + 'Convocatoriasparticipantes/select_form_convocatoria'
    }).done(function (data) {
        if (data == 'error_metodo')
        {
            notify("danger", "ok", "Usuarios:", "Se registro un error en el método, comuníquese con la mesa de ayuda convocatorias@scrd.gov.co");
        } else
        {
            if (data == 'error')
            {
                notify("danger", "ok", "Usuarios:", "El usuario no se encuentra registrado, por favor registrarse");
            } else
            {
                var json = JSON.parse(data);
                if (json.length > 0) {
                    $("#tbody_tipos_participantes").find("tr").remove();
                    $.each(json, function (key, tipo_participante) {
                        var checked = '';
                        if (tipo_participante.active == true)
                        {
                            checked = "checked='checked'";
                        }
                        $("#tbody_tipos_participantes").append('<tr><td>' + tipo_participante.nombre + '</td><td><button type="button" class="btn btn-warning btn-update-convocatoria-participante" lang="' + tipo_participante.id_cp + '" title="' + tipo_participante.id + '" dir="' + tipo_participante.nombre + '"><span class="glyphicon glyphicon-edit"></span></button></td></tr>');
                    });

                    //para habilitar formulario de convocatoria participante
                    $(".btn-update-convocatoria-participante").click(function () {
                        $("#id_cp").val($(this).attr("lang"));
                        $("#id_tipo_participante").val($(this).attr("title"));
                        $("#tipo_participante_cp").html($(this).attr("dir"));

                        //Se carga el contenido html debido a que estaba presentando problemas al cargarlo desde una propiedad html
                        $.ajax({
                            type: 'POST',
                            data: {"token": token_actual.token},
                            url: url_pv + 'Convocatoriasparticipantes/search/' + $(this).attr("lang")
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
                                    if (data == 'error')
                                    {
                                        notify("danger", "ok", "Usuarios:", "Se registro un error en el método, comuníquese con la mesa de ayuda convocatorias@scrd.gov.co");
                                    } else
                                    {
                                        var json = JSON.parse(data);
                                        CKEDITOR.instances.descripcion_cp.setData(json.descripcion_perfil);
                                    }
                                }
                            }
                        });

                    });
                }
            }
        }
    });
}

//Carga el registro del perfil del jurado sobre el formulario
function cargar_perfil_jurado(id) {
    var json_update = JSON.parse($(".btn-update-convocatoria-jurados-" + id).attr("lang"));
    $("#formacion_profesional option[value='" + json_update.formacion_profesional + "']").prop('selected', true);
    $("#formacion_postgrado option[value='" + json_update.formacion_postgrado + "']").prop('selected', true);
    $("#reside_bogota option[value='" + json_update.reside_bogota + "']").prop('selected', true);
    $("#orden_perfil_jurado option[value='" + json_update.orden + "']").prop('selected', true);

    $("#area_conocimiento option:selected").removeAttr("selected");
    $("#area_conocimiento option:selected").prop("selected", false);
    $.each(JSON.parse(json_update.area_conocimiento), function (i, e) {
        $("#area_conocimiento option[value='" + e + "']").prop("selected", true);
    });

    $("#area_perfil option:selected").removeAttr("selected");
    $("#area_perfil option:selected").prop("selected", false);
    $.each(JSON.parse(json_update.area_perfil), function (i, e) {
        $("#area_perfil option[value='" + e + "']").prop("selected", true);
    });

    $("#nivel_educativo option:selected").removeAttr("selected");
    $("#nivel_educativo option:selected").prop("selected", false);
    $.each(JSON.parse(json_update.nivel_educativo), function (i, e) {
        $("#nivel_educativo option[value='" + e + "']").prop("selected", true);
    });

    $("#descripcion_perfil").val(json_update.descripcion_perfil);
    $("#campo_experiencia").val(json_update.campo_experiencia);
    $("#id_cpj").val(json_update.id);
}

//Carga la tabla de los perfiles de los jurados
function cargar_tabla_perfiles_jurado(token_actual) {
    $.ajax({
        type: 'POST',
        data: {"token": token_actual.token, "convocatoria": $("#id_categoria").val(), "tipo_participante": 4},
        url: url_pv + 'Convocatoriasparticipantes/select'
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
                var json = JSON.parse(data);
                if (json.length > 0) {
                    $("#tbody_perfiles_jurados").find("tr").remove();
                    $.each(json, function (key, perfil_jurado) {
                        var checked = '';
                        if (perfil_jurado.active == true)
                        {
                            checked = "checked='checked'";
                        }
                        $("#tbody_perfiles_jurados").append('<tr><td>' + perfil_jurado.orden + '</td><td>' + perfil_jurado.descripcion_perfil + '</td><td><input onclick="activar_perfil_jurado(' + perfil_jurado.id + ',' + $("#id").attr('value') + ',\'' + token_actual.token + '\')" type="checkbox" ' + checked + '></td><td><button type="button" class="btn btn-warning btn-update-convocatoria-jurados-' + perfil_jurado.id + '" onclick="cargar_perfil_jurado(' + perfil_jurado.id + ')" lang="' + JSON.stringify(perfil_jurado).replace(/\"/g, "&quot;") + '"><span class="glyphicon glyphicon-edit"></span></button></td></tr>');
                    });
                }
            }
        }
    });
}

//Funcion para activar o desactivar el perfil de los jurados
function activar_perfil_jurado(id, convocatoria, token_actual) {
    //Se realiza la peticion para desactivar la convocatoria participante
    $.ajax({
        type: 'DELETE',
        data: {"token": token_actual, "modulo": "SICON-AJUSTAR-CONVOCATORIAS", "convocatoria": convocatoria},
        url: url_pv + 'Convocatoriasparticipantes/delete_perfil_jurado/' + id
    }).done(function (data) {
        if (data == 'error_token')
        {
            notify("danger", "ok", "Convocatorias:", "Por favor actualizar la página, debido a que su sesión caduco");
        } else
        {
            if (data == 'Si' || data == 'No')
            {
                if (data == 'Si')
                {
                    notify("info", "ok", "Convocatorias:", "Se activó el perfil del jurado con éxito.");
                } else
                {
                    notify("info", "ok", "Convocatorias:", "Se inactivo el perfil del jurado con éxito.");
                }
            } else
            {
                if (data == 'acceso_denegado')
                {
                    notify("danger", "remove", "Convocatorias:", "Acceso denegado.");
                } else
                {
                    notify("danger", "ok", "Convocatorias:", "Se registro un error en el método, comuníquese con la mesa de ayuda convocatorias@scrd.gov.co");
                }
            }
        }
    });
}