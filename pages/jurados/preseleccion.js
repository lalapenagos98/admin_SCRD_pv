$(document).ready(function () {

    //Verifico si el token exite en el cliente y verifico que el token este activo en el servidor
    var token_actual = getLocalStorage(name_local_storage);


    //Verifico si el token esta vacio, para enviarlo a que ingrese de nuevo
    if ($.isEmptyObject(token_actual)) {
        location.href = url_pv_admin + 'index.html?msg=Su sesión ha expirado, por favor vuelva a ingresar.&msg_tipo=danger';
    } else
    {
        $('.convocatorias-search').select2();
        //Verifica si el token actual tiene acceso de lectura
        permiso_lectura(token_actual, "Jurados");
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

        $('#buscar_banco').click(function () {
            //$("#formulario_busqueda_banco").submit();
            //$('#resultado').focus();
            //$('#filtro').val(true);
            //cargar_tabla(token_actual);
            //$("#exampleModal").modal("toggle");
        });

        $('#formulario_busqueda_banco').click(function () {
            //$("#formulario_busqueda_banco").submit();
            //$('#resultado').focus();
            //$('#filtro').val(true);
            //cargar_tabla(token_actual);
            //$("#exampleModal").modal("toggle");
        });
        
        /*
         * 22-09-2021
         * Wilmer Gustavo Mogollón Duque
         * Se incorporan acciones a los botones para que muestre un mensaje de alerta para generar el acta
         */

        //acta preselección
        $("#generar_acta_preseleccion").click(function () {

            $("#mensajegn").show();
            $("#bcancelargn").show();
            $("#baceptargn").show();
        });
        $("#baceptargn").click(function () {
            if($("#categorias").val()===""){
                generar_acta_jurados_preseleccionados(token_actual, $("#convocatorias").val());
            }else{
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
            //  $("#alertModalSel").modal("hide");
            //seleccionar_jurado(token_actual,  $("#id_jurados_postulados").val(),   $("#id_participante_sel").val() );
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
            if($("#convocatorias").val()===""){
                $('#mensaje_seleccionar_convocatoria').show();
                $('#bcancelar_liberar').show();
                
                $('#mensaje_liberar').hide();
                $('#baceptar_liberar').hide();
            }else{
                $('#mensaje_liberar').show();
                $('#bcancelar_liberar').show();
                $('#baceptar_liberar').show();
                $('#mensaje_seleccionar_convocatoria').hide();
            }
        });
        
        $("#baceptar_liberar").click(function () {
            $('#confirmar_liberar').modal('hide');
            if($("#categorias").val()===""){
                liberar_postulaciones(token_actual, $("#convocatorias").val());
            }else{
                liberar_postulaciones(token_actual, $("#categorias").val());
            }
        });





    }

});

function init(token_actual) {
    //Realizo la peticion para cargar el formulario
    $.ajax({
        type: 'GET',
        data: {"token": token_actual.token, "id": $("#id").attr('value')},
        url: url_pv + 'Juradospreseleccion/init/'
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
        type: 'GET',
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


    $.ajax({
        type: 'GET',
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
        "order": [[5, "desc"]],
        "ajax": {
            url: url_pv + "Juradospreseleccion/all_preseleccionados",
            data:
                    {"token": token_actual.token,
                        "convocatoria": $('#convocatorias').val(),
                        "categoria": $('#categorias').val(),
                        "filtros": data
                    },
            //async: false
        },
        "drawCallback": function (settings) {
            //$(".check_activar_t").attr("checked", "true");
            //$(".check_activar_f").removeAttr("checked");
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
            {"data": "Postulado",
                render: function (data, type, row) {
                    return (row.postulado) ? "Si" : "No";
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

            /*{"data": "Seleccionar",
             render: function ( data, type, row ) {
             return ' <input title=\"'+row.id+'\" type=\"checkbox\" class=\"check_activar_'+row.active+'  activar_registro" '+(row.active? 'checked ':'')+' />';
             },
             },*/
            {"data": "aciones",
                render: function (data, type, row) {

                    if (row.id_postulacion === null || row.id_postulacion === undefined) {
                        return '<button id="' + row.id_postulacion + '" title="Seleccionar la hoja de vida" type="button" class="btn btn-warning btn_postular" id-participante="' + row.id + '">'
                                + '<span class="glyphicon glyphicon-log-in"></span></button>';
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

        ///  $('#form_aplica_perfil').bootstrapValidator('destroy');
        //$('#form_aplica_perfil').bootstrapValidator('resetForm', true);

        $("#id_perfil_selecionado").val($(this).attr("id"));
        $("#id_participante_sel").val($(this).attr("id-participante"));
        $("#id_jurados_postulados").val(null);
        // alert("convocatoria"+ $('#convocatorias').val());
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

    $(".btn_postular").click(function () {
        postular(token_actual, $(this).attr("id"), $(this).attr("id-participante"));
    });

}

//carga información básica del participante seleccionado
function cargar_datos_basicos(token_actual, postulacion, participante) {
    $("#perfiles_jurados").html("");
    //consulto si tengo propuesta cargada

    // cargo los datos
    $.ajax({
        type: 'GET',
        url: url_pv + 'Juradospreseleccion/search_info_basica_jurado',
        data: {"token": token_actual.token, "idc": $('#convocatorias').val(), "postulacion": postulacion, "participante": participante},
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
                cargar_datos_formulario(token_actual);
                break;
            default:

                var json = JSON.parse(data);

                if (json.participante) {

                    $('#modalidad_participa_jurado').html(json.modalidad_participa_jurado);
                    
                    $('#tipo_documento').html(json.participante.tipo_documento);
                    $('#numero_documento').html(json.participante.numero_documento);

                    $('#nombres').html(json.participante.primer_nombre + ' ' + json.participante.segundo_nombre);
                    $('#apellidos').html(json.participante.primer_apellido + ' ' + json.participante.segundo_apellido);

                    $('#fecha_nacimiento').html(json.participante.fecha_nacimiento);
                    $('#sexo').html(json.participante.sexo);

                    $('#orientacion_sexual').html(json.participante.orientacion_sexual);
                    $('#identidad_genero').html(json.participante.identidad_genero);

                    $('#ciudad').html(json.participante.ciudad_residencia);
                    $('#barrio').html(json.participante.barrio_residencia);

                    $('#direccion_residencia').html(json.participante.direccion_residencia);
                    $('#correo_electronico').html(json.participante.correo_electronico);
                    $('#perfil').html(json.perfil);

                    $('#nombres2').html(json.participante.primer_nombre + ' ' + json.participante.segundo_nombre);
                    $('#apellidos2').html(json.participante.primer_apellido + ' ' + json.participante.segundo_apellido);
                    $('#propuesta_resumen').html(json.propuesta_resumen);
                    $('#propuesta_resumen_perfil').html(json.propuesta_resumen);

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
    $('#table_documentos').DataTable({
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
            url: url_pv + "Juradospreseleccion/all_documento",
            data: {"token": token_actual.token, "idc": $('#convocatorias').val(), "postulacion": postulacion, "participante": participante},
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
            url: url_pv + 'PropuestasJurados/download_file/',
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
    $('#table_educacion_formal').DataTable({
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
            url: url_pv + "Juradospreseleccion/all_educacion_formal",
            data: {"token": token_actual.token, "idc": $('#convocatorias').val(), "postulacion": postulacion, "participante": participante},
            //async: false
        },
        "drawCallback": function (settings) {
            //$(".check_activar_t").attr("checked", "true");
            //$(".check_activar_f").removeAttr("checked");
            acciones_registro_educacion_formal(token_actual);
        },
        "rowCallback": function (row, data, index) {

            $('#contenidox').html(" <div class='row'><div class='col-lg-6'>"
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

        $('#vermas').show();
        $('#table_eformal').hide();

    });

    $("#vermas_back").click(function () {
        $('#vermas').hide();
        $('#table_eformal').show();
    });

    //descargar archivo
    $(".download_file_educacion_formal").click(function () {
        //Cargo el id file
        var cod = $(this).attr('id');

        $.AjaxDownloader({
            url: url_pv + 'PropuestasJurados/download_file/',
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
    $('#table_educacion_no_formal').DataTable({
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
            url: url_pv + "Juradospreseleccion/all_educacion_no_formal",
            data: {"token": token_actual.token, "idc": $('#convocatorias').val(), "postulacion": postulacion, "participante": participante},
            //  async: false
        },
        "drawCallback": function (settings) {
            //$(".check_activar_t").attr("checked", "true");
            //$(".check_activar_f").removeAttr("checked");
            acciones_registro_educacion_no_formal(token_actual);
        },
        "rowCallback": function (row, data, index) {

            $('#contenido_enf').html(" <div class='row'><div class='col-lg-6'>"
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
        $('#vermas_enf').show();
        $('#table_enformal').hide();

    });

    $("#vermas_back_enf").click(function () {
        $('#vermas_enf').hide();
        $('#table_enformal').show();
    });

    //descargar archivo
    $(".download_file_educacion_no_formal").click(function () {
        //Cargo el id file
        var cod = $(this).attr('id');

        $.AjaxDownloader({
            url: url_pv + 'PropuestasJurados/download_file/',
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
    $('#table_experiencia').DataTable({
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
            url: url_pv + "Juradospreseleccion/all_experiencia_laboral",
            data: {"token": token_actual.token, "idc": $('#convocatorias').val(), "postulacion": postulacion, "participante": participante},
            async: false
        },
        "drawCallback": function (settings) {
            //$(".check_activar_t").attr("checked", "true");
            //$(".check_activar_f").removeAttr("checked");
            acciones_registro_experiencia(token_actual);
        },
        "rowCallback": function (row, data, index) {
            $('#contenido_experiencia').html(" <div class='row'><div class='col-lg-6'>"
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
        $('#vermas_experiencia').show();
        $('#row_experiencia').hide();

    });

    $("#vermas_back_experiencia").click(function () {
        $('#vermas_experiencia').hide();
        $('#row_experiencia').show();
    });


    //descargar archivo
    $(".download_file_experiencia").click(function () {
        //Cargo el id file
        var cod = $(this).attr('id');

        $.AjaxDownloader({
            url: url_pv + 'PropuestasJurados/download_file/',
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
    $('#table_experiencia_jurado').DataTable({
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
            url: url_pv + "Juradospreseleccion/all_experiencia_jurado",
            data: {"token": token_actual.token, "idc": $('#convocatorias').val(), "postulacion": postulacion, "participante": participante},
            async: false
        },
        "drawCallback": function (settings) {
            //$(".check_activar_t").attr("checked", "true");
            //$(".check_activar_f").removeAttr("checked");
            acciones_registro_experiencia_jurado(token_actual);
        },
        "rowCallback": function (row, data, index) {
            $('#contenido_experiencia_jurado').html(" <div class='row'><div class='col-lg-6'>"
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
        $('#vermas_experiencia_jurado').show();
        $('#row_experiencia_jurado').hide();

    });

    $("#vermas_back_experiencia_jurado").click(function () {
        $('#vermas_experiencia_jurado').hide();
        $('#row_experiencia_jurado').show();
    });

    //descargar archivo
    $(".download_file_experiencia_jurado").click(function () {
        //Cargo el id file
        var cod = $(this).attr('id');

        $.AjaxDownloader({
            url: url_pv + 'PropuestasJurados/download_file/',
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
    $('#table_reconocimiento').DataTable({
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
            url: url_pv + "Juradospreseleccion/all_reconocimiento",
            data: {"token": token_actual.token, "idc": $('#convocatorias').val(), "postulacion": postulacion, "participante": participante},
            async: false
        },
        "drawCallback": function (settings) {
            //$(".check_activar_t").attr("checked", "true");
            //$(".check_activar_f").removeAttr("checked");
            acciones_registro_reconocimiento(token_actual);
        },
        "rowCallback": function (row, data, index) {
            $('#contenido_reconocimiento').html(" <div class='row'><div class='col-lg-6'>"
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

        $('#vermas_reconocimiento').show();
        $('#row_reconocimiento').hide();

    });

    $("#vermas_back_reconocimiento").click(function () {
        $('#vermas_reconocimiento').hide();
        $('#row_reconocimiento').show();
    });


    //descargar archivo
    $(".download_file_reconocimiento").click(function () {
        //Cargo el id file
        var cod = $(this).attr('id');

        $.AjaxDownloader({
            url: url_pv + 'PropuestasJurados/download_file/',
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
    $('#table_reconocimiento').DataTable({
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
            url: url_pv + "Juradospreseleccion/all_reconocimiento",
            data: {"token": token_actual.token, "idc": $('#convocatorias').val(), "postulacion": postulacion, "participante": participante},
            async: false
        },
        "drawCallback": function (settings) {
            //$(".check_activar_t").attr("checked", "true");
            //$(".check_activar_f").removeAttr("checked");
            acciones_registro_reconocimiento(token_actual);
        },
        "rowCallback": function (row, data, index) {
            $('#contenido_reconocimiento').html(" <div class='row'><div class='col-lg-6'>"
                    + "    <h5><b>Nombre: </b><div id='nombre'>" + data["nombre"] + " </div></h5>"
                    + "  </div>"
                    + "  <div class='col-lg-6'>"
                    + "    <h5><b>Institución: </b><div id='institucion'>" + data["institucion"] + " </div></h5>"
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
        $('#vermas_reconocimiento').show();
        $('#row_reconocimiento').hide();

    });

    $("#vermas_back_reconocimiento").click(function () {
        $('#vermas_reconocimiento').hide();
        $('#row_reconocimiento').show();
    });

    //descargar archivo
    $(".download_file_reconocimiento").click(function () {
        //Cargo el id file
        var cod = $(this).attr('id');

        $.AjaxDownloader({
            url: url_pv + 'PropuestasJurados/download_file/',
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
    $('#table_publicaciones').DataTable({
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
            url: url_pv + "Juradospreseleccion/all_publicacion",
            data: {"token": token_actual.token, "idc": $('#convocatorias').val(), "postulacion": postulacion, "participante": participante},
            async: false
        },
        "drawCallback": function (settings) {
            //$(".check_activar_t").attr("checked", "true");
            //$(".check_activar_f").removeAttr("checked");
            acciones_registro_publicaciones(token_actual);
        },
        "rowCallback": function (row, data, index) {
            $('#contenido_publicaciones').html(" <div class='row'><div class='col-lg-6'>"
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
        $('#vermas_publicaciones').show();
        $('#row_publicaciones').hide();
        /*  $("#idregistro").val( $(this).attr("title") );
         // cargo los datos
         cargar_datos_formulario(token_actual);*/
    });

    $("#vermas_back_publicaciones").click(function () {
        $('#vermas_publicaciones').hide();
        $('#row_publicaciones').show();
    });

    //descargar archivo
    $(".download_file_publicaciones").click(function () {
        //Cargo el id file
        var cod = $(this).attr('id');

        $.AjaxDownloader({
            url: url_pv + 'PropuestasJurados/download_file/',
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
        type: 'GET',
        url: url_pv + 'Juradospreseleccion/criterios_evaluacion',
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
                location.href = url_pv_admin + 'index.html?msg=Su sesión ha expirado, por favor vuelva a ingresar.&msg_tipo=danger';
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

                    console.log("aplica_perfil-->" + json[r].postulacion);

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

                        });//fin foreach criterio

                    }); //fin foreach categoria criterio

                    $(".criterios").append('<div class="col-lg-12" style="text-align: right">'
                            + '<button type="button" class="btn btn-default ' + ((json[r].postulacion.estado >= 12) ? "disabled" : ' guardar_evaluacion_' + $("#id_ronda").val()) + '">Guardar</button>'
                            + '<button type="button" class="btn btn-default ' + ((json[r].postulacion.estado >= 12) ? "disabled" : ' confirmar_evaluacion_' + $("#id_ronda").val()) + '">Confirmar evaluación</button></div>'
                            );

                });//fin foreach ronda

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
        url: url_pv + 'Juradospreseleccion/evaluar_perfil',
        data: $("#form_aplica_perfil").serialize()
                + "&modulo=Jurados&token=" + token_actual.token
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
                location.href = url_pv_admin + 'index.html?msg=Su sesión ha expirado, por favor vuelva a ingresar.&msg_tipo=danger';
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

                if ($("#optionsRadiosInline1").val()) {

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
        url: url_pv + 'Juradospreseleccion/evaluar_criterios',
        data: $("#form_criterios").serialize()
                + "&modulo=Jurados&token=" + token_actual.token
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
                location.href = url_pv_admin + 'index.html?msg=Su sesión ha expirado, por favor vuelva a ingresar.&msg_tipo=danger';
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
        url: url_pv + 'Juradospreseleccion/confirmar_evaluacion',
        data: $("#form_criterios").serialize()
                + "&modulo=Jurados&token=" + token_actual.token
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
                location.href = url_pv_admin + 'index.html?msg=Su sesión ha expirado, por favor vuelva a ingresar.&msg_tipo=danger';
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
        type: 'GET',
        url: url_pv + 'Juradospreseleccion/convocatoria',
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
                location.href = url_pv_admin + 'index.html?msg=Su sesión ha expirado, por favor vuelva a ingresar.&msg_tipo=danger';
                break;
            case 'acceso_denegado':
                notify("danger", "remove", "Usuario:", "No tiene permisos acceder a la información.");
                break;
            default:
                var json = JSON.parse(data);


                if (json != null) {

                    if (json.tiene_categorias) {

                        $.ajax({
                            type: 'GET',
                            url: url_pv + 'Juradospreseleccion/select_categorias',
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
                                    location.href = url_pv + 'index.html?msg=Su sesión ha expirado, por favor vuelva a ingresar.&msg_tipo=danger';
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
        url: url_pv + 'Juradospreseleccion/seleccionar_perfil',
        data: "&modulo=Jurados&token=" + token_actual.token
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
                location.href = url_pv_admin + 'index.html?msg=Su sesión ha expirado, por favor vuelva a ingresar.&msg_tipo=danger';
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

function postular(token_actual, postulacion, participante) {

    var idregistro = ($('#categorias').val() === "") ? $('#convocatorias').val() : $('#categorias').val();

    $.ajax({
        type: 'POST',
        url: url_pv + 'Juradospreseleccion/new_postulacion',
        data: {
            "token": token_actual.token,
            "modulo": "Jurados",
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
                location.href = url_pv_admin + 'index.html?msg=Su sesión ha expirado, por favor vuelva a ingresar.&msg_tipo=danger';
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
                cargar_tabla(token_actual);
                break;
        }

    });

}



/*
 * 20-05-2020
 * Wilmer GUstavo Mogollón Duque
 * Se agrega función para listar nucleo básico del conocimiento según el área de conocimiento escogida
 */

function cargar_select_nucleobasico(token_actual, id_areasconocimientos, set_value){


    $.ajax({
        type: 'GET',
        url: url_pv + 'PropuestasJurados/select_nucleobasico',
        data: {"token": token_actual.token, "id": id_areasconocimientos },
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
          $('#nucleo_basico').find('option').remove();
          $("#nucleo_basico").append('<option value="">:: Seleccionar ::</option>');
          if ( json != null && json.length > 0) {
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
 * 06-07-2020
 * Wilmer Gustavo Mogollón Duque
 * Se agrega función liberar_postulaciones 
 */
function liberar_postulaciones(token_actual, convocatoria) {


    $.ajax({
        type: 'PUT',
        url: url_pv + 'Juradospreseleccion/liberar_postulaciones/convocatoria/' + convocatoria,
        data: "&modulo=Jurados&token=" + token_actual.token

    }).done(function (data) {

        switch (data) {
            case 'error':
                notify("danger", "ok", "Usuario:", "Se registro un error, comuníquese con la mesa de ayuda soporte.convocatorias@scrd.gov.co");
                break;
            case 'error_metodo':
                notify("danger", "ok", "Se registro un error en el método, comuníquese con la mesa de ayuda soporte.convocatorias@scrd.gov.co");
                break;
            case 'error_token':
                location.href = url_pv_admin + 'index.html?msg=Su sesión ha expirado, por favor vuelva a ingresar.&msg_tipo=danger';
                //notify("danger", "error_token", "URL:", 'PropuestasEvaluacion/evaluacionpropuestas/'+id_evaluacion+'/impedimentos');
                break;
            case 'acceso_denegado':
                notify("danger", "remove", "Usuario:", "Aún no se han conformado todos los grupos de evaluación.");
                break;
            case 'acceso_denegado':
                notify("danger", "remove", "Usuario:", "No tiene permisos para editar información.");
                break;
            case 'error_rondas':
                notify("danger", "ok", "Usuario:", "Esta convocatoria aún no tiene rondas de evaluación asociadas");
                break;
            case 'deshabilitado':
                notify("danger", "remove", "Usuario:", "No tiene permisos para editar información.");
                break;
            default:
                notify("success", "ok", "Usuario:", "Las postulaciones fueron liberadas con éxito.");
                cargar_tabla(token_actual);
                break;
        }

    });


}



/*
 * 20-08-2020
 * Wilmer Gustavo Mogollón Duque
 * Se agrega función cargar_inhabilidades
 */

//function cargar_inhabilidades(token_actual, postulacion, participante){
//    alert("Hola");
//}

function cargar_inhabilidades(token_actual, postulacion, participante) {
    $("#perfiles_jurados").html("");
    //consulto si tengo propuesta cargada

    // cargo los datos
    $.ajax({
        type: 'GET',
        url: url_pv + 'Juradospreseleccion/search_info_inhabilidades',
        data: {"token": token_actual.token, "idc": $('#convocatorias').val(), "postulacion": postulacion, "participante": participante, "anio" : $('#anio').val()},
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
                    
                    if(Object.keys(json.contratistas).length>0)
                    {
                        $("#contratistas").css("display","block");
                        
                        var html_table = "";
                        $( ".tr_contratistas" ).remove();
                        $.each(json.contratistas, function (key, contratista) {
                                 var nombre_contratista=String(contratista);
                                 html_table = html_table+'<tr class="tr_contratistas"><td>'+key+'</td><td>'+nombre_contratista.replace(",","<br/>")+'</td></tr>';                                                      
                        });                    
                        $( "#body_contratistas" ).append(html_table);
                        
                    }
                    else
                    {
                        $("#contratistas").css("display","none");
                    }
                    
                    //Jurados seleccionados
                    
                    if(json.html_propuestas_jurados_seleccionados!=="")
                    {
                        $("#jurados_seleccionados").css("display","block");                                                                    
                        $( ".tr_jurados_seleccionados" ).remove();
                        $( "#body_jurados_seleccionados" ).append(json.html_propuestas_jurados_seleccionados);
                        
                    }
                    else
                    {
                        $("#jurados_seleccionados").css("display","none");
                    }
                    
                    
                    //Jurados proceso
                    
                    if(json.html_propuestas_jurados_proceso!=="")
                    {
                        $("#jurados_proceso").css("display","block");                                                                    
                        $( ".tr_jurados_proceso" ).remove();
                        $( "#body_jurados_proceso" ).append(json.html_propuestas_jurados_proceso);
                        
                    }
                    else
                    {
                        $("#jurados_proceso").css("display","none");
                    }
                    
                    //Personas naturales
                    
                    if(json.html_propuestas!=="")
                    {
                        $("#propuestas_pn").css("display","block");                                                                    
                        $( ".tr_propuestas" ).remove();
                        $( "#body_propuestas_pn" ).append(json.html_propuestas);
                        
                    }
                    else
                    {
                        $("#propuestas_pn").css("display","none");
                    }
                    
                    if(json.html_propuestas_ganadoras!=="")
                    {
                        $("#propuestas_ganadoras_pn").css("display","block");                                                                    
                        $( ".tr_propuestas_ganadoras" ).remove();
                        $( "#body_propuestas_ganadoras_pn" ).append(json.html_propuestas_ganadoras);
                        
                    }
                    else
                    {
                        $("#propuestas_ganadoras_pn").css("display","none");
                    }
                    
                    //Jurados seleccionados años anteriores
                    
                    if(json.html_ganadoras_anios_anteriores!=="")
                    {
                        $("#ganadoras_anios_anteriores").css("display","block");                                                                    
                        $( ".tr_ganador_anio_anterior" ).remove();
                        $( "#body_ganadoras_anios_anteriores" ).append(json.html_ganadoras_anios_anteriores);
                        
                    }
                    else
                    {
                        $("#ganadoras_anios_anteriores").css("display","none");
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