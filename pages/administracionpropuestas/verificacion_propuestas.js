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
            permiso_lectura_keycloak(token_actual.token, "SICON-PROPUESTAS-VERIFICACION");

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

            //Realizo la peticion para cargar el formulario
            $.ajax({
                type: 'POST',
                data: {"token": token_actual.token, "modulo": "SICON-PROPUESTAS-VERIFICACION"},
                url: url_pv + 'Convocatorias/modulo_buscador_propuestas'
            }).done(function (data) {
                if (data == 'error_metodo')
                {
                    notify("danger", "ok", "Convocatorias:", "Se registro un error en el método, comuníquese con la mesa de ayuda convocatorias@scrd.gov.co");
                } else
                {
                    if (data == 'error')
                    {
                        notify("danger", "ok", "Convocatorias:", "Por favor actualizar la página, debido a que su sesión caduco");
                    } else
                    {
                        if (data == 'acceso_denegado')
                        {
                            notify("danger", "remove", "Convocatorias:", "No tiene permisos para ver la información.");
                        } else
                        {
                            var json = JSON.parse(data);

                            $("#anio").append('<option value="">:: Seleccionar ::</option>');
                            if (json.anios.length > 0) {
                                $.each(json.anios, function (key, anio) {
                                    $("#anio").append('<option value="' + anio + '"  >' + anio + '</option>');
                                });
                            }

                            $("#entidad").append('<option value="">:: Seleccionar ::</option>');
                            if (json.entidades.length > 0) {
                                $.each(json.entidades, function (key, entidad) {
                                    $("#entidad").append('<option value="' + entidad.id + '"  >' + entidad.nombre + '</option>');
                                });
                            }

                            if (json.entidades.length > 0) {
                                //var selected;
                                $.each(json.estados_propuestas, function (key, estado_propuesta) {
                                    if( estado_propuesta.id===8 || estado_propuesta.id===20 || estado_propuesta.id===21 || estado_propuesta.id===22 || estado_propuesta.id===23 || estado_propuesta.id===24 || estado_propuesta.id===31 || estado_propuesta.id===33 || estado_propuesta.id===34 || estado_propuesta.id===44|| estado_propuesta.id===53)                                
                                    {                                    
                                        $("#estado_propuesta").append('<option value="' + estado_propuesta.id + '" >' + estado_propuesta.nombre + '</option>');
                                    }
                                });
                            }
                        }
                    }
                }
            });

            $('.close').click(function () {
                $("#contratistas").css("display", "none");
                $("#boton_confirma_administrativa_1").removeAttr("disabled");
            });

            $('#modal_verificacion_1').on('hidden.bs.modal', function () {
                $("#contratistas").css("display", "none");
                $("#boton_confirma_administrativa_1").removeAttr("disabled");
            });

            $('#buscar').click(function () {

                if ($("#codigo").val() != "")
                {
                    if ($("#busqueda").val() == "0")
                    {
                        //Cargar datos en la tabla actual
                        cargar_tabla();

                        $("#busqueda").attr("value", "1");
                    } else
                    {
                        $('#table_list').DataTable().ajax.reload(null, false);
                    }
                } else
                {
                    if ($("#convocatoria").val() != "")
                    {

                        var mensaje;
                        if ($("#convocatoria option:selected").attr("dir") == "true")
                        {
                            $("#id_convocatoria").val($("#categoria").val());
                            mensaje = "categoría";

                        } else
                        {
                            $("#id_convocatoria").val($("#convocatoria").val());
                            mensaje = "convocatoria";
                        }

                        if ($("#id_convocatoria").val() == "")
                        {
                            notify("danger", "ok", "Convocatorias:", "Debe seleccionar la " + mensaje + ".");
                        } else
                        {

                            var token_actual = JSON.parse(JSON.stringify(keycloak));

                            //Realizo la peticion para validar acceso a la convocatoria
                            $.ajax({
                                type: 'POST',
                                data: {"token": token_actual.token},
                                url: url_pv + 'PropuestasVerificacion/validar_acceso/' + $("#id_convocatoria").val()
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
                                        if (data == 'error_fecha_cierre')
                                        {
                                            notify("danger", "ok", "Convocatorias:", "La convocatoria no se encuentra disponible para ver las propuestas inscritas.");
                                        } else
                                        {
                                            if (data == 'ingresar')
                                            {
                                                if ($("#busqueda").val() == "0")
                                                {
                                                    //Cargar datos en la tabla actual
                                                    cargar_tabla();

                                                    $("#busqueda").attr("value", "1");
                                                } else
                                                {
                                                    $('#table_list').DataTable().ajax.reload(null, false);
                                                }
                                            } else
                                            {
                                                notify("danger", "ok", "Convocatorias:", "Se registro un error en el método, comuníquese con la mesa de ayuda convocatorias@scrd.gov.co");
                                            }
                                        }
                                    }
                                }
                            });

                        }

                    } else
                    {
                        notify("danger", "ok", "Propuestas:", "Debe seleccionar la convocatoria");
                    }
                }

            });

            $('#entidad, #anio').change(function () {

                $("#categoria option[value='']").prop('selected', true);
                $("#convocatoria option[value='']").prop('selected', true);
                $("#categoria").attr("disabled", "disabled");

                if ($("#anio").val() == "")
                {
                    notify("danger", "ok", "Propuestas:", "Debe seleccionar el año");
                } else
                {
                    if ($("#entidad").val() != "")
                    {

                        var token_actual = JSON.parse(JSON.stringify(keycloak));

                        $.ajax({
                            type: 'POST',
                            data: {"modulo": "SICON-PROPUESTAS-VERIFICACION", "token": token_actual.token, "anio": $("#anio").val(), "entidad": $("#entidad").val()},
                            url: url_pv + 'PropuestasVerificacion/select_convocatorias'
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
                                    if (data == 'acceso_denegado')
                                    {
                                        notify("danger", "remove", "Convocatorias:", "No tiene permisos para ver la información.");
                                    } else
                                    {
                                        var json = JSON.parse(data);

                                        $('#convocatoria').find('option').remove();
                                        $("#convocatoria").append('<option value="">:: Seleccionar ::</option>');
                                        $.each(json, function (key, value) {
                                            $("#convocatoria").append('<option dir="' + value.tiene_categorias + '" lang="' + value.diferentes_categorias + '" value="' + value.id + '">' + value.nombre + '</option>');
                                        });

                                        $("#convocatoria").selectpicker('refresh');

                                    }
                                }
                            }
                        });
                    }
                }
            });

            $('#convocatoria').change(function () {

                if ($("#convocatoria option:selected").attr("dir") == "true")
                {
                    $("#categoria").removeAttr("disabled")
                } else
                {
                    $("#categoria").attr("disabled", "disabled");
                }

                if ($("#convocatoria").val() != "")
                {

                    var token_actual = JSON.parse(JSON.stringify(keycloak));

                    $.ajax({
                        type: 'POST',
                        data: {"modulo": "SICON-PROPUESTAS-VERIFICACION", "token": token_actual.token, "conv": $("#convocatoria").val()},
                        url: url_pv + 'PropuestasVerificacion/select_categorias'
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
                                if (data == 'acceso_denegado')
                                {
                                    notify("danger", "remove", "Convocatorias:", "No tiene permisos para ver la información.");
                                } else
                                {
                                    var json = JSON.parse(data);

                                    $('#categoria').find('option').remove();
                                    $("#categoria").append('<option value="">:: Seleccionar ::</option>');
                                    $.each(json, function (key, value) {
                                        $("#categoria").append('<option value="' + value.id + '">' + value.nombre + '</option>');
                                    });
                                }
                            }
                        }
                    });
                }

            });

            $("#boton_rechazo_verificacion_1_administrativa").click(function () {
                $('#modal_rechazo_verificacion_1_administrativa').modal('hide');
                $('#modal_confirmar_administrativa_1').modal('show');
            });

            $("#boton_rechazo_verificacion_1_tecnica").click(function () {
                $('#modal_rechazo_verificacion_1_tecnica').modal('hide');
                $('#modal_confirmar_tecnica_1').modal('show');
            });

            $("#boton_confirmar_administrativa_1").click(function () {
                $('#modal_confirmar_administrativa_1').modal('hide');
                guardar_confirmacion(token_actual, $("#estado_actual_propuesta").val(), $("#tipo_verificacion").val());
            });

            $("#boton_confirmar_tecnica_1").click(function () {
                $('#modal_confirmar_tecnica_1').modal('hide');
                guardar_confirmacion(token_actual, $("#estado_actual_propuesta").val(), $("#tipo_verificacion").val());
            });

            $("#generar_presupuesto").click(function () {

                var token_actual = JSON.parse(JSON.stringify(keycloak));
                
                $.AjaxDownloader({
                    data: {
                        propuesta: $("#propuesta").val(),
                        token: token_actual.token
                    },
                    url: url_pv + 'PropuestasFormatos/propuesta_presupuesto_funcionario_xls/'
                });
            });

            $("#boton_confirma_administrativa_1").click(function () {
                $("#numero_verificacion").val('');

                //Valido que todos los documentos administrativos ya estan validados
                var requisitos_administrativos = $('#doc_administrativos_verificacion_1 .validar_administrativos:hidden[value=""]').toArray().length;
                if (requisitos_administrativos <= 0)
                {
                    //Se realiza la validacion con el fin de determinar la propuesta si se rechaza, 
                    //por subsanar o se deja igual
                    var propuesta = $("#propuesta").val();
                    var verificacion = 1;
                    $("#numero_verificacion").val(verificacion);
                    $.ajax({
                        type: 'POST',
                        url: url_pv + 'PropuestasVerificacion/valida_verificacion',
                        data: {"token": token_actual.token, "modulo": "SICON-PROPUESTAS-VERIFICACION", "propuesta": propuesta, "verificacion": verificacion, "tipo_requisito": "Administrativos"},
                    }).done(function (result) {

                        if (result == 'error_metodo')
                        {
                            notify("danger", "ok", "Verificación de propuestas:", "Se registro un error en el método, comuníquese con la mesa de ayuda convocatorias@scrd.gov.co");
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
                                    if (result == 'crear_propuesta')
                                    {
                                        notify("danger", "remove", "Verificación de propuestas:", "El código de la propuesta no es valido.");
                                    } else
                                    {
                                        if (result == 'error')
                                        {
                                            notify("danger", "ok", "Verificación de propuestas:", "Se registro un error al crear, comuníquese con la mesa de ayuda convocatorias@scrd.gov.co");
                                        } else
                                        {

                                            if (result == 'rechazar')
                                            {
                                                $('#modal_rechazo_verificacion_1_administrativa').modal('show');
                                                $("#estado_actual_propuesta").val("rechazar");
                                            }

                                            if (result == 'subsanar')
                                            {
                                                $('#modal_confirmar_administrativa_1').modal('show');
                                                $("#estado_actual_propuesta").val("subsanar");
                                                $("#tipo_verificacion").val("administrativa");
                                            }

                                            if (result == 'confirmar')
                                            {
                                                $('#modal_confirmar_administrativa_1').modal('show');
                                                $("#estado_actual_propuesta").val("confirmar");
                                                $("#tipo_verificacion").val("administrativa");
                                            }
                                        }
                                    }
                                }
                            }
                        }

                    });
                } else
                {
                    notify("info", "ok", "Verificación de propuestas:", "Para poder continuar debe verificar todos los documentos administrativos.");
                }

            });

            $("#boton_confirma_administrativa_2").click(function () {
                $("#numero_verificacion").val('');
                //Valido que todos los documentos administrativos ya estan validados
                var requisitos_administrativos = $('#doc_administrativos_verificacion_2 .validar_administrativos:hidden[value=""]').toArray().length;
                if (requisitos_administrativos <= 0)
                {
                    //Se realiza la validacion con el fin de determinar la propuesta si se rechaza, 
                    //por subsanar o se deja igual
                    var propuesta = $("#propuesta").val();
                    var verificacion = 2;
                    $("#numero_verificacion").val(verificacion);



                    var token_actual = JSON.parse(JSON.stringify(keycloak));

                    $.ajax({
                        type: 'POST',
                        url: url_pv + 'PropuestasVerificacion/valida_verificacion',
                        data: {"token": token_actual.token, "modulo": "SICON-PROPUESTAS-VERIFICACION", "propuesta": propuesta, "verificacion": verificacion, "tipo_requisito": "Administrativos"},
                    }).done(function (result) {

                        if (result == 'error_metodo')
                        {
                            notify("danger", "ok", "Verificación de propuestas:", "Se registro un error en el método, comuníquese con la mesa de ayuda convocatorias@scrd.gov.co");
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
                                    if (result == 'crear_propuesta')
                                    {
                                        notify("danger", "remove", "Verificación de propuestas:", "El código de la propuesta no es valido.");
                                    } else
                                    {
                                        if (result == 'error')
                                        {
                                            notify("danger", "ok", "Verificación de propuestas:", "Se registro un error al crear, comuníquese con la mesa de ayuda convocatorias@scrd.gov.co");
                                        } else
                                        {

                                            if (result == 'rechazar')
                                            {
                                                $('#modal_rechazo_verificacion_1_administrativa').modal('show');
                                                $("#estado_actual_propuesta").val("rechazar");
                                            }

                                            if (result == 'confirmar')
                                            {
                                                $('#modal_confirmar_administrativa_1').modal('show');
                                                $("#estado_actual_propuesta").val("confirmar");
                                                $("#tipo_verificacion").val("administrativa");
                                            }

                                            if (result == 'cumple')
                                            {
                                                $('#modal_confirmar_administrativa_1').modal('show');
                                                $("#estado_actual_propuesta").val("cumple");
                                                $("#tipo_verificacion").val("administrativa");
                                            }
                                        }
                                    }
                                }
                            }
                        }

                    });


                } else
                {
                    notify("info", "ok", "Verificación de propuestas:", "Para poder continuar debe verificar todos los documentos administrativos.");
                }

            });

            $("#boton_confirma_tecnica_1").click(function () {
                $("#numero_verificacion").val('');

                var requisitos_tecnicos = $('#doc_tecnicos_verificacion_1 .validar_tecnicos:hidden[value=""]').toArray().length;

                if (requisitos_tecnicos <= 0)
                {
                    //Se realiza la validacion con el fin de determinar la propuesta si se rechaza, 
                    //por subsanar o se deja igual
                    var propuesta = $("#propuesta").val();
                    var verificacion = 1;
                    $("#numero_verificacion").val(verificacion);



                    var token_actual = JSON.parse(JSON.stringify(keycloak));

                    $.ajax({
                        type: 'POST',
                        url: url_pv + 'PropuestasVerificacion/valida_verificacion',
                        data: {"token": token_actual.token, "modulo": "SICON-PROPUESTAS-VERIFICACION", "propuesta": propuesta, "verificacion": verificacion, "tipo_requisito": "Tecnicos"},
                    }).done(function (result) {

                        if (result == 'error_metodo')
                        {
                            notify("danger", "ok", "Verificación de propuestas:", "Se registro un error en el método, comuníquese con la mesa de ayuda convocatorias@scrd.gov.co");
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
                                    if (result == 'crear_propuesta')
                                    {
                                        notify("danger", "remove", "Verificación de propuestas:", "El código de la propuesta no es valido.");
                                    } else
                                    {
                                        if (result == 'error')
                                        {
                                            notify("danger", "ok", "Verificación de propuestas:", "Se registro un error al crear, comuníquese con la mesa de ayuda convocatorias@scrd.gov.co");
                                        } else
                                        {

                                            if (result == 'rechazar')
                                            {
                                                $('#modal_rechazo_verificacion_1_tecnica').modal('show');
                                                $("#estado_actual_propuesta").val("rechazar");
                                                $("#tipo_verificacion").val("tecnica");
                                            }

                                            if (result == 'subsanar')
                                            {
                                                $('#modal_confirmar_tecnica_1').modal('show');
                                                $("#estado_actual_propuesta").val("subsanar");
                                                $("#tipo_verificacion").val("tecnica");
                                            }

                                            if (result == 'confirmar')
                                            {
                                                $('#modal_confirmar_tecnica_1').modal('show');
                                                $("#estado_actual_propuesta").val("habilitada");
                                                $("#tipo_verificacion").val("tecnica");
                                            }
                                        }
                                    }
                                }
                            }
                        }

                    });

                } else
                {
                    notify("info", "ok", "Verificación de propuestas:", "Para poder continuar debe verificar todos los documentos técnicos.");
                }

            });


            $('input[type="file"]').change(function (evt) {

                var f = evt.target.files[0];
                var reader = new FileReader();

                // Cierre para capturar la información del archivo.
                reader.onload = function (fileLoadedEvent) {
                    var srcData = fileLoadedEvent.target.result; // <--- data: base64
                    var srcName = f.name;
                    var srcSize = f.size;
                    var srcType = f.type;
                    var ext = srcName.split('.');
                    // ahora obtenemos el ultimo valor despues el punto
                    // obtenemos el length por si el archivo lleva nombre con mas de 2 puntos
                    srcExt = ext[ext.length - 1];

                    var permitidos = 'pdf';
                    var permitidos_mayuscula = 'PDF';
                    var pd_verificacion = $("#pd_verificacion").val();
                    var tamano = '15';

                    var extensiones = permitidos.split(',');
                    var extensiones_mayuscula = permitidos_mayuscula.split(',');

                    if (extensiones.includes(srcExt) || extensiones_mayuscula.includes(srcExt))
                    {
                        //mb -> bytes
                        permitidotamano = tamano * 1000 * 1000;
                        if (srcSize > permitidotamano)
                        {
                            notify("danger", "ok", "Documentación:", "El tamaño del archivo excede el permitido (" + tamano + " MB)");
                        } else
                        {

                            var token_actual = JSON.parse(JSON.stringify(keycloak));

                            $.post(url_pv + 'PropuestasVerificacion/guardar_archivo_rechazo', {pd_verificacion: pd_verificacion, srcExt: srcExt, srcData: srcData, srcName: srcName, srcSize: srcSize, srcType: srcType, "token": token_actual.token, propuesta: $("#propuesta").attr('value'), "modulo": "SICON-PROPUESTAS-VERIFICACION"}).done(function (data) {
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
                                            if (data == 'error_carpeta')
                                            {
                                                notify("danger", "ok", "Convocatorias:", "Se registro un error al subir el archivo en la carpeta, comuníquese con la mesa de ayuda convocatorias@scrd.gov.co");
                                            } else
                                            {
                                                if (data == 'error_archivo')
                                                {
                                                    notify("danger", "ok", "Convocatorias:", "Se registro un error al subir el archivo, comuníquese con la mesa de ayuda convocatorias@scrd.gov.co");
                                                } else
                                                {
                                                    $("#pd_link").attr('onclick', "download_file('" + data + "')");
                                                    notify("success", "ok", "Convocatorias:", "Se Guardó con el éxito el archivo.");
                                                }
                                            }
                                        }
                                    }
                                }

                            });

                        }
                    } else
                    {
                        notify("danger", "ok", "Documentación:", "Archivo no permitido");
                    }

                };
                // Leer en el archivo como una URL de datos.                
                reader.readAsDataURL(f);
            });

        }
    }
});

function guardar_confirmacion(token_actual, estado_actual_propuesta, tipo_verificacion) {

    var propuesta = $("#propuesta").val();


    var token_actual = JSON.parse(JSON.stringify(keycloak));

    $.ajax({
        type: 'POST',
        url: url_pv + 'PropuestasVerificacion/guardar_confirmacion',
        data: {"token": token_actual.token, "modulo": "SICON-PROPUESTAS-VERIFICACION", "propuesta": propuesta, "estado_actual_propuesta": estado_actual_propuesta, "tipo_verificacion": tipo_verificacion, "verificacion": $("#numero_verificacion").val()},
    }).done(function (result) {

        if (result == 'error_metodo')
        {
            notify("danger", "ok", "Verificación de propuestas:", "Se registro un error en el método, comuníquese con la mesa de ayuda convocatorias@scrd.gov.co");
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
                    if (result == 'crear_propuesta')
                    {
                        notify("danger", "remove", "Verificación de propuestas:", "El código de la propuesta no es valido.");
                    } else
                    {
                        if (result == 'error')
                        {
                            notify("danger", "ok", "Verificación de propuestas:", "Se registro un error al crear, comuníquese con la mesa de ayuda convocatorias@scrd.gov.co");
                        } else
                        {

                            $('#modal_confirmar_administrativa_1').modal('hide');
                            $('#modal_verificacion_2').modal('hide');
                            $('#modal_verificacion_1').modal('hide');

                            $('#table_list').DataTable().ajax.reload(null, false);
                        }
                    }
                }
            }
        }

    });


}

function cargar_tabla() {

    var token_actual = JSON.parse(JSON.stringify(keycloak));


    $('#table_list').DataTable({
        "language": {
            "url": "../../dist/libraries/datatables/js/spanish.json"
        },
        "searching": false,
        "processing": true,
        "serverSide": true,
        "ordering": false,
        "lengthMenu": [50, 75, 100],
        "ajax": {
            url: url_pv + "PropuestasVerificacion/buscar_propuestas",
            data: function (d) {
                var params = new Object();
                params.anio = $('#anio').val();
                params.entidad = $('#entidad').val();
                params.convocatoria = $("#id_convocatoria").val();
                params.categoria = $('#categoria').val();
                params.codigo = $('#codigo').val();
                params.estado = $('#estado_propuesta').val();
                d.params = JSON.stringify(params);
                d.token = token_actual.token;
                d.modulo = "SICON-PROPUESTAS-VERIFICACION";
            },
            type: "POST"
        },
        "columnDefs": [{
                "targets": 0,
                "render": function (data, type, row, meta) {
                    //Verificar cual es la categoria padre
                    var categoria = row.convocatoria;
                    if (row.categoria != null) {
                        row.convocatoria = row.categoria;
                        row.categoria = categoria;
                    }

                    //Iconos de verificacion de documentación
                    var icon_admin = '<button type="button" class="btn btn-danger btn-circle btn_tooltip" title="El funcionario no ha terminado de revisar los documentos administrativos."><span class="fa fa-times"></span></button>';
                    var icon_tecni = '<button type="button" class="btn btn-danger btn-circle btn_tooltip" title="El funcionario no ha terminado de revisar los documentos técnicos."><span class="fa fa-times"></span></button>';
                    if (row.verificacion_administrativos) {
                        icon_admin = '<button type="button" class="btn btn-success btn-circle btn_tooltip" title="El funcionario ya termino de revisar los documentos administrativos."><span class="fa fa-check"></span></button>'
                    }
                    if (row.verificacion_tecnicos) {
                        icon_tecni = '<button type="button" class="btn btn-success btn-circle btn_tooltip" title="El funcionario ya termino de revisar los documentos técnicos."><span class="fa fa-check"></span></button>';
                    }
                    $('.btn_tooltip').tooltip();
                    row.verificacion_administrativos = icon_admin;
                    row.verificacion_tecnicos = icon_tecni;

                    //Iconos de numero de verificacion
                    row.btn_verificacion_1 = '<button type="button" lang="' + row.id_propuesta + '" class="btn btn-primary btn_tooltip cargar_verificacion_1" data-toggle="modal" data-target="#modal_verificacion_1" title="Es la primera verificación, la cual consiste en revisar los documentos administrativos y técnicos, con el fin de Habilitar, Rechazar o Subsanar."><span class="fa fa-eye"></span></button>';

                    row.btn_verificacion_2 = '<button type="button" lang="' + row.id_propuesta + '" class="btn btn-primary btn_tooltip cargar_verificacion_2" data-toggle="modal" data-target="#modal_verificacion_2" title="Es la segunda verificación, la cual consiste en revisar los documentos administrativos que subsano el participante con el fin de Habilitar o Rechazar."><span class="fa fa-eye"></span></button>';

                    return row.estado;
                }
            }
        ],
        "drawCallback": function (settings) {
            $('.btn_tooltip').tooltip();
            $('.cargar_verificacion_1').click(function () {
                cargar_verificacion_1($(this).attr("lang"));
            });
            $('.cargar_verificacion_2').click(function () {
                cargar_verificacion_2($(this).attr("lang"));
            });
        },
        "columns": [
            {"data": "estado"},
            {"data": "anio"},
            {"data": "entidad"},
            {"data": "convocatoria"},
            {"data": "categoria"},
            {"data": "propuesta"},
            {"data": "codigo"},
            {"data": "participante"},
            {"data": "verificacion_administrativos"},
            {"data": "verificacion_tecnicos"},
            {"data": "btn_verificacion_1"},
            {"data": "btn_verificacion_2"},
            {"data": "ver_reporte"}
        ]
    });
}

function cargar_verificacion_1(propuesta) {
    //Asigno la propuesta actual
    $("#propuesta").val(propuesta);

    $('#doc_administrativos_verificacion_2 tr').remove();
    $('#doc_administrativos_verificacion_1 tr').remove();
    $('#doc_tecnicos_verificacion_1 tr').remove();


    var token_actual = JSON.parse(JSON.stringify(keycloak));

    //Realizo la peticion para cargar el formulario
    $.ajax({
        type: 'POST',
        data: {"token": token_actual.token, "verificacion": 1},
        url: url_pv + 'PropuestasVerificacion/cargar_propuesta/' + propuesta
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
                if (data == 'error_propuesta')
                {
                    notify("danger", "ok", "Convocatorias:", "El código de la propuesta es incorrecto.");
                } else
                {
                    var json = JSON.parse(data);


                    //Cargo el select de los rechazos genrales de la propuesta
                    $('#tipo_rechazo').find('option').remove();
                    $("#tipo_rechazo").append('<option value="">:: Seleccionar ::</option>');
                    if (json.tipo_rechazos.length > 0) {
                        $.each(json.tipo_rechazos, function (key, rechazo) {
                            var selected = '';
                            if (rechazo == json.propuesta.tipo_rechazo)
                            {
                                selected = 'selected="selected"';
                            }
                            $("#tipo_rechazo").append('<option value="' + rechazo + '" ' + selected + ' >' + rechazo + '</option>');
                        });
                    }
                    //Observaciones generales del rechazo
                    $("#observacion_rechazo").val(json.propuesta.observacion_rechazo);

                    if (json.programa === 2)
                    {
                        $(".pdac_programa").css("display", "block");
                    } else
                    {
                        $(".pdac_programa").css("display", "none");
                    }

                    $('#info_propuesta_verificacion_1').loadJSON(json.propuesta);

                    var html_table = '';
                    $.each(json.administrativos, function (key2, documento) {
                        if (documento.verificacion_1_id === null)
                        {
                            documento.verificacion_1_id = "";
                        }
                        if (documento.verificacion_1_estado === null)
                        {
                            documento.verificacion_1_estado = "";
                        }
                        if (documento.verificacion_1_observacion === null)
                        {
                            documento.verificacion_1_observacion = "";
                        }

                        html_table = html_table + '<tr>';
                        html_table = html_table + '<td>' + documento.orden + ' ' + documento.requisito + '</td>';
                        html_table = html_table + '<td><b>Archivos<b/><br/><br/>';

                        $.each(documento.archivos, function (key, archivo) {
                            html_table = html_table + '<p><a style="color:#5cb85c" href="javascript:void(0)" onclick="download_file(\'' + archivo.id_alfresco + '\')">(Descargar) ' + archivo.nombre + '</a><br/>';
                            html_table = html_table + '<a style="color:#f0ad4e" target="_blank" href="' + archivo.url_alfresco + '" >(Ver Documento) ' + archivo.nombre + '</a></p>';
                        });
                        html_table = html_table + '<b>Links<b/><br/><br/>';
                        var numero_link = 1;
                        $.each(documento.links, function (key, link) {
                            html_table = html_table + '<p><a href="' + link.link + '" target="_blank">link ' + numero_link + '</a></p>';
                            numero_link++;
                        });
                        html_table = html_table + '</td>';
                        html_table = html_table + '<td>';
                        html_table = html_table + '         <div class="row">';
                        html_table = html_table + '             <div class="col-lg-12">';
                        html_table = html_table + '                 <div class="form-group">';
                        html_table = html_table + '                     <label> Resultado de la verificación</label>';
                        html_table = html_table + '                     <select id="estado_' + documento.id + '" class="form-control estados_administrativos" >';
                        $.each(json.estados_verificacion_1, function (key, estado) {
                            var selected = '';
                            if (documento.verificacion_1_estado == estado.id)
                            {
                                selected = 'selected="selected"';
                            }
                            if (estado.id != 26)
                            {
                                html_table = html_table + '<option value="' + estado.id + '" ' + selected + '>' + estado.nombre + '</option>';
                            }
                        });

                        var color_boton_guardado = "btn-success";
                        var mostrar_file = 'display:block';
                        if (documento.verificacion_1_id == "")
                        {
                            color_boton_guardado = "btn-danger";
                            mostrar_file = 'display:none';
                        }

                        html_table = html_table + '                     </select>';
                        html_table = html_table + '                 </div>';
                        html_table = html_table + '             </div>';
                        html_table = html_table + '         </div>';

                        html_table = html_table + '         <div class="row">';
                        html_table = html_table + '             <div class="col-lg-12">';
                        html_table = html_table + '                 <div class="form-group">';
                        html_table = html_table + '                     <label>Observaciones</label>';
                        html_table = html_table + '                     <textarea id="observaciones_' + documento.id + '" class="form-control" rows="3">' + documento.verificacion_1_observacion + '</textarea>';
                        html_table = html_table + '                 </div>';
                        html_table = html_table + '             </div>';
                        html_table = html_table + '         </div>';

                        html_table = html_table + '         <div id="div_' + documento.id + '" class="row" style="' + mostrar_file + '">';
                        html_table = html_table + '             <div class="col-lg-12">';
                        html_table = html_table + '                 <div class="form-group">';
                        html_table = html_table + '                     <label>Soporte Rechazo</label>';
                        html_table = html_table + '                     <button type="button" class="btn btn-primary btn_tooltip soporterechazo" data-toggle="modal" data-target="#cargar_documento" onclick="guardar_variables_documentos(\'' + documento.id + '\',\'' + documento.id_alfresco + '\')">Cargar Soporte, si aplica</button>';
                        html_table = html_table + '                 </div>';
                        html_table = html_table + '             </div>';
                        html_table = html_table + '         </div>';


                        html_table = html_table + '         <div class="row">';
                        html_table = html_table + '             <div class="col-lg-12">';
                        html_table = html_table + '                 <div class="form-group" style="text-align: right">';
                        html_table = html_table + '                     <button id="btn_documento_' + documento.id + '" type="button" class="btn ' + color_boton_guardado + '" onclick="guardar_verificacion_1(\'' + token_actual.token + '\',\'' + documento.id + '\',\'SICON-PROPUESTAS-VERIFICACION-ADM\',1)">Guardar</button>';
                        html_table = html_table + '                     <input type="hidden" class="validar_administrativos" id="id_documento_' + documento.id + '" value="' + documento.verificacion_1_id + '" />';
                        html_table = html_table + '                 </div>';
                        html_table = html_table + '             </div>';
                        html_table = html_table + '         </div>';
                        html_table = html_table + '</td>';
                        html_table = html_table + '</tr>';
                    });

                    $('#doc_administrativos_verificacion_1 tr').remove();
                    $("#doc_administrativos_verificacion_1").append(html_table);

                    html_table = "";

                    $.each(json.tecnicos, function (key2, documento) {

                        if (documento.verificacion_1_id === null)
                        {
                            documento.verificacion_1_id = "";
                        }
                        if (documento.verificacion_1_estado === null)
                        {
                            documento.verificacion_1_estado = "";
                        }
                        if (documento.verificacion_1_observacion === null)
                        {
                            documento.verificacion_1_observacion = "";
                        }

                        html_table = html_table + '<tr>';
                        html_table = html_table + '<td>' + documento.orden + ' ' + documento.requisito + '</td>';
                        html_table = html_table + '<td><b>Archivos<b/><br/><br/>';

                        $.each(documento.archivos, function (key, archivo) {
                            html_table = html_table + '<p><a style="color:#5cb85c" href="javascript:void(0)" onclick="download_file(\'' + archivo.id_alfresco + '\')">(Descargar) ' + archivo.nombre + '</a><br/>';
                            html_table = html_table + '<a style="color:#f0ad4e" target="_blank" href="' + archivo.url_alfresco + '" >(Ver Documento) ' + archivo.nombre + '</a></p>';
                        });
                        html_table = html_table + '<b>Links<b/><br/><br/>';
                        var numero_link = 1;
                        $.each(documento.links, function (key, link) {
                            html_table = html_table + '<p><a href="' + link.link + '" target="_blank">link ' + numero_link + '</a></p>';
                        });
                        html_table = html_table + '</td>';
                        html_table = html_table + '<td>';
                        html_table = html_table + '         <div class="row">';
                        html_table = html_table + '             <div class="col-lg-12">';
                        html_table = html_table + '                 <div class="form-group">';
                        html_table = html_table + '                     <label> Resultado de la verificación</label>';
                        html_table = html_table + '                     <select id="estado_' + documento.id + '" class="form-control estados_tecnicos" >';
                        $.each(json.estados_verificacion_1, function (key, estado) {
                            var selected = '';
                            if (documento.verificacion_1_estado == estado.id)
                            {
                                selected = 'selected="selected"';
                            }

                            //Se debe habilitar el estado subsanar en los documentos tecnicos
                            //de modalidad LEP
                            //if(json.modalidad==6)
                            //{
                            //    html_table = html_table + '<option value="' + estado.id + '" ' + selected + '>' + estado.nombre + '</option>';
                            //}
                            //else
                            //{
                            if (estado.id != 27)
                            {
                                html_table = html_table + '<option value="' + estado.id + '" ' + selected + '>' + estado.nombre + '</option>';
                            }
                            //}                                                                                    
                        });

                        var color_boton_guardado = "btn-success";
                        var mostrar_file = 'display:block';
                        if (documento.verificacion_1_id == "")
                        {
                            var color_boton_guardado = "btn-danger";
                            mostrar_file = 'display:none';
                        }

                        html_table = html_table + '                     </select>';
                        html_table = html_table + '                 </div>';
                        html_table = html_table + '             </div>';
                        html_table = html_table + '         </div>';
                        html_table = html_table + '         <div class="row">';
                        html_table = html_table + '             <div class="col-lg-12">';
                        html_table = html_table + '                 <div class="form-group">';
                        html_table = html_table + '                     <label>Observaciones</label>';
                        html_table = html_table + '                     <textarea id="observaciones_' + documento.id + '" class="form-control" rows="3">' + documento.verificacion_1_observacion + '</textarea>';
                        html_table = html_table + '                 </div>';
                        html_table = html_table + '             </div>';
                        html_table = html_table + '         </div>';


                        html_table = html_table + '         <div id="div_' + documento.id + '" class="row" style="' + mostrar_file + '">';
                        html_table = html_table + '             <div class="col-lg-12">';
                        html_table = html_table + '                 <div class="form-group">';
                        html_table = html_table + '                     <label>Soporte Rechazo</label>';
                        html_table = html_table + '                     <button type="button" class="btn btn-primary btn_tooltip soporterechazo" data-toggle="modal" data-target="#cargar_documento" onclick="guardar_variables_documentos(\'' + documento.id + '\',\'' + documento.id_alfresco + '\')">Cargar Soporte, si aplica</button>';
                        html_table = html_table + '                 </div>';
                        html_table = html_table + '             </div>';
                        html_table = html_table + '         </div>';



                        html_table = html_table + '         <div class="row">';
                        html_table = html_table + '             <div class="col-lg-12">';
                        html_table = html_table + '                 <div class="form-group" style="text-align: right">';
                        html_table = html_table + '                     <button type="button" id="btn_documento_' + documento.id + '" class="btn ' + color_boton_guardado + '" onclick="guardar_verificacion_1(\'' + token_actual.token + '\',\'' + documento.id + '\',\'SICON-PROPUESTAS-VERIFICACION-TEC\',1)">Guardar</button>';
                        html_table = html_table + '                     <input type="hidden" class="validar_tecnicos" id="id_documento_' + documento.id + '" value="' + documento.verificacion_1_id + '" />';
                        html_table = html_table + '                 </div>';
                        html_table = html_table + '             </div>';
                        html_table = html_table + '         </div>';
                        html_table = html_table + '</td>';
                        html_table = html_table + '</tr>';
                    });

                    $('#doc_tecnicos_verificacion_1 tr').remove();
                    $("#doc_tecnicos_verificacion_1").append(html_table);


                    //Por defecto los documentos tecnicos esta desactivados
                    $("#doc_tecnicos_verificacion_1").find('input,select,button,textarea').attr("disabled", "disabled");
                    $("#boton_confirma_tecnica_1").attr("disabled", "disabled");

                    //Valido si ya realizaron la verificación administrativa con el fin de habilitar
                    //la documentación tecnica
                    if (json.propuesta.verificacion_administrativos)
                    {

                        $("#doc_administrativos_verificacion_1").find('input,select,button,textarea').attr("disabled", "disabled");
                        $("#boton_confirma_administrativa_1").attr("disabled", "disabled");

                        $("#doc_tecnicos_verificacion_1").find('input,select,button,textarea').removeAttr("disabled");
                        $("#boton_confirma_tecnica_1").removeAttr("disabled");

                    }

                    if (json.propuesta.verificacion_tecnicos)
                    {

                        $("#doc_tecnicos_verificacion_1").find('input,select,button,textarea').attr("disabled", "disabled");
                        $("#boton_confirma_tecnica_1").attr("disabled", "disabled");

                    }

                    //Si la propuesta esta estado por
                    //Registrada
                    //Anulada
                    //Por Subsanar -> id -> se elimina debido a que se puede verificar
                    //                      la documentacion tecnica asi este por subsanar
                    //                      ya que al momento se rechaza
                    //Subsanación Recibida
                    //Rechazada
                    //Habilitada
                    //subsanada
                    //Se inactiva en la 1 verificación los documetos tecnicos                    
                    if (json.propuesta.estado == 7 || json.propuesta.estado == 20 || json.propuesta.estado == 22 || json.propuesta.estado == 23 || json.propuesta.estado == 24 || json.propuesta.estado == 31)
                    {

                        $("#doc_administrativos_verificacion_1").find('input,select,button,textarea').attr("disabled", "disabled");
                        $("#boton_confirma_administrativa_1").attr("disabled", "disabled");

                        $("#doc_tecnicos_verificacion_1").find('input,select,button,textarea').attr("disabled", "disabled");
                        $("#boton_confirma_tecnica_1").attr("disabled", "disabled");

                    }

                    if (Object.keys(json.contratistas).length > 0)
                    {
                        $("#contratistas").css("display", "block");

                        var html_table = "";
                        $(".tr_contratistas").remove();
                        $.each(json.contratistas, function (key, contratista) {
                            var nombre_contratista = String(contratista);
                            html_table = html_table + '<tr class="tr_contratistas"><td>' + key + '</td><td>' + nombre_contratista.replace(",", "<br/>") + '</td></tr>';
                        });
                        $("#body_contratistas").append(html_table);

                    } else
                    {
                        $("#contratistas").css("display", "none");
                    }

                    if (json.html_propuestas != "")
                    {
                        $("#propuestas_pn").css("display", "block");
                        $(".tr_propuestas").remove();
                        $("#body_propuestas_pn").append(json.html_propuestas);

                    } else
                    {
                        $("#propuestas_pn").css("display", "none");
                    }

                    if (json.html_propuestas_ganadoras != "")
                    {
                        $("#propuestas_ganadoras_pn").css("display", "block");
                        $(".tr_propuestas_ganadoras").remove();
                        $("#body_propuestas_ganadoras_pn").append(json.html_propuestas_ganadoras);

                    } else
                    {
                        $("#propuestas_ganadoras_pn").css("display", "none");
                    }

                    if (json.html_ganadoras_anios_anteriores != "")
                    {
                        $("#ganadoras_anios_anteriores").css("display", "block");
                        $(".tr_ganador_anio_anterior").remove();
                        $("#body_ganadoras_anios_anteriores").append(json.html_ganadoras_anios_anteriores);

                    } else
                    {
                        $("#ganadoras_anios_anteriores").css("display", "none");
                    }

                    if (json.html_propuestas_jurados_seleccionados != "")
                    {
                        $("#jurados_seleccionados").css("display", "block");
                        $(".tr_jurados_seleccionados").remove();
                        $("#body_jurados_seleccionados").append(json.html_propuestas_jurados_seleccionados);

                    } else
                    {
                        $("#jurados_seleccionados").css("display", "none");
                    }

                    //Siempre debe estar activo
                    $(".soporterechazo").removeAttr("disabled");
                }
            }
        }
    });

}

function cargar_verificacion_2(propuesta) {
    //Asigno la propuesta actual
    $("#propuesta").val(propuesta);

    $('#doc_administrativos_verificacion_2 tr').remove();
    $('#doc_administrativos_verificacion_1 tr').remove();
    $('#doc_tecnicos_verificacion_1 tr').remove();


    var token_actual = JSON.parse(JSON.stringify(keycloak));

    //Realizo la peticion para cargar el formulario
    $.ajax({
        type: 'POST',
        data: {"token": token_actual.token, "verificacion": 2},
        url: url_pv + 'PropuestasVerificacion/cargar_propuesta/' + propuesta
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
                if (data == 'error_propuesta')
                {
                    notify("danger", "ok", "Convocatorias:", "El código de la propuesta es incorrecto.");
                } else
                {
                    var json = JSON.parse(data);

                    $('#info_propuesta_verificacion_2').loadJSON(json.propuesta);

                    var html_table = '';
                    $.each(json.administrativos, function (key2, documento) {
                        if (documento.verificacion_1_id === null)
                        {
                            documento.verificacion_1_id = "";
                        }
                        if (documento.verificacion_1_estado === null)
                        {
                            documento.verificacion_1_estado = "";
                        }
                        if (documento.verificacion_1_observacion === null)
                        {
                            documento.verificacion_1_observacion = "";
                        }

                        html_table = html_table + '<tr>';
                        html_table = html_table + '<td>' + documento.orden + ' ' + documento.requisito + '</td>';
                        html_table = html_table + '<td><b>Archivos<b/><br/><br/>';

                        $.each(documento.archivos, function (key, archivo) {
                            html_table = html_table + '<p><a style="color:#5cb85c" href="javascript:void(0)" onclick="download_file(\'' + archivo.id_alfresco + '\')">(Descargar) ' + archivo.nombre + '</a><br/>';
                            html_table = html_table + '<a style="color:#f0ad4e" target="_blank" href="' + archivo.url_alfresco + '" >(Ver Documento) ' + archivo.nombre + '</a></p>';
                        });
                        html_table = html_table + '<b>Links<b/><br/><br/>';
                        var numero_link = 1;
                        $.each(documento.links, function (key, link) {
                            html_table = html_table + '<p><a href="' + link.link + '" target="_blank">link ' + numero_link + '</a></p>';
                            numero_link++;
                        });
                        html_table = html_table + '</td>';
                        html_table = html_table + '<td>';
                        html_table = html_table + '         <div class="row">';
                        html_table = html_table + '             <div class="col-lg-12">';
                        html_table = html_table + '                 <div class="form-group">';
                        html_table = html_table + '                     <label> Resultado de la verificación</label>';
                        html_table = html_table + '                     <select id="estado_' + documento.id + '" class="form-control estados_administrativos" >';
                        $.each(json.estados_verificacion_2, function (key, estado) {
                            var selected = '';
                            if (documento.verificacion_1_estado == estado.id)
                            {
                                selected = 'selected="selected"';
                            }

                            html_table = html_table + '<option value="' + estado.id + '" ' + selected + '>' + estado.nombre + '</option>';

                        });

                        var color_boton_guardado = "btn-success";
                        if (documento.verificacion_1_id == "")
                        {
                            color_boton_guardado = "btn-danger";
                        }

                        html_table = html_table + '                     </select>';
                        html_table = html_table + '                 </div>';
                        html_table = html_table + '             </div>';
                        html_table = html_table + '         </div>';
                        html_table = html_table + '         <div class="row">';
                        html_table = html_table + '             <div class="col-lg-12">';
                        html_table = html_table + '                 <div class="form-group">';
                        html_table = html_table + '                     <label>Observaciones</label>';
                        html_table = html_table + '                     <textarea id="observaciones_' + documento.id + '" class="form-control" rows="3">' + documento.verificacion_1_observacion + '</textarea>';
                        html_table = html_table + '                 </div>';
                        html_table = html_table + '             </div>';
                        html_table = html_table + '         </div>';
                        html_table = html_table + '         <div class="row">';
                        html_table = html_table + '             <div class="col-lg-12">';
                        html_table = html_table + '                 <div class="form-group" style="text-align: right">';
                        html_table = html_table + '                     <button id="btn_documento_' + documento.id + '" type="button" class="btn ' + color_boton_guardado + '" onclick="guardar_verificacion_1(\'' + token_actual.token + '\',\'' + documento.id + '\',\'SICON-PROPUESTAS-VERIFICACION-ADM\',2)">Guardar</button>';
                        html_table = html_table + '                     <input type="hidden" class="validar_administrativos" id="id_documento_' + documento.id + '" value="' + documento.verificacion_1_id + '" />';
                        html_table = html_table + '                 </div>';
                        html_table = html_table + '             </div>';
                        html_table = html_table + '         </div>';
                        html_table = html_table + '</td>';
                        html_table = html_table + '</tr>';
                    });

                    $.each(json.tecnicos, function (key2, documento) {
                        if (documento.verificacion_1_id === null)
                        {
                            documento.verificacion_1_id = "";
                        }
                        if (documento.verificacion_1_estado === null)
                        {
                            documento.verificacion_1_estado = "";
                        }
                        if (documento.verificacion_1_observacion === null)
                        {
                            documento.verificacion_1_observacion = "";
                        }

                        html_table = html_table + '<tr>';
                        html_table = html_table + '<td>' + documento.orden + ' ' + documento.requisito + '</td>';
                        html_table = html_table + '<td><b>Archivos<b/><br/><br/>';

                        $.each(documento.archivos, function (key, archivo) {
                            html_table = html_table + '<p><a style="color:#5cb85c" href="javascript:void(0)" onclick="download_file(\'' + archivo.id_alfresco + '\')">(Descargar) ' + archivo.nombre + '</a><br/>';
                            html_table = html_table + '<a style="color:#f0ad4e" target="_blank" href="' + archivo.url_alfresco + '" >(Ver Documento) ' + archivo.nombre + '</a></p>';
                        });
                        html_table = html_table + '<b>Links<b/><br/><br/>';
                        var numero_link = 1;
                        $.each(documento.links, function (key, link) {
                            html_table = html_table + '<p><a href="' + link.link + '" target="_blank">link ' + numero_link + '</a></p>';
                            numero_link++;
                        });
                        html_table = html_table + '</td>';
                        html_table = html_table + '<td>';
                        html_table = html_table + '         <div class="row">';
                        html_table = html_table + '             <div class="col-lg-12">';
                        html_table = html_table + '                 <div class="form-group">';
                        html_table = html_table + '                     <label> Resultado de la verificación</label>';
                        html_table = html_table + '                     <select id="estado_' + documento.id + '" class="form-control estados_administrativos" >';
                        $.each(json.estados_verificacion_2, function (key, estado) {
                            var selected = '';
                            if (documento.verificacion_1_estado == estado.id)
                            {
                                selected = 'selected="selected"';
                            }

                            html_table = html_table + '<option value="' + estado.id + '" ' + selected + '>' + estado.nombre + '</option>';

                        });

                        var color_boton_guardado = "btn-success";
                        if (documento.verificacion_1_id == "")
                        {
                            color_boton_guardado = "btn-danger";
                        }

                        html_table = html_table + '                     </select>';
                        html_table = html_table + '                 </div>';
                        html_table = html_table + '             </div>';
                        html_table = html_table + '         </div>';
                        html_table = html_table + '         <div class="row">';
                        html_table = html_table + '             <div class="col-lg-12">';
                        html_table = html_table + '                 <div class="form-group">';
                        html_table = html_table + '                     <label>Observaciones</label>';
                        html_table = html_table + '                     <textarea id="observaciones_' + documento.id + '" class="form-control" rows="3">' + documento.verificacion_1_observacion + '</textarea>';
                        html_table = html_table + '                 </div>';
                        html_table = html_table + '             </div>';
                        html_table = html_table + '         </div>';
                        html_table = html_table + '         <div class="row">';
                        html_table = html_table + '             <div class="col-lg-12">';
                        html_table = html_table + '                 <div class="form-group" style="text-align: right">';
                        html_table = html_table + '                     <button id="btn_documento_' + documento.id + '" type="button" class="btn ' + color_boton_guardado + '" onclick="guardar_verificacion_1(\'' + token_actual.token + '\',\'' + documento.id + '\',\'SICON-PROPUESTAS-VERIFICACION-ADM\',2)">Guardar</button>';
                        html_table = html_table + '                     <input type="hidden" class="validar_administrativos" id="id_documento_' + documento.id + '" value="' + documento.verificacion_1_id + '" />';
                        html_table = html_table + '                 </div>';
                        html_table = html_table + '             </div>';
                        html_table = html_table + '         </div>';
                        html_table = html_table + '</td>';
                        html_table = html_table + '</tr>';
                    });

                    $('#doc_administrativos_verificacion_2 tr').remove();
                    $("#doc_administrativos_verificacion_2").append(html_table);

                    $("#doc_administrativos_verificacion_2").find('input,select,button,textarea').attr("disabled", "disabled");
                    $("#boton_confirma_administrativa_2").attr("disabled", "disabled");

                    //Si la propuesta esta estado por
                    //Subsanada
                    if (json.propuesta.estado == 31)
                    {

                        $("#doc_administrativos_verificacion_2").find('input,select,button,textarea').removeAttr("disabled");
                        $("#boton_confirma_administrativa_2").removeAttr("disabled");
                    }


                }
            }
        }
    });

}

//Funcion para descargar archivo
function download_file(cod)
{
    var token_actual = JSON.parse(JSON.stringify(keycloak));

    $.AjaxDownloader({
        url: url_pv + 'PropuestasDocumentacion/download_file_back/',
        data: {
            cod: cod,
            token: token_actual.token,
            modulo: "SICON-PROPUESTAS-VERIFICACION"
        }
    });

}


function guardar_variables_documentos(id, id_alfresco) {
    $("#pd_verificacion").val($("#id_documento_" + id).val());
    $("#pd_link").attr('onclick', "download_file('" + id_alfresco + "')");
}


//guardar verificacion 1
function guardar_verificacion_1(token_actual, id, modulo, verificacion)
{
    //Debo validar que todos los documentos ya esten verificados
    //Hablar con gato si en la 1 verificacion solo revisan documentación administrativa
    //Eso quiere decir que la documentación tecnica solo se revisa cuando las propuesta
    //Ya pasaron por el proceso de subsanacion
    var estado = $("#estado_" + id).val();
    var observacion = $("#observaciones_" + id).val();
    var propuesta = $("#propuesta").val();
    var convocatoriadocumento = id;
    var id = $("#id_documento_" + id).val();

    var realizar_peticion = true;
    var mensaje_observaciones = 'Las observaciones son obligatorias, al momento de colocar un requisito a subsanar.';
    if ((estado == 26 || estado == 27 || estado == 30) && observacion == "")
    {
        realizar_peticion = false;
        var mensaje_observaciones = 'Las observaciones son obligatorias, al momento de colocar un requisito en no cumple.';
    }

    if (realizar_peticion)
    {


        var token_actual = JSON.parse(JSON.stringify(keycloak));

        //Se realiza la peticion con el fin de guardar el registro actual
        $.ajax({
            type: 'POST',
            url: url_pv + 'PropuestasVerificacion/guardar_verificacion_1',
            data: {"token": token_actual.token, "modulo": modulo, "propuesta": propuesta, "convocatoriadocumento": convocatoriadocumento, "estado": estado, "observacion": observacion, "verificacion": verificacion, "id": id},
        }).done(function (result) {

            if (result == 'error_metodo')
            {
                notify("danger", "ok", "Verificación de propuestas:", "Se registro un error en el método, comuníquese con la mesa de ayuda convocatorias@scrd.gov.co");
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
                        if (result == 'crear_propuesta')
                        {
                            notify("danger", "remove", "Verificación de propuestas:", "El código de la propuesta no es valido.");
                        } else
                        {
                            if (result == 'error')
                            {
                                notify("danger", "ok", "Verificación de propuestas:", "Se registro un error al crear, comuníquese con la mesa de ayuda convocatorias@scrd.gov.co");
                            } else
                            {
                                if (isNaN(result)) {
                                    notify("danger", "ok", "Verificación de propuestas:", "Se registro un error al crear, comuníquese con la mesa de ayuda convocatorias@scrd.gov.co");
                                } else
                                {
                                    $("#id_documento_" + convocatoriadocumento).val(result);
                                    $("#btn_documento_" + convocatoriadocumento).removeClass("btn-danger");
                                    $("#btn_documento_" + convocatoriadocumento).addClass("btn-success");
                                    $("#div_" + convocatoriadocumento).css('display', 'block');
                                    guardar_variables_documentos(convocatoriadocumento);
                                    notify("success", "ok", "Verificación de propuestas:", "Se Guardó con éxito la verificación del documento.");
                                }
                            }
                        }
                    }
                }
            }

        });

    } else
    {
        notify("danger", "ok", "Verificación de propuestas:", mensaje_observaciones);
    }


}

function certificado(id, programa) {
    var url = "reporte_propuesta_inscrita_back.php";
    if (programa === 2) {
        url = "reporte_propuesta_inscrita_pdac_back.php";
    }


    var token_actual = JSON.parse(JSON.stringify(keycloak));

    $.AjaxDownloader({
        url: url_pv_report + url,
        data: {
            id: id,
            token: token_actual.token,
            modulo: "SICON-PROPUESTAS-VERIFICACION"
        }
    });



}

function guardar_rechazo() {

    if ($("#tipo_rechazo").val() == "")
    {
        notify("danger", "ok", "Convocatorias:", "El tipo de rechazo es requerido");
    } else
    {
        if ($("#observacion_rechazo").val() == "")
        {
            notify("danger", "ok", "Convocatorias:", "Las observaciones del rechazo son requeridas");
        } else
        {

            var token_actual = JSON.parse(JSON.stringify(keycloak));

            $.post(url_pv + 'PropuestasVerificacion/guardar_rechazo', {tipo_rechazo: $("#tipo_rechazo").val(), observacion_rechazo: $("#observacion_rechazo").val(), "token": token_actual.token, propuesta: $("#propuesta").attr('value'), "modulo": "SICON-PROPUESTAS-VERIFICACION"}).done(function (data) {
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
                            if (data == 'crear_propuesta')
                            {
                                notify("danger", "ok", "Convocatorias:", "No se permite cargar la propuesta, comuníquese con la mesa de ayuda convocatorias@scrd.gov.co");
                            } else
                            {
                                if (data == 'error_actualizar')
                                {
                                    notify("danger", "ok", "Convocatorias:", "Se registro un error al actualizar la propuesta, comuníquese con la mesa de ayuda convocatorias@scrd.gov.co");
                                } else
                                {
                                    if (data == 'error_rechazo')
                                    {
                                        notify("danger", "ok", "Convocatorias:", "Solo se puede rechazar la propuesta si esta en estado Inscrita");
                                    } else
                                    {
                                        notify("success", "ok", "Convocatorias:", "Se Guardó con el éxito el rechazo de la propuesta.");
                                        $('#modal_verificacion_1').modal('hide');
                                        $('#table_list').DataTable().ajax.reload(null, false);
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

/*
function showExpires() {
if (!keycloak.tokenParsed) {
    $("#datos_token").html("Not authenticated");    
}

var o = 'Token Expires:\t\t' + new Date((keycloak.tokenParsed.exp + keycloak.timeSkew) * 1000).toLocaleString() + '<br/>';
o += 'Token Expires in:\t' + Math.round(keycloak.tokenParsed.exp + keycloak.timeSkew - new Date().getTime() / 1000) + ' seconds<br/>';

if (keycloak.refreshTokenParsed) {
    o += 'Refresh Token Expires:\t' + new Date((keycloak.refreshTokenParsed.exp + keycloak.timeSkew) * 1000).toLocaleString() + '<br/>';
    o += 'Refresh Expires in:\t' + Math.round(keycloak.refreshTokenParsed.exp + keycloak.timeSkew - new Date().getTime() / 1000) + ' seconds';
}

$("#datos_token").html(o);

}

function refreshToken(minValidity) {
    keycloak.updateToken(minValidity).then(function(refreshed) {
        if (refreshed) {
            $("#datos_token").html(keycloak.tokenParsed);
        } else {
            $("#datos_token").html('Token not refreshed, valid for ' + Math.round(keycloak.tokenParsed.exp + keycloak.timeSkew - new Date().getTime() / 1000) + ' seconds');            
        }
    }).catch(function() {        
        $("#datos_token").html('Failed to refresh token');
    });
}
*/