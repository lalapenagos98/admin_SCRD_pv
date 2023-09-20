$(document).ready(function () {

    //Verifico si el token exite en el cliente y verifico que el token este activo en el servidor                
    var token_actual = getLocalStorage(name_local_storage);

    var href_regresar = "";
    var href_siguiente = "";
    //Creando link de navegación
    if (getURLParameter('m') == "agr")
    {
        href_regresar = "perfil_agrupacion.html?m=" + getURLParameter('m') + "&id=" + getURLParameter('id') + "&p=" + getURLParameter('p');
        href_siguiente = "integrantes.html?m=" + getURLParameter('m') + "&id=" + getURLParameter('id') + "&p=" + getURLParameter('p');
    }

    if (getURLParameter('m') == "pn")
    {
        href_regresar = "perfil_persona_natural.html?m=" + getURLParameter('m') + "&id=" + getURLParameter('id') + "&p=" + getURLParameter('p');
        href_siguiente = "documentacion.html?m=" + getURLParameter('m') + "&id=" + getURLParameter('id') + "&p=" + getURLParameter('p');
    }

    if (getURLParameter('m') == "pj")
    {
        href_regresar = "perfil_persona_juridica.html?m=" + getURLParameter('m') + "&id=" + getURLParameter('id') + "&p=" + getURLParameter('p');
        href_siguiente = "junta.html?m=" + getURLParameter('m') + "&id=" + getURLParameter('id') + "&p=" + getURLParameter('p');
    }

    $("#link_participante").attr("onclick", "location.href = '" + href_regresar + "'");
    $("#link_integrantes").attr("onclick", "location.href = '" + href_siguiente + "'");

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
                                                                        
                                                                        if(json.convocatoria_padre_categoria=="621" || json.convocatoria_padre_categoria=="1187"  || json.convocatoria_padre_categoria=="1720" )
                                                                        {
                                                                            $(".campos_metropolitano").css("display","");
                                                                            $(".campos_locales").css("display","none");
                                                                            $("#nombre_justificacion").html('Justificación del proyecto');
                                                                        }
                                                                        else
                                                                        {
                                                                            $(".div_alianza").css("display","block");                                                                            
                                                                            $(".localidad_principal").css("display","block");
                                                                            $("#nombre_justificacion").html('Justificación del proyecto');
                                                                            $(".campos_metropolitano").css("display","none");
                                                                            $(".campos_locales").css("display","");
                                                                        }
                                                                        //eliminó disabled todos los componentes
                                                                        if (json.estado == 7)
                                                                        {
                                                                            $("#formulario_principal input,select,button[type=submit],textarea").removeAttr("disabled");
                                                                        }

                                                                        //Cargos el select de localidades
                                                                        $('#localidad').find('option').remove();
                                                                        $("#localidad").append('<option value="">:: Seleccionar ::</option>');
                                                                        if (json.localidades.length > 0) {
                                                                            $.each(json.localidades, function (key, localidad) {
                                                                                var selected = '';
                                                                                if (localidad.id == json.propuesta.localidad)
                                                                                {
                                                                                    selected = 'selected="selected"';
                                                                                }
                                                                                $("#localidad").append('<option value="' + localidad.id + '" ' + selected + ' >' + localidad.nombre + '</option>');
                                                                            });
                                                                        }

                                                                        //Cargos el select de upzs
                                                                        $('#upz').find('option').remove();
                                                                        $("#upz").append('<option value="">:: Seleccionar ::</option>');
                                                                        if (json.upzs.length > 0) {
                                                                            $.each(json.upzs, function (key, upz) {
                                                                                var selected = '';
                                                                                if (upz.id == json.propuesta.upz)
                                                                                {
                                                                                    selected = 'selected="selected"';
                                                                                }
                                                                                $("#upz").append('<option value="' + upz.id + '" ' + selected + ' >' + upz.nombre + '</option>');
                                                                            });
                                                                        }

                                                                        //Cargo los select de barrios
                                                                        $('#barrio').find('option').remove();
                                                                        $("#barrio").append('<option value="">:: Seleccionar ::</option>');
                                                                        if (json.barrios.length > 0) {
                                                                            $.each(json.barrios, function (key, barrio) {
                                                                                var selected = '';
                                                                                if (barrio.id == json.propuesta.barrio)
                                                                                {
                                                                                    selected = 'selected="selected"';
                                                                                }
                                                                                $("#barrio").append('<option value="' + barrio.id + '" ' + selected + ' >' + barrio.nombre + '</option>');
                                                                            });
                                                                        }

                                                                        //Cargo los parametros dinamicos
                                                                        var parametros = "";
                                                                        var columna = 1;
                                                                        for (var i in json.parametros) {
                                                                            if (json.parametros.hasOwnProperty(i)) {
                                                                                if (columna == 1)
                                                                                {
                                                                                    parametros += '<div class="row">';
                                                                                }
                                                                                parametros += crearParametro(json.parametros[i].id, json.parametros[i].label, json.parametros[i].valores, json.parametros[i].tipo_parametro, json.parametros[i].obligatorio, json.estado);
                                                                                if (columna == 2)
                                                                                {
                                                                                    parametros += '</div>';
                                                                                    columna = 0;
                                                                                }
                                                                                columna++;
                                                                            }
                                                                        }
                                                                        $("#dinamico").html(parametros);

                                                                        //Cargo los parametros obligatorios
                                                                        $("#validator").attr("value", JSON.stringify(json.validator));


                                                                        //Cargo el select de medios que se entero                                
                                                                        if (json.medio_se_entero.length > 0) {
                                                                            $.each(json.medio_se_entero, function (key, medio) {
                                                                                var selected = '';
                                                                                if (medio == json.propuesta.porque_medio)
                                                                                {
                                                                                    selected = 'selected="selected"';
                                                                                }
                                                                                $("#porque_medio").append('<option value="' + medio + '" >' + medio + '</option>');
                                                                            });
                                                                        }

                                                                        //Cargo el select de relacion_plan                                
                                                                        if (json.relacion_plan.length > 0) {
                                                                            $.each(json.relacion_plan, function (key, medio) {
                                                                                var selected = '';
                                                                                if (medio == json.propuesta.relacion_plan)
                                                                                {
                                                                                    selected = 'selected="selected"';
                                                                                }
                                                                                $("#relacion_plan").append('<option value="' + medio + '" >' + medio + '</option>');
                                                                            });
                                                                        }
                                                                        
                                                                        //Cargo el select de alcance_territorial 
                                                                        if (json.alcance_territorial.length > 0) {
                                                                            $.each(json.alcance_territorial, function (key, medio) {
                                                                                var selected = '';
                                                                                if (medio == json.propuesta.alcance_territorial)
                                                                                {
                                                                                    selected = 'selected="selected"';
                                                                                }
                                                                                $("#alcance_territorial").append('<option value="' + medio + '" >' + medio + '</option>');
                                                                            });
                                                                        }
                                                                        
                                                                        //Cargo el select de enfoque_proyecto 
                                                                        if (json.enfoque_proyecto.length > 0) {
                                                                            $.each(json.enfoque_proyecto, function (key, medio) {
                                                                                var selected = '';
                                                                                if (medio == json.propuesta.enfoque_proyecto)
                                                                                {
                                                                                    selected = 'selected="selected"';
                                                                                }
                                                                                $("#enfoque_proyecto").append('<option value="' + medio + '" >' + medio + '</option>');
                                                                            });
                                                                        }
                                                                        
                                                                        //Cargo el select de medir_impacto 
                                                                        if (json.medir_impacto.length > 0) {
                                                                            $("#medir_impacto").append('<option value="" >:: Seleccionar ::</option>');
                                                                            $.each(json.medir_impacto, function (key, medio) {
                                                                                var selected = '';
                                                                                if (medio == json.propuesta.medir_impacto)
                                                                                {                                                                                    
                                                                                    selected = 'selected="selected"';
                                                                                }
                                                                                $("#medir_impacto").append('<option value="' + medio + '" selected>' + medio + '</option>');
                                                                            });
                                                                        }

                                                                        //Cargo el select de linea_estrategica                                
                                                                        if (json.linea_estrategica.length > 0) {
                                                                            $.each(json.linea_estrategica, function (key, medio) {
                                                                                var selected = '';
                                                                                if(medio.nombre!=='Acceso, innovación, creación y producción artística y cultural' && medio.nombre!=='Economía Cultural y Creativa')
                                                                                {
                                                                                    if (medio.nombre == json.propuesta.linea_estrategica)
                                                                                    {
                                                                                        selected = 'selected="selected"';
                                                                                    }
                                                                                    $("#linea_estrategica").append('<option value="' + medio.nombre + '" >' + medio.nombre + '</option>');
                                                                                }
                                                                            });
                                                                        }

                                                                        //Cargo el select de area
                                                                        if (json.area.length > 0) {
                                                                            $.each(json.area, function (key, area) {
                                                                                var selected = '';
                                                                                if (area.nombre == json.propuesta.area)
                                                                                {
                                                                                    selected = 'selected="selected"';
                                                                                }
                                                                                $("#area").append('<option value="' + area.nombre + '" >' + area.nombre + '</option>');
                                                                                if(json.convocatoria_programa == 2)
                                                                                {
                                                                                    $("#area").val(['Actividades de la economía creativa y cultural'])
                                                                                    $("#aportes_proyecto").val(' ')
                                                                                    $("#atencedente").val(' ')
                                                                                    $("#areas_div").addClass('hidden')
                                                                                    $("#problema_necesidad_div").removeClass('col-lg-6')
                                                                                    $("#problema_necesidad_div").addClass('col-lg-12')

                                                                                }
                                                                            });
                                                                        }

                                                                        //Set los valores del medio que se entero
                                                                        $("#porque_medio option:selected").removeAttr("selected");
                                                                        $("#porque_medio option:selected").prop("selected", false);
                                                                        if(json.propuesta.porque_medio !== '' &&  json.propuesta.porque_medio !== null){
                                                                            $.each(JSON.parse(json.propuesta.porque_medio), function (i, e) {
                                                                                $("#porque_medio option[value='" + e + "']").prop("selected", true);
                                                                            });
                                                                        }

                                                                        //Set los valores relacion_plan
                                                                        $("#relacion_plan option:selected").removeAttr("selected");
                                                                        $("#relacion_plan option:selected").prop("selected", false);
                                                                        if(json.propuesta.relacion_plan !== '' &&  json.propuesta.relacion_plan !== null){
                                                                            $.each(JSON.parse(json.propuesta.relacion_plan), function (i, e) {
                                                                                $("#relacion_plan option[value='" + e + "']").prop("selected", true);
                                                                            });
                                                                        }
                                                                        
                                                                        //Set los valores alcance_territorial
                                                                        $("#alcance_territorial option:selected").removeAttr("selected");
                                                                        $("#alcance_territorial option:selected").prop("selected", false);                                                                        
                                                                        if(json.propuesta.alcance_territorial !== '' &&  json.propuesta.alcance_territorial !== null){
                                                                            $.each(JSON.parse(json.propuesta.alcance_territorial), function (i, e) {
                                                                                $("#alcance_territorial option[value='" + e + "']").prop("selected", true);
                                                                            });
                                                                        }
                                                                        
                                                                        //Set los valores enfoque_proyecto
                                                                        $("#enfoque_proyecto option:selected").removeAttr("selected");
                                                                        $("#enfoque_proyecto option:selected").prop("selected", false);                                                                        
                                                                        if(json.propuesta.enfoque_proyecto !== '' &&  json.propuesta.enfoque_proyecto !== null){
                                                                            $.each(JSON.parse(json.propuesta.enfoque_proyecto), function (i, e) {
                                                                                $("#enfoque_proyecto option[value='" + e + "']").prop("selected", true);
                                                                            });
                                                                        }
                                                                        
                                                                        //Set los valores linea_estrategica
                                                                        $("#linea_estrategica option:selected").removeAttr("selected");
                                                                        $("#linea_estrategica option:selected").prop("selected", false);
                                                                        if(json.propuesta.linea_estrategica !== '' &&  json.propuesta.linea_estrategica !== null){
                                                                            $.each(JSON.parse(json.propuesta.linea_estrategica), function (i, e) {
                                                                                $("#linea_estrategica option[value='" + e + "']").prop("selected", true);
                                                                            });
                                                                        }

                                                                        //Set los valores area
                                                                        $("#area option:selected").removeAttr("selected");
                                                                        $("#area option:selected").prop("selected", false);
                                                                        if(json.propuesta.area !== '' &&  json.propuesta.area !== null){
                                                                            $.each(JSON.parse(json.propuesta.area), function (i, e) {
                                                                                $("#area option[value='" + e + "']").prop("selected", true);
                                                                            });
                                                                        }

                                                                        //Cargo el formulario con los datos
                                                                        $('#formulario_principal').loadJSON(json.propuesta);
                                                                        

                                                                        if(json.propuesta.alianza_sectorial)
                                                                        {
                                                                            $("#valor_alianza").html("Sí");
                                                                        }
                                                                        else
                                                                        {
                                                                            $("#valor_alianza").html("No");
                                                                        }
                                                                        console.log('ásdasd',json.propuesta.modalidad)
                                                                        if(json.propuesta.modalidad == 7)
                                                                        {
                                                                            console.log('ásdasd')
                                                                            $(".div_alianza").addClass("hidden");
                                                                           //$(".campos_locales").addClass("hidden");
                                                                            $("#primera_vez_pdac option[value='false']").prop('selected', true);

                                                                        }
                                                                        else
                                                                        {

                                                                            $(".div_alianza").css("display");
                                                                        }

                                                                        $("#alianza_sectorial option[value='" + json.propuesta.alianza_sectorial + "']").prop('selected', true);

                                                                        $("#primera_vez_pdac option[value='" + json.propuesta.primera_vez_pdac + "']").prop('selected', true);

                                                                        $("#ejecucion_menores_edad option[value='" + json.propuesta.ejecucion_menores_edad + "']").prop('selected', true);

                                                                        //agrego los totales de caracteres
                                                                        if(json.propuesta.trayectoria_entidad!=null)
                                                                        {
                                                                            $(".caracter_trayectoria_entidad").html(3000 - json.propuesta.trayectoria_entidad.length);
                                                                        }
                                                                        if(json.propuesta.problema_necesidad!=null)
                                                                        {
                                                                            $(".caracter_problema_necesidad").html(3000 - json.propuesta.problema_necesidad.length);
                                                                        }
                                                                        if(json.propuesta.diagnostico_problema!=null)
                                                                        {
                                                                            $(".caracter_diagnostico_problema").html(3000 - json.propuesta.diagnostico_problema.length);
                                                                        }
                                                                        if(json.propuesta.justificacion!=null)
                                                                        {
                                                                            $(".caracter_justificacion").html(3000 - json.propuesta.justificacion.length);
                                                                        }
                                                                        if(json.propuesta.resumen!=null)
                                                                        {
                                                                            $(".caracter_resumen").html(1000 - json.propuesta.resumen.length);
                                                                        }
                                                                        if(json.propuesta.seleccion_area!=null)
                                                                        {
                                                                            $(".caracter_seleccion_area").html(3000 - json.propuesta.seleccion_area.length);
                                                                        }
                                                                        if(json.propuesta.atencedente!=null)
                                                                        {
                                                                            $(".caracter_atencedente").html(2000 - json.propuesta.atencedente.length);
                                                                        }
                                                                        if(json.propuesta.aportes_proyecto!=null)
                                                                        {
                                                                            $(".caracter_aportes_proyecto").html(2000 - json.propuesta.aportes_proyecto.length);
                                                                        }
                                                                        if(json.propuesta.metodologia!=null)
                                                                        {
                                                                            $(".caracter_metodologia").html(3000 - json.propuesta.metodologia.length);
                                                                        }
                                                                        if(json.propuesta.impacto!=null)
                                                                        {
                                                                            $(".caracter_impacto").html(3000 - json.propuesta.impacto.length);
                                                                        }
                                                                        if(json.propuesta.enfoques_seleccionados!=null)
                                                                        {
                                                                            $(".caracter_enfoques_seleccionados").html(2000 - json.propuesta.enfoques_seleccionados.length);
                                                                        }
                                                                        if(json.propuesta.mecanismos_cualitativa!=null)
                                                                        {
                                                                            $(".caracter_mecanismos_cualitativa").html(2000 - json.propuesta.mecanismos_cualitativa.length);
                                                                        }
                                                                        if(json.propuesta.aportes_dinamizacion!=null)
                                                                        {
                                                                            $(".caracter_aportes_dinamizacion").html(1000 - json.propuesta.aportes_dinamizacion.length);
                                                                        }
                                                                        if(json.propuesta.mecanismos_cuantitativa!=null)
                                                                        {
                                                                            $(".caracter_mecanismos_cuantitativa").html(1000 - json.propuesta.mecanismos_cuantitativa.length);
                                                                        }
                                                                        
                                                                        if(json.propuesta.proyeccion_reconocimiento!=null)
                                                                        {
                                                                            $(".caracter_proyeccion_reconocimiento").html(500 - json.propuesta.proyeccion_reconocimiento.length);
                                                                        }
                                                                        
                                                                        if(json.propuesta.construccion_reconocimiento!=null)
                                                                        {
                                                                            $(".caracter_construccion_reconocimiento").html(500 - json.propuesta.construccion_reconocimiento.length);
                                                                        }

                                                                        if(json.propuesta.correspondencia_proyecto_objetivos!=null)
                                                                        {
                                                                            $(".caracter_correspondencia_proyecto_objetivos").html(1000 - json.propuesta.construccion_reconocimiento.length);
                                                                        }

                                                                        if(json.propuesta.estrategia_construccion_memoria!=null)
                                                                        {
                                                                            $(".caracter_estrategia_construccion_memoria").html(3000 - json.propuesta.construccion_reconocimiento.length);
                                                                        }

                                                                        if(json.propuesta.impacto_proyecto!=null)
                                                                        {
                                                                            $(".caracter_impacto_proyecto").html(500 - json.propuesta.impacto_proyecto.length);
                                                                        }

                                                                        $("#mecanismos_cualitativa_local").val(json.propuesta.mecanismos_cualitativa);

                                                                        $("#estrategia_construccion_memoria").val(json.propuesta.estrategia_construccion_memoria);
                                                                        $("#correspondencia_proyecto_objetivos").val(json.propuesta.correspondencia_proyecto_objetivos);

                                                                        
                                                                        //Valido formulario
                                                                        validator_form(token_actual);

                                                                    }
                                                                }

                                                            }
                                                        }
                                                    }
                                                });

                                                //Cargar Upz y Barrios
                                                $('#localidad').on('change', function () {
                                                    var localidad = $(this).val();
                                                    $('#upz').find('option').remove();
                                                    $('#barrio').find('option').remove();
                                                    $.ajax({
                                                        type: 'GET',
                                                        data: {"token": token_actual.token, "localidad": localidad},
                                                        url: url_pv + 'Upzs/select_participantes'
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

                                                                $("#upz").append('<option value="">:: Seleccionar ::</option>');
                                                                if (json != null)
                                                                {
                                                                    if (json.length > 0) {
                                                                        $.each(json, function (key, value) {
                                                                            $("#upz").append('<option value="' + value.id + '">' + value.nombre + '</option>');
                                                                        });
                                                                    }
                                                                }
                                                                $("#barrio").append('<option value="">:: Seleccionar ::</option>');
                                                            }
                                                        }
                                                    });
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
                                                                $("#barrio").append('<option value="">:: Seleccionar ::</option>');
                                                                if (json != null)
                                                                {
                                                                    if (json.length > 0) {
                                                                        $.each(json, function (key, value) {
                                                                            $("#barrio").append('<option value="' + value.id + '">' + value.nombre + '</option>');
                                                                        });
                                                                    }
                                                                }
                                                            }
                                                        }
                                                    });
                                                });

                                                //Cargar Barrios
                                                $('#upz').on('change', function () {
                                                    var upz = $(this).val();
                                                    var localidad = $("#localidad").val();
                                                    $('#barrio').find('option').remove();
                                                    $.ajax({
                                                        type: 'GET',
                                                        data: {"token": token_actual.token, "localidad": localidad, "upz": upz},
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
                                                                $("#barrio").append('<option value="">:: Seleccionar ::</option>');
                                                                if (json.length > 0) {
                                                                    $.each(json, function (key, value) {
                                                                        $("#barrio").append('<option value="' + value.id + '">' + value.nombre + '</option>');
                                                                    });
                                                                }
                                                            }
                                                        }
                                                    });
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

    $('.calendario').datetimepicker({
        language: 'es',
        weekStart: 1,
        todayBtn: 1,
        autoclose: 1,
        todayHighlight: 1,
        startView: 2,
        minView: 2,
        forceParse: 0
    });

    //Se debe colocar debido a que el calendario es un componente diferente
    $('.calendario').on('changeDate show', function (e) {
        $('.formulario_principal').bootstrapValidator('revalidateField', $("#parametro_" + $(this).attr("title")));
    });

    //Validar el formulario
    $('.formulario_principal').bootstrapValidator(JSON.parse($("#validator").val())).on('success.form.bv', function (e) {

        // Prevent form submission
        e.preventDefault();
        // Get the form instance
        var $form = $(e.target);

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
        $('#formulario_principal').attr('action', url_pv + 'PropuestasPdac/editar_propuesta');

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
                                    notify("danger", "ok", "Proyecto:", "Se registro un error, comuníquese con la mesa de ayuda convocatorias@scrd.gov.co");
                                } else
                                {
                                    notify("success", "ok", "Proyecto:", "Se actualizó con el éxito la propuesta.");

                                    var redirect = "";
                                    if (getURLParameter('m') == "pn")
                                    {
                                        redirect = "documentacion.html";
                                    }
                                    if (getURLParameter('m') == "pj")
                                    {
                                        redirect = "junta.html";
                                    }
                                    if (getURLParameter('m') == "agr")
                                    {
                                        redirect = "integrantes.html";
                                    }



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

    });

}
