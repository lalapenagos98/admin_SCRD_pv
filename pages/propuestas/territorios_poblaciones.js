$(document).ready(function () {

    //Verifico si el token exite en el cliente y verifico que el token este activo en el servidor                
    var token_actual = getLocalStorage(name_local_storage);

    var href_regresar = "";
    var href_siguiente = "";
    //Creando link de navegación
    if (getURLParameter('m') == "pj")
    {
        href_regresar = "presupuesto.html?m=" + getURLParameter('m') + "&id=" + getURLParameter('id') + "&p=" + getURLParameter('p');
        href_siguiente = "documentacion.html?m=" + getURLParameter('m') + "&id=" + getURLParameter('id') + "&p=" + getURLParameter('p');
    }

    $("#link_objetivos").attr("onclick", "location.href = '" + href_regresar + "'");
    $("#link_documentacion").attr("onclick", "location.href = '" + href_siguiente + "'");

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
                                        } else
                                        {
                                            if (data == 'ingresar')
                                            {
                                                //Vacio el id
                                                $("#id").attr('value', "");
                                                //Asignamos el valor a input conv
                                                $("#conv").attr('value', getURLParameter('id'));

                                                //disabled todos los componentes
                                                $("#formulario_principal input,select,button[type=submit],textarea").attr("disabled", "disabled");

                                                //Verifica si el token actual tiene acceso de lectura
                                                permiso_lectura(token_actual, "Menu Participante");

                                                //Realizo la peticion para cargar el formulario
                                                $.ajax({
                                                    type: 'GET',
                                                    data: {"token": token_actual.token, "conv": $("#conv").attr('value'), "modulo": "Menu Participante", "m": getURLParameter('m'), "p": getURLParameter('p')},
                                                    url: url_pv + 'PropuestasPdac/buscar_propuesta/'
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
                                                                    location.href = url_pv_admin + 'pages/perfilesparticipantes/persona_natural.html?msg=Para poder inscribir la propuesta debe crear el perfil de persona natural.&msg_tipo=danger';
                                                                } else
                                                                {
                                                                    if (data == 'error_cod_propuesta')
                                                                    {
                                                                        location.href = url_pv_admin + 'pages/propuestas/propuestas_busqueda_convocatorias.html?msg=El código de la propuesta no es valido.&msg_tipo=danger';
                                                                    } else
                                                                    {

                                                                        var json = JSON.parse(data);
                                                                        
                                                                        //Si la convocatoria es interlocales
                                                                        if(json.convocatoria_padre_categoria=="608" || json.convocatoria_padre_categoria=="1186" || json.convocatoria_padre_categoria=="1719" )
                                                                        {
                                                                            $(".campos_locales").css("display","block");
                                                                        }

                                                                        //eliminó disabled todos los componentes
                                                                        if (json.estado == 7)
                                                                        {
                                                                            $("#formulario_principal input,select,button[type=submit],textarea").removeAttr("disabled");
                                                                        }                                                                        
                                                                        
                                                                        
                                                                        //Cargo el select de linea_estrategica   
                                                                        if(json.localidades!=null)
                                                                        {
                                                                            if (json.localidades.length > 0) {
                                                                                $.each(json.localidades, function (key, localidad) {                                                                                
                                                                                    $("#localidades").append('<option value="' + localidad.nombre + '" >' + localidad.nombre + '</option>');
                                                                                });
                                                                            }
                                                                        }
                                                                        
                                                                        //Set los valores linea_estrategica
                                                                        $("#localidades option:selected").removeAttr("selected");
                                                                        $("#localidades option:selected").prop("selected", false);
                                                                        if(json.propuesta.localidades!=null)
                                                                        {
                                                                            if (json.propuesta.localidades.length > 0) {
                                                                                $.each(JSON.parse(json.propuesta.localidades), function (i, e) {
                                                                                    $("#localidades option[value='" + e + "']").prop("selected", true);
                                                                                });
                                                                            }
                                                                        }

                                                                        //Cargo los parametros obligatorios
                                                                        $("#validator").attr("value", JSON.stringify(json.validator));

                                                                        //Cargo el formulario con los datos
                                                                        $('#formulario_principal').loadJSON(json.propuesta);
                                                                        if (typeof json.propuesta_territorio !== 'undefined') {
                                                                            $('#formulario_principal').loadJSON(json.propuesta_territorio);
                                                                        }
                                                                        
                                                                        //agrego los totales de caracteres
                                                                        if(json.propuesta.poblacion_objetivo!=null)
                                                                        {
                                                                            $(".caracter_poblacion_objetivo").html(1000 - json.propuesta.poblacion_objetivo.length);
                                                                        }
                                                                        if(json.propuesta.poblacion_estrategia!=null)
                                                                        {
                                                                            $(".caracter_poblacion_estrategia").html(1000 - json.propuesta.poblacion_estrategia.length);
                                                                        }
                                                                        if(json.propuesta.comunidad_objetivo!=null)
                                                                        {
                                                                            $(".caracter_comunidad_objetivo").html(1000 - json.propuesta.comunidad_objetivo.length);
                                                                        }
                                                                        if(json.propuesta.establecio_cifra!=null)
                                                                        {
                                                                            $(".caracter_establecio_cifra").html(500 - json.propuesta.establecio_cifra.length);
                                                                        }

                                                                        //Valido formulario
                                                                        validator_form(token_actual);

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

    $(".contar_caracteres").keyup(function () {
        var total = $(this).attr("title");
        var total_text = $(this).val().length;
        var obj = $(this).attr("id");
        var total_actual = total - total_text;
        if (total_actual <= 0)
        {
            total_actual = 0;
        }
        $(".caracter_" + obj).html(total_actual);
    });

});

function validator_form(token_actual) {

    //Validar el formulario    
    $('.formulario_principal').bootstrapValidator({
        feedbackIcons: {
            valid: 'glyphicon glyphicon-ok',
            invalid: 'glyphicon glyphicon-remove',
            validating: 'glyphicon glyphicon-refresh'
        },
        fields: {            
            'localidades[]': {
                validators: {
                    notEmpty: {message: 'Las localidades en donde el proyecto desarrollará acciones, es requerido'}
                }
            },
            poblacion_objetivo: {
                validators: {
                    notEmpty: {message: 'Describa brevemente la población beneficiaria del proyecto, es requerido'},
                    stringLength: {
                        message: 'Ya cuenta con el máximo de caracteres permitidos, los cuales son 1000.',
                        max: '1000'
                    }
                }
            },
            poblacion_estrategia: {
                validators: {
                    notEmpty: {message: 'Describa la estrategia de vinculación de beneficiarios o participantes del proyecto, es requerido'},
                    stringLength: {
                        message: 'Ya cuenta con el máximo de caracteres permitidos, los cuales son 1000.',
                        max: '1000'
                    }
                }
            },
            comunidad_objetivo: {
                validators: {
                    notEmpty: {message: '¿Dentro de la población beneficiaria del proyecto se incluirá algún grupo poblacional en específico? ¿Cuál?, es requerido'},
                    stringLength: {
                        message: 'Ya cuenta con el máximo de caracteres permitidos, los cuales son 1000.',
                        max: '1000'
                    }
                }
            },
            total_beneficiario: {
                validators: {
                    notEmpty: {message: 'Estimado total de beneficiarios o participantes, es requerido'},
                    regexp: {
                        regexp: /^[0-9]+$/i,
                        message: 'Debe ingresar solo números'
                    }
                }
            },
            establecio_cifra: {
                validators: {
                    notEmpty: {message: 'Cómo se estableció esta cifra, es requerido'},
                    stringLength: {
                        message: 'Ya cuenta con el máximo de caracteres permitidos, los cuales son 500.',
                        max: '500'
                    }
                }
            },
            femenino: {
                validators: {
                    notEmpty: {message: 'Femenino, es requerido'}
                }
            },
            intersexual: {
                validators: {
                    notEmpty: {message: 'Intersexual, es requerido'}
                }
            },
            masculino: {
                validators: {
                    notEmpty: {message: 'Masculino, es requerido'}
                }
            },
            primera_infancia: {
                validators: {
                    notEmpty: {message: 'Primera infancia (0 – 5 años), es requerido'}
                }
            },
            infancia: {
                validators: {
                    notEmpty: {message: 'Infancia (6 – 12 años), es requerido'}
                }
            },
            adolescencia: {
                validators: {
                    notEmpty: {message: 'Adolescencia (13 – 18 años), es requerido'}
                }
            },
            juventud: {
                validators: {
                    notEmpty: {message: 'Juventud (19 – 28 años), es requerido'}
                }
            },
            adulto: {
                validators: {
                    notEmpty: {message: 'Adulto (29 – 59 años), es requerido'}
                }
            },
            adulto_mayor: {
                validators: {
                    notEmpty: {message: 'Adulto mayor (60 años y más), es requerido'}
                }
            },
            estrato_1: {
                validators: {
                    notEmpty: {message: 'Estrato 1, es requerido'}
                }
            },
            estrato_2: {
                validators: {
                    notEmpty: {message: 'Estrato 2, es requerido'}
                }
            },
            estrato_3: {
                validators: {
                    notEmpty: {message: 'Estrato 3, es requerido'}
                }
            },
            estrato_4: {
                validators: {
                    notEmpty: {message: 'Estrato 4, es requerido'}
                }
            },
            estrato_5: {
                validators: {
                    notEmpty: {message: 'Estrato 5, es requerido'}
                }
            },
            estrato_6: {
                validators: {
                    notEmpty: {message: 'Estrato 6, es requerido'}
                }
            },
            comunidades_negras_afrocolombianas: {
                validators: {
                    notEmpty: {message: 'Comunidades Negras o Afrocolombianas, es requerido'}
                }
            },
            comunidad_raizal: {
                validators: {
                    notEmpty: {message: 'Comunidad raizal, es requerido'}
                }
            },
            pueblos_comunidades_indigenas: {
                validators: {
                    notEmpty: {message: 'Pueblos y Comunidades Indígenas, es requerido'}
                }
            },
            pueblo_rom_gitano: {
                validators: {
                    notEmpty: {message: 'Pueblo Rom o Gitano, es requerido'}
                }
            },
            mestizo: {
                validators: {
                    notEmpty: {message: 'Mestizo, es requerido'}
                }
            },
            ninguno_etnico: {
                validators: {
                    notEmpty: {message: 'Ninguno, es requerido'}
                }
            },
            artesanos: {
                validators: {
                    notEmpty: {message: 'Artesanos, es requerido'}
                }
            },
            discapacitados: {
                validators: {
                    notEmpty: {message: 'Discapacitados, es requerido'}
                }
            },
            habitantes_calle: {
                validators: {
                    notEmpty: {message: 'Habitantes de calle, es requerido'}
                }
            },
            lgbti: {
                validators: {
                    notEmpty: {message: 'LGBTI, es requerido'}
                }
            },
            personas_comunidades_rurales_campesinas: {
                validators: {
                    notEmpty: {message: 'Personas de comunidades rurales y campesinas, es requerido'}
                }
            },
            personas_privadas_libertad: {
                validators: {
                    notEmpty: {message: 'Personas privadas de la libertad, es requerido'}
                }
            },
            victimas_conflicto: {
                validators: {
                    notEmpty: {message: 'Víctimas del conflicto, es requerido'}
                }
            },
            ninguno_grupo: {
                validators: {
                    notEmpty: {message: 'Ninguno, es requerido'}
                }
            }
        }
    }).on('success.form.bv', function (e) {
        
        var validar = false;

        //Valido sexo
        if ($("#femenino").val() == 'No' && $("#intersexual").val() == 'No' && $("#masculino").val() == 'No')
        {
            notify("danger", "ok", "Propuesta:", "Debe seleccionar al menos un sexo.");
            validar = false;            
        } else
        {
            validar = true;
        }
        
        //Valido Grupo etareo
        if(validar)
        {
            if ($("#primera_infancia").val() == 'No' && $("#infancia").val() == 'No' && $("#adolescencia").val() == 'No' && $("#juventud").val() == 'No' && $("#adulto").val() == 'No' && $("#adulto_mayor").val() == 'No' )
            {
                notify("danger", "ok", "Propuesta:", "Debe seleccionar al menos un grupo etareo.");
                validar = false;            
            } else
            {
                validar = true;
            }
        }
    
        //Valido estrato
        if(validar)
        {
            if ($("#estrato_1").val() == 'No' && $("#estrato_2").val() == 'No' && $("#estrato_3").val() == 'No' && $("#estrato_4").val() == 'No' && $("#estrato_5").val() == 'No' && $("#estrato_6").val() == 'No' )
            {
                notify("danger", "ok", "Propuesta:", "Debe seleccionar al menos un estrato.");
                validar = false;            
            } else
            {
                validar = true;
            }
        }
        
        //Valido etnico
        if(validar)
        {
            if ($("#comunidades_negras_afrocolombianas").val() == 'No' && $("#comunidad_raizal").val() == 'No' && $("#pueblos_comunidades_indigenas").val() == 'No' && $("#pueblo_rom_gitano").val() == 'No' && $("#mestizo").val() == 'No' && $("#ninguno_etnico").val() == 'No' )
            {
                notify("danger", "ok", "Propuesta:", "Debe seleccionar al menos un grupo étnico.");
                validar = false;            
            } else
            {
                validar = true;
            }
        }
        
        //Valido grupo
        if(validar)
        {
            if ($("#artesanos").val() == 'No' && $("#discapacitados").val() == 'No' && $("#habitantes_calle").val() == 'No' && $("#lgbti").val() == 'No' && $("#personas_comunidades_rurales_campesinas").val() == 'No' && $("#personas_privadas_libertad").val() == 'No' && $("#victimas_conflicto").val() == 'No' && $("#ninguno_grupo").val() == 'No' )
            {
                notify("danger", "ok", "Propuesta:", "Debe seleccionar al menos un grupos sociales y poblacionales.");
                validar = false;            
            } else
            {
                validar = true;
            }
        }
        
        // Prevent form submission
        e.preventDefault();
        // Get the form instance
        var $form = $(e.target);

        if (validar)
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

            // Get the BootstrapValidator instance
            var bv = $form.data('bootstrapValidator');

            // Valido si el id existe, con el fin de eviarlo al metodo correcto
            $('#formulario_principal').attr('action', url_pv + 'PropuestasPdac/editar_propuesta_territorio');

            modalConfirm(function (confirm) {
                if (confirm) {
                    //Se realiza la peticion con el fin de guardar el registro actual
                    $.ajax({
                        type: 'POST',
                        url: $form.attr('action'),
                        data: $form.serialize() + "&modulo=Menu Participante&token=" + token_actual.token + "&m=" + getURLParameter('m'),
                    }).done(function (result) {

                        if (result == 'error')
                        {
                            notify("danger", "ok", "Propuesta:", "Se registro un error, comuníquese con la mesa de ayuda convocatorias@scrd.gov.co");
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
                                    if (isNaN(result)) {
                                        notify("danger", "ok", "Propuesta:", "Se registro un error, comuníquese con la mesa de ayuda convocatorias@scrd.gov.co");
                                    } else
                                    {
                                        notify("success", "ok", "Propuesta:", "Se actualizó con éxito su proyecto.");

                                        var redirect = "documentacion.html";
                                        
                                        setTimeout(function () {
                                            location.href = url_pv_admin + 'pages/propuestas/' + redirect + '?m=' + getURLParameter('m') + '&id=' + $("#conv").attr('value') + '&p=' + getURLParameter('p');
                                        }, 1800);
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
        else
        {
            $form.bootstrapValidator('disableSubmitButtons', false);
        }
    });

}
