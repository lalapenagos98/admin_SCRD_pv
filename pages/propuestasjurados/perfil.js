/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
/*Cesar Britto*/

$(document).ready(function () {

    $("#idc").val($("#id").val());
    $("#id").val(null);

    //Verifico si el token exite en el cliente y verifico que el token este activo en el servidor
    var token_actual = getLocalStorage(name_local_storage);

    //Verifico si el token esta vacio, para enviarlo a que ingrese de nuevo
    if ($.isEmptyObject(token_actual)) {
        location.href = url_pv_admin + 'index.html?msg=Su sesión ha expirado, por favor vuelva a ingresar.&msg_tipo=danger';
    } else
    {
        //Verifica si el token actual tiene acceso de lectura
        permiso_lectura(token_actual, "Menu Participante");

        //Peticion para buscar ciudades
        var json_ciudades = function (request, response) {
            $.ajax({
                type: 'GET',
                data: {"token": token_actual.token, "id": $("#id").attr('value'), q: request.term},
                url: url_pv + 'Ciudades/autocompletar/',
                dataType: "jsonp",
                success: function (data) {
                    response(data);
                }
            });
        };

        //Cargos el autocomplete de ciudad de residencia

        $("#ciudad_residencia_name").autocomplete({
            source: json_ciudades,
            minLength: 2,
            select: function (event, ui) {
                $(this).val(ui.item ? ui.item : " ");
                $("#ciudad_residencia").val(ui.item.id);
                $("#ciudad_residencia").attr("label", ui.item.label);//se agregó
                /**
                 * 15-04-2020
                 * Wilmer Gustavo Mogollón Duque
                 * Se agrega línea 39 para acceder al label y verificar que sea una ciudad de Colombia.
                 */
            },
            change: function (event, ui) {
                if (!ui.item) {
                    this.value = '';
                    $('.formulario_principal').bootstrapValidator('revalidateField', 'ciudad_residencia_name');
                    $("#ciudad_residencia").val("");
                }
                //else { Return your label here }
            }
        });

        //Cargos el autocomplete de ciudad de residencia

        $("#ciudad_residencia_name").autocomplete({
            source: json_ciudades,
            minLength: 2,
            select: function (event, ui) {
                $(this).val(ui.item ? ui.item : " ");
                $("#ciudad_residencia").val(ui.item.id);
                $("#ciudad_residencia").attr("label", ui.item.label);//se agregó
            },
            change: function (event, ui) {
                if (!ui.item) {
                    this.value = '';
                    $('.formulario_principal').bootstrapValidator('revalidateField', 'ciudad_residencia_name');
                    $("#ciudad_residencia").val("");
                }
                //else { Return your label here }
            }
        });

        //Cargos el autocomplete de ciudad de nacimiento
        //$("#ciudad_nacimiento_name").val(json.ciudad[json.participante.ciudad_nacimiento].label);
        $("#ciudad_nacimiento_name").autocomplete({
            source: json_ciudades,
            minLength: 2,
            select: function (event, ui) {
                $(this).val(ui.item ? ui.item : " ");
                $("#ciudad_nacimiento").val(ui.item.id);
            },

            change: function (event, ui) {
                if (!ui.item) {
                    this.value = '';
                    $("#ciudad_nacimiento").val("");
                }
                //else { Return your label here }
            }
        });

        //Peticion para buscar barrios
        var json_barrio = function (request, response) {
            $.ajax({
                type: 'GET',
                data: {"token": token_actual.token, "id": $("#id").attr('value'), q: request.term},
                url: url_pv + 'Barrios/autocompletar/',
                dataType: "jsonp",
                success: function (data) {
                    response(data);
                }
            });
        };

        //Cargos el autocomplete de barrios
        $("#barrio_residencia_name").autocomplete({
            source: json_barrio,
            minLength: 2,
            select: function (event, ui) {
                $(this).val(ui.item ? ui.item : " ");
                $("#barrio_residencia").val(ui.item.id);
            },
            change: function (event, ui) {
                if (!ui.item) {
                    this.value = '';
                    $("#barrio_residencia").val("");
                }
            }
        });

        // cargo los datos
        $.ajax({
            type: 'GET',
            url: url_pv + 'PropuestasJurados/select_categoria',
            data: {"token": token_actual.token},
        }).done(function (data) {

            switch (data) {
                case 'error_metodo':
                    notify("danger", "ok", "Se registro un error en el método, comuníquese con la mesa de ayuda soporte.convocatorias@scrd.gov.co");
                    break;
                case 'error_token':
                    location.href = url_pv_admin + 'index.html?msg=Su sesión ha expirado, por favor vuelva a ingresar.&msg_tipo=danger';
                    break;
                default:

                    var json = JSON.parse(data);

                    $('#modalidad_participa').find('option').remove();
                    $("#modalidad_participa").append('<option value="">:: Seleccionar ::</option>');
                    if (json.length > 0) {
                        $.each(json, function (key, array) {
                            $("#modalidad_participa").append('<option value="' + array.id + '" >' + array.nombre + '</option>');
                        });
                    }

                    break;
            }

        });

        // cargo los datos
        $.ajax({
            type: 'GET',
            url: url_pv + 'Tiposdocumentos/select_jurado',
            data: {"token": token_actual.token},
        }).done(function (data) {

            switch (data) {
                case 'error_metodo':
                    notify("danger", "ok", "Se registro un error en el método, comuníquese con la mesa de ayuda soporte.convocatorias@scrd.gov.co");
                    break;
                case 'error_token':
                    location.href = url_pv_admin + 'index.html?msg=Su sesión ha expirado, por favor vuelva a ingresar.&msg_tipo=danger';
                    break;
                default:
                    var json = JSON.parse(data);
                    $('#tipo_documento').find('option').remove();
                    $("#tipo_documento").append('<option value="">:: Seleccionar ::</option>');
                    if (json.length > 0) {
                        $.each(json, function (key, array) {
                            $("#tipo_documento").append('<option value="' + array.id + '" >' + array.descripcion + '</option>');
                        });
                    }

                    break;
            }

        });

        // cargo los datos
        $.ajax({
            type: 'GET',
            url: url_pv + 'Sexos/select_jurado',
            data: {"token": token_actual.token},
        }).done(function (data) {

            switch (data) {
                case 'error_metodo':
                    notify("danger", "ok", "Se registro un error en el método, comuníquese con la mesa de ayuda soporte.convocatorias@scrd.gov.co");
                    break;
                case 'error_token':
                    location.href = url_pv_admin + 'index.html?msg=Su sesión ha expirado, por favor vuelva a ingresar.&msg_tipo=danger';
                    break;
                default:
                    var json = JSON.parse(data);
                    //Cargos el select de sexo
                    $('#sexo').find('option').remove();
                    $("#sexo").append('<option value="">:: Seleccionar ::</option>');
                    if (json.length > 0) {

                        $.each(json, function (key, array) {
                            $("#sexo").append('<option value="' + array.id + '" >' + array.nombre + '</option>');
                        });
                    }

                    break;
            }

        });

        // cargo los datos
        $.ajax({
            type: 'GET',
            url: url_pv + 'Orientacionessexuales/select',
            data: {"token": token_actual.token},
        }).done(function (data) {

            switch (data) {
                case 'error_metodo':
                    notify("danger", "ok", "Se registro un error en el método, comuníquese con la mesa de ayuda soporte.convocatorias@scrd.gov.co");
                    break;
                case 'error_token':
                    location.href = url_pv_admin + 'index.html?msg=Su sesión ha expirado, por favor vuelva a ingresar.&msg_tipo=danger';
                    break;
                default:
                    var json = JSON.parse(data);
                    //Cargos el select de orientacion sexual
                    $('#orientacion_sexual').find('option').remove();
                    $("#orientacion_sexual").append('<option value="">:: Seleccionar ::</option>');
                    if (json.length > 0) {
                        $.each(json, function (key, array) {

                            $("#orientacion_sexual").append('<option value="' + array.id + '">' + array.nombre + '</option>');
                        });
                    }

                    break;
            }

        });


        // cargo los datos
        $.ajax({
            type: 'GET',
            url: url_pv + 'Identidadesgeneros/select_jurado',
            data: {"token": token_actual.token},
        }).done(function (data) {

            switch (data) {
                case 'error_metodo':
                    notify("danger", "ok", "Se registro un error en el método, comuníquese con la mesa de ayuda soporte.convocatorias@scrd.gov.co");
                    break;
                case 'error_token':
                    location.href = url_pv_admin + 'index.html?msg=Su sesión ha expirado, por favor vuelva a ingresar.&msg_tipo=danger';
                    break;
                default:
                    var json = JSON.parse(data);
                    //Cargos el select de identidad genero
                    $('#identidad_genero').find('option').remove();
                    $("#identidad_genero").append('<option value="">:: Seleccionar ::</option>');
                    if (json.length > 0) {
                        $.each(json, function (key, array) {

                            $("#identidad_genero").append('<option value="' + array.id + '">' + array.nombre + '</option>');
                        });
                    }

                    break;
            }

        });

        // cargo los datos
        $.ajax({
            type: 'GET',
            url: url_pv + 'Gruposetnicos/select',
            data: {"token": token_actual.token},
        }).done(function (data) {

            switch (data) {
                case 'error_metodo':
                    notify("danger", "ok", "Se registro un error en el método, comuníquese con la mesa de ayuda soporte.convocatorias@scrd.gov.co");
                    break;
                case 'error_token':
                    location.href = url_pv_admin + 'index.html?msg=Su sesión ha expirado, por favor vuelva a ingresar.&msg_tipo=danger';
                    break;
                default:
                    var json = JSON.parse(data);
                    //Cargos el select de grupo etnico
                    $('#grupo_etnico').find('option').remove();
                    $("#grupo_etnico").append('<option value="">:: Seleccionar ::</option>');
                    if (json.length > 0) {
                        $.each(json, function (key, array) {

                            $("#grupo_etnico").append('<option value="' + array.id + '" >' + array.nombre + '</option>');
                        });
                    }

                    break;
            }

        });


        // cargo los datos
        $.ajax({
            type: 'GET',
            url: url_pv + 'Estratos/select',
            data: {"token": token_actual.token},
        }).done(function (data) {

            switch (data) {
                case 'error_metodo':
                    notify("danger", "ok", "Se registro un error en el método, comuníquese con la mesa de ayuda soporte.convocatorias@scrd.gov.co");
                    break;
                case 'error_token':
                    location.href = url_pv_admin + 'index.html?msg=Su sesión ha expirado, por favor vuelva a ingresar.&msg_tipo=danger';
                    break;
                default:
                    var json = JSON.parse(data);
                    //Cargos el select de estrato
                    $('#estrato').find('option').remove();
                    $("#estrato").append('<option value="">:: Seleccionar ::</option>');
                    if (json.length > 0) {
                        $.each(json, function (key, array) {

                            $("#estrato").append('<option value="' + array + '">' + array + '</option>');
                        });
                    }

                    break;
            }

        });

        /*
         * 10-02-2021
         * Wilmer Gustavo Mogollón Duque
         * Se incorpora la variable localidad al formulario
         * los barrios se cargarán dependiendo de la localidad
         */

        //Cargar el select de Localidades
        $.ajax({
            type: 'GET',
            data: {"token": token_actual.token, "ciudad": 151},
            url: url_pv + 'Localidades/select_jurado'
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
                    $("#localidad_residencia").append('<option value="">:: Seleccionar ::</option>');
                    if (json.length > 0) {
                        $.each(json, function (key, pais) {
                            $("#localidad_residencia").append('<option value="' + pais.id + '">' + pais.nombre + '</option>');
                        });
                    }
                }
            }
        });

        //Cargar Upz y Barrios
        $('#localidad_residencia').on('change', function () {
            var localidad = $(this).val();
            $('#barrio_residencia').find('option').remove();
            $.ajax({
                type: 'GET',
                data: {"token": token_actual.token, "localidad": localidad},
                url: url_pv + 'Barrios/select_participantes'
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
                        $("#barrio_residencia").append('<option value="">:: Seleccionar ::</option>');
                        if (json != null)
                        {
                            if (json.length > 0) {
                                $.each(json, function (key, value) {
                                    $("#barrio_residencia").append('<option value="' + value.id + '">' + value.nombre + '</option>');
                                });
                            }
                        }
                    }
                }
            });
        });

        /*
         *08-03-2021
         *Wilmer Gustavo Mogollón Duque
         *Se ajusta para incorporar los campos de RUT, CIIU Y MATRÍCULA MERCANTIL 
         */

        //cargar select tiene_rut
        $('#tiene_rut').on('change', function () {
            if ($(this).val() === "Sí")
            {
                $("#ciiu").removeAttr("disabled");
            } else
            {
                $("#ciiu").attr("disabled", "disabled");
            }
        });

        $("#baceptar").click(function () {
            location.href = "../propuestasjurados/perfil.html?m=2&id=1288&p=0";
        });


        cargar_datos_formulario(token_actual);
        validator_form(token_actual);

        $("#next_step").attr("onclick", " location.href = 'educacion_formal.html?m=2&id=" + $("#idc").val() + "' ");

    }

});


function cargar_datos_formulario(token_actual) {
    //consulto si tengo ppropuesta cargada

    // cargo los datos
    $.ajax({
        type: 'GET',
        url: url_pv + 'PropuestasJurados/search_rediseno',
        data: {"token": token_actual.token, "idc": $("#idc").val()},
    }).done(function (data) {

        switch (data) {
            case 'error':
                notify("danger", "ok", "Convocatorias:", "Se registro un error, comuníquese con la mesa de ayuda convocatorias@scrd.gov.co");
                break;
            case 'error_metodo':
                notify("danger", "ok", "Se registro un error en el método, comuníquese con la mesa de ayuda convocatorias@scrd.gov.co");
                break;
            case 'error_token':
                location.href = url_pv_admin + 'index.html?msg=Su sesión ha expirado, por favor vuelva a ingresar.&msg_tipo=danger';
                break;
            case 'acceso_denegado':
                notify("danger", "remove", "Usuario:", "No tiene permisos para editar información.");
                break;
            case 'error_crear_participante':
                notify("danger", "remove", "Usuario:", "Se registro un error al intentar crear el registro de jurado en información básica, comuníquese con la mesa de ayuda convocatorias@scrd.gov.co.");
                break;
            case 'deshabilitado':
                notify("danger", "remove", "Usuario:", "No tiene permisos para editar información.");
                cargar_datos_formulario(token_actual);
                break;
            default:

                var json = JSON.parse(data);

                if (json.participante) {

                    $("#estado_hv").html(json.estado);

                    $("#idp").val(json.participante.id);
                    //console.log("tipo-->"+json.participante.tipo);
                    $('#categoria').val(json.categoria);
                    $("#modalidad_participa").val(json.categoria);
                    $('#tipo_documento option[value=' + json.participante.tipo_documento + ']').attr('selected', 'selected');
                    $('#numero_documento').val(json.participante.numero_documento);
                    $('#primer_nombre').val(json.participante.primer_nombre);
                    $('#segundo_nombre').val(json.participante.segundo_nombre);
                    $('#primer_apellido').val(json.participante.primer_apellido);
                    $('#segundo_apellido').val(json.participante.segundo_apellido);
                    $('#sexo option[value=' + json.participante.sexo + ']').attr('selected', 'selected');
                    $('#orientacion_sexual option[value=' + json.participante.orientacion_sexual + ']').attr('selected', 'selected');
                    $('#identidad_genero option[value=' + json.participante.identidad_genero + ']').attr('selected', 'selected');
                    $('#grupo_etnico option[value=' + json.participante.grupo_etnico + ']').attr('selected', 'selected');
                    $('#fecha_nacimiento').val(json.participante.fecha_nacimiento);
                    $('#tiene_rut').val(json.participante.tiene_rut);
                    $('#tiene_matricula').val(json.participante.tiene_matricula);
                    $('#localidad_residencia').val(json.participante.localidad_residencia);


                    if (json.participante.ciudad_nacimiento !== null) {
                        $('#ciudad_nacimiento_name').val(json.ciudad_nacimiento_name);
                        $('#ciudad_nacimiento').val(json.participante.ciudad_nacimiento);
                    }

                    if (json.participante.ciudad_residencia !== null) {
                        $('#ciudad_residencia_name').val(json.ciudad_residencia_name);
                        $('#ciudad_residencia').val(json.participante.ciudad_residencia);
                    }

                    /*
                     * Wilmer Mogollón 19-04-2020
                     */

                    if (json.pais_residencia_id !== 46) {
                        $('#estrato').hide();
                    }

                    //Cargo los select de barrios
                    $('#barrio_residencia').find('option').remove();
                    $("#barrio_residencia").append('<option value="">:: Seleccionar ::</option>');
                    if (json.barrios.length > 0) {

                        $.each(json.barrios, function (key, barrio) {
                            var selected = '';
                            if (barrio.id === json.participante.barrio_residencia)
                            {
                                selected = 'selected="selected"';
                            }
                            $("#barrio_residencia").append('<option value="' + barrio.id + '" ' + selected + ' >' + barrio.nombre + '</option>');
                        });
                    }

                    //Cargos el select de ciius
                    $('#ciiu').find('option').remove();
                    $("#ciiu").append('<option value="">:: Seleccionar ::</option>');
                    if (json.ciius.length > 0) {
                        $.each(json.ciius, function (key, array) {
                            var selected = '';
                            if (array.id === json.participante.ciiu)
                            {
                                selected = 'selected="selected"';
                            }
                            $("#ciiu").append('<option value="' + array.id + '" ' + selected + ' >' + array.nombre + '</option>');
                        });
                    }

//                    if (json.participante.barrio_residencia !== null) {
//                        $('#barrio_residencia_name').val(json.barrio_residencia_name);
//                        $('#barrio_residencia').val(json.participante.barrio_residencia);
//                    }

                    $('#direccion_residencia').val(json.participante.direccion_residencia);
                    $('#direccion_correspondencia').val(json.participante.direccion_correspondencia);
                    $('#estrato option[value=' + json.participante.estrato + ']').attr('selected', 'selected');
                    $('#numero_telefono').val(json.participante.numero_telefono);
                    $('#numero_celular').val(json.participante.numero_celular);
                    $('#correo_electronico').val(json.participante.correo_electronico);
                    $('#resumen').val(json.perfil);

                    $("#formulario_principal").show();

                }

                /**
                 * 15-04-2020
                 * Wilmer Gustavo Mogollón Duque
                 * Se modifica la forma de validar el campo estrato (No aplica para otros paises).
                 */

                $("#ciudad_residencia_name").blur(function () {
                    console.log($("#ciudad_residencia_name").val());
                    console.log($("#ciudad_residencia").attr("label").includes('Colombia'));

                    if ($("#ciudad_residencia").attr("label").includes('Colombia')) {
                        $('#estrato').show();
                        $('#formulario_principal').bootstrapValidator('enableFieldValidators', 'estrato', true);
                        $('#formulario_principal').bootstrapValidator('validateField', 'estrato');
                    } else {
                        $('#estrato').hide();
                        $('#formulario_principal').bootstrapValidator('enableFieldValidators', 'estrato', false);
                        $('#formulario_principal').bootstrapValidator('validateField', 'estrato');
                    }
                });

                break;
        }

    }

    );

}

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
            modalidad_participa: {
                validators: {
                    notEmpty: {message: 'La categoría es requerida'}
                }
            },
            tipo_documento: {
                validators: {
                    notEmpty: {message: 'El tipo de documento de identificación es requerido'}
                }
            },
            numero_documento: {
                validators: {
                    notEmpty: {message: 'El número de documento de identificación es requerido'}
//                    numeric: {message: 'Debe ingresar solo numeros'}
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
            /*
             *08-03-2021
             *Wilmer Gustavo Mogollón Duque
             *Se ajusta para incorporar los campos de RUT, CIIU Y MATRÍCULA MERCANTIL 
             */
            tiene_rut: {
                validators: {
                    notEmpty: {message: 'El RUT es requerido'}
                }
            },
            tiene_matricula: {
                validators: {
                    notEmpty: {message: 'El campo ¿Cuenta usted con matrícula mercantil?, es requerido'}
                }
            },
            fecha_nacimiento: {
                validators: {
                    notEmpty: {message: 'La fecha de nacimiento es requerida'}
                }
            },
            sexo: {
                validators: {
                    notEmpty: {message: 'El sexo es requerido'}
                }
            },
            ciudad_residencia_name: {
                validators: {
                    notEmpty: {message: 'La ciudad de residencia es requerida'}
                }
            },
            direccion_residencia: {
                validators: {
                    notEmpty: {message: 'La dirección de residencia es requerida'}
                }
            },
            estrato: {
                validators: {
                    notEmpty: {message: 'El estrato es requerido'}
                }
            },
            correo_electronico: {
                validators: {
                    notEmpty: {message: 'El correo electrónico es requerido'},
                    emailAddress: {
                        message: 'El Correo electrónico no es una dirección de correo electrónico válida'
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

        if (typeof $("#idp").attr('value') !== 'undefined') {
            //  console.log("Actualizar registro");
            $("#id").val($("#idp").attr('value'));
            //Se realiza la peticion con el fin de guardar el registro actual
            $.ajax({
                type: 'POST',
                url: url_pv + 'PropuestasJurados/edit_participante',
                data: $form.serialize() + "&modulo=Menu Participante&token=" + token_actual.token
            }).done(function (result) {


                switch (result) {
                    case 'error':
                        notify("danger", "ok", "Convocatorias:", "Se registró un error, comuníquese con la mesa de ayuda convocatorias@scrd.gov.co");
                        break;
                    case 'error_token':
                        location.href = url_pv_admin + 'index.html?msg=Su sesión ha expirado, por favor vuelva a ingresar.&msg_tipo=danger';
                        break;
                    case 'acceso_denegado':
                        notify("danger", "remove", "Usuario:", "No tiene permisos para editar información.");
                        break;
                    case 'deshabilitado':
                        notify("danger", "remove", "Usuario:", "No tiene permisos para editar información.");
                        cargar_datos_formulario(token_actual);
                        break;
                    case 'error_creo_alfresco':
                        notify("danger", "remove", "Usuario:", "Se registró un error, comuníquese con la mesa de ayuda convocatorias@scrd.gov.co");
                        cargar_datos_formulario(token_actual);
                        break;
                    default:
                        notify("success", "ok", "Convocatorias:", "Se actualizó el registro con éxito.");
                        cargar_datos_formulario(token_actual);
                        break;
                }

            });

        } else {

        }


        // $form.bootstrapValidator('disableSubmitButtons', false).bootstrapValidator('resetForm', true);
        //$form.bootstrapValidator('destroy', true);
        bv.resetForm();
    });

}

