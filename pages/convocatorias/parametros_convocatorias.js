keycloak.init(initOptions).then(function (authenticated) {
    //Si no esta autenticado lo obliga a ingresar al keycloak
    if (authenticated === false)
    {
        keycloak.login();
    } else
    {
        //Guardamos el token en el local storage
        if (typeof keycloak === 'object') {

            var token_actual = JSON.parse(JSON.stringify(keycloak));

            //Verifica si el token actual tiene acceso de lectura
            permiso_lectura_keycloak(token_actual.token, "SICON-CONVOCATORIAS-CONFIGURACION");

            //Cargamos el menu principal
            $.ajax({
                type: 'POST',
                data: {"token": token_actual.token, "id": getURLParameter('id'), "m": getURLParameter('m'), "p": getURLParameter('p'), "sub": getURLParameter('sub')},
                url: url_pv + 'Administrador/menu'
            }).done(function (result) {
                if (result == 'error_token')
                {
                    location.href = url_pv_admin + 'index.html?msg=Su sesión ha expirado, por favor vuelva a ingresar.&msg_tipo=danger';
                } else
                {
                    $("#menu_principal").html(result);
                }
            });

            //Realizo la peticion para cargar el formulario
            if ($("#id").val() != "") {

                //Establesco los text area html
                $('.textarea_html').jqte();

                //Limpio el formulario de los anexos
                $('#nuevo_evento').on('hidden.bs.modal', function () {
                    $("#valores").val('');
                    $("#label").val("");
                    $("#orden").val("");
                    $("#tipo_parametro option[value='']").prop("selected", true);
                    $("#id_registro").val("");
                });

                //Agrego url para retornar
                $(".regresar").attr("onclick", "location.href='update.html?id=" + $("#id").attr('value') + "'");

                //Realizo la peticion para cargar el formulario
                $.ajax({
                    type: 'POST',
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
                                        $(".diferentes_requisitos").css("display", "block");
                                        //Cargo el select de las categorias                                                
                                        if (json.categorias.length > 0) {
                                            $.each(json.categorias, function (key, categoria) {
                                                $("#convocatoria").append('<option value="' + categoria.id + '" >' + categoria.nombre + '</option>');
                                            });
                                        }
                                    } else
                                    {
                                        $(".diferentes_requisitos").css("display", "none");
                                    }

                                    //Si la convocatoria fue publicada o cancelada o suspendida
                                    if (json.convocatoria.estado == 5 || json.convocatoria.estado == 32 || json.convocatoria.estado == 43 || json.convocatoria.estado == 45 || json.convocatoria.estado == 6) {
                                        $("#form_nuevo_documento input,select,button[type=submit],textarea").attr("disabled", "disabled");
                                        $("#table_registros button,input,select,button[type=submit],textarea").attr("disabled", "disabled");
                                        $(".input-sm").css("display", "none");
                                        $(".paginate_button").css("display", "none");
                                        $(".jqte_editor").prop('contenteditable', 'false');
                                    }

                                }
                            }
                        }
                    }
                });

                //Cargar datos de la tabla
                cargar_tabla(token_actual);

            } else
            {
                location.href = 'list.html?msg=Debe seleccionar una convocatoria, para poder continuar.&msg_tipo=danger';
            }

            validator_form(token_actual);
            $(".check_activar_t").attr("checked", "true");
        }
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
            tipo_parametro: {
                validators: {
                    notEmpty: {message: 'El tipo de parametro es requerido'}
                }
            },
            label: {
                validators: {
                    notEmpty: {message: 'El nombre es requerido'}
                }
            },
            orden: {
                validators: {
                    notEmpty: {message: 'El orden es requerido'},
                    numeric: {message: 'Debe ingresar solo numeros'}
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
        formData.append("modulo", "SICON-CONVOCATORIAS-CONFIGURACION");
        formData.append("token", token_actual.token);
        formData.append("convocatoria_padre_categoria", $("#id").attr('value'));
        formData.append("anexos", "listados");

        if ($("#id_registro").val().length < 1) {
            //Se realiza la peticion con el fin de guardar el registro actual
            $.ajax({
                type: 'POST',
                url: url_pv + 'Convocatoriaspropuestasparametros/new',
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
                                    notify("success", "ok", "Convocatorias:", "Se creó el parametro con éxito.");
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
                url: url_pv + 'Convocatoriaspropuestasparametros/edit/' + $("#id_registro").attr('value'),
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
                                    notify("info", "ok", "Convocatorias:", "Se edito el parametro con éxito.");
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
        $("#tipo_parametro option[value='']").prop("selected", true);
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
            url: url_pv + "Convocatoriaspropuestasparametros/all",
            data: {"token": token_actual.token, "convocatoria": $("#id").attr('value'), "anexos": "listados"},
            type: "POST"
        },
        "drawCallback": function (settings) {
            $(".check_activar_t").attr("checked", "true");
            $(".check_activar_f").removeAttr("checked");
            acciones_categoria(token_actual);
            //Cargo el formulario, para crear o editar
            cargar_formulario(token_actual);
        },
        "columns": [
            {"data": "convocatoria"},
            {"data": "categoria"},
            {"data": "tipo_parametro"},
            {"data": "label"},
            {"data": "valores"},
            {"data": "orden"},
            {"data": "activar_registro"},
            {"data": "acciones"}
        ],
        "columnDefs": [{
                "targets": 0,
                "render": function (data, type, row, meta) {
                    row.categoria = "<a href='formulario_dinamico.html?id=" + row.id_categoria + "' target='_blank'>" + row.categoria + "</a>";
                    if (data == null) {
                        row.convocatoria = "<a href='formulario_dinamico.html?id=" + getURLParameter('id') + "' target='_blank'>" + row.categoria + "</a>";
                        row.categoria = "";
                    }
                    return row.convocatoria;
                }
            }, {orderable: false, targets: '_all'}
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
            type: 'POST',
            data: {"token": token_actual.token, "convocatoria": $("#id").attr('value'), "id": $("#id_registro").attr('value'), "anexos": "listados"},
            url: url_pv + 'Convocatoriaspropuestasparametros/search/'
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

                    //Cargo el select de los tipo_parametro
                    $('#tipo_parametro').find('option').remove();
                    $("#tipo_parametro").append('<option value="">:: Seleccionar ::</option>');
                    if (json.tipo_parametro.length > 0) {
                        $.each(json.tipo_parametro, function (key, registro) {
                            $("#tipo_parametro").append('<option value="' + registro + '">' + registro + '</option>');
                        });
                    }

                    //Cargo el formulario con los datos
                    $('#form_nuevo_documento').loadJSON(json.convocatoriaspropuestasparametros);
                    $("#obligatorio option[value='" + json.convocatoriaspropuestasparametros.obligatorio + "']").prop("selected", true);
                    $("#valores").val(json.convocatoriaspropuestasparametros.valores);


                }
            }
        });
    });
}

//Funcion para activar o desactivar los recursos del estimulo
function activar_registro(id, token_actual) {
    $.ajax({
        type: 'DELETE',
        data: {"token": token_actual, "modulo": "SICON-CONVOCATORIAS-CONFIGURACION"},
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
            data: {"token": token_actual.token, "modulo": "SICON-CONVOCATORIAS-CONFIGURACION", "active": active},
            url: url_pv + 'Convocatoriaspropuestasparametros/delete/' + $(this).attr("title")
        }).done(function (data) {
            if (data == 'Si' || data == 'No')
            {
                if (data == 'Si')
                {
                    notify("info", "ok", "Convocatorias:", "Se activó el parametro con éxito.");
                } else
                {
                    notify("info", "ok", "Convocatorias:", "Se eliminó el parametro con éxito.");
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