$(document).ready(function () {




    //Verifico si el token exite en el cliente y verifico que el token este activo en el servidor
    var token_actual = getLocalStorage(name_local_storage);
    $("#notificacion_periodo").hide();
    $("#confirmar_top").hide();

    //Verifico si el token esta vacio, para enviarlo a que ingrese de nuevo
    if ($.isEmptyObject(token_actual)) {
        location.href = url_pv_admin + 'index.html?msg=Su sesión ha expirado, por favor vuelva a ingresar.&msg_tipo=danger';
    } else
    {
        //Verifica si el token actual tiene acceso de lectura
        permiso_lectura(token_actual, "Evaluación de propuestas");
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


        //Carga el select de estados
        $.ajax({
            type: 'GET',
            data: {"token": token_actual.token,
                "tipo_estado": "propuestas_evaluacion"
            },
            url: url_pv + 'PropuestasEvaluacion/select_estado/',
            success: function (data) {

                switch (data) {
                    case 'error':
                        notify("danger", "ok", "Convocatorias:", "Se registro un error, comuníquese con la mesa de ayuda soporte.convocatorias@scrd.gov.co");
                        break;
                    case 'error_metodo':
                        notify("danger", "ok", "Se registro un error en el método, comuníquese con la mesa de ayuda soporte.convocatorias@scrd.gov.co");
                        break;
                    case 'error_token':
                        location.href = url_pv_admin + 'index.html?msg=Su sesión ha expirado, por favor vuelva a ingresar.&msg_tipo=danger';
                        //notify("danger", "error_token", "URL:", "PropuestasEvaluacion/select_estado/");
                        break;
                    case 'acceso_denegado':
                        notify("danger", "remove", "Usuario:", "No tiene permisos acceder a la información.");
                        break;
                    default:
                        json_estados = JSON.parse(data);

                        $('#estados').find('option').remove();
                        $("#estados").append('<option value="">:: Seleccionar ::</option>');
                        if (json_estados.length > 0) {
                            $.each(json_estados, function (key, estado) {
                                $("#estados").append('<option value="' + estado.id + '" >' + estado.nombre + '</option>');
                            });
                        }

                        break;
                }

            }
        });
        //fin Carga el select de estados


        //carga la tabla con los criterios de busqueda
        $('#buscar').click(function () {
            if ($('#rondas').val() === "") {
                alert("Debe seleccionar la ronda de evaluación");
            } else {
                $('#resultado').focus();
                cargar_tabla(token_actual);
            }


        });

        //validador formulario Notificación de impedimento
        $('.impedimentoForm').bootstrapValidator({

            feedbackIcons: {
                valid: 'glyphicon glyphicon-ok',
                invalid: 'glyphicon glyphicon-remove',
                validating: 'glyphicon glyphicon-refresh'
            },
            fields: {
                'observacion_impedimento': {
                    validators: {
                        notEmpty: {
                            message: 'Debe escribir el motivo por el cual se declara impedido'
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

            // Use Ajax to submit form data
            declarar_impedimento(token_actual, $("#id_evaluacion").val());

            $form.bootstrapValidator('disableSubmitButtons', false).bootstrapValidator('resetForm', true);
            //$form.bootstrapValidator('destroy', true);
            bv.resetForm();

            $("#impedimentoModal").modal("hide");
        });


        $("#confirmar_top").click(function () {
            confirmar_top_individual(token_actual, $('#rondas').val());
        });

        /*
         * 10-06-2020
         * Wilmer Gustavo Mogollón Duque
         * Se agrega acción a botón confirmar_top_deliberacion para confirmar top individual en deliberación,
         * esto con el fin de no tener que confirmar evaluación por evaluación
         */

        //deliberar
        $("#confirmar_top_deliberacion").click(function () {

            $("#mensaject").show();
            $("#bcancelarct").show();
            $("#baceptarct").show();

        });

        $("#baceptarct").click(function () {
            confirmar_top_individual_deliberacion(token_actual, $('#rondas').val());
            $('#confirmar_top_individual_modal').modal('hide');
        });


    }

});


function cargar_select_convocatorias(token_actual, anio, entidad) {


    $.ajax({
        type: 'GET',
        url: url_pv + 'PropuestasEvaluacion/select_convocatorias',
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
        url: url_pv + 'PropuestasEvaluacion/select_categorias',
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

    $("#notificacion_periodo").hide();
    //var data = JSON.stringify( $("#formulario_busqueda_banco").serializeArray() );
    //var data =  $("#formulario_busqueda_banco").serializeArray();
    //var data =  ( $('#filtro').val() == 'true' ? $("#formulario_busqueda_banco").serializeArray() : null)

    //Se verifica si el usuario pertenece a un grupo de evaluación de la ronda
    $.ajax({
        type: 'GET',
        url: url_pv + 'Gruposevaluacion/evaluador/ronda/' + $('#rondas').val(),
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
                //notify("danger", "error_token", "URL:", "Rondas/search/");
                break;
            case 'acceso_denegado':
                notify("danger", "remove", "Usuario:", "No tiene permisos acceder a la información.");
                break;
            case 'error_suplente':
                notify("danger", "remove", "Usuario:", "Su rol es de jurado suplente, por lo tanto no puede evaluar propuestas");
                break;
            default:

                var json = JSON.parse(data);
                console.log(json);
                if (json.id) {

                    if ((json.active !== null) && json.active) {
                        //Establecer los valores del perdiodo de la evaluación
                        $.ajax({
                            type: 'GET',
                            url: url_pv + 'Rondas/search_estado_grupo_evaluador_ronda/' + $('#rondas').val(),
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
                                    //notify("danger", "error_token", "URL:", "Rondas/search/");
                                    break;
                                case 'acceso_denegado':
                                    notify("danger", "remove", "Usuario:", "No tiene permisos acceder a la información.");
                                    break;
                                default:

                                    var json = JSON.parse(data);

                                    if (json.estado === 'En deliberación') {
                                        $("#notificacion_periodo").html('Ronda en deliberación.');
                                        /*
                                         * 10-06-2020 
                                         * Wilmer Gustavo Mogollón Duque
                                         * Se agrega botón confirmar_top_deliberacion para confirmar top en deliberación
                                         */
                                        $("#confirmar_top_deliberacion").show();

                                    }

                                    if (json.estado === 'Habilitada') {


                                        $.ajax({
                                            type: 'GET',
                                            url: url_pv + 'Rondas/search/' + $('#rondas').val(),
                                            data: {"token": token_actual.token},
                                        }).done(function (data) {
                                            switch (data) {
                                                default:

                                                    var json = JSON.parse(data);

                                                    $("#fecha_inicio_evaluacion").html(json.fecha_inicio_evaluacion.substr(0, 10));
                                                    $("#fecha_fin_evaluacion").html(json.fecha_fin_evaluacion.substr(0, 10));


                                                    //tiempo restante
                                                    var inicio = new Date();
                                                    var fin = new Date(json.fecha_fin_evaluacion.substr(0, 10) + " 23:59:59");
                                                    var x = new Date(fin.getDate() - inicio.getDate());

                                                    var dias = (fin.getTime() - inicio.getTime()) / 86400000;
                                                    var horas = ((fin.getTime() - inicio.getTime()) % 86400000) / 3600000;
                                                    var minutos = (((fin.getTime() - inicio.getTime()) % 86400000) % 3600000) / 60000;


                                                    if (dias >= 0) {

                                                        $("#notificacion_periodo").html('El periodo de evaluación es de ' + json.fecha_inicio_evaluacion.substr(0, 10)
                                                                + ' al ' + json.fecha_fin_evaluacion.substr(0, 10) + '.'
                                                                + ' Le quedan ' + Math.trunc(dias) + ' días, '
                                                                + Math.trunc(horas) + ' horas y '
                                                                + Math.trunc(minutos) + ' minutos para evaluar.');

                                                        /*
                                                         * 10-06-2020 
                                                         * Wilmer Gustavo Mogollón Duque
                                                         * Se agrega botón confirmar_top para confirmar top en evaluación
                                                         */
                                                        $("#confirmar_top").show();

                                                    } else {
                                                        $("#notificacion_periodo").html('El periodo de evaluación ya terminó, por lo tanto no puede evaluar las propuestas.');
                                                    }

                                                    break;
                                            }
                                        }
                                        );



                                    }


                                    if (json.estado === 'Evaluada') {
                                        $("#notificacion_periodo").html('La ronda está evaluada.');
                                    }


                                    /*
                                     * 10-06-2020
                                     * Wilmer Gustavo Mogollón Duque
                                     * Acá solo se muestra el div de información de la ronda, el botón de confirmar 
                                     * top solo aparecerá en los casos que la ronda esté habilitada
                                     * o en deliberación
                                     */

                                    $("#notificacion_periodo").show();


                                    break;
                            }

                        }
                        );

                        //establece los valores de la tabla
                        $('#table_list').DataTable({
                            "language": {
                                "url": "../../dist/libraries/datatables/js/spanish.json"
                            },
                            "processing": true,
                            "destroy": true,
                            "serverSide": true,
                            "lengthMenu": [200], //Para que se listen todos en una sola vista
                            "responsive": true,
                            "searching": false,
                            "ajax": {
                                url: url_pv + "PropuestasEvaluacion/all_propuestas",
                                data:
                                        {"token": token_actual.token,
                                            "ronda": $('#rondas').val(),
                                            "estado": $('#estados').val(),
                                            "codigo": $('#codigo').val()
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
                                        return row.codigo_propuesta;
                                    },
                                },
                                {"data": "Nombre de la propuesta",
                                    render: function (data, type, row) {
                                        return row.nombre_propuesta;
                                    },
                                },
                                {"data": "Total de la evaluación",
                                    render: function (data, type, row) {
                                        return row.total_evaluacion;
                                    },
                                },
                                {"data": "Estado de la evaluación",
                                    render: function (data, type, row) {
                                        return row.estado_evaluacion;
                                    },
                                },

                                /*{"data": "Seleccionar",
                                 render: function ( data, type, row ) {
                                 return ' <input title=\"'+row.id+'\" type=\"checkbox\" class=\"check_activar_'+row.active+'  activar_registro" '+(row.active? 'checked ':'')+' />';
                                 },
                                 },*/
                                {"data": "aciones",
                                    render: function (data, type, row) {
                                        return '<button id="' + row.id_evaluacion + '" title="Evaluar propuesta" type="button" class="btn btn-primary btn_evaluar" data-toggle="modal" data-target="#evaluarModal" id_propuesta="' + row.id_propuesta + '">'
                                                + '<span class="glyphicon glyphicon-check"></span></button>'
//                                                + '<button id="' + row.id_evaluacion + '" title="Confirmar evaluación" type="button" class="btn btn-success btn_confirmar"  data-toggle="modal" data-target="#confirma_eval">'
                                                + '<button id="' + row.id_evaluacion + '" title="Confirmar evaluación" type="button" class="btn btn-success btn_confirmar">'
                                                + '<span class="glyphicon glyphicon-ok"></span></button>'
                                                + '<button id="' + row.id_evaluacion + '" title="Declararse impedido" type="button" class="btn btn-warning btn_notificar" data-toggle="modal" data-target="#impedimentoModal" >'
                                                + '<span class="fa fa-eye-slash"></span></button>';

                                    },
                                }



                            ]
                        });


                    } else {
                        $('#table_list').DataTable({
                            "language": {
                                "url": "../../dist/libraries/datatables/js/spanish.json"
                            },
                            "lengthMenu": [10, 15, 20],
                            "responsive": true,
                            "searching": false,
                            "data": {}
                        });

                        notify("danger", "remove", "Usuario:", "No tiene perfil de evaluador para la ronda seleccionada.");
                    }

                }

                if (!json) {

                    $('#table_list').DataTable({
                        "language": {
                            "url": "../../dist/libraries/datatables/js/spanish.json"
                        },
                        "lengthMenu": [10, 15, 20],
                        "responsive": true,
                        "searching": false,
                        "data": {}
                    });

                    notify("danger", "remove", "Usuario:", "No tiene perfil de evaluador para la ronda seleccionada.");
                }


                break;

        }

    });







}

function acciones_registro(token_actual) {

    $(".btn_evaluar").click(function () {

        // $(".form_grupo_editar").bootstrapValidator('destroy', true);
        // cargar_select_rondas_editar(token_actual, $('#convocatorias').val(), $(this).attr("id") );
        // cargar_grupo(token_actual, $(this).attr("id") );
        //cargar_tabla_jurados_aceptaron_editar(token_actual, $(this).attr("id") );
//        cargar_info_basica(token_actual, $(this).attr("id_propuesta"));
        cargar_info_basica(token_actual, $(this).attr("id_propuesta"), $(this).attr("id"));
        cargar_criterios_evaluacion(token_actual, $(this).attr("id"));
        $("#id_evaluacion").val($(this).attr("id"));

    });



//    //confirmar
//    $(".baceptar_eval").click(function () {
//
//        $("#mensaje_eval").show();
//        $("#bcancelar_eval").show();
//        $("#baceptar_eval").show();
//
//    });

    $(".btn_confirmar").click(function () {

        confirmar_evaluacion(token_actual, $(this).attr("id"));
//        $('#confirma_eval').modal('toggle');

    });


    $(".btn_notificar").click(function () {
        cargar_info_impedimento(token_actual, $(this).attr("id"));
        $("#id_evaluacion").val($(this).attr("id"));
    });


}

function cargar_info_basica(token_actual, id_propuesta, id_evaluacion) {

    $("#codigo_propuesta").html("");
    $("#nombre_propuesta").html("");
    $("#resumen_propuesta").html("");
    $("#objetivo_propuesta").html("");
    $("#bogota_propuesta").html("");

    $.ajax({
        type: 'GET',
        url: url_pv + 'PropuestasEvaluacion/propuestas/' + id_propuesta,
        data: {"token": token_actual.token, "evaluacion": id_evaluacion}, //14-09-2020 --- se incorpora el id de la ronda
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

//carga información de los criterios de evaluacion de las rondas
function cargar_criterios_evaluacion(token_actual, id_evaluacion) {
    $("#form_criterios").empty();
    $(".btn_guardar_evaluacion").empty();
    //$("input[name=option_aplica_perfil][value=true]").removeAttr('checked');
    //$("input[name=option_aplica_perfil][value=false]").removeAttr('checked');
    //$(".guardar_aplica_perfil").removeClass( "disabled" );
    //$("#form_aplica_perfil").trigger("reset");
    //Cargar datos en la tabla actual
    $.ajax({
        type: 'GET',
        url: url_pv + 'PropuestasEvaluacion/evaluacionpropuestas/' + id_evaluacion,
        data: "&token=" + token_actual.token

    }).done(function (data) {

        switch (data) {
            case 'Si':
                notify("info", "ok", "Usuario:", "Se activó el registro con éxito.");
                break;
            case 'No':
                notify("info", "ok", "Usuario:", "Se desactivó el registro con éxito.");
                break;
            case 'error':
                notify("danger", "ok", "Usuario:", "Se registro un error, comuníquese con la mesa de ayuda soporte.convocatorias@scrd.gov.co");
                break;
            case 'error_token':
                location.href = url_pv_admin + 'index.html?msg=Su sesión ha expirado, por favor vuelva a ingresar.&msg_tipo=danger';
                //notify("danger", "error_token", "URL:", 'PropuestasEvaluacion/evaluacionpropuestas/'+id_evaluacion);
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

                    //grupo
                    //$("#form_criterios").append('<fieldset class="criterios" '+( (json[r].evaluacion.estado >= 39 || json[r].ronda.estado >= 41 )? ' disabled="" ': '') +'>');
                    $("#form_criterios").append('<fieldset class="criterios" ' + ((json[r].evaluacion_nombre_estado == 'Evaluada' || json[r].ronda_nombre_estado == 'Evaluada' || json[r].evaluacion_nombre_estado == 'Confirmada') ? ' disabled="" ' : '') + '>');

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
                            select = '<select id="puntuacion_' + a.id + '" name="puntuacion_' + a.id + '" class="form-control ' + r + key + '"'
                                    + (a.exclusivo ? ' onchange=" limpiar( this, ' + r + key + ' ) "' : "")
                                    + ' >'
                                    + '<option value="null">::Sin calificar::</option>';

                            for (i = a.puntaje_minimo; i <= a.puntaje_maximo; i++) {
                                select = select + '<option ' + ((a.evaluacion.puntaje == i) ? 'selected' : '') + ' value=' + i + ' >' + i + '</option>';
                            }

                            select = select + '</select>';

                            //Se construye los radio
                            $(".criterios").append('<div class="row">'

                                    + ' <div class="col-lg-4" >'
                                    /*  + ( a.exclusivo ?
                                     '  <input type="radio" name="optionsRadios'+a.grupo_criterio+'" id="optionsRadios1" value="option1"> '
                                     : "checkbox" )*/
                                    + a.descripcion_criterio //+" - "+a.exclusivo
                                    + ' </div>'
                                    + ' <div class="col-lg-5">'
                                    + '  <div class="form-group">'
                                    + '    <h5>Observaciones</h5>'
                                    + '    <textarea class="form-control  ' + r + key + ' " rows="5" id="observacion_' + a.id + '" name="observacion_' + a.id + '" >' + (!a.evaluacion ? "" : a.evaluacion.observacion) + '</textarea>'
                                    + '  </div>'
                                    + ' </div>'
                                    + ' <div class="col-lg-3">'
                                    + '  <div class="form-group">'
                                    + '    <h5>Puntuación</h5>'
                                    + select
                                    + '  </div>'
                                    + ' </div>'
                                    + '</div>');

                        });


                        //$.each(array[Object.keys(array)], function (k, a)
                        //$(".criterios").append('<div class="col-lg-12" style="text-align: right"><button type="button" class="btn btn-default '+( (json[r].evaluacion.estado >= 29) ? "disabled":' guardar_evaluacion_'+$("#id_ronda").val() )+'">Guardar</button></div>');
                    });

                    //$(".criterios").append('<div class="col-lg-12" style="text-align: right"><button type="button" class="btn btn-default '+( (json[r].evaluacion.estado >= 29) ? "disabled":' guardar_evaluacion_'+$("#id_ronda").val() )+'">Guardar</button></div>');

                    //$(".btn_guardar_evaluacion").append('<button  class="btn btn-primary" id="guardar_evaluacion" '+( (json[r].evaluacion.estado >= 39 || json[r].ronda.estado >= 41 )? ' disabled="" ': '') + '>Guardar evaluación</button>');

                    $(".btn_guardar_evaluacion").append('<button  class="btn btn-primary" id="guardar_evaluacion" ' + ((json[r].evaluacion_nombre_estado == 'Evaluada' || json[r].ronda_nombre_estado == 'Evaluada') ? ' disabled="" ' : '') + '>Guardar evaluación</button>');


                });



                $("#guardar_evaluacion").click(function () {
                    evaluar_criterios(token_actual, $("#id_evaluacion").val());

                });


                $("#baceptar").click(function () {
                    // evaluar_criterios(token_actual, postulacion, participante);
                    $('#alertModal').modal('toggle');

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

//Guarda la evaluación de los criterios evaluados
function evaluar_criterios(token_actual, id_evaluacion) {

    $.ajax({
        type: 'POST',
        url: url_pv + 'PropuestasEvaluacion/evaluar_criterios',
        data: $("#form_criterios").serialize()
                + "&modulo=Evaluación de propuestas&token=" + token_actual.token
                + "&evaluacion=" + id_evaluacion

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
                //notify("danger", "error_token", "URL:", "PropuestasEvaluacion/evaluar_criterios");
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
                notify("success", "ok", "Usuario:", "Se actualizó el registro con éxito.");
                //$(".criterios").attr('disabled','');
                cargar_tabla(token_actual);
                break;
        }

    });



}

//Guarda la evaluación de los criterios evaluados
function confirmar_evaluacion(token_actual, id_evaluacion) {

    $.ajax({
        type: 'POST',
        url: url_pv + 'PropuestasEvaluacion/confirmar_evaluacion',
        data: $("#form_criterios").serialize()
                + "&modulo=Evaluación de propuestas&token=" + token_actual.token
                + "&evaluacion=" + id_evaluacion

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
                //notify("danger", "error_token", "URL:", "PropuestasEvaluacion/confirmar_evaluacion");
                break;
            case 'acceso_denegado':
                notify("danger", "remove", "Usuario:", "No tiene permisos para editar información.");
                break;
            case 'deshabilitado':
                notify("danger", "remove", "Usuario:", "Esta evaluación ya fue confirmada, por lo tanto no puede editar la información.");
                break;
            case 'criterio_null':
                notify("danger", "remove", "Usuario:", "Debe evaluar todos los criterios.");
                break;
                /*
                 * 03-03-2021
                 * Wilmer Gustavo Mogollón Duque
                 * Se agrega case para cuando la evaluación no se ha iniciado
                 */
            case 'sin_evaluar':
                notify("danger", "remove", "Usuario:", "No puede confirmar la evaluación, primero debe calificar los criterios.");
                break;
            default:
                notify("success", "ok", "Usuario:", "Se actualizó el registro con éxito.");
                //$(".criterios").attr('disabled','');
                cargar_tabla(token_actual);
                break;
        }

    });



}

function cargar_info_impedimento(token_actual, id_evaluacion) {
    $('#btn-submit').removeAttr("disabled");

    $.ajax({
        type: 'GET',
        url: url_pv + 'PropuestasEvaluacion/evaluacionpropuestas/' + id_evaluacion + '/impedimentos',
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
                //notify("danger", "error_token", "URL:", 'PropuestasEvaluacion/evaluacionpropuestas/'+id_evaluacion+'/impedimentos');
                break;
            case 'acceso_denegado':
                notify("danger", "remove", "Usuario:", "No tiene permisos acceder a la información.");
                break;
            default:

                var json = JSON.parse(data);

                if (json) {

                    if (json.evaluacion.observacion != null) {
                        //  $("#notificacion").html(json.evaluacion.observacion);
                        $("#notificacion").html(json.notificacion);
                        $("#fecha_creacion").html(json.fecha_creacion);
                        $("#tipo_documento").html(json.tipo_documento);
                        $("#numero_documento").html(json.numero_documento);
                        $("#nombre_jurado").html(json.nombre_jurado);
                        $("#nombre_jurado_2").html(json.nombre_jurado);
                        $("#notificacion_codigo_propuesta").html(json.codigo_propuesta);
                        $("#notificacion_nombre_propuesta").html(json.nombre_propuesta);
                        $("#correo_jurado").html(json.correo_jurado);
                        $("#motivo_impedimento").html(json.motivo_impedimento);
                        $('#btn-submit').attr("disabled", "");
                    } else {

                        //Se agrega el html de la notificación
                        $("#notificacion").html(json.notificacion);
                        //Se establecen los valores de los campos <span>
                        $("#fecha_creacion").html(json.fecha_creacion);
                        $("#tipo_documento").html(json.tipo_documento);
                        $("#numero_documento").html(json.numero_documento);
                        $("#nombre_jurado").html(json.nombre_jurado);
                        $("#nombre_jurado_2").html(json.nombre_jurado);
                        $("#notificacion_codigo_propuesta").html(json.codigo_propuesta);
                        $("#notificacion_nombre_propuesta").html(json.nombre_propuesta);
                        $("#correo_jurado").html(json.correo_jurado);
                        $("#motivo_impedimento").html('  <div class="form-group">'
                                + '<textarea class="form-control" rows="4" id="observacion_impedimento" name="observacion_impedimento" >'
                                + '</textarea>'
                                + '</div>');

                        $option = $('#notificacion').find('[name="observacion_impedimento"]');
                        //Se agrega el nuevo campo al validador
                        $('.impedimentoForm').bootstrapValidator('addField', $option);

                    }





                }

                break;
        }

    }
    );
}

function declarar_impedimento(token_actual, id_evaluacion) {

    $.ajax({
        type: 'PUT',
        url: url_pv + 'PropuestasEvaluacion/evaluacionpropuestas/' + id_evaluacion + '/impedimentos',
        data: $(".impedimentoForm").serialize()
                + "&modulo=Evaluación de propuestas&token=" + token_actual.token

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
                //notify("danger", "error_token", "URL:", 'PropuestasEvaluacion/evaluacionpropuestas/'+id_evaluacion+'/impedimentos');
                break;
            case 'acceso_denegado':
                notify("danger", "remove", "Usuario:", "No tiene permisos para editar información.");
                break;
            case 'deshabilitado':
                notify("danger", "remove", "Usuario:", "No tiene permisos para editar información.");
                break;
            case 'error_email':
                notify("danger", "remove", "Usuario:", "Error al enviar la notificación.");
                //cargar_datos_formulario(token_actual);
                break;
            default:
                notify("success", "ok", "Usuario:", "Se notificó con éxito.");
                //$(".criterios").attr('disabled','');
                cargar_tabla(token_actual);
                break;
        }

    });

}

function confirmar_top_individual(token_actual, id_ronda) {

    $.ajax({
        type: 'PUT',
        url: url_pv + 'PropuestasEvaluacion/confirmar_top_individual/ronda/' + id_ronda,
        data: "&modulo=Evaluación de propuestas&token=" + token_actual.token

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
                cargar_tabla(token_actual);
                break;
        }

    });


}


/*
 * 10-06-2020
 * Wilmer Gustavo Mogollón Duque
 * Se agrega nueva función confirmar_top_individual_deliberación,
 * esto con el fin de no tener que confirmar evaluación por evaluación
 */
function confirmar_top_individual_deliberacion(token_actual, id_ronda) {

    $.ajax({
        type: 'PUT',
        url: url_pv + 'PropuestasEvaluacion/confirmar_top_individual_deliberacion/ronda/' + id_ronda,
        data: "&modulo=Evaluación de propuestas&token=" + token_actual.token

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
                cargar_tabla(token_actual);
                break;
        }

    });


}
