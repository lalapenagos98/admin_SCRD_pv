//Array del consumo con el back
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
            permiso_lectura_keycloak(token_actual.token, "SICON-JURADOS-PRESELECCION");

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

            $('.convocatorias-search').select2();
            //Verifica si el token actual tiene acceso de lectura
            init(token_actual);
            //cargar_datos_formulario(token_actual);
            validator_form(token_actual);

            //carga select_convocatorias
            $('#anio').change(function () {
                cargar_select_convocatorias(token_actual, $('#anio').val(), $('#entidad').val());
                $('#select_categorias').hide();
                $('#convocatorias').val(null);
                $('#categorias').val(null);
                //cargar_tabla(token_actual);
            });

            //carga select convocatorias
            $('#entidad').change(function () {
                cargar_select_convocatorias(token_actual, $('#anio').val(), $('#entidad').val());
                $('#select_categorias').hide();
                $('#convocatorias').val(null);
                $('#categorias').val(null);
                //cargar_tabla(token_actual);
            });

            //cargar perfiles de la convocatoria
            $('#convocatorias').change(function () {
                cargar_select_perfiles(token_actual, $('#convocatorias').val());
                $('#categorias').val(null);
                //cargar_tabla(token_actual);
            });

            //carga el select categorias
            $('#convocatorias').change(function () {
                cargar_select_categorias(token_actual, $('#convocatorias').val());
                $('#categorias').val(null);
                //cargar_tabla(token_actual);
            });

            $('#categorias').change(function () {
                //cargar_tabla(token_actual);
            });

            //carga la tabla con los criterios de busqueda
            $('#buscar').click(function () {
                $('#resultado').focus();
                cargar_tabla(token_actual);
            });

            $('#buscar_filtro').click(function () {
                $('#resultado').focus();
                cargar_tabla_filtro(token_actual);
            });

            $('#limpiar_filtros').click(function () {

                $('#formacion_profesional_mentor').val($('#formacion_profesional_mentor').prop(''));
                $('#area_experticia').val($('#formacion_profesional_mentor').prop(''));
                $('#formacion_postgrado_mentor').val($('#formacion_profesional_mentor').prop(''));
                $('#nivel_educativo_mentor').val($('#formacion_profesional_mentor').prop(''));
                $('#experiencia_docente').val($('#formacion_profesional_mentor').prop(''));
                $('#grupo_etnico').val($('#formacion_profesional_mentor').prop(''));
                $('#reside_bogota_mentor').val($('#formacion_profesional_mentor').prop(''));
                $('#reside_localidad').val($('#formacion_profesional_mentor').prop(''));
                $('#localidad_mentor').val($('#formacion_profesional_mentor').prop(''));
                $('#palabra_clave_filtro').val($('#formacion_profesional_mentor').prop(''));

            });

            //carga el formulario para la busqueda por filtros
            $('#abrir_filtros').click(function () {
                if($('#formulario_busqueda_libre_oculto').val() == 'true'){
                    $('#formulario_busqueda_libre').show();
                    $('#formulario_busqueda_libre_oculto').val('false');
                    $('#abrir_filtros').text('Cerrar filtros');
                }else{
                    $('#formulario_busqueda_libre').hide();
                    $('#formulario_busqueda_libre_oculto').val('true');
                    $('#abrir_filtros').text('Abrir filtros');
                }
            });


            //acta preselección
            $("#generar_acta_preseleccion").click(function () {

                $("#mensajegn").show();
                $("#bcancelargn").show();
                $("#baceptargn").show();
            });
            $("#baceptargn").click(function () {
                if ($("#categorias").val() === null) {
                    generar_acta_jurados_preseleccionados(token_actual, $("#convocatorias").val());
                } else {
                    generar_acta_jurados_preseleccionados(token_actual, $("#categorias").val());
                }
//            generar_acta_jurados_preseleccionados(token_actual, $('#rondas').val());
                $('#genera_acta_modal').modal('hide');
            });

            $("#exampleModal").on('hide.bs.modal', function () {
                $('#filtro').val(null);
                $('#palabra_clave').val(null);
                $("#formulario_busqueda_banco").trigger("reset");
            });

            $("#evaluar").on('hide.bs.modal', function () {

            });

            $("#form_aplica_perfil").bootstrapValidator({
                feedbackIcons: {
                    valid: 'glyphicon glyphicon-ok',
                    invalid: 'glyphicon glyphicon-remove',
                    validating: 'glyphicon glyphicon-refresh'
                },
                fields: {
                    descripcion_evaluacion: {
                        enabled: false,
                        validators: {
                            notEmpty: {
                                message: 'Digite la razón por la cual no aplica el perfil.'
                            }
                        }
                    },
                    'option_aplica_perfil': {
                        validators: {
                            notEmpty: {
                                message: 'Debe seleccionar si aplica ó no el perfil.'
                            },
                        }
                    }

                }
            })
                    .on('error.field.bv', function (e, data) {

                        if (data.field == "option_aplica_perfil") {
                            notify("danger", "remove", "Usuario:", "Debe seleccionar si aplica ó no el perfil.");
                        }

                    })
                    .on('success.form.bv', function (e) {

                        // Prevent form submission
                        e.preventDefault();
                        // Get the form instance
                        var $form = $(e.target);

                        // Get the BootstrapValidator instance
                        var bv = $form.data('bootstrapValidator');

                        evaluar_perfil(token_actual, $("#id_jurados_postulados").val(), $("#id_participante_sel").val());

                        bv.resetForm();

                    });

            $("#alertModalSelbaceptar").click(function () {
                $('#select_categorias_2').hide();
                $('#categorias').val($('#categorias_2').val());
                $("#panel_tabs").show();
            });

            $("#optionsRadiosInline1").click(function () {

                $('#form_aplica_perfil').bootstrapValidator('enableFieldValidators', 'descripcion_evaluacion', false);
            });

            $("#optionsRadiosInline2").click(function () {

                if (this.checked) {
                    $('#form_aplica_perfil').bootstrapValidator('enableFieldValidators', 'descripcion_evaluacion', true);
                    $('#form_aplica_perfil').bootstrapValidator('validateField', 'descripcion_evaluacion');
                }

            });

            $("#baceptar").click(function () {
                $('#alertModal').modal('hide');
                confirmar_evaluacion(token_actual, $("#id_perfil_selecionado").val(), $("#id_participante_sel").val());
                $('#evaluar').modal('hide');
            });

            $("#liberar_jurados").click(function () {
                if ($("#convocatorias").val() === "") {
                    $('#mensaje_seleccionar_convocatoria').show();
                    $('#bcancelar_liberar').show();
                    $('#mensaje_liberar').hide();
                    $('#baceptar_liberar').hide();
                } else {
                    $('#mensaje_liberar').show();
                    $('#bcancelar_liberar').show();
                    $('#baceptar_liberar').show();
                    $('#mensaje_seleccionar_convocatoria').hide();
                }
            });

            $("#baceptar_liberar").click(function () {
                $('#confirmar_liberar').modal('hide');
                if ($("#categorias").val() === null) {
                    liberar_postulaciones(token_actual, $("#convocatorias").val());
                } else {
                    liberar_postulaciones(token_actual, $("#categorias").val());
                }
            });

        }
    }

}).catch(function () {
    location.href = url_pv_admin + 'error_keycloak.html';
});
//hasta aca



function init(token_actual) {
//Realizo la peticion para cargar el formulario
    $.ajax({
        type: 'POST', //Se cambia de petición GET a POST
        data: {"token": token_actual.token, "id": $("#id").attr('value')},
        url: url_pv + 'Mentorespreseleccion/init/'
    }).done(function (data) {

        switch (data) {
            case 'error':
                notify("danger", "ok", "Convocatorias:", "Se registro un error, comuníquese con la mesa de ayuda convocatorias@scrd.gov.co");
                break;
            case 'error_metodo':
                notify("danger", "ok", "Se registro un error en el método, comuníquese con la mesa de ayuda convocatorias@scrd.gov.co");
                break;
            case 'error_token':
                notify("danger", "ok", "Convocatorias:", "Por favor actualizar la página, debido a que su sesión caduco");
                break;
            case 'acceso_denegado':
                notify("danger", "remove", "Usuario:", "No tiene permisos para editar información.");
                break;
            default:


                var json = JSON.parse(data);
                //Cargos el select de convocatorias jurado
                $('#banco_jurado').find('option').remove();
                $("#banco_jurado").append('<option value="">:: Seleccionar ::</option>');
                if (json.convocatorias_jurados.length > 0) {
                    $.each(json.convocatorias_jurados, function (key, convocatoria_jurado) {
                        $("#banco_jurado").append('<option value="' + convocatoria_jurado.id + '" >' + convocatoria_jurado.nombre + '</option>');
                    });
                }

                /*
                 * 20-05-2020
                 * Wilmer Gustavo Mogollón Duque
                 * Se agregan acciones para listar área de conocimiento y nucleo básico del conocimiento
                 */

                //Cargos el select de areasconocimientos
                $('#area_conocimiento').find('option').remove();
                $("#area_conocimiento").append('<option value="">:: Seleccionar ::</option>');
                if (json.area_conocimientos.length > 0) {
                    $.each(json.area_conocimientos, function (key, array) {
                        $("#area_conocimiento").append('<option value="' + array.id + '" >' + array.nombre + '</option>');
                    });
                }
                
                //Cargos el select de linea_experiencia
                $('#linea_experiencia').find('option').remove();
                $("#linea_experiencia").append('<option value="">:: Seleccionar ::</option>');
                if (json.linea_experiencia.length > 0) {
                    $.each(json.linea_experiencia, function (key, array) {
                        $("#linea_experiencia").append('<option value="' + array.id + '" >' + array.nombre + '</option>');
                    });
                }

                //cargar_select_nucleobasico
                $('#area_conocimiento').change(function () {
                    cargar_select_nucleobasico(token_actual, $('#area_conocimiento').val());
                });
                //Cargos el select de entidad
                $('#entidad').find('option').remove();
                $("#entidad").append('<option value="">:: Seleccionar ::</option>');
                if (json.entidades.length > 0) {
                    $.each(json.entidades, function (key, entidad) {
                        $("#entidad").append('<option value="' + entidad.id + '" >' + entidad.nombre + '</option>');
                    });
                }

                //Cargos el select de año
                $('#anio').find('option').remove();
                $("#anio").append('<option value="">:: Seleccionar ::</option>');
                if (json.anios.length > 0) {
                    $.each(json.anios, function (key, value) {
                        $("#anio").append('<option value="' + value + '" >' + value + '</option>');
                    });
                }

                break;
        }

    });
}

function cargar_select_convocatorias(token_actual, anio, entidad) {


    $.ajax({
        type: 'POST',
        url: url_pv + 'Juradospreseleccion/select_convocatorias',
        data: {"token": token_actual.token, "anio": anio, "entidad": entidad},
    }).done(function (data) {

        switch (data) {
            case 'error':
                notify("danger", "ok", "Convocatorias:", "Se registro un error, comuníquese con la mesa de ayuda convocatorias@scrd.gov.co");
                break;
            case 'error_metodo':
                notify("danger", "ok", "Se registro un error en el método, comuníquese con la mesa de ayuda convocatorias@scrd.gov.co");
                break;
            case 'error_token':
                notify("danger", "ok", "Convocatorias:", "Por favor actualizar la página, debido a que su sesión caduco");
                break;
            case 'acceso_denegado':
                notify("danger", "remove", "Usuario:", "No tiene permisos acceder a la información.");
                break;
            default:
                var json = JSON.parse(data);
                //Cargos el select de areasconocimientos
                $('#convocatorias').find('option').remove();
                $("#convocatorias").append('<option value="">:: Seleccionar ::</option>');
                if (json != null && json.length > 0) {
                    $.each(json, function (key, array) {
                        $("#convocatorias").append('<option value="' + array.id + '" >' + array.nombre + '</option>');
                    });
                }

                break;
        }

    }
    );
}

function cargar_select_categorias(token_actual, convocatoria) {

    //Consulto la convocatoria
    $.ajax({
        type: 'POST',
        data: {"token": token_actual.token},
        url: url_pv + 'Convocatorias/convocatoria/'+convocatoria
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

                $("#mensaje_convocatoria").html("");
                
                if(json.tiene_categorias){
                    
                    $("#mensaje_convocatoria").css("display","block");
                    
                    if(json.mismos_jurados_categorias){
                        $("#mensaje_convocatoria").html("Esta convocatoria esta configurada para que los <b>jurados sean los mismos en sus diferentes categorías</b>, si no es así, antes de iniciar con la preselección, comunicarse con la persona encargada de la configuración de las convocatorias de su Entidad, para ser ajustada y poder continuar con su <b>preselección de jurados.</b>");
                    }
                    else
                    {
                        $("#mensaje_convocatoria").html("Esta convocatoria esta configurada para que los <b>jurados NO sean los mismos en sus diferentes categorías</b>, si no es así, antes de iniciar con la preselección, comunicarse con la persona encargada de la configuración de las convocatorias de su Entidad, para ser ajustada y poder continuar con su <b>preselección de jurados.</b>");
                    }
                }
                
            }
        }
    });

    
    $.ajax({
        type: 'POST',
        url: url_pv + 'Juradospreseleccion/select_categorias',
        data: {"token": token_actual.token, "convocatoria": convocatoria},
    }).done(function (data) {

        switch (data) {
            case 'error':
                notify("danger", "ok", "Convocatorias:", "Se registro un error, comuníquese con la mesa de ayuda convocatorias@scrd.gov.co");
                break;
            case 'error_metodo':
                notify("danger", "ok", "Se registro un error en el método, comuníquese con la mesa de ayuda convocatorias@scrd.gov.co");
                break;
            case 'error_token':
                notify("danger", "ok", "Convocatorias:", "Por favor actualizar la página, debido a que su sesión caduco");
                break;
            case 'acceso_denegado':
                notify("danger", "remove", "Usuario:", "No tiene permisos acceder a la información.");
                break;
            default:
                var json = JSON.parse(data);
                if (json != null && json.length > 0) {

                    //Cargos el select de areasconocimientos
                    $('#select_categorias').show();
                    $('#categorias').find('option').remove();
                    $("#categorias").append('<option value="">:: Seleccionar ::</option>');
                    $.each(json, function (key, array) {
                        $("#categorias").append('<option value="' + array.id + '" >' + array.nombre + '</option>');
                    });
                }
                else
                {
                    //Se agrega para ocultar el select cuando no existe categorias de una convocatoria
                    $('#select_categorias').hide();
                    $('#categorias').find('option').remove();
                }   

                break;
        }

    }
    );
}

function cargar_select_perfiles(token_actual, convocatoria) {

    $.ajax({
        type: 'POST',
        data: {"token": token_actual.token, "convocatoria": convocatoria, "tipo_participante": 6, modulo: "SICON-CONVOCATORIAS-CONFIGURACION"},
        url: url_pv + 'Convocatoriasparticipantes/select'
    }).done(function (data) {
        if (data == 'error_metodo')
        {
            notify("danger", "ok", "Usuarios:", "Se registro un error en el método, comuníquese con la mesa de ayuda convocatorias@scrd.gov.co");
        } else
        {
            if (data == 'error_token')
            {
                notify("danger", "ok", "Convocatorias:", "Por favor actualizar la página, debido a que su sesión caducó");
            } else
            {
                var json = JSON.parse(data);

                if (json != null && json.perfiles_mentores.length > 0) {

                    //Cargos el select de areasconocimientos
                    $('#select_perfiles').show();
                    $('#abrir_filtros').show();
                    $('#perfiles').find('option').remove();

                    //se carga información de perfiles
                    $("#perfiles").append('<option value="">:: Seleccionar ::</option>');
                    $.each(json.perfiles_mentores, function (key, perfil_mentor) {
                        $("#perfiles").append('<option value="' + perfil_mentor.id + '" >' + perfil_mentor.descripcion_perfil + '</option>');
                    });


                    $("#div_areas").html("");
                    var htmlAreas = "";
                    aAreas = new Array();                    
                    if (json.areas_experticia.length > 0) {
                        $.each(json.areas_experticia, function (key, array) {
                            htmlAreas += '<div id="div_area_' + array.id + '" class="div_checkbox_filtrable"><input id="area_' + array.id + '" type="checkbox" name="a_areas[]" value="' + array.id + '" ' + array.checked + ' title="' + array.nombre + '" />' + array.nombre + "</div>";
                            aAreas.push(array);
                        });
                        $("#div_areas").html(htmlAreas);
                    }

                    $('#filtro_area').on('change keyup', function () {
                        for (var i=0; i<aAreas.length; i++) {
                            var area = aAreas[i];
                            if (incluye(area.nombre,$(this).val())) {
                                $("#div_area_" + area.id).show();
                            }
                            else {
                                $("#div_area_" + area.id).hide();
                            }
                        }
                    });

                    $('#quitar_filtro').on('click', function () {
                        $('#filtro_area').val('').change();
                    });
            
                    $('#filtrar_seleccionadas').on('click', function () {
                        for (var i=0; i<aAreas.length; i++) {
                            var area = aAreas[i];
                            if ($("#area_" + area.id).is(":checked")) {
                                $("#div_area_" + area.id).show();
                            }
                            else {
                                $("#div_area_" + area.id).hide();
                            }
                        }
                    });

                    //Valido el tipo de perfil seleccionado para el mentor
                    $("#formacion_postgrado_mentor").on('change', function () {
                    if ($(this).val() == "true")
                        {
                            $('#nivel_educativo_mentor').find('option').remove();
                                if (json.niveles_educativos.length > 0) {
                                    $.each(json.niveles_educativos, function (key, nivel_educativo) {
                                        if(nivel_educativo.id > 6){
                                            $("#nivel_educativo_mentor").append('<option value="' + nivel_educativo.nombre + '" >' + nivel_educativo.nombre + '</option>');
                                        }
                                    });
                                }
                        } else
                        {
                            $('#nivel_educativo_mentor').find('option').remove();
                        }
                    });

                    //Verifico si es local
                    let localidades_db = json.localidades;
                    let selectLocalidad = $('#localidad_mentor');
                    
                    function fillLocalidad() {
                        selectLocalidad.find('option').remove();
                        if ($('#reside_localidad').val() == "true") {
                            selectLocalidad.removeAttr("disabled").append('<option value="">:: Seleccionar ::</option>');
                            $.each(localidades_db, function(key, localidad){
                                selectLocalidad.append('<option value="'+localidad.id+'" >'+localidad.nombre+'</option>');
                            });
                        } else {
                            selectLocalidad.attr("disabled", "disabled");
                        }
                    }
                    
                    $('#reside_localidad').on('change', function () {
                        fillLocalidad();
                    });

                    




                }
                else
                {
                    //Se agrega para ocultar el select cuando no existe categorias de una convocatoria
                    $('#select_perfiles').hide();
                    $('#perfiles').find('option').remove();
                }   
            }
        }
    });

    
}

var aAreas = new Array();

function incluye(t1, t2) {
    var t1normalizada = t1.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
    var t2normalizada = t2.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

    return (t1normalizada.includes(t2normalizada));
}

function cargar_tabla(token_actual) {

    //se obtienen los datos guardados del perfil

    //var data = ($('#filtro').val() == 'true' ? $("#formulario_busqueda_banco").serializeArray() : null)

    $('#table_list').DataTable({
        "language": {
            "url": "../../dist/libraries/datatables/js/spanish.json"
        },
        "processing": true,
        "destroy": true,
        "serverSide": true,
        "lengthMenu": [20, 30, 40],
        "responsive": true,
        "searching": false,
        "order": [[4, "desc"]],
        "ajax": {
            type: 'POST',
            url: url_pv + "Mentorespreseleccion/buscar_perfil",
            data:
                    {"token": token_actual.token,
                        "convocatoria": $('#convocatorias').val(),
                        "convocatoriaperfil_id": $('#perfiles').val()
                    },

            error: function (xhr, error, code) {
                if(xhr.responseText=='error_token'){
                    notify("danger", "ok", "Convocatorias:", "Por favor actualizar la página, debido a que su sesión caduco");
                }
                else
                {
                    if(xhr.responseText=='seleccionar_convocatoria'){
                        notify("danger", "ok", "Convocatorias:", "Debe seleccionar la convocatoria");
                    }
                    else
                    {
                        notify("danger", "ok", "Convocatorias:", "Se registro un error, comuníquese con la mesa de ayuda convocatorias@scrd.gov.co");
                    }                                                            
                }
            }
            

        },
        "drawCallback": function (settings) {
            acciones_registro(token_actual);
        },
        "rowCallback": function (row, data, index) {

            if (data["aplica_perfil"]) {
                $('td', row).css('background-color', '#dcf4dc');
            } else if (!data["aplica_perfil"]) {
                $('td', row).css('background-color', '#f4dcdc');
            }

        },
        "columns": [
            {"data": "Tipo documento",
                render: function (data, type, row) {
                    return row.tipo_documento;
                },
            },
            {"data": "Número documento",
                render: function (data, type, row) {
                    return row.numero_documento;
                },
            },
            {"data": "Nombres",
                render: function (data, type, row) {
                    return row.nombres;
                },
            },
            {"data": "Apellidos",
                render: function (data, type, row) {
                    return row.apellidos;
                },
            },
            {"data": "aciones",
                render: function (data, type, row) {
                    if (row.id_postulacion === null || row.id_postulacion === undefined) {
                        return  '<button id="' + row.id_postulacion + '" title="Ver Hoja de Vida " type="button" class="btn btn-primary btn_cargar_hoja_vida" data-toggle="modal" data-target="#ver_hoja_de_vida" id-participante="' + row.id + '" id-participante-propuesta="' + row.propuesta + '">'
                                + '<span class="glyphicon glyphicon-search"></span></button><br/>'+
                                '<button id="' + row.id_postulacion + '" title="Seleccionar la hoja de vida" type="button" class="btn btn-success btn_postular" id-participante="' + row.id + '">'
                                + '<span class="glyphicon glyphicon-log-in"></span></button><br/>';
                    } else {
                        return '<button id="' + row.id_postulacion + '" title="Evaluar la hoja de vida " type="button" class="btn btn-primary btn_cargar" data-toggle="modal" data-target="#evaluar" id-participante="' + row.id + '">'
                                + '<span class="glyphicon glyphicon-check"></span></button>';
                    }
                },
            }
        ]
    });
}

function cargar_tabla_filtro(token_actual) {

    //se obtienen los datos que están en el formulario

    //var areas = $('input[name="a_areas[]"]:checked');
    var areas_id = [];

    for (var i=0; i<aAreas.length; i++) {
        var area = aAreas[i];
        if ($("#area_" + area.id).is(":checked")) {
            areas_id.push(area.nombre);
        }
    }


    $('#table_list').DataTable({
        "language": {
            "url": "../../dist/libraries/datatables/js/spanish.json"
        },
        "processing": true,
        "destroy": true,
        "serverSide": true,
        "lengthMenu": [20, 30, 40],
        "responsive": true,
        "searching": false,
        "order": [[4, "desc"]],
        "ajax": {
            type: 'POST',
            url: url_pv + "Mentorespreseleccion/buscar_perfil_filtro",
            data:
                    {"token": token_actual.token,
                        "convocatoria": $('#convocatorias').val(),
                        "tipo_perfil":$('#formacion_profesional_mentor').val(), 
                        "areas_experticia":areas_id,
                        "formacion_posgrado":$('#formacion_postgrado_mentor').val(),
                        "nivel_formación":$('#nivel_educativo_mentor').val(),
                        "experiencia_docente":$('#experiencia_docente').val(),
                        "grupo_etnico":$('#grupo_etnico').val(),
                        "reside_bogota":$('#reside_bogota_mentor').val(),
                        "localidad":$('#localidad_mentor').val(),
                        "palabra_clave_filtro":$('#palabra_clave_filtro').val()
                    },

            
            error: function (xhr, error, code) {
                if(xhr.responseText=='error_token'){
                    notify("danger", "ok", "Convocatorias:", "Por favor actualizar la página, debido a que su sesión caduco");
                }
                else
                {
                    if(xhr.responseText=='seleccionar_convocatoria'){
                        notify("danger", "ok", "Convocatorias:", "Debe seleccionar la convocatoria");
                    }
                    else
                    {
                        notify("danger", "ok", "Convocatorias:", "Se registro un error, comuníquese con la mesa de ayuda convocatorias@scrd.gov.co");
                    }                                                            
                }
            }
            

        },
        "drawCallback": function (settings) {
            acciones_registro(token_actual);
        },
        "rowCallback": function (row, data, index) {

            if (data["aplica_perfil"]) {
                $('td', row).css('background-color', '#dcf4dc');
            } else if (!data["aplica_perfil"]) {
                $('td', row).css('background-color', '#f4dcdc');
            }

        },
        "columns": [
            {"data": "Tipo documento",
                render: function (data, type, row) {
                    return row.tipo_documento;
                },
            },
            {"data": "Número documento",
                render: function (data, type, row) {
                    return row.numero_documento;
                },
            },
            {"data": "Nombres",
                render: function (data, type, row) {
                    return row.nombres;
                },
            },
            {"data": "Apellidos",
                render: function (data, type, row) {
                    return row.apellidos;
                },
            },
            {"data": "aciones",
                render: function (data, type, row) {
                    if (row.id_postulacion === null || row.id_postulacion === undefined) {
                        return  '<button id="' + row.id_postulacion + '" title="Ver Hoja de Vida " type="button" class="btn btn-primary btn_cargar_hoja_vida" data-toggle="modal" data-target="#ver_hoja_de_vida" id-participante="' + row.id + '" id-participante-propuesta="' + row.propuesta + '">'
                                + '<span class="glyphicon glyphicon-search"></span></button><br/>'+
                                '<button id="' + row.id_postulacion + '" title="Seleccionar la hoja de vida" type="button" class="btn btn-success btn_postular" id-participante="' + row.id + '">'
                                + '<span class="glyphicon glyphicon-log-in"></span></button><br/>';
                    } else {
                        return '<button id="' + row.id_postulacion + '" title="Evaluar la hoja de vida " type="button" class="btn btn-primary btn_cargar" data-toggle="modal" data-target="#evaluar" id-participante="' + row.id + '">'
                                + '<span class="glyphicon glyphicon-check"></span></button>';
                    }
                },
            }
        ]
    });
}

function acciones_registro(token_actual) {

    $("#evaluar").trigger("reset");
    $(".btn_cargar").click(function () {

        $("#id_perfil_selecionado").val($(this).attr("id"));
        $("#id_participante_sel").val($(this).attr("id-participante"));
        $("#id_jurados_postulados").val(null);
        $("#ver_hoja_vida").val("0");

        cargar_select_categorias_2(token_actual);
        cargar_datos_basicos(token_actual, $(this).attr("id"), $(this).attr("id-participante"));
        cargar_tabla_documentos(token_actual, $(this).attr("id"), $(this).attr("id-participante"));
        cargar_tabla_educacion_formal(token_actual, $(this).attr("id"), $(this).attr("id-participante"));
        cargar_tabla_educacion_no_formal(token_actual, $(this).attr("id"), $(this).attr("id-participante"));
        cargar_tabla_experiencia(token_actual, $(this).attr("id"), $(this).attr("id-participante"));
        cargar_tabla_experiencia_jurado(token_actual, $(this).attr("id"), $(this).attr("id-participante"));
        cargar_tabla_reconocimiento(token_actual, $(this).attr("id"), $(this).attr("id-participante"));
        cargar_tabla_publicaciones(token_actual, $(this).attr("id"), $(this).attr("id-participante"));
        cargar_criterios_evaluacion(token_actual, $(this).attr("id"), $(this).attr("id-participante"));
        cargar_inhabilidades(token_actual, $(this).attr("id"), $(this).attr("id-participante"));
        // cargar_datos_convocatoria(token_actual,  $(this).attr("id"),  $(this).attr("id-participante"));

    });
    
    
    $(".btn_cargar_hoja_vida").click(function () {

        $("#id_perfil_selecionado").val($(this).attr("id"));
        $("#id_participante_sel").val($(this).attr("id-participante"));
        $("#id_jurados_postulados").val(null);
        $("#ver_hoja_vida").val($(this).attr("id-participante-propuesta"));
        
        cargar_datos_basicos(token_actual, $(this).attr("id"), $(this).attr("id-participante"));

        cargar_inhabilidades(token_actual, $(this).attr("id"), $(this).attr("id-participante"));

        cargar_tabla_documentos(token_actual, $(this).attr("id"), $(this).attr("id-participante"));
        cargar_tabla_educacion_formal(token_actual, $(this).attr("id"), $(this).attr("id-participante"));
        cargar_tabla_educacion_no_formal(token_actual, $(this).attr("id"), $(this).attr("id-participante"));
        cargar_tabla_experiencia(token_actual, $(this).attr("id"), $(this).attr("id-participante"));
        cargar_tabla_experiencia_jurado(token_actual, $(this).attr("id"), $(this).attr("id-participante"));
        cargar_tabla_reconocimiento(token_actual, $(this).attr("id"), $(this).attr("id-participante"));
        cargar_tabla_publicaciones(token_actual, $(this).attr("id"), $(this).attr("id-participante"));        

    });    
    
    $(".btn_postular").click(function () {
        postular(token_actual, $(this).attr("id"), $(this).attr("id-participante"),$(this));        
    });

}

//carga información básica del participante seleccionado
function cargar_datos_basicos(token_actual, postulacion, participante) {
    $("#perfiles_jurados").html("");
    //consulto si tengo propuesta cargada

    // cargo los datos
    $.ajax({
        type: 'POST',
        url: url_pv + 'Mentorespreseleccion/search_info_basica_jurado',
        data: {"token": token_actual.token, "idc": $('#convocatorias').val(), "postulacion": postulacion, "participante": participante,"ver_hoja_vida":$("#ver_hoja_vida").val()},
    }).done(function (data) {

        switch (data) {
            case 'error':
                notify("danger", "ok", "Convocatorias:", "Se registro un error, comuníquese con la mesa de ayuda convocatorias@scrd.gov.co");
                break;
            case 'error_metodo':
                notify("danger", "ok", "Se registro un error en el método, comuníquese con la mesa de ayuda convocatorias@scrd.gov.co");
                break;
            case 'error_token':
                notify("danger", "ok", "Convocatorias:", "Por favor actualizar la página, debido a que su sesión caduco");
                break;
            case 'acceso_denegado':
                notify("danger", "remove", "Usuario:", "No tiene permisos para editar información.");
                break;
            case 'deshabilitado':
                notify("danger", "remove", "Usuario:", "No tiene permisos para editar información.");
                cargar_datos_formulario(token_actual);
                break;
            default:

                var json = JSON.parse(data);
                if (json.participante) {

                    $('#modalidad_participa_jurado,#modalidad_participa_jurado_2').html(json.modalidad_participa_jurado);

                    if(json.modalidad_participa_jurado == 'Experto sin título universitario'){
                        $('.educacion_formal').hide();
                        $('.educacion_no_formal').show();
                    }else{
                        $('.educacion_no_formal').hide();
                        $('.educacion_formal').show();
                    }

                    $('#tipo_documento,#tipo_documento_2').html(json.participante.tipo_documento);
                    $('#numero_documento,#numero_documento_2').html(json.participante.numero_documento);
                    $('#nombres,#nombres_2').html(json.participante.primer_nombre + ' ' + json.participante.segundo_nombre);
                    $('#apellidos,#apellidos_2').html(json.participante.primer_apellido + ' ' + json.participante.segundo_apellido);
                    $('#fecha_nacimiento,#fecha_nacimiento_2').html(json.participante.fecha_nacimiento);
                    $('#sexo,#sexo_2').html(json.participante.sexo);
                    $('#orientacion_sexual,#orientacion_sexual_2').html(json.participante.orientacion_sexual);
                    $('#identidad_genero,identidad_genero_2').html(json.participante.identidad_genero);
                    $('#ciudad,#ciudad_2').html(json.participante.ciudad_residencia);
                    $('#barrio,#barrio_2').html(json.participante.barrio_residencia);
                    $('#localidad,#localidad_2').html(json.participante.localidad_residencia);
                    $('#direccion_residencia,#direccion_residencia_2').html(json.participante.direccion_residencia);
                    $('#correo_electronico,#correo_electronico_2').html(json.participante.correo_electronico);
                    $('#numero_telefono,#numero_telefono_2').html(json.participante.numero_celular);
                    $('#pertenencia_etnica_2').html(json.participante.grupo_etnico);
                    $('#perfil,#perfil_2').html(json.perfil);
                    $('#nombres2,#nombres2_2').html(json.participante.primer_nombre + ' ' + json.participante.segundo_nombre);
                    $('#apellidos2,#apellidos2_2').html(json.participante.primer_apellido + ' ' + json.participante.segundo_apellido);
                    $('#propuesta_resumen,#propuesta_resumen_2').html(json.propuesta_resumen);
                    $('#propuesta_resumen_perfil,#propuesta_resumen_perfil_2').html(json.propuesta_resumen);
                    if (json.postulacion_perfil) {

                        $("#perfiles_jurados").append('<div class="row">'
                                + ' <div class="col-lg-12">'
                                + '  <h5><b>Descripción:</h5></b> ' + json.postulacion_perfil.descripcion_perfil
                                + ' </div>'
                                + ' <div class="col-lg-6">'
                                + ' <h5><b>Formación profesional:</h5></b> ' +
                                (json.postulacion_perfil.formacion_profesional ? 'Si' : 'No')
                                + ' </div>'
                                + ' <div class="col-lg-6">'
                                + ' <h5><b>Formación de postgrado:</h5></b> ' +
                                (json.postulacion_perfil.formacion_postgrado ? 'Si' : 'No')
                                + ' </div>'
                                + ' <div class="col-lg-6">'
                                + '  <h5><b>Nivel educativo:</h5></b> ' +
                                ((json.postulacion_perfil.nivel_educativo == 'null') ? 'N/D' : json.postulacion_perfil.nivel_educativo)
                                + ' </div>'
                                + ' <div class="col-lg-6">'
                                + ' <h5><b>Área de conocimiento:</h5></b> ' +
                                ((json.postulacion_perfil.area_conocimiento == 'null') ? 'N/D' : json.postulacion_perfil.area_conocimiento)
                                + ' </div>'
                                + ' <div class="col-lg-6">'
                                + '  <h5><b>Campo de experiencia:</h5></b>' + json.postulacion_perfil.campo_experiencia
                                + ' </div>'
                                + ' <div class="col-lg-6">'
                                + '  <h5><b>Área del perfíl:</h5></b> ' +
                                ((json.postulacion_perfil.area_perfil == 'null') ? 'N/D' : json.postulacion_perfil.area_perfil)
                                + ' </div>'
                                + ' <div class="col-lg-6">'
                                + '  <h5><b>Reside en Bogotá:</h5></b> ' +
                                (json.postulacion_perfil.reside_bogota ? 'Si' : 'No')
                                + ' </div>'

                                + ' </div>');
                    }


                } else {


                }

                break;
        }

    }

    );
}

//carga información de la educacion formal
function cargar_tabla_documentos(token_actual, postulacion, participante) {
//Cargar datos en la tabla documentos
    $('#table_documentos,#table_documentos_2').DataTable({
        "language": {
            "url": "../../dist/libraries/datatables/js/spanish.json"
        },
        "processing": true,
        "destroy": true,
        "serverSide": true,
        "lengthMenu": [10, 15, 20],
        "responsive": true,
        "searching": false,
        "ajax": {
            type: 'POST',
            url: url_pv + "Mentorespreseleccion/all_documento",
            data: {"token": token_actual.token, "idc": $('#convocatorias').val(), "postulacion": postulacion, "participante": participante,"ver_hoja_vida":$("#ver_hoja_vida").val()},
            //async: false
        },
        "drawCallback": function (settings) {
            //$(".check_activar_t").attr("checked", "true");
            //$(".check_activar_f").removeAttr("checked");
            acciones_registro_documento(token_actual);
        },
        "columns": [

            {"data": "Documento",
                render: function (data, type, row) {
                    return row.categoria_jurado;
                },
            },
            {"data": "aciones",
                render: function (data, type, row) {
                    return '<button id="' + row.file + '" title="' + (row.file == null ? "No se ha cargado archivo" : "Descargar archivo") + '" type="button" class="btn btn-primary download_file_documento">'
                            + (row.file == null ? '<span class="glyphicon glyphicon-ban-circle" title="No se ha cargado archivo"></span>' : '<span class="glyphicon glyphicon-download-alt"></span>')
                            + '</button>';
                },
            }

        ]
    });
}

//Permite realizar acciones despues de cargar la tabla educacion formal
function acciones_registro_documento(token_actual) {

//descargar archivo
    $(".download_file_documento").click(function () {
//Cargo el id file
        var cod = $(this).attr('id');
        $.AjaxDownloader({
            type: 'POST',
            url: url_pv + 'PropuestasJurados/download_file_preseleccion/',
            data: {
                cod: cod,
                token: token_actual.token
            }
        });
    });
}


//carga información de la educacion formal
function cargar_tabla_educacion_formal(token_actual, postulacion, participante) {
//Cargar datos en la tabla actual
    $('#table_educacion_formal,#table_educacion_formal_2').DataTable({
        "language": {
            "url": "../../dist/libraries/datatables/js/spanish.json"
        },
        "processing": true,
        "destroy": true,
        "serverSide": true,
        "lengthMenu": [10, 15, 20],
        "responsive": true,
        "searching": false,
        "ajax": {
            type: 'POST',
            url: url_pv + "Mentorespreseleccion/all_educacion_formal",
            data: {"token": token_actual.token, "idc": $('#convocatorias').val(), "postulacion": postulacion, "participante": participante,"ver_hoja_vida":$("#ver_hoja_vida").val()},
            //async: false
        },
        "drawCallback": function (settings) {
            //$(".check_activar_t").attr("checked", "true");
            //$(".check_activar_f").removeAttr("checked");
            acciones_registro_educacion_formal(token_actual);
        },
        "rowCallback": function (row, data, index) {

            $('#contenidox,#contenidox_2').html(" <div class='row'><div class='col-lg-6'>"
                    + "    <h5><b>Titulo: </b><div id='titulo'>" + data["titulo"] + " </div></h5>"
                    + "  </div>"
                    + "  <div class='col-lg-6'>"
                    + "    <h5><b>Institución: </b><div id='institucion'>" + data["institucion"] + " </div></h5>"
                    + "  </div>"
                    + "  <div class='col-lg-6'>"
                    + "    <h5><b>Ciudad: </b><div id='ciudad'>" + data["ciudad"] + " </div></h5>"
                    + "  </div>"
                    + "  <div class='col-lg-6'>"
                    + "    <h5><b>Número de semestres: </b><div id='numero_semestres'>" + data["numero_semestres"] + " </div></h5>"
                    + "  </div>"
                    + "  <div class='col-lg-6'>"
                    + "    <h5><b>Graduado: </b><div id='graduado'>" + ((data["graduado"]) ? "Si" : "No") + " </div></h5>"
                    + "  </div>"
                    + "  <div class='col-lg-6'>"
                    + "    <h5><b>Fecha de graduación: </b><div id='fecha_graduacion'>" + data["fecha_graduacion"] + " </div></h5>"
                    + "  </div>"
                    + "</div>");
        },
        "columns": [
            {"data": "Nivel",
                render: function (data, type, row) {
                    return row.nivel_educacion;
                },
            },
            {"data": "Titulo",
                render: function (data, type, row) {
                    return row.titulo;
                },
            },
            {"data": "Institución educativa",
                render: function (data, type, row) {
                    return row.institucion;
                },
            },
            {"data": "Graduado",
                render: function (data, type, row) {
                    return (row.graduado == true ? 'Si' : 'No');
                },
            },
            {"data": "aciones",
                render: function (data, type, row) {
                    return '<button  id="' + row.id + '" title="Ver mas información" type="button" class="btn btn-success btn_cargar_educacion_formal"  >'
                            + '<span class="glyphicon glyphicon-eye-open "></span></button>'
                            + '<button id="' + row.file + '" title="' + (row.file == null ? "No se ha cargado archivo" : "Descargar archivo") + '" type="button" class="btn btn-primary download_file_educacion_formal">'
                            + (row.file == null ? '<span class="glyphicon glyphicon-ban-circle" title="No se ha cargado archivo"></span>' : '<span class="glyphicon glyphicon-download-alt"></span>')
                            + '</button>';
                },
            }



        ]
    });
}

//Permite realizar acciones despues de cargar la tabla educacion formal
function acciones_registro_educacion_formal(token_actual) {

//Permite realizar la carga respectiva de cada registro
    $(".btn_cargar_educacion_formal").click(function (data) {

        $('#vermas,#vermas_2').show();
        $('#table_eformal,#table_eformal_2').hide();
    });
    $("#vermas_back,#vermas_back_2").click(function () {
        $('#vermas,#vermas_2').hide();
        $('#table_eformal,#table_eformal_2').show();
    });
    //descargar archivo
    $(".download_file_educacion_formal").click(function () {
//Cargo el id file
        var cod = $(this).attr('id');
        $.AjaxDownloader({
            type: 'POST',
            url: url_pv + 'PropuestasJurados/download_file_preseleccion/',
            data: {
                cod: cod,
                token: token_actual.token
            }
        });
    });
}

//carga información de la educacion no formal
function cargar_tabla_educacion_no_formal(token_actual, postulacion, participante) {
//Cargar datos en la tabla actual
    $('#table_educacion_no_formal,#table_educacion_no_formal_2').DataTable({
        "language": {
            "url": "../../dist/libraries/datatables/js/spanish.json"
        },
        "processing": true,
        "destroy": true,
        "serverSide": true,
        "lengthMenu": [10, 15, 20],
        "responsive": true,
        "searching": false,
        "ajax": {
            type: 'POST',
            url: url_pv + "Mentorespreseleccion/all_educacion_no_formal",
            data: {"token": token_actual.token, "idc": $('#convocatorias').val(), "postulacion": postulacion, "participante": participante,"ver_hoja_vida":$("#ver_hoja_vida").val()},
            //  async: false
        },
        "drawCallback": function (settings) {
            //$(".check_activar_t").attr("checked", "true");
            //$(".check_activar_f").removeAttr("checked");
            acciones_registro_educacion_no_formal(token_actual);
        },
        "rowCallback": function (row, data, index) {

            $('#contenido_enf,#contenido_enf_2').html(" <div class='row'><div class='col-lg-6'>"
                    + "    <h5><b>Tipo: </b><div id='tipo'>" + data["tipo"] + " </div></h5>"
                    + "  </div>"
                    + "  <div class='col-lg-6'>"
                    + "    <h5><b>Modalidad: </b><div id='modalidad'>" + data["modalidad"] + " </div></h5>"
                    + "  </div>"
                    + "  <div class='col-lg-6'>"
                    + "    <h5><b>Nombre: </b><div id='nombre'>" + data["nombre"] + " </div></h5>"
                    + "  </div>"
                    + "  <div class='col-lg-6'>"
                    + "    <h5><b>Institución: </b><div id='institucion'>" + data["institucion"] + " </div></h5>"
                    + "  </div>"
                    + "  <div class='col-lg-6'>"
                    + "    <h5><b>Fecha de inicio: </b><div id='fecha_inicio'>" + data["fecha_inicio"] + " </div></h5>"
                    + "  </div>"
                    + "  <div class='col-lg-6'>"
                    + "    <h5><b>Fecha de finalización: </b><div id='fecha_fin'>" + data["fecha_fin"] + " </div></h5>"
                    + "  </div>"
                    + "  <div class='col-lg-6'>"
                    + "    <h5><b>Número de horas: </b><div id='numero_hora'>" + data["numero_hora"] + " </div></h5>"
                    + "  </div>"
                    + "  <div class='col-lg-6'>"
                    + "    <h5><b>Ciudad: </b><div id='ciudad'>" + data["ciudad"] + " </div></h5>"
                    + "  </div>"
                    + "</div>");
        },
        "columns": [
            {"data": "Tipo",
                render: function (data, type, row) {
                    return row.tipo;
                },
            },
            {"data": "Modalidad",
                render: function (data, type, row) {
                    return row.modalidad;
                },
            },
            {"data": "Noḿbre",
                render: function (data, type, row) {
                    return row.nombre;
                },
            },
            {"data": "Institución",
                render: function (data, type, row) {
                    return row.institucion;
                },
            },
            {"data": "Fecha de Inicio",
                render: function (data, type, row) {
                    return row.fecha_inicio;
                },
            },
            {"data": "Fecha de Terminación",
                render: function (data, type, row) {
                    return row.fecha_fin;
                },
            },
            {"data": "Número de Horas",
                render: function (data, type, row) {
                    return row.numero_hora;
                },
            },
            {"data": "Ciudad",
                render: function (data, type, row) {
                    return row.ciudad;
                },
            },
            {"data": "aciones",
                render: function (data, type, row) {
                    return '<button  id="' + row.id + '" title="Ver mas información"  type="button" class="btn btn-success btn_cargar_educacion_no_formal" >'
                            + '<span class="glyphicon glyphicon-eye-open"></span></button>'
                            + '<button id="' + row.file + '" title="' + (row.file == null ? "No se ha cargado archivo" : "Descargar archivo") + '" type="button" class="btn btn-primary download_file_educacion_no_formal">'
                            + (row.file == null ? '<span class="glyphicon glyphicon-ban-circle" title="No se ha cargado archivo"></span>' : '<span class="glyphicon glyphicon-download-alt"></span>')
                            + '</button>';
                },
            }



        ]
    });
}

//Permite realizar acciones despues de cargar la tabla educacion no formal
function acciones_registro_educacion_no_formal(token_actual) {

//Permite realizar la carga respectiva de cada registro----
    $(".btn_cargar_educacion_no_formal").click(function () {
        $('#vermas_enf,#vermas_enf_2').show();
        $('#table_enformal,#table_enformal_2').hide();
    });
    $("#vermas_back_enf,#vermas_back_enf_2").click(function () {
        $('#vermas_enf,#vermas_enf_2').hide();
        $('#table_enformal,#table_enformal_2').show();
    });
    //descargar archivo
    $(".download_file_educacion_no_formal").click(function () {
//Cargo el id file
        var cod = $(this).attr('id');
        $.AjaxDownloader({
            type: 'POST',
            url: url_pv + 'PropuestasJurados/download_file_preseleccion/',
            data: {
                cod: cod,
                token: token_actual.token
            }
        });
    });
}

function calcularTotalAniosExperiencia() {
    var totalAnios = 0;
    $('#table_experiencia, #table_experiencia_2').DataTable().rows().every(function (index, element) {
        var rowData = this.data();
        var aniosExperiencia = 0;
        if (rowData.fecha_fin) {
            aniosExperiencia = ((((new Date(rowData.fecha_fin)) - (new Date(rowData.fecha_inicio))) / (60 * 60 * 24 * 1000)) / 365);
        } else {
            aniosExperiencia = ((((new Date()) - (new Date(rowData.fecha_inicio))) / (60 * 60 * 24 * 1000)) / 365);
        }
        totalAnios += aniosExperiencia;
        console.log(aniosExperiencia);
    });
    $('#total_anios_experiencia').text("Total de años de experiencia: " + totalAnios.toFixed(2));
}

//carga información de la experiencia disciplinar
function cargar_tabla_experiencia(token_actual, postulacion, participante) {
//Cargar datos en la tabla actual
    $('#table_experiencia,#table_experiencia_2').DataTable({
        "language": {
            "url": "../../dist/libraries/datatables/js/spanish.json"
        },
        "processing": true,
        "destroy": true,
        "serverSide": true,
        "lengthMenu": [10, 15, 20],
        "responsive": true,
        "searching": false,
        "ajax": {
            type: 'POST',
            url: url_pv + "Mentorespreseleccion/all_experiencia_laboral",
            data: {"token": token_actual.token, "idc": $('#convocatorias').val(), "postulacion": postulacion, "participante": participante,"ver_hoja_vida":$("#ver_hoja_vida").val()},
            async: false
        },
        "drawCallback": function (settings) {
            //$(".check_activar_t").attr("checked", "true");
            //$(".check_activar_f").removeAttr("checked");
            acciones_registro_experiencia(token_actual);
            calcularTotalAniosExperiencia();
        },
        "rowCallback": function (row, data, index) {
            $('#contenido_experiencia,#contenido_experiencia_2').html(" <div class='row'><div class='col-lg-6'>"
                    + "    <h5><b>Ciudad: </b><div id='titulo'>" + data["ciudad"] + " </div></h5>"
                    + "  </div>"
                    + "  <div class='col-lg-6'>"
                    + "    <h5><b>Tipo de entidad: </b><div id='tipo_entidad'>" + data["tipo_entidad"] + "</div></h5>"
                    + "  </div>"
                    + "  <div class='col-lg-6'>"
                    + "    <h5><b>Entidad: </b><div id='entidad'>" + data["entidad"] + "</div></h5>"
                    + "  </div>"
                    + "  <div class='col-lg-6'>"
                    + "    <h5><b>Funciones: </b><div id='funcion'>" + data["funcion"] + "</div></h5>"
                    + "  </div>"
                    + "  <div class='col-lg-6'>"
                    + "    <h5><b>Fecha de inicio: </b><div id='fecha_inicio'>" + data["fecha_inicio"] + "</div></h5>"
                    + "  </div>"
                    + "  <div class='col-lg-6'>"
                    + "    <h5><b>Fecha de finalización: </b><div id='fecha_fin'>" + data["fecha_fin"] + "</div></h5>"
                    + "  </div>"
                    + "  <div class='col-lg-6'>"
                    + "    <h5><b>Nombre: </b><div id='nombre'>" + data["nombre"] + "</div></h5>"
                    + "  </div>"
                    + "  <div class='col-lg-6'>"
                    + "    <h5><b>correo: </b><div id='correo'>" + data["correo"] + "</div></h5>"
                    + "  </div>"
                    + "  <div class='col-lg-6'>"
                    + "    <h5><b>Teléfono: </b><div id='telefono'>" + data["telefono"] + "</div></h5>"
                    + "  </div>"
                    + "  <div class='col-lg-6'>"
                    + "    <h5><b>Dirección: </b><div id='direccion'>" + data["direccion"] + "</div></h5>"
                    + "  </div>"
                    + "</div>");
        },
        "columns": [
            {"data": "Ciudad",
                render: function (data, type, row) {
                    return row.ciudad;
                },
            },
            {"data": "Tipo Entidad",
                render: function (data, type, row) {
                    return row.tipo_entidad;
                },
            },
            {"data": "Entidad",
                render: function (data, type, row) {
                    return row.entidad;
                },
            },
            {"data": "Línea",
                render: function (data, type, row) {
                    return row.linea;
                },
            },
            {"data": "Fecha de Inicio",
                render: function (data, type, row) {
                    return row.fecha_inicio;
                },
            },
            {"data": "Fecha de Terminación",
                render: function (data, type, row) {
                    return row.fecha_fin;
                },
            },
            {"data": "Meses de Experiencia",
                render: function (data, type, row) {
                    if(row.fecha_fin){
                        return  ((((new Date(row.fecha_fin)) - (new Date(row.fecha_inicio))) / (60 * 60 * 24 * 1000)) / 30).toFixed(1);
                    }else{
                        return  ((((new Date()) - (new Date(row.fecha_inicio))) / (60 * 60 * 24 * 1000)) / 30).toFixed(1);
                    }
                },
            },
            {"data": "aciones",
                render: function (data, type, row) {
                    return '<button  id="' + row.id + '" title="Ver mas información" type="button" class="btn btn-success btn_cargar_experiencia" >'
                            + '<span class="glyphicon glyphicon-eye-open"></span></button>'
                            + '<button  id="' + row.file + '" title="' + (row.file == null ? "No se ha cargado archivo" : "Descargar archivo") + '" type="button" class="btn btn-primary download_file_experiencia">'
                            + (row.file == null ? '<span class="glyphicon glyphicon-ban-circle" title="No se ha cargado archivo"></span>' : '<span class="glyphicon glyphicon-download-alt"></span>')
                            + '</button>';
                },
            }

        ]
    });
}

//Permite realizar acciones despues de cargar la tabla experiencia disciplina
function acciones_registro_experiencia(token_actual) {

//Permite realizar la carga respectiva de cada registro
    $(".btn_cargar_experiencia").click(function () {
        $('#vermas_experiencia,#vermas_experiencia_2').show();
        $('#row_experiencia,#row_experiencia_2').hide();
    });
    $("#vermas_back_experiencia,#vermas_back_experiencia_2").click(function () {
        $('#vermas_experiencia,#vermas_experiencia_2').hide();
        $('#row_experiencia,#row_experiencia_2').show();
    });
    //descargar archivo
    $(".download_file_experiencia").click(function () {
//Cargo el id file
        var cod = $(this).attr('id');
        $.AjaxDownloader({
            type: 'POST',
            url: url_pv + 'PropuestasJurados/download_file_preseleccion/',
            data: {
                cod: cod,
                token: token_actual.token
            }
        });
    });
}

//carga información de la experiencia como jurado
function cargar_tabla_experiencia_jurado(token_actual, postulacion, participante) {

//Cargar datos en la tabla actual
    $('#table_experiencia_jurado,#table_experiencia_jurado_2').DataTable({
        "language": {
            "url": "../../dist/libraries/datatables/js/spanish.json"
        },
        "processing": true,
        "destroy": true,
        "serverSide": true,
        "lengthMenu": [10, 15, 20],
        "responsive": true,
        "searching": false,
        "ajax": {
            type: 'POST',
            url: url_pv + "Mentorespreseleccion/all_experiencia_jurado",
            data: {"token": token_actual.token, "idc": $('#convocatorias').val(), "postulacion": postulacion, "participante": participante,"ver_hoja_vida":$("#ver_hoja_vida").val()},
            async: false
        },
        "drawCallback": function (settings) {
            //$(".check_activar_t").attr("checked", "true");
            //$(".check_activar_f").removeAttr("checked");
            acciones_registro_experiencia_jurado(token_actual);
        },
        "rowCallback": function (row, data, index) {
            $('#contenido_experiencia_jurado,#contenido_experiencia_jurado_2').html(" <div class='row'><div class='col-lg-6'>"
                    + "    <h5><b>Nombre: </b><div id='nombre'>" + data["nombre"] + " </div></h5>"
                    + "  </div>"
                    + "  <div class='col-lg-6'>"
                    + "    <h5><b>Entidad: </b><div id='entidad'>" + data["entidad"] + " </div></h5>"
                    + "  </div>"
                    + "  <div class='col-lg-6'>"
                    + "    <h5><b>Año: </b><div id='anio'>" + data["anio"] + " </div></h5>"
                    + "  </div>"
                    + "  <div class='col-lg-6'>"
                    + "    <h5><b>Ambito: </b><div id='ambito'>" + data["ambito"] + " </div></h5>"
                    + "  </div>"
                    + "  <div class='col-lg-6'>"
                    + "    <h5><b>Ciudad: </b><div id='ciudad'>" + data["ciudad"] + " </div></h5>"
                    + "  </div>"
                    + "</div>");
        },
        "columns": [

            {"data": "Nombre convocatoria",
                render: function (data, type, row) {
                    return row.nombre;
                },
            },
            {"data": "Entidad",
                render: function (data, type, row) {
                    return row.entidad;
                },
            },
            {"data": "Año",
                render: function (data, type, row) {
                    return row.anio;
                },
            },
            {"data": "Ambito",
                render: function (data, type, row) {
                    return row.ambito;
                },
            },
            {"data": "Ciudad",
                render: function (data, type, row) {
                    return row.ciudad;
                },
            },
            {"data": "aciones",
                render: function (data, type, row) {
                    return '<button  id="' + row.id + '" title="Ver mas información" type="button" class="btn btn-success btn_cargar_experiencia_jurado" >'
                            + '<span class="glyphicon glyphicon-eye-open"></span></button>'
                            + '<button  id="' + row.file + '" title="' + (row.file == null ? "No se ha cargado archivo" : "Descargar archivo") + '"  type="button" class="btn btn-primary download_file_experiencia_jurado">'
                            + (row.file == null ? '<span class="glyphicon glyphicon-ban-circle" title="No se ha cargado archivo"></span>' : '<span class="glyphicon glyphicon-download-alt"></span>')
                            + '</button>';
                },
            }

        ]
    });
}

//Permite realizar acciones despues de cargar la tabla experiencia disciplina
function acciones_registro_experiencia_jurado(token_actual) {

//Permite realizar la carga respectiva de cada registro
    $(".btn_cargar_experiencia_jurado").click(function () {
        $('#vermas_experiencia_jurado,#vermas_experiencia_jurado_2').show();
        $('#row_experiencia_jurado,#row_experiencia_jurado_2').hide();
    });
    $("#vermas_back_experiencia_jurado,#vermas_back_experiencia_jurado_2").click(function () {
        $('#vermas_experiencia_jurado,#vermas_experiencia_jurado_2').hide();
        $('#row_experiencia_jurado,#row_experiencia_jurado_2').show();
    });
    //descargar archivo
    $(".download_file_experiencia_jurado").click(function () {
//Cargo el id file
        var cod = $(this).attr('id');
        $.AjaxDownloader({
            type: 'POST',
            url: url_pv + 'PropuestasJurados/download_file_preseleccion/',
            data: {
                cod: cod,
                token: token_actual.token
            }
        });
    });
}

//carga información de la experiencia como jurado
function cargar_tabla_reconocimiento(token_actual, postulacion, participante) {

//Cargar datos en la tabla actual
    $('#table_reconocimiento,#table_reconocimiento_2').DataTable({
        "language": {
            "url": "../../dist/libraries/datatables/js/spanish.json"
        },
        "processing": true,
        "destroy": true,
        "serverSide": true,
        "lengthMenu": [10, 15, 20],
        "responsive": true,
        "searching": false,
        "ajax": {
            type: 'POST',
            url: url_pv + "Mentorespreseleccion/all_reconocimiento",
            data: {"token": token_actual.token, "idc": $('#convocatorias').val(), "postulacion": postulacion, "participante": participante,"ver_hoja_vida":$("#ver_hoja_vida").val()},
            async: false
        },
        "drawCallback": function (settings) {
            //$(".check_activar_t").attr("checked", "true");
            //$(".check_activar_f").removeAttr("checked");
            acciones_registro_reconocimiento(token_actual);
        },
        "rowCallback": function (row, data, index) {
            $('#contenido_reconocimiento,#contenido_reconocimiento_2').html(" <div class='row'><div class='col-lg-6'>"
                    + "    <h5><b>Nombre: </b><div id='nombre'>" + data["nombre"] + " </div></h5>"
                    + "  </div>"
                    + "  <div class='col-lg-6'>"
                    + "    <h5><b>Institucion: </b><div id='institucion'>" + data["institucion"] + " </div></h5>"
                    + "  </div>"
                    + "  <div class='col-lg-6'>"
                    + "    <h5><b>Tipo: </b><div id='tipo'>" + data["tipo"] + " </div></h5>"
                    + "  </div>"
                    + "  <div class='col-lg-6'>"
                    + "    <h5><b>Año: </b><div id='anio'>" + data["anio"] + " </div></h5>"
                    + "  </div>"
                    + "  <div class='col-lg-6'>"
                    + "    <h5><b>Ciudad: </b><div id='ciudad'>" + data["ciudad"] + " </div></h5>"
                    + "  </div>"
                    + "</div>");
        },
        "columns": [

            {"data": "Nombre",
                render: function (data, type, row) {
                    return row.nombre;
                },
            },
            {"data": "Institución",
                render: function (data, type, row) {
                    return row.institucion;
                },
            },
            {"data": "Tipo",
                render: function (data, type, row) {
                    return row.tipo;
                },
            },
            {"data": "Año",
                render: function (data, type, row) {
                    return row.anio;
                },
            },
            {"data": "Ciudad",
                render: function (data, type, row) {
                    return row.ciudad;
                },
            },
            {"data": "aciones",
                render: function (data, type, row) {
                    return '<button id="' + row.id + '" title="Ver mas información" type="button" class="btn btn-success btn_cargar_reconocimiento" >'
                            + '<span class="glyphicon glyphicon-eye-open"></span></button>'
                            + '<button id="' + row.file + '" title="' + (row.file == null ? "No se ha cargado archivo" : "Descargar archivo") + '" type="button" class="btn btn-primary download_file_reconocimiento">'
                            + (row.file == null ? '<span class="glyphicon glyphicon-ban-circle" title="No se ha cargado archivo"></span>' : '<span class="glyphicon glyphicon-download-alt"></span>')
                            + '</button>';
                },
            }

        ]
    });
}

//Permite realizar acciones despues de cargar la tabla experiencia disciplina
function acciones_registro_reconocimiento(token_actual) {

//Permite realizar la carga respectiva de cada registro
    $(".btn_cargar_reconocimiento").click(function () {

        $('#vermas_reconocimiento,#vermas_reconocimiento_2').show();
        $('#row_reconocimiento,#row_reconocimiento_2').hide();
    });
    $("#vermas_back_reconocimiento,#vermas_back_reconocimiento_2").click(function () {
        $('#vermas_reconocimiento,#vermas_reconocimiento_2').hide();
        $('#row_reconocimiento,#row_reconocimiento_2').show();
    });
    //descargar archivo
    $(".download_file_reconocimiento").click(function () {
//Cargo el id file
        var cod = $(this).attr('id');
        $.AjaxDownloader({
            type: 'POST',
            url: url_pv + 'PropuestasJurados/download_file_preseleccion/',
            data: {
                cod: cod,
                token: token_actual.token
            }
        });
    });
}

//carga información de la experiencia como jurado
function cargar_tabla_publicaciones(token_actual, postulacion, participante) {
//Cargar datos en la tabla actual
    $('#table_publicaciones,#table_publicaciones_2').DataTable({
        "language": {
            "url": "../../dist/libraries/datatables/js/spanish.json"
        },
        "processing": true,
        "destroy": true,
        "serverSide": true,
        "lengthMenu": [10, 15, 20],
        "responsive": true,
        "searching": false,
        "ajax": {
            type: 'POST',
            url: url_pv + "Mentorespreseleccion/all_publicacion",
            data: {"token": token_actual.token, "idc": $('#convocatorias').val(), "postulacion": postulacion, "participante": participante,"ver_hoja_vida":$("#ver_hoja_vida").val()},
            async: false
        },
        "drawCallback": function (settings) {
            //$(".check_activar_t").attr("checked", "true");
            //$(".check_activar_f").removeAttr("checked");
            acciones_registro_publicaciones(token_actual);
        },
        "rowCallback": function (row, data, index) {
            $('#contenido_publicaciones,#contenido_publicaciones_2').html(" <div class='row'><div class='col-lg-6'>"
                    + "    <h5><b>Titulo: </b><div id='titulo'>" + data["titulo"] + " </div></h5>"
                    + "  </div>"
                    + "  <div class='col-lg-6'>"
                    + "    <h5><b>Tema: </b><div id='tema'>" + data["tema"] + " </div></h5>"
                    + "  </div>"
                    + "  <div class='col-lg-6'>"
                    + "    <h5><b>Tipo: </b><div id='tipo'>" + data["tipo"] + " </div></h5>"
                    + "  </div>"
                    + "  <div class='col-lg-6'>"
                    + "    <h5><b>Formato: </b><div id='formato'>" + data["formato"] + " </div></h5>"
                    + "  </div>"
                    + "  <div class='col-lg-6'>"
                    + "    <h5><b>Medio: </b><div id='medio'>" + data["medio"] + " </div></h5>"
                    + "  </div>"
                    + "  <div class='col-lg-6'>"
                    + "    <h5><b>Ciudad: </b><div id='ciudad'>" + data["ciudad"] + " </div></h5>"
                    + "  </div>"
                    + "  <div class='col-lg-6'>"
                    + "    <h5><b>Año: </b><div id='anio'>" + data["anio"] + " </div></h5>"
                    + "  </div>"
                    + "</div>");
        },
        "columns": [

            {"data": "titulo",
                render: function (data, type, row) {
                    return row.titulo;
                },
            },
            {"data": "Tema",
                render: function (data, type, row) {
                    return row.tema;
                },
            },
            {"data": "Tipo",
                render: function (data, type, row) {
                    return row.tipo;
                },
            },
            {"data": "Ciudad",
                render: function (data, type, row) {
                    return row.ciudad;
                },
            },
            {"data": "aciones",
                render: function (data, type, row) {
                    return '<button  id="' + row.id + '" title="Ver mas información" type="button" class="btn btn-success btn_cargar_publicaciones" >'
                            + '<span class="glyphicon glyphicon-eye-open"></span></button>'
                            + '<button  id="' + row.file + '" title="' + (row.file == null ? "No se ha cargado archivo" : "Descargar archivo") + '" type="button" class="btn btn-primary download_file_publicaciones">'
                            + (row.file == null ? '<span class="glyphicon glyphicon-ban-circle" title="No se ha cargado archivo"></span>' : '<span class="glyphicon glyphicon-download-alt"></span>')
                            + '</button>';
                },
            }

        ]
    });
}

//Permite realizar acciones despues de cargar la tabla experiencia disciplina
function acciones_registro_publicaciones(token_actual) {

//Permite realizar la carga respectiva de cada registro
    $(".btn_cargar_publicaciones").click(function () {
        $('#vermas_publicaciones,#vermas_publicaciones_2').show();
        $('#row_publicaciones,#row_publicaciones_2').hide();
        /*  $("#idregistro").val( $(this).attr("title") );
         // cargo los datos
         cargar_datos_formulario(token_actual);*/
    });
    $("#vermas_back_publicaciones,#vermas_back_publicaciones_2").click(function () {
        $('#vermas_publicaciones,#vermas_publicaciones_2').hide();
        $('#row_publicaciones,#row_publicaciones_2').show();
    });
    //descargar archivo
    $(".download_file_publicaciones").click(function () {
//Cargo el id file
        var cod = $(this).attr('id');
        $.AjaxDownloader({
            type: 'POST',
            url: url_pv + 'PropuestasJurados/download_file_preseleccion/',
            data: {
                cod: cod,
                token: token_actual.token
            }
        });
    });
}

//carga información de los criterios de evaluacion de las rondas
function cargar_criterios_evaluacion(token_actual, postulacion, participante) {
    $("#form_criterios").empty();
    $("#form_criterios").hide();
    $("input[name=option_aplica_perfil][value=true]").removeAttr('checked');
    $("input[name=option_aplica_perfil][value=false]").removeAttr('checked');
    $(".guardar_aplica_perfil").removeClass("disabled");
    $("#form_aplica_perfil").trigger("reset");
    //Cargar datos en la tabla actual
    $.ajax({
        type: 'POST',
        url: url_pv + 'Mentorespreseleccion/criterios_evaluacion',
        data: "&modulo=Jurados&token=" + token_actual.token
                + "&idc=" + $('#convocatorias').val()
                + "&postulacion=" + postulacion
                + "&participante=" + participante
    }).done(function (data) {

        switch (data) {
            case 'Si':
                notify("info", "ok", "Convocatorias:", "Se activó el registro con éxito.");
                break;
            case 'No':
                notify("info", "ok", "Convocatorias:", "Se desactivó el registro con éxito.");
                break;
            case 'error':
                notify("danger", "ok", "Convocatorias:", "Se registro un error, comuníquese con la mesa de ayuda convocatorias@scrd.gov.co");
                break;
            case 'error_token':
                notify("danger", "ok", "Convocatorias:", "Por favor actualizar la página, debido a que su sesión caduco");
                break;
            case 'acceso_denegado':
                notify("danger", "remove", "Usuario:", "No tiene permisos para editar información.");
                break;
            case 'deshabilitado':
                notify("danger", "remove", "Usuario:", "No tiene permisos para editar información.");
                //cargar_datos_formulario(token_actual);
                break;
            default:
                //cargar_datos_formulario(token_actual);
                var json = JSON.parse(data);
                //Por cada ronda
                $.each(json, function (r, ronda) {

                    $("#id_ronda").val(json[r].ronda.id);
                    //Se establece los valores de la evaluación del perfil
                    //alert(typeof json[r].perfil.aplica_perfil);

                    $("input[name=option_aplica_perfil][value=true]").removeAttr('checked');
                    $("input[name=option_aplica_perfil][value=false]").removeAttr('checked');
                    if (json[r].postulacion) {

//                        alert(json[r].postulacion.aplica_perfil);

                        if (json[r].postulacion.aplica_perfil !== null && json[r].postulacion.aplica_perfil) {
                            $(".guardar_aplica_perfil").addClass("disabled");
                            $("#fieldset_aplica_perfil").attr("disabled", "");
                            $("input[name=option_aplica_perfil][value=true]").attr('checked', 'checked');
                            $("#form_criterios").show();
                        } else if (json[r].postulacion.aplica_perfil !== null && (!json[r].postulacion.aplica_perfil)) {
                            $(".guardar_aplica_perfil").addClass("disabled");
                            $("#fieldset_aplica_perfil").attr("disabled", "");
                            $("input[name=option_aplica_perfil][value=false]").attr('checked', 'checked');
                        }

                        /*
                         * 27-04-2020
                         * Wilmer Gustavo Mogollón Duque
                         * Verificando disable - enabled de formulario se agrega el siguiente if que permite habilitar el formulario form_aplica_perfil
                         */


                        if (json[r].postulacion.aplica_perfil === null) {
                            $("#form_aplica_perfil").removeClass("disabled");
                            $(".guardar_aplica_perfil").removeClass("disabled");
                            $("#fieldset_aplica_perfil").removeAttr("disabled", "");
                        }



                        $("#descripcion_evaluacion").val(json[r].postulacion.descripcion_evaluacion);
                        $("#id_jurados_postulados").val(json[r].postulacion.id);
                        //grupo
                        $("#form_criterios").append('<fieldset class="criterios" ' + (json[r].postulacion.estado >= 12 ? ' disabled="" ' : '') + '>');
                    }

                    //categoria criterio
                    $.each(json[r].criterios, function (key, array) {
                        //console.log("key-->"+key);
                        //console.log("arraysss-->"+Object.keys(array));

                        $(".criterios").append('<div class="row">'
                                + ' <div class="col-lg-12"> <h5><b>' + Object.keys(array) + '</b><div id="perfil2"> </div></h5></div>'
                                + '</div>');
                        //criterio
                        $.each(array[Object.keys(array)], function (k, a) {

                            //  key.push(a.id);
                            //console.log("-->>"+a.id);
                            //  console.log("min"+a.puntaje_minimo+'-max'+a.puntaje_maximo);

                            //se construye las opciones del componente select
                            select = '<select id="' + a.id + '" name="' + a.id + '" class="form-control ' + r + key + '"'
                                    + (a.exclusivo ? ' onchange=" limpiar( this, ' + r + key + ' ) "' : "")
                                    + ' >'
                                    + '<option value="null">::Sin calificar::</option>';
                            for (i = a.puntaje_minimo; i <= a.puntaje_maximo; i++) {
                                select = select + '<option ' + ((a.evaluacion.puntaje == i) ? 'selected' : '') + ' value=' + i + ' >' + i + '</option>';
                            }

                            select = select + '</select>';
                            //Se construye los radio
                            $(".criterios").append('<div class="row">'
                                    // +' <div class="col-lg-12"> <h5><b>'+key+'</b><div id="perfil2"> sssssss</div></h5></div>'
                                    + ' <div class="col-lg-6" >'
                                    /*  + ( a.exclusivo ?
                                     '  <input type="radio" name="optionsRadios'+a.grupo_criterio+'" id="optionsRadios1" value="option1"> '
                                     : "checkbox" )*/
                                    + a.descripcion_criterio //+" - "+a.exclusivo
                                    + ' </div>'
                                    + ' <div class="col-lg-6">'
                                    + '  <div class="form-group">'
                                    + select
                                    + '  </div>'
                                    + ' </div>'
                                    + '</div>');
                            //append

                        }); //fin foreach criterio

                    }); //fin foreach categoria criterio

                    $(".criterios").append('<div class="col-lg-12" style="text-align: right">'
                            + '<button type="button" class="btn btn-default ' + ((json[r].postulacion.estado >= 12) ? "disabled" : ' guardar_evaluacion_' + $("#id_ronda").val()) + '">Guardar</button>'
                            + '<button type="button" class="btn btn-default ' + ((json[r].postulacion.estado >= 12) ? "disabled" : ' confirmar_evaluacion_' + $("#id_ronda").val()) + '">Confirmar evaluación</button></div>'
                            );
                }); //fin foreach ronda

                $(".guardar_evaluacion_" + $("#id_ronda").val()).click(function () {
                    evaluar_criterios(token_actual, postulacion, participante);
                });
                $(".confirmar_evaluacion_" + $("#id_ronda").val()).click(function () {
                    $('#alertModal').modal('show');
                    //  confirmar_evaluacion(token_actual, postulacion, participante);
                });
                break;
        }

    });
}

//Restablece los componentes select cuyo grupo de criterios sean exclusivos
function limpiar(criterio, key) {
//console.log(" limpiar()");

    $("." + key).each(function (c, v) {

        if ($("." + key)[c].id != criterio.id) {
//console.log(" id-->"+$("."+key)[c].value);
            $("." + key)[c].selectedIndex = 0;
        }

    });
}

//Guarda la evaluación del perfil del jurado
function evaluar_perfil(token_actual, postulacion, participante) {

//  alert("guardando\nparticipante:"+participante);

    $.ajax({
        type: 'PUT',
        url: url_pv + 'Mentorespreseleccion/evaluar_perfil',
        data: $("#form_aplica_perfil").serialize()
                + "&modulo=SICON-JURADOS-PRESELECCION&token=" + token_actual.token
                + "&idc=" + $('#convocatorias').val()
                + "&categoria=" + $('#categorias').val()
                + "&postulacion=" + postulacion
                + "&participante=" + participante
    }).done(function (data) {


        switch (data) {
            case 'error':
                notify("danger", "ok", "Convocatorias:", "Se registro un error, comuníquese con la mesa de ayuda convocatorias@scrd.gov.co");
                break;
            case 'error_metodo':
                notify("danger", "ok", "Se registro un error en el método, comuníquese con la mesa de ayuda convocatorias@scrd.gov.co");
                break;
            case 'error_token':
                notify("danger", "ok", "Convocatorias:", "Por favor actualizar la página, debido a que su sesión caduco");
                break;
            case 'acceso_denegado':
                notify("danger", "remove", "Usuario:", "No tiene permisos para editar información.");
                break;
            case 'deshabilitado':
                notify("danger", "remove", "Usuario:", "No tiene permisos para editar información.");
                //cargar_datos_formulario(token_actual);
                break;
            case 'error_duplicado':
                notify("danger", "remove", "Usuario:", "Ya existe un usuario registrado con el mismo documento de identificación.");
                //cargar_datos_formulario(token_actual);
                break;
            default:
                notify("success", "ok", "Convocatorias:", "Se actualizó el registro con éxito.");
                $(".guardar_aplica_perfil").addClass("disabled");
                $("#fieldset_aplica_perfil").attr("disabled", "");
                cargar_tabla(token_actual);
                if (document.getElementById('optionsRadiosInline1').checked) {

                    $("#form_criterios").show();
                } else {

                    $("#form_criterios").hide();
                }

                break;
        }

    });
}

//Guarda la evaluación de los criterios evaluados
function evaluar_criterios(token_actual, postulacion, participante) {

//alert("guardando\nparticipante:"+participante);

    $.ajax({
        type: 'POST',
        url: url_pv + 'Mentorespreseleccion/evaluar_criterios',
        data: $("#form_criterios").serialize()
                + "&modulo=SICON-JURADOS-PRESELECCION&token=" + token_actual.token
                + "&idc=" + $('#convocatorias').val()
                + "&postulacion=" + postulacion
                + "&participante=" + participante
                + "&ronda=" + $("#id_ronda").val()
    }).done(function (data) {


        switch (data) {
            case 'error':
                notify("danger", "ok", "Convocatorias:", "Se registro un error, comuníquese con la mesa de ayuda convocatorias@scrd.gov.co");
                break;
            case 'error_metodo':
                notify("danger", "ok", "Se registro un error en el método, comuníquese con la mesa de ayuda convocatorias@scrd.gov.co");
                break;
            case 'error_token':
                notify("danger", "ok", "Convocatorias:", "Por favor actualizar la página, debido a que su sesión caduco");
                break;
            case 'acceso_denegado':
                notify("danger", "remove", "Usuario:", "No tiene permisos para editar información.");
                break;
            case 'deshabilitado':
                notify("danger", "remove", "Usuario:", "No tiene permisos para editar información.");
                break;
            case 'error_duplicado':
                notify("danger", "remove", "Usuario:", "Ya existe un usuario registrado con el mismo documento de identificación.");
                break;
            default:
                notify("success", "ok", "Convocatorias:", "Se actualizó el registro con éxito.");
                //$(".criterios").attr('disabled','');
                cargar_tabla(token_actual);
                break;
        }

    });
}

//Guarda la evaluación de los criterios evaluados
function confirmar_evaluacion(token_actual, postulacion, participante) {

    $.ajax({
        type: 'POST',
        url: url_pv + 'Mentorespreseleccion/confirmar_evaluacion',
        data: $("#form_criterios").serialize()
                + "&modulo=SICON-JURADOS-PRESELECCION&token=" + token_actual.token
                + "&idc=" + $('#convocatorias').val()
                + "&postulacion=" + postulacion
                + "&participante=" + participante
                + "&ronda=" + $("#id_ronda").val()
    }).done(function (data) {

        switch (data) {
            case 'error':
                notify("danger", "ok", "Convocatorias:", "Se registro un error, comuníquese con la mesa de ayuda soporte.convocatorias@scrd.gov.co");
                break;
            case 'error_metodo':
                notify("danger", "ok", "Se registro un error en el método, comuníquese con la mesa de ayuda soporte.convocatorias@scrd.gov.co");
                break;
            case 'error_token':
                notify("danger", "ok", "Convocatorias:", "Por favor actualizar la página, debido a que su sesión caduco");
                break;
            case 'acceso_denegado':
                notify("danger", "remove", "Usuario:", "No tiene permisos para editar información.");
                break;
            case 'deshabilitado':
                notify("danger", "remove", "Usuario:", "No tiene permisos para editar información.");
                break;
            case 'error_duplicado':
                notify("danger", "remove", "Usuario:", "Ya existe un usuario registrado con el mismo documento de identificación.");
                break;
            default:
                notify("success", "ok", "Convocatorias:", "Se actualizó el registro con éxito.");
                $(".criterios").attr('disabled', '');
                cargar_tabla(token_actual);
                break;
        }

    });
}


function cargar_select_categorias_2(token_actual) {

    $('#select_categorias_2').hide();
    $('#categorias_2').find('option').remove();
    $("#categorias_2").append('<option value="">:: Seleccionar ::</option>');
    $.ajax({
        type: 'POST',
        url: url_pv + 'Mentorespreseleccion/convocatoria',
        data: {"token": token_actual.token,
            "convocatoria": $('#convocatorias').val(),
            "idcat": $('#categorias').val()
        },
    }).done(function (data) {

        switch (data) {
            case 'error':
                notify("danger", "ok", "Convocatorias:", "Se registro un error, comuníquese con la mesa de ayuda convocatorias@scrd.gov.co");
                break;
            case 'error_metodo':
                notify("danger", "ok", "Se registro un error en el método, comuníquese con la mesa de ayuda convocatorias@scrd.gov.co");
                break;
            case 'error_token':
                notify("danger", "ok", "Convocatorias:", "Por favor actualizar la página, debido a que su sesión caduco");
                break;
            case 'acceso_denegado':
                notify("danger", "remove", "Usuario:", "No tiene permisos acceder a la información.");
                break;
            default:
                var json = JSON.parse(data);
                if (json != null) {

                    if (json.tiene_categorias) {

                        $.ajax({
                            type: 'POST',
                            url: url_pv + 'Mentorespreseleccion/select_categorias',
                            data: {"token": token_actual.token, "convocatoria": json.id},
                        }).done(function (data) {

                            switch (data) {
                                case 'error':
                                    notify("danger", "ok", "Convocatorias:", "Se registro un error, comuníquese con la mesa de ayuda convocatorias@scrd.gov.co");
                                    break;
                                case 'error_metodo':
                                    notify("danger", "ok", "Se registro un error en el método, comuníquese con la mesa de ayuda convocatorias@scrd.gov.co");
                                    break;
                                case 'error_token':
                                    notify("danger", "ok", "Convocatorias:", "Por favor actualizar la página, debido a que su sesión caduco");
                                    break;
                                case 'acceso_denegado':
                                    notify("danger", "remove", "Usuario:", "No tiene permisos acceder a la información.");
                                    break;
                                default:
                                    var json = JSON.parse(data);
                                    if (json != null && json.length > 0) {

//Cargos el select de areasconocimientos
                                        $.each(json, function (key, array) {
                                            $("#categorias_2").append('<option value="' + array.id + '" >' + array.nombre + '</option>');
                                        });
                                        $('#select_categorias_2').show();
                                        $("#panel_tabs").hide();
                                    } else {
                                        $("#panel_tabs").show();
                                    }



                                    break;
                            }

                        }
                        );
                    } else {
                        $("#panel_tabs").show();
                    }

                }

                break;
        }

    }
    );
}

function validator_form(token_actual) {
//  console.log("Validando");
    $('.formulario_busqueda_banco').bootstrapValidator({
        feedbackIcons: {
            valid: 'glyphicon glyphicon-ok',
            invalid: 'glyphicon glyphicon-remove',
            validating: 'glyphicon glyphicon-refresh'
        },
        excluded: ':disabled',
        fields: {
            banco_jurado: {
                validators: {
                    notEmpty: {message: 'La convocatoria de jurados es requerida'}
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
        //$form.bootstrapValidator('resetForm', true);

        //console.log("form-->" + $form.serialize());
        $('#resultado').focus();
        $('#filtro').val(true);
        cargar_tabla(token_actual);
        $("#idc").val($("#banco_jurado").val());
        $form.bootstrapValidator('disableSubmitButtons', false).bootstrapValidator('resetForm', true);
        bv.resetForm();
        $("#exampleModal").modal("toggle");
    });
}

//Selecciona el perfil para la convocatoria
function seleccionar_jurado(token_actual, postulacion, participante) {

    $.ajax({
        type: 'PUT',
        url: url_pv + 'Mentorespreseleccion/seleccionar_perfil',
        data: "&modulo=SICON-JURADOS-PRESELECCION&token=" + token_actual.token
                + "&idc=" + $('#convocatorias').val()
                + "&idcat=" + $('#categorias_2').val()
                + "&postulacion=" + postulacion
                + "&participante=" + participante
    }).done(function (data) {

        switch (data) {
            case 'error':
                notify("danger", "ok", "Convocatorias:", "Se registro un error, comuníquese con la mesa de ayuda convocatorias@scrd.gov.co");
                break;
            case 'error_metodo':
                notify("danger", "ok", "Se registro un error en el método, comuníquese con la mesa de ayuda convocatorias@scrd.gov.co");
                break;
            case 'error_token':
                notify("danger", "ok", "Convocatorias:", "Por favor actualizar la página, debido a que su sesión caduco");
                break;
            case 'acceso_denegado':
                notify("danger", "remove", "Usuario:", "No tiene permisos para editar información.");
                break;
            case 'deshabilitado':
                notify("danger", "remove", "Usuario:", "No tiene permisos para editar información.");
                //cargar_datos_formulario(token_actual);
                break;
            default:
                notify("success", "ok", "Convocatorias:", "Se actualizó el registro con éxito.");
                cargar_tabla(token_actual);
                break;
        }

    });
}

function postular(token_actual, postulacion, participante,btn_postular) {

    var idregistro = ($('#categorias').val() === null) ? $('#convocatorias').val() : $('#categorias').val();
    $.ajax({
        type: 'POST',
        url: url_pv + 'Mentorespreseleccion/new_postulacion',
        data: {
            "token": token_actual.token,
            "modulo": "SICON-JURADOS-PRESELECCION",
            "idc": $("#idc").val(), //id de la convocatoria de jurado
            "idregistro": idregistro,
            "participante": participante,
        },
    }).done(function (result) {

        switch (result) {
            case 'error':
                notify("danger", "ok", "Convocatorias:", "Se registró un error, comuníquese con la mesa de ayuda soporte.convocatorias@scrd.gov.co");
                break;
            case 'error_token':
                notify("danger", "ok", "Convocatorias:", "Por favor actualizar la página, debido a que su sesión caduco");
                break;
            case 'acceso_denegado':
                notify("danger", "remove", "Usuario:", "No tiene permisos para editar información.");
                break;
            case 'deshabilitado':
                notify("danger", "remove", "Usuario:", "No tiene permisos para editar información.");
                //cargar_tabla_p(token_actual);
                break;
            case 'error_metodo':
                notify("danger", "ok", "Convocatorias:", "Se registró un error, comuníquese con la mesa de ayuda soporte.convocatorias@scrd.gov.co");
                break;
            case 'error_limite':
                notify("danger", "remove", "Usuario:", "Se cumplió el máximo de postulaciones activas.");
                ///  cargar_tabla_p(token_actual);
                break;
            default:
                notify("success", "ok", "Convocatorias:", "Se postuló la hoja de vida con éxito.");
                btn_postular.css("display","none");
                //cargar_tabla(token_actual);
                break;
        }

    });
}



/*
 * 20-05-2020
 * Wilmer GUstavo Mogollón Duque
 * Se agrega función para listar nucleo básico del conocimiento según el área de conocimiento escogida
 */

function cargar_select_nucleobasico(token_actual, id_areasconocimientos, set_value) {


    $.ajax({
        type: 'POST',
        url: url_pv + 'PropuestasJurados/select_nucleobasico',
        data: {"token": token_actual.token, "id": id_areasconocimientos},
    }).done(function (data) {

        switch (data) {
            case 'error':
                notify("danger", "ok", "Convocatorias:", "Se registro un error, comuníquese con la mesa de ayuda convocatorias@scrd.gov.co");
                break;
            case 'error_metodo':
                notify("danger", "ok", "Se registro un error en el método, comuníquese con la mesa de ayuda convocatorias@scrd.gov.co");
                break;
            case 'error_token':
                notify("danger", "ok", "Convocatorias:", "Por favor actualizar la página, debido a que su sesión caduco");
                break;
            case 'acceso_denegado':
                notify("danger", "remove", "Usuario:", "No tiene permisos acceder a la información.");
                break;
            default:
                var json = JSON.parse(data);
                //Cargos el select de areasconocimientos
                $('#nucleo_basico').find('option').remove();
                $("#nucleo_basico").append('<option value="">:: Seleccionar ::</option>');
                if (json != null && json.length > 0) {
                    $.each(json, function (key, array) {
                        $("#nucleo_basico").append('<option value="' + array.id + '" >' + array.nombre + '</option>');
                    });
                }

                $("#nucleo_basico").val(set_value);
                break;
        }

    }
    );
}


/*
 * 20-08-2020
 * Wilmer Gustavo Mogollón Duque
 * Se agrega función cargar_inhabilidades
 */


function cargar_inhabilidades(token_actual, postulacion, participante) {

    // cargo los datos
    $.ajax({
        type: 'POST',
        url: url_pv + 'Mentorespreseleccion/search_info_inhabilidades',
        data: {"token": token_actual.token, "idc": $('#convocatorias').val(), "postulacion": postulacion, "participante": participante, "anio": $('#anio').val()},
    }).done(function (data) {

        switch (data) {
            case 'error':
                notify("danger", "ok", "Convocatorias:", "Se registro un error, comuníquese con la mesa de ayuda convocatorias@scrd.gov.co");
                break;
            case 'error_metodo':
                notify("danger", "ok", "Se registro un error en el método, comuníquese con la mesa de ayuda convocatorias@scrd.gov.co");
                break;
            case 'error_token':
                notify("danger", "ok", "Convocatorias:", "Por favor actualizar la página, debido a que su sesión caduco");
                break;
            case 'acceso_denegado':
                notify("danger", "remove", "Usuario:", "No tiene permisos para editar información.");
                break;
            case 'deshabilitado':
                notify("danger", "remove", "Usuario:", "No tiene permisos para editar información.");
                cargar_datos_formulario(token_actual);
                break;
            default:

                var json = JSON.parse(data);
                if (json.participante) {

                    $('#nombre_participante').html(json.participante.primer_nombre + ' ' + json.participante.segundo_nombre + ' ' + json.participante.primer_apellido + ' ' + json.participante.segundo_apellido);
                    $('#tipo_participante').html(json.participante.tipo);
                    $('#codigo_propuesta').html(json.propuesta_codigo);
                    $('#nombre_propuesta').html(json.propuesta_nombre);
                    $('#nombre_estado').html(json.propuesta_estado);
                    //Contratista

                    if (Object.keys(json.contratistas).length > 0)
                    {
                        $("#contratistas").css("display", "block");
                        var html_table = "";
                        $(".tr_contratistas").remove();
                        $.each(json.contratistas, function (key, contratista) {
                            var nombre_contratista = String(contratista);
                            html_table = html_table + '<tr class="tr_contratistas"><td>' + key + '</td><td>' + nombre_contratista.replace(",", "<br/>") + '</td></tr>';
                        });
                        $("#body_contratistas").append(html_table);
                    } else
                    {
                        $("#contratistas").css("display", "none");
                    }

                    //Jurados seleccionados

                    if (json.html_propuestas_jurados_seleccionados !== "")
                    {
                        $("#jurados_seleccionados").css("display", "block");
                        $(".tr_jurados_seleccionados").remove();
                        $("#body_jurados_seleccionados").append(json.html_propuestas_jurados_seleccionados);
                    } else
                    {
                        $("#jurados_seleccionados").css("display", "none");
                    }


                    //Jurados proceso

                    if (json.html_propuestas_jurados_proceso !== "")
                    {
                        $("#jurados_proceso").css("display", "block");
                        $(".tr_jurados_proceso").remove();
                        $("#body_jurados_proceso").append(json.html_propuestas_jurados_proceso);
                    } else
                    {
                        $("#jurados_proceso").css("display", "none");
                    }

                    //Personas naturales

                    if (json.html_propuestas !== "")
                    {
                        $("#propuestas_pn").css("display", "block");
                        $(".tr_propuestas").remove();
                        $("#body_propuestas_pn").append(json.html_propuestas);
                    } else
                    {
                        $("#propuestas_pn").css("display", "none");
                    }

                    if (json.html_propuestas_ganadoras !== "")
                    {
                        $("#propuestas_ganadoras_pn").css("display", "block");
                        $(".tr_propuestas_ganadoras").remove();
                        $("#body_propuestas_ganadoras_pn").append(json.html_propuestas_ganadoras);
                    } else
                    {
                        $("#propuestas_ganadoras_pn").css("display", "none");
                    }

//Jurados seleccionados años anteriores

                    if (json.html_ganadoras_anios_anteriores !== "")
                    {
                        $("#ganadoras_anios_anteriores").css("display", "block");
                        $(".tr_ganador_anio_anterior").remove();
                        $("#body_ganadoras_anios_anteriores").append(json.html_ganadoras_anios_anteriores);
                    } else
                    {
                        $("#ganadoras_anios_anteriores").css("display", "none");
                    }



                } else {


                }

                break;
        }

    }

    );

}

/*
 * 22-09-2021
 * Wilmer Gustavo Mogollón Duque
 * Se incorpora la función generar_acta_jurados_preseleccionados, para llamar al controlador que genera el acta de deliberación
 */


function generar_acta_jurados_preseleccionados(token_actual, id_convocatoria) {

    window.open(url_pv + "FormatosDoc/generar_acta_jurados_preseleccionados/convocatoria/" + id_convocatoria, "_blank");
}