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

                                    //cargar select tiene_redes
                                    $('#tiene_redes').on('change', function () {
                                        if ($(this).val() === "Sí")
                                        {
                                            $(".si_tiene_redes").removeAttr("disabled");
                                        } else
                                        {
                                            $(".si_tiene_redes").attr("disabled", "disabled");
                                        }
                                    });

                                    //cargar select tiene_paginas
                                    $('#tiene_paginas').on('change', function () {
                                        if ($(this).val() === "Sí")
                                        {
                                            $(".si_tiene_espacios").removeAttr("disabled");
                                        } else
                                        {
                                            $(".si_tiene_espacios").attr("disabled", "disabled");
                                        }
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
                                        data: {"token": token_actual.token, "conv": getURLParameter('id'), "modulo": "Menu Participante", "m": getURLParameter('perfil'), "p": getURLParameter('p')},
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

                                                                        //Cargos el select de ciius
                                                                        $('#ciiu').find('option').remove();
                                                                        $("#ciiu").append('<option value="">:: Seleccionar ::</option>');
                                                                        if (json.ciius.length > 0) {
                                                                            $.each(json.ciius, function (key, array) {
                                                                                $("#ciiu").append('<option value="' + array.id + '" >' + array.nombre + '</option>');
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

                                    $("#cambio-btn-si").click(function () {
                                        //Realizo la peticion para cargar el formulario
                                        $.ajax({
                                            type: 'GET',
                                            data: {"token": token_actual.token, conv: getURLParameter('id'), modulo: "Menu Participante", m: getURLParameter('perfil'), propuesta: $("#propuesta").attr('value'), id_participante_reemplazo: $("#id_participante_reemplazo").attr('value')},
                                            url: url_pv + 'PropuestasDocumentacion/validar_requisitos_cambio_integrante'
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
                                                    if (data == 'crear_propuesta')
                                                    {
                                                        location.href = url_pv_admin + 'pages/propuestas/propuestas_busqueda_convocatorias.html?msg=Para poder inscribir la propuesta debe crear el perfil de agrupacion.&msg_tipo=danger';
                                                    } else
                                                    {
                                                        if (data == 'acceso_denegado')
                                                        {
                                                            notify("danger", "remove", "Convocatorias:", "No tiene permisos para ver la información.");
                                                        } else
                                                        {
                                                            var json = JSON.parse(data);

                                                            var count = Object.keys(json).length;

                                                            if (count > 0)
                                                            {
                                                                var html_table = '<ul>';
                                                                if (json.documentos_administrativos === 0)
                                                                {
                                                                    html_table = html_table + '<li>No ha cargado la documentación administrativa del nuevo integrante.</li>';
                                                                }
                                                                if (json.integrante_nuevo === 0)
                                                                {
                                                                    html_table = html_table + '<li>No ha ingresado la información del nuevo integrante.</li>';
                                                                }
                                                                html_table = html_table + '</ul>';
                                                                notify("danger", "remove", "Convocatorias:", "<p>Los siguientes requisitos son obligatorios</p>" + html_table);
                                                            } else
                                                            {
                                                                //VALIDAR EL AJUSTE DEL ESTADO DEL CAMBIO DE INTEGRANTE
                                                                $.ajax({
                                                                    type: 'POST',
                                                                    url: url_pv + 'Personasnaturales/editar_cambio_integrante',
                                                                    data: "id=" + $("#id_participante_reemplazo").attr('value') + "&conv=" + getURLParameter('id') + "&propuesta=" + getURLParameter('p') + "&estado_cambio_integrante=49&modulo=Menu Participante&token=" + token_actual.token
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
                                                                                        if (result == 'error_representante_suplente')
                                                                                        {
                                                                                            notify("danger", "ok", "Integrantes:", "No puede registrar mas de un representante suplente.");
                                                                                        } else
                                                                                        {
                                                                                            if (result == 'error_participacion')
                                                                                            {
                                                                                                notify("danger", "ok", "Convocatorias:", "No puede registrar este integrante, debido a que su número de documento ya esta en proceso de inscripción en esta convocatoria con otra propuesta, comuníquese con la mesa de ayuda convocatorias@scrd.gov.co para mayor información.");
                                                                                            } else
                                                                                            {
                                                                                                if (result == 'error_email')
                                                                                                {
                                                                                                    notify("danger", "ok", "Convocatorias:", "Error al enviar la notificación del cambio de integrante, comuníquese con la mesa de ayuda convocatorias@scrd.gov.co para mayor información.");
                                                                                                } else
                                                                                                {
                                                                                                    if (isNaN(result)) {
                                                                                                        notify("danger", "ok", "Integrantes:", "Se registro un error, comuníquese con la mesa de ayuda convocatorias@scrd.gov.co");
                                                                                                    } else
                                                                                                    {
                                                                                                        notify("success", "ok", "Integrantes:", "Se Guardó con el éxito la solicitud para el nuevo integrante.");
                                                                                                        
                                                                                                        //Cargar datos de la tabla
                                                                                                        cargar_tabla(token_actual);
                                                                                                        $("#registro_cambio_integrante").hide("slow");
                                                                        
                                                                                                    }
                                                                                                }
                                                                                            }
                                                                                        }
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
                                        });
                                    });

                                    //Valido formulario
                                    validator_form(token_actual);
                                }
                            }
                        }
                    }
                }
            });

            $('input[type="file"]').change(function (evt) {

                var f = evt.target.files[0];
                var reader = new FileReader();

                // Cierre para capturar la información del archivo.
                reader.onload = function (fileLoadedEvent) {
                    var srcData = fileLoadedEvent.target.result; // <--- data: base64
                    var srcName = f.name;
                    var srcSize = f.size;
                    var srcType = f.type;
                    var ext = srcName.split('.');
                    // ahora obtenemos el ultimo valor despues el punto
                    // obtenemos el length por si el archivo lleva nombre con mas de 2 puntos
                    srcExt = ext[ext.length - 1];

                    var permitidos = $("#permitidos").val();
                    var permitidos_mayuscula = $("#permitidos").val().toUpperCase();
                    var documento = $("#documento").val();
                    var tamano = $("#tamano").val();

                    var extensiones = permitidos.split(',');
                    var extensiones_mayuscula = permitidos_mayuscula.split(',');

                    if (extensiones.includes(srcExt) || extensiones_mayuscula.includes(srcExt))
                    {
                        //mb -> bytes
                        permitidotamano = tamano * 1000 * 1000;
                        if (srcSize > permitidotamano)
                        {
                            notify("danger", "ok", "Documentación:", "El tamaño del archivo excede el permitido (" + tamano + " MB)");
                        } else
                        {
                            $.post(url_pv + 'PropuestasDocumentacion/guardar_archivo_nuevo_integrante', {documento: documento, srcExt: srcExt, srcData: srcData, srcName: srcName, srcSize: srcSize, srcType: srcType, "token": token_actual.token, conv: getURLParameter('id'), modulo: "Menu Participante", m: getURLParameter('perfil'), propuesta: $("#propuesta").attr('value'), nuevo_integrante: true}).done(function (data) {
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
                                            if (data == 'error_carpeta')
                                            {
                                                notify("danger", "ok", "Convocatorias:", "Se registro un error al subir el archivo en la carpeta, comuníquese con la mesa de ayuda convocatorias@scrd.gov.co");
                                            } else
                                            {
                                                if (data == 'error_archivo')
                                                {
                                                    notify("danger", "ok", "Convocatorias:", "Se registro un error al subir el archivo, comuníquese con la mesa de ayuda convocatorias@scrd.gov.co");
                                                } else
                                                {
                                                    if (data == 'error_periodo_convocatoria')
                                                    {
                                                        notify("danger", "ok", "Convocatorias:", "La convocatoria ya no se encuentra disponible para inscribir su propuesta.");
                                                    } else
                                                    {
                                                        notify("success", "ok", "Convocatorias:", "Se Guardó con el éxito el archivo.");
                                                        cargar_tabla_archivos(token_actual, documento);
                                                    }
                                                }
                                            }
                                        }
                                    }
                                }

                            });
                        }
                    } else
                    {
                        notify("danger", "ok", "Documentación:", "Archivo no permitido");
                    }

                };
                // Leer en el archivo como una URL de datos.                
                reader.readAsDataURL(f);
            });

            validator_form_link(token_actual);

        } else
        {
            //si el parametro p no es númerico
            location.href = url_pv_admin + 'pages/propuestas/mis_propuestas.html?msg=El código de la propuesta no es valido.&msg_tipo=danger';
        }
    }

});

//Valida el formulario del nuevo integrante
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
            afirmacion_no_contratista: {
                validators: {
                    notEmpty: {
                        message: 'Es requerida la afirmación de que, Bajo gravedad de juramento informo que no soy contratista.'
                    }
                }
            },
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
            tiene_rut: {
                validators: {
                    notEmpty: {message: 'El RUT es requerido'}
                }
            },
            tiene_matricula: {
                validators: {
                    notEmpty: {message: '¿Cuenta usted con matrícula mercantil?, es requerido'}
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
                    notEmpty: {message: 'La experiencia es requerido'},
                    stringLength: {
                        message: 'Ya cuenta con el máximo de caracteres permitidos, los cuales son 1000.',
                        max: '1000'
                    }
                }
            },
            actividades_cargo: {
                validators: {
                    notEmpty: {message: 'Las actividades a cargo es requerido'},
                    stringLength: {
                        message: 'Ya cuenta con el máximo de caracteres permitidos, los cuales son 1000.',
                        max: '1000'
                    }
                }
            },
            por_que_actualiza: {
                validators: {
                    notEmpty: {message: 'Justifique el cambio de integrante en la agrupación, es requerido'}
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


        var enviar = true;

        if ($("#tiene_rut").val() === "Sí")
        {
            if ($("#ciiu").val() === "")
            {
                notify("danger", "ok", "Persona natural:", "Código CIIU de su actividad principal, es requerido");
                enviar = false;
            }
        }

        if (enviar)
        {
            $('#formulario_principal').attr('action', url_pv + 'Personasnaturales/crear_integrante');



            //Se realiza la peticion con el fin de guardar el registro actual
            $.ajax({
                type: 'POST',
                url: $form.attr('action'),
                data: $form.serialize() + "&modulo=Menu Participante&token=" + token_actual.token
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
                                    if (result == 'error_representante_suplente')
                                    {
                                        notify("danger", "ok", "Integrantes:", "No puede registrar mas de un representante suplente.");
                                    } else
                                    {
                                        if (result == 'error_participacion')
                                        {
                                            notify("danger", "ok", "Convocatorias:", "No puede registrar este integrante, debido a que su número de documento ya esta en proceso de inscripción en esta convocatoria con otra propuesta, comuníquese con la mesa de ayuda convocatorias@scrd.gov.co para mayor información.");
                                        } else
                                        {
                                            if (isNaN(result)) {
                                                notify("danger", "ok", "Integrantes:", "Se registro un error, comuníquese con la mesa de ayuda convocatorias@scrd.gov.co");
                                            } else
                                            {
                                                notify("success", "ok", "Integrantes:", "Se Guardó con el éxito la información del integrante.");

                                                $("#id").attr('value', result);

                                                $form.bootstrapValidator('disableSubmitButtons', false);

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
            $form.bootstrapValidator('disableSubmitButtons', false);

            return false;
        }


    });

}

//Carga la tabla de los integrantes actuales de la propuesta
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
        "searching": false,
        "bLengthChange": false,
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

//Muestra los TAB del nuevo registro
function cargar_formulario(token_actual)
{

    $(".cargar_cambio_integrante").click(function () {
        if ($(this).attr('translate') === '49') {
            notify("danger", "ok", "Convocatorias:", "No es posible ver la información, debido a que su solicitud esta en estado Enviado a la entidad para aprobar.");
            $("#registro_cambio_integrante").hide("slow");
        } else
        {
            //Cargo el id actual       
            $("#id").attr('value', '');
            $("#id_participante_reemplazo").attr('value', $(this).attr('title'));
            $(".integrante").html($(this).attr('lang'));
            $("#registro_cambio_integrante").show("slow");

            $("#formulario_principal").bootstrapValidator('disableSubmitButtons', false).bootstrapValidator('resetForm', true);



            //Valido el estado del representante
            var representante = $(this).attr('dir');
            var representante_suplente = $(this).attr('name');
            var tipo_representante;
            if (representante === 't')
            {
                tipo_representante = "Principal";
            }
            if (representante_suplente === 't')
            {
                tipo_representante = "Suplente";
            }
            if (representante === 'f' && representante_suplente === 'f')
            {
                tipo_representante = "Noaplica";
            }
            $("#tipo_representante").val(tipo_representante);

            //Consulto si existe el registro del integrante nuevo y cargar el formulario
            $.ajax({
                type: 'GET',
                data: {"token": token_actual.token, "cambio_integrante": true, "participante": $("#participante").attr('value'), "conv": $("#conv").attr('value'), "modulo": "Menu Participante", "id": $(this).attr('title')},
                url: url_pv + 'Personasnaturales/editar_integrante/'
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

                        //Cargo los select de barrios
                        $('#barrio_residencia').find('option').remove();
                        $("#barrio_residencia").append('<option value="">:: Seleccionar ::</option>');
                        if (json.barrios.length > 0) {
                            $.each(json.barrios, function (key, barrio) {
                                var selected = '';
                                if (barrio.id == json.participante.barrio_residencia)
                                {
                                    selected = 'selected="selected"';
                                }
                                $("#barrio_residencia").append('<option value="' + barrio.id + '" ' + selected + ' >' + barrio.nombre + '</option>');
                            });
                        }

                        $('#departamento').find('option').remove();
                        $("#departamento").append('<option value="">:: Seleccionar ::</option>');
                        if (json.departamentos.length > 0) {
                            $.each(json.departamentos, function (key, departamento) {
                                var selected = '';
                                if (departamento.id == json.departamento_residencia_id)
                                {
                                    selected = 'selected="selected"';
                                }
                                $("#departamento").append('<option value="' + departamento.id + '" ' + selected + ' >' + departamento.nombre + '</option>');
                            });
                        }

                        $('#departamento_nacimiento').find('option').remove();
                        $("#departamento_nacimiento").append('<option value="">:: Seleccionar ::</option>');
                        if (json.departamentos_nacimiento.length > 0) {
                            $.each(json.departamentos_nacimiento, function (key, departamento) {
                                var selected = '';
                                if (departamento.id == json.departamento_nacimiento_id)
                                {
                                    selected = 'selected="selected"';
                                }
                                $("#departamento_nacimiento").append('<option value="' + departamento.id + '" ' + selected + ' >' + departamento.nombre + '</option>');
                            });
                        }

                        $('#ciudad_residencia').find('option').remove();
                        $("#ciudad_residencia").append('<option value="">:: Seleccionar ::</option>');
                        if (json.ciudades.length > 0) {
                            $.each(json.ciudades, function (key, ciudad) {
                                var selected = '';
                                if (ciudad.id == json.ciudad_residencia_id)
                                {
                                    selected = 'selected="selected"';
                                }
                                $("#ciudad_residencia").append('<option value="' + ciudad.id + '" ' + selected + ' >' + ciudad.nombre + '</option>');
                            });
                        }

                        $('#ciudad_nacimiento').find('option').remove();
                        $("#ciudad_nacimiento").append('<option value="">:: Seleccionar ::</option>');
                        if (json.ciudades_nacimiento.length > 0) {
                            $.each(json.ciudades_nacimiento, function (key, ciudad) {
                                var selected = '';
                                if (ciudad.id == json.ciudad_nacimiento_id)
                                {
                                    selected = 'selected="selected"';
                                }
                                $("#ciudad_nacimiento").append('<option value="' + ciudad.id + '" ' + selected + ' >' + ciudad.nombre + '</option>');
                            });
                        }

                        //Cargo el formulario con los datos
                        $('#formulario_principal').loadJSON(json.participante);
                        $("#por_que_actualiza").val(json.participante.por_que_actualiza);

                        //Valido el ciiu                        
                        if (json.participante.tiene_rut === "Sí")
                        {
                            $("#ciiu").removeAttr("disabled");
                        } else
                        {
                            $("#ciiu").attr("disabled", "disabled");
                        }

                        //Valido el tiene_redes                        
                        if (json.participante.tiene_redes === "Sí")
                        {
                            $(".si_tiene_redes").removeAttr("disabled");
                        } else
                        {
                            $(".si_tiene_redes").attr("disabled", "disabled");
                        }

                        //Valido el tiene_paginas                        
                        if (json.participante.tiene_paginas === "Sí")
                        {
                            $(".si_tiene_espacios").removeAttr("disabled");
                        } else
                        {
                            $(".si_tiene_espacios").attr("disabled", "disabled");
                        }

                        $("#pais option[value='" + json.pais_residencia_id + "']").prop('selected', true);

                        $("#pais_nacimiento option[value='" + json.pais_nacimiento_id + "']").prop('selected', true);

                        //Se coloca como comentario debido a que ya se maneja tipo de reprtesentante
                        $("#representante option[value='" + json.participante.representante + "']").prop('selected', true);

                        if (json.participante.representante == true)
                        {
                            $("#tipo_representante option[value='Principal']").prop('selected', true);
                        }

                        if (json.participante.representante_suplente == true)
                        {
                            $("#tipo_representante option[value='Suplente']").prop('selected', true);
                        }

                        if (json.participante.representante == false && json.participante.representante_suplente == false)
                        {
                            $("#tipo_representante option[value='Noaplica']").prop('selected', true);
                        }


                        $("#director option[value='" + json.participante.director + "']").prop('selected', true);

                        //Valido para que muestre solo los barrios de bogota
                        //Se inactiva william barbosa 
                        //20 de mayo
                        /*
                         if ($("#ciudad_residencia").val() == 151)
                         {
                         $("#barrio_residencia_name").css("display", "block");
                         } else
                         {
                         $("#barrio_residencia_name").css("display", "none");
                         }
                         */

                        $('#experiencia').val(json.participante.experiencia);

                        if (json.participante.experiencia != null)
                        {
                            //agrego los totales de caracteres
                            $(".caracter_experiencia").html(1000 - json.participante.experiencia.length);
                        }

                        $('#actividades_cargo').val(json.participante.actividades_cargo);

                        if (json.participante.actividades_cargo != null)
                        {
                            //agrego los totales de caracteres
                            $(".caracter_actividades_cargo").html(1000 - json.participante.actividades_cargo.length);
                        }

                        $('#nuevo_integrante').modal('toggle');
                    }
                }
            });

            //Cargar la documentación administrativa
            $.ajax({
                type: 'GET',
                data: {"token": token_actual.token, "conv": getURLParameter('id'), "modulo": "Menu Participante", "m": getURLParameter('perfil'), "p": getURLParameter('p')},
                url: url_pv + 'PropuestasDocumentacion/buscar_documentacion'
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

                                    if (data == 'crear_propuesta')
                                    {
                                        location.href = url_pv_admin + 'pages/propuestas/propuestas_busqueda_convocatorias.html?msg=Para poder inscribir la propuesta debe crear el perfil de agrupacion.&msg_tipo=danger';
                                    } else
                                    {
                                        if (data == 'acceso_denegado')
                                        {
                                            notify("danger", "remove", "Convocatorias:", "No tiene permisos para ver la información.");
                                        } else
                                        {
                                            var json = JSON.parse(data);

                                            $("#tabla_administrativos").html('');

                                            var html_table = '';
                                            $.each(json.administrativos, function (key2, documento) {
                                                html_table = html_table + '<tr><td>' + documento.orden + '</td><td>' + documento.requisito + '</td><td>' + documento.descripcion + '</td><td>' + documento.archivos_permitidos + '</td><td>' + documento.tamano_permitido + ' MB</td><td><button title="' + documento.id + '" lang="' + documento.archivos_permitidos + '" dir="' + documento.tamano_permitido + '" type="button" class="btn btn-success btn_tecnico_documento" data-toggle="modal" data-target="#cargar_documento"><span class="glyphicon glyphicon-open"></span></button></td><td><button title="' + documento.id + '"  type="button" class="btn btn-primary btn_tecnico_link" data-toggle="modal" data-target="#cargar_link"><span class="glyphicon glyphicon-link"></span></button></td></tr>';
                                            });

                                            $("#tabla_administrativos").append(html_table);

                                            $(".btn_tecnico_documento").click(function () {
                                                var documento = $(this).attr("title");
                                                var permitidos = $(this).attr("lang");
                                                var tamano = $(this).attr("dir");
                                                $("#archivos_permitidos").html(permitidos);
                                                $("#documento").val(documento);
                                                $("#permitidos").val(permitidos);
                                                $("#tamano").val(tamano);

                                                cargar_tabla_archivos(token_actual, documento, json.estado);
                                            });

                                            $(".btn_tecnico_link").click(function () {
                                                var documento = $(this).attr("title");
                                                $("#documento").val(documento);

                                                cargar_tabla_link(token_actual, documento, json.estado);
                                            });

                                        }
                                    }
                                }
                            }

                        }
                    }
                }
            });


            //Final de la pagina
            var altura = $(document).height();
            $("html, body").animate({scrollTop: altura + "px"});

            //En el elemento HTML
            //var new_position = $('#ver').offset();        
            //window.scrollTo(new_position.left,new_position.top);
        }

    });

}

function cargar_tabla_archivos(token_actual, documento, estado) {
    //Realizo la peticion para cargar el formulario
    $.ajax({
        type: 'GET',
        data: {documento: documento, "token": token_actual.token, conv: getURLParameter('id'), modulo: "Menu Participante", m: getURLParameter('perfil'), propuesta: $("#propuesta").attr('value')},
        url: url_pv + 'PropuestasDocumentacion/buscar_archivos'
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
                if (data == 'crear_propuesta')
                {
                    location.href = url_pv_admin + 'pages/propuestas/propuestas_busqueda_convocatorias.html?msg=Para poder inscribir la propuesta debe crear el perfil de agrupacion.&msg_tipo=danger';
                } else
                {
                    if (data == 'acceso_denegado')
                    {
                        notify("danger", "remove", "Convocatorias:", "No tiene permisos para ver la información.");
                    } else
                    {
                        var json = JSON.parse(data);

                        var html_table = '';
                        $("#tabla_archivos").html("");

                        var disabled = '';

                        $.each(json, function (key2, documento) {
                            disabled = 'disabled="disabled"';
                            if (documento.nuevo_integrante === true)
                            {
                                disabled = '';
                            }
                            html_table = html_table + '<tr class="tr_' + documento.id + '"><td>' + documento.nombre + '</td><td><button type="button" onclick="download_file(\'' + documento.id_alfresco + '\')" class="btn btn-success"><span class="glyphicon glyphicon-save"></span></button></td><td><button onclick="eliminar(\'' + documento.id + '\')" type="button" class="btn btn-danger" ' + disabled + '><span class="glyphicon glyphicon-remove"></span></button></td></tr>';
                        });
                        $("#tabla_archivos").append(html_table);

                    }
                }

            }
        }
    });
}

function cargar_tabla_link(token_actual, documento, estado) {
    //Realizo la peticion para cargar el formulario
    $.ajax({
        type: 'GET',
        data: {documento: documento, "token": token_actual.token, conv: getURLParameter('id'), modulo: "Menu Participante", m: getURLParameter('perfil'), propuesta: $("#propuesta").attr('value')},
        url: url_pv + 'PropuestasDocumentacion/buscar_link'
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
                if (data == 'crear_propuesta')
                {
                    location.href = url_pv_admin + 'pages/propuestas/propuestas_busqueda_convocatorias.html?msg=Para poder inscribir la propuesta debe crear el perfil de agrupacion.&msg_tipo=danger';
                } else
                {
                    if (data == 'acceso_denegado')
                    {
                        notify("danger", "remove", "Convocatorias:", "No tiene permisos para ver la información.");
                    } else
                    {
                        var json = JSON.parse(data);

                        var html_table = '';
                        $("#tabla_link").html("");

                        var disabled = '';
                        $.each(json, function (key2, documento) {

                            disabled = 'disabled="disabled"';
                            if (documento.nuevo_integrante === true)
                            {
                                disabled = '';
                            }
                            html_table = html_table + '<tr class="tr_link_' + documento.id + '"><td><a href="' + documento.link + '" target="_blank">' + documento.link + '</a></td><td><button onclick="eliminar_link(\'' + documento.id + '\')" type="button" class="btn btn-danger" ' + disabled + '><span class="glyphicon glyphicon-remove"></span></button></td></tr>';
                        });
                        $("#tabla_link").append(html_table);

                    }
                }

            }
        }
    });
}

function validator_form_link(token_actual) {

    //Validar el formulario
    $('.formulario_link').bootstrapValidator({
        feedbackIcons: {
            valid: 'glyphicon glyphicon-ok',
            invalid: 'glyphicon glyphicon-remove',
            validating: 'glyphicon glyphicon-refresh'
        },
        fields: {
            link: {
                validators: {
                    notEmpty: {message: 'El link es requerido'},
                    regexp: {
                        regexp: /((([A-Za-z]{3,9}:(?:\/\/)?)(?:[\-;:&=\+\$,\w]+@)?[A-Za-z0-9\.\-]+|(?:www\.|[\-;:&=\+\$,\w]+@)[A-Za-z0-9\.\-]+)((?:\/[\+~%\/\.\w\-_]*)?\??(?:[\-\+=&;%@\.\w_]*)#?(?:[\.\!\/\\\w]*))?)/,
                        message: 'Debe ingresar un link correcto ejemplo (https://www.culturarecreacionydeporte.gov.co)'
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
        $('#formulario_link').attr('action', url_pv + 'PropuestasDocumentacion/guardar_link_nuevo_integrante');

        var documento = $("#documento").val();

        //Se realiza la peticion con el fin de guardar el registro actual
        $.ajax({
            type: 'POST',
            url: $form.attr('action'),
            data: "modulo=Menu Participante&token=" + token_actual.token + "&documento=" + documento + "&conv=" + getURLParameter('id') + "&m=" + getURLParameter('perfil') + "&propuesta=" + $("#propuesta").attr('value') + "&link=" + $("#link").val() + "&nuevo_integrante=true"
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
                        if (data == 'error_carpeta')
                        {
                            notify("danger", "ok", "Convocatorias:", "Se registro un error al subir el archivo en la carpeta, comuníquese con la mesa de ayuda convocatorias@scrd.gov.co");
                        } else
                        {
                            if (data == 'error_periodo_convocatoria')
                            {
                                notify("danger", "ok", "Convocatorias:", "La convocatoria ya no se encuentra disponible para inscribir su propuesta.");
                            } else
                            {
                                notify("success", "ok", "Convocatorias:", "Se Guardó con el éxito el archivo.");
                                cargar_tabla_link(token_actual, documento);
                            }
                        }
                    }
                }
            }

        });

        $form.bootstrapValidator('disableSubmitButtons', false).bootstrapValidator('resetForm', true);
    });

}

//Funcion para descargar archivo
function eliminar(id)
{
    //Verifico si el token exite en el cliente y verifico que el token este activo en el servidor                
    var token_actual = getLocalStorage(name_local_storage);

    //Verifico si el token esta vacio, para enviarlo a que ingrese de nuevo
    if ($.isEmptyObject(token_actual)) {
        location.href = url_pv_admin + 'index.html?msg=Su sesión ha expirado, por favor vuelva a ingresar.&msg_tipo=danger';
    } else
    {
        $.ajax({
            type: 'DELETE',
            data: {"token": token_actual.token, "modulo": "Menu Participante"},
            url: url_pv + 'PropuestasDocumentacion/delete/' + id
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
                    if (data == 'error')
                    {
                        notify("danger", "ok", "Convocatorias:", "Se registro un error en el método, comuníquese con la mesa de ayuda convocatorias@scrd.gov.co");
                    } else
                    {
                        if (data == 'acceso_denegado')
                        {
                            notify("danger", "remove", "Convocatorias:", "No tiene permisos para ver la información.");
                        } else
                        {
                            notify("success", "ok", "Convocatorias:", "Se eliminó con el éxito el archivo.");
                            $(".tr_" + id).remove();
                        }
                    }

                }
            }
        });
    }

}

//Funcion para descargar archivo
function eliminar_link(id)
{
    //Verifico si el token exite en el cliente y verifico que el token este activo en el servidor                
    var token_actual = getLocalStorage(name_local_storage);

    //Verifico si el token esta vacio, para enviarlo a que ingrese de nuevo
    if ($.isEmptyObject(token_actual)) {
        location.href = url_pv_admin + 'index.html?msg=Su sesión ha expirado, por favor vuelva a ingresar.&msg_tipo=danger';
    } else
    {
        $.ajax({
            type: 'DELETE',
            data: {"token": token_actual.token, "modulo": "Menu Participante"},
            url: url_pv + 'PropuestasDocumentacion/delete_link/' + id
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
                    if (data == 'error')
                    {
                        notify("danger", "ok", "Convocatorias:", "Se registro un error en el método, comuníquese con la mesa de ayuda convocatorias@scrd.gov.co");
                    } else
                    {
                        if (data == 'acceso_denegado')
                        {
                            notify("danger", "remove", "Convocatorias:", "No tiene permisos para ver la información.");
                        } else
                        {
                            notify("success", "ok", "Convocatorias:", "Se eliminó con el éxito el archivo.");
                            $(".tr_link_" + id).remove();
                        }
                    }

                }
            }
        });
    }

}

//Funcion para descargar archivo
function download_file(cod)
{
    //Verifico si el token exite en el cliente y verifico que el token este activo en el servidor                
    var token_actual = getLocalStorage(name_local_storage);

    //Verifico si el token esta vacio, para enviarlo a que ingrese de nuevo
    if ($.isEmptyObject(token_actual)) {
        location.href = url_pv_admin + 'index.html?msg=Su sesión ha expirado, por favor vuelva a ingresar.&msg_tipo=danger';
    } else
    {
        $.AjaxDownloader({
            url: url_pv + 'PropuestasDocumentacion/download_file/',
            data: {
                cod: cod,
                token: token_actual.token,
                modulo: "Menu Participante"
            }
        });
    }

}