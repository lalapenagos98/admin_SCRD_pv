$(document).ready(function () {

    //Verifico si el token exite en el cliente y verifico que el token este activo en el servidor
    var token_actual = getLocalStorage(name_local_storage);
    $("#notificacion_periodo").hide();
    $("#deliberar").hide();
    $("#confirmar_top_general").hide();
    $("#anular_deliberacion").hide();
    $("#asignar_estimulo").hide();
    $("#genera_acta").hide();
    /*
     * 06-06-2020
     * Wilmer Gustavo Mogollón Duque
     * Se agrega el botón top_general al hide
     */
    $("#top_general").hide();

    //Verifico si el token esta vacio, para enviarlo a que ingrese de nuevo
    if ($.isEmptyObject(token_actual)) {
        location.href = url_pv_admin + 'index.html?msg=Su sesión ha expirado, por favor vuelva a ingresar.&msg_tipo=danger';
    } else
    {
        //Verifica si el token actual tiene acceso de lectura
        permiso_lectura(token_actual, "Deliberación");
        $('.convocatorias-search').select2();

        //Carga el select de entidad
        $.ajax({
            type: 'GET',
            data: {"token": token_actual.token},
            url: url_pv + 'Entidades/all_select/',
            success: function (data) {

                switch (data) {
                    case 'error':
                        notify("danger", "ok", "Convocatorias:", "Se registro un error, comuníquese con la mesa de ayuda soporte.convocatorias@scrd.gov.co");
                        break;
                    case 'error_metodo':
                        notify("danger", "ok", "Se registro un error en el método, comuníquese con la mesa de ayuda soporte.convocatorias@scrd.gov.co");
                        break;
                    case 'error_token':
                        //location.href = url_pv_admin + 'index.html?msg=Su sesión ha expirado, por favor vuelva a ingresar.&msg_tipo=danger';
                        notify("danger", "error_token", "URL:", "PropuestasEvaluacion/select_estado/");
                        break;
                    case 'acceso_denegado':
                        notify("danger", "remove", "Usuario:", "No tiene permisos acceder a la información.");
                        break;
                    default:
                        json_entidades = JSON.parse(data);

                        $('#entidad').find('option').remove();
                        $("#entidad").append('<option value="">:: Seleccionar ::</option>');
                        if (json_entidades.length > 0) {
                            $.each(json_entidades, function (key, entidad) {
                                $("#entidad").append('<option value="' + entidad.id + '" >' + entidad.nombre + '</option>');
                            });
                        }

                        break;
                }


            }
        });

        //Carga el select de años
        $('#anio').find('option').remove();
        $("#anio").append('<option value="">:: Seleccionar ::</option>');
        for (i = (new Date()).getFullYear(); i >= 2016; i--) {
            $("#anio").append('<option value="' + i + '" >' + i + '</option>');
        }

        //carga select_convocatorias
        $('#anio').change(function () {
            $('#convocatorias').val(null);
            cargar_select_convocatorias(token_actual, $('#anio').val(), $('#entidad').val());

            $('#categorias').val(null);
            $("#categorias").attr('disabled', '');

            $('#rondas').val(null);

            //cargar_tabla(token_actual);
        });

        //carga select convocatorias
        $('#entidad').change(function () {
            $('#convocatorias').val(null);
            cargar_select_convocatorias(token_actual, $('#anio').val(), $('#entidad').val());

            $('#categorias').val(null);
            $("#categorias").attr('disabled', '');

            $('#rondas').val(null);

            //cargar_tabla(token_actual);
        });

        //carga el select categorias
        $('#convocatorias').change(function () {
            $("#categorias").attr('disabled', '');
            $('#categorias').val(null);
            cargar_select_categorias(token_actual, $('#convocatorias').val());

            $('#rondas').val(null);
            cargar_select_rondas(token_actual, $('#convocatorias').val());

            //cargar_tabla(token_actual);
        });

        //carga el select rondas
        $('#categorias').change(function () {
            $('#rondas').val(null);
            cargar_select_rondas(token_actual, $('#categorias').val());
            // cargar_tabla(token_actual);
        });



        /*
         * 20-06-2020
         * Wilmer Gustavo Mogollón Duque
         * Agrego un if para controlar que seleccione la ronda de evaluación
         */


        //carga la tabla con los criterios de busqueda
        $('#buscar').click(function () {

            if ($('#rondas').val() === "") {
                alert("Debe seleccionar la ronda de evaluación");
            } else {
                $('#resultado').focus();
                validator_form(token_actual);
                cargar_tabla(token_actual);
            }


        });



        $("#top_general").click(function () {

            cargar_info_top_general(token_actual, $('#rondas').val());
        });


        $("#total_ganadores").change(function () {
            cargar_tabla_ganadores(token_actual);
        });
        $("#total_suplentes").change(function () {
            cargar_tabla_ganadores(token_actual);
        });

        $("#baceptartop").click(function () {
            confirmar_top_general(token_actual, $('#rondas').val());
            $('#exampleModaltop').modal('hide');
            $('#top_generalModal').modal('hide');

        });

        /*
         * 06-06-2020
         * Wilmer Gustavo Mogollón Duque
         * Se incorporan acciones a los botones para que muestre un mensaje de alerta
         */

        //deliberar
        $("#deliberar").click(function () {

            $("#mensaje").show();
            $("#bcancelar").show();
            $("#baceptar").show();

        });

        $("#baceptar").click(function () {

            deliberar(token_actual, $('#rondas').val());
            $('#exampleModal').modal('toggle');

        });
        /*
         * 12-06-2020
         * Wilmer Gustavo Mogollón Duque
         * Se incorporan acciones a los botones para que muestre un mensaje de alerta para generar el acta
         */

        //deliberar
        $("#genera_acta").click(function () {

            $("#mensajegn").show();
            $("#bcancelargn").show();
            $("#baceptargn").show();

        });

        $("#baceptargn").click(function () {
            generar_acta_preseleccionados(token_actual, $('#rondas').val());
            $('#genera_acta_modal').modal('hide');
        });

        //Aceptar top generar
        $("#btn_aceptar_top").click(function () {

            validator_form_confirmar(token_actual);

        });


        /*
         * 22-06-2020
         * Wilmer Gustavo Mogollón Duque
         * Se incorpora la acción para el botón anular_deliberacion
         */
        //Anular deliberación
        
        $("#anular_deliberacion").click(function () {

            $("#mensaje_anular").show();
            $("#bcancelar_anular").show();
            $("#baceptar_anular").show();

        });
        
        $("#baceptar_anular").click(function () {

            anular_deliberacion(token_actual, $('#rondas').val());
            $('#anular_deliberacionModal').modal('hide');

        });

//        $("#form_top_general").bootstrapValidator({
//            feedbackIcons: {
//                valid: 'glyphicon glyphicon-ok',
//                invalid: 'glyphicon glyphicon-remove',
//                validating: 'glyphicon glyphicon-refresh'
//            },
//            fields: {
//                comentarios: {
//                    enabled: false,
//                    validators: {
//                        notEmpty: {
//                            message: 'Debe digitar los comentarios generales sobre la convocatoria y las propuestas participantes.'
//                        }
//                    }
//                },
//            }
//        })

        //validador formulario Notificación de impedimento
        $('#form_top_general').bootstrapValidator({

            feedbackIcons: {
                valid: 'glyphicon glyphicon-ok',
                invalid: 'glyphicon glyphicon-remove',
                validating: 'glyphicon glyphicon-refresh'
            },
            fields: {
                total_ganadores: {
                    validators: {
                        notEmpty: {message: 'El número de ganadores es requerido'}
                    }
                },
                total_suplentes: {
                    validators: {
                        notEmpty: {message: 'El número de ganadores es requerido'}
                    }
                },
                aspectos: {
                    validators: {
                        notEmpty: {message: 'La descripción de los aspectos es requerida'}
                    }
                },
                recomendaciones: {
                    validators: {
                        notEmpty: {message: 'La descripción de las recomendaciones es requerida'}
                    }
                },
                comentarios: {
                    enabled: false,
                    validators: {
                        notEmpty: {message: 'La descripción de los aspectos es requerida'}
                    }
                }
            }
        });




        //Declaración desierta
        $("#btn_declarar_desierta").click(function () {

            $('#form_top_general').bootstrapValidator('enableFieldValidators', 'comentarios', true);
            $('#form_top_general').bootstrapValidator('validateField', 'comentarios');

            $("#mensajeds").show();
            $("#bcancelards").show();
            $("#baceptards").show();

        });

        $("#baceptards").click(function () {
            declarar_convocatoria_desierta(token_actual, $('#rondas').val());
            $('#genera_acta_modal_desierta').modal('hide');
            $('#top_generalModal').moda10000l('hide');
        });


        /*
         * Botón para guardar el estímulo de la propuesta
         */

        $("#baceptarasg").click(function () {

            token_actual = getLocalStorage(name_local_storage);
            asignar_monto(token_actual, $('#id_propuesta').val(), $('#monto_asignado').val());
            $('#asignar_monto').modal('hide');
            limpiarFormulario();

        });


        /*
         * 15-06-2020
         * Wilmer Gistavo Mogollón Duque
         * Se agrega acción al botón  para llamar a la función 
         */
        $("#asignar_estimulo").click(function () {
            cargar_info_top_general_asignar(token_actual, $('#rondas').val());
        });


        validator_form(token_actual);


    }

});


//Agrego para limpiar el formulario
function limpiarFormulario() {
    document.getElementById("asignar_est_form").reset();
}


function cargar_select_convocatorias(token_actual, anio, entidad) {


    $.ajax({
        type: 'GET',
        url: url_pv + 'Deliberacion/select_convocatorias',
        data: {"token": token_actual.token, "anio": anio, "entidad": entidad},
    }).done(function (data) {

        switch (data) {
            case 'error':
                notify("danger", "ok", "Usuario:", "Se registro un error, comuníquese con la mesa de ayuda soporte.convocatorias@scrd.gov.co");
                break;
            case 'error_metodo':
                notify("danger", "ok", "Usuario:", "Se registro un error en el método, comuníquese con la mesa de ayuda soporte.convocatorias@scrd.gov.co");
                break;
            case 'error_token':
                location.href = url_pv_admin + 'index.html?msg=Su sesión ha expirado, por favor vuelva a ingresar.&msg_tipo=danger';
                //notify("danger", "error_token", "URL:", "PropuestasEvaluacion/select_convocatorias");
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
        url: url_pv + 'Deliberacion/select_categorias',
        data: {"token": token_actual.token, "convocatoria": convocatoria},
    }).done(function (data) {

        switch (data) {
            case 'error':
                notify("danger", "ok", "Usuario:", "Se registro un error, comuníquese con la mesa de ayuda soporte.convocatorias@scrd.gov.co");
                break;
            case 'error_metodo':
                notify("danger", "ok", "Usuario:", "Se registro un error en el método, comuníquese con la mesa de ayuda soporte.convocatorias@scrd.gov.co");
                break;
            case 'error_token':
                location.href = url_pv_admin + 'index.html?msg=Su sesión ha expirado, por favor vuelva a ingresar.&msg_tipo=danger';
                //notify("danger", "error_token", "URL:", "PropuestasEvaluacion/select_categorias");
                break;
            case 'acceso_denegado':
                notify("danger", "remove", "Usuario:", "No tiene permisos acceder a la información.");
                break;
            default:
                var json = JSON.parse(data);

                $('#categorias').find('option').remove();
                $("#categorias").append('<option value="">:: Seleccionar ::</option>');

                if (json != null && json.length > 0) {
                    $("#categorias").removeAttr('disabled');

                    //Cargos el select de areasconocimientos
                    $.each(json, function (key, array) {
                        $("#categorias").append('<option value="' + array.id + '" >' + array.nombre + '</option>');
                    });

                }

                break;
        }

    }
    );
}

function cargar_select_rondas(token_actual, convocatoria) {

    $.ajax({
        type: 'GET',
        url: url_pv + 'Rondas/select_rondas',
        data: {"token": token_actual.token, "convocatoria": convocatoria},
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
                //notify("danger", "error_token", "URL:", "Rondas/select_rondas");
                break;
            case 'acceso_denegado':
                notify("danger", "remove", "Usuario:", "No tiene permisos acceder a la información.");
                break;
            default:

                var json = JSON.parse(data);

                $('#rondas').find('option').remove();
                $("#rondas").append('<option value="">:: Seleccionar ::</option>');
                //$('#rondas').hide();

                if (json != null && json.length > 0) {
                    //Cargos el select de areasconocimientos
                    //$('#rondas').show();
                    $.each(json, function (key, array) {
                        $("#rondas").append('<option value="' + array.id + '" >' + array.nombre + '</option>');
                    });
                }

                break;
        }

    }
    );
}

function cargar_tabla(token_actual) {

    /*
     * 06-06-2020
     * Wilmer Gustavo Mogollón Duque
     * Se agrega el botón top_general al show
     */

    $("#notificacion_periodo").hide();
    

    //Muestro los botones
    $("#deliberar").show();
    $("#confirmar_top_general").show().slow;
    $("#top_general").show().slow;
    $("#anular_deliberacion").show().slow;
    $("#genera_acta").show().slow;
    $("#asignar_estimulo").show().slow;

    

    //var data = JSON.stringify( $("#formulario_busqueda_banco").serializeArray() );
    //var data =  $("#formulario_busqueda_banco").serializeArray();
    //var data =  ( $('#filtro').val() == 'true' ? $("#formulario_busqueda_banco").serializeArray() : null)

    //establece los valores de la tabla
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
            url: url_pv + "Deliberacion/all_propuestas",
            data:
                    {"token": token_actual.token,
                        "ronda": $('#rondas').val()
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
            /*
             
             if ( data["aplica_perfil"] ){
             $('td', row).css('background-color', '#dcf4dc');
             }
             else if ( !data["aplica_perfil"]){
             $('td', row).css('background-color', '#f4dcdc');
             }
             */
        },
        "columns": [
            {"data": "Código de la propuesta",
                render: function (data, type, row) {
                    return row.codigo;
                },
            },
            {"data": "Nombre de la propuesta",
                render: function (data, type, row) {
                    return row.nombre;
                },
            },
            {"data": "Top general",
                render: function (data, type, row) {
                    return row.promedio;
                },
            },
            /*{"data": "Estado de la evaluación",
             render: function ( data, type, row ) {
             return row.estado_evaluacion;
             },
             },*/


            /*{"data": "Seleccionar",
             render: function ( data, type, row ) {
             return ' <input title=\"'+row.id+'\" type=\"checkbox\" class=\"check_activar_'+row.active+'  activar_registro" '+(row.active? 'checked ':'')+' />';
             },
             },*/
            {"data": "aciones",
                render: function (data, type, row) {
                    return '<button id="' + row.id + '" title="Ver evaluación" type="button" class="btn btn-warning btn_ver" data-toggle="modal" data-target="#evaluarModal" id_propuesta="' + row.id + '" top_general="' + row.promedio + '">'
                            + '<span class="glyphicon glyphicon-eye-open"></span></button>';

                },
            }



        ]
    });


}

function acciones_registro(token_actual) {

    $(".btn_ver").click(function () {

        cargar_info_basica(token_actual, $(this).attr("id_propuesta"));
        cargar_evaluaciones(token_actual, $(this).attr("id_propuesta"));
        $("#table_evaluaciones_top_general").html($(this).attr("top_general"));

    });


    /*
     * Se incorpora para cargar el formulario del estímulo
     */

    $(".btn_asignar_estimulo").click(function () {


        var id_propuesta = $(this).attr("id_propuesta");


        $.ajax({
            type: 'GET',
            url: url_pv + 'PropuestasEvaluacion/propuestas/' + id_propuesta,
            data: {"token": token_actual.token},
        }).done(function (data) {

            switch (data) {
                case 'error':
                    notify("danger", "ok", "Usuario:", "Se registro un error, comuníquese con la mesa de ayuda soporte.convocatorias@scrd.gov.co");
                    break;
                case 'error_metodo':
                    notify("danger", "ok", "Usuario:", "Se registro un error en el método, comuníquese con la mesa de ayuda soporte.convocatorias@scrd.gov.co");
                    break;
                case 'error_token':
                    location.href = url_pv_admin + 'index.html?msg=Su sesión ha expirado, por favor vuelva a ingresar.&msg_tipo=danger';
                    //notify("danger", "error_token", "URL:", "PropuestasEvaluacion/propuestas/"+id_propuesta);
                    break;
                case 'acceso_denegado':
                    notify("danger", "remove", "Usuario:", "No tiene permisos acceder a la información.");
                    break;
                default:

                    var json = JSON.parse(data);


                    if (json.propuesta) {
                        $("#monto_asignado").attr("value", json.propuesta.monto_asignado);
                        $("#id_propuesta").attr("value", json.propuesta.id);
                    }




                    break;

            }

        }
        );


    });

    $(".btn_confirmar").click(function () {

        confirmar_evaluacion(token_actual, $(this).attr("id"));

    });


    $(".btn_notificar").click(function () {
        cargar_info_impedimento(token_actual, $(this).attr("id"));
        $("#id_evaluacion").val($(this).attr("id"));
    });


}

function cargar_info_basica(token_actual, id_propuesta) {

    $("#codigo_propuesta").html("");
    $("#nombre_propuesta").html("");
    $("#resumen_propuesta").html("");
    $("#objetivo_propuesta").html("");
    $("#bogota_propuesta").html("");

    $.ajax({
        type: 'GET',
        url: url_pv + 'PropuestasEvaluacion/propuestas/' + id_propuesta,
        data: {"token": token_actual.token},
    }).done(function (data) {

        switch (data) {
            case 'error':
                notify("danger", "ok", "Usuario:", "Se registro un error, comuníquese con la mesa de ayuda soporte.convocatorias@scrd.gov.co");
                break;
            case 'error_metodo':
                notify("danger", "ok", "Usuario:", "Se registro un error en el método, comuníquese con la mesa de ayuda soporte.convocatorias@scrd.gov.co");
                break;
            case 'error_token':
                location.href = url_pv_admin + 'index.html?msg=Su sesión ha expirado, por favor vuelva a ingresar.&msg_tipo=danger';
                //notify("danger", "error_token", "URL:", "PropuestasEvaluacion/propuestas/"+id_propuesta);
                break;
            case 'acceso_denegado':
                notify("danger", "remove", "Usuario:", "No tiene permisos acceder a la información.");
                break;
            default:

                var json = JSON.parse(data);


                //informacion básica de la propuesta
                if (json.propuesta) {
                    $("#codigo_propuesta").html(json.propuesta.codigo);
                    $("#nombre_propuesta").html(json.propuesta.nombre);
                    $("#resumen_propuesta").html(json.propuesta.resumen);
                    $("#objetivo_propuesta").html(json.propuesta.objetivo);
                    $("#bogota_propuesta").html((json.propuesta.objetivo) ? "Si" : "No");
                }

                //información extra(parametros) de la apropuesta
                if (json.parametros) {

                    var parametros = '';

                    $.each(json.parametros, function (k, a) {

                        parametros = parametros + '<div class="col-lg-6">'
                                + '<h5><b>' + a.nombre_parametro + '</b></h5>'
                                + '<span>' + a.valor_parametro + '</span>'
                                + '</div>';
                    });

                    $("#parametros_propuesta").html(parametros);
                }

                //Documentos técnicos

                if (json.documentos) {
                    var items = '';

                    $.each(json.documentos, function (k, a) {

                        items = items + '<tr>'
                                + '<td>' + a.nombre + '</td>'
                                + '<td>' + a.descripcion_requisito + '</td>'
                                + '<td>' + a.requisito + '</td>'
                                + '<td>'
                                + '<button id = "' + a.id_alfresco + '" title="' + (a.id_alfresco == null ? "No se ha cargado archivo" : "Descargar archivo") + '" type="button" class="btn btn-primary download_file">'
                                + (a.id_alfresco == null ? '<span class="glyphicon glyphicon-ban-circle" title="No se ha cargado archivo"></span>' : '<span class="glyphicon glyphicon-download-alt"></span>')
                                + '</button>'
                                + '</td>'
                                + '</tr>';
                    });

                    $("#archivos_table").html(items);
                }

                if (json.links) {
                    var items = '';
                    $.each(json.links, function (k, a) {
                        items = items + '<tr>'
                                + '<td>' + a.nombre + '</td>'
                                + '<td>' + a.descripcion_requisito + '</td>'
                                + '<td>' + a.requisito + '</td>'
                                + '<td>'
                                + '<a href="' + a.nombre + '" target="_blank" class="btn btn-primary" role="button" title="Abrir enlace"><span class="fa fa-link "></span></a>'
                                + '</td>'
                                + '</tr>';
                    });
                    $("#links_table").html(items);
                }

                //desarcar archivo
                $(".download_file").click(function () {
                    //Cargo el id file
                    var cod = $(this).attr('id');

                    $.AjaxDownloader({
                        url: url_pv + 'PropuestasEvaluacion/download_file/',
                        data: {
                            cod: cod,
                            token: token_actual.token
                        }
                    });

                });

                break;
        }

    }
    );
}

//carga la información de las evaluaciones realizadas a la propuesta
function cargar_evaluaciones(token_actual, id_propuesta) {

    $.ajax({
        type: 'GET',
        url: url_pv + 'Deliberacion/all_evaluaciones/propuesta/' + id_propuesta,
        data: {"token": token_actual.token,
            "ronda": $('#rondas').val()
        },
    }).done(function (data) {

        switch (data) {
            case 'error':
                notify("danger", "ok", "Usuario:", "Se registro un error, comuníquese con la mesa de ayuda soporte.convocatorias@scrd.gov.co");
                break;
            case 'error_metodo':
                notify("danger", "ok", "Usuario:", "Se registro un error en el método, comuníquese con la mesa de ayuda soporte.convocatorias@scrd.gov.co");
                break;
            case 'error_token':
                location.href = url_pv_admin + 'index.html?msg=Su sesión ha expirado, por favor vuelva a ingresar.&msg_tipo=danger';
                //notify("danger", "error_token", "URL:", "PropuestasEvaluacion/propuestas/"+id_propuesta);
                break;
            case 'acceso_denegado':
                notify("danger", "remove", "Usuario:", "No tiene permisos acceder a la información.");
                break;
            default:

                var json = JSON.parse(data);

                var parametros = '';
                $("#table_evaluaciones_body").html(parametros);

                $.each(json, function (k, a) {

                    parametros = parametros + '<tr>'
                            + '<td>' + a.jurado_codigo + '</td>'
                            + '<td>' + a.jurado_nombre + '</td>'
                            + '<td>' + a.evaluacion_total + '</td>'
                            + '<td>' + a.evaluacion_estado + '</td>'
                            + '</tr>';
                });

                $("#table_evaluaciones_body").append(parametros);

                break;
        }

    }
    );

}

function deliberar(token_actual, id_ronda) {


    $.ajax({
        type: 'POST',
        url: url_pv + 'Deliberacion/deliberar/ronda/' + id_ronda,
        data: "&modulo=Deliberación&token=" + token_actual.token

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
                notify("danger", "remove", "Usuario:", "No tiene permisos para editar información.");
                break;
            case 'deshabilitado':
                notify("danger", "remove", "Usuario:", "No tiene permisos para editar información.");
                break;
            case 'error_validacion':
                notify("danger", "remove", "Usuario:", "Tiene evaluaciones sin confirmar");
                break;
            case 'error_ronda':
                notify("danger", "remove", "Usuario:", "Error al actualizar la ronda");
                break;
            case 'exito':
                notify("success", "remove", "Usuario:", "Se ha enviado esta ronda a deliberar");
                break;
            case 'deliberacion':
                notify("success", "remove", "Usuario:", "Esta ronda ya se encuentra en deliberación");
                break;

        }

    });

}

function cargar_info_top_general(token_actual, id_ronda) {
    var id_convocatoria;
    $("#fieldset_top_general").removeAttr("disabled");

    //se verifica que las evaluaciones esten confirmadas
    $.ajax({
        type: 'GET',
        url: url_pv + 'Deliberacion/validar_confirmacion/ronda/' + id_ronda,
        data: {"token": token_actual.token},
    }).done(function (data) {

        switch (data) {
            case 'error':
                notify("danger", "ok", "Usuario:", "Se registro un error, comuníquese con la mesa de ayuda soporte.convocatorias@scrd.gov.co");
                break;
            case 'error_metodo':
                notify("danger", "ok", "Usuario:", "Se registro un error en el método, comuníquese con la mesa de ayuda soporte.convocatorias@scrd.gov.co");
                break;
            case 'error_token':
                location.href = url_pv_admin + 'index.html?msg=Su sesión ha expirado, por favor vuelva a ingresar.&msg_tipo=danger';
                //notify("danger", "error_token", "URL:", "PropuestasEvaluacion/propuestas/"+id_propuesta);
                break;
            case 'acceso_denegado':
                notify("danger", "remove", "Usuario:", "No tiene permisos acceder a la información.");
                break;
            case 'error_confirmacion':
                notify("danger", "remove", "Usuario:", "Hay evaluaciones sin confirmar.");
                break;
            case 'error_deliberacion':
                notify("danger", "remove", "Usuario:", "Recuerde que es necesario enviar a deliberar.");
                break;
            case 'exito':

                $("#top_generalModal").modal('show');

                //Información de la ronda y la convocatoria
                $.ajax({
                    type: 'GET',
                    url: url_pv + 'Rondas/search/' + id_ronda,
                    data: {"token": token_actual.token},
                }).done(function (data) {

                    switch (data) {
                        case 'error':
                            notify("danger", "ok", "Usuario:", "Se registro un error, comuníquese con la mesa de ayuda soporte.convocatorias@scrd.gov.co");
                            break;
                        case 'error_metodo':
                            notify("danger", "ok", "Usuario:", "Se registro un error en el método, comuníquese con la mesa de ayuda soporte.convocatorias@scrd.gov.co");
                            break;
                        case 'error_token':
                            location.href = url_pv_admin + 'index.html?msg=Su sesión ha expirado, por favor vuelva a ingresar.&msg_tipo=danger';
                            //notify("danger", "error_token", "URL:", "PropuestasEvaluacion/propuestas/"+id_propuesta);
                            break;
                        case 'acceso_denegado':
                            notify("danger", "remove", "Usuario:", "No tiene permisos acceder a la información.");
                            break;
                        default:

                            var json = JSON.parse(data);

                            if (json.id) {

                                if (json.estado == 'Evaluada') {
                                    $("#fieldset_top_general").attr("disabled", "");
                                }

                                $("#nombre_ronda").html(json.nombre_ronda);
                                $("#descripcion_ronda").html(json.descripcion_ronda);
                                $("#fecha_inicio_evaluacion").html(json.fecha_inicio_evaluacion);
                                $("#fecha_fin_evaluacion").html(json.fecha_fin_evaluacion);
                                $("#fecha_deliberacion").html(json.fecha_deliberacion);
                                $("#total_ganadores").val(json.total_ganadores);
                                $("#total_suplentes").val(json.total_suplentes);
                                $("#aspectos").val(json.aspectos);
                                $("#recomendaciones").val(json.recomendaciones);
                                $("#comentarios").val(json.comentarios);

                                id_convocatoria = json.convocatoria;

                                //información de la convocatoria
                                $.ajax({
                                    type: 'GET',
                                    url: url_pv + 'Convocatorias/convocatoria/' + id_convocatoria,
                                    data: {"token": token_actual.token},
                                }).done(function (data) {

                                    switch (data) {
                                        case 'error':
                                            notify("danger", "ok", "Usuario:", "Se registro un error, comuníquese con la mesa de ayuda soporte.convocatorias@scrd.gov.co");
                                            break;
                                        case 'error_metodo':
                                            notify("danger", "ok", "Usuario:", "Se registro un error en el método, comuníquese con la mesa de ayuda soporte.convocatorias@scrd.gov.co");
                                            break;
                                        case 'error_token':
                                            location.href = url_pv_admin + 'index.html?msg=Su sesión ha expirado, por favor vuelva a ingresar.&msg_tipo=danger';
                                            //notify("danger", "error_token", "URL:", "PropuestasEvaluacion/propuestas/"+id_propuesta);
                                            break;
                                        case 'acceso_denegado':
                                            notify("danger", "remove", "Usuario:", "No tiene permisos acceder a la información.");
                                            break;
                                        default:

                                            var json = JSON.parse(data);

                                            if (json.id) {
                                                var categoria = "";

                                                //Si se seleccionó una categoria, se busca el nombre y se concatena con el nombre de la convocatoria
                                                if ($("categorias").val() != undefined && $("categorias").val() != null) {

                                                    //información de la categoria
                                                    $.ajax({
                                                        type: 'GET',
                                                        url: url_pv + 'Convocatorias/categoria/' + $("categorias").val(),
                                                        data: {"token": token_actual.token},
                                                    }).done(function (data) {

                                                        switch (data) {
                                                            case 'error':
                                                                notify("danger", "ok", "Usuario:", "Se registro un error, comuníquese con la mesa de ayuda soporte.convocatorias@scrd.gov.co");
                                                                break;
                                                            case 'error_metodo':
                                                                notify("danger", "ok", "Usuario:", "Se registro un error en el método, comuníquese con la mesa de ayuda soporte.convocatorias@scrd.gov.co");
                                                                break;
                                                            case 'error_token':
                                                                location.href = url_pv_admin + 'index.html?msg=Su sesión ha expirado, por favor vuelva a ingresar.&msg_tipo=danger';
                                                                //notify("danger", "error_token", "URL:", "PropuestasEvaluacion/propuestas/"+id_propuesta);
                                                                break;
                                                            case 'acceso_denegado':
                                                                notify("danger", "remove", "Usuario:", "No tiene permisos acceder a la información.");
                                                                break;
                                                            default:

                                                                var json2 = JSON.parse(data);

                                                                if (json2.id) {
                                                                    categoria = json2.nombre;
                                                                }

                                                        }//fin switch

                                                    });

                                                }

                                                //si existe la categoria se concatena con el nombre de la convocatoria
                                                $("#nombre_convocatoria").html(json.nombre + (categoria != "" ? "-" + categoria : categoria));


                                            }

                                    }//fin switch

                                });

                                cargar_tabla_ganadores(token_actual);
                            }



                    }//fin switch

                });


                break;
        }//fin switch

    });





}

function cargar_tabla_ganadores(token_actual) {

    //establece los valores de la tabla
    $('#table_recomendacion_ganadores').DataTable({
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
            url: url_pv + "Deliberacion/recomendacion_ganadores",
            data:
                    {"token": token_actual.token,
                        "ronda": $('#rondas').val(),
                        "total_ganadores": $('#total_ganadores').val(),
                        "total_suplentes": $('#total_suplentes').val(),
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

            if (data["roll"] === 'ganador') {
                $('td', row).css('background-color', '#dcf4dc');
            } else if (data["roll"] === 'suplente') {
                $('td', row).css('background-color', '#f4dcdc');
            }

        },
        "columns": [
            {"data": "Código de la propuesta",
                render: function (data, type, row) {
                    return row.codigo;
                },
            },
            {"data": "Nombre de la propuesta",
                render: function (data, type, row) {
                    return row.nombre;
                },
            },
            {"data": "Top general",
                render: function (data, type, row) {
                    return row.promedio;
                },
            },
                    /*{"data": "Estado de la evaluación",
                     render: function ( data, type, row ) {
                     return row.estado_evaluacion;
                     },
                     },*/


                    /*{"data": "Seleccionar",
                     render: function ( data, type, row ) {
                     return ' <input title=\"'+row.id+'\" type=\"checkbox\" class=\"check_activar_'+row.active+'  activar_registro" '+(row.active? 'checked ':'')+' />';
                     },
                     },*/
                    /*{"data": "aciones",
                     render: function ( data, type, row ) {
                     return '<button id="'+row.id+'" title="Ver evaluación" type="button" class="btn btn-warning btn_ver" data-toggle="modal" data-target="#evaluarModal" id_propuesta="'+row.id+'" top_general="'+row.promedio+'">'
                     +'<span class="glyphicon glyphicon-eye-open"></span></button>' ;
                     
                     },
                     }*/



        ]
    });


}

function cargar_info_top_general_asignar(token_actual, id_ronda) {
    var id_convocatoria;
    $("#fieldset_top_general").removeAttr("disabled");

    //se verifica que las evaluaciones esten confirmadas
    $.ajax({
        type: 'GET',
        url: url_pv + 'Deliberacion/validar_confirmacion/ronda/' + id_ronda,
        data: {"token": token_actual.token},
    }).done(function (data) {

        switch (data) {
            case 'error':
                notify("danger", "ok", "Usuario:", "Se registro un error, comuníquese con la mesa de ayuda soporte.convocatorias@scrd.gov.co");
                break;
            case 'error_metodo':
                notify("danger", "ok", "Usuario:", "Se registro un error en el método, comuníquese con la mesa de ayuda soporte.convocatorias@scrd.gov.co");
                break;
            case 'error_token':
                location.href = url_pv_admin + 'index.html?msg=Su sesión ha expirado, por favor vuelva a ingresar.&msg_tipo=danger';
                //notify("danger", "error_token", "URL:", "PropuestasEvaluacion/propuestas/"+id_propuesta);
                break;
            case 'acceso_denegado':
                notify("danger", "remove", "Usuario:", "No tiene permisos acceder a la información.");
                break;
            case 'error_confirmacion':
                notify("danger", "remove", "Usuario:", "Hay evaluaciones sin confirmar.");
                break;
            case 'exito':

                $("#asignar_estimulo_Modal").modal('show');

                //Información de la ronda y la convocatoria
                $.ajax({
                    type: 'GET',
                    url: url_pv + 'Rondas/search/' + id_ronda,
                    data: {"token": token_actual.token},
                }).done(function (data) {

                    switch (data) {
                        case 'error':
                            notify("danger", "ok", "Usuario:", "Se registro un error, comuníquese con la mesa de ayuda soporte.convocatorias@scrd.gov.co");
                            break;
                        case 'error_metodo':
                            notify("danger", "ok", "Usuario:", "Se registro un error en el método, comuníquese con la mesa de ayuda soporte.convocatorias@scrd.gov.co");
                            break;
                        case 'error_token':
                            location.href = url_pv_admin + 'index.html?msg=Su sesión ha expirado, por favor vuelva a ingresar.&msg_tipo=danger';
                            //notify("danger", "error_token", "URL:", "PropuestasEvaluacion/propuestas/"+id_propuesta);
                            break;
                        case 'acceso_denegado':
                            notify("danger", "remove", "Usuario:", "No tiene permisos acceder a la información.");
                            break;
                        default:

                            var json = JSON.parse(data);

                            if (json.id) {

//                                if (json.estado == 'Evaluada') {
//                                    $("#fieldset_top_general").attr("disabled", "");
//                                }

                                $("#nombre_ronda").html(json.nombre_ronda);
                                $("#descripcion_ronda").html(json.descripcion_ronda);
                                $("#fecha_inicio_evaluacion").html(json.fecha_inicio_evaluacion);
                                $("#fecha_fin_evaluacion").html(json.fecha_fin_evaluacion);
                                $("#fecha_deliberacion").html(json.fecha_deliberacion);
                                $("#total_ganadores").val(json.total_ganadores);
                                $("#total_suplentes").val(json.total_suplentes);
                                $("#aspectos").val(json.aspectos);
                                $("#recomendaciones").val(json.recomendaciones);
                                $("#comentarios").val(json.comentarios);

                                id_convocatoria = json.convocatoria;

                                //información de la convocatoria
                                $.ajax({
                                    type: 'GET',
                                    url: url_pv + 'Convocatorias/convocatoria/' + id_convocatoria,
                                    data: {"token": token_actual.token},
                                }).done(function (data) {

                                    switch (data) {
                                        case 'error':
                                            notify("danger", "ok", "Usuario:", "Se registro un error, comuníquese con la mesa de ayuda soporte.convocatorias@scrd.gov.co");
                                            break;
                                        case 'error_metodo':
                                            notify("danger", "ok", "Usuario:", "Se registro un error en el método, comuníquese con la mesa de ayuda soporte.convocatorias@scrd.gov.co");
                                            break;
                                        case 'error_token':
                                            location.href = url_pv_admin + 'index.html?msg=Su sesión ha expirado, por favor vuelva a ingresar.&msg_tipo=danger';
                                            //notify("danger", "error_token", "URL:", "PropuestasEvaluacion/propuestas/"+id_propuesta);
                                            break;
                                        case 'acceso_denegado':
                                            notify("danger", "remove", "Usuario:", "No tiene permisos acceder a la información.");
                                            break;
                                        default:

                                            var json = JSON.parse(data);

                                            if (json.id) {
                                                var categoria = "";

                                                //Si se seleccionó una categoria, se busca el nombre y se concatena con el nombre de la convocatoria
                                                if ($("categorias").val() != undefined && $("categorias").val() != null) {

                                                    //información de la categoria
                                                    $.ajax({
                                                        type: 'GET',
                                                        url: url_pv + 'Convocatorias/categoria/' + $("categorias").val(),
                                                        data: {"token": token_actual.token},
                                                    }).done(function (data) {

                                                        switch (data) {
                                                            case 'error':
                                                                notify("danger", "ok", "Usuario:", "Se registro un error, comuníquese con la mesa de ayuda soporte.convocatorias@scrd.gov.co");
                                                                break;
                                                            case 'error_metodo':
                                                                notify("danger", "ok", "Usuario:", "Se registro un error en el método, comuníquese con la mesa de ayuda soporte.convocatorias@scrd.gov.co");
                                                                break;
                                                            case 'error_token':
                                                                location.href = url_pv_admin + 'index.html?msg=Su sesión ha expirado, por favor vuelva a ingresar.&msg_tipo=danger';
                                                                //notify("danger", "error_token", "URL:", "PropuestasEvaluacion/propuestas/"+id_propuesta);
                                                                break;
                                                            case 'acceso_denegado':
                                                                notify("danger", "remove", "Usuario:", "No tiene permisos acceder a la información.");
                                                                break;
                                                            default:

                                                                var json2 = JSON.parse(data);

                                                                if (json2.id) {
                                                                    categoria = json2.nombre;
                                                                }

                                                        }//fin switch

                                                    });

                                                }

                                                //si existe la categoria se concatena con el nombre de la convocatoria
                                                $("#nombre_convocatoria").html(json.nombre + (categoria != "" ? "-" + categoria : categoria));


                                            }

                                    }//fin switch

                                });

                                cargar_tabla_ganadores_asignar(token_actual);
                            }



                    }//fin switch

                });


                break;
        }//fin switch

    });





}

function cargar_tabla_ganadores_asignar(token_actual) {

    //establece los valores de la tabla
    $('#table_recomendacion_ganadores_asignar').DataTable({
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
            url: url_pv + "Deliberacion/recomendacion_ganadores_asignar",
            data:
                    {"token": token_actual.token,
                        "ronda": $('#rondas').val(),
                        "total_ganadores": $('#total_ganadores').val(),
                        "total_suplentes": $('#total_suplentes').val(),
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

            if (data["roll"] === 'ganador') {
                $('td', row).css('background-color', '#dcf4dc');
            } else if (data["roll"] === 'suplente') {
                $('td', row).css('background-color', '#f4dcdc');
            }

        },
        "columns": [
            {"data": "Código de la propuesta",
                render: function (data, type, row) {
                    return row.codigo;
                },
            },
            {"data": "Nombre de la propuesta",
                render: function (data, type, row) {
                    return row.nombre;
                },
            },
            {"data": "Top general",
                render: function (data, type, row) {
                    return row.promedio;
                },
            },
            /*{"data": "Estado de la evaluación",
             render: function ( data, type, row ) {
             return row.estado_evaluacion;
             },
             },*/


            /*{"data": "Seleccionar",
             render: function ( data, type, row ) {
             return ' <input title=\"'+row.id+'\" type=\"checkbox\" class=\"check_activar_'+row.active+'  activar_registro" '+(row.active? 'checked ':'')+' />';
             },
             },*/
            {"data": "aciones",
                render: function (data, type, row) {
                    return '<button id="' + row.id + '" title="Asignar estímulo" type="button" class="btn btn-warning btn_asignar_estimulo" data-toggle="modal" data-target="#asignar_monto" id_propuesta="' + row.id + '">'
                            + '<span class="glyphicon glyphicon-usd"></span></button>';

                },
            }



        ]
    });


}






function confirmar_top_general(token_actual, id_ronda) {

    $.ajax({
        type: 'PUT',
        url: url_pv + 'Deliberacion/confirmar_top_general/ronda/' + id_ronda,
        data: "&modulo=Deliberación&token=" + token_actual.token
                + "&total_ganadores=" + $('#total_ganadores').val()
                + "&total_suplentes=" + $('#total_suplentes').val()
                + "&aspectos=" + $('#aspectos').val()
                + "&recomendaciones=" + $('#recomendaciones').val()
                + "&comentarios=" + $('#comentarios').val()

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
                notify("danger", "remove", "Usuario:", "No tiene permisos para editar información.");
                break;
            case 'deshabilitado':
                notify("danger", "remove", "Usuario:", "No tiene permisos para editar información.");
                break;
            case 'error_validacion':
                notify("danger", "remove", "Usuario:", "Tiene evaluaciones sin confirmar");
                break;
            default:
                notify("success", "ok", "Usuario:", "Se confirmó con éxito.");
                //$(".criterios").attr('disabled','');
                cargar_tabla_ganadores(token_actual);
                break;
        }

    });


}

/*
 * 12-06-2020
 * Wilmer Gustavo Mogollón Duque
 * Se incorpora la función confirmar_top_general, para llamar al controlador que genera el acta de deliberación
 */


function generar_acta_preseleccionados(token_actual, id_ronda) {

    window.open(url_pv + "FormatosDoc/acta_recomendacion_preseleccionados/ronda/" + id_ronda, "_blank");

}

function declarar_convocatoria_desierta(token_actual, id_ronda) {

    $.ajax({
        type: 'PUT',
        url: url_pv + 'Deliberacion/declarar_desierta_convocatoria/ronda/' + id_ronda,
        data: "&modulo=Deliberación&token=" + token_actual.token
                + "&total_ganadores=" + $('#total_ganadores').val()
                + "&total_suplentes=" + $('#total_suplentes').val()
                + "&aspectos=" + $('#aspectos').val()
                + "&recomendaciones=" + $('#recomendaciones').val()
                + "&comentarios=" + $('#comentarios').val()

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
                notify("danger", "remove", "Usuario:", "No tiene permisos para editar información.");
                break;
            case 'deshabilitado':
                notify("danger", "remove", "Usuario:", "No tiene permisos para editar información.");
                break;
            case 'error_validacion':
                notify("danger", "remove", "Usuario:", "Tiene evaluaciones sin confirmar");
                break;
            default:
                notify("success", "ok", "Usuario:", "Se actualizó con éxito.");
                //$(".criterios").attr('disabled','');
                //cargar_tabla_ganadores(token_actual);
                break;
        }

    });


}

/*
 * 15-06-2020
 * Wilmer Gustavo Mogollón Duque
 * Se incorpora la función asignar_monto
 */

function asignar_monto(token_actual, id_propuesta, monto_asignado) {


    $.ajax({
        type: 'PUT',
        url: url_pv + 'Deliberacion/asignar_monto/propuesta/' + id_propuesta,
        data: "&modulo=Deliberación&token=" + token_actual.token + "&monto_asignado=" + monto_asignado

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
                notify("danger", "remove", "Usuario:", "No tiene permisos para editar información.");
                break;
            case 'deshabilitado':
                notify("danger", "remove", "Usuario:", "No tiene permisos para editar información.");
                break;
            case 'error_validacion':
                notify("danger", "remove", "Usuario:", "Tiene evaluaciones sin confirmar");
                break;
            default:
                notify("success", "ok", "Usuario:", "Se actualizó con éxito.");
                //$(".criterios").attr('disabled','');
                //cargar_tabla_ganadores(token_actual);
                break;
        }

    });


}
/*
 * 22-06-2020
 * Wilmer Gustavo Mogollón Duque
 * Se agrega función anular_deliberacion 
 */
function anular_deliberacion(token_actual, id_ronda) {


    $.ajax({
        type: 'PUT',
        url: url_pv + 'Deliberacion/anular_deliberacion/ronda/' + id_ronda,
        data: "&modulo=Deliberación&token=" + token_actual.token

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
                notify("danger", "remove", "Usuario:", "No tiene permisos para editar información.");
                break;
            case 'confirmo_top':
                notify("danger", "remove", "Usuario:", "No tiene permisos para anular la deliberación porque yá confirmó el top general.");
                break;
            case 'deshabilitado':
                notify("danger", "remove", "Usuario:", "No tiene permisos para editar información.");
                break;
            case 'error_validacion':
                notify("danger", "remove", "Usuario:", "Tiene evaluaciones sin confirmar");
                break;
            default:
                notify("success", "ok", "Usuario:", "Se anuló la deliberación con éxito.");
                //$(".criterios").attr('disabled','');
                //cargar_tabla_ganadores(token_actual);
                break;
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
            anio: {
                validators: {
                    notEmpty: {message: 'El año es requerido'}
                }
            },
            entidad: {
                validators: {
                    notEmpty: {message: 'El nombre de la entidad es requerido'}
                }
            },
            convocatorias: {
                validators: {
                    notEmpty: {message: 'El nombre de la convocatoria es requerido'}
                }
            },
            categorias: {
                validators: {
                    notEmpty: {message: 'El nombre de la categoría es requerido'}
                }
            },
            rondas: {
                validators: {
                    notEmpty: {message: 'El nombre de la ronda es requerido'}
                }
            }
        }
    });
}
