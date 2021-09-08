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
            permiso_lectura_keycloak(token_actual.token, "SICON-AJUSTAR-CONVOCATORIAS");

            //Cargamos el menu principal
            $.ajax({
                type: 'POST',
                data: {"token": token_actual.token, "id": getURLParameter('id'), "m": getURLParameter('m'), "p": getURLParameter('p'), "sub": getURLParameter('sub'), "modulo": "SICON-AJUSTAR-CONVOCATORIAS-UPDATE"},
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
                if (CKEDITOR.env.ie && CKEDITOR.env.version < 9)
                    CKEDITOR.tools.enableHtml5Elements(document);

                CKEDITOR.config.height = 150;
                CKEDITOR.config.width = 'auto';
                CKEDITOR.replace('descripcion');

                //Limpio el formulario de las categorias
                $('#nuevo_evento').on('hidden.bs.modal', function () {
                    CKEDITOR.instances.descripcion.setData('');
                    $("#fecha_inicio").val("");
                    $("#fecha_fin").val("");
                    $("#tipo_evento option[value='']").prop("selected", true);
                    $("#id_registro").val("");
                });

                //Realizo la peticion para cargar el formulario
                $.ajax({
                    type: 'POST',
                    data: {"token": token_actual.token, "id": $("#id").attr('value')},
                    url: url_pv + 'Convocatoriaspublicas/search/'
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
                                location.href = url_pv + 'index.html?msg=Su sesión ha expirado, por favor vuelva a ingresar.&msg_tipo=danger';
                            } else
                            {
                                var json = JSON.parse(data);

                                if (typeof json.convocatoria.id === 'number') {

                                    //Agrego url para retornar
                                    $(".regresar").attr("onclick", "location.href='update_publicas.html?id=" + $("#id").attr('value') + "'");

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
                                }
                            }
                        }
                    }
                });

                //Cargar datos de la tabla
                cargar_tabla(token_actual);

                $('#tipo_evento').change(function () {
                    if ($(this).find('option:selected').attr("title") == "true")
                    {
                        $(".es_periodo").css("display", "block");
                        $(".no_es_periodo").css("display", "none");
                    } else
                    {
                        $(".es_periodo").css("display", "none");
                        $(".no_es_periodo").css("display", "block");
                        $('#fecha_fin').val($('#fecha_inicio').val());
                    }
                    $('.form_nuevo_cronograma').bootstrapValidator('revalidateField', 'fecha_fin');
                });

                $('#fecha_inicio').change(function () {
                    if ($("#tipo_evento").find('option:selected').attr("title") == "false")
                    {
                        $('#fecha_fin').val($('#fecha_inicio').val());
                        //Se debe colocar debido a que el calendario es un componente diferente
                        $('.form_nuevo_cronograma').bootstrapValidator('revalidateField', 'fecha_fin');
                    }

                });

                //Cargo el formulario, para crear o editar
                $("#cargar_formulario").click(function () {
                    //Realizo la peticion para cargar el formulario
                    $.ajax({
                        type: 'POST',
                        data: {"token": token_actual.token, "convocatoria_padre_categoria": $("#id").attr('value'), "id": $("#id_registro").attr('value')},
                        url: url_pv + 'Convocatoriascronogramas/search/'
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
                                    location.href = url_pv + 'index.html?msg=Su sesión ha expirado, por favor vuelva a ingresar.&msg_tipo=danger';
                                } else
                                {
                                    var json = JSON.parse(data);
                                    //Cargo el select de los tipos eventos
                                    $('#tipo_evento').find('option').remove();
                                    $("#tipo_evento").append('<option value="">:: Seleccionar ::</option>');
                                    if (json.tipos_eventos.length > 0) {
                                        $.each(json.tipos_eventos, function (key, tipo_evento) {
                                            var publico = "";
                                            if (tipo_evento.publico)
                                            {
                                                publico = '(Público)';
                                            }
                                            $("#tipo_evento").append('<option title="' + tipo_evento.periodo + '" value="' + tipo_evento.id + '" >' + tipo_evento.nombre + ' ' + publico + '</option>');
                                        });
                                    }

                                    //Cargo el formulario con los datos
                                    $('#form_nuevo_cronograma').loadJSON(json.convocatoriacronograma);


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
    //Se debe colocar debido a que el calendario es un componente diferente
    $('.calendario').on('changeDate show', function (e) {
        $('.form_nuevo_cronograma').bootstrapValidator('revalidateField', 'fecha_inicio');
        $('.form_nuevo_cronograma').bootstrapValidator('revalidateField', 'fecha_fin');
    });
    //Validar el formulario
    $('.form_nuevo_cronograma').bootstrapValidator({
        feedbackIcons: {
            valid: 'glyphicon glyphicon-ok',
            invalid: 'glyphicon glyphicon-remove',
            validating: 'glyphicon glyphicon-refresh'
        },
        fields: {
            tipo_evento: {
                validators: {
                    notEmpty: {message: 'El tipo de evento es requerido'}
                }
            },
            fecha_inicio: {
                validators: {
                    notEmpty: {message: 'La fecha inicio es requerida'}
                }
            },
            fecha_fin: {
                validators: {
                    notEmpty: {message: 'La fecha fin es requerida'}
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
                url: url_pv + 'Convocatoriascronogramas/new',
                data: $.param(values) + "&modulo=SICON-AJUSTAR-CONVOCATORIAS&token=" + token_actual.token + "&convocatoria_padre_categoria=" + $("#id").attr('value')
            }).done(function (result) {

                if (result == 'error')
                {
                    notify("danger", "ok", "Convocatorias:", "Se registro un error, comuníquese con la mesa de ayuda convocatorias@scrd.gov.co");
                } else
                {
                    if (result == 'error_token')
                    {
                        location.href = url_pv + 'index.html?msg=Su sesión ha expirado, por favor vuelva a ingresar.&msg_tipo=danger';
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
                                notify("success", "ok", "Convocatorias:", "Se creó la categoría con éxito.");
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
                url: url_pv + 'Convocatoriascronogramas/edit/' + $("#id_registro").attr('value'),
                data: $.param(values) + "&modulo=SICON-AJUSTAR-CONVOCATORIAS&token=" + token_actual.token + "&convocatoria_padre_categoria=" + $("#id").attr('value')
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
                            if (isNaN(result))
                            {
                                notify("danger", "ok", "Convocatorias:", "Se registro un error, comuníquese con la mesa de ayuda convocatorias@scrd.gov.co");
                            } else
                            {
                                notify("info", "ok", "Convocatorias:", "Se edito el evento con éxito.");
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
        $("#fecha_inicio").val("");
        $("#fecha_fin").val("");
        $("#descripcion option[value='']").prop("selected", true);
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
            url: url_pv + "Convocatoriascronogramas/all",
            data: {"token": token_actual.token, "convocatoria": $("#id").attr('value')},
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
            {"data": "tipo_evento"},
            {"data": "fecha_inicio"},
            {"data": "fecha_fin"},
            {"data": "descripcion"},
            {"data": "activar_registro"},
            {"data": "acciones"}
        ],

        "columnDefs": [{
                "targets": 0,
                "render": function (data, type, row, meta) {
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
        data: {"token": token_actual, "modulo": "SICON-AJUSTAR-CONVOCATORIAS"},
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
            data: {"token": token_actual.token, "modulo": "SICON-AJUSTAR-CONVOCATORIAS", "active": active},
            url: url_pv + 'Convocatoriascronogramas/delete/' + $(this).attr("title")
        }).done(function (data) {
            if (data == 'Si' || data == 'No')
            {
                if (data == 'Si')
                {
                    notify("info", "ok", "Convocatorias:", "Se activó el evento con éxito.");
                } else
                {
                    notify("info", "ok", "Convocatorias:", "Se inactivo el evento con éxito.");
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
            data: {"token": token_actual.token, "convocatoria_padre_categoria": $("#id").attr('value'), "id": $(this).attr("title")},
            url: url_pv + 'Convocatoriascronogramas/search/'
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

                    if (json.es_periodo)
                    {
                        $(".es_periodo").css("display", "block");
                        $(".no_es_periodo").css("display", "none");
                    } else
                    {
                        $(".es_periodo").css("display", "none");
                        $(".no_es_periodo").css("display", "block");
                    }

                    //Cargo el select de los tipos eventos
                    $('#tipo_evento').find('option').remove();
                    $("#tipo_evento").append('<option value="">:: Seleccionar ::</option>');
                    if (json.tipos_eventos.length > 0) {
                        $.each(json.tipos_eventos, function (key, tipo_evento) {
                            var publico = "";
                            if (tipo_evento.publico)
                            {
                                publico = '(Público)';
                            }
                            $("#tipo_evento").append('<option title="' + tipo_evento.periodo + '" value="' + tipo_evento.id + '" >' + tipo_evento.nombre + ' ' + publico + '</option>');
                        });
                    }

                    //Cargo el formulario con los datos
                    $('#form_nuevo_cronograma').loadJSON(json.convocatoriacronograma);
                    CKEDITOR.instances.descripcion.setData(json.convocatoriacronograma.descripcion);
                    $("#id_registro").val(json.convocatoriacronograma.id);

                }
            }
        });


    });



}