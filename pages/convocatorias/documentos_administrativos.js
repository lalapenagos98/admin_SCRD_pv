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
                data: {"token": token_actual.token, "id": getURLParameter('id'), "m": getURLParameter('m'), "p": getURLParameter('p'), "sub": getURLParameter('sub'), "modulo": "SICON-CONVOCATORIAS-CONFIGURACION-UPDATE"},
                url: url_pv + 'Administrador/menu_funcionario'
            }).done(function (result) {
                if (result == 'error_token')
                {
                    notify("danger", "ok", "Convocatorias:", "Por favor actualizar la página, debido a que su sesión caduco");
                } else
                {
                    $("#menu_principal").html(result);
                }
            });

            //Realizo la peticion para cargar el formulario
            if ($("#id").val() != "") {

                //Establesco los text area html
                if (CKEDITOR.env.ie && CKEDITOR.env.version < 9)
                    CKEDITOR.tools.enableHtml5Elements(document);

                CKEDITOR.config.height = 150;
                CKEDITOR.config.width = 'auto';
                CKEDITOR.replace('descripcion');

                //Limpio el formulario de las categorias
                $('#nuevo_evento').on('hidden.bs.modal', function () {
                    CKEDITOR.instances.descripcion.setData('');
                    $("#orden").val("");
                    $("#requisto option[value='']").prop("selected", true);
                    $("#subsanable option[value='true']").prop("selected", true);
                    $("#obligatorio option[value='true']").prop("selected", true);
                    $("#id_registro").val("");
                });

                //Realizo la peticion para cargar el formulario
                $.ajax({
                    type: 'POST',
                    data: {"token": token_actual.token, "id": $("#id").attr('value'), "tipo_requisito": "Administrativos"},
                    url: url_pv + 'Convocatorias/search/'
                }).done(function (data) {
                    if (data == 'error_metodo')
                    {
                        notify("danger", "ok", "Convocatorias:", "Se registro un error en el método, comuníquese con la mesa de ayuda convocatorias@scrd.gov.co");
                    } else
                    {
                        if (data == 'error')
                        {
                            location.href = 'list.html?msg=Debe seleccionar una convocatoria, para poder continuar.&msg_tipo=danger';
                        } else
                        {
                            if (data == 'error_token')
                            {
                                notify("danger", "ok", "Convocatorias:", "Por favor actualizar la página, debido a que su sesión caduco");
                            } else
                            {
                                var json = JSON.parse(data);

                                if (typeof json.convocatoria.id === 'number') {

                                    //Agrego url para retornar
                                    $(".regresar").attr("onclick", "location.href='update.html?id=" + $("#id").attr('value') + "'");

                                    //Limpio select de categorias
                                    $('#convocatoria').find('option').remove();

                                    //Valido si la convocatoria tiene categorias                                            
                                    if (json.convocatoria.diferentes_categorias == true)
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

                                    //Asigno la modalidad con el fin de determinar si es para jurados
                                    $("#modalidad").attr('value', json.convocatoria.modalidad);

                                    //Si la convocatoria fue publicada o cancelada o suspendida
                                    if (json.convocatoria.estado == 5 || json.convocatoria.estado == 32 || json.convocatoria.estado == 43 || json.convocatoria.estado == 45 || json.convocatoria.estado == 6) {
                                        $("#form_validator input,select,button[type=submit],textarea").attr("disabled", "disabled");
                                        $("#table_cronogramas button,input,select,button[type=submit],textarea").attr("disabled", "disabled");
                                        $(".input-sm").css("display", "none");
                                        $(".paginate_button").css("display", "none");
                                        CKEDITOR.instances.descripcion.config.readOnly = true;
                                    }
                                }
                            }
                        }
                    }
                });

                //Cargar datos de la tabla
                cargar_tabla(token_actual);

                //Cargo el formulario, para crear o editar
                $("#cargar_formulario").click(function () {
                    var tipo_requisito = "Administrativos";
                    //Valido si la modalidad es de jurados
                    if ($("#modalidad").val() == 2)
                    {
                        tipo_requisito = "JuradosAdministrativos";
                    }
                    //Realizo la peticion para cargar el formulario                                
                    $.ajax({
                        type: 'POST',
                        data: {"token": token_actual.token, "convocatoria": $("#id").attr('value'), "id": $("#id_registro").attr('value'), "tipo_requisito": tipo_requisito},
                        url: url_pv + 'Convocatoriasdocumentos/search/'
                    }).done(function (data) {
                        if (data == 'error_metodo')
                        {
                            notify("danger", "ok", "Convocatorias:", "Se registro un error en el método, comuníquese con la mesa de ayuda convocatorias@scrd.gov.co");
                        } else
                        {
                            if (data == 'error')
                            {
                                location.href = 'list.html?msg=Debe seleccionar una convocatoria, para poder continuar.&msg_tipo=danger';
                            } else
                            {
                                if (data == 'error_token')
                                {
                                    notify("danger", "ok", "Convocatorias:", "Por favor actualizar la página, debido a que su sesión caduco");
                                } else
                                {
                                    var json = JSON.parse(data);
                                    //Cargo el select de los requisitos
                                    $('#requisito').find('option').remove();
                                    $("#requisito").append('<option value="">:: Seleccionar ::</option>');
                                    if (json.requisitos.length > 0) {
                                        $.each(json.requisitos, function (key, requisito) {
                                            $("#requisito").append('<option value="' + requisito.id + '" >' + requisito.nombre + '</option>');
                                        });
                                    }

                                    //Cargo el select de los etapas                                
                                    $('#etapa').find('option').remove();
                                    $("#etapa").append('<option value="">:: Seleccionar ::</option>');
                                    if (json.etapas.length > 0) {
                                        $.each(json.etapas, function (key, etapa) {
                                            $("#etapa").append('<option value="' + etapa + '" >' + etapa + '</option>');
                                        });
                                    }

                                    //Cargo el select de archivos permitidos                                            
                                    $('#archivos_permitidos').find('option').remove();
                                    if (json.tipos_archivos_tecnicos.length > 0) {
                                        $.each(json.tipos_archivos_tecnicos, function (key, archivo_permitido) {
                                            var selected = '';
                                            //Solo aplica cuando se carga para crear un nuevo registro
                                            if (json.convocatoriadocumento.id == null && archivo_permitido == 'pdf')
                                            {
                                                selected = 'selected="selected"';
                                            }
                                            $("#archivos_permitidos").append('<option value="' + archivo_permitido + '" ' + selected + ' >' + archivo_permitido + '</option>');
                                        });
                                    }

                                    //Cargo el select de tamaños permitidos                                            
                                    $('#tamano_permitido').find('option').remove();
                                    $("#tamano_permitido").append('<option value="">:: Seleccionar ::</option>');
                                    if (json.tamanos_permitidos.length > 0) {
                                        $.each(json.tamanos_permitidos, function (key, tamano_permitido) {
                                            $("#tamano_permitido").append('<option value="' + tamano_permitido + '" >' + tamano_permitido + '</option>');
                                        });
                                    }

                                    //Cargo el formulario con los datos
                                    $('#form_nuevo_documento').loadJSON(json.convocatoriadocumento);


                                }
                            }
                        }
                    });
                });


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
            requisito: {
                validators: {
                    notEmpty: {message: 'El requisito es requerido'}
                }
            },
            etapa: {
                validators: {
                    notEmpty: {message: 'La etapa es requerida'}
                }
            },
            orden: {
                validators: {
                    notEmpty: {message: 'El orden es requerido'},
                    numeric: {message: 'Debe ingresar solo numeros'}
                }
            },
            tamano_permitido: {
                validators: {
                    notEmpty: {message: 'El tamaño máximo permitido es requerido'}
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

        var values = $form.serializeArray();

        values.find(input => input.name == 'descripcion').value = CKEDITOR.instances.descripcion.getData();

        if ($("#id_registro").val().length < 1) {
            //Se realiza la peticion con el fin de guardar el registro actual
            $.ajax({
                type: 'POST',
                url: url_pv + 'Convocatoriasdocumentos/new',
                data: $.param(values) + "&modulo=SICON-CONVOCATORIAS-CONFIGURACION&token=" + token_actual.token + "&convocatoria_padre_categoria=" + $("#id").attr('value')
            }).done(function (result) {

                if (result == 'error')
                {
                    notify("danger", "ok", "Convocatorias:", "Se registro un error, comuníquese con la mesa de ayuda convocatorias@scrd.gov.co");
                } else
                {
                    if (result == 'error_token')
                    {
                        notify("danger", "ok", "Convocatorias:", "Por favor actualizar la página, debido a que su sesión caduco");
                    } else
                    {
                        if (result == 'acceso_denegado')
                        {
                            notify("danger", "remove", "Usuario:", "No tiene permisos para editar información.");
                        } else
                        {
                            if (isNaN(result)) {
                                notify("danger", "ok", "Convocatorias:", "Se registro un error, comuníquese con la mesa de ayuda convocatorias@scrd.gov.co");
                            } else
                            {
                                notify("success", "ok", "Convocatorias:", "Se creó el documento administrativo con éxito.");
                                //Cargar datos de la tabla de categorias
                                cargar_tabla(token_actual);
                            }
                        }
                    }
                }

            });
        } else
        {
            //Realizo la peticion con el fin de editar el registro actual
            $.ajax({
                type: 'PUT',
                url: url_pv + 'Convocatoriasdocumentos/edit/' + $("#id_registro").attr('value'),
                data: $.param(values) + "&modulo=SICON-CONVOCATORIAS-CONFIGURACION&token=" + token_actual.token + "&convocatoria_padre_categoria=" + $("#id").attr('value')
            }).done(function (result) {
                if (result == 'error')
                {
                    notify("danger", "ok", "Convocatorias:", "Se registro un error, comuníquese con la mesa de ayuda convocatorias@scrd.gov.co");
                } else
                {
                    if (result == 'error_token')
                    {
                        notify("danger", "ok", "Convocatorias:", "Por favor actualizar la página, debido a que su sesión caduco");
                    } else
                    {
                        if (result == 'acceso_denegado')
                        {
                            notify("danger", "remove", "Usuario:", "No tiene permisos para editar información.");
                        } else
                        {
                            if (isNaN(result))
                            {
                                notify("danger", "ok", "Convocatorias:", "Se registro un error, comuníquese con la mesa de ayuda convocatorias@scrd.gov.co");
                            } else
                            {
                                notify("info", "ok", "Convocatorias:", "Se edita el documento con éxito.");
                                cargar_tabla(token_actual);
                            }
                        }
                    }
                }
            });
        }

        $form.bootstrapValidator('disableSubmitButtons', false).bootstrapValidator('resetForm', true);
        bv.resetForm();
        CKEDITOR.instances.descripcion.setData('');
        $("#orden").val("");
        $("#requisto option[value='']").prop("selected", true);
        $("#subsanable option[value='true']").prop("selected", true);
        $("#obligatorio option[value='true']").prop("selected", true);
        $("#id_registro").val("");
        $('#nuevo_evento').modal('toggle');
    });

}

function cargar_tabla(token_actual)
{
    $('#table_cronogramas').DataTable({
        "language": {
            "url": "../../dist/libraries/datatables/js/spanish.json"
        },
        "processing": true,
        "destroy": true,
        "serverSide": true,
        "lengthMenu": [20, 30, 40],
        "ajax": {
            url: url_pv + "Convocatoriasdocumentos/all",
            data: {"token": token_actual.token, "convocatoria": $("#id").attr('value'), "tipo_requisito": "Administrativos"},
            type: "POST"
        },
        "drawCallback": function (settings) {
            $(".check_activar_t").attr("checked", "true");
            $(".check_activar_f").removeAttr("checked");
            acciones_categoria(token_actual);
        },
        "columns": [
            {"data": "convocatoria"},
            {"data": "categoria"},
            {"data": "requisito"},
            {"data": "subsanable"},
            {"data": "obligatorio"},
            {"data": "orden"},
            {"data": "descripcion"},
            {"data": "activar_registro"},
            {"data": "acciones"}
        ],
        "columnDefs": [{
                "targets": 0,
                "render": function (data, type, row, meta) {
                    if (row.subsanable == true) {
                        row.subsanable = "Si";
                    }
                    if (row.subsanable == false) {
                        row.subsanable = "No";
                    }

                    if (row.obligatorio == true) {
                        row.obligatorio = "Si";
                    }
                    if (row.obligatorio == false) {
                        row.obligatorio = "No";
                    }
                    if (data == null) {
                        row.convocatoria = row.categoria;
                        row.categoria = "";
                    }
                    return row.convocatoria;
                }
            }, {orderable: false, targets: '_all'}
        ]
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
                notify("info", "ok", "Convocatoria recurso:", "Se activó el registro con éxito.");
            } else
            {
                notify("danger", "ok", "Convocatoria recurso:", "Se inactivo el registro con éxito.");
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
            url: url_pv + 'Convocatoriasdocumentos/delete/' + $(this).attr("title")
        }).done(function (data) {
            if (data == 'Si' || data == 'No')
            {
                if (data == 'Si')
                {
                    notify("info", "ok", "Convocatorias:", "Se activó el documento con éxito.");
                } else
                {
                    notify("info", "ok", "Convocatorias:", "Se inactivo el documento con éxito.");
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

    //Permite realizar la carga respectiva de la categoria
    $(".btn_cargar").click(function () {
        //Realizo la peticion para cargar el formulario
        $.ajax({
            type: 'POST',
            data: {"token": token_actual.token, "convocatoria": $("#id").attr('value'), "id": $(this).attr("title"), "tipo_requisito": "Administrativos"},
            url: url_pv + 'Convocatoriasdocumentos/search/'
        }).done(function (data) {
            if (data == 'error_metodo')
            {
                notify("danger", "ok", "Convocatorias:", "Se registro un error en el método, comuníquese con la mesa de ayuda convocatorias@scrd.gov.co");
            } else
            {
                if (data == 'error')
                {
                    notify("danger", "ok", "Convocatorias:", "El convocatoria no se encuentra registrado, por favor registrarse");
                } else
                {
                    var json = JSON.parse(data);

                    //Cargo el select de los requisitos                                
                    $('#requisito').find('option').remove();
                    $("#requisito").append('<option value="">:: Seleccionar ::</option>');
                    if (json.requisitos.length > 0) {
                        $.each(json.requisitos, function (key, requisito) {
                            $("#requisito").append('<option value="' + requisito.id + '" >' + requisito.nombre + '</option>');
                        });
                    }

                    //Cargo el select de archivos permitidos                                            
                    $('#archivos_permitidos').find('option').remove();
                    if (json.tipos_archivos_tecnicos.length > 0) {
                        $.each(json.tipos_archivos_tecnicos, function (key, archivo_permitido) {
                            $("#archivos_permitidos").append('<option value="' + archivo_permitido + '" >' + archivo_permitido + '</option>');
                        });
                    }

                    //Cargo el select de tamaños permitidos                                            
                    $('#tamano_permitido').find('option').remove();
                    $("#tamano_permitido").append('<option value="">:: Seleccionar ::</option>');
                    if (json.tamanos_permitidos.length > 0) {
                        $.each(json.tamanos_permitidos, function (key, tamano_permitido) {
                            $("#tamano_permitido").append('<option value="' + tamano_permitido + '" >' + tamano_permitido + '</option>');
                        });
                    }

                    //Cargo el select de los etapas                                
                    $('#etapa').find('option').remove();
                    $("#etapa").append('<option value="">:: Seleccionar ::</option>');
                    if (json.etapas.length > 0) {
                        $.each(json.etapas, function (key, etapa) {
                            $("#etapa").append('<option value="' + etapa + '" >' + etapa + '</option>');
                        });
                    }

                    //Cargo el formulario con los datos
                    $('#form_nuevo_documento').loadJSON(json.convocatoriadocumento);
                    $("#requisito option[value='" + json.convocatoriadocumento.requisito + "']").prop('selected', true);
                    $("#archivos_permitidos option:selected").removeAttr("selected");
                    $("#archivos_permitidos option:selected").prop("selected", false);
                    $.each(JSON.parse(json.convocatoriadocumento.archivos_permitidos), function (i, e) {
                        $("#archivos_permitidos option[value='" + e + "']").prop("selected", true);
                    });
                    $("#tamano_permitido option[value='" + json.convocatoriadocumento.tamano_permitido + "']").prop('selected', true);
                    $("#etapa option[value='" + json.convocatoriadocumento.etapa + "']").prop('selected', true);
                    $("#subsanable option[value='" + json.convocatoriadocumento.subsanable + "']").prop('selected', true);
                    $("#obligatorio option[value='" + json.convocatoriadocumento.obligatorio + "']").prop('selected', true);
                    CKEDITOR.instances.descripcion.setData(json.convocatoriadocumento.descripcion);
                    $("#id_registro").val(json.convocatoriadocumento.id);

                }
            }
        });


    });



}