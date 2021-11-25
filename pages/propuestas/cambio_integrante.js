var acepta;
$(document).ready(function () {

    //Verifico si el token exite en el cliente y verifico que el token este activo en el servidor                
    var token_actual = getLocalStorage(name_local_storage);

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
                url: url_pv + 'PropuestasBusquedasConvocatorias/validar_acceso_cambio_integrante/' + $("#id").val()
            }).done(function (data) {

                if (data === 'error_metodo')
                {
                    notify("danger", "ok", "Convocatorias:", "Se registro un error en el método, comuníquese con la mesa de ayuda convocatorias@scrd.gov.co");
                } else
                {
                    if (data === 'error_token')
                    {
                        location.href = url_pv_admin + 'index.html?msg=Su sesión ha expirado, por favor vuelva a ingresar.&msg_tipo=danger';
                    } else
                    {
                        if (data === 'error_propuesta')
                        {
                            location.href = url_pv_admin + 'pages/propuestas/mis_propuestas.html?msg=El código de la propuesta no es valido.&msg_tipo=danger';
                        } else
                        {
                            if (data === 'error_estado') {
                                location.href = url_pv_admin + 'pages/propuestas/mis_propuestas.html?msg=La propuesta debe ser ganadora para poder hacer cambio de participantes.&msg_tipo=danger';
                            } else {
                                if (data === 'ingresar')
                                {

                                    //Asignamos el valor a input conv
                                    $("#propuesta").attr('value', getURLParameter('id'));

                                    //disabled todos los componentes
                                    //$("#formulario_principal input,textarea,select,button[type=submit]").attr("disabled", "disabled");

                                    //Verifica si el token actual tiene acceso de lectura
                                    permiso_lectura(token_actual, "Menu Participante");

                                    //Cargar el select de Pais
                                    $.ajax({
                                        type: 'GET',
                                        data: {"token": token_actual.token},
                                        url: url_pv + 'Paises/select_participantes'
                                    }).done(function (data) {
                                        if (data === 'error_metodo')
                                        {
                                            notify("danger", "ok", "Usuarios:", "Se registro un error en el método, comuníquese con la mesa de ayuda convocatorias@scrd.gov.co");
                                        } else
                                        {
                                            if (data === 'error')
                                            {
                                                notify("danger", "ok", "Usuarios:", "El usuario no se encuentra registrado, por favor registrarse");
                                            } else
                                            {
                                                var json = JSON.parse(data);
                                                $("#pais").append('<option value="">:: Seleccionar ::</option>');
                                                $("#pais_nacimiento").append('<option value="">:: Seleccionar ::</option>');
                                                if (json.length > 0) {
                                                    $.each(json, function (key, pais) {
                                                        $("#pais").append('<option value="' + pais.id + '">' + pais.nombre + '</option>');
                                                        $("#pais_nacimiento").append('<option value="' + pais.id + '">' + pais.nombre + '</option>');
                                                    });
                                                }
                                            }
                                        }
                                    });

                                    //Cargar el select de Localidades
                                    $.ajax({
                                        type: 'GET',
                                        data: {"token": token_actual.token, "ciudad": 151},
                                        url: url_pv + 'Localidades/select_participantes'
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

                                    //cargar select departamento
                                    $('#pais').on('change', function () {
                                        var pais = $(this).val();
                                        $('#departamento').find('option').remove();
                                        $('#ciudad_residencia').find('option').remove();
                                        $.ajax({
                                            type: 'GET',
                                            data: {"token": token_actual.token, "pais": pais},
                                            url: url_pv + 'Departamentos/select_participantes'
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
                                                    $("#departamento").append('<option value="">:: Seleccionar ::</option>');
                                                    $("#ciudad_residencia").append('<option value="">:: Seleccionar ::</option>');
                                                    if (json.length > 0) {
                                                        $.each(json, function (key, value) {
                                                            $("#departamento").append('<option value="' + value.id + '">' + value.nombre + '</option>');
                                                        });
                                                    }
                                                }
                                            }
                                        });
                                    });

                                    //cargar select departamento
                                    $('#pais_nacimiento').on('change', function () {
                                        var pais_nacimiento = $(this).val();
                                        $('#departamento_nacimiento').find('option').remove();
                                        $('#ciudad_nacimiento').find('option').remove();
                                        $.ajax({
                                            type: 'GET',
                                            data: {"token": token_actual.token, "pais": pais_nacimiento},
                                            url: url_pv + 'Departamentos/select_participantes'
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
                                                    $("#departamento_nacimiento").append('<option value="">:: Seleccionar ::</option>');
                                                    $("#ciudad_nacimiento").append('<option value="">:: Seleccionar ::</option>');
                                                    if (json.length > 0) {
                                                        $.each(json, function (key, value) {
                                                            $("#departamento_nacimiento").append('<option value="' + value.id + '">' + value.nombre + '</option>');
                                                        });
                                                    }
                                                }
                                            }
                                        });
                                    });

                                    // Cargar Ciudad
                                    $('#departamento').on('change', function () {
                                        var departamento = $(this).val();
                                        $('#ciudad_residencia').find('option').remove();
                                        $.ajax({
                                            type: 'GET',
                                            data: {"token": token_actual.token, "departamento": departamento},
                                            url: url_pv + 'Ciudades/select_participantes'
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
                                                    $("#ciudad_residencia").append('<option value="">:: Seleccionar ::</option>');
                                                    if (json.length > 0) {
                                                        $.each(json, function (key, value) {
                                                            $("#ciudad_residencia").append('<option value="' + value.id + '">' + value.nombre + '</option>');
                                                        });
                                                    }
                                                }
                                            }
                                        });
                                    });

                                    // Cargar Ciudad
                                    $('#departamento_nacimiento').on('change', function () {
                                        var departamento = $(this).val();
                                        $('#ciudad_nacimiento').find('option').remove();
                                        $.ajax({
                                            type: 'GET',
                                            data: {"token": token_actual.token, "departamento": departamento},
                                            url: url_pv + 'Ciudades/select_participantes'
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
                                                    $("#ciudad_nacimiento").append('<option value="">:: Seleccionar ::</option>');
                                                    if (json.length > 0) {
                                                        $.each(json, function (key, value) {
                                                            $("#ciudad_nacimiento").append('<option value="' + value.id + '">' + value.nombre + '</option>');
                                                        });
                                                    }
                                                }
                                            }
                                        });
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

                                    //Realizo la peticion para cargar el formulario
                                    $.ajax({
                                        type: 'GET',
                                        data: {"token": token_actual.token, "conv": $("#conv").attr('value'), "modulo": "Menu Participante", "m": getURLParameter('perfil'), "p": getURLParameter('p')},
                                        url: url_pv + 'Personasnaturales/formulario_integrante'
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
                                                    if (data == 'crear_perfil_pn')
                                                    {
                                                        location.href = url_pv_admin + 'pages/perfilesparticipantes/persona_natural.html?msg=Para poder inscribir la propuesta debe crear el perfil de persona natural.&msg_tipo=danger';
                                                    } else
                                                    {
                                                        if (data == 'crear_perfil_pj')
                                                        {
                                                            location.href = url_pv_admin + 'pages/perfilesparticipantes/persona_juridica.html?msg=Para poder inscribir la propuesta debe crear el perfil de persona juridica.&msg_tipo=danger';
                                                        } else
                                                        {
                                                            if (data == 'crear_perfil_agr')
                                                            {
                                                                location.href = url_pv_admin + 'pages/perfilesparticipantes/agrupacion.html?msg=Para poder inscribir la propuesta debe crear el perfil de agrupacion.&msg_tipo=danger';
                                                            } else
                                                            {

                                                                if (data == 'error_cod_propuesta')
                                                                {
                                                                    location.href = url_pv_admin + 'pages/propuestas/propuestas_busqueda_convocatorias.html?msg=El código de la propuesta no es valido.&msg_tipo=danger';
                                                                } else
                                                                {
                                                                    if (data == 'crear_propuesta')
                                                                    {
                                                                        location.href = url_pv_admin + 'pages/propuestas/propuestas_busqueda_convocatorias.html?msg=Para poder inscribir la propuesta debe crear el perfil de agrupacion.&msg_tipo=danger';
                                                                    } else
                                                                    {
                                                                        
                                                                        var json = JSON.parse(data);

                                                                        //eliminó disabled todos los componentes
                                                                        if (json.estado == 7)
                                                                        {
                                                                            $("#formulario_principal input,textarea,select,button[type=submit]").removeAttr("disabled");
                                                                        }

                                                                        //Creo link de navegacion para persona juridica
                                                                        if (getURLParameter('perfil') == "pj")
                                                                        {
                                                                            if (json.programa == 2)
                                                                            {
                                                                                var path_actual = window.location.pathname;
                                                                                if (path_actual == "/admin_SCRD_pv/pages/propuestas/junta.html")
                                                                                {
                                                                                    href_regresar = "propuestas_pdac.html?m=" + getURLParameter('perfil') + "&id=" + getURLParameter('id') + "&p=" + getURLParameter('p');
                                                                                    href_siguiente = "grupos_trabajos.html?m=" + getURLParameter('perfil') + "&id=" + getURLParameter('id') + "&p=" + getURLParameter('p');

                                                                                }
                                                                                if (path_actual == "/admin_SCRD_pv/pages/propuestas/grupos_trabajos.html")
                                                                                {
                                                                                    href_regresar = "junta.html?m=" + getURLParameter('perfil') + "&id=" + getURLParameter('id') + "&p=" + getURLParameter('p');
                                                                                    href_siguiente = "objetivos_metas_actividades.html?m=" + getURLParameter('perfil') + "&id=" + getURLParameter('id') + "&p=" + getURLParameter('p');
                                                                                }

                                                                                $("#link_propuestas").attr("onclick", "location.href = '" + href_regresar + "'");
                                                                                $("#link_documentacion").attr("onclick", "location.href = '" + href_siguiente + "'");
                                                                            } else
                                                                            {
                                                                                href_regresar = "propuestas.html?m=" + getURLParameter('perfil') + "&id=" + getURLParameter('id') + "&p=" + getURLParameter('p');
                                                                                href_siguiente = "documentacion.html?m=" + getURLParameter('perfil') + "&id=" + getURLParameter('id') + "&p=" + getURLParameter('p');

                                                                                $("#link_propuestas").attr("onclick", "location.href = '" + href_regresar + "'");
                                                                                $("#link_documentacion").attr("onclick", "location.href = '" + href_siguiente + "'");
                                                                            }
                                                                        }


                                                                        //Cargos el select de grupo etnico
                                                                        $('#discapacidad').find('option').remove();
                                                                        $("#discapacidad").append('<option value="">:: Seleccionar ::</option>');
                                                                        if (json.discapacidades.length > 0) {
                                                                            $.each(json.discapacidades, function (key, array) {
                                                                                $("#discapacidad").append('<option value="' + array.id + '" >' + array.nombre + '</option>');
                                                                            });
                                                                        }

                                                                        //Cargos el select de tipo de documento
                                                                        $('#tipo_documento').find('option').remove();
                                                                        $("#tipo_documento").append('<option value="">:: Seleccionar ::</option>');
                                                                        if (json.tipo_documento.length > 0) {
                                                                            $.each(json.tipo_documento, function (key, array) {
                                                                                $("#tipo_documento").append('<option value="' + array.id + '" >' + array.descripcion + '</option>');
                                                                            });
                                                                        }
                                                                        //Cargos el select de sexo
                                                                        $('#sexo').find('option').remove();
                                                                        $("#sexo").append('<option value="">:: Seleccionar ::</option>');
                                                                        if (json.sexo.length > 0) {
                                                                            $.each(json.sexo, function (key, array) {
                                                                                $("#sexo").append('<option value="' + array.id + '" >' + array.nombre + '</option>');
                                                                            });
                                                                        }
                                                                        //Cargos el select de orientacion sexual
                                                                        $('#orientacion_sexual').find('option').remove();
                                                                        $("#orientacion_sexual").append('<option value="">:: Seleccionar ::</option>');
                                                                        if (json.orientacion_sexual.length > 0) {
                                                                            $.each(json.orientacion_sexual, function (key, array) {
                                                                                $("#orientacion_sexual").append('<option value="' + array.id + '" >' + array.nombre + '</option>');
                                                                            });
                                                                        }
                                                                        //Cargos el select de identidad genero
                                                                        $('#identidad_genero').find('option').remove();
                                                                        $("#identidad_genero").append('<option value="">:: Seleccionar ::</option>');
                                                                        if (json.orientacion_sexual.length > 0) {
                                                                            $.each(json.identidad_genero, function (key, array) {
                                                                                $("#identidad_genero").append('<option value="' + array.id + '" >' + array.nombre + '</option>');
                                                                            });
                                                                        }
                                                                        //Cargos el select de grupo etnico
                                                                        $('#grupo_etnico').find('option').remove();
                                                                        $("#grupo_etnico").append('<option value="">:: Seleccionar ::</option>');
                                                                        if (json.grupo_etnico.length > 0) {
                                                                            $.each(json.grupo_etnico, function (key, array) {
                                                                                $("#grupo_etnico").append('<option value="' + array.id + '" >' + array.nombre + '</option>');
                                                                            });
                                                                        }
                                                                        //Cargos el select de estrato
                                                                        $('#estrato').find('option').remove();
                                                                        $("#estrato").append('<option value="">:: Seleccionar ::</option>');
                                                                        if (json.estrato.length > 0) {
                                                                            $.each(json.estrato, function (key, array) {
                                                                                $("#estrato").append('<option value="' + array + '" >' + array + '</option>');
                                                                            });
                                                                        }

                                                                        //Cargo el formulario con los datos
                                                                        $('#formulario_principal').loadJSON(json.formulario);

                                                                        //Valido formulario
                                                                        validator_form(token_actual);

                                                                        //Cargar datos de la tabla
                                                                        cargar_tabla(token_actual);
                                                                    }
                                                                }
                                                            }
                                                        }
                                                    }

                                                }
                                            }
                                        }
                                    });


                                    //Limpio el formulario de los anexos
                                    $('#nuevo_integrante').on('hidden.bs.modal', function () {
                                        $("#formulario_principal").bootstrapValidator('disableSubmitButtons', false);
                                        $("#formulario_principal").bootstrapValidator('resetForm', true);
                                        $('#ciudad_residencia').find('option').remove();
                                        $("#ciudad_residencia").append('<option value="">:: Seleccionar ::</option>');
                                        $("#experiencia").val("");
                                        $("#actividades_cargo").val("");

                                        $(".caracter_experiencia").html("1000");
                                        $(".caracter_actividades_cargo").html("1000");

                                        $("#id").val("");
                                    });
                                }
                            }
                        }
                    }
                }
            });

        } else
        {
            //si el parametro p no es númerico
            location.href = url_pv_admin + 'pages/propuestas/mis_propuestas.html?msg=El código de la propuesta no es valido.&msg_tipo=danger';
        }
    }


    $("#baceptar").click(function () {

        validator_form(token_actual);
//        confirmar_top_general(token_actual, $('#rondas').val());
        $('#exampleModaltop').modal('hide');
//        $('#top_generalModal').modal('hide');
        acepta = true;

    });


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
        excluded: [':disabled'],
        fields: {
            tipo_documento: {
                validators: {
                    notEmpty: {message: 'El tipo de documento de identificación es requerido'}
                }
            },
            numero_documento: {
                validators: {
                    notEmpty: {message: 'El número de documento de identificación es requerido'},
                    regexp: {
                        regexp: /^[a-zA-Z0-9]+$/i,
                        message: 'Solo se permite números o letras'
                    }
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
            orientacion_sexual: {
                validators: {
                    notEmpty: {message: 'La orientación sexual es requerido'}
                }
            },
            identidad_genero: {
                validators: {
                    notEmpty: {message: 'La identidad de género es requerido'}
                }
            },
            grupo_etnico: {
                validators: {
                    notEmpty: {message: 'El grupo étnico es requerido'}
                }
            },
            discapacidad: {
                validators: {
                    notEmpty: {message: '¿Tiene usted algún tipo de discapacidad? es requerido'}
                }
            },
            regimen_salud: {
                validators: {
                    notEmpty: {message: 'A qué régimen de salud pertenece es requerido'}
                }
            },
            es_victima: {
                validators: {
                    notEmpty: {message: 'Es usted víctima del conflicto armado es requerido'}
                }
            },
            pais_nacimiento: {
                validators: {
                    notEmpty: {message: 'El país de residencia es requerido'}
                }
            },
            departamento_nacimiento: {
                validators: {
                    notEmpty: {message: 'El departamento de residencia es requerido'}
                }
            },
            ciudad_nacimiento: {
                validators: {
                    notEmpty: {message: 'La ciudad de nacimiento es requerida'}
                }
            },
            localidad_residencia: {
                validators: {
                    notEmpty: {message: 'La localidad de residencia es requerida'}
                }
            },
            pais: {
                validators: {
                    notEmpty: {message: 'El país de residencia es requerido'}
                }
            },
            departamento: {
                validators: {
                    notEmpty: {message: 'El departamento de residencia es requerido'}
                }
            },
            ciudad_residencia: {
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
            numero_celular: {
                validators: {
                    notEmpty: {message: 'El número de celular personal es requerido'}
                }
            },
            correo_electronico: {
                validators: {
                    notEmpty: {message: 'El correo electrónico es requerido'},
                    emailAddress: {
                        message: 'El Correo electrónico no es una dirección de correo electrónico válida'
                    }
                }
            },
            rol: {
                validators: {
                    notEmpty: {message: 'El rol que desempeña o ejecuta en la propuesta es requerido'}
                }
            },
            experiencia: {
                validators: {
                    notEmpty: {message: 'La experiencia es requerido'}
                }
            },
            actividades_cargo: {
                validators: {
                    notEmpty: {message: 'Las actividades a cargo es requerido'}
                }
            },
            profesion: {
                validators: {
                    notEmpty: {message: 'La profesión es requerido'}
                }
            }
        }
    }).on('success.form.bv', function (e) {



        $("#cambio-modal").modal('show');

        var modalConfirm = function (callback) {
            $("#cambio-btn-si").on("click", function () {
                callback(true);
                $("#cambio-modal").modal('hide');
            });

            $("#cambio-btn-no").on("click", function () {
                callback(false);
                $("#cambio-modal").modal('hide');
            });
        };

        // Prevent form submission
        e.preventDefault();
        // Get the form instance
        var $form = $(e.target);

        // Get the BootstrapValidator instance
        var bv = $form.data('bootstrapValidator');
        
        $('#formulario_principal').attr('action', url_pv + 'Personasnaturales/reemplazar_integrante');

        modalConfirm(function (confirm) {
            if (confirm) {

                //Se realiza la peticion con el fin de guardar el registro actual
                $.ajax({
                    type: 'POST',
                    url: $form.attr('action'),
                    data: $form.serialize() + "&modulo=Menu Participante&token=" + token_actual.token
                }).done(function (result) {
                    var result = result.trim();

                    if (result === 'error')
                    {
                        notify("danger", "ok", "Integrantes:", "Se registro un error, comuníquese con la mesa de ayuda convocatorias@scrd.gov.co");
                    } else
                    {
                        if (result === 'error_token')
                        {
                            location.href = url_pv_admin + 'index.html?msg=Su sesión ha expirado, por favor vuelva a ingresar.&msg_tipo=danger';
                        } else
                        {
                            if (result === 'acceso_denegado')
                            {
                                notify("danger", "remove", "Usuario:", "No tiene permisos para editar información.");
                            } else
                            {
                                if (result === 'error_metodo')
                                {
                                    notify("danger", "ok", "Integrantes:", "Se registro un error, comuníquese con la mesa de ayuda convocatorias@scrd.gov.co");
                                } else
                                {
                                    if (result === 'error_representante')
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
                                            $("#nuevo_integrante").modal('hide');
                                        }
                                    }
                                }
                            }
                        }
                    }

                });

//                $form.bootstrapValidator('disableSubmitButtons', false).bootstrapValidator('resetForm', true);
//                bv.resetForm();
    

            } else {

                $form.bootstrapValidator('disableSubmitButtons', false);

            }

        });



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
            url: url_pv + "Personasnaturales/cargar_tabla_integrantes_cambio",
            data: {"token": token_actual.token, "participante": $("#participante").attr('value'), "conv": $("#conv").attr('value'), "modulo": "Menu Participante", "m": getURLParameter('perfil'), "p": getURLParameter('p'), "tipo": $("#tipo").attr('value')}
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
            {"data": "rol"},
            {"data": "acciones"}
        ]
    });

}

function cargar_formulario(token_actual)
{

    $(".cargar_cambio_integrante").click(function () {
        //Cargo el id actual       
        $("#id_participante_reemplazo").attr('value', $(this).attr('title'));
        
        $("#nombre_integrante").html($(this).attr('lang'));

    });

}