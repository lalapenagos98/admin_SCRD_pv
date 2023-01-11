/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

/*Cesar Britto*/

$(document).ready(function () {

    $("#idc").val($("#id").val());
    $("#id").val(null);

    $("#next_step").attr("title", "");
    $("#next_step").attr("data-original-title", "");

    //Verifico si el token exite en el cliente y verifico que el token este activo en el servidor
    var token_actual = getLocalStorage(name_local_storage);

    //Verifico si el token esta vacio, para enviarlo a que ingrese de nuevo
    if ($.isEmptyObject(token_actual)) {
        location.href = url_pv_admin + 'index.html?msg=Su sesión ha expirado, por favor vuelva a ingresar.&msg_tipo=danger';
    } else
    {
        //Verifica si el token actual tiene acceso de lectura
        permiso_lectura(token_actual, "Menu Participante");

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


        cargar_datos_formulario(token_actual);
        cargar_tabla(token_actual);
        validator_form(token_actual);

        determinar_modalidad(token_actual);
        
        /*Validar si existe una convocatoria de jurados vigente*/
        validar_convocatoria_jurados(token_actual);



        $("#back_step").attr("onclick", " location.href = 'perfil.html?m=2&id=" + $("#idc").val() + "' ");
        
        alert("Recuerde diligenciar toda la información requerida para este formulario");

        if ($("#modalidad_participa_educacion").val() === "Experto con título universitario"){
            $("#next_step").attr("onclick", " location.href = 'experiencia_profesional.html?m=2&id=" + $("#idc").val() + "' ");
            $("#next_step").attr("title", " Ingresar la información sobre experiencia disciplinar. ");
            $("#next_step").attr("data-original-title", " Ingresar la información sobre experiencia disciplinar. ");
        } 
        if ($("#modalidad_participa_educacion").val() === "Experto sin título universitario"){
            $("#next_step").attr("onclick", " location.href = 'educacion_no_formal.html?m=2&id=" + $("#idc").val() + "' ");
            $("#next_step").attr("title", " Ingresar la información sobre educación no formal. ");
            $("#next_step").attr("data-original-title", " Ingresar la información sobre educación no formal. ");
        }


        //alert($('#nivel_educacion').val());
        //Si el nivel es superior a bachiller muestra los select areasconocimientos y nucleosbasicos
        $('#nivel_educacion').change(function () {
            $("#nivel_educacion").val() > 2 ? $("#niveleseducativosextra").show() : $("#niveleseducativosextra").hide();
            //alert($('#nivel_educacion').val());
        });

        //cargar_select_nucleobasico
        $('#area_conocimiento').change(function () {
            cargar_select_nucleobasico(token_actual, $('#area_conocimiento').val());
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



            if ($('#archivo')[0].files.length > 0) {

                console.log($('#archivo')[0].files[0]);

                //4974593 = 5mb
                if (($('#archivo')[0].files[0]).size > 4974593) {

                    notify("danger", "remove", "Usuario:", "El archivo sobrepasa el tamaño máximo permitido");
                    $('#archivo').val('');
                    //$('#formulario_principal').bootstrapValidator('removeField', 'archivo');
                    $('#formulario_principal').bootstrapValidator('revalidateField', 'archivo');
                    //$('#formulario_principal').bootstrapValidator('resetField', 'archivo');

                } else {
                    $('#formulario_principal').bootstrapValidator('revalidateField', 'archivo');
                }

            } else {
                $('#formulario_principal').bootstrapValidator('removeField', 'archivo');
                //$('#formulario_principal').bootstrapValidator('removeField', 'archivo');
                // $('#formulario_principal').bootstrapValidator('revalidateField', 'archivo');
            }


        });

        /*  $("#archivo").on('change', function(){
         
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
         if ( $('#archivo')[0].files.length > 0 && $('#archivo')[0].files[0].size > 4974593 ){
         notify("danger", "remove", "Usuario:", "El archivo sobrepasa el tamaño máximo permitido");
         $('#archivo').val('');
         }
         
         });*/

    }

});


/*
 * 28-01-2022
 * Wilmer Gustavo Mogollón Duque
 * Se agrega función para determinar la categorís en la que participa el jurado
 */


function determinar_modalidad(token_actual) {


    // cargo los datos
    $.ajax({
        type: 'GET',
        url: url_pv + 'PropuestasJurados/propuesta',
        data: {"token": token_actual.token, "idc": $("#idc").val(), "modulo": "Menu Participante"},
        //data: $form.serialize() + "&modulo=Menu Participante&token=" + token_actual.token,

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

                $('#modalidad_participa_educacion').val("");

                $('#modalidad_participa_educacion').val(json.propuesta.modalidad_participa);

                break;
        }

    }

    );

}

function cargar_datos_formulario(token_actual) {

    $("input[name=graduado][type=checkbox]").removeAttr('checked', 'checked');

    // cargo los datos
    $.ajax({
        type: 'GET',
        url: url_pv + 'PropuestasJurados/search_educacion_formal',
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

                    //Cargos el select de nivel_educacion
                    $('#niveleseducativos').find('option').remove();
                    $("#niveleseducativos").append('<option value="">:: Seleccionar ::</option>');
                    if (json.nivel_educacion.length > 0) {
                        $.each(json.nivel_educacion, function (key, array) {
                            $("#nivel_educacion").append('<option value="' + array.id + '" >' + array.nombre + '</option>');
                        });
                    }

                    //Cargos el select de areasconocimientos
                    $('#area_conocimiento').find('option').remove();
                    $("#area_conocimiento").append('<option value="">:: Seleccionar ::</option>');
                    if (json.area_conocimiento.length > 0) {
                        $.each(json.area_conocimiento, function (key, array) {
                            $("#area_conocimiento").append('<option value="' + array.id + '" >' + array.nombre + '</option>');
                        });
                    }


                    //Cargo el formulario con los datos
                    if (json.educacionformal) {

                        $("#graduado").removeClass();
                        $('#ciudad_name').val(json.ciudad_name);
                        $('#ciudad').val(json.educacionformal.ciudad.id);
                        $('.formulario_principal').loadJSON(json.educacionformal);

                        json.educacionformal.nivel_educacion > 2 ? $("#niveleseducativosextra").show() : $("#niveleseducativosextra").hide();
                        cargar_select_nucleobasico(token_actual, json.educacionformal.area_conocimiento, json.educacionformal.nucleo_basico);


                        if (json.educacionformal.graduado) {

                            $("input[id=graduado_check][type=checkbox]").prop("checked", true);

                        } else if ((!json.educacionformal.graduado) && json.educacionformal.graduado !== null) {

                            $("input[id=graduado_check][type=checkbox]").prop("checked", false);
                        }


                        //  $("#graduado").addClass("check_activar_"+json.educacionformal.graduado+"  activar_registro");
                        //  $("#graduado").addClass("check_activar_"+json.educacionformal.graduado+"");

                        //  json.educacionformal.graduado ? $("#graduado").addClass("check_activar_true activar_registro") :  $("#graduado").addClass("check_activar_false activar_registro");

                        //$(".check_activar_t").attr("checked", "true");
                        //$(".check_activar_f").removeAttr("checked");

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

function cargar_select_nucleobasico(token_actual, id_areasconocimientos, set_value) {


    $.ajax({
        type: 'GET',
        url: url_pv + 'PropuestasJurados/select_nucleobasico',
        data: {"token": token_actual.token, "id": id_areasconocimientos},
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
                if (json != null && json.length > 0) {
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

function cargar_tabla(token_actual) {
    //Cargar datos en la tabla actual
    $('#table_list').DataTable({
        "language": {
            "url": "../../dist/libraries/datatables/js/spanish.json"
        },
        "processing": true,
        "destroy": true,
        "serverSide": true,
        "lengthMenu": [10, 15, 20, 30, 50, 100], //07-05-2020 Wilmer Mogollón -se agregan valores al array
        "responsive": true,
        "ajax": {
            url: url_pv + "PropuestasJurados/all_educacion_formal",
            data: {"token": token_actual.token, "idc": $("#idc").val()},
            //async: false
        },
        "drawCallback": function (settings) {
            //$(".check_activar_t").attr("checked", "true");
            //$(".check_activar_f").removeAttr("checked");
            acciones_registro(token_actual);
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

            {"data": "Seleccionar",
                render: function (data, type, row) {
                    return ' <input title=\"' + row.id + '\" type=\"checkbox\" class=\"check_activar_' + row.active + '  activar_registro" ' + (row.active ? 'checked ' : '') + ' />';
                },
            },
            {"data": "aciones",
                render: function (data, type, row) {
                    return '<button title="Editar" id="' + row.id + '" type="button" class="btn btn-warning btn_cargar">'
                            + '<span class="glyphicon glyphicon-edit"></span></button>'
                            + '<button title="' + (row.file == null ? "No se ha cargado archivo" : "Descargar archivo") + '" id="' + (row.file == null ? "No se ha cargado archivo" : row.file) + '"  type="button" class="btn btn-primary download_file">'
                            + (row.file == null ? '<span class="glyphicon glyphicon-ban-circle" title="No se ha cargado archivo"></span>' : '<span class="glyphicon glyphicon-download-alt"></span>')
                            + '</button>';
                },
            }



        ]
    });

}

function validator_form(token_actual) {

    //Se debe colocar debido a que el calendario es un componente diferente
    $('.calendario').on('changeDate show', function (e) {
        $('.formulario_principal').bootstrapValidator('revalidateField', 'fecha_graduacion');
    });
    //Validar el formulario
    $('.formulario_principal').bootstrapValidator({
        feedbackIcons: {
            valid: 'glyphicon glyphicon-ok',
            invalid: 'glyphicon glyphicon-remove',
            validating: 'glyphicon glyphicon-refresh'
        },
        fields: {
            nivel_educacion: {
                validators: {
                    notEmpty: {message: 'El nivel de educación es requerido'}
                }
            },
            titulo: {
                validators: {
                    notEmpty: {message: 'El título obtenido es requerido'}
                }
            },
            institucion: {
                validators: {
                    notEmpty: {message: 'La institución es requerida'}
                }
            },
            ciudad_name: {
                validators: {
                    notEmpty: {message: 'La cidudad es requerida'}
                }
            },
            fecha_graduacion: {
                validators: {
                    notEmpty: {message: 'La fecha es requerida'}
                }
            },

            /*archivo: {
             validators: {
             notEmpty: {message: 'El archivo es requerido'},
             file: {
             extension: 'pdf,doc,xls,docx,xlsx',
             type: 'application/pdf,application/msword,application/vnd.ms-excel,application/x-excel,application/excel,application/x-msexcel,,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
             message: 'El archivo seleccionado no es válido'
             }
             }
             }*/
        }

    }).on('success.form.bv', function (e) {

        $("#graduado").val($("input[name=graduado_check][type=checkbox]").prop("checked"));

        if ($("input[id=graduado_check][type=checkbox]").prop("checked")) {
            $("#graduado").val("true");
        }

        if (!$("input[id=graduado_check][type=checkbox]").prop("checked")) {
            $("#graduado").val("false");
        }


        console.log("---->>>" + $("#graduado").val());

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

        //console.log("idregistro-->"+$("#idregistro").val());

        if (typeof $("#idregistro").attr('value') == 'undefined' || $("#idregistro").val() == '') {
            //console.log("Guardar-->"+$("#idregistro").val());

            $('#graduado').is(":checked") ? $('#graduado').val(true) : $('#graduado').val(false);
            //$("#id").val($("#idp").attr('value'));
            //Se realiza la peticion con el fin de guardar el registro actual
            $.ajax({
                type: 'POST',
                url: url_pv + 'PropuestasJurados/new_educacion_formal',
                //    data: $form.serialize() + "&modulo=Menu Participante&token=" + token_actual.token,
                data: formData,
                cache: false,
                contentType: false,
                processData: false,
                async: false,
                /*beforeSend: function(xhr){
                 
                 $.each($('#archivo')[0].files, function(index, file){
                 //console.log(file.type);
                 //console.log( file );
                 if( file.type != 'application/pdf'){
                 notify("danger", "remove", "Usuario:", "Debe cargar un archivo PDF");
                 $('#archivo').val('');
                 return false;
                 }
                 
                 });
                 
                 }*/

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
                        notify("success", "ok", "Convocatorias:", "Se agregó el registro con éxito.");
                        //cargar_datos_formulario(token_actual);
                        break;
                }

            });

        } else {

            console.log("Actualizar -->" + $("#idregistro").val());

            $.ajax({
                //type: 'PUT',
                type: 'POST',
                url: url_pv + 'PropuestasJurados/edit_educacion_formal/' + $("#idregistro").val(),
                //data: $form.serialize() + "&modulo=Menu Participante&token=" + token_actual.token,
                data: formData,
                cache: false,
                contentType: false,
                processData: false,
                async: false,

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
        $("#niveleseducativosextra").hide();
        $("input[id=graduado_check][type=checkbox]").prop('checked', false);
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
        $("#idregistro").val($(this).attr("id"));
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
            url: url_pv + 'PropuestasJurados/delete_educacion_formal/' + $(this).attr("title")
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

    //descargar archivo
    $(".download_file").click(function () {
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

