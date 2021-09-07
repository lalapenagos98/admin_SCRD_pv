//Array del consumo con el back
keycloak.init(initOptions).then(function (authenticated) {
//Si no esta autenticado lo obliga a ingresar al keycloak


    if (authenticated === false) {
        keycloak.login();
    } else {

        //Guardamos el token en el local storage
        if (typeof keycloak === 'object') {



            var token_actual = JSON.parse(JSON.stringify(keycloak));

            //Verifica si el token actual tiene acceso de lectura
            permiso_lectura_keycloak(token_actual.token, "SICON-JURADOS-REGISTRO-GANADORES");

            //Cargamos el menu principal
            $.ajax({
                type: 'POST',
                data: {"token": token_actual.token, "id": getURLParameter('id'), "m": getURLParameter('m'), "p": getURLParameter('p'), "sub": getURLParameter('sub')},
                url: url_pv + 'Administrador/menu'
            }).done(function (result) {
                if (result === 'error_token')
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


            $("#exampleModal").on('hide.bs.modal', function () {
                $('#filtro').val(null);
                $('#palabra_clave').val(null);
                $("#formulario_busqueda_banco").trigger("reset");
            });

            $("#evaluar").on('hide.bs.modal', function () {

            });

            $(".guardar_aplica_perfil").click(function () {

                //Se evalua si algun radiobutton es seleccionado
                if ($("input[name=option_aplica_perfil]:checked").length == 0) {

                    notify("danger", "remove", "Usuario:", "Debe seleccionar si aplica el perfil o no");
                    return false;
                }

                if ($('.guardar_aplica_perfil').hasClass('disabled')) {
                    return false;
                } else {
                    evaluar_perfil(token_actual, $("#id_jurados_postulados").val(), $("#id_participante_sel").val());
                }

            });

            $("#alertModalSelbaceptar").click(function () {
                //  $("#alertModalSel").modal("hide");
                //seleccionar_jurado(token_actual,  $("#id_jurados_postulados").val(),   $("#id_participante_sel").val() );
                $('#select_categorias_2').hide();
                $('#categorias').val($('#categorias_2').val());
                $("#panel_tabs").show();

            });

            $("#notificar_aceptar").click(function () {

                notificar(token_actual, $("#id_jurado_postulado").val());
            });

            $("#notificarModal").on('hide.bs.modal', function () {
                // $('.form_notificar').bootstrapValidator('resetFormData', true);
                //$(".form_notificar").trigger("reset");
                //$('.form_notificar').data('bootstrapValidator').destroy()
                //console.log("estado...ssssll");
            });


            /*
             * Botón para registrar el ganador
             */

            $("#baceptargan").click(function () {

//            alert("Hola");
//            alert($('#id_jurado_postulado').val());

//                token_actual = getLocalStorage(name_local_storage);
//            registrar_ganador_jurado(token_actual, $('#id_jurado_postulado').val(), $('#numero_resolucion').val(), $('#fecha_resolucion').val(), $('#monto_asignado').val(), $('#codigo_presupuestal').val(), $('#codigo_proyecto_inversion').val(), $('#cdp').val(), $('#crp').val());
//            validator_form(token_actual);

//            limpiarFormulario();

            });

        }
    }

}).catch(function () {
    location.href = url_pv_admin + 'error_keycloak.html';
});

//Agrego para limpiar el formulario
function limpiarFormulario() {
    document.getElementById("formulario_registro_ganador").reset();
}



function init(token_actual) {
    //Realizo la peticion para cargar el formulario
    $.ajax({
        type: 'POST',
        data: {"token": token_actual.token, "id": $("#id").attr('value')},
        url: url_pv + 'Registroganadoresjurados/init/'
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

/*
 * 27-10-2020
 * Wilmer Gustavo Mogollón Duque
 * Se incorpora función registrar_ganador_jurado
 */

function registrar_ganador_jurado(token_actual, id_jurado_postulado, numero_resolucion, fecha_resolucion, monto_asignado, codigo_presupuestal, codigo_proyecto_inversion, cdp, crp, valor_estimulo, fecha_inicio_ejecucion, fecha_fin_ejecucion, nombre_resolucion) {


    $.ajax({
        type: 'PUT',
        url: url_pv + 'Registroganadoresjurados/registrar_ganador_jurado/postulacion/' + id_jurado_postulado,
        data: "&modulo=SICON-JURADOS-REGISTRO-GANADORES&token=" + token_actual.token + "&numero_resolucion=" + numero_resolucion + "&fecha_resolucion=" + fecha_resolucion + "&codigo_presupuestal=" + codigo_presupuestal + "&codigo_proyecto_inversion=" + codigo_proyecto_inversion + "&cdp=" + cdp + "&crp=" + crp + "&valor_estimulo=" + valor_estimulo + "&fecha_inicio_ejecucion=" + fecha_inicio_ejecucion + "&fecha_fin_ejecucion=" + fecha_fin_ejecucion + "&nombre_resolucion=" + nombre_resolucion

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

function cargar_select_convocatorias(token_actual, anio, entidad) {


    $.ajax({
        type: 'POST',
        url: url_pv + 'Registroganadoresjurados/select_convocatorias',
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
        type: 'POST',
        url: url_pv + 'Registroganadoresjurados/select_categorias',
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
        "ajax": {
            type: 'POST',
            url: url_pv + "Registroganadoresjurados/all_seleccionados",
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
            {"data": "Estado notificación",
                render: function (data, type, row) {
                    return row.estado_notificacion;
                },
            },

            /*{"data": "Seleccionar",
             render: function ( data, type, row ) {
             return ' <input title=\"'+row.id+'\" type=\"checkbox\" class=\"check_activar_'+row.active+'  activar_registro" '+(row.active? 'checked ':'')+' />';
             },
             },*/
            {"data": "Acciones",
                render: function (data, type, row) {
                    return '<button id="' + row.id_postulacion + '" title="Registrar ganador" type="button" class="btn btn-success btn_cargar_registro" data-toggle="modal" data-target="#registrarganadorModal" id-participante="' + row.id + '"  postulado= "' + row.postulado + '">'
                            + '<span class="fa fa-star-o"></span></button>';

                },
            }



        ]
    });

}

function acciones_registro(token_actual) {

    //$("#evaluar").trigger("reset");

    $(".btn_cargar_registro_old").click(function () {

        $("#id_jurado_postulado").val($(this).attr("id"));

        if ($(this).attr("postulado")) {
            $('#select_tipo_jurado').val("Seleccionado");
            //$('#select_tipo_jurado').prop('disabled', 'disabled');
        } else {
            $('#select_tipo_jurado').val(null);
            //$('#select_tipo_jurado').removeAttr('disabled');
        }


    });


    /****/

    /*
     * Se incorpora para cargar el formulario del estímulo
     */

    $(".btn_cargar_registro").click(function () {

        $("#id_jurado_postulado").val($(this).attr("id"));
        var id_postulacion = $(this).attr("id");
        cargar_formulario(token_actual, id_postulacion);

    });



    /****/

    $(".btn_declinar").click(function () {

        declinar(token_actual, $(this).attr("id"))

    });

    $(".btn_cargar_notificacion").click(function () {
        cargar_notificacion(token_actual, $(this).attr("id"));
    });



    /*
     * 22-07-2020
     * Wilmer Gustavo Mogollón Duque
     */
    $('.btn_carta').click(function () {

        var postulacion = $(this).attr("id");

        window.open(url_pv_report + 'reporte_carta_aceptacion.php?postulacion=' + postulacion, '_blank');


    });



}

/*
 * 20-07-2020
 * Wilmer Gustavo Mogollón Duque
 * Se incorpora función genera_carta_acpetacion
 */

function genera_carta_acpetacion(token_actual, postulacion) {

    window.open(url_pv + "FormatosDoc/carta_aceptacion_notificacion/postulacion/" + postulacion, "_blank");

}

/*
 * 23-10-2020
 * Wilmer Gustavo Mogollón Duque
 * Se incorpora función cargar_formulario para el registro de ganadores
 */

function cargar_formulario(token_actual, id_postulacion){
    $.ajax({
        type: 'POST',
        url: url_pv + 'Registroganadoresjurados/postulacion/' + id_postulacion,
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

                var href_cer = url_pv_report + 'reporte_certificacion.php?entidad=' + json.entidad.nombre + '&tp=' + json.tp + '&id=' + json.notificacion.id + '&token=' + token_actual.token;


                $("#generar_certificado").attr('href', href_cer);


                if (json.notificacion) {
                    $("#numero_resolucion").attr("value", json.notificacion.numero_resolucion);
                    $("#fecha_resolucion").attr("value", json.notificacion.fecha_resolucion);
                    $("#fecha_inicio_ejecucion").attr("value", json.notificacion.fecha_inicio_ejecucion);
                    $("#fecha_fin_ejecucion").attr("value", json.notificacion.fecha_fin_ejecucion);
                    $("#nombre_resolucion").attr("value", json.notificacion.nombre_resolucion);
                    $("#codigo_presupuestal").attr("value", json.notificacion.codigo_presupuestal);
                    $("#codigo_proyecto_inversion").attr("value", json.notificacion.codigo_proyecto_inversion);
                    $("#cdp").attr("value", json.notificacion.cdp);
                    $("#crp").attr("value", json.notificacion.crp);
                    $("#valor_estimulo").attr("value", json.notificacion.valor_estimulo);
                }

                break;

        }

    }
    );

}




function notificar(token_actual, postulacion) {

    $.ajax({
        type: 'PUT',
        url: url_pv + 'Registroganadoresjurados/notificar',
        data: $("#form_notificar").serialize()
                + "&modulo=Jurados&token=" + token_actual.token
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
        url: url_pv + 'Registroganadoresjurados/declinar',
        data: "modulo=Jurados&token=" + token_actual.token
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
        type: 'GET',
        data: {"token": token_actual.token, "key": notificacion_key},
        url: url_pv + 'Registroganadoresjurados/notificacion/'
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
                    $('#notificacionModal_usuario').html(json.usuario);
                    $('#notificacionModal_fecha_creacion').html(json.fecha_creacion);
                    $('#notificacionModal_tipo_jurado').html(json.tipo_jurado);
                    $('#notificacionModal_rol_jurado').html(json.rol_jurado);
                    $('#notificacionModal_fecha_aceptacion').html(json.fecha_aceptacion);
                    $('#notificacionModal_fecha_rechazo').html(json.fecha_rechazo);
                    $('#notificacionModal_estimulo').html(json.valor_estimulo);

                }


                break;
        }

    });

}

function validator_form(token_actual) {

    //Se debe colocar debido a que el calendario es un componente diferente
    $('.c1').on('changeDate show', function (e) {
        $('.formulario_registro_ganador').bootstrapValidator('revalidateField', 'fecha_resolucion');
    });




    $('.formulario_registro_ganador').bootstrapValidator({
        feedbackIcons: {
            valid: 'glyphicon glyphicon-ok',
            invalid: 'glyphicon glyphicon-remove',
            validating: 'glyphicon glyphicon-refresh'
        },
        fields: {
            numero_resolucion: {
                validators: {
                    notEmpty: {message: 'El número de resolución es requerido'}
                }
            },
            fecha_resolucion: {
                validators: {
                    notEmpty: {message: 'La fecha de de resolución es requerida'}
                }
            },
            codigo_presupuestal: {
                validators: {
                    notEmpty: {message: 'El código presupuestal es requerido'}
                }
            },
            codigo_proyecto_inversion: {
                validators: {
                    notEmpty: {
                        message: 'El código de proyecto de inversión es requerido'
                    }
                }
            },
            cdp: {
                validators: {
                    notEmpty: {
                        message: 'El CDP es requerido'
                    }
                }
            },
            crp: {
                validators: {
                    notEmpty: {
                        message: 'El CRP es requerido'
                    }
                }
            },
            valor_estimulo: {
                validators: {
                    notEmpty: {
                        message: 'El valor del estímulo es requerido'
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

        registrar_ganador_jurado(token_actual, $('#id_jurado_postulado').val(), $('#numero_resolucion').val(), $('#fecha_resolucion').val(), $('#monto_asignado').val(), $('#codigo_presupuestal').val(), $('#codigo_proyecto_inversion').val(), $('#cdp').val(), $('#crp').val(), $('#valor_estimulo').val(), $('#fecha_inicio_ejecucion').val(), $('#fecha_fin_ejecucion').val(), $('#nombre_resolucion').val());
        $('#registrarganadorModal').modal('hide');
        limpiarFormulario();



        cargar_tabla(token_actual);

//        $form.bootstrapValidator('disableSubmitButtons', false).bootstrapValidator('resetForm', true);
        bv.resetForm();
//        $("#registrarganadorModal").modal("toggle");


    });

}
