
$(document).ready(function () {

    //Verifico si el token exite en el cliente y verifico que el token este activo en el servidor                
    var token_actual = getLocalStorage(name_local_storage);

    //Verifico si el token esta vacio, para enviarlo a que ingrese de nuevo
    if ($.isEmptyObject(token_actual)) {
        location.href = '../../index.html?msg=Su sesión ha expirado, por favor vuelva a ingresar.&msg_tipo=danger';
    } else
    {
        permiso_lectura(token_actual, "Encuestas");

        $('#form_validator').attr('action', url_pv + 'Encuestas/new');

        //Realizo la peticion para cargar el formulario
        $.ajax({
            type: 'GET',
            data: {"token": token_actual.token,"id": $("#id").attr('value')},
            url: url_pv + 'Encuestas/search'
        }).done(function (data) {
            if (data == 'error_metodo')
            {
                notify("danger", "ok", "Encuestas:", "Se registro un error en el método, comuníquese con la mesa de ayuda convocatorias@scrd.gov.co");
            } else
            {
                if (data == 'error')
                {
                    notify("danger", "ok", "Encuestas:", "El pais no se encuentra registrado, por favor registrarse");
                } else
                {
                    var json = JSON.parse(data);
                    
                    //Cargo el select de programas
                    $('#programa').find('option').remove();
                    $("#programa").append('<option value="">:: Seleccionar ::</option>');
                    if (json.programas.length > 0) {
                        $.each(json.programas, function (key, programa) {
                            var selected = '';
                            if (programa.id == json.encuesta.programa)
                            {
                                selected = 'selected="selected"';
                            }
                            $("#programa").append('<option value="' + programa.id + '" ' + selected + ' >' + programa.nombre + '</option>');
                        });
                    }

                    //Cargo el select de anios
                    $('#anio').find('option').remove();
                    $("#anio").append('<option value="">:: Seleccionar ::</option>');
                    if (json.anios.length > 0) {
                        $.each(json.anios, function (key, anio) {
                            var selected = '';
                            if (anio == json.encuesta.anio)
                            {
                                selected = 'selected="selected"';
                            }
                            $("#anio").append('<option value="' + anio + '"  >' + anio + '</option>');
                        });
                    }

                    if (typeof json.encuesta.id === 'number') {
                        $('#form_validator').loadJSON(json.encuesta);
                        $("#active option[value='" + json.encuesta.active + "']").prop('selected', true);
                    }
                }
            }
        });        

        validator_form(token_actual);
    }
});

function validator_form(token_actual) {
    //Validar el formulario
    $('.form_validator').bootstrapValidator({
        feedbackIcons: {
            valid: 'glyphicon glyphicon-ok',
            invalid: 'glyphicon glyphicon-remove',
            validating: 'glyphicon glyphicon-refresh'
        },
        fields: {
            nombre: {
                validators: {
                    notEmpty: {message: 'El nombre es requerido'}
                }
            },
            programa: {
                validators: {
                    notEmpty: {message: 'El programa es requerido'}
                }
            },
            anio: {
                validators: {
                    notEmpty: {message: 'El año es requerido'}
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

        // Enviar datos del formulario para guardar
        if (typeof $("#id").attr('value') === 'undefined') {

            //Se realiza la peticion con el fin de guardar el registro actual
            $.ajax({
                type: 'POST',
                url: $form.attr('action'),
                data: $form.serialize() + "&modulo=Encuestas&token=" + token_actual.token
            }).done(function (result) {

                if (result == 'error')
                {
                    notify("danger", "ok", "Encuestas:", "Se registro un error, comuníquese con la mesa de ayuda convocatorias@scrd.gov.co");
                } else
                {
                    if (result == 'acceso_denegado')
                    {
                        notify("danger", "remove", "Usuario:", "No tiene permisos para editar información.");
                    } else
                    {
                        if (isNaN(result)) {
                            notify("danger", "ok", "Encuestas:", "Se registro un error, comuníquese con la mesa de ayuda convocatorias@scrd.gov.co");
                        } else
                        {
                            //Asigno el valor id al hidden 
                            $("#id").attr('value', result);
                            notify("success", "ok", "Encuestas:", "Se creó el pais con éxito.");
                        }
                    }
                }

            });
        } else {
            //Realizo la peticion con el fin de editar el registro actual
            $.ajax({
                type: 'PUT',
                url: url_pv + 'Encuestas/edit/' + $("#id").attr('value'),
                data: $form.serialize() + "&modulo=Encuestas&token=" + token_actual.token
            }).done(function (result) {
                if (result == 'error')
                {
                    notify("danger", "ok", "Encuestas:", "Se registro un error, comuníquese con la mesa de ayuda convocatorias@scrd.gov.co");
                } else
                {
                    if (result == 'acceso_denegado')
                    {
                        notify("danger", "remove", "Usuario:", "No tiene permisos para editar información.");
                    } else
                    {
                        if (isNaN(result))
                        {
                            notify("danger", "ok", "Encuestas:", "Se registro un error, comuníquese con la mesa de ayuda convocatorias@scrd.gov.co");
                        } else
                        {
                            notify("info", "ok", "Encuestas:", "Se edito el pais con éxito.");
                        }
                    }
                }
            });
        }
        //$form.bootstrapValidator('disableSubmitButtons', false).bootstrapValidator('resetForm', true);
        bv.resetForm();
    });
}
        