/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

/*Cesar Britto*/
$(document).ready(function () {

    $("#idc").val($("#id").val());
    //$("#id").val(null);

    //Verifico si el token exite en el cliente y verifico que el token este activo en el servidor
    var token_actual = getLocalStorage(name_local_storage);

    //Verifico si el token esta vacio, para enviarlo a que ingrese de nuevo
    if ($.isEmptyObject(token_actual)) {
        location.href = url_pv_admin + 'index.html?msg=Su sesión ha expirado, por favor vuelva a ingresar.&msg_tipo=danger';
    } else
    {
        //Verifica si el token actual tiene acceso de lectura
        permiso_lectura(token_actual, "Menu Participante");
        $("#back_step").attr("onclick", " location.href = 'postular_hoja_vida.html?m=2&id=" + $("#idc").val() + "' ");

        verificar_estado_propuesta(token_actual);

        cargar_select_enfoques(token_actual);
        cargar_select_lineas(token_actual);
        cargar_select_area(token_actual);
        
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

        // validator_form(token_actual);

        //Listado de las postulaicones
        cargar_tabla_p(token_actual);

        /*Validar si existe una convocatoria de jurados vigente*/
        validar_convocatoria_jurados(token_actual);

        $('#perfil_info').on('shown.bs.modal', function () {
            //alert("Cargando");
            // $('#form_nuevo_criterio').bootstrapValidator('resetForm', true);
            //  fields = $('input[type=radio][name="perfilesRadios"]');
            /// $('#form_nuevo_criterio').bootstrapValidator('revalidateField', fields);
        });

        $('#perfil_info').on('hidden.bs.modal', function () {

            //elimina el validador del formulario de los perfiles
            $('#form_nuevo_criterio').data("bootstrapValidator").destroy();
        });

        $("#buscar").on('click', function () {
            cargar_tabla_b(token_actual);
        });

        $(".aceptar_terminos").click(function () {
            location.href = "../propuestasjurados/postular_hoja_vida.html?m=2&id=" + $("#convocatoria").val() + "&p=0";
        });



    }// fin else

});


function verificar_estado_propuesta(token_actual) {

    //datos de la propuesta
    $.ajax({
        type: 'GET',
        data: {"token": token_actual.token, "modulo": "Menu Participante", "idc": $("#idc").val()},
        url: url_pv + 'PropuestasJurados/propuesta'
    }).done(function (data) {

        var json = JSON.parse(data);

        if (json.propuesta.estado == 7) {

            $("#busqueda_convocatorias").hide();
            $("#listado_postulaciones").hide();
            $("#estado").show();

        }

        if (json.propuesta.estado == 8) {
            $("#busqueda_convocatorias").show();
            $("#listado_postulaciones").show();
            $("#estado").hide();
        }

    });


    $(".download_file").click(function () {
        //Cargo el id file

        $.AjaxDownloader({
            url: url_pv + 'PropuestasJurados/download_file/',
            data: {
                cod: documento,
                token: token_actual.token
            }
        });

    });

}


function cargar_select_enfoques(token_actual) {

    $.ajax({
        type: 'GET',
        url: url_pv + 'Enfoques/select',
        data: {"token": token_actual.token},
    }).done(function (data) {

        switch (data) {
            case 'error':
                notify("danger", "ok", "Convocatorias:", "Se registro un error, comuníquese con la mesa de ayuda soporte.convocatorias@scrd.gov.co");
                break;
            case 'error_metodo':
                notify("danger", "ok", "Se registro un error en el método, comuníquese con la mesa de ayuda soporte.convocatorias@scrd.gov.co");
                break;
            case 'error_token':
                location.href = url_pv_admin + 'index.html?msg=Su sesión ha expirado, por favor vuelva a ingresar.&msg_tipo=danger';
                break;
            case 'acceso_denegado':
                notify("danger", "remove", "Usuario:", "No tiene permisos acceder a la información.");
                break;
            default:
                var json = JSON.parse(data);

                //Cargos el select de enfoques
                $('#enfoque').find('option').remove();
                $("#enfoque").append('<option value="">:: Seleccionar ::</option>');
                if (json != null && json.length > 0) {
                    $.each(json, function (key, array) {
                        $("#enfoque").append('<option value="' + array.id + '" >' + array.nombre + '</option>');
                    });
                }

                break;
        }

    }
    );
}

function cargar_select_lineas(token_actual) {

    $.ajax({
        type: 'GET',
        url: url_pv + 'Lineasestrategicas/select',
        data: {"token": token_actual.token},
    }).done(function (data) {

        switch (data) {
            case 'error':
                notify("danger", "ok", "Convocatorias:", "Se registro un error, comuníquese con la mesa de ayuda soporte.convocatorias@scrd.gov.co");
                break;
            case 'error_metodo':
                notify("danger", "ok", "Se registro un error en el método, comuníquese con la mesa de ayuda soporte.convocatorias@scrd.gov.co");
                break;
            case 'error_token':
                location.href = url_pv_admin + 'index.html?msg=Su sesión ha expirado, por favor vuelva a ingresar.&msg_tipo=danger';
                break;
            case 'acceso_denegado':
                notify("danger", "remove", "Usuario:", "No tiene permisos acceder a la información.");
                break;
            default:
                var json = JSON.parse(data);

                //Cargos el select de líneas estratégicas
                $('#linea').find('option').remove();
                $("#linea").append('<option value="">:: Seleccionar ::</option>');
                if (json !== null && json.length > 0) {
                    $.each(json, function (key, array) {
                        $("#linea").append('<option value="' + array.id + '" >' + array.nombre + '</option>');
                    });
                }

                break;
        }

    }
    );
}

function cargar_select_area(token_actual) {

    $.ajax({
        type: 'GET',
        url: url_pv + 'Areas/select',
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

                //Cargos el select de areasconocimientos
                $('#area').find('option').remove();
                $("#area").append('<option value="">:: Seleccionar ::</option>');
                if (json != null && json.length > 0) {
                    $.each(json, function (key, array) {
                        $("#area").append('<option value="' + array.id + '" >' + array.nombre + '</option>');
                    });
                }

                $("#formulario_principal").show();

                break;
        }

    }
    );
}

/*function validator_form(token_actual) {
 
 //Validar el formulario
 $('.formulario_principal').bootstrapValidator({
 feedbackIcons: {
 valid: 'glyphicon glyphicon-ok',
 invalid: 'glyphicon glyphicon-remove',
 validating: 'glyphicon glyphicon-refresh'
 },
 fields: {
 area: {
 validators: {
 notEmpty: {message: 'El área es requerida'}
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
 
 //litado de las convocatorias a las cuales puede el jurado aplicar
 cargar_tabla_b(token_actual);
 
 $form.bootstrapValidator('disableSubmitButtons', false).bootstrapValidator('resetForm', true);
 bv.resetForm();
 
 
 });
 
 }*/

function cargar_tabla_b(token_actual) {
    //console.log("idconvocatoria-->"+$("#idc").val() );
    //Cargar datos en la tabla actual
    $('#table_list_b').DataTable().clear().destroy();

    $('#postular').removeProp('disabled');
    $('#postular').removeAttr('disabled');

    $('#table_list_b').DataTable({
        "language": {
            "url": "../../dist/libraries/datatables/js/spanish.json"
        },
        "processing": true,
        "destroy": true,
        "serverSide": true,
        "lengthMenu": [5, 10],
        "responsive": true,
        "searching": false,
        "ajax": {
            url: url_pv + "PropuestasJurados/postulacion_search_convocatorias",
            data: {
                "token": token_actual.token,
                "entidad": $("#entidad").val(),
                "enfoque": $("#enfoque").val(),
                "linea": $("#linea").val(),
                "area": $("#area").val(),
                "idc": $("#idc").val(),
                "pclave": $("#pclave").val()
            },
            async: false
        },
        "drawCallback": function (settings) {
            //$(".check_activar_t").attr("checked", "true");
            //$(".check_activar_f").removeAttr("checked");
            acciones_b_registro(token_actual);
        },
        "columns": [

            {"data": "Tipo programa",
                render: function (data, type, row) {
                    return row.programa;
                },
            },
            {"data": "Entidad",
                render: function (data, type, row) {
                    return row.entidad;
                },
            },
            {"data": "Area",
                render: function (data, type, row) {
                    return row.area;
                },
            },
            {"data": "Linea",
                render: function (data, type, row) {
                    return row.linea_estrategica;
                },
            },
            {"data": "Enfoque",
                render: function (data, type, row) {
                    return row.enfoque;
                },
            },
            {"data": "Nombre",
                render: function (data, type, row) {
                    return row.nombre;
                },
            },
            {"data": "aciones",
                render: function (data, type, row) {
                    return '<button id="' + row.id + '"  title="Postularse" type="button" class="btn btn-warning btn_cargar_b" data-toggle="modal" data-target="#perfil_info\">'
                            + '<span class=" 	glyphicon glyphicon-check"></span></button>'
//                                                 +'<button name="'+row.id+'" onclick="http://sicon.scrd.gov.co/site_SCRD_pv/publicar.html?id='+row.id+'"  title="Enlace de la convocatoria" type="button" class="btn btn-info btn_link">'
//                                                 +'<span class="glyphicon glyphicon-link"></span></button>'
                            + '<a href="http://sicon.scrd.gov.co/convocatorias/' + row.id + '" title="Enlace de la convocatoria" target="_blank" class="btn btn-info" role="button">Ver convocatoria</a>';
                },
            }

        ]
    });

}

//Permite realizar acciones despues de cargar la tabla
function acciones_b_registro(token_actual) {

    //Permite realizar la carga respectiva de cada registro
    $(".btn_cargar_b").click(function () {

        $("#idregistro").val($(this).attr("id"));

        //Remueve los div de los perfiles
        $("#lista_perfiles").find('div').remove();

        // se crea el validador
        validator_form_perfiles(token_actual);

        // carga de los datos de los perfiles
        cargar_datos_perfiles(token_actual);
        //Cargar inhabilidades
        cargar_inhabilidades(token_actual);
    });



}

function cargar_datos_perfiles(token_actual) {
    //$("#postular").attr("disabled","disabled");
    $('#postular').removeProp('disabled');
    $('#postular').removeAttr('disabled');

    // cargo los datos
    $.ajax({
        type: 'GET',
        url: url_pv + 'PropuestasJurados/postulacion_perfiles_convocatoria',
        data: {"token": token_actual.token, "idregistro": $("#idregistro").val()},

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

                $("#lista_perfiles").find('div').remove();

                if (json.length > 0) {

                    $.each(json, function (key, perfil) {
                        $("#lista_perfiles").append('<div class="well"> <div class="row">'
                                + ' <div class="col-lg-12">'
                                + '  <h4>Perfil ' + (key + 1) + '</h4>'
                                + ' </div>'
                                + ' <div class="col-lg-12">'
                                + '  <h5><b>Descripción:</h5></b> ' + perfil.descripcion_perfil
                                + ' </div>'
                                + ' <div class="col-lg-6">'
                                + '  <h5><b>Formación profesional:</h5></b> ' + (perfil.formacion_profesional ? "Si" : "No")
                                + ' </div>'
                                + ' <div class="col-lg-6">'
                                + ' <h5><b>Formación de postgrado:</h5></b> ' + (perfil.formacion_postgrado ? "Si" : "No")
                                + ' </div>'
                                + ' <div class="col-lg-6">'
                                + '  <h5><b>Nivel educativo:</h5></b> ' + ((perfil.nivel_educativo == 'null') ? "N/D" : perfil.nivel_educativo)
                                + ' </div>'
                                + ' <div class="col-lg-6">'
                                + ' <h5><b>Area de conocimiento:</h5></b> ' + ((perfil.area_conocimiento == 'null') ? "N/D" : perfil.area_conocimiento)
                                + ' </div>'
                                + ' <div class="col-lg-6">'
                                + '  <h5><b>Campo de experiencia:</h5></b>' + perfil.campo_experiencia
                                + ' </div>'
                                + ' <div class="col-lg-6">'
                                + '  <h5><b>Area del perfíl:</h5></b> ' + ((perfil.area_perfil == 'null') ? "N/D" : perfil.area_perfil)
                                + ' </div>'
                                + ' <div class="col-lg-6">'
                                + '  <h5><b>Reside en bogota:</h5></b> ' + (perfil.reside_bogota ? "Si" : "No")
                                + ' </div>'
                                + ' <div class="col-lg-12" style="text-align: right" id="optionsRadios' + (key + 1) + '" >'
                                + '   <div class="radio"><div class="form-control"> '
                                + '     <input type="radio"  name="perfilesRadios" value="' + perfil.id + '" /> Seleccionar'
                                + '   </div></div>'
                                + ' </div>'
                                + '</div></div>');



                        //se agrega los campos a validar dinamicamente
                        $option = $("#optionsRadios" + (key + 1) + "").find('input[type=radio][name="perfilesRadios"]');
                        $('#form_nuevo_criterio').bootstrapValidator('addField', $option);

                    });

                    $("#postular").show();
                    $("#cancelar").show();

                    $("#aceptar").hide();

                } else {
                    $("#lista_perfiles").append(
                            '  <div class="row"> '
                            + ' <div class="col-lg-12"> <h4>No tiene perfiles de jurado</h4></div>'
                            + '</div>'
                            );

                    $("#postular").hide();
                    $("#cancelar").hide();
                    $("#aceptar").show();

                }

                break;
        }

    }

    );

}

function postular(token_actual) {

    $.ajax({
        type: 'POST',
        url: url_pv + 'PropuestasJurados/new_postulacion',
        data: {
            "token": token_actual.token,
            "modulo": "Menu Participante",
            "idc": $("#idc").val(),
            "idregistro": $("#idregistro").val(),
            "perfil": $("input:radio[name=perfilesRadios]:checked").val(),
        },
    }).done(function (result) {

        switch (result) {
            case 'error':
                notify("danger", "ok", "Convocatorias:", "Se registró un error, comuníquese con la mesa de ayuda convocatorias@scrd.gov.co");
                break;
            case 'error_token':
                location.href = url_pv_admin + 'index.html?msg=Su sesión ha expirado, por favor vuelva a ingresar.&msg_tipo=danger';
                break;
            case 'acceso_denegado':
                notify("danger", "remove", "Usuario:", "No tiene permisos para editar información.");
                break;
            case 'deshabilitado':
                notify("danger", "remove", "Usuario:", "No tiene permisos para editar información.");
                //cargar_tabla_p(token_actual);
                break;
            case 'error_limite':
                notify("danger", "remove", "Usuario:", "Se cumplió el máximo de postulaciones activas.");
                ///  cargar_tabla_p(token_actual);
                break;
            case 'error_banco':
                notify("danger", "remove", "Usuario:", "Para postularse a convocatorias de la vigencia actual debe inscribir su hoja de vida en el Bannco de Jurados del presente año.");
                ///  cargar_tabla_p(token_actual);
                break;
            case 'error_ya_postulado':
                notify("danger", "remove", "Usuario:", "Ya se encuentra postulado a esta convocatoria");
                ///  cargar_tabla_p(token_actual);
                break;
            default:
                notify("success", "ok", "Convocatorias:", "Se postuló la hoja de vida con éxito.");
                $('#table_list_b').DataTable().clear().destroy();
                cargar_tabla_p(token_actual);
                break;
        }

    });

}

function cargar_tabla_p(token_actual) {

    //Cargar datos en la tabla actual
    $('#table_list_p').DataTable({
        "language": {
            "url": "../../dist/libraries/datatables/js/spanish.json"
        },
        "processing": true,
        "destroy": true,
        "serverSide": true,
        "lengthMenu": [5, 10, 15],
        "bFilter": false,
        "info": false,
        "responsive": true,
        "ajax": {
            url: url_pv + "PropuestasJurados/search_postulacion",
            data: {"token": token_actual.token, "idc": $("#idc").val()},
            async: false
        },
        "drawCallback": function (settings) {
            //$(".check_activar_t").attr("checked", "true");
            //$(".check_activar_f").removeAttr("checked");
            acciones_P_registro(token_actual);
        },
        "columns": [

            {"data": "Tipo programa",
                render: function (data, type, row) {
                    return row.convocatoria.programa;
                },
            },
            {"data": "Entidad",
                render: function (data, type, row) {
                    return row.convocatoria.entidad;
                },
            },
            {"data": "Area",
                render: function (data, type, row) {
                    return row.convocatoria.area;
                },
            },
            {"data": "Linea",
                render: function (data, type, row) {
                    return row.convocatoria.linea_estrategica;
                },
            },
            {"data": "Enfoque",
                render: function (data, type, row) {
                    return row.convocatoria.enfoque;
                },
            },
            {"data": "Nombre",
                render: function (data, type, row) {
                    return row.convocatoria.nombre;
                },
            },

            {"data": "Seleccionar",
                render: function (data, type, row) {
                    return ' <input title=\"' + row.postulacion.id + '\" type=\"checkbox\" class=\"check_activar_' + row.postulacion.active + '  eliminar_registro" ' + (row.postulacion.active ? 'checked ' : '') + ' />';
                },
            },
        ]
    });

}

//Permite realizar acciones despues de cargar la tabla
function acciones_P_registro(token_actual) {

    //Permite activar o eliminar una registro
    $(".eliminar_registro").click(function () {

        //Cambio el estado del check
        var active = "false";

        if ($(this).prop('checked')) {
            active = "true";
        }

        //Peticion para inactivar el evento
        $.ajax({
            type: 'DELETE',
            data: {"token": token_actual.token, "modulo": "Menu Participante", "active": active, "idc": $("#idc").val()},
            url: url_pv + 'PropuestasJurados/delete_postulacion/' + $(this).attr("title")
        }).done(function (result) {

            switch (result) {
                case 'Si':
                    notify("info", "ok", "Usuario:", "Se activó el registro con éxito.");
                    break;
                case 'No':
                    notify("info", "ok", "Usuario:", "Se eliminó el registro con éxito.");
                    break;
                case 'error':
                    notify("danger", "ok", "Usuario:", "Se registro un error, comuníquese con la mesa de ayuda convocatorias@scrd.gov.co");
                    break;
                case 'error_token':
                    location.href = url_pv_admin + 'index.html?msg=Su sesión ha expirado, por favor vuelva a ingresar.&msg_tipo=danger';
                    break;
                case 'acceso_denegado':
                    notify("danger", "remove", "Usuario:", "No tiene permisos para editar información.");
                    break;
                case 'deshabilitado':
                    notify("danger", "remove", "Usuario:", "No tiene permisos para editar información.");
                    break;
                case 'error_limite':
                    notify("danger", "remove", "Usuario:", "Se cumplió el máximo de postulaciones activas.");
                    break;
                default:
                    notify("success", "ok", "Usuario:", "Se actualizó el registro con éxito.");
                    break;
            }

            cargar_tabla_p(token_actual);


        });
    });

}

function validator_form_perfiles(token_actual) {


    $('#form_nuevo_criterio').bootstrapValidator({
        // To use feedback icons, ensure that you use Bootstrap v3.1.0 or later
        feedbackIcons: {
            //valid: 'glyphicon glyphicon-ok',
            //  invalid: 'glyphicon glyphicon-remove',
            validating: 'glyphicon glyphicon-refresh'
        },
        fields: {

            perfilesRadios: {
                validators: {
                    notEmpty: {
                        message: 'Debe seleccionar un perfil de jurado'
                    }
                }
            }
        }
    }).on('success.form.bv', function (e) {

        postular(token_actual);

        $('#perfil_info').modal('toggle');

        // Prevent form submission
        e.preventDefault();
        // Get the form instance
        var $form = $(e.target);
        // Get the BootstrapValidator instance
        var bv = $form.data('bootstrapValidator');

        $form.bootstrapValidator('disableSubmitButtons', false).bootstrapValidator('resetForm', true);
        bv.resetForm();

    }).on('error.form.bv', function (e) {

        //mostrar el mensaje de error
        $('[data-bv-for="perfilesRadios"]').removeAttr("style");
        $('[data-bv-for="perfilesRadios"]').parent().focus();

    });

}


/*
 * 20-08-2020
 * Wilmer Gustavo Mogollón Duque
 * Se agrega función cargar_inhabilidades
 */


function cargar_inhabilidades(token_actual, postulacion, participante) {
    $("#perfiles_jurados").html("");
    //consulto si tengo propuesta cargada

    // cargo los datos
    $.ajax({
        type: 'GET',
        url: url_pv + 'PropuestasJurados/search_info_inhabilidades',
        data: {"token": token_actual.token, "idc": $('#convocatorias').val(), "postulacion": postulacion, "participante": participante, "anio": $('#anio').val()},
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
                cargar_datos_formulario(token_actual);
                break;
            default:

                var json = JSON.parse(data);

                if (json.participante) {


                    $('#nombre_participante').html(json.participante.primer_nombre + ' ' + json.participante.segundo_nombre + ' ' + json.participante.primer_apellido + ' ' + json.participante.segundo_apellido);
                    $('#tipo_participante').html(json.participante.tipo);
                    $('#codigo_propuesta').html(json.propuesta_codigo);
                    $('#nombre_propuesta').html(json.propuesta_nombre);
                    $('#nombre_estado').html(json.propuesta_estado);


                    //Contratista

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

                    //Jurados seleccionados

                    if (json.html_propuestas_jurados_seleccionados !== "")
                    {
                        $("#jurados_seleccionados").css("display", "block");
                        $(".tr_jurados_seleccionados").remove();
                        $("#body_jurados_seleccionados").append(json.html_propuestas_jurados_seleccionados);

                    } else
                    {
                        $("#jurados_seleccionados").css("display", "none");
                    }


                    //Jurados proceso

                    if (json.html_propuestas_jurados_proceso !== "")
                    {
                        $("#jurados_proceso").css("display", "block");
                        $(".tr_jurados_proceso").remove();
                        $("#body_jurados_proceso").append(json.html_propuestas_jurados_proceso);

                    } else
                    {
                        $("#jurados_proceso").css("display", "none");
                    }

                    //Personas naturales

                    if (json.html_propuestas !== "")
                    {
                        $("#propuestas_pn").css("display", "block");
                        $(".tr_propuestas").remove();
                        $("#body_propuestas_pn").append(json.html_propuestas);

                    } else
                    {
                        $("#propuestas_pn").css("display", "none");
                    }

                    if (json.html_propuestas_ganadoras !== "")
                    {
                        $("#propuestas_ganadoras_pn").css("display", "block");
                        $(".tr_propuestas_ganadoras").remove();
                        $("#body_propuestas_ganadoras_pn").append(json.html_propuestas_ganadoras);

                    } else
                    {
                        $("#propuestas_ganadoras_pn").css("display", "none");
                    }

                    //Jurados seleccionados años anteriores

                    if (json.html_ganadoras_anios_anteriores !== "")
                    {
                        $("#ganadoras_anios_anteriores").css("display", "block");
                        $(".tr_ganador_anio_anterior").remove();
                        $("#body_ganadoras_anios_anteriores").append(json.html_ganadoras_anios_anteriores);

                    } else
                    {
                        $("#ganadoras_anios_anteriores").css("display", "none");
                    }



                } else {


                }

                break;
        }

    }

    );

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
