$(document).ready(function () {

    //Verifico si el token exite en el cliente y verifico que el token este activo en el servidor                
    var token_actual = getLocalStorage(name_local_storage);

    var href_regresar = "";
    var href_siguiente = "";
    //Creando link de navegación para la agrupacion
    if (getURLParameter('m') == "agr")
    {
        href_regresar = "propuestas.html?m=" + getURLParameter('m') + "&id=" + getURLParameter('id') + "&p=" + getURLParameter('p');
        href_siguiente = "documentacion.html?m=" + getURLParameter('m') + "&id=" + getURLParameter('id') + "&p=" + getURLParameter('p');

        $("#link_propuestas").attr("onclick", "location.href = '" + href_regresar + "'");
        $("#link_documentacion").attr("onclick", "location.href = '" + href_siguiente + "'");
    }

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
                                        if (data == 'ingresar')
                                        {
                                            //Vacio el id
                                            $("#id").attr('value', "");
                                            //Asignamos el valor a input conv
                                            $("#conv").attr('value', getURLParameter('id'));

                                            //disabled todos los componentes
                                            $("#formulario_principal input,textarea,select,button[type=submit]").attr("disabled", "disabled");

                                            //Verifica si el token actual tiene acceso de lectura
                                            permiso_lectura(token_actual, "Menu Participante");

                                            //Cargar el select de Pais
                                            $.ajax({
                                                type: 'GET',
                                                data: {"token": token_actual.token},
                                                url: url_pv + 'Paises/select'
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
                                                        $("#pais").append('<option value="">:: Seleccionar ::</option>');
                                                        $("#pais_nacimiento").append('<option value="">:: Seleccionar ::</option>');
                                                        if (json.length > 0) {
                                                            $("#pais").append('<option value="46">Colombia</option>');
                                                            $("#pais_nacimiento").append('<option value="46">Colombia</option>');                        
                                                            
                                                            $.each(json, function (key, pais) {
                                                                if( pais.id !== 46){
                                                                    $("#pais").append('<option value="' + pais.id + '">' + pais.nombre + '</option>');
                                                                    $("#pais_nacimiento").append('<option value="' + pais.id + '">' + pais.nombre + '</option>');
                                                                }
                                                            });
                                                        }
                                                    }
                                                }
                                            });

                                            //Cargar el select de Localidades
                                            $.ajax({
                                                type: 'GET',
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
                                                                if( pais.id !== 21){
                                                                    $("#localidad_residencia").append('<option value="' + pais.id + '">' + pais.nombre + '</option>');
                                                                }
                                                            });
                                                            $("#localidad_residencia").append('<option value="21">No aplica</option>'); 
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
                                                    type: 'GET',
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
                                                    type: 'GET',
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
                                                    type: 'GET',
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
                                                data: {"token": token_actual.token, "conv": $("#conv").attr('value'), "modulo": "Menu Participante", "m": getURLParameter('m'), "p": getURLParameter('p')},
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
                                                                                    
                                                                                    $(".si_tiene_espacios,.si_tiene_redes,#ciiu").attr("disabled","disabled");                                                                                                                                                                        
                                                                                }

                                                                                //Creo link de navegacion para persona juridica
                                                                                if (getURLParameter('m') == "pj")
                                                                                {
                                                                                    if (json.programa == 2)
                                                                                    {

                                                                                        var path_actual = window.location.pathname;
                                                                                        if (path_actual == "/admin_SCRD_pv/pages/propuestas/junta.html")
                                                                                        {
                                                                                            href_regresar = "propuestas_pdac.html?m=" + getURLParameter('m') + "&id=" + getURLParameter('id') + "&p=" + getURLParameter('p');
                                                                                            href_siguiente = "grupos_trabajos.html?m=" + getURLParameter('m') + "&id=" + getURLParameter('id') + "&p=" + getURLParameter('p');

                                                                                        }
                                                                                        if (path_actual == "/admin_SCRD_pv/pages/propuestas/grupos_trabajos.html")
                                                                                        {
                                                                                            href_regresar = "junta.html?m=" + getURLParameter('m') + "&id=" + getURLParameter('id') + "&p=" + getURLParameter('p');
                                                                                            href_siguiente = "objetivos_metas_actividades.html?m=" + getURLParameter('m') + "&id=" + getURLParameter('id') + "&p=" + getURLParameter('p');
                                                                                        }

                                                                                        $("#link_propuestas").attr("onclick", "location.href = '" + href_regresar + "'");
                                                                                        $("#link_documentacion").attr("onclick", "location.href = '" + href_siguiente + "'");
                                                                                    } else
                                                                                    {
                                                                                        href_regresar = "propuestas.html?m=" + getURLParameter('m') + "&id=" + getURLParameter('id') + "&p=" + getURLParameter('p');
                                                                                        href_siguiente = "documentacion.html?m=" + getURLParameter('m') + "&id=" + getURLParameter('id') + "&p=" + getURLParameter('p');

                                                                                        $("#link_propuestas").attr("onclick", "location.href = '" + href_regresar + "'");
                                                                                        $("#link_documentacion").attr("onclick", "location.href = '" + href_siguiente + "'");
                                                                                    }
                                                                                }

                                                                                if (json.programa == 2)
                                                                                {
                                                                                    $(".programa_actual").html("PDAC")
                                                                                } else
                                                                                {
                                                                                    $(".programa_actual").html("PDE")
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
                                                $("#ciiu").val("");

                                                $(".caracter_experiencia").html("1000");
                                                $(".caracter_actividades_cargo").html("1000");

                                                $("#id").val("");
                                            });
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            });

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

        } else
        {
            location.href = url_pv_admin + 'pages/propuestas/propuestas_busqueda_convocatorias.html?msg=El código de la propuesta no es valido.&msg_tipo=danger';
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
            }
        }
    }).on('success.form.bv', function (e) {
        
        var enviar = true;

        if ($("#tiene_rut").val() === "Sí")
        {
            if ($("#ciiu").val() === "")
            {
                notify("danger", "ok", "Persona natural:", "Código CIIU de su actividad principal, es requerido");
                enviar = false;
            }
        }
        
        
        // Prevent form submission
        e.preventDefault();
        // Get the form instance
        var $form = $(e.target);

        // Get the BootstrapValidator instance
        var bv = $form.data('bootstrapValidator');

        // Valido si el id existe, con el fin de eviarlo al metodo correcto
        $('#formulario_principal').attr('action', url_pv + 'Personasnaturales/crear_integrante');

        if(enviar)
        {
            

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
        }

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
            url: url_pv + "Personasnaturales/cargar_tabla_integrantes",
            data: {"token": token_actual.token, "participante": $("#participante").attr('value'), "conv": $("#conv").attr('value'), "modulo": "Menu Participante", "m": getURLParameter('m'), "p": getURLParameter('p'), "tipo": $("#tipo").attr('value')}
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
            {"data": "activar_registro"},
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
                            row.representante = "<b>Sí</b>";
                        } else
                        {
                            row.representante = "No";
                        }
                        return row.representante;
                    }
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
            type: 'GET',
            data: {"token": token_actual.token, "propuesta": $("#propuesta").attr('value'), "participante": $("#participante").attr('value'), "conv": $("#conv").attr('value'), "modulo": "Menu Participante", "m": getURLParameter('m'), "id": $("#id").attr('value')},
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

                    $("#representante option[value='" + json.participante.representante + "']").prop('selected', true);

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
    });

    //Permite activar o eliminar una categoria
    $(".activar_categoria").click(function () {

        var active = "false";
        if ($(this).prop('checked')) {
            active = "true";
        }


        $.ajax({
            type: 'DELETE',
            data: {"token": token_actual.token, "modulo": "Menu Participante", "active": active},
            url: url_pv + 'Personasnaturales/eliminar_integrante/' + $(this).attr("title")
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
                            notify("danger", "remove", "Convocatorias:", "Acceso denegado.");
                        } else
                        {
                            if (data == 'ok')
                            {
                                if (active == "true")
                                {
                                    notify("info", "ok", "Convocatorias:", "Se activó el integrante con éxito.");
                                } else
                                {
                                    notify("info", "ok", "Convocatorias:", "Se inactivo el integrante con éxito.");
                                }
                            }
                        }
                    }
                }
            }
        });
    });

}