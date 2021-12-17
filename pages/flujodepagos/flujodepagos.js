//Array del consumo con el back
keycloak.init(initOptions).then(function (authenticated) {



    $("#notificacion_periodo").hide();
    $("#notificacion_evaluaciones").hide();
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
            permiso_lectura_keycloak(token_actual.token, "SICON-PAGOS-PANEL");

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
//                $('#rondas').val(null);
//                cargar_select_rondas(token_actual, $('#convocatorias').val());
                //cargar_tabla(token_actual);
            });
            //carga el select rondas
            $('#categorias').change(function () {
//                $('#rondas').val(null);
//                cargar_select_rondas(token_actual, $('#categorias').val());
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




            validator_form(token_actual);
        }

    }

});

function init(token_actual) {
    //Realizo la peticion para cargar el formulario
    $.ajax({
        type: 'POST',
        data: {"token": token_actual.token, "id": $("#id").attr('value')},
        url: url_pv + 'Flujodepagos/init/'
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
        url: url_pv + 'Flujodepagos/select_convocatorias',
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
        url: url_pv + 'Flujodepagos/select_categorias',
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
            url: url_pv + "Flujodepagos/all_propuestas_ganadoras",
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
            if (row.misional === "Si") {
                $('td', "Verificación Misional").css('background-color', '#dcf4dc');
            } else if (row.misional === "No") {
                $('td', row).css('background-color', '#f4dcdc');
            }
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
            {"data": "Verificación Misional",
                render: function (data, type, row) {
                    if (row.misional === "No") {
                        return '<button id="misional" title="Aún no cuenta con la verificación" type="button" class="btn btn-danger">'
                                + '<span class="glyphicon glyphicon-remove"></span></button>';
                    }
                    if (row.misional === "Si-No") {
                        return '<button id="misional" title="Fue devuelto a verificación del Misional" type="button" class="btn btn-warning">'
                                + '<span class="glyphicon glyphicon-remove"></span></button>';
                    }
                    if (row.misional === "Si") {
                        return '<button id="misional" title="Ya cuenta con la verificación" type="button" class="btn btn-success">'
                                + '<span class="glyphicon glyphicon-ok"></span></button>';
                    }
                },
            },
            {"data": "Verificación Financiero",
                render: function (data, type, row) {
                    if (row.financiero === "No") {
                        return '<button id="financiero" title="Aún no cuenta con la verificación" class="btn btn-danger">'
                                + '<span class="glyphicon glyphicon-remove"></span></button>';
                    } else {
                        return '<button id="financiero" title="Ya cuenta con la verificación" class="btn btn-success">'
                                + '<span class="glyphicon glyphicon-ok"></span></button>';
                    }
                },
            },
            {"data": "Verificación Directopr de Fomento",
                render: function (data, type, row) {
                    if (row.fomento === "No") {
                        return '<button id="fomento" title="Aún no cuenta con la verificación" class="btn btn-danger">'
                                + '<span class="glyphicon glyphicon-remove"></span></button>';
                    } else {
                        return '<button id="fomento" title="Ya cuenta con la verificación" class="btn btn-success">'
                                + '<span class="glyphicon glyphicon-ok"></span></button>';
                    }
                },
            },
            {"data": "Verificación Asesor",
                render: function (data, type, row) {
                    if (row.asesor === "No") {
                        return '<button id="asesor" title="Aún no cuenta con la verificación" class="btn btn-danger">'
                                + '<span class="glyphicon glyphicon-remove"></span></button>';
                    } else {
                        return '<button id="asesor" title="Ya cuenta con la verificación" class="btn btn-success">'
                                + '<span class="glyphicon glyphicon-ok"></span></button>';
                    }
                },
            },
            {"data": "Verificación Subsecretaría de Gobernanza",
                render: function (data, type, row) {
                    if (row.subsecretaria === "No") {
                        return '<button id="subsecretaria" title="Aún no cuenta con la verificación" class="btn btn-danger">'
                                + '<span class="glyphicon glyphicon-remove"></span></button>';
                    } else {
                        return '<button id="subsecretaria" title="Ya cuenta con la verificación" class="btn btn-success">'
                                + '<span class="glyphicon glyphicon-ok"></span></button>';
                    }
                },
            },
            /*{"data": "aciones",
                render: function (data, type, row) {
                    return '<button id="' + row.id + '" title="Ver evaluación" type="button" class="btn btn-warning btn_ver" data-toggle="modal" data-target="#estadopagoModal" id_propuesta="' + row.id + '" top_general="' + row.promedio + '">'
                            + '<span class="glyphicon glyphicon-eye-open"></span></button>';
                },
            }*/
            /*{"data": "Estado de la evaluación",
             render: function ( data, type, row ) {
             return row.estado_evaluacion;
             },
             },*/


            /*{"data": "Seleccionar",
             render: function ( data, type, row ) {
             return ' <input title=\"'+row.id+'\" type=\"checkbox\" class=\"check_activar_'+row.active+'  activar_registro" '+(row.active? 'checked ':'')+' />';
             },
             },
             */



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
