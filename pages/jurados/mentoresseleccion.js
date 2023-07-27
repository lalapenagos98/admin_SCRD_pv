//Array del consumo con el back
keycloak.init(initOptions).then(function (authenticated) {
//Si no esta autenticado lo obliga a ingresar al keycloak

    $("#div_cambiar_rol").hide();


    if (authenticated === false)
    {
        keycloak.login();
    } else
    {
        //Guardamos el token en el local storage
        if (typeof keycloak === 'object') {

            var token_actual = JSON.parse(JSON.stringify(keycloak));
            //Verifica si el token actual tiene acceso de lectura
            permiso_lectura_keycloak(token_actual.token, "SICON-JURADOS-SELECCION");

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

            $('.convocatorias-search').select2();
            
            
            init(token_actual);
            //cargar_datos_formulario(token_actual);
            validator_form(token_actual);

            //carga select_convocatorias
            $('#anio').change(function () {
                cargar_select_convocatorias(token_actual, $('#anio').val(), $('#entidad').val());
                $('#select_categorias').hide();
                $('#convocatorias').val(null);
                $('#categorias').val(null);
                cargar_tabla(token_actual);
            });

            //carga select convocatorias
            $('#entidad').change(function () {
                cargar_select_convocatorias(token_actual, $('#anio').val(), $('#entidad').val());
                $('#select_categorias').hide();
                $('#convocatorias').val(null);
                $('#categorias').val(null);
                cargar_tabla(token_actual);
            });

            //carga el select categorias
            $('#convocatorias').change(function () {
                cargar_select_categorias(token_actual, $('#convocatorias').val());
                $('#categorias').val(null);
                cargar_tabla(token_actual);

                //cargo los perfiles
                cargar_select_perfiles(token_actual, $('#convocatorias').val());
            });

            $('#categorias').change(function () {

                cargar_tabla(token_actual);
            });

            //carga la tabla con los criterios de busqueda
            $('#buscar').click(function () {
                //  alert("buscando");
                $('#resultado').focus();
                cargar_tabla(token_actual);
            });


            $("#exampleModal").on('hide.bs.modal', function () {
                $('#filtro').val(null);
                $('#palabra_clave').val(null);
                $("#formulario_busqueda_banco").trigger("reset");
            });

            $("#evaluar").on('hide.bs.modal', function () {

            });

            $(".guardar_aplica_mentor").click(function () {

                var option_aplica_perfil;
                if (document.getElementById('optionsRadiosInline_cumple_perfil').checked) {
                    option_aplica_perfil = true;
                } else {
                    option_aplica_perfil = false;
                }

                guardar_aplica_mentor(token_actual, $("#id_jurados_postulados").val(), $(this), option_aplica_perfil, $("#descripcion_evaluacion").val());   

            });

            $("#alertModalSelbaceptar").click(function () {
                //  $("#alertModalSel").modal("hide");
                //seleccionar_jurado(token_actual,  $("#id_jurados_postulados").val(),   $("#id_participante_sel").val() );
                $('#select_categorias_2').hide();
                $('#categorias').val($('#categorias_2').val());
                $("#panel_tabs").show();

            });

            /*

            $("#optionsRadiosInline1").click(function () {

                $('#form_aplica_perfil').bootstrapValidator('enableFieldValidators', 'descripcion_evaluacion', false);
            });

            $("#optionsRadiosInline2").click(function () {

                if (this.checked) {
                    $('#form_aplica_perfil').bootstrapValidator('enableFieldValidators', 'descripcion_evaluacion', true);
                    $('#form_aplica_perfil').bootstrapValidator('validateField', 'descripcion_evaluacion');
                }

            });*/

            $("#notificar_aceptar").click(function () {

                notificar(token_actual, $("#id_jurado_postulado").val());
            });

            $("#notificarModal").on('hide.bs.modal', function () {
                //$('.form_notificar').bootstrapValidator('resetFormData', true);
                //$(".form_notificar").trigger("reset");
                //$('.form_notificar').data('bootstrapValidator').destroy()
                //console.log("estado...ssssll");
            });


            $(".cambiar_rol").click(function () {
                cambiar_rol_jurado(token_actual, $('#id_notificacion_cambio').val(), $('#cambio_rol_jurado_sel').val());
            });


        }
    }

}).catch(function () {
    location.href = url_pv_admin + 'error_keycloak.html';
});

function showContent() {
    element = document.getElementById("div_cambiar_rol");
    check = document.getElementById("cambio_rol");
    if (check.checked) {
        element.style.display = 'block';
    } else {
        element.style.display = 'none';
    }
}

function init(token_actual) {
    //Realizo la peticion para cargar el formulario
    $.ajax({
        type: 'POST',
        data: {"token": token_actual.token, "id": $("#id").attr('value')},
        url: url_pv + 'Mentoresseleccion/init/'
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
            default:

                var json = JSON.parse(data);

                //Carga el select de entidad
                $('#entidad').find('option').remove();
                $("#entidad").append('<option value="">:: Seleccionar ::</option>');
                if (json.entidades.length > 0) {
                    $.each(json.entidades, function (key, entidad) {
                        $("#entidad").append('<option value="' + entidad.id + '" >' + entidad.nombre + '</option>');
                    });
                }

                //Carga el select de años
                $('#anio').find('option').remove();
                $("#anio").append('<option value="">:: Seleccionar ::</option>');
                if (json.anios.length > 0) {
                    $.each(json.anios, function (key, value) {
                        $("#anio").append('<option value="' + value + '" >' + value + '</option>');
                    });
                }

                //Carga el select tipo jurado
                $('#select_tipo_jurado').find('option').remove();
                $("#select_tipo_jurado").append('<option value="">:: Seleccionar ::</option>');
                if (json.tipos_jurado.length > 0) {
                    $.each(json.tipos_jurado, function (key, tipo) {
                        $("#select_tipo_jurado").append('<option value="' + tipo.id + '" >' + tipo.nombre + '</option>');
                    });
                }



                break;
        }

    });



}

function cargar_select_convocatorias(token_actual, anio, entidad) {


    $.ajax({
        type: 'POST',
        url: url_pv + 'Mentoresseleccion/select_convocatorias',
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
                location.href = url_pv_admin + 'index.html?msg=Su sesión ha expirado, por favor vuelva a ingresar.&msg_tipo=danger';
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
                        $("#mensaje_convocatoria").html("Esta convocatoria esta configurada para que los <b>jurados sean los mismos en sus diferentes categorías</b>, recuerde que en este punto ya no es posible cambiar la configuración de la convocatoria");
                    }
                    else
                    {
                        $("#mensaje_convocatoria").html("Esta convocatoria esta configurada para que los <b>jurados NO sean los mismos en sus diferentes categorías</b>, recuerde que en este punto ya no es posible cambiar la configuración de la convocatoria");
                    }
                }
                
            }
        }
    });


    $.ajax({
        type: 'POST',
        url: url_pv + 'Mentoresseleccion/select_categorias',
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
                location.href = url_pv_admin + 'index.html?msg=Su sesión ha expirado, por favor vuelva a ingresar.&msg_tipo=danger';
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



                break;
        }

    }
    );
}

function cargar_tabla(token_actual) {
    //var data = JSON.stringify( $("#formulario_busqueda_banco").serializeArray() );
    //var data =  $("#formulario_busqueda_banco").serializeArray();
    var data = ($('#filtro').val() == 'true' ? $("#formulario_busqueda_banco").serializeArray() : null)

    console.log("perfil ---" + $('#perfiles').val());


    $('#table_list').DataTable({
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
            url: url_pv + "Mentoresseleccion/all_seleccionados",
            data:
                    {"token": token_actual.token,
                        "convocatoria": $('#convocatorias').val(),
                        "categoria": $('#categorias').val(),
                        "perfil": $('#perfiles').val(),
                        "filtros": data
                    },
            //async: false
        },
        "drawCallback": function (settings) {
            //$(".check_activar_t").attr("checked", "true");
            //$(".check_activar_f").removeAttr("checked");
            acciones_registro(token_actual);
            //validator_form(token_actual);

        },
        "rowCallback": function (row, data, index) {

        },
        "columns": [
            {"data": "Cod. de inscripción",
                render: function (data, type, row) {
                    return row.codigo_propuesta;
                },
            },

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
            {"data": "Puntaje",
                render: function (data, type, row) {
                    return row.puntaje;
                },
            },
            /**{"data": "Estado notificación",
                render: function (data, type, row) {
                    return row.estado_notificacion;
                },
            }, */
            {"data": "Acciones",
                render: function (data, type, row) {
                    return  '<button id="' + row.id_postulacion + '" title="Evaluar la hoja de vida " type="button" class="btn btn-primary btn_cargar" data-toggle="modal" data-target="#evaluar" id-participante="' + row.id + '">'
                            + '<span class="glyphicon glyphicon-check"></span></button>'
                            +'<button id="' + row.id_postulacion + '" title="Notificar" type="button" class="btn btn-primary btn_cargar_notificar" data-toggle="modal" data-target="#notificarModal" id-participante="' + row.id + '"  postulado= "' + row.postulado + '">'
                            + '<span class="fa fa-send-o"></span></button>'
                            //+ '<button id="' + row.notificacion + '" title="Declinar notificación" type="button" class="btn btn-danger btn_declinar"  id-participante="' + row.id + '" ' + (row.estado_notificacion == "Declinada" ? "disabled" : "") + '>'
                            //+ '<span class="fa fa-ban"></span></button>'
                            + '<button id="' + row.notificacion + '" title="Ver notificación" type="button" class="btn  btn-warning btn_cargar_notificacion" data-toggle="modal" data-target="#notificacionModal" id-participante="' + row.id + '">'
                            + '<span class="fa fa-file-text-o"></span></button>'
                            //+ '<button id="' + row.id_postulacion + '" title="Ver respuesta a notificación" type="button" class="btn  btn-info btn_carta" id-participante="' + row.id + '">'
                            //+ '<span class="fa fa-ticket"></span></button>';
                },
            }



        ]
    });

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

                    //se carga información de perfiles
                    //$("#perfiles").append('<option value="">:: Seleccionar ::</option>');
                    $.each(json.perfiles_mentores, function (key, perfil_mentor) {
                        $("#perfiles").append('<option value="' + perfil_mentor.id + '" >' + perfil_mentor.descripcion_perfil + '</option>');
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

/*
function cargar_select_categorias_2(token_actual) {

    $('#select_categorias_2').hide();
    $('#categorias_2').find('option').remove();
    $("#categorias_2").append('<option value="">:: Seleccionar ::</option>');
    $.ajax({
        type: 'POST',
        url: url_pv + 'Mentoresseleccion/convocatoria',
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
                            url: url_pv + 'Mentoresseleccion/select_categorias',
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

*/

//carga información básica del participante seleccionado
function cargar_datos_basicos(token_actual, postulacion, participante) {
    $("#perfiles_jurados").html("");
    
    // cargo los datos
    $.ajax({
        type: 'POST',
        url: url_pv + 'Mentoresseleccion/search_info_basica_jurado',
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
                        $('#nivel_academico').hide();
                        $('#educacion_no_formal').show();
                    }else{
                        $('#nivel_academico').show();
                        $('#educacion_no_formal').hide();
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
                url: url_pv + "Mentoresseleccion/all_documento",
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
                url: url_pv + "Mentoresseleccion/all_educacion_formal",
                data: {"token": token_actual.token, "idc": $('#convocatorias').val(), "postulacion": postulacion, "participante": participante,"ver_hoja_vida":$("#ver_hoja_vida").val()},
                //async: false
            },
            "drawCallback": function (settings) {
                //$(".check_activar_t").attr("checked", "true");
                //$(".check_activar_f").removeAttr("checked");
                acciones_registro_educacion_formal(token_actual);
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

function cargar_informacion_educacion_formal(token_actual, id_educacion_formal){

    $.ajax({
        type: 'POST',
        url: url_pv + 'Mentoresseleccion/educacion_formal',
        data: {"token": token_actual.token, "id_educacion_formal": id_educacion_formal}
    }).done(function (data) {

        var json = JSON.parse(data);

        $('#contenidox,#contenidox_2').html(" <div class='row'><div class='col-lg-6'>"
        + "    <h5><b>Titulo: </b><div id='titulo'>" + json.data.titulo + " </div></h5>"
        + "  </div>"
        + "  <div class='col-lg-6'>"
        + "    <h5><b>Institución: </b><div id='institucion'>" + json.data.institucion + " </div></h5>"
        + "  </div>"
        + "  <div class='col-lg-6'>"
        + "    <h5><b>Ciudad: </b><div id='ciudad'>" + json.data.ciudad + " </div></h5>"
        + "  </div>"
        + "  <div class='col-lg-6'>"
        + "    <h5><b>Número de semestres: </b><div id='numero_semestres'>" + json.data.numero_semestres + " </div></h5>"
        + "  </div>"
        + "  <div class='col-lg-6'>"
        + "    <h5><b>Graduado: </b><div id='graduado'>" + ((json.data.graduado) ? "Si" : "No") + " </div></h5>"
        + "  </div>"
        + "  <div class='col-lg-6'>"
        + "    <h5><b>Fecha de graduación: </b><div id='fecha_graduacion'>" + json.data.fecha_graduacion + " </div></h5>"
        + "  </div>"
        + "</div>");

    });

}

function cargar_informacion_educacion_no_formal(token_actual, id_educacion_no_formal){

    $.ajax({
        type: 'POST',
        url: url_pv + 'Mentoresseleccion/educacion_no_formal',
        data: {"token": token_actual.token, "id_educacion_no_formal": id_educacion_no_formal}
    }).done(function (data) {

        var json = JSON.parse(data);

        $('#contenido_enf,#contenido_enf_2').html(" <div class='row'><div class='col-lg-6'>"
        + "    <h5><b>Tipo: </b><div id='tipo'>" + json.data.tipo + " </div></h5>"
        + "  </div>"
        + "  <div class='col-lg-6'>"
        + "    <h5><b>Modalidad: </b><div id='modalidad'>" + json.data.modalidad + " </div></h5>"
        + "  </div>"
        + "  <div class='col-lg-6'>"
        + "    <h5><b>Nombre: </b><div id='nombre'>" + json.data.nombre + " </div></h5>"
        + "  </div>"
        + "  <div class='col-lg-6'>"
        + "    <h5><b>Institución: </b><div id='institucion'>" + json.data.institucion + " </div></h5>"
        + "  </div>"
        + "  <div class='col-lg-6'>"
        + "    <h5><b>Fecha de inicio: </b><div id='fecha_inicio'>" + json.data.fecha_inicio + " </div></h5>"
        + "  </div>"
        + "  <div class='col-lg-6'>"
        + "    <h5><b>Fecha de finalización: </b><div id='fecha_fin'>" + json.data.fecha_fin + " </div></h5>"
        + "  </div>"
        + "  <div class='col-lg-6'>"
        + "    <h5><b>Número de horas: </b><div id='numero_hora'>" + json.data.numero_hora + " </div></h5>"
        + "  </div>"
        + "  <div class='col-lg-6'>"
        + "    <h5><b>Ciudad: </b><div id='ciudad'>" + json.data.ciudad + " </div></h5>"
        + "  </div>"
        + "</div>");

    });

}

//Permite realizar acciones despues de cargar la tabla educacion formal
function acciones_registro_educacion_formal(token_actual) {

        //Permite realizar la carga respectiva de cada registro
        $(".btn_cargar_educacion_formal").click(function () {

            var id_educacion_formal = $(this).attr('id')
            cargar_informacion_educacion_formal(token_actual, id_educacion_formal);
    
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
                url: url_pv + "Mentoresseleccion/all_educacion_no_formal",
                data: {"token": token_actual.token, "idc": $('#convocatorias').val(), "postulacion": postulacion, "participante": participante,"ver_hoja_vida":$("#ver_hoja_vida").val()},
                //  async: false
            },
            "drawCallback": function (settings) {
                //$(".check_activar_t").attr("checked", "true");
                //$(".check_activar_f").removeAttr("checked");
                acciones_registro_educacion_no_formal(token_actual);
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

        $(".btn_cargar_educacion_no_formal").click(function () {

            var id_educacion_no_formal = $(this).attr('id')
            cargar_informacion_educacion_no_formal(token_actual, id_educacion_no_formal);

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
                url: url_pv + "Mentoresseleccion/all_experiencia_laboral",
                data: {"token": token_actual.token, "idc": $('#convocatorias').val(), "postulacion": postulacion, "participante": participante,"ver_hoja_vida":$("#ver_hoja_vida").val()},
                async: false
            },
            "drawCallback": function (settings) {
                //$(".check_activar_t").attr("checked", "true");
                //$(".check_activar_f").removeAttr("checked");
                acciones_registro_experiencia(token_actual);
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
                        return  ((((new Date(row.fecha_fin)) - (new Date(row.fecha_inicio))) / (60 * 60 * 24 * 1000)) / 30).toFixed(1);
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
                url: url_pv + "Mentoresseleccion/all_reconocimiento",
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
                url: url_pv + "Mentoresseleccion/all_publicacion",
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
    
    //Restablece los componentes select cuyo grupo de criterios sean exclusivos
    function limpiar(criterio, key) {
    
        $("." + key).each(function (c, v) {
    
            if ($("." + key)[c].id != criterio.id) {
                $("." + key)[c].selectedIndex = 0;
            }
    
        });
    }

    function cargar_inhabilidades(token_actual, postulacion, participante) {

        // cargo los datos
        $.ajax({
            type: 'POST',
            url: url_pv + 'Mentoresseleccion/search_info_inhabilidades',
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

function acciones_registro(token_actual) {

    $("#evaluar").trigger("reset");

    $(".btn_cargar").click(function () {

        $("#id_perfil_selecionado").val($(this).attr("id"));
        $("#id_participante_sel").val($(this).attr("id-participante"));
        $("#id_jurados_postulados").val(null);
        $("#ver_hoja_vida").val("0");

        //cargar_select_categorias_2(token_actual);
        cargar_datos_basicos(token_actual, $(this).attr("id"), $(this).attr("id-participante"));
        cargar_tabla_documentos(token_actual, $(this).attr("id"), $(this).attr("id-participante"));
        cargar_tabla_educacion_formal(token_actual, $(this).attr("id"), $(this).attr("id-participante"));
        cargar_tabla_educacion_no_formal(token_actual, $(this).attr("id"), $(this).attr("id-participante"));
        cargar_tabla_experiencia(token_actual, $(this).attr("id"), $(this).attr("id-participante"));
        //cargar_tabla_experiencia_jurado(token_actual, $(this).attr("id"), $(this).attr("id-participante"));
        cargar_tabla_reconocimiento(token_actual, $(this).attr("id"), $(this).attr("id-participante"));
        cargar_tabla_publicaciones(token_actual, $(this).attr("id"), $(this).attr("id-participante"));
        cargar_criterios_evaluacion(token_actual, $(this).attr("id"), $(this).attr("id-participante"));
        cargar_inhabilidades(token_actual, $(this).attr("id"), $(this).attr("id-participante"));
        // cargar_datos_convocatoria(token_actual,  $(this).attr("id"),  $(this).attr("id-participante"));
        
        //cargar la evaluacion

    });

    $(".btn_cargar_notificar").click(function () {

        var puntaje = parseFloat($(this).closest('tr').find('td:eq(5)').text());

        if (isNaN(puntaje) || puntaje === null) {
            // El puntaje es nulo o no es un número válido
            Swal.fire({
            icon: 'error',
            title: 'Debe puntuar al mentor para poder notificar',
            confirmButtonColor: '#3085d6',
            confirmButtonText: 'Aceptar'
            });
            return false; // Detener la ejecución del código y no continuar con la notificación
        }

        $("#id_jurado_postulado").val($(this).attr("id"));

        if ($(this).attr("postulado")) {
            $('#select_tipo_jurado').val("Seleccionado");
            //$('#select_tipo_jurado').prop('disabled', 'disabled');
        } else {
            $('#select_tipo_jurado').val(null);
            //$('#select_tipo_jurado').removeAttr('disabled');
        }


    });

    $(".btn_declinar").click(function () {

        declinar(token_actual, $(this).attr("id"))

    });

    $(".btn_cargar_notificacion").click(function () {
        cargar_notificacion(token_actual, $(this).attr("id"));
    });


    $('.btn_carta').click(function () {

        var postulacion = $(this).attr("id");

        window.open(url_pv_report + 'reporte_carta_aceptacion.php?postulacion=' + postulacion, '_blank');


    });



}


function genera_carta_acpetacion(token_actual, postulacion) {

    window.open(url_pv + "FormatosDoc/carta_aceptacion_notificacion/postulacion/" + postulacion, "_blank");

}

function notificar(token_actual, postulacion) {

    $.ajax({
        type: 'PUT',
        url: url_pv + 'Mentoresseleccion/notificar',
        data: $("#form_notificar").serialize()
                + "&modulo=SICON-JURADOS-SELECCION&token=" + token_actual.token
                + "&postulacion=" + postulacion
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
            case 'deshabilitado':
                notify("danger", "remove", "Usuario:", "No tiene permisos para editar información.");
                //cargar_datos_formulario(token_actual);
                break;
            case 'error_email':
                notify("danger", "remove", "Usuario:", "Error al enviar la notificación.");
                //cargar_datos_formulario(token_actual);
                break;
            default:
                notify("success", "ok", "Convocatorias:", "Se notificó con éxito.");
                //  $(".guardar_aplica_perfil").addClass( "disabled" );
                cargar_tabla(token_actual);
                break;
        }

    });

}

function declinar(token_actual, notificacion_key) {

    $.ajax({
        type: 'PUT',
        url: url_pv + 'Mentoresseleccion/declinar',
        data: "modulo=SICON-JURADOS-SELECCION&token=" + token_actual.token
                + "&key=" + notificacion_key
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
            case 'deshabilitado':
                notify("danger", "remove", "Usuario:", "No tiene permisos para editar información.");
                //cargar_datos_formulario(token_actual);
                break;
            case 'error_email':
                notify("danger", "remove", "Usuario:", "Error al enviar la notificación.");
                //cargar_datos_formulario(token_actual);
                break;
            default:
                notify("success", "ok", "Convocatorias:", "Se declinó con éxito.");
                //  $(".guardar_aplica_perfil").addClass( "disabled" );
                cargar_tabla(token_actual);
                break;
        }

    });

}

function cargar_notificacion(token_actual, notificacion_key) {

    //Realizo la peticion para cargar el formulario
    $.ajax({
        type: 'POST',
        data: {"token": token_actual.token, "key": notificacion_key},
        url: url_pv + 'Mentoresseleccion/notificacion/'
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
            default:

                var json = JSON.parse(data);

                if (json) {
                    $('#id_notificacion_cambio').val(json.id_notificacion);
                    $('#notificacionModal_usuario').html(json.usuario);
                    $('#notificacionModal_fecha_creacion').html(json.fecha_creacion);
                    $('#notificacionModal_tipo_jurado').html(json.tipo_jurado);
                    $('#notificacionModal_rol_jurado').html(json.rol_jurado);
                    $('#notificacionModal_fecha_aceptacion').html(json.fecha_aceptacion);
                    $('#notificacionModal_fecha_rechazo').html(json.fecha_rechazo);
                    $('#notificacionModal_estimulo').html(json.valor_estimulo);
                    $('#notificacionModal_horas').html(json.horas_mentoria);
                }
                break;
        }

    });

}

function validator_form(token_actual) {

    //Se debe colocar debido a que el calendario es un componente diferente
    $('.c1').on('changeDate show', function (e) {
        $('.form_notificar').bootstrapValidator('revalidateField', 'fecha_inicio_evaluacion');
    });

    //Se debe colocar debido a que el calendario es un componente diferente
    $('.c2').on('changeDate show', function (e) {
        $('.form_notificar').bootstrapValidator('revalidateField', 'fecha_fin_evaluacion');
    });

    //Se debe colocar debido a que el calendario es un componente diferente
    $('.c3').on('changeDate show', function (e) {
        $('.form_notificar').bootstrapValidator('revalidateField', 'fecha_deliberacion');
    });



    $('.form_notificar').bootstrapValidator({
        feedbackIcons: {
            valid: 'glyphicon glyphicon-ok',
            invalid: 'glyphicon glyphicon-remove',
            validating: 'glyphicon glyphicon-refresh'
        },
        fields: {
            fecha_inicio_evaluacion: {
                validators: {
                    notEmpty: {message: 'La fecha de inicio de la evaluación es requerida'}
                }
            },
            fecha_fin_evaluacion: {
                validators: {
                    notEmpty: {message: 'La fecha de fin de la evaluación es requerida'}
                }
            },
            fecha_deliberacion: {
                validators: {
                    notEmpty: {message: 'La fecha de deliberación es requerida'}
                }
            },
            option_suplente: {
                validators: {
                    notEmpty: {
                        message: 'La opción es requerida'
                    }
                }
            },
            valor_estimulo: {
                validators: {
                    integer: {
                        message: 'El campo debe contener solo números'
                    },
                    notEmpty: {
                        message: 'El valor del estímulo es requerido'
                    }
                }
            },
            horas_mentoria: {
                validators: {
                    integer: {
                        message: 'El campo debe contener solo números'
                    }
                }
            }

        }
    }).on('success.form.bv', function (e) {

        console.log("Validando");


        // Prevent form submission
        e.preventDefault();
        // Get the form instance
        var $form = $(e.target);

        // Get the BootstrapValidator instance
        var bv = $form.data('bootstrapValidator');

        notificar(token_actual, $("#id_jurado_postulado").val());

        //$form.bootstrapValidator('resetForm', true);

        //console.log("form-->" + $form.serialize());

        //cargar_tabla(token_actual);

        $form.bootstrapValidator('disableSubmitButtons', false).bootstrapValidator('resetForm', true);
        bv.resetForm();
        $("#notificarModal").modal("toggle");


    });

}


function guardar_aplica_mentor(token_actual, postulacion, btn_postular, option_aplica_perfil, descripcion_evaluacion) {

    var idregistro = ($('#categorias').val() === null) ? $('#convocatorias').val() : $('#categorias').val();

    $.ajax({
        type: 'POST',
        url: url_pv + 'Mentoresseleccion/guardar_aplica_mentor',
        data: {
            "token": token_actual.token,
            "modulo": "SICON-JURADOS-PRESELECCION",
            "idc": $('#convocatorias').val(),
            "postulacion": postulacion,
            "option_aplica_perfil": option_aplica_perfil,
            "descripcion_evaluacion": descripcion_evaluacion
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
                //btn_postular.css("display","none");
                cargar_tabla(token_actual);
                break;
        }

    });
}

//carga información de los criterios de evaluacion de las rondas
function cargar_criterios_evaluacion(token_actual, postulacion, participante) {
    $("#form_criterios_mentor").empty();
    //$("#form_criterios_mentor").hide();
    $("input[name=option_aplica_perfil][value=true]").removeAttr('checked');
    $("input[name=option_aplica_perfil][value=false]").removeAttr('checked');
    $(".guardar_aplica_perfil").removeClass("disabled");
    //$("#form_aplica_perfil").trigger("reset");
    //Cargar datos en la tabla actual


    //console.log("postulacion "+ postulacion + " participante " + participante);

    $.ajax({
        type: 'POST',
        url: url_pv + 'Mentoresseleccion/criterios_evaluacion',
        data: "&modulo=Jurados&token=" + token_actual.token
                + "&idc=" + $('#convocatorias').val()
                + "&postulacion=" + postulacion
                + "&participante=" + participante
    }).done(function (data) {

        //console.log(JSON.stringify(data));

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

                        if (json[r].postulacion.aplica_perfil !== null && json[r].postulacion.aplica_perfil) {
                            $(".guardar_aplica_perfil").addClass("disabled");
                            $("#fieldset_aplica_perfil").attr("disabled", "");
                            $("input[name=option_aplica_perfil][value=true]").attr('checked', 'checked');
                            //$("#form_criterios_mentor").show();
                        } else if (json[r].postulacion.aplica_perfil !== null && (!json[r].postulacion.aplica_perfil)) {
                            $(".guardar_aplica_perfil").addClass("disabled");
                            $("#fieldset_aplica_perfil").attr("disabled", "");
                            $("input[name=option_aplica_perfil][value=false]").attr('checked', 'checked');
                        }

                        if (json[r].postulacion.aplica_perfil === null) {
                            //$("#form_aplica_perfil").removeClass("disabled");
                            $(".guardar_aplica_perfil").removeClass("disabled");
                            $("#fieldset_aplica_perfil").removeAttr("disabled", "");
                        }

                        $("#descripcion_evaluacion").val(json[r].postulacion.descripcion_evaluacion);
                        $("#id_jurados_postulados").val(json[r].postulacion.id);

                        $("#form_criterios_mentor").append('<fieldset class="criterios" ' + (json[r].postulacion.estado >= 12 ? ' disabled="" ' : '') + '>');

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
                           // + '<button type="button" class="btn btn-default ' + ((json[r].postulacion.estado >= 12) ? "disabled" : ' confirmar_evaluacion_' + $("#id_ronda").val()) + '">Confirmar evaluación</button></div>'
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

//Guarda la evaluación de los criterios evaluados
function evaluar_criterios(token_actual, postulacion, participante) {

        $.ajax({
            type: 'POST',
            url: url_pv + 'Mentoresseleccion/evaluar_criterios',
            data: $("#form_criterios_mentor").serialize()
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


$("#generar_acta_preseleccion").click(function () {

    $("#mensajegn").show();
    $("#bcancelargn").show();
    $("#baceptargn").show();
});
$("#baceptargn").click(function () {

    generar_acta_jurados_preseleccionados($('#convocatorias').val());

    /*
    if ($("#categorias").val() === null) {
        generar_acta_jurados_preseleccionados($('#convocatorias').val());
    } else {
        generar_acta_jurados_preseleccionados($("#categorias").val());
    }*/

    $('#genera_acta_modal').modal('hide');
});
    
function generar_acta_jurados_preseleccionados(id_convocatoria) {
    window.open(url_pv + "FormatosDoc/generar_acta_mentores/convocatoria/" + id_convocatoria, "_blank");
}
