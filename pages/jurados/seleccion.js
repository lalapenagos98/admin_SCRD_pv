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
        url: url_pv + 'Juradosseleccion/init/'
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
        url: url_pv + 'Juradosseleccion/select_convocatorias',
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
        url: url_pv + 'Juradosseleccion/select_categorias',
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
            url: url_pv + "Juradosseleccion/all_seleccionados",
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
            // Verificar si el puntaje es mayor a 80 cambia de color a verde
            if (data["puntaje"]>=80) {
                $('td', row).css('background-color', '#dcf4dc');
            } else if (!data["puntaje"]) {
                $('td', row).css('background-color', '');
            }
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
                    return '<button id="' + row.id_postulacion + '" title="Notificar" type="button" class="btn btn-primary btn_cargar_notificar" data-toggle="modal" data-target="#notificarModal" id-participante="' + row.id + '"  postulado= "' + row.postulado + '">'
                            + '<span class="fa fa-send-o"></span></button>'
                            + '<button id="' + row.notificacion + '" title="Declinar notificación" type="button" class="btn btn-danger btn_declinar"  id-participante="' + row.id + '" ' + (row.estado_notificacion == "Declinada" ? "disabled" : "") + '>'
                            + '<span class="fa fa-ban"></span></button>'
                            + '<button id="' + row.notificacion + '" title="Ver notificación" type="button" class="btn  btn-warning btn_cargar_notificacion" data-toggle="modal" data-target="#notificacionModal" id-participante="' + row.id + '">'
                            + '<span class="fa fa-file-text-o"></span></button>'
                            + '<button id="' + row.id_postulacion + '" title="Ver respuesta a notificación" type="button" class="btn  btn-info btn_carta" id-participante="' + row.id + '">'
                            + '<span class="fa fa-ticket"></span></button>';

                },
            }



        ]
    });

}

function acciones_registro(token_actual) {

    //$("#evaluar").trigger("reset");

    $(".btn_cargar_notificar").click(function () {

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

function notificar(token_actual, postulacion) {

    $.ajax({
        type: 'PUT',
        url: url_pv + 'Juradosseleccion/notificar',
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
        url: url_pv + 'Juradosseleccion/declinar',
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
        url: url_pv + 'Juradosseleccion/notificacion/'
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



/*
 * 22-06-2021
 * Wilmer Gustavo Mogollón Duque
 * Se incorpora función para realizar cambio de rol a jurado
 */


function cambiar_rol_jurado(token_actual, notificacion, rol_nuevo) {

    $.ajax({
        type: 'PUT',
        url: url_pv + 'Juradosseleccion/cambiar_rol_jurado',
        data: "&modulo=SICON-JURADOS-SELECCION&token=" + token_actual.token
                + "&idnotificacion=" + notificacion
                + "&rol_nuevo=" + rol_nuevo
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
            case 'error_notificacion':
                notify("danger", "remove", "Usuario:", "Error el jurado no ha sido notificado.");
                //cargar_datos_formulario(token_actual);
                break;
            default:
                notify("success", "ok", "Convocatorias:", "Se actualizó el rol del jurado con éxito.");
                //  $(".guardar_aplica_perfil").addClass( "disabled" );
                cargar_tabla(token_actual);
                break;
        }

    });

}
