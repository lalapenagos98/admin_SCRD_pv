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

            //Valido el id de la propuesta
            if (Number.isInteger(parseInt(getURLParameter('id'))))
            {
                //Realizo la peticion para cargar el formulario
                $.ajax({
                    type: 'POST',
                    data: {"token": token_actual.token, "id": $("#id").attr('value'), "modulo": "SICON-CONVOCATORIAS-CONFIGURACION", "m": getURLParameter('m'), "p": getURLParameter('p')},
                    url: url_pv + 'Propuestas/buscar_propuesta_visualizar_formulario/'
                }).done(function (data) {
                    if (data == 'error_metodo')
                    {
                        notify("danger", "ok", "Convocatorias:", "Se registro un error en el método, comuníquese con la mesa de ayuda convocatorias@scrd.gov.co");
                    } else
                    {
                        if (data == 'error_token')
                        {
                            notify("danger", "ok", "Convocatorias:", "Por favor actualizar la página, debido a que su sesión caduco");
                        } else
                        {
                            if (data == 'acceso_denegado')
                            {
                                notify("danger", "remove", "Convocatorias:", "No tiene permisos para ver la información.");
                            } else
                            {
                                if (data == 'crear_perfil')
                                {                                    
                                    notify("danger", "ok", "Convocatorias:", "La propuesta no cuenta con el perfil de PN");
                                } else
                                {
                                    if (data == 'error_cod_propuesta')
                                    {
                                        notify("danger", "ok", "Convocatorias:", "La propuesta no esta registrada");
                                    } else
                                    {

                                        var json = JSON.parse(data);

                                        //Verifico si es bogota   
                                        if (json.estado == 7)
                                        {
                                            if (json.propuesta.bogota)
                                            {
                                                $(".desarrollo_bogota").removeAttr("disabled");
                                            } else
                                            {
                                                $(".desarrollo_bogota").attr("disabled", "disabled");
                                            }
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

                                        //Verifico si es premio
                                        if (json.estado == 7)
                                        {
                                            if (json.propuesta.modalidad == 4)
                                            {
                                                $(".es_premio").attr("disabled", "disabled");
                                            } else
                                            {
                                                $(".es_premio").removeAttr("disabled");
                                            }
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
                                                parametros += crearParametro(json.parametros[i].id, json.parametros[i].label, json.parametros[i].valores, json.parametros[i].tipo_parametro, json.parametros[i].obligatorio, "7");
                                                if (columna == 2)
                                                {
                                                    parametros += '</div>';
                                                    columna = 0;
                                                }
                                                columna++;
                                            }
                                        }
                                        $("#dinamico").html(parametros);


                                        //crear tooltip 
                                        $('[data-toggle="tooltip"]').tooltip();
                                        $('.btn_tooltip').tooltip();
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

                                        //Cargo el formulario con los datos
                                        $('#formulario_principal').loadJSON(json.propuesta);

                                        $("#bogota option[value='" + json.propuesta.bogota + "']").prop('selected', true);

                                        $("#ejecucion_menores_edad option[value='" + json.propuesta.ejecucion_menores_edad + "']").prop('selected', true);
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
                        type: 'POST',
                        data: {"token": token_actual.token, "localidad": localidad},
                        url: url_pv + 'Upzs/select'
                    }).done(function (data) {
                        if (data == 'error_metodo')
                        {
                            notify("danger", "ok", "Usuarios:", "Se registro un error en el método, comuníquese con la mesa de ayuda convocatorias@scrd.gov.co");
                        } else
                        {
                            if (data == 'error_token')
                            {
                                notify("danger", "ok", "Convocatorias:", "Por favor actualizar la página, debido a que su sesión caduco");
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
                            }
                        }
                    });
                    $.ajax({
                        type: 'POST',
                        data: {"token": token_actual.token, "localidad": localidad},
                        url: url_pv + 'Barrios/select'
                    }).done(function (data) {
                        if (data == 'error_metodo')
                        {
                            notify("danger", "ok", "Usuarios:", "Se registro un error en el método, comuníquese con la mesa de ayuda convocatorias@scrd.gov.co");
                        } else
                        {
                            if (data == 'error_token')
                            {
                                notify("danger", "ok", "Convocatorias:", "Por favor actualizar la página, debido a que su sesión caduco");
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
                        type: 'POST',
                        data: {"token": token_actual.token, "localidad": localidad, "upz": upz},
                        url: url_pv + 'Barrios/select'
                    }).done(function (data) {
                        if (data == 'error_metodo')
                        {
                            notify("danger", "ok", "Usuarios:", "Se registro un error en el método, comuníquese con la mesa de ayuda convocatorias@scrd.gov.co");
                        } else
                        {
                            if (data == 'error_token')
                            {
                                notify("danger", "ok", "Convocatorias:", "Por favor actualizar la página, debido a que su sesión caduco");
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

                //Cargar Barrios
                $('#bogota').on('change', function () {
                    var bogota = $(this).val();
                    //Verifico si es bogota                                
                    if (bogota == "true")
                    {
                        $(".desarrollo_bogota").removeAttr("disabled");
                    } else
                    {
                        $(".desarrollo_bogota").attr("disabled", "disabled");
                    }
                });

            }
        }
    }
});

/*
 * TENER EN CUENTA
 function crear_validadores() {
 var options = {
 fields: {
 nombre: {
 validators: {
 notEmpty: {message: 'El nombre de la propuesta es requerido'}
 }
 }
 }
 };
 
 var options = JSON.parse('{ \n\
 "fields": { \n\
 "nombre": { \n\
 "validators":{ \n\
 "notEmpty":{ "message":"El nombre de la propuesta es requerido" }\n\
 }\n\
 }\n\
 }\n\
 }');
 
 
 
 var campo_resumen = {resumen: {
 validators: {
 notEmpty: {message: 'El resumen de la propuesta es requerido'}
 }
 }};
 
 var campo_objetivo = {objetivo: {
 validators: {
 notEmpty: {message: 'El objetivo de la propuesta es requerido'}
 }
 }};        
 
 if ($("#modalidad").val() != 4)
 {
 options = {
 fields: {
 nombre: {
 validators: {
 notEmpty: {message: 'El nombre de la propuesta es requerido'}
 }
 },
 resumen: {
 validators: {
 notEmpty: {message: 'El resumen de la propuesta es requerido'}
 }
 },
 objetivo: {
 validators: {
 notEmpty: {message: 'El objetivo de la propuesta es requerido'}
 }
 }
 }
 };
 }
 
 //alert(options.fields.nombre.validators.notEmpty.message);
 
 return options;
 }
 */