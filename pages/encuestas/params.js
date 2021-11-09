//Array del consumo con el back
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
            permiso_lectura_keycloak(token_actual.token, "SICON-ADMINISTRACION-ENCUESTAS");
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


            //Asignamos el valor a input id y encuesta
            $("#id").attr('value', "");
            $("#encuesta").attr('value', getURLParameter('id'));

            //Realizo la peticion para cargar el formulario
            if ($("#encuesta").val() != "") {

                //Limpio el formulario de los anexos
                $('#nuevo_evento').on('hidden.bs.modal', function () {
                    $("#valores").val('');
                    $("#label").val("");
                    $("#orden").val("");
                    $("#tipo_parametro option[value='']").prop("selected", true);
                    $("#id").val("");
                });

                //Agrego url para retornar
                $(".regresar").attr("onclick", "location.href='update.html?id=" + $("#id").attr('value') + "'");

                //Cargar datos de la tabla
                cargar_tabla(token_actual);

            } else
            {
                location.href = 'list.html?msg=Debe seleccionar una entrevista, para poder continuar.&msg_tipo=danger';
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
        formData.append("modulo", "SICON-ADMINISTRACION-ENCUESTAS");
        formData.append("token", token_actual.token);

        if ($("#id").val().length < 1) {
            //Se realiza la peticion con el fin de guardar el registro actual
            $.ajax({
                type: 'POST',
                url: url_pv + 'Encuestas/new_param',
                data: formData,
                cache: false,
                contentType: false,
                processData: false
            }).done(function (result) {

                if (result == 'error')
                {
                    notify("danger", "ok", "Encuestas:", "Se registro un error, comuníquese con la mesa de ayuda convocatorias@scrd.gov.co");
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
                                notify("danger", "remove", "Encuestas:", "Se creó el registro, pero no se adjunto el archivo, comuníquese con la mesa de ayuda convocatorias@scrd.gov.co");
                            } else
                            {
                                if (isNaN(result)) {
                                    notify("danger", "ok", "Encuestas:", "Se registro un error, comuníquese con la mesa de ayuda convocatorias@scrd.gov.co");
                                } else
                                {
                                    notify("success", "ok", "Encuestas:", "Se creó el parametro con éxito.");
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
                url: url_pv + 'Encuestas/edit_param/' + $("#id").attr('value'),
                data: formData,
                cache: false,
                contentType: false,
                processData: false
            }).done(function (result) {
                if (result == 'error')
                {
                    notify("danger", "ok", "Encuestas:", "Se registro un error, comuníquese con la mesa de ayuda convocatorias@scrd.gov.co");
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
                                notify("danger", "remove", "Encuestas:", "Se edito el el registro, pero no se adjunto el archivo, comuníquese con la mesa de ayuda convocatorias@scrd.gov.co");
                            } else
                            {
                                if (isNaN(result))
                                {
                                    notify("danger", "ok", "Encuestas:", "Se registro un error, comuníquese con la mesa de ayuda convocatorias@scrd.gov.co");
                                } else
                                {
                                    notify("info", "ok", "Encuestas:", "Se edito el parametro con éxito.");
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
        $("#descripcion").val('');
        $("#orden").val("");
        $("#nombre").val("");
        $("#tipo_parametro option[value='']").prop("selected", true);
        $("#id").val("");
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
        "ordering": false,
        "lengthMenu": [30, 40, 50],
        "ajax": {
            url: url_pv + "Encuestas/all_params",
            data: {"token": token_actual.token, "encuesta": $("#encuesta").attr('value')},
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
            {"data": "encuesta"},
            {"data": "tipo_parametro"},
            {"data": "label"},
            {"data": "valores"},
            {"data": "orden"},
            {"data": "activar_registro"},
            {"data": "acciones"}
        ]
    });

}

function cargar_formulario(token_actual)
{
    $(".cargar_formulario").click(function () {
        //Cargo el id actual
        $("#id").attr('value', $(this).attr('title'))
        //Realizo la peticion para cargar el formulario
        $.ajax({
            type: 'POST',
            data: {"token": token_actual.token, "id": $("#id").attr('value')},
            url: url_pv + 'Encuestas/search_param/'
        }).done(function (data) {
            if (data == 'error_metodo')
            {
                notify("danger", "ok", "Encuestas:", "Se registro un error en el método, comuníquese con la mesa de ayuda convocatorias@scrd.gov.co");
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
                            if (registro == "Lista desplegable")
                            {
                                $("#tipo_parametro").append('<option value="' + registro + '">' + registro + '</option>');
                            }
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
            data: {"token": token_actual.token, "modulo": "SICON-ADMINISTRACION-ENCUESTAS", "active": active},
            url: url_pv + 'Encuestas/delete_param/' + $(this).attr("title")
        }).done(function (data) {
            if (data == 'Si' || data == 'No')
            {
                if (data == 'Si')
                {
                    notify("info", "ok", "Encuestas:", "Se activó el parametro con éxito.");
                } else
                {
                    notify("info", "ok", "Encuestas:", "Se eliminó el parametro con éxito.");
                }
            } else
            {
                if (data == 'acceso_denegado')
                {
                    notify("danger", "remove", "Encuestas:", "Acceso denegado.");
                } else
                {
                    notify("danger", "ok", "Encuestas:", "Se registro un error en el método, comuníquese con la mesa de ayuda convocatorias@scrd.gov.co");
                }
            }
        });
    });

}