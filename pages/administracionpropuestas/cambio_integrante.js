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
                    notify("danger", "ok", "Convocatorias:", "Por favor actualizar la página, debido a que su sesión caduco");
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
                        notify("danger", "ok", "Convocatorias:", "Por favor actualizar la página, debido a que su sesión caduco");
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
                                    notify("danger", "ok", "Convocatorias:", "Por favor actualizar la página, debido a que su sesión caduco");
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
                                notify("danger", "ok", "Convocatorias:", "Por favor actualizar la página, debido a que su sesión caduco");
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
                                notify("danger", "ok", "Convocatorias:", "Por favor actualizar la página, debido a que su sesión caduco");
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

            //Cargar el select de Pais
            $.ajax({
                type: 'POST',
                data: {"token": token_actual.token},
                url: url_pv + 'Paises/select'
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
                type: 'POST',
                data: {"token": token_actual.token, "ciudad": 151},
                url: url_pv + 'Localidades/select'
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
                    type: 'POST',
                    data: {"token": token_actual.token, "pais": pais},
                    url: url_pv + 'Departamentos/select'
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
                    type: 'POST',
                    data: {"token": token_actual.token, "pais": pais_nacimiento},
                    url: url_pv + 'Departamentos/select'
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
                    type: 'POST',
                    data: {"token": token_actual.token, "departamento": departamento},
                    url: url_pv + 'Ciudades/select'
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
                    type: 'POST',
                    data: {"token": token_actual.token, "departamento": departamento},
                    url: url_pv + 'Ciudades/select'
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
                    type: 'POST',
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
                            notify("danger", "ok", "Convocatorias:", "Por favor actualizar la página, debido a que su sesión caduco");
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
                type: 'POST',
                data: {"token": token_actual.token, "modulo": "SICON-PROPUESTAS-CAMBIO-INTEGRANTE", "idp": $("#propuestas").val()},
                url: url_pv + 'Personasnaturales/formulario_cambio_integrante_funcionario'
            }).done(function (data) {
                if (data == 'error_metodo')
                {
                    notify("danger", "ok", "Convocatorias:", "Se registro un error en el método, comuníquese con la mesa de ayuda convocatorias@scrd.gov.co");
                } else
                {
                    if (data == 'error_token')
                    {
                        notify("danger", "ok", "Convocatorias:", "Por favor actualizar la página, debido a que su sesión caduco");
                    } else
                    {
                        if (data == 'acceso_denegado')
                        {
                            notify("danger", "remove", "Convocatorias:", "No tiene permisos para ver la información.");
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
                            
                        }
                    }
                }
            });

            $(".validar_solicitud").click(function () {

                var tipo = $(this).attr('id');
                var id_estado = $(this).attr('title');
                var mensaje = $(this).attr('name');
                var enviar = true;                
                if( tipo=="enviar_notificacion" || tipo=="rechazar_solicitud" )
                {
                    if ($("#observaciones_integrante").val() === "")
                    {
                        enviar = false;                
                    }
                }
                
                if(enviar)
                {
                    $.ajax({
                        type: 'POST',
                        url: url_pv + 'Personasnaturales/validar_cambio_integrante',
                        data: "id=" + $("#id_participante_reemplazo").attr('value') + "&conv=" + $("#convocatoria").val() + "&propuesta=" + $("#propuestas").val() + "&estado_cambio_integrante="+id_estado+"&tipo_notificacion="+tipo+"&modulo=SICON-PROPUESTAS-CAMBIO-INTEGRANTE&token=" + token_actual.token+"&observaciones_integrante="+$("#observaciones_integrante").val()
                    }).done(function (result) {
                        var result = result.trim();

                        if (result == 'error')
                        {
                            notify("danger", "ok", "Integrantes:", "Se registro un error, comuníquese con la mesa de ayuda convocatorias@scrd.gov.co");
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
                                    if (result == 'error_metodo')
                                    {
                                        notify("danger", "ok", "Integrantes:", "Se registro un error, comuníquese con la mesa de ayuda convocatorias@scrd.gov.co");
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
                                                notify("success", "ok", "Integrantes:", mensaje);

                                                //Cargar datos de la tabla
                                                cargar_tabla(token_actual);
                                                $("#registro_cambio_integrante").hide("slow");
                                            }
                                        }                                                                                    
                                    }
                                }
                            }
                        }

                    }); 
                }
                else
                {
                    notify("danger", "ok", "Integrantes:", "Las observaciones de la subsanación o del rechazo, es requerida");
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
        
        if ($(this).attr('translate') !== '49') {
            notify("danger", "ok", "Convocatorias:", "No es posible ver la información, debido a que su solicitud no esta en estado (Enviado a la entidad para aprobar).");
            $("#registro_cambio_integrante").hide("slow");
        } 
        else
        {

        $("#formulario_principal input,#formulario_principal select,#formulario_principal button[type=submit],#formulario_principal textarea").attr("disabled","disabled");   
        
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
            type: 'POST',
            data: {"token": token_actual.token, "cambio_integrante": true, "participante": $("#participante").attr('value'), "conv": $("#conv").attr('value'), "modulo": "SICON-PROPUESTAS-CAMBIO-INTEGRANTE", "id": $(this).attr('title')},
            url: url_pv + 'Personasnaturales/editar_integrante_funcionario/'
        }).done(function (data) {
            if (data == 'error_metodo')
            {
                notify("danger", "ok", "Convocatorias:", "Se registro un error en el método, comuníquese con la mesa de ayuda convocatorias@scrd.gov.co");
            } else
            {
                if (data == 'error_token')
                {
                    notify("danger", "ok", "Convocatorias:", "Por favor actualizar la página, debido a que su sesión caduco");
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
                }
            }
        });

        //Cargar la documentación administrativa
        $.ajax({
            type: 'POST',
            data: {"token": token_actual.token, "modulo": "SICON-PROPUESTAS-CAMBIO-INTEGRANTE"},
            url: url_pv + 'PropuestasCambioIntegrante/cargar_propuesta/'+$("#propuestas").val()
        }).done(function (data) {
            if (data == 'error_metodo')
            {
                notify("danger", "ok", "Convocatorias:", "Se registro un error en el método, comuníquese con la mesa de ayuda convocatorias@scrd.gov.co");
            } else
            {
                if (data == 'error_token')
                {
                    notify("danger", "ok", "Convocatorias:", "Por favor actualizar la página, debido a que su sesión caduco");
                } else
                {
                    if (data == 'crear_perfil_pn')
                    {
                        notify("danger", "ok", "Convocatorias:", "La propuesta no cuenta con el perfil como persona natural");                        
                    } else
                    {
                        if (data == 'crear_perfil_pj')
                        {
                            notify("danger", "ok", "Convocatorias:", "La propuesta no cuenta con el perfil como persona jurídica");                        
                        } else
                        {
                            if (data == 'crear_perfil_agr')
                            {
                                notify("danger", "ok", "Convocatorias:", "La propuesta no cuenta con el perfil como agrupación");
                            } else
                            {

                                if (data == 'crear_propuesta')
                                {                                    
                                    notify("danger", "ok", "Convocatorias:", "No existe la propuesta");
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

function cargar_tabla_archivos(token_actual, documento) {
    //Realizo la peticion para cargar el formulario
    $.ajax({
        type: 'POST',
        data: {documento: documento, "token": token_actual.token, modulo: "SICON-PROPUESTAS-CAMBIO-INTEGRANTE", propuesta: $("#propuestas").val()},
        url: url_pv + 'PropuestasCambioIntegrante/buscar_archivos'
    }).done(function (data) {
        if (data == 'error_metodo')
        {
            notify("danger", "ok", "Convocatorias:", "Se registro un error en el método, comuníquese con la mesa de ayuda convocatorias@scrd.gov.co");
        } else
        {
            if (data == 'error_token')
            {
                notify("danger", "ok", "Convocatorias:", "Por favor actualizar la página, debido a que su sesión caduco");
            } else
            {
                if (data == 'crear_propuesta')
                {
                    notify("danger", "ok", "Convocatorias:", "No existe la propuesta");                    
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
                        $.each(json, function (key2, documento) {
                            html_table = html_table + '<tr class="tr_' + documento.id + '"><td>' + documento.nombre + '</td><td><button type="button" onclick="download_file(\'' + documento.id_alfresco + '\')" class="btn btn-success"><span class="glyphicon glyphicon-save"></span></button></td></tr>';
                        });
                        $("#tabla_archivos").append(html_table);

                    }
                }

            }
        }
    });
}

function cargar_tabla_link(token_actual, documento) {
    //Realizo la peticion para cargar el formulario
    $.ajax({
        type: 'POST',
        data: {documento: documento, "token": token_actual.token, modulo: "SICON-PROPUESTAS-CAMBIO-INTEGRANTE", propuesta: $("#propuestas").val()},
        url: url_pv + 'PropuestasCambioIntegrante/buscar_link'
    }).done(function (data) {
        if (data == 'error_metodo')
        {
            notify("danger", "ok", "Convocatorias:", "Se registro un error en el método, comuníquese con la mesa de ayuda convocatorias@scrd.gov.co");
        } else
        {
            if (data == 'error_token')
            {
                notify("danger", "ok", "Convocatorias:", "Por favor actualizar la página, debido a que su sesión caduco");
            } else
            {
                if (data == 'crear_propuesta')
                {
                    notify("danger", "ok", "Convocatorias:", "No existe la propuesta");
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
                        $.each(json, function (key2, documento) {
                            html_table = html_table + '<tr class="tr_link_' + documento.id + '"><td><a href="' + documento.link + '" target="_blank">' + documento.link + '</a></td></tr>';
                        });
                        $("#tabla_link").append(html_table);

                    }
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