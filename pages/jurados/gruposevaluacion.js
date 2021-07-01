$(document).ready(function () {





//Verifico si el token exite en el cliente y verifico que el token este activo en el servidor
    var token_actual = getLocalStorage(name_local_storage);
    if ($.isEmptyObject(token_actual)) {
        location.href = url_pv_admin + 'index.html?msg=Su sesión ha expirado, por favor vuelva a ingresar.&msg_tipo=danger';
    } else
    {

        $('.convocatorias-search').select2();
        //Verifica si el token actual tiene acceso de lectura
        permiso_lectura(token_actual, "Jurados");
        init(token_actual);
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
            if ($('#convocatorias').val() !== '') {
                $('#crear_grupo').show();
                $('#habilitar_evaluaciones').show();
            } else {
                $('#crear_grupo').hide();
                $('#habilitar_evaluaciones').hide();
            }
        });
        $('#categorias').change(function () {
            cargar_tabla(token_actual);
        });
        $("#crear_grupo").click(function () {
            $("#form_grupo").trigger("reset");
            //$(".form_grupo").bootstrapValidator('resetForm', true);
            cargar_select_grupos(token_actual);
            /*
             * 22-04-2020
             * WILMER GUSTAVO MOGOLLÓN DUQUE
             * Se modifica el data para enviar el valor de la categoría.
             */
            cargar_select_rondas(token_actual, $('#convocatorias').val(), $('#categorias').val());
            cargar_tabla_jurados_aceptaron(token_actual);
        });
        $("#crear_grupoModal_cancelar").click(function () {
            $("#crear_grupoModal").modal("hide");
        });
        $("#crear_grupoModal").on('hide.bs.modal', function () {
            $("#form_grupo").trigger("reset");
            //$(".form_grupo").bootstrapValidator('resetForm', true);
            $(".form_grupo").bootstrapValidator('destroy', true);
        });
        /*$("#editar_grupoModal_aceptar").click(function(){
         //crear_grupo(token_actual);
         $("#editar_grupoModal").modal("hide");
         
         });*/

        $("#editar_grupoModal_cancelar").click(function () {
            $("#editar_grupoModal").modal("hide");
        });
        $("#editar_grupoModal").on('hide.bs.modal', function () {
            $("#form_grupo_editar").trigger("reset");
        });

        /*
         * 09-03-2021
         * Wilmer Gustavo Mogollón Duque
         * Se agrega función paa controlar el comportamiento del modal de habilitar evaluaciones
         */

        //habilitar_evaluaciones
        $("#habilitar_evaluaciones").click(function () {

            $("#mensajehabilitar").show();
            $("#bcancelarhabilitar").show();
            $("#baceptarhabilitar").show();
        });

        $("#baceptarhabilitar").click(function () {
            if ($('#categorias').val() !== '') {
                habilitar_evaluaciones(token_actual, $('#categorias').val());
            } else {
                habilitar_evaluaciones(token_actual, $('#convocatorias').val());
            }
            $('#habilitar_evaluaciones_modal').modal('hide');
        });
    }


});
function init(token_actual) {
    $('#crear_grupo').hide();
    $('#habilitar_evaluaciones').hide();
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
        "ajax": {
            url: url_pv + "Gruposevaluacion/all_grupos_evaluacion",
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

            /*  if ( data["aplica_perfil"] ){
             $('td', row).css('background-color', '#dcf4dc');
             }
             else if ( !data["aplica_perfil"]){
             $('td', row).css('background-color', '#f4dcdc');
             }*/

        },
        "columns": [
            {"data": "id",
                render: function (data, type, row) {
                    return (row.id);
                },
            },
            {"data": "Nombre del grupo",
                render: function (data, type, row) {
                    return row.nombre_grupo;
                },
            },
            {"data": "Estado",
                render: function (data, type, row) {
                    return row.nombre_estado;
                },
            },
            {"data": "Número de jurados principales",
                render: function (data, type, row) {
                    return row.numero_principales;
                },
            },
            {"data": "Número de jurados suplentes",
                render: function (data, type, row) {
                    return row.numero_suplentes;
                },
            },
            {"data": "Número total de jurados",
                render: function (data, type, row) {
                    return row.numero_total;
                },
            },
            {"data": "aciones",
                render: function (data, type, row) {
                    return   (row.estado == 18 ?
                            '<button id="' + row.id + '" title="Confirmar grupo de evaluación" type="button" class="btn btn-warning btn_confirmar" >'
                            + '<span class="glyphicon glyphicon-ok"></span></button>' : "") +
                            '<button id="' + row.id + '" title="Editar grupo de evaluación" type="button" class="btn btn-primary btn_editar" data-toggle="modal" data-target="#editar_grupoModal" >'
                            + '<span class="glyphicon glyphicon-edit"></span></button>'+
                            '<button id="' + row.id + '" title="Desactivar grupo de evaluación" type="button" class="btn btn-danger btn_desactivar"  >'
                            + '<span class="glyphicon glyphicon-thumbs-down"></span></button>';
                },
            }



        ]
    });
}

function acciones_registro(token_actual) {

    $(".btn_editar").click(function () {

        $(".form_grupo_editar").bootstrapValidator('destroy', true);
        cargar_select_rondas_editar(token_actual, $('#convocatorias').val(), $('#categorias').val(), $(this).attr("id")); ///
        cargar_grupo(token_actual, $(this).attr("id"));
        cargar_tabla_jurados_aceptaron_editar(token_actual, $(this).attr("id"));
    });
    $(".btn_confirmar").click(function () {
        confirmar_grupo(token_actual, $(this).attr("id"));
    });
    /*
     * 28-06-2021
     * Wilmer Gustavo Mogollón Duque
     * Se función desactivar_grupo
     */
    $(".btn_desactivar").click(function () {
        desactivar_grupo(token_actual, $(this).attr("id"));
    });

    




}

function cargar_select_rondas(token_actual, convocatoria, categoria) {


    $.ajax({
        type: 'GET',
        url: url_pv + 'Gruposevaluacion/select_rondas',
        /*
         * 22-04-2020
         * WILMER GUSTAVO MOGOLLÓN DUQUE
         * Se modifica el data para enviar el valor de la categoría.
         */
        data: {"token": token_actual.token, "convocatoria": convocatoria, "categoria": categoria},
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
                $('.rondas').val();
                $('.rondas').find('option').remove();
                $('.rondas').append('<option value="">:: Seleccionar ::</option>');
                if (json != null && json.length > 0) {

                    $.each(json, function (key, array) {
                        $('.rondas').append('<option value="' + array.id + '" >' + array.nombre + '</option>');
                    });
                }

                break;
        }

    }
    );
}

function cargar_select_grupos(token_actual) {


    $.ajax({
        type: 'GET',
        url: url_pv + 'Gruposevaluacion/select_grupos',
        data: {"token": token_actual.token},
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
                $('#grupos').val();
                $('#grupos').find('option').remove();
                $("#grupos").append('<option value="">:: Seleccionar ::</option>');
                if (json != null && json.length > 0) {

                    $.each(json, function (key, array) {
                        $("#grupos").append('<option value="' + array.id + '" >' + array.nombre + '</option>');
                    });
                }

                break;
        }

    }
    );
}

function cargar_tabla_jurados_aceptaron(token_actual) {

    $('#table_list_jurados_aceptaron').DataTable({
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
            url: url_pv + "Gruposevaluacion/jurados_aceptaron",
            data:
                    {"token": token_actual.token,
                        "convocatoria": $('#convocatorias').val(),
                        "categoria": $('#categorias').val()
                    },
            //async: false
        },
        "drawCallback": function (settings) {
            //$(".check_activar_t").attr("checked", "true");
            //$(".check_activar_f").removeAttr("checked");
            //acciones_registro(token_actual);
            //$("#form_grupo").trigger("reset");
            //$(".form_grupo").bootstrapValidator('resetForm', true);
            validator_forms(token_actual);
        },
        "rowCallback": function (row, data, index) {
            /*  if ( data["aplica_perfil"] ){
             $('td', row).css('background-color', '#dcf4dc');
             }
             else if ( !data["aplica_perfil"]){
             $('td', row).css('background-color', '#f4dcdc');
             }*/
        },
        "columns": [
            {"data": "Código",
                render: function (data, type, row) {
                    return (row.codigo_propuesta);
                },
            },
            {"data": "Tipo de documento",
                render: function (data, type, row) {
                    return row.tipo_documento;
                },
            },
            {"data": "Número de documento",
                render: function (data, type, row) {
                    return row.numero_documento;
                },
            },
            {"data": "Nombre",
                render: function (data, type, row) {
                    return row.nombres + " " + row.apellidos;
                },
            },
            {"data": "Rol",
                render: function (data, type, row) {
                    return row.rol;
                },
            },
            {"data": "Seleccionar",
                render: function (data, type, row) {
                    /*return '<button id="'+row.id_postulacion+'" title="Evaluar la hoja de vida " type="button" class="btn btn-primary btn_cargar" data-toggle="modal" data-target="#evaluar" id-participante="'+row.id+'">'
                     +'<span class="glyphicon glyphicon-check"></span></button>' */
                    return '<input type="checkbox" name="seleccionados[]" value="' + row.id_postulacion + '">'
                            ;
                },
            }



        ]
    });
}

function validator_forms(token_actual) {



    console.log("validando!!!");
    console.log($("input[name='seleccionados[]']:checked").length);
    //$('.form_grupo').bootstrapValidator('revalidateField', $("input[name='seleccionados[]']") );

    $('.form_grupo').bootstrapValidator({
        feedbackIcons: {
            valid: 'glyphicon glyphicon-ok',
            invalid: 'glyphicon glyphicon-remove',
            validating: 'glyphicon glyphicon-refresh'
        },
        excluded: ':disabled',
        fields: {
            grupos: {
                validators: {
                    notEmpty: {message: 'El grupo de evaluación es requerido'}
                }
            },
            'rondas[]': {
                validators: {
                    notEmpty: {message: 'La ronda de evaluación es requerida'}
                }
            },
            'seleccionados[]': {
                validators: {
                    choice: {
                        min: 1,
                        max: 100,
                        message: 'Debe seleccionar mínimo un jurado'
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
        //$form.bootstrapValidator('resetForm', true);

        //  console.log("form-->" + $form.serialize());

        crear_grupo(token_actual);
        $form.bootstrapValidator('disableSubmitButtons', false).bootstrapValidator('resetForm', true);
        bv.resetForm();
        $("#crear_grupoModal").modal("hide");
    });
}

function crear_grupo(token_actual) {

//alert( "rondas-->"+$(".rondas").val() );

    $.ajax({
        type: 'PUT',
        url: url_pv + 'Gruposevaluacion/new',
        data: $("#form_grupo").serialize()
                + "&modulo=Jurados&token=" + token_actual.token
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
            case 'error_suplente':
                notify("danger", "remove", "Usuario:", "Cada grupo debe tener por lo menos un jurado suplente");
                break;
            default:
                notify("success", "ok", "Convocatorias:", "Se creó el grupo con éxito.");
                //  $(".guardar_aplica_perfil").addClass( "disabled" );
                cargar_tabla(token_actual);
                break;
        }

    });
}

/*
 * 23-04-2020
 * WILMER GUSTAVO MOGOLLÓN
 * Se incluye el parametro categoría para que se despliegue la lista de rondas en editar
 */
function cargar_select_rondas_editar(token_actual, convocatoria, categoria, grupo) { //se agrega categoría

    $.ajax({
        type: 'GET',
        url: url_pv + 'Gruposevaluacion/select_rondas_editar',
        data: {"token": token_actual.token, "convocatoria": convocatoria, "categoria": categoria, "grupo": grupo}, //se agrega categoría a data
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
                $('.rondas_editar').val();
                $('.rondas_editar').find('option').remove();
                $('.rondas_editar').append('<option value="">:: Seleccionar ::</option>');
                if (json != null && json.length > 0) {

                    $.each(json, function (key, array) {
                        if (array.seleccionado) {
                            $('.rondas_editar').append('<option value="' + array.id + '" selected="">' + array.nombre + '</option>');
                        } else {
                            $('.rondas_editar').append('<option value="' + array.id + '" >' + array.nombre + '</option>');
                        }

                    });
                }

                break;
        }

    }
    );
}

function cargar_grupo(token_actual, grupo) {

    $('#form_grupo_editar_fieldset').removeAttr('disabled');
    $.ajax({
        type: 'GET',
        url: url_pv + 'Gruposevaluacion/grupo/' + grupo,
        data: {"token": token_actual.token},
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

                    $("#nombre_grupo").html(json.nombre);
                    if (json.estado > 18) {
                        $('#form_grupo_editar_fieldset').prop('disabled', true);
                    }

                }

                break;
        }

    }
    );
}

function cargar_tabla_jurados_aceptaron_editar(token_actual, grupo) {

    $('#table_list_jurados_aceptaron_editar').DataTable({
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
            url: url_pv + "Gruposevaluacion/jurados_aceptaron_and_evaluadores",
            data:
                    {"token": token_actual.token,
                        "convocatoria": $('#convocatorias').val(),
                        "categoria": $('#categorias').val(),
                        "grupo": grupo
                    },
            //async: false
        },
        "drawCallback": function (settings) {
            //$(".check_activar_t").attr("checked", "true");
            //$(".check_activar_f").removeAttr("checked");
            //acciones_registro(token_actual);
            //$("#form_grupo").trigger("reset");
            //$(".form_grupo").bootstrapValidator('resetForm', true);
            validator_forms_editar(token_actual, grupo);
        },
        "rowCallback": function (row, data, index) {
            /*  if ( data["aplica_perfil"] ){
             $('td', row).css('background-color', '#dcf4dc');
             }
             else if ( !data["aplica_perfil"]){
             $('td', row).css('background-color', '#f4dcdc');
             }*/
        },
        "columns": [
            {"data": "Código",
                render: function (data, type, row) {
                    return (row.codigo_propuesta);
                },
            },
            {"data": "Tipo de documento",
                render: function (data, type, row) {
                    return row.tipo_documento;
                },
            },
            {"data": "Número de documento",
                render: function (data, type, row) {
                    return row.numero_documento;
                },
            },
            {"data": "Nombre",
                render: function (data, type, row) {
                    return row.nombres + " " + row.apellidos;
                },
            },
            {"data": "Rol",
                render: function (data, type, row) {
                    return row.rol;
                },
            },
            {"data": "Seleccionar",
                render: function (data, type, row) {
                    /*return '<button id="'+row.id_postulacion+'" title="Evaluar la hoja de vida " type="button" class="btn btn-primary btn_cargar" data-toggle="modal" data-target="#evaluar" id-participante="'+row.id+'">'
                     +'<span class="glyphicon glyphicon-check"></span></button>' */
                    return '<input type="checkbox" name="seleccionados_editar[]" value="' + row.id_postulacion + '" ' + ((row.id_evaluador != null) ? ' checked="" ' : "") + '>'

                            ;
                },
            }



        ]
    });
}

function validator_forms_editar(token_actual, grupo) {

//$('.form_grupo').bootstrapValidator('revalidateField', $("input[name='seleccionados[]']") );

    $('.form_grupo_editar').bootstrapValidator({
        feedbackIcons: {
            valid: 'glyphicon glyphicon-ok',
            invalid: 'glyphicon glyphicon-remove',
            validating: 'glyphicon glyphicon-refresh'
        },
        excluded: ':disabled',
        fields: {

            'rondas_editar[]': {
                validators: {
                    notEmpty: {message: 'La ronda de evaluación es requerida'}
                }
            },
            'seleccionados_editar[]': {
                validators: {
                    choice: {
                        min: 1,
                        max: 100,
                        message: 'Debe seleccionar mínimo un jurado'
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
        //$form.bootstrapValidator('resetForm', true);

        //  console.log("form-->" + $form.serialize());

        editar_grupo(token_actual, grupo);
        $form.bootstrapValidator('disableSubmitButtons', false).bootstrapValidator('resetForm', true);
        bv.resetForm();
        $("#editar_grupoModal").modal("hide");
    });
}

function editar_grupo(token_actual, grupo) {

    $.ajax({
        type: 'PUT',
        url: url_pv + 'Gruposevaluacion/grupo/' + grupo,
        data: $("#form_grupo_editar").serialize()
                + "&modulo=Jurados&token=" + token_actual.token
                + "&convocatoria=" + $('#convocatorias').val()
                + "&categoria=" + $('#categorias').val()
                + "&ronda=" + $('.rondas_editar').val()
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
                notify("success", "ok", "Convocatorias:", "Se editó el grupo con éxito.");
                //  $(".guardar_aplica_perfil").addClass( "disabled" );
                cargar_tabla(token_actual);
                break;
        }

    });
}

function confirmar_grupo(token_actual, grupo) {

    $.ajax({
        type: 'PUT',
        url: url_pv + 'Gruposevaluacion/confirmar/' + grupo,
        data: "modulo=Jurados&token=" + token_actual.token

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
                notify("success", "ok", "Convocatorias:", "Se editó el grupo con éxito.");
                //  $(".guardar_aplica_perfil").addClass( "disabled" );
                cargar_tabla(token_actual);
                break;
        }

    });
}


/*
 * 28-06-2021
 * Wilmer Gustavo Mogollón Duque
 * Se agrega función para desactivar_grupo un grupo de evaluación
 */

function desactivar_grupo(token_actual, grupo) {

    $.ajax({
        type: 'PUT',
        url: url_pv + 'Gruposevaluacion/desactivar/' + grupo,
        data: "modulo=Jurados&token=" + token_actual.token

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
                notify("danger", "remove", "Usuario:", "El grupo de evaluación ya fue confirmado.");
                //cargar_datos_formulario(token_actual);
                break;
            default:
                notify("success", "ok", "Convocatorias:", "Se desactivó el grupo con éxito.");
                //  $(".guardar_aplica_perfil").addClass( "disabled" );
                cargar_tabla(token_actual);
                break;
        }

    });
}


/*
 * 09-03-2021
 * Wilmer Gustavo Mogollón Duque
 * Se incorpora función para distribuir las propuestas deacuerdo a los grupos de evaluación que se hayan creado por cada
 */


function habilitar_evaluaciones(token_actual, id_convocatoria) {

    $.ajax({
        type: 'PUT',
        url: url_pv + 'Gruposevaluacion/habilitar_evaluaciones/' + id_convocatoria,
        data: "modulo=Jurados&token=" + token_actual.token

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
            case 'error_grupos_confirmados':
                notify("danger", "remove", "Usuario:", "Tiene grupos de evaluación sin confirmar");
                break;
            case 'error_postulacion':
                notify("danger", "remove", "Usuario:", "Hay una postulación que no esta activa");
                break;
            default:
                notify("success", "ok", "Usuario:", "Se habilitaron las evaluaciones con éxito.");
                //$(".criterios").attr('disabled','');
                cargar_tabla(token_actual);
                break;
        }

    });


}