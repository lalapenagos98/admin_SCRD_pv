$(document).ready(function () {

    //Verifico si el token exite en el cliente y verifico que el token este activo en el servidor                
    var token_actual = getLocalStorage(name_local_storage);

    //Verifico si el token esta vacio, para enviarlo a que ingrese de nuevo
    if ($.isEmptyObject(token_actual)) {
        location.href = url_pv_admin + 'pages/index.html?msg=Su sesión ha expirado, por favor vuelva a ingresar.&msg_tipo=danger';
    } else
    {
        //Valido el id de la propuesta
        if (Number.isInteger(parseInt(getURLParameter('p'))))
        {
            //Verifica si el token actual tiene acceso de lectura
            permiso_lectura(token_actual, "Menu Participante");

            if(getURLParameter('p')>0)
            {                
                //disabled todos los componentes
                $("#formulario_principal button[type=submit]").css("display","none");   
            }

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
                                        if (data == 'ingresar' || data == 'error_participante')
                                        {
                                            $(".validar_acceso").css("display", "block");


                                            //Realizo la peticion para cargar los tipos de participantes
                                            $.ajax({
                                                type: 'POST',
                                                data: {"token": token_actual.token, "p": getURLParameter('p')},
                                                url: url_pv + 'PropuestasPerfiles/consultar_tipos_participantes/' + $("#id").val()
                                            }).done(function (data) {

                                                var json = JSON.parse(data);

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
                                                        $("#tipo_participante").append('<option value="">:: Seleccionar ::</option>');
                                                        if (json.length > 0) {
                                                            $.each(json, function (key, value) {
                                                                $("#tipo_participante").append('<option value="' + value.id + '" title="' + value.terminos_condiciones + '" lang="' + value.condiciones_participacion + '" dir="' + value.acepto_terminos_condiciones + '">' + value.tipo_participante + '</option>');
                                                            });
                                                        }
                                                    }
                                                }
                                            });
                                            
                                            //Realizo la peticion para cargar los tipos de participantes
                                            $.ajax({
                                                type: 'POST',
                                                data: {"token": token_actual.token, "p": getURLParameter('p'),"modulo": "Menu Participante"},
                                                url: url_pv + 'Convocatorias/nombre_convocatoria/' + $("#id").val()
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
                                                        $("#titulo_convocatoria").html("Esta seguro de inscribir la propuesta en la convocatoria "+json.nombre_convocatoria);                                                        
                                                        $("#programa").val(json.programa);                                                                                                                
                                                        $("#nombre_convocatoria_par").val(json.nombre_convocatoria_par);
                                                        $("#convocatoria_padre").val(json.convocatoria_padre);                                                        
                                                        $("#convocatoria_nombre").val(json.nombre_convocatoria);                                                        
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
            });


            //Cargo los pdf deacuerdo al participante                                    
            $('#tipo_participante').on('change', function () {
                if ($(this).val() != "")
                {
                    $(".inactivo").css("display", "block");
                    $("#terminos_condiciones_pdf").attr("src", $("#tipo_participante option:selected").attr("title"));
                    $("#condiciones_participacion_pdf").attr("src", $("#tipo_participante option:selected").attr("lang"));
                    
                    if($("#programa").val()=="2"){
                        if($("#convocatoria_padre").val()=="608"||$("#convocatoria_padre").val()=="1186")
                        {
                            $(".alianza_pdac").css("display", "block");
                        }
                        else
                        {
                            $(".alianza_pdac").css("display", "none");
                        }
                                                
                        $(".pasos_pdac").css("display", "block");                        
                    }
                    else
                    {
                        $(".alianza_pdac").css("display", "none");                       
                        $(".pasos_pdac").css("display", "none");                        
                    }
                    
                    if($("#programa").val()=="4"){
                        $(".programa_alianza").css("display", "none");                                                
                    }
                    
                    if ($("#tipo_participante option:selected").attr("dir") == "true")
                    {
                        $("#terminos_condiciones option[value='" + $("#tipo_participante option:selected").attr("dir") + "']").prop('selected', true);
                        $("#condiciones_participacion option[value='" + $("#tipo_participante option:selected").attr("dir") + "']").prop('selected', true);
                    } else
                    {
                        $('#terminos_condiciones option').prop('selected', function () {
                            return this.defaultSelected;
                        });
                        $('#condiciones_participacion option').prop('selected', function () {
                            return this.defaultSelected;
                        });
                    }
                    
                } else
                {
                    $(".inactivo").css("display", "none");
                    $(".alianza_pdac").css("display", "none");                       
                    $(".pasos_pdac").css("display", "none");                        
                }
            });


            //Validar el formulario
            $('.form_validator').bootstrapValidator({
                feedbackIcons: {
                    valid: 'glyphicon glyphicon-ok',
                    invalid: 'glyphicon glyphicon-remove',
                    validating: 'glyphicon glyphicon-refresh'
                },
                fields: {
                    tipo_participante: {
                        validators: {
                            notEmpty: {message: 'El tipo participante es requerido'}
                        }
                    },
                    terminos_condiciones: {
                        validators: {
                            notEmpty: {message: 'Los términos, las condiciones, el tratamiento de datos y la autorización de uso, son requeridos'}
                        }
                    },
                    condiciones_participacion: {
                        validators: {
                            notEmpty: {message: 'Las condiciones generales de participación, son requeridas'}
                        }
                    },
                    nombre_convocatoria: {
                        validators: {
                            notEmpty: {message: 'Debe confirmar la convocatoria a la cual desea realizar la inscripción de la propuesta, es requerido'}
                        }
                    },
                    acepta_ganador: {
                        validators: {
                            notEmpty: {message: 'Debe confirmar ¿En caso de ser ganador acepta asumir las retenciones que apliquen según la normatividad vigente y que dependen de su calidad tributaria?, es requerido'}
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

                var tipo_participante = $("#tipo_participante").val();
                var id = $("#id").val();

                var redirect = "";
                var m = "";
                var controller = "";
                var redirect_perfil = "";
                if (tipo_participante == 1)
                {
                    redirect = "perfil_persona_natural";
                    m = "pn";
                    controller = "Personasnaturales";
                    redirect_perfil = "persona_natural";
                }
                if (tipo_participante == 2)
                {
                    redirect = "perfil_persona_juridica";
                    m = "pj";
                    controller = "Personasjuridicas";
                    redirect_perfil = "persona_juridica";
                }
                if (tipo_participante == 3)
                {
                    redirect = "perfil_agrupacion";
                    m = "agr";
                    controller = "Agrupaciones";
                    redirect_perfil = "agrupacion";
                }


                var enviar=true;
                
                if($("#convocatoria_padre").val()=="608"||$("#convocatoria_padre").val()=="1186"){
                    if($("#alianza_sectorial").val()=="")
                    {
                        enviar=false;
                        notify("danger", "ok", "Convocatorias:", "El ¿Proyecto de alianza sectorial?, es requrido");
                    }
                }                

                if(enviar)
                {
                    //Realizo la peticion para cargar el formulario
                    $.ajax({
                        type: 'GET',
                        data: {"token": token_actual.token, "conv": $("#id").val(), "alianza_sectorial": $("#alianza_sectorial").val(), "modulo": "Menu Participante", "p": getURLParameter('p')},
                        url: url_pv + controller + '/crear_propuesta_' + m + '/'
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
                                        location.href = url_pv_admin + 'pages/perfilesparticipantes/'+redirect_perfil+'.html?msg=Para poder inscribir la propuesta debe crear el perfil ('+m+').&msg_tipo=danger';
                                    } else
                                    {
                                        if (data == 'error_participante_propuesta')
                                        {
                                            location.href = url_pv_admin + 'pages/perfilesparticipantes/'+redirect_perfil+'.html?msg=Se registro un error al importar el participante, comuníquese con la mesa de ayuda convocatorias@scrd.gov.co.&msg_tipo=danger';
                                        } else
                                        {
                                            if (data == 'error_maximo_propuesta_pdac')
                                            {
                                                notify("danger", "ok", "Convocatorias:", "Ya tiene el máximo de propuestas guardadas permitidas para esta convocatoria, solo se permite una propuesta con alianza sectorial y la otra sin alianza sectorial, para visualizar sus propuestas por favor ingrese al menú Mis propuestas.");
                                            } else
                                            {
                                                if (data == 'error_otra_propuesta_pdac')
                                                {
                                                    notify("danger", "ok", "Convocatorias:", "No puede iniciar el procedo de inscripción de la propuesta, debido a que ya cuenta con una propuesta en la convocatoria ("+$("#nombre_convocatoria_par").val()+") , para visualizar sus propuestas por favor ingrese al menú Mis propuestas.");
                                                } else
                                                {
                                                    if (data == 'error_participacion')
                                                    {
                                                        notify("danger", "ok", "Convocatorias:", "No puede iniciar la inscripción de la propuesta, debido a que su número de documento ya esta en proceso de inscripción en la convocatoria ("+$("#convocatoria_nombre").val()+") , comuníquese con la mesa de ayuda convocatorias@scrd.gov.co para mayor información.");
                                                    } else
                                                    {
                                                    
                                                    var json = JSON.parse(data);

                                                    location.href = redirect + ".html?m=" + m + "&id=" + id + "&p=" + json;                                        
                                                    }
                                                }
                                            }                                                                                                                                    
                                        }

                                    }
                                }
                            }
                        }
                    });
                }                
                
                bv.resetForm();
                
            });

        } else
        {
            location.href = url_pv_admin + 'pages/propuestas/propuestas_busqueda_convocatorias.html?msg=El código de la propuesta no es valido.&msg_tipo=danger';
        }
    }
});