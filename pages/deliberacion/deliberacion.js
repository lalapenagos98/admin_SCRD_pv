//Array del consumo con el back
keycloak.init(initOptions).then(function (authenticated) {
//Si no esta autenticado lo obliga a ingresar al keycloak
    $("#notificacion_periodo").hide();
    $("#notificacion_evaluaciones").hide();
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

    if (authenticated === false) {
        keycloak.login();
    } else {

        //Guardamos el token en el local storage
        if (typeof keycloak === 'object') {

            var token_actual = JSON.parse(JSON.stringify(keycloak));

            //Verifica si el token actual tiene acceso de lectura
            permiso_lectura_keycloak(token_actual.token, "SICON-DELIBERAR");

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
            //Verifica si el token actual tiene acceso de lectura
            init(token_actual);
            //cargar_datos_formulario(token_actual);
            validator_form(token_actual);

            //Carga el select de entidad
//            $.ajax({
//                type: 'GET',
//                data: {"token": token_actual.token},
//                url: url_pv + 'Entidades/all_select/',
//                success: function (data) {
//
//                    switch (data) {
//                        case 'error':
//                            notify("danger", "ok", "Convocatorias:", "Se registro un error, comuníquese con la mesa de ayuda soporte.convocatorias@scrd.gov.co");
//                            break;
//                        case 'error_metodo':
//                            notify("danger", "ok", "Se registro un error en el método, comuníquese con la mesa de ayuda soporte.convocatorias@scrd.gov.co");
//                            break;
//                        case 'error_token':
//                            //location.href = url_pv_admin + 'index.html?msg=Su sesión ha expirado, por favor vuelva a ingresar.&msg_tipo=danger';
//                            notify("danger", "error_token", "URL:", "PropuestasEvaluacion/select_estado/");
//                            break;
//                        case 'acceso_denegado':
//                            notify("danger", "remove", "Usuario:", "No tiene permisos acceder a la información.");
//                            break;
//                        default:
//                            json_entidades = JSON.parse(data);
//                            $('#entidad').find('option').remove();
//                            $("#entidad").append('<option value="">:: Seleccionar ::</option>');
//                            if (json_entidades.length > 0) {
//                                $.each(json_entidades, function (key, entidad) {
//                                    $("#entidad").append('<option value="' + entidad.id + '" >' + entidad.nombre + '</option>');
//                                });
//                            }
//
//                            break;
//                    }
//
//
//                }
//            });

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
             * 22-04-2021
             * Wilmer Gustavo Mogollón Duque
             * Se agrega el select grupos_evaluacion
             */
            //carga el select grupos evaluación
            $('#rondas').change(function () {
//            $("#categorias").attr('disabled', '');
                $('#grupos_evaluacion').val(null);
                if ($('#anio').val() >= 2021) {
                    cargar_select_grupos(token_actual, $('#rondas').val());
                }
            });
            /*
             * 20-06-2020
             * Wilmer Gustavo Mogollón Duque
             * Agrego un if para controlar que seleccione la ronda de evaluación
             */


            //carga la tabla con los criterios de busqueda
            //carga la tabla con los criterios de busqueda
            $('#buscar').click(function () {

                if ($('#rondas').val() === "") {
                    alert("Debe seleccionar la ronda de evaluación");
                } else {

                    if ($('#grupos_evaluacion').val() === "" && $('#anio').val() >= 2021) {
                        alert("Debe seleccionar un grupo de evaluación");
                    } else {
                        $('#resultado').focus();
                        validator_form(token_actual);
                        cargar_tabla(token_actual);
                    }
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

                deliberar(token_actual, $('#rondas').val(), $('#grupos_evaluacion').val());
                $('#exampleModal').modal('toggle');
                $('#deliberar').prop('disabled', true);
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

                anular_deliberacion(token_actual, $('#rondas').val(), $('#grupos_evaluacion').val());
                $('#anular_deliberacionModal').modal('hide');
            });

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
        }//
    }

}
).catch(function () {
    location.href = url_pv_admin + 'error_keycloak.html';
});



function init(token_actual) {
    //Realizo la peticion para cargar el formulario
    $.ajax({
        type: 'POST',
        data: {"token": token_actual.token, "id": $("#id").attr('value')},
        url: url_pv + 'Deliberacion/init/'
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




//Agrego para limpiar el formulario
function limpiarFormulario() {
    document.getElementById("asignar_est_form").reset();
}


function cargar_select_convocatorias(token_actual, anio, entidad) {


    $.ajax({
        type: 'POST',
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
        type: 'POST',
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


/*
 * 22-04-2021
 * Wilmer Gustavo Mogollón Duque
 * Se agrega la función cargar_select_grupos
 */

function cargar_select_grupos(token_actual, ronda) {


    $.ajax({
        type: 'POST',
        url: url_pv + 'Deliberacion/select_grupos',
        data: {"token": token_actual.token, "ronda": ronda},
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
                $('#grupos_evaluacion').find('option').remove();
                $("#grupos_evaluacion").append('<option value="">:: Seleccionar ::</option>');
                if (json !== null && json.length > 0) {
                    $("#grupos_evaluacion").removeAttr('disabled');
                    //Cargos el select de areasconocimientos
                    $.each(json, function (key, array) {
                        $("#grupos_evaluacion").append('<option value="' + array.id + '" >' + array.nombre + '</option>');
                    });
                }

                break;
        }

    }
    );
}

function cargar_select_rondas(token_actual, convocatoria) {

    $.ajax({
        type: 'POST',
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
    $("#notificacion_evaluaciones").hide();
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
    /*
     * 09-08-2021
     * Wilmer Gustavo Mogollón 
     * Agregar información pertinente
     */


    $.ajax({
        type: 'GET',
        url: url_pv + 'Rondas/search_periodo/' + $('#rondas').val(),
        data: {"token": token_actual.token},
    }).done(function (data) {
        switch (data) {
            default:

                var json = JSON.parse(data);


                $("#fecha_inicio_evaluacion").html(json.inicio.substr(0, 10));
                $("#fecha_fin_evaluacion").html(json.fin.substr(0, 10));



                $("#notificacion_periodo").html('La fecha de deliberación es: ' + json.deliberacion.substr(0, 10) + '.');
                $("#notificacion_periodo").show();

                if (json.evaluaciones_confirmadas === 0) {
                    $("#notificacion_evaluaciones").show();
                    $("#notificacion_evaluaciones").html('Estimado usuario, recuerde que es necesario que todos los jurados confirmen su top individual para que las evaluaciones de las propuestas se listen en el módulo de deliberación. ');
                }

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
        "lengthMenu": [10, 15, 20],
        "responsive": true,
        "searching": false,
        "ajax": {
            type: 'POST',
            url: url_pv + "Deliberacion/all_propuestas",
            data:
                    {"token": token_actual.token,
                        "ronda": $('#rondas').val(),
                        "grupo": $('#grupos_evaluacion').val()
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
            type: 'POST',
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
        type: 'POST',
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
        type: 'POST',
        url: url_pv + 'Deliberacion/all_evaluaciones/propuesta/' + id_propuesta,
        data: {"token": token_actual.token,
            "ronda": $('#rondas').val(), "grupo": $('#grupos_evaluacion').val()
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

function deliberar(token_actual, id_ronda, id_grupo) {


    $.ajax({
        type: 'POST',
        url: url_pv + 'Deliberacion/deliberar/ronda/' + id_ronda,
        data: "&modulo=SICON-DELIBERAR&token=" + token_actual.token + "&grupo=" + id_grupo

    }).done(function (data) {

        switch (data) {
            case 'error':
                notify("danger", "ok", "Usuario:", "Se registro un error, comuníquese con la mesa de ayuda soporte.convocatorias@scrd.gov.co");
                $('#deliberar').prop('disabled', false);
                break;
            case 'error_metodo':
                notify("danger", "ok", "Se registro un error en el método, comuníquese con la mesa de ayuda soporte.convocatorias@scrd.gov.co");
                $('#deliberar').prop('disabled', false);
                break;
            case 'error_token':
                location.href = url_pv_admin + 'index.html?msg=Su sesión ha expirado, por favor vuelva a ingresar.&msg_tipo=danger';
                $('#deliberar').prop('disabled', false);
                //notify("danger", "error_token", "URL:", 'PropuestasEvaluacion/evaluacionpropuestas/'+id_evaluacion+'/impedimentos');
                break;
            case 'acceso_denegado':
                notify("danger", "remove", "Usuario:", "No tiene permisos para editar información.");
                $('#deliberar').prop('disabled', false);
                break;
            case 'deshabilitado':
                notify("danger", "remove", "Usuario:", "No tiene permisos para editar información.");
                $('#deliberar').prop('disabled', false);
                break;
            case 'error_validacion':
                notify("danger", "remove", "Usuario:", "Tiene evaluaciones sin confirmar");
                $('#deliberar').prop('disabled', false);
                break;
            case 'error_confirmacion':
                notify("danger", "remove", "Usuario:", "No puede enviar a deliberar, aún existen evaluaciones sin confirmar");
                $('#deliberar').prop('disabled', false);
                $('#deliberar').prop('disabled', false);
                break;
            case 'error_ronda':
                notify("danger", "remove", "Usuario:", "Error al actualizar la ronda");
                $('#deliberar').prop('disabled', false);
                break;
            case 'exito':
                notify("success", "remove", "Usuario:", "Se ha enviado esta ronda a deliberar");
                $('#deliberar').prop('disabled', false);
                break;
            case 'deliberacion':
                notify("success", "remove", "Usuario:", "Esta ronda ya se encuentra en deliberación");
                $('#deliberar').prop('disabled', false);
                break;
        }

    });
}

function cargar_info_top_general(token_actual, id_ronda) {

    var id_convocatoria;
    $("#fieldset_top_general").removeAttr("disabled");
    //se verifica que las evaluaciones esten confirmadas
    $.ajax({
        type: 'POST',
        url: url_pv + 'Deliberacion/validar_confirmacion/ronda/' + id_ronda,
        data: {"token": token_actual.token,
            "grupo": $('#grupos_evaluacion').val()},
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
                notify("danger", "remove", "Usuario:", "Recuerde que para confirmar el top general, es necesario que todos los grupos de evaluación hayan deliberado.");
                break;
            case 'exito':

                $("#top_generalModal").modal('show');
                //Información de la ronda y la convocatoria
                $.ajax({
                    type: 'POST',
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
                                    type: 'POST',
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
            type: 'POST',
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
            $('.cargar_verificacion_1').click(function () {
                cargar_verificacion_1(token_actual, $(this).attr("id_propuesta"));
            });

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
            {"data": "Grupo evaluador",
                render: function (data, type, row) {
                    return row.grupoevaluador;
                },
            },

            /*{"data": "Seleccionar",
             render: function ( data, type, row ) {
             return ' <input title=\"'+row.id+'\" type=\"checkbox\" class=\"check_activar_'+row.active+'  activar_registro" '+(row.active? 'checked ':'')+' />';
             },
             },*/
            {"data": "Ver inhabilidades",
                render: function (data, type, row) {
                    return '<button id="' + row.id + '" title="Ver inhabilidades de la propuesta" type="button" class="btn btn-warning cargar_verificacion_1" data-toggle="modal" data-target="#modal_verificacion" id_propuesta="' + row.id + '">'
                            + '<span class="glyphicon glyphicon-eye-open"></span></button>';

                },
            }



        ]
    });
}

function cargar_info_top_general_asignar(token_actual, id_ronda) {
    var id_convocatoria;
    $("#fieldset_top_general").removeAttr("disabled");
    //se verifica que las evaluaciones esten confirmadas
    $.ajax({
        type: 'POST',
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
                    type: 'POST',
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
                                    type: 'POST',
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
                                                        type: 'POST',
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
            type: 'POST',
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
        data: "&modulo=SICON-DELIBERAR&token=" + token_actual.token
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
                alert("Usuario:", "Recuerde liberar las postulaciones de los jurados relacionados con ésta convocatoria. Para hacerlo, por favor dirijase al componente de preselección");
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
        data: "&modulo=SICON-DELIBERAR&token=" + token_actual.token
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
        data: "&modulo=SICON-DELIBERAR&token=" + token_actual.token + "&monto_asignado=" + monto_asignado

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
function anular_deliberacion(token_actual, id_ronda, id_grupo) {


    $.ajax({
        type: 'PUT',
        url: url_pv + 'Deliberacion/anular_deliberacion/ronda/' + id_ronda,
        data: "&modulo=SICON-DELIBERAR&token=" + token_actual.token + "&grupo=" + id_grupo

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


/*
 * 12-05-2021
 * Wilmer Gustavo Mogollón Duque
 * Cargar verificación
 */


function cargar_verificacion_1(token_actual, propuesta) {
    //Asigno la propuesta actual
    $("#propuesta").val(propuesta);

    $('#doc_administrativos_verificacion_2 tr').remove();
    $('#doc_administrativos_verificacion_1 tr').remove();
    $('#doc_tecnicos_verificacion_1 tr').remove();

    //Realizo la peticion para cargar el formulario
    $.ajax({
        type: 'POST',
        data: {"token": token_actual.token, "verificacion": 1},
        url: url_pv + 'Deliberacion/cargar_propuesta/' + propuesta
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
                if (data == 'error_propuesta')
                {
                    notify("danger", "ok", "Convocatorias:", "El código de la propuesta es incorrecto.");
                } else
                {
                    var json = JSON.parse(data);

                    $('#info_propuesta_verificacion_1').loadJSON(json.propuesta);

                    var html_table = '';
                    $.each(json.administrativos, function (key2, documento) {
                        if (documento.verificacion_1_id === null)
                        {
                            documento.verificacion_1_id = "";
                        }
                        if (documento.verificacion_1_estado === null)
                        {
                            documento.verificacion_1_estado = "";
                        }
                        if (documento.verificacion_1_observacion === null)
                        {
                            documento.verificacion_1_observacion = "";
                        }

                        html_table = html_table + '<tr>';
                        html_table = html_table + '<td>' + documento.orden + ' ' + documento.requisito + '</td>';
                        html_table = html_table + '<td><b>Archivos<b/><br/><br/>';

                        $.each(documento.archivos, function (key, archivo) {
                            html_table = html_table + '<p><a style="color:#5cb85c" href="javascript:void(0)" onclick="download_file(\'' + archivo.id_alfresco + '\')">(Descargar) ' + archivo.nombre + '</a><br/>';
                            html_table = html_table + '<a style="color:#f0ad4e" target="_blank" href="' + archivo.url_alfresco + '" >(Ver Documento) ' + archivo.nombre + '</a></p>';
                        });
                        html_table = html_table + '<b>Links<b/><br/><br/>';
                        var numero_link = 1;
                        $.each(documento.links, function (key, link) {
                            html_table = html_table + '<p><a href="' + link.link + '" target="_blank">link ' + numero_link + '</a></p>';
                            numero_link++;
                        });
                        html_table = html_table + '</td>';
                        html_table = html_table + '<td>';
                        html_table = html_table + '         <div class="row">';
                        html_table = html_table + '             <div class="col-lg-12">';
                        html_table = html_table + '                 <div class="form-group">';
                        html_table = html_table + '                     <label> Resultado de la verificación</label>';
                        html_table = html_table + '                     <select id="estado_' + documento.id + '" class="form-control estados_administrativos" >';
                        $.each(json.estados_verificacion_1, function (key, estado) {
                            var selected = '';
                            if (documento.verificacion_1_estado == estado.id)
                            {
                                selected = 'selected="selected"';
                            }
                            if (estado.id != 26)
                            {
                                html_table = html_table + '<option value="' + estado.id + '" ' + selected + '>' + estado.nombre + '</option>';
                            }
                        });

                        var color_boton_guardado = "btn-success";
                        if (documento.verificacion_1_id == "")
                        {
                            color_boton_guardado = "btn-danger";
                        }

                        html_table = html_table + '                     </select>';
                        html_table = html_table + '                 </div>';
                        html_table = html_table + '             </div>';
                        html_table = html_table + '         </div>';
                        html_table = html_table + '         <div class="row">';
                        html_table = html_table + '             <div class="col-lg-12">';
                        html_table = html_table + '                 <div class="form-group">';
                        html_table = html_table + '                     <label>Observaciones</label>';
                        html_table = html_table + '                     <textarea id="observaciones_' + documento.id + '" class="form-control" rows="3">' + documento.verificacion_1_observacion + '</textarea>';
                        html_table = html_table + '                 </div>';
                        html_table = html_table + '             </div>';
                        html_table = html_table + '         </div>';
                        html_table = html_table + '         <div class="row">';
                        html_table = html_table + '             <div class="col-lg-12">';
                        html_table = html_table + '                 <div class="form-group" style="text-align: right">';
                        html_table = html_table + '                     <button id="btn_documento_' + documento.id + '" type="button" class="btn ' + color_boton_guardado + '" onclick="guardar_verificacion_1(\'' + token_actual.token + '\',\'' + documento.id + '\',\'Verificación documentos administrativos\',1)">Guardar</button>';
                        html_table = html_table + '                     <input type="hidden" class="validar_administrativos" id="id_documento_' + documento.id + '" value="' + documento.verificacion_1_id + '" />';
                        html_table = html_table + '                 </div>';
                        html_table = html_table + '             </div>';
                        html_table = html_table + '         </div>';
                        html_table = html_table + '</td>';
                        html_table = html_table + '</tr>';
                    });

                    $('#doc_administrativos_verificacion_1 tr').remove();
                    $("#doc_administrativos_verificacion_1").append(html_table);

                    html_table = "";

                    $.each(json.tecnicos, function (key2, documento) {

                        if (documento.verificacion_1_id === null)
                        {
                            documento.verificacion_1_id = "";
                        }
                        if (documento.verificacion_1_estado === null)
                        {
                            documento.verificacion_1_estado = "";
                        }
                        if (documento.verificacion_1_observacion === null)
                        {
                            documento.verificacion_1_observacion = "";
                        }

                        html_table = html_table + '<tr>';
                        html_table = html_table + '<td>' + documento.orden + ' ' + documento.requisito + '</td>';
                        html_table = html_table + '<td><b>Archivos<b/><br/><br/>';

                        $.each(documento.archivos, function (key, archivo) {
                            html_table = html_table + '<p><a style="color:#5cb85c" href="javascript:void(0)" onclick="download_file(\'' + archivo.id_alfresco + '\')">(Descargar) ' + archivo.nombre + '</a><br/>';
                            html_table = html_table + '<a style="color:#f0ad4e" target="_blank" href="' + archivo.url_alfresco + '" >(Ver Documento) ' + archivo.nombre + '</a></p>';
                        });
                        html_table = html_table + '<b>Links<b/><br/><br/>';
                        var numero_link = 1;
                        $.each(documento.links, function (key, link) {
                            html_table = html_table + '<p><a href="' + link.link + '" target="_blank">link ' + numero_link + '</a></p>';
                        });
                        html_table = html_table + '</td>';
                        html_table = html_table + '<td>';
                        html_table = html_table + '         <div class="row">';
                        html_table = html_table + '             <div class="col-lg-12">';
                        html_table = html_table + '                 <div class="form-group">';
                        html_table = html_table + '                     <label> Resultado de la verificación</label>';
                        html_table = html_table + '                     <select id="estado_' + documento.id + '" class="form-control estados_tecnicos" >';
                        $.each(json.estados_verificacion_1, function (key, estado) {
                            var selected = '';
                            if (documento.verificacion_1_estado == estado.id)
                            {
                                selected = 'selected="selected"';
                            }

                            //Se debe habilitar el estado subsanar en los documentos tecnicos
                            //de modalidad LEP
                            //if(json.modalidad==6)
                            //{
                            //    html_table = html_table + '<option value="' + estado.id + '" ' + selected + '>' + estado.nombre + '</option>';
                            //}
                            //else
                            //{
                            if (estado.id != 27)
                            {
                                html_table = html_table + '<option value="' + estado.id + '" ' + selected + '>' + estado.nombre + '</option>';
                            }
                            //}                                                                                    
                        });

                        var color_boton_guardado = "btn-success";
                        if (documento.verificacion_1_id == "")
                        {
                            var color_boton_guardado = "btn-danger";
                        }

                        html_table = html_table + '                     </select>';
                        html_table = html_table + '                 </div>';
                        html_table = html_table + '             </div>';
                        html_table = html_table + '         </div>';
                        html_table = html_table + '         <div class="row">';
                        html_table = html_table + '             <div class="col-lg-12">';
                        html_table = html_table + '                 <div class="form-group">';
                        html_table = html_table + '                     <label>Observaciones</label>';
                        html_table = html_table + '                     <textarea id="observaciones_' + documento.id + '" class="form-control" rows="3">' + documento.verificacion_1_observacion + '</textarea>';
                        html_table = html_table + '                 </div>';
                        html_table = html_table + '             </div>';
                        html_table = html_table + '         </div>';
                        html_table = html_table + '         <div class="row">';
                        html_table = html_table + '             <div class="col-lg-12">';
                        html_table = html_table + '                 <div class="form-group" style="text-align: right">';
                        html_table = html_table + '                     <button type="button" id="btn_documento_' + documento.id + '" class="btn ' + color_boton_guardado + '" onclick="guardar_verificacion_1(\'' + token_actual.token + '\',\'' + documento.id + '\',\'Verificación documentos técnicos\',1)">Guardar</button>';
                        html_table = html_table + '                     <input type="hidden" class="validar_tecnicos" id="id_documento_' + documento.id + '" value="' + documento.verificacion_1_id + '" />';
                        html_table = html_table + '                 </div>';
                        html_table = html_table + '             </div>';
                        html_table = html_table + '         </div>';
                        html_table = html_table + '</td>';
                        html_table = html_table + '</tr>';
                    });

                    $('#doc_tecnicos_verificacion_1 tr').remove();
                    $("#doc_tecnicos_verificacion_1").append(html_table);


                    //Por defecto los documentos tecnicos esta desactivados
                    $("#doc_tecnicos_verificacion_1").find('input,select,button,textarea').attr("disabled", "disabled");
                    $("#boton_confirma_tecnica_1").attr("disabled", "disabled");

                    //Valido si ya realizaron la verificación administrativa con el fin de habilitar
                    //la documentación tecnica
                    if (json.propuesta.verificacion_administrativos)
                    {

                        $("#doc_administrativos_verificacion_1").find('input,select,button,textarea').attr("disabled", "disabled");
                        $("#boton_confirma_administrativa_1").attr("disabled", "disabled");

                        $("#doc_tecnicos_verificacion_1").find('input,select,button,textarea').removeAttr("disabled");
                        $("#boton_confirma_tecnica_1").removeAttr("disabled");

                    }

                    if (json.propuesta.verificacion_tecnicos)
                    {

                        $("#doc_tecnicos_verificacion_1").find('input,select,button,textarea').attr("disabled", "disabled");
                        $("#boton_confirma_tecnica_1").attr("disabled", "disabled");

                    }

                    //Si la propuesta esta estado por
                    //Registrada
                    //Anulada
                    //Por Subsanar -> id -> se elimina debido a que se puede verificar
                    //                      la documentacion tecnica asi este por subsanar
                    //                      ya que al momento se rechaza
                    //Subsanación Recibida
                    //Rechazada
                    //Habilitada
                    //subsanada
                    //Se inactiva en la 1 verificación los documetos tecnicos                    
                    if (json.propuesta.estado == 7 || json.propuesta.estado == 20 || json.propuesta.estado == 22 || json.propuesta.estado == 23 || json.propuesta.estado == 24 || json.propuesta.estado == 31)
                    {

                        $("#doc_administrativos_verificacion_1").find('input,select,button,textarea').attr("disabled", "disabled");
                        $("#boton_confirma_administrativa_1").attr("disabled", "disabled");

                        $("#doc_tecnicos_verificacion_1").find('input,select,button,textarea').attr("disabled", "disabled");
                        $("#boton_confirma_tecnica_1").attr("disabled", "disabled");

                    }

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

                    if (json.html_propuestas != "")
                    {
                        $("#propuestas_pn").css("display", "block");
                        $(".tr_propuestas").remove();
                        $("#body_propuestas_pn").append(json.html_propuestas);

                    } else
                    {
                        $("#propuestas_pn").css("display", "none");
                    }

                    if (json.html_propuestas_ganadoras != "")
                    {
                        $("#propuestas_ganadoras_pn").css("display", "block");
                        $(".tr_propuestas_ganadoras").remove();
                        $("#body_propuestas_ganadoras_pn").append(json.html_propuestas_ganadoras);

                    } else
                    {
                        $("#propuestas_ganadoras_pn").css("display", "none");
                    }

                    if (json.html_ganadoras_anios_anteriores != "")
                    {
                        $("#ganadoras_anios_anteriores").css("display", "block");
                        $(".tr_ganador_anio_anterior").remove();
                        $("#body_ganadoras_anios_anteriores").append(json.html_ganadoras_anios_anteriores);

                    } else
                    {
                        $("#ganadoras_anios_anteriores").css("display", "none");
                    }

                    if (json.html_propuestas_jurados_seleccionados != "")
                    {
                        $("#jurados_seleccionados").css("display", "block");
                        $(".tr_jurados_seleccionados").remove();
                        $("#body_jurados_seleccionados").append(json.html_propuestas_jurados_seleccionados);

                    } else
                    {
                        $("#jurados_seleccionados").css("display", "none");
                    }

                }
            }
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
