$(document).ready(function () {

    //Verifico si el token exite en el cliente y verifico que el token este activo en el servidor                
    var token_actual = getLocalStorage(name_local_storage);

    var href_regresar = "";
    var href_siguiente = "";
    //Creando link de navegación
    if (getURLParameter('m') == "pj")
    {
        href_regresar = "grupos_trabajos.html?m=" + getURLParameter('m') + "&id=" + getURLParameter('id') + "&p=" + getURLParameter('p');
        href_siguiente = "territorios_poblaciones.html?m=" + getURLParameter('m') + "&id=" + getURLParameter('id') + "&p=" + getURLParameter('p');
    }

    $("#link_equipo").attr("onclick", "location.href = '" + href_regresar + "'");
    $("#link_territorio").attr("onclick", "location.href = '" + href_siguiente + "'");

    //Verifico si el token esta vacio, para enviarlo a que ingrese de nuevo
    if ($.isEmptyObject(token_actual)) {
        location.href = url_pv_admin + 'index.html?msg=Su sesión ha expirado, por favor vuelva a ingresar.&msg_tipo=danger';
    } else
    {
        //Valido el id de la propuesta
        if (Number.isInteger(parseInt(getURLParameter('p'))))
        {

            $('.separador_miles').number(true);


            $('.semana').datetimepicker({
                language: 'es',
                daysOfWeekDisabled: [0, 2, 3, 4, 5, 6],
                weekStart: 1,
                todayBtn: 0,
                autoclose: 1,
                todayHighlight: 1,
                startView: 2,
                minView: 2,
                forceParse: 0
            }).on('changeDate', function (ev) {

                //Capturo la fecha del calendario
                var fecha = new Date(ev.date).toISOString().substring(0, 10);

                $.ajax({
                    type: 'POST',
                    url: url_pv + 'PropuestasPdac/validar_periodo_ejecucion',
                    data: "modulo=Menu Participante&token=" + token_actual.token + "&m=" + getURLParameter('m') + "&conv=" + getURLParameter('id') + "&p=" + getURLParameter('p') + "&fecha=" + fecha
                }).done(function (result) {

                    if (result == 'error')
                    {
                        notify("danger", "ok", "Propuesta:", "Se registro un error, comuníquese con la mesa de ayuda convocatorias@scrd.gov.co");
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
                                if (!Boolean(result))
                                {
                                    notify("danger", "remove", "Usuario:", "La semana de ejecución, esta fuera del periodo permitido para la ejecución de su propuesta.");
                                    $("#fecha").val('');
                                    $("#form_nuevo_cronograma").data('bootstrapValidator').resetForm();
                                    $("#form_nuevo_cronograma").bootstrapValidator('resetForm', true);
                                }
                            }
                        }
                    }
                });
            });


            //Realizo la peticion para validar acceso a la convocatoria
            $.ajax({
                type: 'POST',
                data: {"token": token_actual.token, "p": getURLParameter('p')},
                url: url_pv + 'PropuestasBusquedasConvocatorias/validar_acceso/' + $("#id").val()
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
                            notify("danger", "ok", "Convocatorias:", "La convocatoria ya no se encuentra disponible para inscribir su propuesta.");
                        } else
                        {
                            if (data == 'error_fecha_apertura')
                            {
                                notify("danger", "ok", "Convocatorias:", "La convocatoria esta en estado publicada, por favor revisar la fecha de apertura en el cronograma de la convocatoria.");
                            } else
                            {
                                if (data == 'error_maximo')
                                {
                                    location.href = url_pv_admin + 'pages/propuestas/propuestas_busqueda_convocatorias.html?msg=Ya tiene el máximo de propuestas guardadas permitidas para esta convocatoria, para visualizar sus propuestas por favor ingrese al menú Mis propuestas.&msg_tipo=danger';
                                } else
                                {
                                    if (data == 'error_propuesta')
                                    {
                                        location.href = url_pv_admin + 'pages/propuestas/propuestas_busqueda_convocatorias.html?msg=El código de la propuesta no es valido.&msg_tipo=danger';
                                    } else
                                    {
                                        if (data == 'error_participante')
                                        {
                                            location.href = url_pv_admin + 'pages/index/index.html?msg=Para poder inscribir la propuesta debe crear al menos un perfil como participante.&msg_tipo=danger';
                                        } else
                                        {
                                            if (data == 'ingresar')
                                            {
                                                //Vacio el id
                                                $("#id").attr('value', "");
                                                //Asignamos el valor a input conv
                                                $("#conv").attr('value', getURLParameter('id'));

                                                //disabled todos los componentes
                                                $("#formulario_principal input,textarea,select,button[type=submit]").attr("disabled", "disabled");
                                                $("#form_nuevo_objetivo input,textarea,select,button[type=submit]").attr("disabled", "disabled");
                                                $("#form_nuevo_cronograma input,textarea,select,button[type=submit]").attr("disabled", "disabled");
                                                $("#form_nuevo_presupuesto input,textarea,select,button[type=submit]").attr("disabled", "disabled");
                                                $("#form_nuevo_actividad input,textarea,select,button[type=submit]").attr("disabled", "disabled");

                                                //Verifica si el token actual tiene acceso de lectura
                                                permiso_lectura(token_actual, "Menu Participante");

                                                //Realizo la peticion para cargar el formulario
                                                $.ajax({
                                                    type: 'GET',
                                                    data: {"token": token_actual.token, "conv": $("#conv").attr('value'), "modulo": "Menu Participante", "m": getURLParameter('m'), "p": getURLParameter('p')},
                                                    url: url_pv + 'PropuestasPdac/buscar_propuesta/'
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
                                                                if (data == 'crear_perfil')
                                                                {
                                                                    location.href = url_pv_admin + 'pages/perfilesparticipantes/persona_natural.html?msg=Para poder inscribir la propuesta debe crear el perfil de persona natural.&msg_tipo=danger';
                                                                } else
                                                                {
                                                                    if (data == 'error_cod_propuesta')
                                                                    {
                                                                        location.href = url_pv_admin + 'pages/propuestas/propuestas_busqueda_convocatorias.html?msg=El código de la propuesta no es valido.&msg_tipo=danger';
                                                                    } else
                                                                    {

                                                                        var json = JSON.parse(data);

                                                                        //eliminó disabled todos los componentes
                                                                        if (json.estado == 7)
                                                                        {
                                                                            $("#formulario_principal input,textarea,select,button[type=submit]").removeAttr("disabled");
                                                                            $("#form_nuevo_objetivo input,textarea,select,button[type=submit]").removeAttr("disabled");
                                                                            $("#form_nuevo_cronograma input,textarea,select,button[type=submit]").removeAttr("disabled");
                                                                            $("#form_nuevo_presupuesto input,textarea,select,button[type=submit]").removeAttr("disabled");
                                                                            $("#form_nuevo_actividad input,textarea,select,button[type=submit]").removeAttr("disabled");

                                                                            $("#valortotal").attr("disabled", "disabled");
                                                                            $("#aportepropio").attr("disabled", "disabled");

                                                                        }

                                                                        //Cargo los parametros obligatorios
                                                                        $("#validator").attr("value", JSON.stringify(json.validator));

                                                                        //Cargo el formulario con los datos
                                                                        $('#formulario_principal').loadJSON(json.propuesta);


                                                                        if (json.propuesta.objetivo_general != null)
                                                                        {
                                                                            //agrego los totales de caracteres
                                                                            $(".caracter_objetivo_general").html(1000 - json.propuesta.objetivo_general.length);
                                                                        }

                                                                        //Limpio select de categorias
                                                                        $('#propuestaobjetivo').find('option').remove();

                                                                        $("#propuestaobjetivo").append('<option value="" >::Seleccionar::</option>');

                                                                        //Cargo el select de las categorias                                                
                                                                        if (json.objetivos_especificos.length > 0) {
                                                                            $.each(json.objetivos_especificos, function (key, objetivo) {
                                                                                $("#propuestaobjetivo").append('<option value="' + objetivo.id + '" >' + objetivo.objetivo + '</option>');
                                                                            });
                                                                        }

                                                                        //Valido formulario
                                                                        validator_form(token_actual);

                                                                        //Creo la tabla de objetivos
                                                                        cargar_tabla(token_actual);
                                                                    }
                                                                }

                                                            }
                                                        }
                                                    }
                                                });
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            });

            //Limpio el formulario
            $('#nuevo_objetivo').on('hidden.bs.modal', function () {
                $("#objetivo").val("");
                $("#meta").val("");                
                $("#id_registro").val("");
                $("#form_nuevo_objetivo").bootstrapValidator('disableSubmitButtons', false);
            });

            //Limpio el formulario
            $('#nuevo_actividad').on('hidden.bs.modal', function () {
                $("#actividad").val("");                
                $("#id_registro_2").val("");
                $("#form_nuevo_actividad").bootstrapValidator('disableSubmitButtons', false);
            });

            //Limpio el formulario
            $('#nuevo_cronograma').on('hidden.bs.modal', function () {
                $("#fecha").val("");
                $("#id_registro_3").val("");
                $("#form_nuevo_cronograma").data('bootstrapValidator').resetForm();
                $("#form_nuevo_cronograma").bootstrapValidator('resetForm', true);
            });

            //Limpio el formulario
            $('#nuevo_presupuesto').on('hidden.bs.modal', function () {
                $("#id_registro_4").val("");

                $("#insumo").val("");
                $("#cantidad").val("");
                $("#unidadmedida").val("");
                $("#valorunitario").val("");
                $("#valortotal").val("");
                $("#aportesolicitado").val("");
                $("#aportecofinanciado").val("");
                $("#aportepropio").val("");

                $("#form_nuevo_presupuesto").data('bootstrapValidator').resetForm();
                $("#form_nuevo_presupuesto").bootstrapValidator('resetForm', true);
            });

            $("#generar_presupuesto").click(function () {
                
                $.AjaxDownloader({
                    data : {
                        propuesta   : getURLParameter('p'),
                        token   : token_actual.token                        
                    },
                    url: url_pv + 'PropuestasFormatos/propuesta_presupuesto_xls/'
                });
            });

        } else
        {
            location.href = url_pv_admin + 'pages/propuestas/propuestas_busqueda_convocatorias.html?msg=El código de la propuesta no es valido.&msg_tipo=danger';
        }

    }

    $(".contar_caracteres").keyup(function () {
        var total = $(this).attr("title");
        var total_text = $(this).val().length;
        var obj = $(this).attr("id");
        var total_actual = total - total_text;
        if (total_actual <= 0)
        {
            total_actual = 0;
        }
        $(".caracter_" + obj).html(total_actual);
    });

    calcular_totales();

});

function calcular_totales() {
    $(".calcular_valor_total").focusout(function () {
        var cantidad = $("#cantidad").val();
        var valorunitario = $("#valorunitario").val();
        var valortotal = parseInt(cantidad) * parseInt(valorunitario);

        if (Number.isInteger(parseInt(valortotal)))
        {
            $("#valortotal").val(valortotal);
        }

        var valortotal = $("#valortotal").val();

        if (valortotal > 0)
        {
            var aportesolicitado = $("#aportesolicitado").val();
            var aportecofinanciado = $("#aportecofinanciado").val();
            var total = parseInt(aportesolicitado) + parseInt(aportecofinanciado);
            var aportepropio = valortotal - total;
            if (total >= 0)
            {
                if (aportepropio >= 0 && aportepropio <= valortotal)
                {
                    $("#aportepropio").val(aportepropio);
                } else
                {
                    $("#aportepropio").val("");
                    notify("danger", "ok", "Presupuesto:", "El aporte recursos propios, no puede ser mayor o menor al Valor Total.");
                }
            }
        } else
        {
            $("#aportesolicitado").val("0");
            $("#aportecofinanciado").val("0");
            $("#aportepropio").val("");
        }
    });
}

function validator_form(token_actual) {

    //Validar el formulario    
    $('.formulario_principal').bootstrapValidator({
        feedbackIcons: {
            valid: 'glyphicon glyphicon-ok',
            invalid: 'glyphicon glyphicon-remove',
            validating: 'glyphicon glyphicon-refresh'
        },
        fields: {
            objetivo_general: {
                validators: {
                    notEmpty: {message: 'El objetivo general, es requerido'},
                    stringLength: {
                        message: 'Ya cuenta con el máximo de caracteres permitidos, los cuales son 1000.',
                        max: '1000'
                    }
                }
            }
        }
    }).on('success.form.bv', function (e) {

        var validar = true;

        //William debe validar si creo al menos un objetivo espeficico y validar si creo al menos una actividad

        // Prevent form submission
        e.preventDefault();
        // Get the form instance
        var $form = $(e.target);

        if (validar)
        {
            $("#mi-modal").modal('show');

            var modalConfirm = function (callback) {
                $("#modal-btn-si").on("click", function () {
                    callback(true);
                    $("#mi-modal").modal('hide');
                });

                $("#modal-btn-no").on("click", function () {
                    callback(false);
                    $("#mi-modal").modal('hide');
                });
            };

            // Get the BootstrapValidator instance
            var bv = $form.data('bootstrapValidator');

            // Valido si el id existe, con el fin de eviarlo al metodo correcto
            $('#formulario_principal').attr('action', url_pv + 'PropuestasPdac/editar_propuesta_objetivo');

            modalConfirm(function (confirm) {
                if (confirm) {
                    //Se realiza la peticion con el fin de guardar el registro actual
                    $.ajax({
                        type: 'POST',
                        url: $form.attr('action'),
                        data: $form.serialize() + "&modulo=Menu Participante&token=" + token_actual.token + "&m=" + getURLParameter('m'),
                    }).done(function (result) {

                        if (result == 'error')
                        {
                            notify("danger", "ok", "Propuesta:", "Se registro un error, comuníquese con la mesa de ayuda convocatorias@scrd.gov.co");
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
                                    if (isNaN(result)) {
                                        notify("danger", "ok", "Propuesta:", "Se registro un error, comuníquese con la mesa de ayuda convocatorias@scrd.gov.co");
                                    } else
                                    {
                                        notify("success", "ok", "Propuesta:", "Se actualizó con el éxito la propuesta.");

                                        var redirect = "territorios_poblaciones.html";

                                        setTimeout(function () {
                                            location.href = url_pv_admin + 'pages/propuestas/' + redirect + '?m=' + getURLParameter('m') + '&id=' + $("#conv").attr('value') + '&p=' + getURLParameter('p');
                                        }, 1800);
                                    }
                                }
                            }
                        }

                    });
                } else
                {
                    $form.bootstrapValidator('disableSubmitButtons', false);
                }
            });
        } else
        {
            $form.bootstrapValidator('disableSubmitButtons', false);
        }
    });

    //Validar el formulario    
    $('.form_nuevo_objetivo').bootstrapValidator({
        feedbackIcons: {
            valid: 'glyphicon glyphicon-ok',
            invalid: 'glyphicon glyphicon-remove',
            validating: 'glyphicon glyphicon-refresh'
        },
        excluded: [':disabled'],
        fields: {            
            objetivo: {
                validators: {
                    notEmpty: {message: 'El objetivo específico, es requerido'},
                    stringLength: {
                        message: 'Ya cuenta con el máximo de caracteres permitidos, los cuales son 500.',
                        max: '500'
                    }
                }
            },
            meta: {
                validators: {
                    notEmpty: {message: 'La meta, es requerido'},
                    stringLength: {
                        message: 'Ya cuenta con el máximo de caracteres permitidos, los cuales son 500.',
                        max: '500'
                    }
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
        $('#form_nuevo_objetivo').attr('action', url_pv + 'PropuestasPdac/editar_propuesta_objetivo_especifico');

        //Se realiza la peticion con el fin de guardar el registro actual
        $.ajax({
            type: 'POST',
            url: $form.attr('action'),
            data: $form.serialize() + "&modulo=Menu Participante&token=" + token_actual.token + "&m=" + getURLParameter('m') + "&propuesta=" + getURLParameter('p'),
        }).done(function (result) {

            if (result == 'error')
            {
                notify("danger", "ok", "Objetivos:", "Se registro un error, comuníquese con la mesa de ayuda convocatorias@scrd.gov.co");
            } else
            {
                if (result == 'error_token')
                {
                    location.href = url_pv_admin + 'index.html?msg=Su sesión ha expirado, por favor vuelva a ingresar.&msg_tipo=danger';
                } else
                {
                    if (result == 'acceso_denegado')
                    {
                        notify("danger", "remove", "Objetivos:", "No tiene permisos para editar información.");
                    } else
                    {
                        if (result == 'error_maximo_objetivos')
                        {
                            notify("danger", "remove", "Objetivos:", "Ya cuenta con el máximo de objetivos específicos.");
                        } else
                        {
                            if (isNaN(result)) {
                                notify("danger", "ok", "Objetivos:", "Se registro un error, comuníquese con la mesa de ayuda convocatorias@scrd.gov.co");
                            } else
                            {
                                notify("success", "ok", "Objetivos:", "Se guardo con el éxito el objetivo específico.");
                                $('#nuevo_objetivo').modal('toggle');
                                cargar_tabla(token_actual);
                                cargar_select_objetivos(token_actual);
                            }
                        }
                    }
                }
            }

        });
    });

    //Validar el formulario    
    $('.form_nuevo_actividad').bootstrapValidator({
        feedbackIcons: {
            valid: 'glyphicon glyphicon-ok',
            invalid: 'glyphicon glyphicon-remove',
            validating: 'glyphicon glyphicon-refresh'
        },
        excluded: [':disabled'],
        fields: {
            propuestaobjetivo: {
                validators: {
                    notEmpty: {message: 'El objetivo específico, es requerido'}
                }
            },            
            actividad: {
                validators: {
                    notEmpty: {message: 'La actividad, es requerido'},
                    stringLength: {
                        message: 'Ya cuenta con el máximo de caracteres permitidos, los cuales son 500.',
                        max: '500'
                    }
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
        $('#form_nuevo_actividad').attr('action', url_pv + 'PropuestasPdac/editar_propuesta_actividad');

        //Se realiza la peticion con el fin de guardar el registro actual
        $.ajax({
            type: 'POST',
            url: $form.attr('action'),
            data: $form.serialize() + "&modulo=Menu Participante&token=" + token_actual.token + "&m=" + getURLParameter('m') + "&propuesta=" + getURLParameter('p'),
        }).done(function (result) {

            if (result == 'error')
            {
                notify("danger", "ok", "Propuesta:", "Se registro un error, comuníquese con la mesa de ayuda convocatorias@scrd.gov.co");
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
                        if (isNaN(result)) {
                            notify("danger", "ok", "Propuesta:", "Se registro un error, comuníquese con la mesa de ayuda convocatorias@scrd.gov.co");
                        } else
                        {
                            notify("success", "ok", "Propuesta:", "Se guardo con el éxito la actividad.");
                            $('#nuevo_actividad').modal('toggle');
                            cargar_tabla(token_actual);
                        }
                    }
                }
            }

        });
    });


    //Se debe colocar debido a que el calendario es un componente diferente
    $('.semana').on('changeDate show', function (e) {
        $('#form_nuevo_cronograma').bootstrapValidator('revalidateField', 'fecha');
    });

    //Validar el formulario    
    $('.form_nuevo_cronograma').bootstrapValidator({
        feedbackIcons: {
            valid: 'glyphicon glyphicon-ok',
            invalid: 'glyphicon glyphicon-remove',
            validating: 'glyphicon glyphicon-refresh'
        },
        excluded: [':disabled'],
        fields: {
            fecha: {
                validators: {
                    notEmpty: {message: 'La semana de ejecución, es requerido'}
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
        $('#form_nuevo_cronograma').attr('action', url_pv + 'PropuestasPdac/editar_propuesta_cronograma');

        //Se realiza la peticion con el fin de guardar el registro actual
        $.ajax({
            type: 'POST',
            url: $form.attr('action'),
            data: $form.serialize() + "&modulo=Menu Participante&token=" + token_actual.token + "&m=" + getURLParameter('m') + "&propuesta=" + getURLParameter('p'),
        }).done(function (result) {

            if (result == 'error')
            {
                notify("danger", "ok", "Cronograma:", "Se registro un error, comuníquese con la mesa de ayuda convocatorias@scrd.gov.co");
            } else
            {
                if (result == 'error_token')
                {
                    location.href = url_pv_admin + 'index.html?msg=Su sesión ha expirado, por favor vuelva a ingresar.&msg_tipo=danger';
                } else
                {
                    if (result == 'acceso_denegado')
                    {
                        notify("danger", "remove", "Cronograma:", "No tiene permisos para editar información.");
                    } else
                    {
                        if (result == 'error_fecha')
                        {
                            notify("danger", "remove", "Cronograma:", "La semama de ejecución, ya esta registrada.");
                        } else
                        {
                            if (isNaN(result)) {
                                notify("danger", "ok", "Cronograma:", "Se registro un error, comuníquese con la mesa de ayuda convocatorias@scrd.gov.co");
                            } else
                            {
                                notify("success", "ok", "Cronograma:", "Se guardo con el éxito la semana de ejecución.");
                                $("#fecha").val("");
                                $("#form_nuevo_cronograma").data('bootstrapValidator').resetForm();
                                $("#form_nuevo_cronograma").bootstrapValidator('resetForm', true);
                                cargar_tabla_cronograma(token_actual);
                            }
                        }
                    }
                }
            }

        });
    });

    //Validar el formulario    
    $('.form_nuevo_presupuesto').bootstrapValidator({
        feedbackIcons: {
            valid: 'glyphicon glyphicon-ok',
            invalid: 'glyphicon glyphicon-remove',
            validating: 'glyphicon glyphicon-refresh'
        },
        excluded: [':disabled'],
        fields: {
            insumo: {
                validators: {
                    notEmpty: {message: 'El insumo, es requerido'}
                }
            },
            unidadmedida: {
                validators: {
                    notEmpty: {message: 'La unidad de medida, es requerido'}
                }
            },
            cantidad: {
                validators: {
                    notEmpty: {message: 'La cantidad, es requerido'},
                    integer: {message: 'Solo se permite números'}
                }
            },
            valorunitario: {
                validators: {
                    notEmpty: {message: 'El valor unitario, es requerido'},
                    integer: {message: 'Solo se permite números'}
                }
            },
            valortotal: {
                validators: {
                    notEmpty: {message: 'El valor total, es requerido'},
                    integer: {message: 'Solo se permite números'}
                }
            },
            aportesolicitado: {
                validators: {
                    notEmpty: {message: 'El aporte solicitado concertación, es requerido'},
                    integer: {message: 'Solo se permite números'}
                }
            },
            aportecofinanciado: {
                validators: {
                    notEmpty: {message: 'El aporte cofinanciado por terceros, es requerido'},
                    integer: {message: 'Solo se permite números'}
                }
            },
            aportepropio: {
                validators: {
                    notEmpty: {message: 'El aporte recursos propios, es requerido'},
                    integer: {message: 'Solo se permite números'}
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
        $('#form_nuevo_presupuesto').attr('action', url_pv + 'PropuestasPdac/editar_propuesta_presupuesto');

        if ($("#aportepropio").val() == "") {
            notify("danger", "ok", "Presupuesto:", "El aporte recursos propios, es requerido.");
        } else
        {
            if ($("#valortotal").val() == "") {
                notify("danger", "ok", "Presupuesto:", "El valor total, es requerido.");
            } else
            {
                valor_total=parseInt($("#aportesolicitado").val())+parseInt($("#aportecofinanciado").val())+parseInt($("#aportepropio").val());
                valor_total_real=parseInt($("#valortotal").val());
                if(valor_total>valor_total_real)
                {
                    notify("danger", "ok", "Presupuesto:", "El aporte recursos propios, no puede ser mayor o menor al Valor Total.");
                }
                else
                {
                    //Se realiza la peticion con el fin de guardar el registro actual
                    $.ajax({
                        type: 'POST',
                        url: $form.attr('action'),
                        data: $form.serialize() + "&modulo=Menu Participante&token=" + token_actual.token + "&m=" + getURLParameter('m') + "&propuesta=" + getURLParameter('p') + "&valortotal=" + $("#valortotal").val() + "&aportepropio=" + $("#aportepropio").val(),
                    }).done(function (result) {

                        if (result == 'error')
                        {
                            notify("danger", "ok", "Presupuesto:", "Se registro un error, comuníquese con la mesa de ayuda convocatorias@scrd.gov.co");
                        } else
                        {
                            if (result == 'error_token')
                            {
                                location.href = url_pv_admin + 'index.html?msg=Su sesión ha expirado, por favor vuelva a ingresar.&msg_tipo=danger';
                            } else
                            {
                                if (result == 'acceso_denegado')
                                {
                                    notify("danger", "remove", "Presupuesto:", "No tiene permisos para editar información.");
                                } else
                                {
                                    if (isNaN(result)) {
                                        notify("danger", "ok", "Presupuesto:", "Se registro un error, comuníquese con la mesa de ayuda convocatorias@scrd.gov.co");
                                    } else
                                    {
                                        notify("success", "ok", "Presupuesto:", "Se guardo con el éxito el presupuesto.");
                                        $("#form_nuevo_presupuesto").data('bootstrapValidator').resetForm();
                                        $("#form_nuevo_presupuesto").bootstrapValidator('resetForm', true);
                                        cargar_tabla_presupuesto(token_actual);
                                    }
                                }
                            }
                        }

                    });
                }                
            }

        }
    });
}

function cargar_select_objetivos(token_actual)
{
    //Realizo la peticion para cargar el formulario
    $.ajax({
        type: 'GET',
        data: {"token": token_actual.token, "conv": $("#conv").attr('value'), "modulo": "Menu Participante", "m": getURLParameter('m'), "p": getURLParameter('p')},
        url: url_pv + 'PropuestasPdac/buscar_propuesta/'
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
                    if (data == 'crear_perfil')
                    {
                        location.href = url_pv_admin + 'pages/perfilesparticipantes/persona_natural.html?msg=Para poder inscribir la propuesta debe crear el perfil de persona natural.&msg_tipo=danger';
                    } else
                    {
                        if (data == 'error_cod_propuesta')
                        {
                            location.href = url_pv_admin + 'pages/propuestas/propuestas_busqueda_convocatorias.html?msg=El código de la propuesta no es valido.&msg_tipo=danger';
                        } else
                        {

                            var json = JSON.parse(data);

                            //Limpio select de categorias
                            $('#propuestaobjetivo').find('option').remove();

                            $("#propuestaobjetivo").append('<option value="" >::Seleccionar::</option>');

                            //Cargo el select de las categorias                                                
                            if (json.objetivos_especificos.length > 0) {
                                $.each(json.objetivos_especificos, function (key, objetivo) {
                                    $("#propuestaobjetivo").append('<option value="' + objetivo.id + '" >' + objetivo.objetivo + '</option>');
                                });
                            }

                        }
                    }

                }
            }
        }
    });

}

function cargar_tabla(token_actual)
{
    var tabla_objetivos= $('#table_registros').DataTable({
        "language": {
            "url": "../../dist/libraries/datatables/js/spanish.json"
        },
        "processing": true,
        "destroy": true,
        "serverSide": true,        
        "lengthMenu": [20, 30, 40],
        "ajax": {
            url: url_pv + "PropuestasPdac/cargar_tabla_objetivos",
            data: {"token": token_actual.token, "conv": $("#conv").attr('value'), "modulo": "Menu Participante", "m": getURLParameter('m'), "p": getURLParameter('p'), "tipo": $("#tipo").attr('value')}
        },
        "drawCallback": function (settings) {
            $(".check_activar_t").attr("checked", "true");
            $(".check_activar_f").removeAttr("checked");
            //Cargo el formulario, para crear o editar
            cargar_formulario(token_actual);
        },
        "columns": [
            {"data": null},
            {"data": "objetivo"},
            {"data": "meta"},
            {"data": "activar_registro"},
            {"data": "editar"}
        ]
    });
    
    tabla_objetivos.on( 'order.dt search.dt', function () {
        tabla_objetivos.column(0, {search:'applied', order:'applied'}).nodes().each( function (cell, i) {            
            cell.innerHTML = i+1;
        } );
    } ).draw();
    

    var tabla_actividades = $('#tabla_actividades').DataTable({
        "language": {
            "url": "../../dist/libraries/datatables/js/spanish.json"
        },
        "processing": true,
        "destroy": true,
        "serverSide": true,        
        "lengthMenu": [20, 30, 40],
        "ajax": {
            url: url_pv + "PropuestasPdac/cargar_tabla_actividades",
            data: {"token": token_actual.token, "conv": $("#conv").attr('value'), "modulo": "Menu Participante", "m": getURLParameter('m'), "p": getURLParameter('p'), "tipo": $("#tipo").attr('value')}
        },
        "drawCallback": function (settings) {
            $(".check_activar_t").attr("checked", "true");
            $(".check_activar_f").removeAttr("checked");
            //Cargo el formulario, para crear o editar
            cargar_formulario_actividad(token_actual);
        },
        "columns": [
            {"data": null},
            {"data": "objetivo"},
            {"data": "actividad"},
            {"data": "activar_registro"},
            {"data": "cronograma"},
            {"data": "presupuesto"},
            {"data": "editar"}
        ]
    });
    
    tabla_actividades.on( 'order.dt search.dt', function () {
        tabla_actividades.column(0, {search:'applied', order:'applied'}).nodes().each( function (cell, i) {            
            cell.innerHTML = i+1;
        } );
    } ).draw();

}

function cargar_tabla_cronograma(token_actual)
{
    $('#tabla_cronogramas').DataTable({
        "language": {
            "url": "../../dist/libraries/datatables/js/spanish.json"
        },
        "processing": true,
        "destroy": true,
        "serverSide": true,
        "ordering": false,
        "searching": false,
        "lengthMenu": [20, 30, 40],
        "ajax": {
            url: url_pv + "PropuestasPdac/cargar_tabla_cronogramas",
            data: {"token": token_actual.token, "conv": $("#conv").attr('value'), "modulo": "Menu Participante", "m": getURLParameter('m'), "p": getURLParameter('p'), "pa": $("#propuestaactividad").attr('value')}
        },
        "drawCallback": function (settings) {
            $(".check_activar_t").attr("checked", "true");
            $(".check_activar_f").removeAttr("checked");
            //Cargo el formulario, para crear o editar
            cargar_formulario_cronograma(token_actual);
        },
        "columns": [
            {"data": "fecha"},
            {"data": "activar_registro"},
            {"data": "editar"}
        ]
    });
}

function cargar_tabla_presupuesto(token_actual)
{
    $('#tabla_presupuesto').DataTable({
        "language": {
            "url": "../../dist/libraries/datatables/js/spanish.json"
        },
        "processing": true,
        "destroy": true,
        "serverSide": true,
        "ordering": false,
        "searching": false,
        "lengthMenu": [20, 30, 40],
        "ajax": {
            url: url_pv + "PropuestasPdac/cargar_tabla_presupuestos",
            data: {"token": token_actual.token, "conv": $("#conv").attr('value'), "modulo": "Menu Participante", "m": getURLParameter('m'), "p": getURLParameter('p'), "pa": $("#propuestaactividad_2").attr('value')}
        },
        "drawCallback": function (settings) {
            $(".check_activar_t").attr("checked", "true");
            $(".check_activar_f").removeAttr("checked");
            //Cargo el formulario, para crear o editar
            cargar_formulario_presupuesto(token_actual);
        },
        "columnDefs": [{
                "targets": 0,
                "render": function (data, type, row, meta) {
                    //Creo los botones para acciones de cada fila de la tabla                    
                    row.valorunitario = addCommas(row.valorunitario);
                    row.valortotal = addCommas(row.valortotal);
                    row.aportesolicitado = addCommas(row.aportesolicitado);
                    row.aportecofinanciado = addCommas(row.aportecofinanciado);
                    row.aportepropio = addCommas(row.aportepropio);
                    return row.insumo;
                }
            }
        ],
        "columns": [
            {"data": "insumo"},
            {"data": "cantidad"},
            {"data": "unidadmedida"},
            {"data": "valorunitario"},
            {"data": "valortotal"},
            {"data": "aportesolicitado"},
            {"data": "aportecofinanciado"},
            {"data": "aportepropio"},
            {"data": "activar_registro"},
            {"data": "editar"}
        ]
    });
}

function cargar_formulario(token_actual)
{
    $(".cargar_formulario").click(function () {

        $("#form_nuevo_objetivo").data('bootstrapValidator').resetForm();
        $("#form_nuevo_objetivo").bootstrapValidator('resetForm', true);

        if ($(this).attr('title') > 0)
        {
            //Cargo el id actual        
            $("#id_registro").attr('value', $(this).attr('title'));
            //Realizo la peticion para cargar el formulario
            $.ajax({
                type: 'GET',
                data: {"token": token_actual.token, "propuesta": getURLParameter('p'), "conv": $("#conv").attr('value'), "modulo": "Menu Participante", "m": getURLParameter('m'), "id": $("#id_registro").attr('value')},
                url: url_pv + 'PropuestasPdac/consultar_objetivo/'
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
                        $('#form_nuevo_objetivo').loadJSON(json);
                        $('#objetivo').val(json.objetivo);
                        $('#meta').val(json.meta);

                        //agrego los totales de caracteres
                        if (json.objetivo != null)
                        {
                            $(".caracter_objetivo").html(500 - json.objetivo.length);
                        }
                        if (json.meta != null)
                        {
                            $(".caracter_meta").html(500 - json.meta.length);
                        }

                    }
                }
            });
        }
    });

    //Permite activar o inactivar un objetivo
    $(".activar_objetivo").click(function () {

        var active = "false";
        if ($(this).prop('checked')) {
            active = "true";
        }

        $.ajax({
            type: 'DELETE',
            data: {"token": token_actual.token, "modulo": "Menu Participante", "active": active},
            url: url_pv + 'PropuestasPdac/eliminar_objetivo_especifico/' + $(this).attr("title")
        }).done(function (data) {
            if (data == 'ok')
            {
                if (active == "true")
                {
                    notify("info", "ok", "Objetivos:", "Se activó el objetivo específico con éxito.");
                } else
                {
                    notify("info", "ok", "Objetivos:", "Se inactivo el objetivo específico con éxito.");
                }
            } else
            {
                if (data == 'acceso_denegado')
                {
                    notify("danger", "remove", "Objetivos:", "Acceso denegado.");
                } else
                {
                    notify("danger", "ok", "Objetivos:", "Se registro un error en el método, comuníquese con la mesa de ayuda convocatorias@scrd.gov.co");
                }
            }
        });
    });

}

function cargar_formulario_actividad(token_actual)
{
    $(".cargar_actividad_cronograma").click(function () {
        //Cargo el id actual        
        $("#propuestaactividad").attr('value', $(this).attr('title'));
        cargar_tabla_cronograma(token_actual);
    });

    $(".cargar_actividad_presupuesto").click(function () {
        //Cargo el id actual        
        $("#propuestaactividad_2").attr('value', $(this).attr('title'));
        cargar_tabla_presupuesto(token_actual);
    });

    $(".cargar_formulario_actividad").click(function () {

        $("#form_nuevo_actividad").data('bootstrapValidator').resetForm();
        $("#form_nuevo_actividad").bootstrapValidator('resetForm', true);

        if ($(this).attr('title') > 0)
        {
            //Cargo el id actual        
            $("#id_registro_2").attr('value', $(this).attr('title'));
            //Realizo la peticion para cargar el formulario
            $.ajax({
                type: 'GET',
                data: {"token": token_actual.token, "propuesta": getURLParameter('p'), "conv": $("#conv").attr('value'), "modulo": "Menu Participante", "m": getURLParameter('m'), "id": $("#id_registro_2").attr('value')},
                url: url_pv + 'PropuestasPdac/consultar_actividad/'
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
                        $('#form_nuevo_actividad').loadJSON(json);
                        $('#actividad').val(json.actividad);

                        //agrego los totales de caracteres
                        if (json.actividad != null)
                        {
                            $(".caracter_actividad").html(500 - json.actividad.length);
                        }

                    }
                }
            });
        }
    });

    //Permite activar o inactivar un actividad
    $(".activar_actividad").click(function () {

        var active = "false";
        if ($(this).prop('checked')) {
            active = "true";
        }

        $.ajax({
            type: 'DELETE',
            data: {"token": token_actual.token, "modulo": "Menu Participante", "active": active},
            url: url_pv + 'PropuestasPdac/eliminar_actividad/' + $(this).attr("title")
        }).done(function (data) {
            if (data == 'ok')
            {
                if (active == "true")
                {
                    notify("info", "ok", "Actividades:", "Se activó la actividad con éxito.");
                } else
                {
                    notify("info", "ok", "Actividades:", "Se inactivo la actividad con éxito.");
                }
            } else
            {
                if (data == 'acceso_denegado')
                {
                    notify("danger", "remove", "Actividades:", "Acceso denegado.");
                } else
                {
                    notify("danger", "ok", "Actividades:", "Se registro un error en el método, comuníquese con la mesa de ayuda convocatorias@scrd.gov.co");
                }
            }
        });
    });


}

function cargar_formulario_cronograma(token_actual)
{
    //Permite activar o inactivar un actividad
    $(".activar_cronograma").click(function () {

        var active = "false";
        if ($(this).prop('checked')) {
            active = "true";
        }

        $.ajax({
            type: 'DELETE',
            data: {"token": token_actual.token, "modulo": "Menu Participante", "active": active},
            url: url_pv + 'PropuestasPdac/eliminar_cronograma/' + $(this).attr("title")
        }).done(function (data) {
            if (data == 'ok')
            {
                if (active == "true")
                {
                    notify("info", "ok", "Cronograma:", "Se activó la semana de ejecución con éxito.");
                } else
                {
                    notify("info", "ok", "Cronograma:", "Se inactivo la semana de ejecución con éxito.");
                }
            } else
            {
                if (data == 'acceso_denegado')
                {
                    notify("danger", "remove", "Cronograma:", "Acceso denegado.");
                } else
                {
                    notify("danger", "ok", "Cronograma:", "Se registro un error en el método, comuníquese con la mesa de ayuda convocatorias@scrd.gov.co");
                }
            }
        });
    });

    $(".cargar_formulario_cronograma").click(function () {

        $("#form_nuevo_cronograma").data('bootstrapValidator').resetForm();
        $("#form_nuevo_cronograma").bootstrapValidator('resetForm', true);

        //Cargo el id actual        
        $("#id_registro_3").attr('value', $(this).attr('title'));
        //Realizo la peticion para cargar el formulario
        $.ajax({
            type: 'GET',
            data: {"token": token_actual.token, "propuesta": getURLParameter('p'), "conv": $("#conv").attr('value'), "modulo": "Menu Participante", "m": getURLParameter('m'), "id": $("#id_registro_3").attr('value')},
            url: url_pv + 'PropuestasPdac/consultar_cronograma/'
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
                    $('.form_nuevo_cronograma').loadJSON(json);

                }
            }
        });
    });


}

function cargar_formulario_presupuesto(token_actual)
{
    //Permite activar o inactivar un actividad
    $(".activar_presupuesto").click(function () {

        var active = "false";
        if ($(this).prop('checked')) {
            active = "true";
        }

        $.ajax({
            type: 'DELETE',
            data: {"token": token_actual.token, "modulo": "Menu Participante", "active": active},
            url: url_pv + 'PropuestasPdac/eliminar_presupuesto/' + $(this).attr("title")
        }).done(function (data) {
            if (data == 'ok')
            {
                if (active == "true")
                {
                    notify("info", "ok", "Presupuesto:", "Se activó el presupuesto con éxito.");
                } else
                {
                    notify("info", "ok", "Presupuesto:", "Se inactivo el presupuesto con éxito.");
                }
            } else
            {
                if (data == 'acceso_denegado')
                {
                    notify("danger", "remove", "Presupuesto:", "Acceso denegado.");
                } else
                {
                    notify("danger", "ok", "Presupuesto:", "Se registro un error en el método, comuníquese con la mesa de ayuda convocatorias@scrd.gov.co");
                }
            }
        });
    });

    $(".cargar_formulario_presupuesto").click(function () {

        $("#form_nuevo_presupuesto").data('bootstrapValidator').resetForm();
        $("#form_nuevo_presupuesto").bootstrapValidator('resetForm', true);

        //Cargo el id actual        
        $("#id_registro_4").attr('value', $(this).attr('title'));
        //Realizo la peticion para cargar el formulario
        $.ajax({
            type: 'GET',
            data: {"token": token_actual.token, "propuesta": getURLParameter('p'), "conv": $("#conv").attr('value'), "modulo": "Menu Participante", "m": getURLParameter('m'), "id": $("#id_registro_4").attr('value')},
            url: url_pv + 'PropuestasPdac/consultar_presupuesto/'
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
                    $('.form_nuevo_presupuesto').loadJSON(json);
                }
            }
        });
    });


}

function addCommas(nStr) {
       nStr += '';
       var x = nStr.split('.');
       var x1 = x[0];
       var x2 = x.length > 1 ? '.' + x[1] : '';
       var rgx = /(\d+)(\d{3})/;
       while (rgx.test(x1)) {
           x1 = x1.replace(rgx, '$1' + ',' + '$2');
       }
       return x1 + x2;
}