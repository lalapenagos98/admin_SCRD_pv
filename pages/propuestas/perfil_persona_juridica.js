$(document).ready(function () {

    //Verifico si el token exite en el cliente y verifico que el token este activo en el servidor                
    var token_actual = getLocalStorage(name_local_storage);

    //Creando link de navegación
    $("#link_terminos").attr("onclick", "location.href = 'perfiles.html?m=1&id=" + $("#id").val() + "&p=" + getURLParameter('p') + "'");
    $("#link_propuestas").attr("onclick", "location.href = 'propuestas.html?m=" + getURLParameter('m') + "&id=" + getURLParameter('id') + "&p=" + getURLParameter('p') + "'");

    //Verifico si el token esta vacio, para enviarlo a que ingrese de nuevo
    if ($.isEmptyObject(token_actual)) {
        location.href = url_pv_admin + 'index.html?msg=Su sesión ha expirado, por favor vuelva a ingresar.&msg_tipo=danger';
    } else
    {
        //Valido el id de la propuesta
        if (Number.isInteger(parseInt(getURLParameter('p'))))
        {
            //Realizo la peticion para validar acceso a la convocatoria
            $.ajax({
                type: 'POST',
                data: {"token": token_actual.token, "p": getURLParameter('p')},
                url: url_pv + 'PropuestasBusquedasConvocatorias/validar_acceso/' + $("#id").val()
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
                        if (data == 'error_fecha_cierre')
                        {
                            notify("danger", "ok", "Convocatorias:", "La convocatoria ya no se encuentra disponible para inscribir su propuesta.");
                        } else
                        {
                            if (data == 'error_fecha_apertura')
                            {
                                notify("danger", "ok", "Convocatorias:", "La convocatoria esta en estado publicada, por favor revisar la fecha de apertura en el cronograma de la convocatoria.");
                            } else
                            {
                                if (data == 'error_maximo')
                                {
                                    location.href = url_pv_admin + 'pages/propuestas/propuestas_busqueda_convocatorias.html?msg=Ya tiene el máximo de propuestas guardadas permitidas para esta convocatoria, para visualizar sus propuestas por favor ingrese al menú Mis propuestas.&msg_tipo=danger';
                                } else
                                {
                                    if (data == 'error_propuesta')
                                    {
                                        location.href = url_pv_admin + 'pages/propuestas/propuestas_busqueda_convocatorias.html?msg=El código de la propuesta no es valido.&msg_tipo=danger';
                                    } else
                                    {
                                        if (data == 'error_participante')
                                        {
                                            location.href = url_pv_admin + 'pages/index/index.html?msg=Para poder inscribir la propuesta debe crear al menos un perfil como participante.&msg_tipo=danger';
                                        } 
                                        else
                                        {                                        
                                            if (data == 'ingresar')
                                            {
                                                //Vacio el id
                                                $("#id").attr('value', "");
                                                //Asignamos el valor a input conv
                                                $("#conv").attr('value', getURLParameter('id'));

                                                //disabled todos los componentes
                                                $("#formulario_principal input,textarea,select,button[type=submit]").attr("disabled", "disabled");

                                                //Verifica si el token actual tiene acceso de lectura
                                                permiso_lectura(token_actual, "Menu Participante");

                                                //Valido formulario
                                                validator_form(token_actual);

                                                //Cargar el select de Pais
                                                $.ajax({
                                                    type: 'GET',
                                                    data: {"token": token_actual.token},
                                                    url: url_pv + 'Paises/select_participantes'
                                                }).done(function (data) {
                                                    if (data == 'error_metodo')
                                                    {
                                                        notify("danger", "ok", "Usuarios:", "Se registro un error en el método, comuníquese con la mesa de ayuda convocatorias@scrd.gov.co");
                                                    } else
                                                    {
                                                        if (data == 'error')
                                                        {
                                                            notify("danger", "ok", "Usuarios:", "El usuario no se encuentra registrado, por favor registrarse");
                                                        } else
                                                        {
                                                            var json = JSON.parse(data);
                                                            $("#pais").append('<option value="">:: Seleccionar ::</option>');
                                                            $("#pais_nacimiento").append('<option value="">:: Seleccionar ::</option>');
                                                            if (json.length > 0) {
                                                                $("#pais").append('<option value="46">Colombia</option>');
                                                                $("#pais_nacimiento").append('<option value="46">Colombia</option>'); 
                                                                
                                                                $.each(json, function (key, pais) {
                                                                    if( pais.id !== 46){
                                                                        $("#pais").append('<option value="' + pais.id + '">' + pais.nombre + '</option>');
                                                                        $("#pais_nacimiento").append('<option value="' + pais.id + '">' + pais.nombre + '</option>');
                                                                    }
                                                                });
                                                            }
                                                        }
                                                    }
                                                });
                                                
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

                                                //Cargar el select de Localidades
                                                $.ajax({
                                                    type: 'GET',
                                                    data: {"token": token_actual.token,"ciudad":151},
                                                    url: url_pv + 'Localidades/select_participantes'
                                                }).done(function (data) {
                                                    if (data == 'error_metodo')
                                                    {
                                                        notify("danger", "ok", "Usuarios:", "Se registro un error en el método, comuníquese con la mesa de ayuda convocatorias@scrd.gov.co");
                                                    } else
                                                    {
                                                        if (data == 'error')
                                                        {
                                                            notify("danger", "ok", "Usuarios:", "El usuario no se encuentra registrado, por favor registrarse");
                                                        } else
                                                        {
                                                            var json = JSON.parse(data);
                                                            $("#localidad_residencia").append('<option value="">:: Seleccionar ::</option>');                    
                                                            if (json.length > 0) {
                                                                $.each(json, function (key, pais) {
                                                                    if( pais.id !== 21){                            
                                                                        $("#localidad_residencia").append('<option value="' + pais.id + '">' + pais.nombre + '</option>');                            
                                                                    }
                                                                });
                                                                $("#localidad_residencia").append('<option value="21">No aplica</option>'); 
                                                            }
                                                        }
                                                    }
                                                });

                                                //cargar select departamento
                                                $('#pais').on('change', function () {
                                                    var pais = $(this).val();
                                                    $('#departamento').find('option').remove();
                                                    $('#ciudad_residencia').find('option').remove();
                                                    $.ajax({
                                                        type: 'GET',
                                                        data: {"token": token_actual.token, "pais": pais},
                                                        url: url_pv + 'Departamentos/select_participantes'
                                                    }).done(function (data) {
                                                        if (data == 'error_metodo')
                                                        {
                                                            notify("danger", "ok", "Usuarios:", "Se registro un error en el método, comuníquese con la mesa de ayuda convocatorias@scrd.gov.co");
                                                        } else
                                                        {
                                                            if (data == 'error')
                                                            {
                                                                notify("danger", "ok", "Usuarios:", "El usuario no se encuentra registrado, por favor registrarse");
                                                            } else
                                                            {
                                                                var json = JSON.parse(data);
                                                                $("#departamento").append('<option value="">:: Seleccionar ::</option>');
                                                                $("#ciudad_residencia").append('<option value="">:: Seleccionar ::</option>');
                                                                if (json.length > 0) {
                                                                    $.each(json, function (key, value) {
                                                                        $("#departamento").append('<option value="' + value.id + '">' + value.nombre + '</option>');
                                                                    });
                                                                }
                                                            }
                                                        }
                                                    });
                                                });

                                                // Cargar Ciudad
                                                $('#departamento').on('change', function () {
                                                    var departamento = $(this).val();
                                                    $('#ciudad_residencia').find('option').remove();
                                                    $.ajax({
                                                        type: 'GET',
                                                        data: {"token": token_actual.token, "departamento": departamento},
                                                        url: url_pv + 'Ciudades/select_participantes'
                                                    }).done(function (data) {
                                                        if (data == 'error_metodo')
                                                        {
                                                            notify("danger", "ok", "Usuarios:", "Se registro un error en el método, comuníquese con la mesa de ayuda convocatorias@scrd.gov.co");
                                                        } else
                                                        {
                                                            if (data == 'error')
                                                            {
                                                                notify("danger", "ok", "Usuarios:", "El usuario no se encuentra registrado, por favor registrarse");
                                                            } else
                                                            {
                                                                var json = JSON.parse(data);
                                                                $("#ciudad_residencia").append('<option value="">:: Seleccionar ::</option>');
                                                                if (json.length > 0) {
                                                                    $.each(json, function (key, value) {
                                                                        $("#ciudad_residencia").append('<option value="' + value.id + '">' + value.nombre + '</option>');
                                                                    });
                                                                }
                                                            }
                                                        }
                                                    });
                                                });

                                                //Cargar Upz y Barrios
                                                $('#localidad_residencia').on('change', function () {
                                                    var localidad = $(this).val();
                                                    $('#barrio_residencia').find('option').remove();
                                                    $.ajax({
                                                        type: 'GET',
                                                        data: {"token": token_actual.token, "localidad": localidad},
                                                        url: url_pv + 'Barrios/select_participantes'
                                                    }).done(function (data) {
                                                        if (data == 'error_metodo')
                                                        {
                                                            notify("danger", "ok", "Usuarios:", "Se registro un error en el método, comuníquese con la mesa de ayuda convocatorias@scrd.gov.co");
                                                        } else
                                                        {
                                                            if (data == 'error_token')
                                                            {
                                                                location.href = url_pv_admin + 'index.html?msg=Su sesión ha expirado, por favor vuelva a ingresar.&msg_tipo=danger';
                                                            } else
                                                            {
                                                                var json = JSON.parse(data);
                                                                $("#barrio_residencia").append('<option value="">:: Seleccionar ::</option>');
                                                                if (json != null)
                                                                {
                                                                    if (json.length > 0) {
                                                                        $.each(json, function (key, value) {
                                                                            $("#barrio_residencia").append('<option value="' + value.id + '">' + value.nombre + '</option>');
                                                                        });
                                                                    }
                                                                }
                                                            }
                                                        }
                                                    });
                                                });

                                                $('#cuenta_sede').on('change', function () {
                                                    var cuenta_sede = $(this).val();
                                                    
                                                    if(cuenta_sede=="false"){                                                        
                                                        $("#tipo_sede option[value='']").prop('selected', true);
                                                        $('#tipo_sede').attr("disabled", true); 
                                                    }
                                                    else
                                                    {
                                                        $('#tipo_sede').attr("disabled", false); 
                                                    }
                                                });

                                                //Realizo la peticion para cargar el formulario
                                                $.ajax({
                                                    type: 'GET',
                                                    data: {"token": token_actual.token, "conv": $("#conv").attr('value'), "modulo": "Menu Participante", "p": getURLParameter('p')},
                                                    url: url_pv + 'Personasjuridicas/buscar_participante/'
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
                                                            if (data == 'acceso_denegado')
                                                            {
                                                                notify("danger", "remove", "Convocatorias:", "No tiene permisos para ver la información.");
                                                            } else
                                                            {
                                                                if (data == 'crear_perfil')
                                                                {
                                                                    location.href = url_pv_admin + 'pages/perfilesparticipantes/persona_juridica.html?msg=Para poder inscribir la propuesta debe crear el perfil de persona jurídica.&msg_tipo=danger';
                                                                } else
                                                                {
                                                                    if (data == 'error_participante_propuesta')
                                                                    {
                                                                        location.href = url_pv_admin + 'pages/propuestas/propuestas_busqueda_convocatorias.html?msg=El código de la propuesta no es valido.&msg_tipo=danger';
                                                                    } else
                                                                    {
                                                                        var json = JSON.parse(data);

                                                                        //eliminó disabled todos los componentes
                                                                        if (json.estado == 7)
                                                                        {
                                                                            $("#formulario_principal input,select,button[type=submit]").removeAttr("disabled");
                                                                        }
                                                                        
                                                                        //Creo link de navegacion para persona juridica
                                                                        if (getURLParameter('m') == "pj")
                                                                        {
                                                                            if (json.programa == 2)
                                                                            {
                                                                                $("#programa").val(json.programa);
                                                                                $("#link_propuestas").attr("onclick", "location.href = 'propuestas_pdac.html?m=" + getURLParameter('m') + "&id=" + getURLParameter('id') + "&p=" + getURLParameter('p') + "'");
                                                                            }                                                                                                                                                                                                                                                  
                                                                        }
                                                                        
                                                                        //Cargo los select de barrios
                                                                        $('#barrio_residencia').find('option').remove();
                                                                        $("#barrio_residencia").append('<option value="">:: Seleccionar ::</option>');
                                                                        if (json.barrios.length > 0) {
                                                                            $.each(json.barrios, function (key, barrio) {
                                                                                var selected = '';
                                                                                if (barrio.id == json.participante.barrio_residencia)
                                                                                {
                                                                                    selected = 'selected="selected"';
                                                                                }
                                                                                $("#barrio_residencia").append('<option value="' + barrio.id + '" ' + selected + ' >' + barrio.nombre + '</option>');
                                                                            });
                                                                        }

                                                                        $('#departamento').find('option').remove();
                                                                        $("#departamento").append('<option value="">:: Seleccionar ::</option>');
                                                                        if (json.departamentos.length > 0) {
                                                                            $.each(json.departamentos, function (key, departamento) {
                                                                                var selected = '';
                                                                                if(departamento.id == json.departamento_residencia_id)
                                                                                {
                                                                                    selected = 'selected="selected"';
                                                                                }
                                                                                $("#departamento").append('<option value="' + departamento.id + '" '+selected+' >' + departamento.nombre + '</option>');
                                                                            });
                                                                        }
                                                                        
                                                                        //Cargos el select de ciius
                                                                        $('#ciiu').find('option').remove();
                                                                        $("#ciiu").append('<option value="">:: Seleccionar ::</option>');
                                                                        if (json.ciius.length > 0) {
                                                                            $.each(json.ciius, function (key, array) {
                                                                                var selected = '';
                                                                                if (array.id == json.participante.ciiu)
                                                                                {
                                                                                    selected = 'selected="selected"';
                                                                                }
                                                                                $("#ciiu").append('<option value="' + array.id + '" ' + selected + ' >' + array.nombre + '</option>');
                                                                            });
                                                                        }

                                                                        $('#ciudad_residencia').find('option').remove();
                                                                        $("#ciudad_residencia").append('<option value="">:: Seleccionar ::</option>');
                                                                        if (json.ciudades.length > 0) {
                                                                            $.each(json.ciudades, function (key, ciudad) {
                                                                                var selected = '';
                                                                                if(ciudad.id == json.ciudad_residencia_id)
                                                                                {
                                                                                    selected = 'selected="selected"';
                                                                                }
                                                                                $("#ciudad_residencia").append('<option value="' + ciudad.id + '" '+selected+' >' + ciudad.nombre + '</option>');
                                                                            });
                                                                        }
                                                                        
                                                                        //Cargos el select de tipo de documento
                                                                        $('#tipo_documento').find('option').remove();
                                                                        if (json.tipo_documento.length > 0) {
                                                                            $.each(json.tipo_documento, function (key, array) {
                                                                                if (array.id == 7)
                                                                                {
                                                                                    selected = 'selected="selected"';
                                                                                    $("#tipo_documento").append('<option value="' + array.id + '" ' + selected + ' >' + array.descripcion + '</option>');
                                                                                }
                                                                            });
                                                                        }

                                                                        //Cargos el select de estrato
                                                                        $('#estrato').find('option').remove();
                                                                        $("#estrato").append('<option value="">:: Seleccionar ::</option>');
                                                                        if (json.estrato.length > 0) {
                                                                            $.each(json.estrato, function (key, array) {
                                                                                var selected = '';
                                                                                if (array == json.participante.estrato)
                                                                                {
                                                                                    selected = 'selected="selected"';
                                                                                }
                                                                                $("#estrato").append('<option value="' + array + '" ' + selected + ' >' + array + '</option>');
                                                                            });
                                                                        }

                                                                        //Cargos el select de estrato
                                                                        $('#tipo_sede').find('option').remove();
                                                                        $("#tipo_sede").append('<option value="">:: Seleccionar ::</option>');
                                                                        if (json.tipo_sede.length > 0) {
                                                                            $.each(json.tipo_sede, function (key, array) {
                                                                                var selected = '';
                                                                                if (array == json.participante.tipo_sede)
                                                                                {
                                                                                    selected = 'selected="selected"';
                                                                                }
                                                                                $("#tipo_sede").append('<option value="' + array + '" ' + selected + ' >' + array + '</option>');
                                                                            });
                                                                        }

                                                                        //Cargo el formulario con los datos
                                                                        $('#formulario_principal').loadJSON(json.participante);
                                                                        
                                                                        //Valido el ciiu                        
                                                                        if(json.participante.tiene_rut==="Sí")
                                                                        {
                                                                            $("#ciiu").removeAttr("disabled");
                                                                        }
                                                                        else
                                                                        {
                                                                            $("#ciiu").attr("disabled","disabled");
                                                                        }

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
                                                                        
                                                                        $("#pais option[value='" + json.pais_residencia_id + "']").prop('selected', true);

                                                                        $("#cuenta_sede option[value='" + json.participante.cuenta_sede + "']").prop('selected', true);
                                                                        
                                                                        if(json.participante.cuenta_sede){                                                        
                                                                            $('#tipo_sede').attr("disabled", false);                                                                             
                                                                        }
                                                                        else
                                                                        {
                                                                            $("#tipo_sede option[value='']").prop('selected', true);
                                                                            $('#tipo_sede').attr("disabled", true); 
                                                                        }                                                                        
                                                                        
                                                                    }
                                                                }

                                                            }
                                                        }
                                                    }
                                                });
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            });
        } else
        {
            location.href = url_pv_admin + 'pages/propuestas/propuestas_busqueda_convocatorias.html?msg=El código de la propuesta no es valido.&msg_tipo=danger';
        }
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
            tipo_documento: {
                validators: {
                    notEmpty: {message: 'El tipo de documento de identificación es requerido'}
                }
            },
            numero_documento: {
                validators: {
                    notEmpty: {message: 'El número de Nit es requerido'},
                    numeric: {message: 'Debe ingresar solo numeros'}
                }
            },
            primer_nombre: {
                validators: {
                    notEmpty: {message: 'El primer nombre es requerido'}
                }
            },
            tiene_rut: {
                validators: {
                    notEmpty: {message: 'El RUT es requerido'}
                }
            },
            dv: {
                validators: {
                    notEmpty: {message: 'El dv es requerido'},
                    numeric: {message: 'Debe ingresar solo numeros'}
                }
            },
            numero_celular: {
                validators: {
                    notEmpty: {message: 'El número de celular es requerido'},
                    numeric: {message: 'Debe ingresar solo numeros'}
                }
            },
            ciudad_residencia_name: {
                validators: {
                    notEmpty: {message: 'El municipio es requerido'}
                }
            },
            fecha_nacimiento: {
                validators: {
                    notEmpty: {message: 'La fecha de constitución es requerida'}
                }
            },
            direccion_residencia: {
                validators: {
                    notEmpty: {message: 'La dirección es requerida'}
                }
            },
            estrato: {
                validators: {
                    notEmpty: {message: 'El estrato es requerido'}
                }
            },
            objeto_social: {
                validators: {
                    notEmpty: {message: 'El objeto social es requerido'}
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

        var enviar = true;

        if ($("#tiene_rut").val() === "Sí")
        {
            if ($("#ciiu").val() === "")
            {
                notify("danger", "ok", "Persona natural:", "Código CIIU de su actividad principal, es requerido");
                enviar = false;
            }
        }


        // Prevent form submission
        e.preventDefault();
        // Get the form instance
        var $form = $(e.target);

        // Get the BootstrapValidator instance
        var bv = $form.data('bootstrapValidator');

        // Valido si el id existe, con el fin de eviarlo al metodo correcto
        $('#formulario_principal').attr('action', url_pv + 'Personasjuridicas/editar_participante');


        if(enviar)
        {
            
            $("#mi-modal").modal('show');

            var modalConfirm = function (callback) {
                $("#modal-btn-si").on("click", function () {
                    callback(true);
                    $("#mi-modal").modal('hide');
                });

                $("#modal-btn-no").on("click", function () {
                    callback(false);
                    $("#mi-modal").modal('hide');
                });
            };
            

            modalConfirm(function (confirm) {
                if (confirm) {
                    //Se realiza la peticion con el fin de guardar el registro actual
                    $.ajax({
                        type: 'POST',
                        url: $form.attr('action'),
                        data: $form.serialize() + "&modulo=Menu Participante&token=" + token_actual.token
                    }).done(function (result) {

                        if (result == 'error')
                        {
                            notify("danger", "ok", "Persona jurídica:", "Se registro un error, comuníquese con la mesa de ayuda convocatorias@scrd.gov.co");
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
                                    if (result == 'error_usuario_perfil')
                                    {
                                        notify("danger", "ok", "Persona jurídica:", "Se registro un error al crear el perfil, comuníquese con la mesa de ayuda convocatorias@scrd.gov.co");
                                    } else
                                    {
                                        if (result == 'no_existente_participante')
                                        {
                                            location.href = url_pv_admin + 'pages/perfilesparticipantes/persona_juridica.html?msg=Para poder inscribir la propuesta debe crear el perfil de persona jurídica.&msg_tipo=danger';
                                        } else
                                        {
                                            if (result == 'participante_existente')
                                            {
                                                notify("danger", "ok", "Persona jurídica:", "El participante que intenta ingresar ya se encuentra registrado en la base de datos, comuníquese con la mesa de ayuda convocatorias@scrd.gov.co");
                                            } else
                                            {
                                                if (isNaN(result)) {
                                                    notify("danger", "ok", "Persona jurídica:", "Se registro un error, comuníquese con la mesa de ayuda convocatorias@scrd.gov.co");
                                                } else
                                                {
                                                    notify("success", "ok", "Persona jurídica:", "Se actualizó con el éxito el participante como persona jurídica.");

                                                    var redirec = "propuestas";
                                                    if($("#programa").val()==2)
                                                    {
                                                        redirec = "propuestas_pdac";
                                                    }

                                                    setTimeout(function () {
                                                        location.href = url_pv_admin + 'pages/propuestas/'+redirec+'.html?m=pj&id=' + $("#conv").attr('value')+'&p='+getURLParameter('p');
                                                    }, 1800);

                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }

                    });
                } else
                {
                    $form.bootstrapValidator('disableSubmitButtons', false);
                }
            });
        }
    });

}