$(document).ready(function () {

    //Verifico si el token exite en el cliente y verifico que el token este activo en el servidor                
    var token_actual = getLocalStorage(name_local_storage);

    //Verifico si el token esta vacio, para enviarlo a que ingrese de nuevo
    if ($.isEmptyObject(token_actual)) {
        location.href = url_pv_admin + 'index.html?msg=Su sesión ha expirado, por favor vuelva a ingresar.&msg_tipo=danger';
    } else
    {

        //Verifica si el token actual tiene acceso de lectura
        permiso_lectura(token_actual, "Convocatorias");

        //Realizo la peticion para cargar el formulario
        if ($("#id").val() != "") {

            //Establesco los text area html
            $('.textarea_html').jqte();

            //Limpio el formulario de los anexos
            $('#nuevo_evento').on('hidden.bs.modal', function () {
                $("#descripcion").jqteVal('');
                $("#nombre").val("");
                $("#orden").val("");
                $("#tipo_documento option[value='']").prop("selected", true);
                $("#id_registro").val("");
            });

            //Agrego url para retornar
            $(".regresar").attr("onclick", "location.href='update.html?id=" + $("#id").attr('value') + "'");
            
            //Realizo la peticion para cargar el formulario
            $.ajax({
                type: 'GET',
                data: {"token": token_actual.token, "id": $("#id").attr('value')},
                url: url_pv + 'Convocatorias/search/'
            }).done(function (data) {
                if (data == 'error_metodo')
                {
                    notify("danger", "ok", "Convocatorias:", "Se registro un error en el método, comuníquese con la mesa de ayuda convocatorias@scrd.gov.co");
                } else
                {
                    if (data == 'error')
                    {
                        location.href = url_pv_admin + 'list.html?msg=Debe seleccionar una convocatoria, para poder continuar.&msg_tipo=danger';
                    } else
                    {
                        if (data == 'error_token')
                        {
                            location.href = url_pv + 'index.html?msg=Su sesión ha expirado, por favor vuelva a ingresar.&msg_tipo=danger';
                        } else
                        {
                            var json = JSON.parse(data);

                            if (typeof json.convocatoria.id === 'number') {

                                //Limpio select de categorias
                                $('#convocatoria').find('option').remove();

                                //Valido si la convocatoria tiene categorias                                            
                                if (json.convocatoria.tiene_categorias == true)
                                {
                                    $("#tiene_categorias").val("Si");                                    
                                    
                                    $(".diferentes_requisitos").css("display", "block");
                                    //Cargo el select de las categorias                                                
                                    if (json.categorias.length > 0) {
                                        $.each(json.categorias, function (key, categoria) {
                                            $("#convocatoria").append('<option value="' + categoria.id + '" >' + categoria.nombre + '</option>');
                                        });
                                    }
                                } else
                                {
                                    $("#tiene_categorias").val("No");
                                    $(".diferentes_requisitos").css("display", "none");
                                }
                            }
                        }
                    }
                }
            });

            //Cargar datos de la tabla
            cargar_tabla(token_actual);

            //Permite crear el href para crear el reporte de listas
            $('#tipo_documento').on('change', function () {
                var tipo = $('#tipo_documento').val();
                var href="javascript:void(0);";
                var id = $("#id").attr('value');
                
                if($("#tiene_categorias").val()=="Si")
                {
                    id = $("#convocatoria").val();
                }
                
                if(tipo=="Listado de participantes inscritos")
                {
                    href=url_pv_report+"listado_propuesta_inscrita.php?id=" + id + "&token=" + token_actual.token;
                }
                
                if(tipo=="Listados rechazados y documentos por subsanar")
                {
                    href=url_pv_report+"listado_propuesta_rechazados_subsanar.php?id=" + id + "&token=" + token_actual.token;
                }
                
                if(tipo=="Listado de habilitados y rechazados")
                {
                    href=url_pv_report+"listado_propuesta_rechazados_habilitados.php?id=" + id + "&token=" + token_actual.token;
                }
                
                if(tipo=="Listado de habilitados")
                {
                    href=url_pv_report+"listado_propuesta_habilitados.php?id=" + id + "&token=" + token_actual.token;
                }    
                
                if(tipo=="Listado de preinscritos")
                {
                    href=url_pv_report+"listado_propuesta_pre_inscrita.php?id=" + id + "&token=" + token_actual.token;
                }
                
                $("#link_reporte").attr("href", href);
                
            });
            
            //Permite crear el href para crear el reporte de listas
            $('#convocatoria').on('change', function () {
                var tipo = $('#tipo_documento').val();
                var href="javascript:void(0);";
                var id = $("#id").attr('value');
                
                if($("#tiene_categorias").val()=="Si")
                {
                    id = $("#convocatoria").val();
                }
                
                if(tipo=="Listado de participantes inscritos")
                {
                    href=url_pv_report+"listado_propuesta_inscrita.php?id=" + id + "&token=" + token_actual.token;
                }
                
                if(tipo=="Listados rechazados y documentos por subsanar")
                {
                    href=url_pv_report+"listado_propuesta_rechazados_subsanar.php?id=" + id + "&token=" + token_actual.token;
                }
                
                if(tipo=="Listado de habilitados y rechazados")
                {
                    href=url_pv_report+"listado_propuesta_rechazados_habilitados.php?id=" + id + "&token=" + token_actual.token;
                }
                
                if(tipo=="Listado de habilitados")
                {
                    href=url_pv_report+"listado_propuesta_habilitados.php?id=" + id + "&token=" + token_actual.token;
                }
                
                if(tipo=="Listado de preinscritos")
                {
                    href=url_pv_report+"listado_propuesta_pre_inscrita.php?id=" + id + "&token=" + token_actual.token;
                }             
                
                $("#link_reporte").attr("href", href);
                
            });

        } else
        {
            location.href = 'list.html?msg=Debe seleccionar una convocatoria, para poder continuar.&msg_tipo=danger';
        }

        validator_form(token_actual);
        $(".check_activar_t").attr("checked", "true");
    }
});

function validator_form(token_actual) {
    //Validar el formulario
    $('.form_nuevo_documento').bootstrapValidator({
        feedbackIcons: {
            valid: 'glyphicon glyphicon-ok',
            invalid: 'glyphicon glyphicon-remove',
            validating: 'glyphicon glyphicon-refresh'
        },
        fields: {
            tipo_documento: {
                validators: {
                    notEmpty: {message: 'El tipo de documento es requerido'}
                }
            },
            nombre: {
                validators: {
                    notEmpty: {message: 'La descripción es requerida'}
                }
            },
            orden: {
                validators: {
                    notEmpty: {message: 'El orden es requerido'},
                    numeric: {message: 'Debe ingresar solo numeros'}
                }
            },
            archivo: {
                validators: {
                    notEmpty: {message: 'El archivo es requerido'},
                    file: {
                        extension: 'pdf,doc,xls,docx,xlsx',
                        type: 'application/pdf,application/msword,application/vnd.ms-excel,application/x-excel,application/excel,application/x-msexcel,,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                        message: 'El archivo seleccionado no es válido'
                    }
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

        var formData = new FormData(document.getElementById("form_nuevo_documento"));
        formData.append("modulo", "Convocatorias");
        formData.append("token", token_actual.token);
        formData.append("convocatoria_padre_categoria", $("#id").attr('value'));
        formData.append("anexos", "listados");

        if ($("#id_registro").val().length < 1) {
            //Se realiza la peticion con el fin de guardar el registro actual
            $.ajax({
                type: 'POST',
                url: url_pv + 'Convocatoriasanexos/new',
                data: formData,
                cache: false,
                contentType: false,
                processData: false
            }).done(function (result) {

                if (result == 'error')
                {
                    notify("danger", "ok", "Convocatorias:", "Se registro un error, comuníquese con la mesa de ayuda convocatorias@scrd.gov.co");
                } else
                {
                    if (result == 'error_token')
                    {
                        location.href = url_pv_admin + 'index.html?msg=Su sesión ha expirado, por favor vuelva a ingresar.&msg_tipo=danger';
                    } else
                    {
                        if (result == 'acceso_denegado')
                        {
                            notify("danger", "remove", "Usuario:", "No tiene permisos para editar información.");
                        } else
                        {
                            if (result == 'error_creo_alfresco')
                            {
                                notify("danger", "remove", "Convocatorias:", "Se creó el registro, pero no se adjunto el archivo, comuníquese con la mesa de ayuda convocatorias@scrd.gov.co");
                            } else
                            {
                                if (isNaN(result)) {
                                    notify("danger", "ok", "Convocatorias:", "Se registro un error, comuníquese con la mesa de ayuda convocatorias@scrd.gov.co");
                                } else
                                {
                                    notify("success", "ok", "Convocatorias:", "Se creó el documento con éxito.");
                                    //Cargar datos de la tabla de categorias
                                    cargar_tabla(token_actual);
                                }
                            }
                        }
                    }
                }

            });
        } else
        {
            //Realizo la peticion con el fin de editar el registro actual
            $.ajax({
                type: 'POST',
                url: url_pv + 'Convocatoriasanexos/edit/' + $("#id_registro").attr('value'),
                data: formData,
                cache: false,
                contentType: false,
                processData: false
            }).done(function (result) {
                if (result == 'error')
                {
                    notify("danger", "ok", "Convocatorias:", "Se registro un error, comuníquese con la mesa de ayuda convocatorias@scrd.gov.co");
                } else
                {
                    if (result == 'error_token')
                    {

                    } else
                    {
                        if (result == 'acceso_denegado')
                        {
                            notify("danger", "remove", "Usuario:", "No tiene permisos para editar información.");
                        } else
                        {
                            if (result == 'error_creo_alfresco')
                            {
                                notify("danger", "remove", "Convocatorias:", "Se edito el el registro, pero no se adjunto el archivo, comuníquese con la mesa de ayuda convocatorias@scrd.gov.co");
                            } else
                            {
                                if (isNaN(result))
                                {
                                    notify("danger", "ok", "Convocatorias:", "Se registro un error, comuníquese con la mesa de ayuda convocatorias@scrd.gov.co");
                                } else
                                {
                                    notify("info", "ok", "Convocatorias:", "Se edito el documento con éxito.");
                                    cargar_tabla(token_actual);
                                }
                            }
                        }
                    }
                }
            });
        }

        $form.bootstrapValidator('disableSubmitButtons', false).bootstrapValidator('resetForm', true);
        bv.resetForm();
        $("#descripcion").jqteVal('');
        $("#orden").val("");
        $("#nombre").val("");
        $("#tipo_documento option[value='']").prop("selected", true);
        $("#id_registro").val("");
        $('#nuevo_evento').modal('toggle');
    });

}

function cargar_tabla(token_actual)
{
    $('#table_registros').DataTable({
        "language": {
            "url": "../../dist/libraries/datatables/js/spanish.json"
        },
        "processing": true,
        "destroy": true,
        "serverSide": true,
        "lengthMenu": [10, 20, 30],
        "ajax": {
            url: url_pv + "Convocatoriasanexos/all",
            data: {"token": token_actual.token, "convocatoria": $("#id").attr('value'), "anexos": "listados"}
        },
        "drawCallback": function (settings) {
            $(".check_activar_t").attr("checked", "true");
            $(".check_activar_f").removeAttr("checked");
            acciones_categoria(token_actual);
            //Cargo el formulario, para crear o editar
            cargar_formulario(token_actual);
            //descarga el archivo
            download_file(token_actual);
        },
        "columns": [
            {"data": "convocatoria"},
            {"data": "categoria"},
            {"data": "tipo_documento"},
            {"data": "nombre"},
            {"data": "descripcion"},
            {"data": "orden"},
            {"data": "activar_registro"},
            {"data": "acciones"}
        ],
        "columnDefs": [ {
            "targets": 0,                                        
            "render": function ( data, type, row, meta ) {
              if(data==null){
                  row.convocatoria=row.categoria;
                  row.categoria="";
              }  
              return row.convocatoria;
            }
          },{ orderable: false, targets: '_all' }
            ]
    });

}

function cargar_formulario(token_actual)
{
    $(".cargar_formulario").click(function () {
        //Cargo el id actual
        $("#id_registro").attr('value', $(this).attr('title'))
        //Realizo la peticion para cargar el formulario
        $.ajax({
            type: 'GET',
            data: {"token": token_actual.token, "convocatoria": $("#id").attr('value'), "id": $("#id_registro").attr('value'), "anexos": "listados"},
            url: url_pv + 'Convocatoriasanexos/search/'
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
                    var json = JSON.parse(data);

                    //Cargo el select de los requisitos
                    $('#tipo_documento').find('option').remove();
                    $("#tipo_documento").append('<option value="">:: Seleccionar ::</option>');
                    if (json.tipo_documento.length > 0) {
                        $.each(json.tipo_documento, function (key, registro) {
                            $("#tipo_documento").append('<option value="' + registro + '">' + registro + '</option>');
                        });
                    }

                    //Cargo el formulario con los datos
                    $('#form_nuevo_documento').loadJSON(json.convocatoriaanexo);
                    $("#descripcion").jqteVal(json.convocatoriaanexo.descripcion);


                }
            }
        });
    });
}

//Funcion para descargar archivo
function download_file(token_actual)
{
    $(".download_file").click(function () {
        //Cargo el id file
        var cod = $(this).attr('title');

        $.AjaxDownloader({
            url: url_pv + 'Convocatoriasanexos/download_file/',
            data: {
                cod: cod,
                token: token_actual.token
            }
        });

    });
}

//Funcion para activar o desactivar los recursos del estimulo
function activar_registro(id, token_actual) {
    $.ajax({
        type: 'DELETE',
        data: {"token": token_actual, "modulo": "Convocatorias"},
        url: url_pv + 'Convocatoriasrecursos/delete/' + id
    }).done(function (data) {
        if (data == 'Si' || data == 'No')
        {
            if (data == 'Si')
            {
                notify("info", "ok", "Convocatoria documento:", "Se activó el registro con éxito.");
            } else
            {
                notify("danger", "ok", "Convocatoria documento:", "Se inactivo el registro con éxito.");
            }
        } else
        {
            if (data == 'acceso_denegado')
            {
                notify("danger", "remove", "Convocatorias:", "Acceso denegado.");
            } else
            {
                notify("danger", "ok", "Convocatorias:", "Se registro un error en el método, comuníquese con la mesa de ayuda convocatorias@scrd.gov.co");
            }
        }
    });
}

//Carga el registro el registro del recurso de la convocatoria
function cargar_registro(id, form) {
    var json_update = JSON.parse($(".btn-update-distribucion-registro-" + id).attr("lang"));
    $('#' + form).loadJSON(json_update);
}

//Permite realizar acciones despues de cargar la tabla
function acciones_categoria(token_actual)
{
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
            data: {"token": token_actual.token, "modulo": "Convocatorias", "active": active},
            url: url_pv + 'Convocatoriasanexos/delete/' + $(this).attr("title")
        }).done(function (data) {
            if (data == 'Si' || data == 'No')
            {
                if (data == 'Si')
                {
                    notify("info", "ok", "Convocatorias:", "Se activó el documento con éxito.");
                } else
                {
                    notify("info", "ok", "Convocatorias:", "Se eliminó el documento con éxito.");
                }
            } else
            {
                if (data == 'acceso_denegado')
                {
                    notify("danger", "remove", "Convocatorias:", "Acceso denegado.");
                } else
                {
                    notify("danger", "ok", "Convocatorias:", "Se registro un error en el método, comuníquese con la mesa de ayuda convocatorias@scrd.gov.co");
                }
            }
        });
    });

}