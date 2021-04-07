$(document).ready(function () {

    //Verifico si el token exite en el cliente y verifico que el token este activo en el servidor                
    var token_actual = getLocalStorage(name_local_storage);

    var href_regresar = "";
    var href_siguiente = "";
    //Creando link de navegación
    if (getURLParameter('m') == "agr")
    {
        href_regresar = "perfil_agrupacion.html?m=" + getURLParameter('m') + "&id=" + getURLParameter('id')+ "&p=" + getURLParameter('p');
        href_siguiente = "integrantes.html?m=" + getURLParameter('m') + "&id=" + getURLParameter('id')+ "&p=" + getURLParameter('p');
    }

    if (getURLParameter('m') == "pn")
    {
        href_regresar = "perfil_persona_natural.html?m=" + getURLParameter('m') + "&id=" + getURLParameter('id')+ "&p=" + getURLParameter('p');
        href_siguiente = "documentacion.html?m=" + getURLParameter('m') + "&id=" + getURLParameter('id')+ "&p=" + getURLParameter('p');
    }

    if (getURLParameter('m') == "pj")
    {
        href_regresar = "perfil_persona_juridica.html?m=" + getURLParameter('m') + "&id=" + getURLParameter('id')+ "&p=" + getURLParameter('p');
        href_siguiente = "junta.html?m=" + getURLParameter('m') + "&id=" + getURLParameter('id')+ "&p=" + getURLParameter('p');
    }

    $("#link_participante").attr("onclick", "location.href = '" + href_regresar + "'");
    $("#link_integrantes").attr("onclick", "location.href = '" + href_siguiente + "'");

    //Verifico si el token esta vacio, para enviarlo a que ingrese de nuevo
    if ($.isEmptyObject(token_actual)) {
        location.href = url_pv_admin + 'index.html?msg=Su sesión ha expirado, por favor vuelva a ingresar.&msg_tipo=danger';
    } else
    {
        //Valido el id de la propuesta
        if (Number.isInteger(parseInt(getURLParameter('p'))))
        {
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
                                        } 
                                        else
                                        {                                                                                    
                                            if (data == 'ingresar')
                                            {
                                                //Vacio el id
                                                $("#id").attr('value', "");
                                                //Asignamos el valor a input conv
                                                $("#conv").attr('value', getURLParameter('id'));

                                                //disabled todos los componentes
                                                $("#formulario_principal input,select,button[type=submit],textarea").attr("disabled","disabled");   

                                                //Verifica si el token actual tiene acceso de lectura
                                                permiso_lectura(token_actual, "Menu Participante");

                                                //Realizo la peticion para cargar el formulario
                                                $.ajax({
                                                    type: 'GET',
                                                    data: {"token": token_actual.token, "conv": $("#conv").attr('value'), "modulo": "Menu Participante", "m": getURLParameter('m'), "p": getURLParameter('p')},
                                                    url: url_pv + 'Propuestas/buscar_propuesta/'
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
                                                                        if(json.estado==7)
                                                                        {
                                                                            $("#formulario_principal input,select,button[type=submit]").removeAttr("disabled");   
                                                                        }


                                                                        //Verifico si es bogota   
                                                                        if(json.estado==7)
                                                                        {
                                                                            if (json.propuesta.bogota)
                                                                            {
                                                                                $(".desarrollo_bogota").removeAttr("disabled");
                                                                            } else
                                                                            {
                                                                                $(".desarrollo_bogota").attr("disabled", "disabled");
                                                                            }
                                                                        }


                                                                        //Cargos el select de localidades
                                                                        $('#localidad').find('option').remove();
                                                                        $("#localidad").append('<option value="">:: Seleccionar ::</option>');
                                                                        if (json.localidades.length > 0) {
                                                                            $.each(json.localidades, function (key, localidad) {
                                                                                var selected = '';
                                                                                if (localidad.id == json.propuesta.localidad)
                                                                                {
                                                                                    selected = 'selected="selected"';
                                                                                }
                                                                                $("#localidad").append('<option value="' + localidad.id + '" ' + selected + ' >' + localidad.nombre + '</option>');
                                                                            });
                                                                        }

                                                                        //Cargos el select de upzs
                                                                        $('#upz').find('option').remove();
                                                                        $("#upz").append('<option value="">:: Seleccionar ::</option>');
                                                                        if (json.upzs.length > 0) {
                                                                            $.each(json.upzs, function (key, upz) {
                                                                                var selected = '';
                                                                                if (upz.id == json.propuesta.upz)
                                                                                {
                                                                                    selected = 'selected="selected"';
                                                                                }
                                                                                $("#upz").append('<option value="' + upz.id + '" ' + selected + ' >' + upz.nombre + '</option>');
                                                                            });
                                                                        }

                                                                        //Cargo los select de barrios
                                                                        $('#barrio').find('option').remove();
                                                                        $("#barrio").append('<option value="">:: Seleccionar ::</option>');
                                                                        if (json.barrios.length > 0) {
                                                                            $.each(json.barrios, function (key, barrio) {
                                                                                var selected = '';
                                                                                if (barrio.id == json.propuesta.barrio)
                                                                                {
                                                                                    selected = 'selected="selected"';
                                                                                }
                                                                                $("#barrio").append('<option value="' + barrio.id + '" ' + selected + ' >' + barrio.nombre + '</option>');
                                                                            });
                                                                        }

                                                                        //Verifico si es premio
                                                                        if(json.estado==7)
                                                                        {
                                                                            if (json.propuesta.modalidad == 4)
                                                                            {
                                                                                $(".es_premio").attr("disabled", "disabled");
                                                                            } else
                                                                            {
                                                                                $(".es_premio").removeAttr("disabled");
                                                                            }
                                                                        }

                                                                        //Cargo los parametros dinamicos
                                                                        var parametros = "";
                                                                        var columna = 1;
                                                                        for (var i in json.parametros) {
                                                                            if (json.parametros.hasOwnProperty(i)) {
                                                                                if (columna == 1)
                                                                                {
                                                                                    parametros += '<div class="row">';
                                                                                }
                                                                                parametros += crearParametro(json.parametros[i].id, json.parametros[i].label, json.parametros[i].valores, json.parametros[i].tipo_parametro, json.parametros[i].obligatorio,json.estado);
                                                                                if (columna == 2)
                                                                                {
                                                                                    parametros += '</div>';
                                                                                    columna = 0;
                                                                                }
                                                                                columna++;
                                                                            }
                                                                        }
                                                                        $("#dinamico").html(parametros);

                                                                        //Cargo los parametros obligatorios
                                                                        $("#validator").attr("value", JSON.stringify(json.validator));


                                                                        //Cargo el select de medios que se entero                                
                                                                        if (json.medio_se_entero.length > 0) {
                                                                            $.each(json.medio_se_entero, function (key, medio) {
                                                                                var selected = '';
                                                                                if (medio == json.propuesta.porque_medio)
                                                                                {
                                                                                    selected = 'selected="selected"';
                                                                                }
                                                                                $("#porque_medio").append('<option value="' + medio + '" >' + medio + '</option>');
                                                                            });
                                                                        }

                                                                        //Set los valores del medio que se entero
                                                                        $("#porque_medio option:selected").removeAttr("selected");
                                                                        $("#porque_medio option:selected").prop("selected", false);
                                                                        $.each(JSON.parse(json.propuesta.porque_medio), function (i, e) {
                                                                            $("#porque_medio option[value='" + e + "']").prop("selected", true);
                                                                        });


                                                                        //Cargo el formulario con los datos
                                                                        $('#formulario_principal').loadJSON(json.propuesta);

                                                                        $("#bogota option[value='" + json.propuesta.bogota + "']").prop('selected', true);

                                                                        $("#ejecucion_menores_edad option[value='" + json.propuesta.ejecucion_menores_edad + "']").prop('selected', true);

                                                                        //Valido formulario
                                                                        validator_form(token_actual);

                                                                    }
                                                                }

                                                            }
                                                        }
                                                    }
                                                });

                                                //Cargar Upz y Barrios
                                                $('#localidad').on('change', function () {
                                                    var localidad = $(this).val();
                                                    $('#upz').find('option').remove();
                                                    $('#barrio').find('option').remove();
                                                    $.ajax({
                                                        type: 'GET',
                                                        data: {"token": token_actual.token, "localidad": localidad},
                                                        url: url_pv + 'Upzs/select'
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
                                                                var json = JSON.parse(data);
                                                                $("#upz").append('<option value="">:: Seleccionar ::</option>');
                                                                if (json != null)
                                                                {
                                                                    if (json.length > 0) {
                                                                        $.each(json, function (key, value) {
                                                                            $("#upz").append('<option value="' + value.id + '">' + value.nombre + '</option>');
                                                                        });
                                                                    }
                                                                }
                                                                $("#barrio").append('<option value="">:: Seleccionar ::</option>');
                                                            }
                                                        }
                                                    });
                                                    $.ajax({
                                                        type: 'GET',
                                                        data: {"token": token_actual.token, "localidad": localidad},
                                                        url: url_pv + 'Barrios/select'
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
                                                                var json = JSON.parse(data);
                                                                $("#barrio").append('<option value="">:: Seleccionar ::</option>');
                                                                if (json != null)
                                                                {
                                                                    if (json.length > 0) {
                                                                        $.each(json, function (key, value) {
                                                                            $("#barrio").append('<option value="' + value.id + '">' + value.nombre + '</option>');
                                                                        });
                                                                    }
                                                                }
                                                            }
                                                        }
                                                    });
                                                });

                                                //Cargar Barrios
                                                $('#upz').on('change', function () {
                                                    var upz = $(this).val();
                                                    var localidad = $("#localidad").val();
                                                    $('#barrio').find('option').remove();
                                                    $.ajax({
                                                        type: 'GET',
                                                        data: {"token": token_actual.token, "localidad": localidad, "upz": upz},
                                                        url: url_pv + 'Barrios/select'
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
                                                                var json = JSON.parse(data);
                                                                $("#barrio").append('<option value="">:: Seleccionar ::</option>');
                                                                if (json.length > 0) {
                                                                    $.each(json, function (key, value) {
                                                                        $("#barrio").append('<option value="' + value.id + '">' + value.nombre + '</option>');
                                                                    });
                                                                }
                                                            }
                                                        }
                                                    });
                                                });

                                                //Cargar Barrios
                                                $('#bogota').on('change', function () {
                                                    var bogota = $(this).val();
                                                    //Verifico si es bogota                                
                                                    if (bogota == "true")
                                                    {
                                                        $(".desarrollo_bogota").removeAttr("disabled");
                                                    } else
                                                    {
                                                        $(".desarrollo_bogota").attr("disabled", "disabled");
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
        } else
        {
            location.href = url_pv_admin + 'pages/propuestas/propuestas_busqueda_convocatorias.html?msg=El código de la propuesta no es valido.&msg_tipo=danger';
        }

    }
});

/*
 * TENER EN CUENTA
 function crear_validadores() {
 var options = {
 fields: {
 nombre: {
 validators: {
 notEmpty: {message: 'El nombre de la propuesta es requerido'}
 }
 }
 }
 };
 
 var options = JSON.parse('{ \n\
 "fields": { \n\
 "nombre": { \n\
 "validators":{ \n\
 "notEmpty":{ "message":"El nombre de la propuesta es requerido" }\n\
 }\n\
 }\n\
 }\n\
 }');
 
 
 
 var campo_resumen = {resumen: {
 validators: {
 notEmpty: {message: 'El resumen de la propuesta es requerido'}
 }
 }};
 
 var campo_objetivo = {objetivo: {
 validators: {
 notEmpty: {message: 'El objetivo de la propuesta es requerido'}
 }
 }};        
 
 if ($("#modalidad").val() != 4)
 {
 options = {
 fields: {
 nombre: {
 validators: {
 notEmpty: {message: 'El nombre de la propuesta es requerido'}
 }
 },
 resumen: {
 validators: {
 notEmpty: {message: 'El resumen de la propuesta es requerido'}
 }
 },
 objetivo: {
 validators: {
 notEmpty: {message: 'El objetivo de la propuesta es requerido'}
 }
 }
 }
 };
 }
 
 //alert(options.fields.nombre.validators.notEmpty.message);
 
 return options;
 }
 */

function validator_form(token_actual) {

    $('.calendario').datetimepicker({
        language: 'es',
        weekStart: 1,
        todayBtn: 1,
        autoclose: 1,
        todayHighlight: 1,
        startView: 2,
        minView: 2,
        forceParse: 0
    });

    //Se debe colocar debido a que el calendario es un componente diferente
    $('.calendario').on('changeDate show', function (e) {
        $('.formulario_principal').bootstrapValidator('revalidateField', $("#parametro_" + $(this).attr("title")));
    });

    //Validar el formulario
    $('.formulario_principal').bootstrapValidator(JSON.parse($("#validator").val())).on('success.form.bv', function (e) {

        var validar = false;

        if ($("#bogota").val() == 'true')
        {
            if ($("#localidad").val() != "" || $("#upz").val() != "" || $("#barrio").val() != "" )
            {
                validar = true;
            } else
            {
                notify("danger", "ok", "Propuesta:", "Debe seleccionar una ubicación donde desarrollara su propuesta.");
                validar = false;
            }
        } else
        {
            validar = true;
        }

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
            $('#formulario_principal').attr('action', url_pv + 'Propuestas/editar_propuesta');

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

                                        var redirect = "";
                                        if (getURLParameter('m') == "pn")
                                        {
                                            redirect = "documentacion.html";
                                        }
                                        if (getURLParameter('m') == "pj")
                                        {
                                            redirect = "junta.html";
                                        }
                                        if (getURLParameter('m') == "agr")
                                        {
                                            redirect = "integrantes.html";
                                        }



                                        setTimeout(function () {
                                            location.href = url_pv_admin + 'pages/propuestas/' + redirect + '?m=' + getURLParameter('m') + '&id=' + $("#conv").attr('value')+'&p='+getURLParameter('p');
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

}