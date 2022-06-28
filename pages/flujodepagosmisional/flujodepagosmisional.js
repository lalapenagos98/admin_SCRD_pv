//Array del consumo con el back
keycloak.init(initOptions).then(function (authenticated) {



//Verifico si el token exite en el cliente y verifico que el token este activo en el servidor
    var token_actual = getLocalStorage(name_local_storage);
    $("#notificacion_periodo").hide();
    $("#notificacion_evaluaciones").hide();

    $("#cuenta_bancaria").hide();
    $("#rut").hide();
    $("#otros_documentos").hide();
    $("#guardar_parametro_rut").hide();
    $("#actualizar_parametro_rut").hide();

    $("#actualizar_parametro_convocatoriadocumento").hide();
    $("#guardar_parametro_convocatoriadocumento").hide();

    /*para permitir movilidad al cerrar el modal*/

    $('.modal').on("hidden.bs.modal", function (e) { //fire on closing modal box
        if ($('.modal:visible').length) { // check whether parent modal is opend after child modal close
            $('body').addClass('modal-open'); // if open mean length is 1 then add a bootstrap css class to body of the page
        }
    });

    //Aprobar convocatoriadocumento
    $("#actualizar_observacion_verificacion").click(function () {
        actualizar_observacion_verificacion_convocatoriadocumento(token_actual, $('#convocatoriadocumento').val(), $('#label').val(), $('#id_html').val(), $('#observacion_verificacion').val(), $('#propuesta').val(), $('#porcentaje_pagar').val());
        $('#complementar_informacion').modal('hide');
//        limpiarFormulario();
    });
    //Enviar a subsanar convocatoriadocumento
    $("#subsanar_observacion_verificacion").click(function () {
        subsanar_observacion_verificacion_convocatoriadocumento(token_actual, $('#convocatoriadocumento').val(), $('#label').val(), $('#id_html').val(), $('#observacion_verificacion').val(), $('#propuesta').val(), $('#porcentaje_pagar').val(), $('#radicado_cuenta_orfeo').val());
        $('#complementar_informacion').modal('hide');
//        limpiarFormulario();
    });


    /*Para observación rut*/

    //Aprobar convocatoriadocumento
    $("#actualizar_observacion_verificacion_rut").click(function () {
//        token_actual = getLocalStorage(name_local_storage);
        actualizar_observacion_verificacion_rut(token_actual, $('#programadocumento_rut').val(), $('#label').val(), $('#id_html').val(), $('#observacion_verificacion_rut').val(), $('#propuesta_rut').val());
        $('#complementar_informacion').modal('hide');
    });

    //Enviar a subsanar convocatoriadocumento
    $("#subsanar_observacion_verificacion_rut").click(function () {
//        token_actual = getLocalStorage(name_local_storage);
        subsanar_observacion_verificacion_rut(token_actual, $('#programadocumento_rut').val(), $('#label').val(), $('#id_html').val(), $('#observacion_verificacion_rut').val(), $('#propuesta_rut').val());
        $('#complementar_informacion').modal('hide');
    });

    /*Para observación cuenta*/

    //Aprobar convocatoriadocumento
    $("#actualizar_observacion_verificacion_cuenta").click(function () {
//        token_actual = getLocalStorage(name_local_storage);
        actualizar_observacion_verificacion_cuenta(token_actual, $('#programadocumento_cuenta').val(), $('#label_cuenta_observacon').val(), $('#id_html_cuenta_observacon').val(), $('#observacion_verificacion_cuenta').val(), $('#propuesta_cuenta').val());
        $('#complementar_informacion').modal('hide');
    });

    //Enviar a subsanar convocatoriadocumento
    $("#subsanar_observacion_verificacion_cuenta").click(function () {
//        token_actual = getLocalStorage(name_local_storage);
        subsanar_observacion_verificacion_cuenta(token_actual, $('#programadocumento_cuenta').val(), $('#label_cuenta_observacon').val(), $('#id_html_cuenta_observacon').val(), $('#observacion_verificacion_cuenta').val(), $('#propuesta_cuenta').val());
        $('#complementar_informacion').modal('hide');
    });

    /*Para observación otros*/

    //Aprobar convocatoriadocumento
    $("#actualizar_observacion_verificacion_otros").click(function () {
//        token_actual = getLocalStorage(name_local_storage);
        actualizar_observacion_verificacion_otros(token_actual, $('#programadocumento_otros').val(), $('#label_otros').val(), $('#id_html_otros').val(), $('#observacion_verificacion_otros').val(), $('#propuesta_otros').val());
        $('#complementar_informacion').modal('hide');
//        limpiarFormulario();
    });
    //Enviar a subsanar convocatoriadocumento
    $("#subsanar_observacion_verificacion_otros").click(function () {
//        token_actual = getLocalStorage(name_local_storage);
        subsanar_observacion_verificacion_otros(token_actual, $('#programadocumento_otros').val(), $('#label_otros').val(), $('#id_html_otros').val(), $('#observacion_verificacion_otros').val(), $('#propuesta_otros').val());
        $('#complementar_informacion').modal('hide');
//        limpiarFormulario();
    });

    //Para aprobar documentación

    $("#aprobar_documentacion").click(function () {
//        token_actual = getLocalStorage(name_local_storage);
        aprobar_documentacion_ganador_misional(token_actual, $('#id_propuesta_misional').val(), $('#fecha_aprobacion_garantia').val(), $('#fecha_informe_seguimiento_supervision').val());
        $('#complementar_informacion').modal('hide');
//        limpiarFormulario();
    });


    //Para radicar documentación en orfeo


    $("#baceptar_radicar").click(function () {
        radicar_documentacion(token_actual, $('#id_propuesta_misional').val(), $('#tipo_pago').val());
    });

    //Para devolver documentación

    $("#devolver_documentacion").click(function () {
//        token_actual = getLocalStorage(name_local_storage);
        devolver_documentacion_ganador_misional(token_actual, $('#id_propuesta_misional').val(), $('#fecha_aprobacion_garantia').val(), $('#fecha_informe_seguimiento_supervision').val());
        $('#complementar_informacion').modal('hide');
//        limpiarFormulario();
    });



    if (authenticated === false) {
        keycloak.login();
    } else {

        //Guardamos el token en el local storage
        if (typeof keycloak === 'object') {

            var token_actual = JSON.parse(JSON.stringify(keycloak));

            //Verifica si el token actual tiene acceso de lectura
            permiso_lectura_keycloak(token_actual.token, "SICON-PAGOS-MISIONAL");

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
                cargar_tabla(token_actual);
            });
            //carga el select rondas
            $('#categorias').change(function () {
                $('#rondas').val(null);
                cargar_select_rondas(token_actual, $('#categorias').val());
                cargar_tabla(token_actual);
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

    }

});


function init(token_actual) {
    //Realizo la peticion para cargar el formulario
    $.ajax({
        type: 'POST',
        data: {"token": token_actual.token, "id": $("#id").attr('value')},
        url: url_pv + 'Flujodepagosmisional/init/'
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
        url: url_pv + 'Flujodepagosmisional/select_convocatorias',
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
        url: url_pv + 'Flujodepagosmisional/select_categorias',
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



function cargar_tabla(token_actual) {

    /*
     * 06-06-2020
     * Wilmer Gustavo Mogollón Duque
     * Se agrega el botón top_general al show
     */

    $("#notificacion_periodo").hide();
    $("#notificacion_evaluaciones").hide();
    //var data = JSON.stringify( $("#formulario_busqueda_banco").serializeArray() );
    //var data =  $("#formulario_busqueda_banco").serializeArray();
    //var data =  ( $('#filtro').val() == 'true' ? $("#formulario_busqueda_banco").serializeArray() : null)
    /*
     * 09-08-2021
     * Wilmer Gustavo Mogollón 
     * Agregar información pertinente
     */



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
            url: url_pv + "Flujodepagosmisional/all_propuestas_ganadoras",
            data:
                    {"token": token_actual.token,
                        "entidad": $('#entidad').val(),
                        "convocatoria": $('#convocatorias').val(),
                        "categoria": $('#categorias').val(),
                        "anio": $('#anio').val()
//                        "filtros": data
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
            {"data": "Estado del pago",
                render: function (data, type, row) {
                    return row.estado_pago;
                },
            },
            {"data": "Año",
                render: function (data, type, row) {
                    return row.anio;
                },
            },
            {"data": "Convocatoria",
                render: function (data, type, row) {
                    return row.convocatoria;
                },
            },
            {"data": "Categoría",
                render: function (data, type, row) {
                    return row.categoria;
                },
            },
            {"data": "Nombre de la propuesta",
                render: function (data, type, row) {
                    return row.propuesta;
                },
            },
            {"data": "Código de la propuesta",
                render: function (data, type, row) {
                    return row.codigo;
                },
            },
            {"data": "Participante",
                render: function (data, type, row) {
                    return row.participante;
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
                    return '<button id="' + row.id + '" title="Ver documentación" type="button" class="btn btn-warning btn_ver" data-toggle="modal" data-target="#evaluarModal" id_propuesta="' + row.id + '" top_general="' + row.promedio + '">'
                            + '<span class="glyphicon glyphicon-eye-open"></span></button>';
                },
            }



        ]


    });


}

function acciones_registro(token_actual) {

    $(".btn_ver").click(function () {

        cargar_info_basica(token_actual, $(this).attr("id_propuesta"));
//        cargar_evaluaciones(token_actual, $(this).attr("id_propuesta"));
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
        type: 'POST',
        url: url_pv + 'Flujodepagosmisional/propuestas_ganadoras/' + id_propuesta,
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
                    $("#codigo_propuesta").html(json.propuesta.codigo);
                    $("#nombre_propuesta").html(json.propuesta.nombre);
                    $("#resumen_propuesta").html(json.propuesta.resumen);
                    $("#objetivo_propuesta").html(json.propuesta.objetivo);
                    $("#bogota_propuesta").html((json.propuesta.objetivo) ? "Si" : "No");
                    $("#radicado_cuenta_orfeo").attr("value", json.propuesta.radicado_cuenta_orfeo);
                    $("#fecha_aprobacion_garantia").attr("value", json.propuesta.fecha_aprobacion_garantia);
                    $("#fecha_informe_seguimiento_supervision").attr("value", json.propuesta.fecha_informe_seguimiento_supervision);
                    $("#id_propuesta_misional").attr("value", json.propuesta.id);
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
                    var i = 0;
                    $.each(json.documentos, function (k, a) {

                        i = i + 1;

                        items = items + '<tr>'
                                + '<td>' + i + '</td>'
                                + '<td>' + a.requisito + '</td>'
                                + '<td>' + a.descripcion_requisito + '</td>'
                                + '<td>' + a.estado + '</td>'
                                + '<td>'
                                + '<button id = "' + a.id_alfresco + '" title="' + (a.id_alfresco == null ? "No se ha cargado archivo" : "Descargar archivo") + '" type="button" class="btn btn-primary download_file">'
                                + (a.id_alfresco == null ? '<span class="glyphicon glyphicon-ban-circle" title="No se ha cargado archivo"></span>' : '<span class="glyphicon glyphicon-download-alt"></span>')
                                + '</button>'
                                + '</td>'
                                + '<td>'
                                + '<button title="' + a.id + '" programadocumento="' + a.id_programadocumento + '" propuesta="' + a.id_propuesta + '"  type="button" class="btn btn-success btn_tecnico_link" data-toggle="modal" data-target="#complementar_informacion"><span class="glyphicon glyphicon-pencil"></span></button>'
                                + '</td>'
                                + '</tr>';
                    });
                    $("#archivos_table").html(items);

                    $(".btn_tecnico_link").click(function () {

                        var documento = $(this).attr("programadocumento");
                        var id_propuesta = $(this).attr("propuesta");

                        switch (documento) {
                            case '1':
                                $("#cuenta_bancaria").show();
                                $("#rut").hide();
                                $("#otros_documentos").hide();
                                //Llamada para verificar el parametro cuenta
                                $.ajax({
                                    type: 'POST',
                                    url: url_pv + 'PropuestasDocumentacionganadores/verificar_propuestas_parametros_ganadores_cuenta/propuesta/' + id_propuesta,
                                    data: {
                                        "token": token_actual.token,
                                        "documento": documento
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


                                            if (json.banco) {
                                                $("#entidad_bancaria").attr("value", json.banco.valor);
                                            } else {
                                                $("#entidad_bancaria").attr("value", "");
                                            }

                                            if (json.tipo_cuenta) {
                                                $("#tipo_cuenta").attr("value", json.tipo_cuenta.valor);
                                            } else {
                                                $("#entidad_bancaria").attr("value", "");
                                            }

                                            if (json.numero_cuenta) {
                                                $("#info_comp_numero_cuenta").attr("value", json.numero_cuenta.valor);
                                                $("#programadocumento").attr("value", documento);
                                                $("#actualizar_parametro_cuenta").show();
                                                $("#guardar_parametro_cuenta").hide();
                                            } else {
                                                $("#programadocumento").attr("value", documento);
                                                $("#info_comp_numero_cuenta").attr("value", "");
                                                $("#guardar_parametro_cuenta").show();
                                                $("#actualizar_parametro_cuenta").hide();
                                            }

                                            break;
                                    }

                                }
                                );

                                //Llamada para verificar la observación 
                                $.ajax({
                                    type: 'POST',
                                    url: url_pv + 'PropuestasDocumentacionganadores/verificar_observacion_documentacion_cuenta/propuesta/' + id_propuesta,
                                    data: {
                                        "token": token_actual.token,
                                        "documento": documento
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
                                            if (json.id) {
//                                                $("#actualizar_parametro_otros").show();
//                                                if (json.observacion_verificacion !== null) {
//                                                    $("#observacion_verificacion_cuenta").attr("value", json.observacion_verificacion);
//                                                } else {
//                                                    $("#observacion_verificacion_cuenta").attr("value", "");
//                                                }
                                                $("#observacion_verificacion_cuenta").attr("value", json.observacion_verificacion);
                                                $("#propuesta_cuenta").attr("value", json.propuesta);
                                                $("#programadocumento_cuenta").attr("value", documento);
//                                                $("#actualizar_observacion_verificacion_cuenta").show();
                                            } else {
                                                $("#observacion_verificacion_cuenta").attr("value", "");
                                                $("#propuesta_cuenta").attr("value", json.propuesta);
                                                $("#programadocumento_cuenta").attr("value", documento);
//                                                $("#actualizar_observacion_verificacion_cuenta").show();
                                            }

                                            break;
                                    }

                                }
                                );
                                break;
                            case '2':
                                $("#cuenta_bancaria").hide();
                                $("#rut").show();
                                $("#otros_documentos").hide();
                                //llamada para verificar parametro
                                $.ajax({
                                    type: 'POST',
                                    url: url_pv + 'PropuestasDocumentacionganadores/verificar_propuestas_parametros_ganadores/propuesta/' + id_propuesta,
                                    data: {
                                        "token": token_actual.token,
                                        "documento": documento
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
                                            if (json.id) {
                                                $("#info_comp_rut").attr("value", json.valor);
                                                $("#programadocumento_rut").attr("value", documento);
                                            } else {
                                                $("#programadocumento_rut").attr("value", documento);
                                            }

                                            break;
                                    }

                                }
                                );

                                //llamada para verificar observación
                                $.ajax({
                                    type: 'POST',
                                    url: url_pv + 'PropuestasDocumentacionganadores/verificar_observacion_documentacion_rut/propuesta/' + id_propuesta,
                                    data: {
                                        "token": token_actual.token,
                                        "documento": documento
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
                                            if (json.id) {
//                                                $("#actualizar_parametro_otros").show();
                                                if (json.observacion_verificacion !== null) {
                                                    $("#observacion_verificacion_rut").attr("value", json.observacion_verificacion);
                                                } else {
                                                    $("#observacion_verificacion_rut").attr("value", "");
                                                }
                                                $("#observacion_verificacion_rut").attr("value", json.observacion_verificacion);
                                                $("#propuesta_rut").attr("value", json.propuesta);
                                                $("#programadocumento_rut").attr("value", documento);
                                                $("#actualizar_observacion_verificacion_rut").show();
                                            } else {
                                                $("#observacion_verificacion_rut").attr("value", "");
                                                $("#propuesta_rut").attr("value", json.propuesta);
                                                $("#programadocumento_rut").attr("value", documento);
                                                $("#actualizar_observacion_verificacion_rut").show();
                                            }

                                            break;
                                    }

                                }
                                );
                                break;

                            default:
                                $("#cuenta_bancaria").hide();
                                $("#rut").hide();
                                $("#otros_documentos").show();
                                document.getElementById("formulario_complementar_informacion_otros").reset();
                                //llamada para verificar parametro
                                $.ajax({
                                    type: 'POST',
                                    url: url_pv + 'PropuestasDocumentacionganadores/verificar_propuestas_parametros_ganadores_otros/propuesta/' + id_propuesta,
                                    data: {
                                        "token": token_actual.token,
                                        "documento": documento
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
                                            document.getElementById("formulario_complementar_informacion_otros").reset();
                                            var json = JSON.parse(data);
                                            if (json.id) {

                                                $("#info_comp_otros").attr("value", json.valor);
                                                $("#programadocumento").attr("value", documento);
                                                $("#actualizar_parametro_otros").show();
                                                $("#guardar_parametro_otros").hide();
                                            } else {
                                                $("#info_comp_otros").attr("value", "");
                                                $("#programadocumento").attr("value", documento);
                                                $("#guardar_parametro_otros").show();
                                                $("#actualizar_parametro_otros").hide();
                                            }

                                            break;
                                    }

                                }
                                );
                                //llamada para verificar observación
                                $.ajax({
                                    type: 'POST',
                                    url: url_pv + 'PropuestasDocumentacionganadores/verificar_observacion_documentacion_otros/propuesta/' + id_propuesta,
                                    data: {
                                        "token": token_actual.token,
                                        "documento": documento
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
                                            if (json.id) {
//                                                $("#actualizar_parametro_otros").show();
                                                if (json.observacion_verificacion !== null) {
                                                    $("#observacion_verificacion_otros").attr("value", json.observacion_verificacion);
                                                } else {
                                                    $("#observacion_verificacion_otros").attr("value", "");
                                                }
                                                $("#observacion_verificacion_otros").attr("value", json.observacion_verificacion);
                                                $("#propuesta_otros").attr("value", json.propuesta);
                                                $("#programadocumento_otros").attr("value", documento);
                                                $("#actualizar_observacion_verificacion_rut").show();
                                            } else {
                                                $("#observacion_verificacion_otros").attr("value", "");
                                                $("#propuesta_otros").attr("value", json.propuesta);
                                                $("#programadocumento_otros").attr("value", documento);
                                                $("#actualizar_observacion_verificacion_otros").show();
                                            }

                                            break;
                                    }

                                }
                                );
                                break;
                        }

                    });
                }

                if (json.convocatoriasdocumentos) {
                    var items = '';
                    var i = 1;

                    $.each(json.convocatoriasdocumentos, function (k, a) {
                        items = items + '<tr>'
                                + '<td>' + i + '</td>'
                                + '<td>' + a.monto_asignado + '</td>'
                                + '<td>' + a.valor_pago + '</td>'
                                + '<td>' + a.estado + '</td>'
                                + '<td>' + a.radicado_cuenta_orfeo + '</td>'
                                + '<td>'
                                + '<button id = "' + a.id_alfresco + '" title="' + (a.id_alfresco == null ? "No se ha cargado archivo" : "Descargar archivo") + '" type="button" class="btn btn-primary download_file">'
                                + (a.id_alfresco == null ? '<span class="glyphicon glyphicon-ban-circle" title="No se ha cargado archivo"></span>' : '<span class="glyphicon glyphicon-download-alt"></span>')
                                + '</button>'
                                + '</td>'
                                + '<td>'
                                + '<button title="' + a.id + '" convocatoriadocumento="' + a.id_convocatoriadocumento + '" propuesta="' + a.id_propuesta + '" type="button" class="btn btn-success btn_info_convocatoria" data-toggle="modal" data-target="#complementar_informacion_convocatoria"><span class="glyphicon glyphicon-pencil"></span></button>'
                                + '</td>'
                                + '<td>'
                                + '<button title="' + a.id_convocatoriadocumento + '" convocatoriadocumento_radicar="' + a.id_convocatoriadocumento + '" propuesta_radicar="' + a.id_propuesta + '" numero_pago="' + i + '" type="button" class="btn btn-info btn_confirmar_radicar" data-toggle="modal" data-target="#confirmar_radicar"><span class="glyphicon glyphicon-share"></span></button>'
                                + '</td>'
                                + '</tr>';
                        i=i+1;
                    });
                    $("#pagos_table").html(items);


                    $(".btn_confirmar_radicar").click(function () {

                        var numero_pago = $(this).attr("numero_pago");
                        var id_propuesta = $(this).attr("propuesta_radicar");
                        $('#id_propuesta_misional').val(id_propuesta);
                        $('#tipo_pago').val(numero_pago);
                    });

                    $(".btn_info_convocatoria").click(function () {

                        var documento = $(this).attr("convocatoriadocumento");
                        var id_propuesta = $(this).attr("propuesta");

                        //llamada para verificar parametro
                        $.ajax({
                            type: 'POST',
                            url: url_pv + 'PropuestasDocumentacionganadores/verificar_propuestas_parametros_ganadores_convocatoriadocumento/propuesta/' + id_propuesta,
                            data: {
                                "token": token_actual.token,
                                "documento": documento
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
                                    if (json.id) {
//                                                $("#actualizar_parametro_otros").show();
                                        $("#info_comp_convocatoriadocumento").attr("value", json.valor);
                                        $("#convocatoriadocumento").attr("value", documento);
                                    } else {
                                        $("#info_comp_convocatoriadocumento").attr("value", "");
                                        $("#guardar_parametro_convocatoriadocumento").show();
                                    }

                                    break;
                            }

                        }
                        );

                        //llamada para verificar observación
                        $.ajax({
                            type: 'POST',
                            url: url_pv + 'PropuestasDocumentacionganadores/verificar_observacion_documentacion_convocatoriadocumento/propuesta/' + id_propuesta,
                            data: {
                                "token": token_actual.token,
                                "documento": documento
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
                                    if (json.id) {
//                                                $("#actualizar_parametro_otros").show();
                                        $("#observacion_verificacion").attr("value", json.observacion_verificacion);
                                        $("#porcentaje_pagar").attr("value", json.porcentaje_ganadores);
                                        $("#radicado_cuenta_orfeo").attr("value", json.radicado_cuenta_orfeo);
                                        $("#propuesta").attr("value", json.propuesta);
                                        $("#convocatoriadocumento").attr("value", documento);
                                        $("#actualizar_observacion_verificacion").show();
                                    } else {
                                        $("#observacion_verificacion").attr("value", "");
                                        $("#porcentaje_pagar").attr("value", "");
                                        $("#radicado_cuenta_orfeo").attr("value", "");
                                        $("#actualizar_observacion_verificacion").show();
                                    }

                                    break;
                            }

                        }
                        );

                    });
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
                        url: url_pv + 'Flujodepagosmisional/download_file/',
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



/*
 * 14-10-2021
 * Wilmer Gustavo Mogollón Duque
 * Se agrega función actualizar_observacion_verificacion_convocatoriadocumento 
 */


function actualizar_observacion_verificacion_convocatoriadocumento(token_actual, convocatoriadocumento, label_convocatoriadocumento, id_html_convocatoriadocumento, observacion_verificacion, id_propuesta, porcentaje_pagar, radicado_cuenta_orfeo) {

    $.ajax({
        type: 'PUT',
        url: url_pv + 'PropuestasDocumentacionganadores/actualizar_observacion_verificacion_convocatoriadocumento/propuesta/' + id_propuesta,
        data: "&modulo=SICON-PAGOS-MISIONAL&token=" + token_actual.token
                + "&convocatoriadocumento=" + convocatoriadocumento
                + "&label_convocatoriadocumento=" + label_convocatoriadocumento
                + "&id_html_convocatoriadocumento=" + id_html_convocatoriadocumento
                + "&observacion_verificacion=" + observacion_verificacion
                + "&porcentaje_pagar=" + porcentaje_pagar


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
            case 'error_info_comp':
                notify("danger", "remove", "Usuario:", "Debe agregar una descripción de la documentación");
                break;
            case 'info_comp_porcentaje_pagar':
                notify("danger", "remove", "Usuario:", "Debe agregar el porcentaje correspondiente a éste pago");
                break;
            case 'info_comp_radicado_cuenta_orfeo':
                notify("danger", "remove", "Usuario:", "Debe agregar el número de radicado de cuenta en Orfeo");
                break;
            case 'error_porcentaje':
                notify("danger", "remove", "Usuario:", "El porcentaje ingresado supera la totalidad del monto asignado, por favor valide los pagos parciales anteriores");
                break;
            case 'error_faltan_documentos':
                notify("danger", "remove", "Usuario:", "Debe adjuntar un soporte por cada uno de los requisitos");
                break;
            case 'ya_fue_radicado':
                notify("danger", "remove", "Usuario:", "El pago seleccionado ya fue radicado, por lo tanto no puede hacer modificaciones");
                break;
            default:
                notify("success", "ok", "Usuario:", "Se registró la información con éxito.");
                $('#complementar_informacion_convocatoria').modal('hide');
                cargar_info_basica(token_actual, id_propuesta);
                break;
        }

    });
}


function subsanar_observacion_verificacion_convocatoriadocumento(token_actual, convocatoriadocumento, label_convocatoriadocumento, id_html_convocatoriadocumento, observacion_verificacion, id_propuesta, porcentaje_pagar, radicado_cuenta_orfeo) {

    $.ajax({
        type: 'PUT',
        url: url_pv + 'PropuestasDocumentacionganadores/subsanar_observacion_verificacion_convocatoriadocumento/propuesta/' + id_propuesta,
        data: "&modulo=SICON-PAGOS-MISIONAL&token=" + token_actual.token
                + "&convocatoriadocumento=" + convocatoriadocumento
                + "&label_convocatoriadocumento=" + label_convocatoriadocumento
                + "&id_html_convocatoriadocumento=" + id_html_convocatoriadocumento
                + "&observacion_verificacion=" + observacion_verificacion
                + "&porcentaje_pagar=" + porcentaje_pagar
                + "&radicado_cuenta_orfeo=" + radicado_cuenta_orfeo

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
            case 'error_info_comp':
                notify("danger", "remove", "Usuario:", "Debe agregar una descripción de la documentación");
                break;
            case 'error_porcentaje':
                notify("danger", "remove", "Usuario:", "El porcentaje ingresado supera la totalidad del monto asignado, por favor valide los pagos parciales anteriores");
                break;
            case 'error_faltan_documentos':
                notify("danger", "remove", "Usuario:", "Debe adjuntar un soporte por cada uno de los requisitos");
                break;
            case 'ya_fue_radicado':
                notify("danger", "remove", "Usuario:", "El pago seleccionado ya fue radicado, por lo tanto no puede hacer modificaciones");
                break;
            default:
                notify("success", "ok", "Usuario:", "Se registró la información con éxito.");
                $('#complementar_informacion_convocatoria').modal('hide');
                cargar_info_basica(token_actual, id_propuesta);
                break;
        }

    });
}


function actualizar_observacion_verificacion_rut(token_actual, programadocumento_rut, label, id_html, observacion_verificacion_rut, id_propuesta) {

    $.ajax({
        type: 'PUT',
        url: url_pv + 'PropuestasDocumentacionganadores/actualizar_observacion_verificacion_rut/propuesta/' + id_propuesta,
        data: "&modulo=SICON-PAGOS-MISIONAL&token=" + token_actual.token
                + "&programadocumento_rut=" + programadocumento_rut
                + "&label=" + label
                + "&id_html=" + id_html
                + "&observacion_verificacion_rut=" + observacion_verificacion_rut

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
            case 'error_info_comp':
                notify("danger", "remove", "Usuario:", "Debe agregar una descripción de la documentación");
                break;
            case 'error_faltan_documentos':
                notify("danger", "remove", "Usuario:", "Debe adjuntar un soporte por cada uno de los requisitos");
                break;
            default:
                notify("success", "ok", "Usuario:", "Se registró la información con éxito.");
                $('#complementar_informacion').modal('hide');
                cargar_info_basica(token_actual, id_propuesta);
                break;
        }

    });
}


function subsanar_observacion_verificacion_rut(token_actual, programadocumento_rut, label, id_html, observacion_verificacion_rut, id_propuesta) {

    $.ajax({
        type: 'PUT',
        url: url_pv + 'PropuestasDocumentacionganadores/subsanar_observacion_verificacion_rut/propuesta/' + id_propuesta,
        data: "&modulo=SICON-PAGOS-MISIONAL&token=" + token_actual.token
                + "&programadocumento_rut=" + programadocumento_rut
                + "&label=" + label
                + "&id_html=" + id_html
                + "&observacion_verificacion_rut=" + observacion_verificacion_rut

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
            case 'error_info_comp':
                notify("danger", "remove", "Usuario:", "Debe agregar una descripción de la documentación");
                break;
            case 'error_faltan_documentos':
                notify("danger", "remove", "Usuario:", "Debe adjuntar un soporte por cada uno de los requisitos");
                break;
            default:
                notify("success", "ok", "Usuario:", "Se registró la información con éxito.");
                $('#complementar_informacion').modal('hide');
                cargar_info_basica(token_actual, id_propuesta);
                break;
        }

    });
}


function actualizar_observacion_verificacion_cuenta(token_actual, programadocumento_cuenta, label_cuenta_observacon, id_html_cuenta_observacon, observacion_verificacion_cuenta, id_propuesta) {

    $.ajax({
        type: 'PUT',
        url: url_pv + 'PropuestasDocumentacionganadores/actualizar_observacion_verificacion_cuenta/propuesta/' + id_propuesta,
        data: "&modulo=SICON-PAGOS-MISIONAL&token=" + token_actual.token
                + "&programadocumento_cuenta=" + programadocumento_cuenta
                + "&label_cuenta_observacon=" + label_cuenta_observacon
                + "&id_html_cuenta_observacon=" + id_html_cuenta_observacon
                + "&observacion_verificacion_cuenta=" + observacion_verificacion_cuenta

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
            case 'error_info_comp':
                notify("danger", "remove", "Usuario:", "Debe agregar una descripción de la documentación");
                break;
            case 'error_faltan_documentos':
                notify("danger", "remove", "Usuario:", "Debe adjuntar un soporte por cada uno de los requisitos");
                break;
            default:
                notify("success", "ok", "Usuario:", "Se registró la información con éxito.");
                $('#complementar_informacion').modal('hide');
                cargar_info_basica(token_actual, id_propuesta);
                break;
        }

    });
}


function subsanar_observacion_verificacion_cuenta(token_actual, programadocumento_cuenta, label_cuenta_observacon, id_html_cuenta_observacon, observacion_verificacion_cuenta, id_propuesta) {

    $.ajax({
        type: 'PUT',
        url: url_pv + 'PropuestasDocumentacionganadores/subsanar_observacion_verificacion_cuenta/propuesta/' + id_propuesta,
        data: "&modulo=SICON-PAGOS-MISIONAL&token=" + token_actual.token
                + "&programadocumento_cuenta=" + programadocumento_cuenta
                + "&label_cuenta_observacon=" + label_cuenta_observacon
                + "&id_html_cuenta_observacon=" + id_html_cuenta_observacon
                + "&observacion_verificacion_cuenta=" + observacion_verificacion_cuenta

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
            case 'error_info_comp':
                notify("danger", "remove", "Usuario:", "Debe agregar una descripción de la documentación");
                break;
            case 'error_faltan_documentos':
                notify("danger", "remove", "Usuario:", "Debe adjuntar un soporte por cada uno de los requisitos");
                break;
            default:
                notify("success", "ok", "Usuario:", "Se registró la información con éxito.");
                $('#complementar_informacion').modal('hide');
                cargar_info_basica(token_actual, id_propuesta);
                break;
        }

    });
}


function actualizar_observacion_verificacion_otros(token_actual, programadocumento_otros, label_otros, id_html_otros, observacion_verificacion_otros, id_propuesta) {

    $.ajax({
        type: 'PUT',
        url: url_pv + 'PropuestasDocumentacionganadores/actualizar_observacion_verificacion_otros/propuesta/' + id_propuesta,
        data: "&modulo=SICON-PAGOS-MISIONAL&token=" + token_actual.token
                + "&programadocumento_otros=" + programadocumento_otros
                + "&label_otros=" + label_otros
                + "&id_html_otros=" + id_html_otros
                + "&observacion_verificacion_otros=" + observacion_verificacion_otros

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
            case 'error_info_comp':
                notify("danger", "remove", "Usuario:", "Debe agregar una descripción de la documentación");
                break;
            case 'error_faltan_documentos':
                notify("danger", "remove", "Usuario:", "Debe adjuntar un soporte por cada uno de los requisitos");
                break;
            default:
                notify("success", "ok", "Usuario:", "Se registró la información con éxito.");
                $('#complementar_informacion').modal('hide');
                cargar_info_basica(token_actual, id_propuesta);
                break;
        }

    });
}


function subsanar_observacion_verificacion_otros(token_actual, programadocumento_otros, label_otros, id_html_otros, observacion_verificacion_otros, id_propuesta) {

    $.ajax({
        type: 'PUT',
        url: url_pv + 'PropuestasDocumentacionganadores/subsanar_observacion_verificacion_otros/propuesta/' + id_propuesta,
        data: "&modulo=SICON-PAGOS-MISIONAL&token=" + token_actual.token
                + "&programadocumento_otros=" + programadocumento_otros
                + "&label_otros=" + label_otros
                + "&id_html_otros=" + id_html_otros
                + "&observacion_verificacion_otros=" + observacion_verificacion_otros

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
            case 'error_info_comp':
                notify("danger", "remove", "Usuario:", "Debe agregar una descripción de la documentación");
                break;
            case 'error_faltan_documentos':
                notify("danger", "remove", "Usuario:", "Debe adjuntar un soporte por cada uno de los requisitos");
                break;
            default:
                notify("success", "ok", "Usuario:", "Se registró la información con éxito.");
                $('#complementar_informacion').modal('hide');
                cargar_info_basica(token_actual, id_propuesta);
                break;
        }

    });
}


function aprobar_documentacion_ganador_misional(token_actual, id_propuesta, fecha_aprobacion_garantia, fecha_informe_seguimiento_supervision) {
    $.ajax({
        type: 'PUT',
        url: url_pv + 'Flujodepagosmisional/aprobar_documentacion_ganador_misional/propuesta/' + id_propuesta,
        data: "&modulo=SICON-PAGOS-MISIONAL&token=" + token_actual.token
                + "&fecha_aprobacion_garantia=" + fecha_aprobacion_garantia
                + "&fecha_informe_seguimiento_supervision=" + fecha_informe_seguimiento_supervision

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
            case 'error_fecha_aprobacion_garantia':
                notify("danger", "remove", "Usuario:", "Debe agregar la fecha de aprobación de garantía");
                break;
            case 'error_fecha_informe_seguimiento_supervisio':
                notify("danger", "remove", "Usuario:", "Debe agregar la fecha de informe de seguimiento a la supervisión");
                break;
            case 'error_radicado_cuenta_orfeo':
                notify("danger", "remove", "Usuario:", "Debe agregar el número de radicado de cuenta en Orfeo");
                break;
            case 'error_faltan_documentos_por_aprobar':
                notify("danger", "remove", "Usuario:", "Aún tiene documentos sin aprobar");
                break;
            case 'error_estado_ganadores_aprobado':
                notify("danger", "remove", "Usuario:", "La documentación ya fue aprobada");
                break;
            case 'error_estado_ganadores_subsanar':
                notify("danger", "remove", "Usuario:", "La documentación ya fue enviada a subsanar");
                break;
            default:
                notify("success", "ok", "Usuario:", "Se aprobó la documentación con éxito.");
                $('#evaluarModal').modal('hide');
                cargar_tabla(token_actual);
                break;
        }

    });
}


/*
 * 23-05-2022
 * Wilmer Mogollón
 * Se agrega función para radicar en orfeo
 */

function radicar_documentacion(token_actual, id_propuesta, tipo_pago) {
    $.ajax({
        type: 'PUT',
        url: url_pv + 'Flujodepagosmisional/radicar_documentacion/propuesta/' + id_propuesta,
        data: "&modulo=SICON-PAGOS-MISIONAL&token=" + token_actual.token
                + "&tipo_pago=" + tipo_pago


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
            case 'error_token_postman':
                notify("danger", "remove", "Usuario:", "No tiene permisos para ejecutar esta accion. Token invalido.");
                break;
            case 'error_tipo_pago':
                notify("danger", "remove", "Usuario:", "Debe seleccionar el tipo de pago correspondiente.");
                $('#confirmar_radicar').modal('hide');
                break;
            case 'error_faltan_documentos':
                notify("danger", "remove", "Usuario:", "No se ha relacionado el documento principal del radicado.");
                $('#confirmar_radicar').modal('hide');
                break;
            case 'ya_tiene_radicado':
                notify("danger", "remove", "Usuario:", "El documento principal ya se encuentra asociado a un radicado generado previamente.");
                $('#confirmar_radicar').modal('hide');
                break;
            case 'error_crear_usuario_keycloak':
                notify("danger", "remove", "Usuario:", "Ha ocurrido un error al crear el usuario en Keycloak.");
                $('#confirmar_radicar').modal('hide');
                break;
            case 'error_datos_ciudadano':
                notify("danger", "remove", "Usuario:", "Debe especificar los datos del ciudadano.");
                $('#confirmar_radicar').modal('hide');
                break;
            default:
                notify("success", "ok", "Usuario:", "Se ha radicado la documentación con éxito.");
                cargar_tabla(token_actual);
                cargar_info_basica(token_actual, id_propuesta);
                $('#confirmar_radicar').modal('hide');
                break;
        }

    });
}


function devolver_documentacion_ganador_misional(token_actual, id_propuesta, fecha_aprobacion_garantia, fecha_informe_seguimiento_supervision) {
    $.ajax({
        type: 'PUT',
        url: url_pv + 'Flujodepagosmisional/devolver_documentacion_ganador_misional/propuesta/' + id_propuesta,
        data: "&modulo=SICON-PAGOS-MISIONAL&token=" + token_actual.token
                + "&fecha_aprobacion_garantia=" + fecha_aprobacion_garantia
                + "&fecha_informe_seguimiento_supervision=" + fecha_informe_seguimiento_supervision

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
            case 'error_no_hay_documentos_por_subsanar':
                notify("danger", "remove", "Usuario:", "No se encontraron documentos que se hayan enviado a subsanar");
                break;
            case 'error_faltan_documentos_por_aprobar':
                notify("danger", "remove", "Usuario:", "Aún tiene documentos sin aprobar");
                break;
            case 'error_estado_ganadores_aprobado':
                notify("danger", "remove", "Usuario:", "La documentación ya fue aprobada");
                break;
            case 'error_estado_ganadores_subsanar':
                notify("danger", "remove", "Usuario:", "La documentación ya fue enviada a subsanar");
                break;
            default:
                notify("success", "ok", "Usuario:", "Se notificó la subsanación de la documentación al ganador con éxito.");
                $('#evaluarModal').modal('hide');
                cargar_tabla(token_actual);
                break;
        }

    });
}