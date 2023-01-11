/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

/*Cesar Britto*/
$(document).ready(function () {


    $("#idc").val($("#id").val());
    $("#id").val(null);

    //Verifico si el token exite en el cliente y verifico que el token este activo en el servidor
    var token_actual = getLocalStorage(name_local_storage);

    //Verifico si el token esta vacio, para enviarlo a que ingrese de nuevo
    if ($.isEmptyObject(token_actual)) {
        location.href = url_pv_admin + 'index.html?msg=Su sesión ha expirado, por favor vuelva a ingresar.&msg_tipo=danger';
    } else
    {
        //Verifica si el token actual tiene acceso de lectura
        permiso_lectura(token_actual, "Menu Participante");
        
        alert("Recuerde diligenciar toda la información requerida para este formulario");
        $("#back_step").attr("onclick", " location.href = 'experiencia_jurado.html?m=2&id=" + $("#idc").val() + "' ");
        $("#next_step").attr("onclick", " location.href = 'publicaciones.html?m=2&id=" + $("#idc").val() + "' ");

        //Peticion para buscar ciudades
        var json_ciudades = function (request, response) {
            $.ajax({
                type: 'GET',
                data: {"token": token_actual.token, "id": $("#id").attr('value'), q: request.term},
                url: url_pv + 'Ciudades/autocompletar/',
                dataType: "jsonp",
                success: function (data) {
                    response(data);
                }
            });
        };

        //Cargos el autocomplete de ciudad
        $("#ciudad_name").autocomplete({
            source: json_ciudades,
            minLength: 2,
            select: function (event, ui) {
                $(this).val(ui.item ? ui.item : " ");
                $("#ciudad").val(ui.item.id);
            },
            change: function (event, ui) {
                if (!ui.item) {
                    this.value = '';
                    $('.formulario_principal').bootstrapValidator('revalidateField', 'ciudad_name');
                    $("#ciudad").val("");
                }
                //else { Return your label here }
            }
        });

        $("#archivo").on('change', function () {

            $('#formulario_principal').bootstrapValidator('addField', 'archivo', {
                validators: {
                    //notEmpty: {message: 'El archivo es requerido'},
                    file: {
                        extension: 'pdf',
                        type: 'application/pdf',
                        message: 'El archivo seleccionado no es válido',
                    }
                }
            });

            //console.log( $('#archivo')[0].files[0].size );

            //4974593 = 5mb
            if ($('#archivo')[0].files[0].size > 4974593) {
                notify("danger", "remove", "Usuario:", "El archivo sobrepasa el tamaño máximo permitido");
                $('#archivo').val('');
            }

        });

        cargar_datos_formulario(token_actual);
        cargar_tabla(token_actual);
        validator_form(token_actual);
        /*Validar si existe una convocatoria de jurados vigente*/
        validar_convocatoria_jurados(token_actual);


    }

});

function cargar_datos_formulario(token_actual) {

    // cargo los datos
    $.ajax({
        type: 'GET',
        url: url_pv + 'PropuestasJurados/search_reconocimiento',
        data: {"token": token_actual.token, "idc": $("#idc").val(), "idregistro": $("#idregistro").val()},

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

                if (json.usuario_perfil) {

                    //Cargos el select de tipo_entidad
                    $('#tipo').find('option').remove();
                    $("#tipo").append('<option value="">:: Seleccionar ::</option>');
                    if (json.tipo.length > 0) {
                        $.each(json.tipo, function (key, array) {
                            $("#tipo").append('<option value="' + array.id + '" >' + array.nombre + '</option>');
                        });
                    }

                    //Cargo el formulario con los datos
                    if (json.reconocimiento) {
                        $('#ciudad_name').val(json.ciudad_name);
                        $('#ciudad').val(json.reconocimiento.ciudad.id);
                        $('.formulario_principal').loadJSON(json.reconocimiento);
                    }

                    $("#formulario_principal").show();

                } else {

                    //window.location.href = url_pv_admin+"pages/perfilesparticipantes/jurado.html";
                    notify("danger", "ok", "Convocatorias:", "No tiene el perfil de participante para esta convocatoria");

                }

                break;
        }

    }

    );

}

function cargar_tabla(token_actual) {
    // console.log("idconvocatoria-->"+$("#idc").val() );
    //Cargar datos en la tabla actual
    $('#table_list').DataTable({
        "language": {
            "url": "../../dist/libraries/datatables/js/spanish.json"
        },
        "paging": true,
        "processing": true,
        "destroy": true,
        "serverSide": true,
        "lengthMenu": [10, 15, 20, 30, 50, 100], //07-05-2020 Wilmer Mogollón -se agregan valores al array
        "responsive": true,
        "ajax": {
            url: url_pv + "PropuestasJurados/all_reconocimiento",
            data: {"token": token_actual.token, "idc": $("#idc").val()},
            async: false
        },
        "drawCallback": function (settings) {
            //$(".check_activar_t").attr("checked", "true");
            //$(".check_activar_f").removeAttr("checked");
            acciones_registro(token_actual);
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
            {"data": "Seleccionar",
                render: function (data, type, row) {
                    return ' <input title=\"' + row.id + '\" type=\"checkbox\" class=\"check_activar_' + row.active + '  activar_registro" ' + (row.active ? 'checked ' : '') + ' />';
                },
            },
            {"data": "aciones",
                render: function (data, type, row) {
                    return '<button title="' + row.id + '" type="button" class="btn btn-warning btn_cargar" data-toggle="modal" data-target="#nueva_ronda\">'
                            + '<span class="glyphicon glyphicon-edit"></span></button>'
                            + '<button title="' + (row.file == null ? "No se ha cargado archivo" : row.file) + '" type="button" class="btn btn-primary download_file">'
                            + (row.file == null ? '<span class="glyphicon glyphicon-ban-circle" title="No se ha cargado archivo"></span>' : '<span class="glyphicon glyphicon-download-alt"></span>')
                            + '</button>';
                },
            }

        ]
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
            nombre: {
                validators: {
                    notEmpty: {message: 'El nombre del reconocimiento es requerido'}
                }
            },
            institucion: {
                validators: {
                    notEmpty: {message: 'La institución es requerida'}
                }
            },
            anio: {
                validators: {
                    notEmpty: {message: 'El año es requerido'},
                    integer: {message: 'El año debe ser numérico'}
                }
            },
            tipo: {
                validators: {
                    notEmpty: {message: 'El tipo es requerido'}
                }
            },
            ciudad_name: {
                validators: {
                    notEmpty: {message: 'La cidudad es requerida'}
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

        var formData = new FormData(document.getElementById("formulario_principal"));
        formData.append("modulo", "Menu Participante");
        formData.append("token", token_actual.token);
        formData.append("convocatoria", $("#id").attr('value'));
        formData.append("anexos", "documentacion");

        //console.log("formData-->"+formData);

        //console.log("idregistro-->"+$("#idregistro").val());

        if (typeof $("#idregistro").attr('value') == 'undefined' || $("#idregistro").val() == '') {
            // console.log("guardar");

            //$("#id").val($("#idp").attr('value'));
            //Se realiza la peticion con el fin de guardar el registro actual
            $.ajax({
                type: 'POST',
                url: url_pv + 'PropuestasJurados/new_reconocimiento',
                //data: $form.serialize() + "&modulo=Menu Participante&token=" + token_actual.token,
                data: formData,
                cache: false,
                contentType: false,
                processData: false,
                async: false

            }).done(function (result) {

                switch (result) {
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
                        // cargar_datos_formulario(token_actual);
                        break;
                    case 'error_creo_alfresco':
                        notify("danger", "remove", "Usuario:", "Se registró un error, comuníquese con la mesa de ayuda convocatorias@scrd.gov.co");
                        //cargar_datos_formulario(token_actual);
                        break;
                    default:
                        notify("success", "ok", "Convocatorias:", "Se agregó el registro con éxito.");
                        //cargar_datos_formulario(token_actual);
                        break;
                }

            });

        } else {
            // console.log("Actualizar");
            //console.log("Actualizar -->"+$("#idregistro").val());

            $.ajax({
                type: 'POST',
                url: url_pv + 'PropuestasJurados/edit_reconocimiento/' + $("#idregistro").val(),
                //data: $form.serialize() + "&modulo=Menu Participante&token=" + token_actual.token,
                data: formData,
                cache: false,
                contentType: false,
                processData: false,
                async: false
            }).done(function (result) {

                switch (result) {
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
                    case 'error_creo_alfresco':
                        notify("danger", "remove", "Usuario:", "Se registró un error, comuníquese con la mesa de ayuda convocatorias@scrd.gov.co");
                        //cargar_datos_formulario(token_actual);
                        break;
                    default:
                        notify("success", "ok", "Convocatorias:", "Se actualizó el registro con éxito.");
                        //cargar_datos_formulario(token_actual);
                        break;
                }

            }
            );

        }

        $("#idregistro").val(null);
        $("#archivo").val(null);
        $form.bootstrapValidator('disableSubmitButtons', false).bootstrapValidator('resetForm', true);
        //$form.bootstrapValidator('destroy', true);
        bv.resetForm();
        cargar_datos_formulario(token_actual);
        cargar_tabla(token_actual);
    });

}

//Permite realizar acciones despues de cargar la tabla
function acciones_registro(token_actual) {

    //Permite realizar la carga respectiva de cada registro
    $(".btn_cargar").click(function () {
        $("#idregistro").val($(this).attr("title"));
        // cargo los datos
        cargar_datos_formulario(token_actual);
    });

    //Permite activar o eliminar una registro
    $(".activar_registro").click(function () {

        //Cambio el estado del check
        var active = "false";

        if ($(this).prop('checked')) {
            active = "true";
        }

        //Peticion para inactivar el evento
        $.ajax({
            type: 'DELETE',
            data: {"token": token_actual.token, "modulo": "Menu Participante", "active": active, "idc": $("#idc").val()},
            url: url_pv + 'PropuestasJurados/delete_reconocimiento/' + $(this).attr("title")
        }).done(function (result) {

            switch (result) {
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
                    cargar_datos_formulario(token_actual);
                    break;
                default:
                    notify("success", "ok", "Convocatorias:", "Se actualizó el registro con éxito.");
                    cargar_datos_formulario(token_actual);
                    break;
            }


        });
    });

    //desarcar archivo
    $(".download_file").click(function () {
        //Cargo el id file
        var cod = $(this).attr('title');

        $.AjaxDownloader({
            url: url_pv + 'PropuestasJurados/download_file/',
            data: {
                cod: cod,
                token: token_actual.token
            }
        });

    });

}

/*
 * 29-09-2021
 * Wilmer Gustavo Mogollón Duque
 * Se agrega función validar_estado_envio_documentacion
 */
function validar_convocatoria_jurados(token_actual) {
    $.ajax({
        type: 'GET',
        url: url_pv + 'Jurados/validar_convocatoria_jurados',
        data: {"token": token_actual.token}

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
                var json = JSON.parse(data);
                if (json.disponible === true) {
                    $("#convocatoria").attr("value", json.convocatoria.id);
                    $("#modalidad_participa_jurado").html(json.propuesta_jurado.modalidad_participa);
                    if (json.tiene_hoja_de_vida === false) {
                        $("#botones_acciones_jurado_sin_hoja").show();
                    } else {
                        if (json.hoja_de_vida_banco_actual === true) {

                            if (json.propuesta_jurado.estado === 10) {
                                $("#estado").hide();
                                $("#listado_postulaciones").show();
                                $("#busqueda_convocatorias").show();
                            } else {
                                $("#estado").show();
                                $("#listado_postulaciones").hide();
                                $("#busqueda_convocatorias").hide();
                            }

                        }
                    }
//                    $("#info_general").attr("value", json.observaciones_documentos_ganadores);
                } else {
                    $("#convocatoria_no_disponible").show();
                    $("#mensaje_jurados").hide();
                }
        }

    });
}
