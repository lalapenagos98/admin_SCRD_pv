$(document).ready(function () {

    //Verifico si el token exite en el cliente y verifico que el token este activo en el servidor                
    var token_actual = getLocalStorage(name_local_storage);

    //Verifico si el token esta vacio, para enviarlo a que ingrese de nuevo
    if ($.isEmptyObject(token_actual)) {
        location.href = url_pv_admin+'index.html?msg=Su sesión ha expirado, por favor vuelva a ingresar.&msg_tipo=danger';
    } else
    {
        //Verifica si el token actual tiene acceso de lectura
        permiso_lectura(token_actual, "Menu Participante");        

        //Valido formulario
        validator_form(token_actual);
        
        //cargar select tiene_rut
        $('#tiene_rut').on('change', function () {            
            if($(this).val()==="Sí")
            {
                $("#ciiu").removeAttr("disabled");
            }
            else
            {
                $("#ciiu").attr("disabled","disabled");
            }
        });
        
        //cargar select tiene_redes
        $('#tiene_redes').on('change', function () {            
            if($(this).val()==="Sí")
            {
                $(".si_tiene_redes").removeAttr("disabled");
            }
            else
            {
                $(".si_tiene_redes").attr("disabled","disabled");
            }
        });
        
        //cargar select tiene_paginas
        $('#tiene_paginas').on('change', function () {            
            if($(this).val()==="Sí")
            {
                $(".si_tiene_espacios").removeAttr("disabled");
            }
            else
            {
                $(".si_tiene_espacios").attr("disabled","disabled");
            }
        });

        //Realizo la peticion para cargar el formulario
        $.ajax({
            type: 'GET',
            data: {"token": token_actual.token, "id": $("#id").attr('value')},
            url: url_pv + 'Agrupaciones/search/'
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
                    //Cargo el formulario con los datos
                    $('#formulario_principal').loadJSON(json.participante);       
                    
                    //Valido el tiene_redes                        
                    if(json.participante.tiene_redes==="Sí")
                    {
                        $(".si_tiene_redes").removeAttr("disabled");
                    }
                    else
                    {
                        $(".si_tiene_redes").attr("disabled","disabled");
                    }

                    //Valido el tiene_paginas                        
                    if(json.participante.tiene_paginas==="Sí")
                    {
                        $(".si_tiene_espacios").removeAttr("disabled");
                    }
                    else
                    {
                        $(".si_tiene_espacios").attr("disabled","disabled");
                    } 
                }

            }
        });

    }
});

function validator_form(token_actual) {
    //Se debe colocar debido a que el calendario es un componente diferente
    $('.calendario').on('changeDate show', function (e) {
        $('.formulario_principal').bootstrapValidator('revalidateField', 'fecha_nacimiento');
    });
    //Validar el formulario
    $('.formulario_principal').bootstrapValidator({
        feedbackIcons: {
            valid: 'glyphicon glyphicon-ok',
            invalid: 'glyphicon glyphicon-remove',
            validating: 'glyphicon glyphicon-refresh'
        },
        fields: {
            primer_nombre: {
                validators: {
                    notEmpty: {message: 'El nombre de la agrupación es requerido'}
                }
            },
            correo_electronico: {
                validators: {
                    notEmpty: {message: 'El correo electrónico de la entidad es requerido'},
                    emailAddress: {
                        message: 'El Correo electrónico no es una dirección de correo electrónico válida'
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

        // Valido si el id existe, con el fin de eviarlo al metodo correcto
        $('#formulario_principal').attr('action', url_pv + 'Agrupaciones/new');
        

        //Se realiza la peticion con el fin de guardar el registro actual
        $.ajax({
            type: 'POST',
            url: $form.attr('action'),
            data: $form.serialize() + "&modulo=Menu Participante&token=" + token_actual.token
        }).done(function (result) {

            if (result == 'error')
            {
                notify("danger", "ok", "Agrupación:", "Se registro un error, comuníquese con la mesa de ayuda convocatorias@scrd.gov.co");
            } 
            else
            {
                if (result == 'error_token')
                {
                    location.href = url_pv_admin + 'index.html?msg=Su sesión ha expirado, por favor vuelva a ingresar.&msg_tipo=danger';
                } 
                else
                {
                    if (result == 'acceso_denegado')
                    {
                        notify("danger", "remove", "Usuario:", "No tiene permisos para editar información.");
                    } 
                    else
                    {
                        if (result == 'error_usuario_perfil')
                        {
                            notify("danger", "ok", "Agrupación:", "Se registro un error al crear el perfil, comuníquese con la mesa de ayuda convocatorias@scrd.gov.co");
                        } 
                        else
                        {
                            if (result == 'participante_existente')
                            {
                                notify("danger", "ok", "Agrupación:", "El participante que intenta ingresar ya se encuentra registrado en la base de datos, comuníquese con la mesa de ayuda convocatorias@scrd.gov.co");
                            } 
                            else
                            {
                                if (isNaN(result)) {
                                    notify("danger", "ok", "Agrupación:", "Se registro un error, comuníquese con la mesa de ayuda convocatorias@scrd.gov.co");
                                } 
                                else
                                {
                                    notify("success", "ok", "Agrupación:", "Se actualizó con el éxito el participante como agrupación.");                                    
                                }
                            }
                        }                                                
                    }
                }                                
            }

        });
        
        //$form.bootstrapValidator('disableSubmitButtons', false).bootstrapValidator('resetForm', true);        
    });

}