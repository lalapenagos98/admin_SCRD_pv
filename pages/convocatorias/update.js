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
                data: {"token": token_actual.token, "id": getURLParameter('id'), "m": getURLParameter('m'), "p": getURLParameter('p'), "sub": getURLParameter('sub'), "modulo": "SICON-CONVOCATORIAS-CONFIGURACION-UPDATE"},
                url: url_pv + 'Administrador/menu_funcionario'
            }).done(function (result) {
                if (result == 'error_token')
                {
                    //location.href = url_pv_admin + 'index.html?msg=Su sesión ha expirado, por favor vuelva a ingresar.&msg_tipo=danger';
                    notify("danger", "ok", "Convocatorias:", "Se registro un error con la sesión, comuníquese con la mesa de ayuda convocatorias@scrd.gov.co");
                } else
                {
                    $("#menu_principal").html(result);
                }
            });

            //Creando link de navegación
            $("#link_categorias").attr("onclick", "location.href = 'categorias.html?id=" + $("#id").val() + "'");

            //Crear link qr
            $("#crear_qr").click(function () {
                window.open(
                        url_pv + 'ConvocatoriasWS/convocatoria_qr/' + $("#id").attr('value'),
                        '_blank' // <- This is what makes it open in a new window.
                        );
            });

            $('#form_validator').attr('action', url_pv + 'Convocatorias/new');

            //Establesco los text area html
            if (CKEDITOR.env.ie && CKEDITOR.env.version < 9)
                CKEDITOR.tools.enableHtml5Elements(document);

            CKEDITOR.config.height = 150;
            CKEDITOR.config.width = 'auto';
            CKEDITOR.replace('html_general');
            CKEDITOR.replace('descripcion_cp');

            //Limpio el formulario de los perfiles de los participantes
            $('#perfiles_participantes_modal').on('hidden.bs.modal', function () {
                $("#id_cp").attr('value', '');
                $("#tipo_participante").attr('value', '');
                CKEDITOR.instances.descripcion_cp.setData('');
                $("#tipo_participante_cp").html('');
            });

            //Limpio el formulario de los perfiles de los jurados
            $('#perfiles_jurados_modal').on('hidden.bs.modal', function () {
                $("#id_cpj").attr('value', '');
                $("#perfiles_jurados_modal select option:selected").removeAttr("selected");
                $("#perfiles_jurados_modal select option:selected").prop("selected", false);
                $("#perfiles_jurados_modal input[type=text] , #perfiles_jurados_modal textarea").each(function () {
                    this.value = '';
                });
            });

            //cargo el html dependiendo la varaible
            $(".cargar_modal_descripcion").click(function () {
                var variable = $(this).attr("lang");
                var value = $("#" + variable + "_html").val();
                var titulo = $(this).attr("dir");
                $("#html_titulo").html(titulo);
                $("#variable").val(variable);
                $("#titulo_variable").val(titulo);
                CKEDITOR.instances.html_general.setData(value);
            });

            //guardo la descripcion html
            $("#html_guardar").click(function () {
                if (CKEDITOR.instances.html_general.getData() == "")
                {
                    notify("danger", "ok", "Convocatorias:", "La variable (" + $("#titulo_variable").val() + "), es obligatoria");
                } else
                {
                    var values_html = {modulo: "SICON-CONVOCATORIAS-CONFIGURACION", "variable": $("#variable").val(), value_CKEDITOR: CKEDITOR.instances.html_general.getData(), token: token_actual.token};

                    //Realizo la peticion con el fin de editar el registro actual
                    $.ajax({
                        type: 'PUT',
                        url: url_pv + 'Convocatorias/edit/' + $("#id").attr('value'),
                        data: $.param(values_html)
                    }).done(function (result) {
                        if (result == 'error')
                        {
                            notify("danger", "ok", "Convocatorias:", "Se registro un error, comuníquese con la mesa de ayuda convocatorias@scrd.gov.co");
                        } else
                        {
                            if (result == 'error_token')
                            {
                                //location.href = url_pv_admin + 'index.html?msg=Su sesión ha expirado, por favor vuelva a ingresar.&msg_tipo=danger';
                                notify("danger", "ok", "Convocatorias:", "Se registro un error con la sesión, comuníquese con la mesa de ayuda convocatorias@scrd.gov.co");
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
                                        notify("info", "ok", "Convocatorias:", "Se edito la convocatoria con éxito.");
                                        $("#" + $("#variable").val() + "_html").val(CKEDITOR.instances.html_general.getData());
                                    }
                                }
                            }
                        }
                    });
                }
            });

            //Limpio el ckeditor al cerra el pop
            $('#modal_html').on('hidden.bs.modal', function () {
                CKEDITOR.instances.html_general.setData('');
            });


            $("#guardar_cp").click(function () {
                if ($("#id_cp").val() != "") {
                    //Realizo la peticion con el fin de editar el registro del perfil de la convocatoria

                    var values_perfil = {active: "TRUE", descripcion_perfil: CKEDITOR.instances.descripcion_cp.getData(), modulo: "SICON-CONVOCATORIAS-CONFIGURACION", token: token_actual.token};

                    $.ajax({
                        type: 'PUT',
                        url: url_pv + 'Convocatoriasparticipantes/edit/' + $("#id_cp").attr('value'),
                        data: $.param(values_perfil)
                    }).done(function (result) {
                        if (result == 'error')
                        {
                            notify("danger", "ok", "Convocatorias:", "Se registro un error, comuníquese con la mesa de ayuda convocatorias@scrd.gov.co");
                        } else
                        {
                            if (result == 'error_token')
                            {
                                //location.href = url_pv_admin + 'index.html?msg=Su sesión ha expirado, por favor vuelva a ingresar.&msg_tipo=danger';
                                notify("danger", "ok", "Convocatorias:", "Se registro un error con la sesión, comuníquese con la mesa de ayuda convocatorias@scrd.gov.co");
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
                                        notify("info", "ok", "Convocatorias:", "Se edito el perfil de participante con éxito.");
                                        //Activo en perfil de la convocatoria actual
                                        $(".tipo_participante_" + $("#id_tipo_participante").val()).attr('checked', true);
                                        $(".tipo_participante_" + $("#id_tipo_participante").val()).prop("checked", true);

                                        //Limpio el formulario
                                        $("#id_cp").attr('value', '');
                                        $("#id_tipo_participante").attr('value', '');
                                        CKEDITOR.instances.descripcion_cp.setData('');
                                        $("#tipo_participante_cp").html('');

                                        cargar_tabla_perfiles_participante(token_actual);
                                    }
                                }
                            }
                        }
                    });
                } else
                {
                    if ($("#id_tipo_participante").val() != "") {
                        //Se realiza la peticion con el fin de guardar el registro de la convocatoria participante
                        $.ajax({
                            type: 'POST',
                            url: url_pv + 'Convocatoriasparticipantes/new/',
                            data: "active=TRUE&descripcion_perfil=" + CKEDITOR.instances.descripcion_cp.getData() + "&convocatoria=" + $("#id").val() + "&tipo_participante=" + $("#id_tipo_participante").val() + "&modulo=SICON-CONVOCATORIAS-CONFIGURACION&token=" + token_actual.token
                        }).done(function (result) {

                            if (result == 'error')
                            {
                                notify("danger", "ok", "Convocatorias:", "Se registro un error, comuníquese con la mesa de ayuda convocatorias@scrd.gov.co");
                            } else
                            {
                                if (result == 'error_token')
                                {
                                    //location.href = url_pv_admin + 'index.html?msg=Su sesión ha expirado, por favor vuelva a ingresar.&msg_tipo=danger';
                                    notify("danger", "ok", "Convocatorias:", "Se registro un error con la sesión, comuníquese con la mesa de ayuda convocatorias@scrd.gov.co");
                                } else
                                {
                                    if (result == 'acceso_denegado')
                                    {
                                        notify("danger", "remove", "Convocatorias:", "No tiene permisos para editar información.");
                                    } else
                                    {
                                        if (isNaN(result)) {
                                            notify("danger", "ok", "Convocatorias:", "Se registro un error, comuníquese con la mesa de ayuda convocatorias@scrd.gov.co");
                                        } else
                                        {
                                            notify("info", "ok", "Convocatorias:", "Se creo el perfil de participante con éxito.");

                                            //Activo en perfil de la convocatoria actual
                                            $(".tipo_participante_" + $("#id_tipo_participante").val()).attr('checked', true);
                                            $(".tipo_participante_" + $("#id_tipo_participante").val()).prop("checked", true);

                                            //Limpio el formulario
                                            $("#id_cp").attr('value', '');
                                            $("#id_tipo_participante").attr('value', '');
                                            CKEDITOR.instances.descripcion_cp.setData('');
                                            $("#tipo_participante_cp").html('');

                                            cargar_tabla_perfiles_participante(token_actual);
                                        }
                                    }
                                }
                            }

                        });
                    } else
                    {
                        notify("danger", "ok", "Convocatorias:", "No ha seleccionado ningun perfil del participante");
                    }
                }
            });

            //Verifico si tiene permisos para cambiar el estado de la convocatoria
            $("#estado").on('focus', function () {
                previous = this.value;
            }).on('change', function () {
                $.ajax({
                    type: 'POST',
                    data: {"token": token_actual.token, "estado": $(this).val()},
                    url: url_pv + 'Convocatorias/verificar_estado'
                }).done(function (data) {
                    if (data == 'error_metodo')
                    {
                        notify("danger", "ok", "Convocatorias:", "Se registro un error en el método, comuníquese con la mesa de ayuda convocatorias@scrd.gov.co");
                    } else
                    {
                        if (data == 'error_token')
                        {
                            //location.href = url_pv_admin + 'index.html?msg=Su sesión ha expirado, por favor vuelva a ingresar.&msg_tipo=danger';
                            notify("danger", "ok", "Convocatorias:", "Se registro un error con la sesión, comuníquese con la mesa de ayuda convocatorias@scrd.gov.co");
                        } else
                        {
                            //Verifico si tiene permiso de lo contratio lo devuelvo al estado actual
                            if (data == "null")
                            {
                                $("#estado").val(previous);
                                notify("danger", "ok", "Convocatorias:", "No cuenta con permisos para cambiar el estado de la convocatoria");
                            }
                        }
                    }
                });

            });

            //Cargar modalidades dependiendo el programa
            $('#programa').on('change', function () {
                var programa = $(this).val();

                $('#modalidad').find('option').remove();
                $.ajax({
                    type: 'GET',
                    data: {"token": token_actual.token, "programa": programa},
                    url: url_pv + 'Modalidades/select'
                }).done(function (data) {
                    if (data == 'error_metodo')
                    {
                        notify("danger", "ok", "Usuarios:", "Se registro un error en el método, comuníquese con la mesa de ayuda convocatorias@scrd.gov.co");
                    } else
                    {
                        if (data == 'error_token')
                        {
                            //location.href = url_pv_admin + 'index.html?msg=Su sesión ha expirado, por favor vuelva a ingresar.&msg_tipo=danger';
                            notify("danger", "ok", "Convocatorias:", "Se registro un error con la sesión, comuníquese con la mesa de ayuda convocatorias@scrd.gov.co");
                        } else
                        {
                            var json = JSON.parse(data);
                            $("#modalidad").append('<option value="">:: Seleccionar ::</option>');
                            if (json.length > 0) {
                                $.each(json, function (key, value) {
                                    $("#modalidad").append('<option value="' + value.id + '">' + value.nombre + '</option>');
                                });
                            }
                        }
                    }
                });

                $('#enfoque').find('option').remove();
                $.ajax({
                    type: 'GET',
                    data: {"token": token_actual.token, "programa": programa},
                    url: url_pv + 'Enfoques/selectconvocatorias'
                }).done(function (data) {
                    if (data == 'error_metodo')
                    {
                        notify("danger", "ok", "Usuarios:", "Se registro un error en el método, comuníquese con la mesa de ayuda convocatorias@scrd.gov.co");
                    } else
                    {
                        if (data == 'error_token')
                        {
                            //location.href = url_pv_admin + 'index.html?msg=Su sesión ha expirado, por favor vuelva a ingresar.&msg_tipo=danger';
                            notify("danger", "ok", "Convocatorias:", "Se registro un error con la sesión, comuníquese con la mesa de ayuda convocatorias@scrd.gov.co");
                        } else
                        {
                            var json = JSON.parse(data);
                            $("#enfoque").append('<option value="">:: Seleccionar ::</option>');
                            if (json.length > 0) {
                                $.each(json, function (key, value) {
                                    $("#enfoque").append('<option value="' + value.id + '">' + value.nombre + '</option>');
                                });
                            }
                        }
                    }
                });
            });

            //Verifico que la modalidad sea jurado
            $('#modalidad').on('change', function () {
                var modalidad = $(this).val();
                if (modalidad == 2)
                {
                    $('.modalidad_jurados').css("display", "none");
                } else
                {
                    $('.modalidad_jurados').css("display", "block");
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
                            //location.href = url_pv_admin + 'index.html?msg=Su sesión ha expirado, por favor vuelva a ingresar.&msg_tipo=danger';
                            notify("danger", "ok", "Convocatorias:", "Se registro un error con la sesión, comuníquese con la mesa de ayuda convocatorias@scrd.gov.co");
                        } else
                        {
                            var json = JSON.parse(data);
                            $("#upz").append('<option value="">:: Seleccionar ::</option>');
                            if (json.length > 0) {
                                $.each(json, function (key, value) {
                                    $("#upz").append('<option value="' + value.id + '">' + value.nombre + '</option>');
                                });
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
                            //location.href = url_pv_admin + 'index.html?msg=Su sesión ha expirado, por favor vuelva a ingresar.&msg_tipo=danger';
                            notify("danger", "ok", "Convocatorias:", "Se registro un error con la sesión, comuníquese con la mesa de ayuda convocatorias@scrd.gov.co");
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
                            //location.href = url_pv_admin + 'index.html?msg=Su sesión ha expirado, por favor vuelva a ingresar.&msg_tipo=danger';
                            notify("danger", "ok", "Convocatorias:", "Se registro un error con la sesión, comuníquese con la mesa de ayuda convocatorias@scrd.gov.co");
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

            //Verifico si es local
            $('#cobertura').on('change', function () {
                if ($(this).val() == 1)
                {
                    $(".class_descripcion_ejecucion").removeAttr("disabled");
                } else
                {
                    $(".class_descripcion_ejecucion").attr("disabled", "disabled");
                    $('#localidad').val("");
                    $('#upz').val("");
                    $('#barrio').val("");
                    $('#descripcion_ejecucion').val("");
                }
            });

            //valido si tiene categorias
            $("#tiene_categorias").on('change', function () {
                if ($(this).val() == "true")
                {
                    $(".tiene_categorias").removeAttr("disabled");
                } else
                {
                    $(".tiene_categorias").attr("disabled", "disabled");
                    $("#diferentes_categorias option[value='false']").prop('selected', true);
                    $("#mismos_jurados_categorias option[value='false']").prop('selected', true);
                }
            });

            //valido si tiene categorias
            $("#diferentes_categorias").on('change', function () {
                if ($(this).val() == "true")
                {
                    $(".diferentes_categorias_disable").attr("disabled", "disabled");
                    $(".diferentes_categorias_button").attr("disabled", "disabled");
                    $('.diferentes_categorias_none').css("display", "none");
                } else
                {
                    $(".diferentes_categorias_disable").removeAttr("disabled");
                    $(".diferentes_categorias_button").removeAttr("disabled");
                    $('.diferentes_categorias_none').css("display", "block");
                }
            });



            //Valido si tiene convenio
            $("#convenio").on('change', function () {
                if ($(this).val() == "true")
                {
                    $(".class_convenio").removeAttr("disabled");
                } else
                {
                    $(".class_convenio").attr("disabled", "disabled");
                    $('#tipo_convenio').val("");
                    $("input[name='convenio_instituciones']").val("");
                }
            });
            //Valido si tiene bolsa concursable                                    
            $('#tipo_estimulo').on('change', function () {
                if ($(this).val() == 2 || $(this).val() == 3)
                {
                    $(".class_tipo_estimulo").removeAttr("disabled");
                } else
                {
                    $(".class_tipo_estimulo").attr("disabled", "disabled");
                }

            });
            //Valido si tiene bolsa concursable
            $("#bolsa_concursable").on('change', function () {
                if ($(this).val() == "true")
                {
                    $(".class_bolsa_concursable").removeAttr("disabled");
                    $("input[name='numero_estimulos']").attr("disabled", "disabled");
                    $("input[name='numero_estimulos']").val("");
                } else
                {
                    $("input[name='numero_estimulos']").removeAttr("disabled");
                    $(".class_bolsa_concursable").attr("disabled", "disabled");
                }
            });

            //Realizo la peticion para cargar el formulario
            $.ajax({
                type: 'POST',
                data: {"token": token_actual.token, "id": $("#id").attr('value')},
                url: url_pv + 'Convocatorias/search/'
            }).done(function (data) {
                if (data == 'error_metodo')
                {
                    notify("danger", "ok", "Convocatorias:", "Se registro un error en el método, comuníquese con la mesa de ayuda convocatorias@scrd.gov.co");
                } else
                {
                    if (data == 'error_token')
                    {
                        //location.href = url_pv_admin + 'index.html?msg=Su sesión ha expirado, por favor vuelva a ingresar.&msg_tipo=danger';
                        notify("danger", "ok", "Convocatorias:", "Se registro un error con la sesión, comuníquese con la mesa de ayuda convocatorias@scrd.gov.co");
                    } else
                    {
                        var json = JSON.parse(data);

                        //Verifico si es cobertura local
                        if (json.convocatoria.cobertura == 1)
                        {
                            $(".class_descripcion_ejecucion").removeAttr("disabled");

                            //Cargos el select de localidades
                            $('#localidad').find('option').remove();
                            $("#localidad").append('<option value="">:: Seleccionar ::</option>');
                            if (json.localidades.length > 0) {
                                $.each(json.localidades, function (key, localidad) {
                                    var selected = '';
                                    if (localidad.id == json.convocatoria.localidad)
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
                                    if (upz.id == json.convocatoria.upz)
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
                                    if (barrio.id == json.convocatoria.barrio)
                                    {
                                        selected = 'selected="selected"';
                                    }
                                    $("#barrio").append('<option value="' + barrio.id + '" ' + selected + ' >' + barrio.nombre + '</option>');
                                });
                            }

                        }

                        //Cargos el select de localidades
                        $('#certifica').find('option').remove();
                        $("#certifica").append('<option value="">:: Seleccionar ::</option>');
                        if (json.certifica.length > 0) {
                            $.each(json.certifica, function (key, usuario) {
                                var selected = '';
                                if (usuario.id == json.convocatoria.certifica)
                                {
                                    selected = 'selected="selected"';
                                }
                                $("#certifica").append('<option value="' + usuario.id + '" ' + selected + ' >' + usuario.username + ' - ' + usuario.primer_nombre + ' ' + usuario.segundo_nombre + ' ' + usuario.primer_apellido + ' ' + usuario.segundo_apellido + '</option>');
                            });
                        }

                        //Cargo el select de programas
                        $('#programa').find('option').remove();
                        $("#programa").append('<option value="">:: Seleccionar ::</option>');
                        if (json.programas.length > 0) {
                            $.each(json.programas, function (key, programa) {
                                var selected = '';
                                if (programa.id == json.convocatoria.programa)
                                {
                                    selected = 'selected="selected"';
                                }
                                $("#programa").append('<option value="' + programa.id + '" ' + selected + ' >' + programa.nombre + '</option>');
                            });
                        }
                        //Cargo los checks de quienes pueden participar
                        $('#quienes_pueden_participar').html("<label>¿Quién puede participar?</label><br/>");
                        if (json.tipos_participantes.length > 0) {
                            $.each(json.tipos_participantes, function (key, tipo_participante) {
                                var checked = '';
                                if (tipo_participante.active == true)
                                {
                                    checked = 'checked="checked"';
                                }

                                $("#quienes_pueden_participar").append('<label class="checkbox-inline"><input class="tipo_participante tipo_participante_' + tipo_participante.id + '" value="' + tipo_participante.id + '" type="checkbox" ' + checked + '>' + tipo_participante.nombre + '</label>');

                                if (tipo_participante.descripcion == null)
                                {
                                    tipo_participante.descripcion = '';
                                }

                                //Esta condicion es para que no muestre los perfiles en la tabla, con el fin de que l unico ingreso sea desde los check
                                if (tipo_participante.active != null) {
                                    if (tipo_participante.active == true) {
                                        $("#tbody_tipos_participantes").append('<tr><td>' + tipo_participante.nombre + '</td><td><button type="button" class="btn btn-warning btn-update-convocatoria-participante" lang="' + tipo_participante.id_cp + '" title="' + tipo_participante.id + '" dir="' + tipo_participante.nombre + '"><span class="glyphicon glyphicon-edit"></span></button></td></tr>');
                                    }
                                }

                            });
                        }

                        //Cargo los perfiles de los jurados en esta convocatoria
                        if (json.perfiles_jurados.length > 0) {
                            $.each(json.perfiles_jurados, function (key, perfil_jurado) {
                                var checked = '';
                                if (perfil_jurado.active == true)
                                {
                                    checked = "checked='checked'";
                                }
                                $("#tbody_perfiles_jurados").append('<tr><td>' + perfil_jurado.orden + '</td><td>' + perfil_jurado.descripcion_perfil + '</td><td><input onclick="activar_perfil_jurado(' + perfil_jurado.id + ',' + $("#id").attr('value') + ',\'' + token_actual.token + '\')" type="checkbox" ' + checked + '></td><td><button type="button" class="btn btn-warning btn-update-convocatoria-jurados-' + perfil_jurado.id + '" onclick="cargar_perfil_jurado(' + perfil_jurado.id + ')" lang="' + JSON.stringify(perfil_jurado).replace(/\"/g, "&quot;") + '" title="Editar perfil de jurado"><span class="glyphicon glyphicon-edit"></span></button></td></tr>');
                            });
                        }

                        //Cargo los la distribucion de bolsas
                        if (json.distribuciones_bolsas.length > 0) {
                            $.each(json.distribuciones_bolsas, function (key, distribucion_bolsa) {
                                var checked = '';
                                if (distribucion_bolsa.active == true)
                                {
                                    checked = "checked='checked'";
                                }
                                $("#tbody_distribuciones_bolsas").append('<tr><td>' + distribucion_bolsa.orden + '</td><td>' + distribucion_bolsa.valor_recurso + '</td><td><input onclick="activar_registro(' + distribucion_bolsa.id + ',\'' + token_actual.token + '\')" type="checkbox" ' + checked + '></td><td><button type="button" class="btn btn-warning btn-update-distribucion-registro-' + distribucion_bolsa.id + '" onclick="cargar_registro(' + distribucion_bolsa.id + ',\'form_validator_bolsa\')" lang="' + JSON.stringify(distribucion_bolsa).replace(/\"/g, "&quot;") + '"><span class="glyphicon glyphicon-edit"></span></button></td></tr>');
                            });
                        }

                        //Cargo los la distribucion de especies
                        if (json.distribuciones_especies.length > 0) {
                            $.each(json.distribuciones_especies, function (key, distribucion_especie) {
                                var checked = '';
                                if (distribucion_especie.active == true)
                                {
                                    checked = "checked='checked'";
                                }
                                $("#tbody_distribuciones_especie").append('<tr><td>' + distribucion_especie.orden + '</td><td>' + distribucion_especie.nombre_recurso_no_pecuniario + '</td><td>' + distribucion_especie.valor_recurso + '</td><td><input onclick="activar_registro(' + distribucion_especie.id + ',\'' + token_actual.token + '\')" type="checkbox" ' + checked + '></td><td><button type="button" class="btn btn-warning btn-update-distribucion-registro-' + distribucion_especie.id + '" onclick="cargar_registro(' + distribucion_especie.id + ',\'form_validator_especie\')" lang="' + JSON.stringify(distribucion_especie).replace(/\"/g, "&quot;") + '"><span class="glyphicon glyphicon-edit"></span></button></td></tr>');
                            });
                        }

                        //para habilitar formulario de convocatoria participante
                        $(".btn-update-convocatoria-participante").click(function () {
                            $("#id_cp").val($(this).attr("lang"));
                            $("#id_tipo_participante").val($(this).attr("title"));
                            $("#tipo_participante_cp").html($(this).attr("dir"));

                            //Se carga el contenido html debido a que estaba presentando problemas al cargarlo desde una propiedad html
                            $.ajax({
                                type: 'POST',
                                data: {"token": token_actual.token},
                                url: url_pv + 'Convocatoriasparticipantes/search/' + $(this).attr("lang")
                            }).done(function (data) {
                                if (data == 'error_metodo')
                                {
                                    notify("danger", "ok", "Usuarios:", "Se registro un error en el método, comuníquese con la mesa de ayuda convocatorias@scrd.gov.co");
                                } else
                                {
                                    if (data == 'error_token')
                                    {
                                        //location.href = url_pv_admin + 'index.html?msg=Su sesión ha expirado, por favor vuelva a ingresar.&msg_tipo=danger';
                                        notify("danger", "ok", "Convocatorias:", "Se registro un error con la sesión, comuníquese con la mesa de ayuda convocatorias@scrd.gov.co");
                                    } else
                                    {
                                        if (data == 'error')
                                        {
                                            notify("danger", "ok", "Usuarios:", "Se registro un error en el método, comuníquese con la mesa de ayuda convocatorias@scrd.gov.co");
                                        } else
                                        {
                                            var json = JSON.parse(data);
                                            CKEDITOR.instances.descripcion_cp.setData(json.descripcion_perfil);
                                        }
                                    }
                                }
                            });
                        });

                        //Creamos los participantes en la convocatoria
                        $('.tipo_participante').click(function () {
                            if ($(this).prop('checked')) {
                                //Se realiza la peticion con el fin de guardar el registro de la convocatoria participante
                                $.ajax({
                                    type: 'POST',
                                    url: url_pv + 'Convocatoriasparticipantes/new/',
                                    data: "convocatoria=" + $("#id").val() + "&tipo_participante=" + $(this).val() + "&modulo=SICON-CONVOCATORIAS-CONFIGURACION&token=" + token_actual.token
                                }).done(function (result) {

                                    if (result == 'error')
                                    {
                                        notify("danger", "ok", "Convocatorias:", "Se registro un error, comuníquese con la mesa de ayuda convocatorias@scrd.gov.co");
                                    } else
                                    {
                                        if (result == 'error_token')
                                        {
                                            //location.href = url_pv_admin + 'index.html?msg=Su sesión ha expirado, por favor vuelva a ingresar.&msg_tipo=danger';
                                            notify("danger", "ok", "Convocatorias:", "Se registro un error con la sesión, comuníquese con la mesa de ayuda convocatorias@scrd.gov.co");
                                        } else
                                        {
                                            if (result == 'acceso_denegado')
                                            {
                                                notify("danger", "remove", "Convocatorias:", "No tiene permisos para editar información.");
                                            } else
                                            {
                                                if (isNaN(result)) {
                                                    notify("danger", "ok", "Convocatorias:", "Se registro un error, comuníquese con la mesa de ayuda convocatorias@scrd.gov.co");
                                                } else
                                                {
                                                    notify("success", "ok", "Convocatorias:", "Se creó el perfil del participante con éxito.");
                                                    cargar_tabla_perfiles_participante(token_actual)
                                                }
                                            }
                                        }
                                    }

                                });
                            } else
                            {
                                //Se realiza la peticion para desactivar la convocatoria participante
                                $.ajax({
                                    type: 'DELETE',
                                    data: {"token": token_actual.token, "modulo": "SICON-CONVOCATORIAS-CONFIGURACION", "convocatoria": $("#id").val(), "tipo_participante": $(this).val()},
                                    url: url_pv + 'Convocatoriasparticipantes/delete'
                                }).done(function (data) {
                                    if (data == 'error_token')
                                    {
                                        //location.href = url_pv_admin + 'index.html?msg=Su sesión ha expirado, por favor vuelva a ingresar.&msg_tipo=danger';
                                        notify("danger", "ok", "Convocatorias:", "Se registro un error con la sesión, comuníquese con la mesa de ayuda convocatorias@scrd.gov.co");
                                    } else
                                    {
                                        if (data == 'Si' || data == 'No')
                                        {
                                            if (data == 'Si')
                                            {
                                                notify("info", "ok", "Convocatorias:", "Se activó el perfil del participante con éxito.");
                                            } else
                                            {
                                                notify("info", "ok", "Convocatorias:", "Se eliminó el perfil del participante con éxito.");
                                            }

                                            cargar_tabla_perfiles_participante(token_actual)
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
                                    }
                                });
                            }
                        });

                        //Cargo el select de modalidades
                        $('#modalidad').find('option').remove();
                        $("#modalidad").append('<option value="">:: Seleccionar ::</option>');
                        if (json.modalidades.length > 0) {
                            $.each(json.modalidades, function (key, modalidad) {
                                var selected = '';
                                if (modalidad.id == json.convocatoria.modalidad)
                                {
                                    selected = 'selected="selected"';
                                }
                                $("#modalidad").append('<option value="' + modalidad.id + '" ' + selected + ' >' + modalidad.nombre + '</option>');
                            });
                        }
                        //Cargo el select de coberturas
                        $('#cobertura').find('option').remove();
                        $("#cobertura").append('<option value="">:: Seleccionar ::</option>');
                        if (json.coberturas.length > 0) {
                            $.each(json.coberturas, function (key, cobertura) {
                                var selected = '';
                                if (cobertura.id == json.convocatoria.cobertura)
                                {
                                    selected = 'selected="selected"';
                                }
                                $("#cobertura").append('<option value="' + cobertura.id + '" ' + selected + ' >' + cobertura.nombre + '</option>');
                            });
                        }

                        //Cargo el select de localidades
                        $('#localidad').find('option').remove();
                        $("#localidad").append('<option value="">:: Seleccionar ::</option>');
                        if (json.localidades.length > 0) {
                            $.each(json.localidades, function (key, localidad) {
                                var selected = '';
                                if (localidad.id == json.convocatoria.localidad)
                                {
                                    selected = 'selected="selected"';
                                }
                                $("#localidad").append('<option value="' + localidad.id + '" ' + selected + ' >' + localidad.nombre + '</option>');
                            });
                        }

                        //Cargo el select de enfoques
                        $('#enfoque').find('option').remove();
                        $("#enfoque").append('<option value="">:: Seleccionar ::</option>');
                        if (json.enfoques.length > 0) {
                            $.each(json.enfoques, function (key, enfoque) {
                                var selected = '';
                                if (enfoque.id == json.convocatoria.enfoque)
                                {
                                    selected = 'selected="selected"';
                                }
                                $("#enfoque").append('<option value="' + enfoque.id + '" ' + selected + ' >' + enfoque.nombre + '</option>');
                            });
                        }

                        //Cargo el select de los recursos no pecuniarios
                        $('#recurso_no_pecuniario').find('option').remove();
                        $("#recurso_no_pecuniario").append('<option value="">:: Seleccionar ::</option>');
                        if (json.recursos_no_pecunarios.length > 0) {
                            $.each(json.recursos_no_pecunarios, function (key, recurso_no_pecuniario) {
                                $("#recurso_no_pecuniario").append('<option value="' + recurso_no_pecuniario.id + '" >' + recurso_no_pecuniario.nombre + '</option>');
                            });
                        }

                        //Cargo el select de lineas estrategicas
                        $('#linea_estrategica').find('option').remove();
                        $("#linea_estrategica").append('<option value="">:: Seleccionar ::</option>');
                        if (json.lineas_estrategicas.length > 0) {
                            $.each(json.lineas_estrategicas, function (key, linea_estrategica) {
                                var selected = '';
                                if (linea_estrategica.id == json.convocatoria.linea_estrategica)
                                {
                                    selected = 'selected="selected"';
                                }
                                $("#linea_estrategica").append('<option value="' + linea_estrategica.id + '" ' + selected + ' >' + linea_estrategica.nombre + '</option>');
                            });
                        }
                        //Cargo el select de areas
                        $('#area').find('option').remove();
                        $("#area").append('<option value="">:: Seleccionar ::</option>');
                        if (json.areas.length > 0) {
                            $.each(json.areas, function (key, area) {
                                var selected = '';
                                if (area.id == json.convocatoria.area)
                                {
                                    selected = 'selected="selected"';
                                }
                                $("#area").append('<option value="' + area.id + '" ' + selected + ' >' + area.nombre + '</option>');
                                $("#area_perfil").append('<option value="' + area.nombre + '" >' + area.nombre + '</option>');
                            });
                        }
                        //Cargo el select de cantidad de jurados
                        $('#cantidad_perfil_jurado').find('option').remove();
                        $("#cantidad_perfil_jurado").append('<option value="">:: Seleccionar ::</option>');
                        if (json.cantidad_perfil_jurados.length > 0) {
                            $.each(json.cantidad_perfil_jurados, function (key, cantidad_perfil_jurado) {
                                var selected = '';
                                if (cantidad_perfil_jurado == json.convocatoria.cantidad_perfil_jurado)
                                {
                                    selected = 'selected="selected"';
                                }
                                $("#cantidad_perfil_jurado").append('<option value="' + cantidad_perfil_jurado + '" ' + selected + ' >' + cantidad_perfil_jurado + '</option>');
                                $("#orden_perfil_jurado").append('<option value="' + cantidad_perfil_jurado + '" >' + cantidad_perfil_jurado + '</option>');
                            });
                        }
                        //Cargo el select de tipos de convenios
                        $('#tipo_convenio').find('option').remove();
                        $("#tipo_convenio").append('<option value="">:: Seleccionar ::</option>');
                        if (json.tipos_convenios.length > 0) {
                            $.each(json.tipos_convenios, function (key, tipo_convenio) {
                                var selected = '';
                                if (tipo_convenio.id == json.convocatoria.tipo_convenio)
                                {
                                    selected = 'selected="selected"';
                                }
                                $("#tipo_convenio").append('<option value="' + tipo_convenio.id + '" ' + selected + ' >' + tipo_convenio.nombre + '</option>');
                            });
                        }

                        //Cargo el select de tipos de estimulos
                        $('#tipo_estimulo').find('option').remove();
                        $("#tipo_estimulo").append('<option value="">:: Seleccionar ::</option>');
                        if (json.tipos_estimulos.length > 0) {
                            $.each(json.tipos_estimulos, function (key, tipo_estimulo) {
                                var selected = '';
                                if (tipo_estimulo.id == json.convocatoria.tipo_estimulo)
                                {
                                    selected = 'selected="selected"';
                                }
                                $("#tipo_estimulo").append('<option value="' + tipo_estimulo.id + '" ' + selected + ' >' + tipo_estimulo.nombre + '</option>');
                            });
                        }

                        //Habilito los modales dependiendo del tipo de estimulo
                        if ($("#tipo_estimulo").val() == 2 || $("#tipo_estimulo").val() == 3)
                        {
                            $(".class_tipo_estimulo").removeAttr("disabled");
                        } else
                        {
                            $(".class_tipo_estimulo").attr("disabled", "disabled");
                        }

                        //Habilito los modales dependiendo del tipo de estimulo
                        if ($("#tipo_estimulo").val() == 2)
                        {
                            $(".class_bolsa_concursable").attr("disabled", "disabled");
                        } else
                        {
                            $(".class_bolsa_concursable").removeAttr("disabled");
                        }

                        //Cargo el select de entidades
                        $('#entidad').find('option').remove();
                        $("#entidad").append('<option value="">:: Seleccionar ::</option>');
                        if (json.entidades.length > 0) {
                            $.each(json.entidades, function (key, entidad) {
                                var selected = '';
                                if (entidad.id == json.convocatoria.entidad)
                                {
                                    selected = 'selected="selected"';
                                }
                                $("#entidad").append('<option value="' + entidad.id + '" ' + selected + ' >' + entidad.nombre + '</option>');
                            });
                        }

                        //Cargo el select de areas de conocimientos
                        $('#area_conocimiento').find('option').remove();
                        if (json.areas_conocimientos.length > 0) {
                            $.each(json.areas_conocimientos, function (key, area_conocimiento) {
                                $("#area_conocimiento").append('<option value="' + area_conocimiento.nombre + '" >' + area_conocimiento.nombre + '</option>');
                            });
                        }

                        //Cargo el select de niveles educativos
                        $('#nivel_educativo').find('option').remove();
                        if (json.niveles_educativos.length > 0) {
                            $.each(json.niveles_educativos, function (key, nivel_educativo) {
                                $("#nivel_educativo").append('<option value="' + nivel_educativo.nombre + '" >' + nivel_educativo.nombre + '</option>');
                            });
                        }

                        //Cargo el select de entidades
                        $('#estado').find('option').remove();
                        $("#estado").append('<option value="">:: Seleccionar ::</option>');
                        if (json.estados.length > 0) {
                            $.each(json.estados, function (key, estado) {
                                var selected = '';
                                if (estado.id == json.convocatoria.estado)
                                {
                                    selected = 'selected="selected"';
                                }
                                $("#estado").append('<option value="' + estado.id + '" ' + selected + ' >' + estado.nombre + '</option>');
                            });
                        }

                        //Cargo el select de anios
                        $('#anio').find('option').remove();
                        $("#anio").append('<option value="">:: Seleccionar ::</option>');
                        if (json.anios.length > 0) {
                            $.each(json.anios, function (key, anio) {
                                $("#anio").append('<option value="' + anio + '"  >' + anio + '</option>');
                            });
                        }

                        $('#form_validator').loadJSON(json.convocatoria);

                        //Se realiza este set debido a que los boolean no lo toma con load json
                        $("#seudonimo option[value='" + json.convocatoria.seudonimo + "']").prop('selected', true);
                        $("#tiene_categorias option[value='" + json.convocatoria.tiene_categorias + "']").prop('selected', true);
                        if ($("#tiene_categorias").val() == "true")
                        {
                            $(".tiene_categorias").removeAttr("disabled");
                        } else
                        {
                            $(".tiene_categorias").attr("disabled", "disabled");
                        }
                        $("#diferentes_categorias option[value='" + json.convocatoria.diferentes_categorias + "']").prop('selected', true);
                        $("#mismos_jurados_categorias option[value='" + json.convocatoria.mismos_jurados_categorias + "']").prop('selected', true);
                        $("#seguimiento option[value='" + json.convocatoria.seguimiento + "']").prop('selected', true);
                        $("#convenio option[value='" + json.convocatoria.convenio + "']").prop('selected', true);
                        $("#cronograma option[value='" + json.convocatoria.cronograma + "']").prop('selected', true);
                        $("#presupuesto option[value='" + json.convocatoria.presupuesto + "']").prop('selected', true);
                        $("#cerrada option[value='" + json.convocatoria.cerrada + "']").prop('selected', true);

                        if ($("#convenio").val() == "true")
                        {
                            $(".class_convenio").removeAttr("disabled");
                        } else
                        {
                            $(".class_convenio").attr("disabled", "disabled");
                            $('#tipo_convenio').val("");
                            $("input[name='convenio_instituciones']").val("");
                        }
                        $("#bolsa_concursable option[value='" + json.convocatoria.bolsa_concursable + "']").prop('selected', true);
                        //Verifico si es bolsa concursable
                        if ($("#bolsa_concursable").val() == "true")
                        {
                            $(".class_bolsa_concursable").removeAttr("disabled");
                            $("input[name='numero_estimulos']").attr("disabled", "disabled");
                            $("input[name='numero_estimulos']").val("");
                        } else
                        {
                            $(".class_bolsa_concursable").attr("disabled", "disabled");
                            $("input[name='numero_estimulos']").removeAttr("disabled");
                        }

                        //Funcionalidad para habilitar solo campos para convocatoria especifica
                        if (json.convocatoria.diferentes_categorias == true)
                        {
                            $(".diferentes_categorias_disable").attr("disabled", "disabled");
                            $(".diferentes_categorias_button").attr("disabled", "disabled");
                            $('.diferentes_categorias_none').css("display", "none");
                        } else
                        {
                            $(".diferentes_categorias_disable").removeAttr("disabled");
                            $(".diferentes_categorias_button").removeAttr("disabled");
                            $('.diferentes_categorias_none').css("display", "block");
                        }

                        //Valido si la modalidad es de jurados
                        if (json.convocatoria.modalidad == 2)
                        {
                            $('.modalidad_jurados').css("display", "none");
                        } else
                        {
                            $('.modalidad_jurados').css("display", "block");
                        }

                        //Si la convocatoria fue publicada o cancelada o suspendida
                        if (json.convocatoria.estado == 5 || json.convocatoria.estado == 32 || json.convocatoria.estado == 43 || json.convocatoria.estado == 45 || json.convocatoria.estado == 6) {
                            $("#form_validator input,select,button[type=submit],textarea").attr("disabled", "disabled");
                            $(".class_bolsa_concursable").attr("disabled", "disabled");
                            $(".diferentes_categorias_button").attr("disabled", "disabled");
                            $(".modalidad_jurados").attr("disabled", "disabled");

                            if (json.convocatoria.diferentes_categorias == false)
                            {
                                $("#btn-perfile-jurados").removeAttr("disabled");
                                $(".validar_jurado").removeAttr("disabled");
                            }

                        }

                        //Se realiza este set en cada text area html debido a que jste no es compatible con load json
                        /*
                         CKEDITOR.instances.descripcion.setData(json.convocatoria.descripcion);
                         CKEDITOR.instances.justificacion.setData(json.convocatoria.justificacion);
                         CKEDITOR.instances.objeto.setData(json.convocatoria.objeto);
                         CKEDITOR.instances.no_pueden_participar.setData(json.convocatoria.no_pueden_participar);
                         CKEDITOR.instances.derechos_ganadores.setData(json.convocatoria.derechos_ganadores);
                         CKEDITOR.instances.deberes_ganadores.setData(json.convocatoria.deberes_ganadores);
                         */


                    }
                }
            });

            validator_form(token_actual);
        }
    }
});

//Funcion para activar o desactivar los recursos del estimulo
function activar_registro(id, token_actual) {
    $.ajax({
        type: 'DELETE',
        data: {"token": token_actual, "modulo": "SICON-CONVOCATORIAS-CONFIGURACION"},
        url: url_pv + 'Convocatoriasrecursos/delete/' + id
    }).done(function (data) {
        if (data == 'error_token')
        {
            //location.href = url_pv_admin + 'index.html?msg=Su sesión ha expirado, por favor vuelva a ingresar.&msg_tipo=danger';
            notify("danger", "ok", "Convocatorias:", "Se registro un error con la sesión, comuníquese con la mesa de ayuda convocatorias@scrd.gov.co");
        } else
        {
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
        }
    });
}

//Funcion para activar o desactivar el perfil de los jurados
function activar_perfil_jurado(id, convocatoria, token_actual) {
    //Se realiza la peticion para desactivar la convocatoria participante
    $.ajax({
        type: 'DELETE',
        data: {"token": token_actual, "modulo": "SICON-CONVOCATORIAS-CONFIGURACION", "convocatoria": convocatoria},
        url: url_pv + 'Convocatoriasparticipantes/delete_perfil_jurado/' + id
    }).done(function (data) {
        if (data == 'error_token')
        {
           //location.href = url_pv_admin + 'index.html?msg=Su sesión ha expirado, por favor vuelva a ingresar.&msg_tipo=danger';
           notify("danger", "ok", "Convocatorias:", "Se registro un error con la sesión, comuníquese con la mesa de ayuda convocatorias@scrd.gov.co");
        } else
        {
            if (data == 'Si' || data == 'No')
            {
                if (data == 'Si')
                {
                    notify("info", "ok", "Convocatorias:", "Se activó el perfil del jurado con éxito.");
                } else
                {
                    notify("info", "ok", "Convocatorias:", "Se eliminó el perfil del jurado con éxito.");
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
        }
    });
}

//Carga la tabla de los perfiles de los jurados
function cargar_tabla_perfiles_jurado(token_actual) {
    
    $.ajax({
        type: 'POST',
        data: {"token": token_actual.token, "convocatoria": $("#id").val(), "tipo_participante": 4,modulo: "SICON-CONVOCATORIAS-CONFIGURACION"},
        url: url_pv + 'Convocatoriasparticipantes/select'
    }).done(function (data) {
        if (data == 'error_metodo')
        {
            notify("danger", "ok", "Usuarios:", "Se registro un error en el método, comuníquese con la mesa de ayuda convocatorias@scrd.gov.co");
        } else
        {
            if (data == 'error_token')
            {
                //location.href = url_pv_admin + 'index.html?msg=Su sesión ha expirado, por favor vuelva a ingresar.&msg_tipo=danger';
                notify("danger", "ok", "Convocatorias:", "Se registro un error con la sesión, comuníquese con la mesa de ayuda convocatorias@scrd.gov.co");
            } else
            {
                var json = JSON.parse(data);
                if (json.length > 0) {
                    $("#tbody_perfiles_jurados").find("tr").remove();
                    $.each(json, function (key, perfil_jurado) {
                        var checked = '';
                        if (perfil_jurado.active == true)
                        {
                            checked = "checked='checked'";
                        }
                        $("#tbody_perfiles_jurados").append('<tr><td>' + perfil_jurado.orden + '</td><td>' + perfil_jurado.descripcion_perfil + '</td><td><input onclick="activar_perfil_jurado(' + perfil_jurado.id + ',' + $("#id").attr('value') + ',\'' + token_actual.token + '\')" type="checkbox" ' + checked + '></td><td><button type="button" class="btn btn-warning btn-update-convocatoria-jurados-' + perfil_jurado.id + '" onclick="cargar_perfil_jurado(' + perfil_jurado.id + ')" lang="' + JSON.stringify(perfil_jurado).replace(/\"/g, "&quot;") + '"><span class="glyphicon glyphicon-edit"></span></button></td></tr>');
                    });
                }
            }
        }
    });
}

//Carga la tabla de los recursos de la convocatoria
function cargar_tabla_registros(token_actual, tbody, tipo_recurso) {
    $.ajax({
        type: 'POST',
        data: {"token": token_actual.token, "convocatoria": $("#id").val(), "tipo_recurso": tipo_recurso},
        url: url_pv + 'Convocatoriasrecursos/select_convocatoria'
    }).done(function (data) {
        if (data == 'error_metodo')
        {
            notify("danger", "ok", "Usuarios:", "Se registro un error en el método, comuníquese con la mesa de ayuda convocatorias@scrd.gov.co");
        } else
        {
            if (data == 'error_token')
            {
                //location.href = url_pv_admin + 'index.html?msg=Su sesión ha expirado, por favor vuelva a ingresar.&msg_tipo=danger';
                notify("danger", "ok", "Convocatorias:", "Se registro un error con la sesión, comuníquese con la mesa de ayuda convocatorias@scrd.gov.co");
            } else
            {
                var json = JSON.parse(data);
                if (json.length > 0) {
                    $("#" + tbody).find("tr").remove();
                    $.each(json, function (key, distribucion_bolsa) {
                        var checked = '';
                        
                        if (distribucion_bolsa.active == true)
                        {
                            checked = "checked='checked'";
                        }

                        if (tipo_recurso == "Bolsa")
                        {

                            $("#" + tbody).append('<tr><td>' + distribucion_bolsa.orden + '</td><td>' + distribucion_bolsa.valor_recurso + '</td><td><input onclick="activar_registro(' + distribucion_bolsa.id + ',\'' + token_actual.token + '\')" type="checkbox" ' + checked + '></td><td><button type="button" class="btn btn-warning btn-update-distribucion-registro-' + distribucion_bolsa.id + '" onclick="cargar_registro(' + distribucion_bolsa.id + ',\'form_validator_bolsa\')" lang="' + JSON.stringify(distribucion_bolsa).replace(/\"/g, "&quot;") + '"><span class="glyphicon glyphicon-edit"></span></button></td></tr>');
                        } else
                        {
                            $("#" + tbody).append('<tr><td>' + distribucion_bolsa.orden + '</td><td>' + distribucion_bolsa.nombre_recurso_no_pecuniario + '</td><td>' + distribucion_bolsa.valor_recurso + '</td><td><input onclick="activar_registro(' + distribucion_bolsa.id + ',\'' + token_actual.token + '\')" type="checkbox" ' + checked + '></td><td><button type="button" class="btn btn-warning btn-update-distribucion-registro-' + distribucion_bolsa.id + '" onclick="cargar_registro(' + distribucion_bolsa.id + ',\'form_validator_especie\')" lang="' + JSON.stringify(distribucion_bolsa).replace(/\"/g, "&quot;") + '"><span class="glyphicon glyphicon-edit"></span></button></td></tr>');
                        }


                    });
                }
            }
        }
    });
}

//Carga la tabla de los perfiles de los participantes
function cargar_tabla_perfiles_participante(token_actual) {
    $.ajax({
        type: 'POST',
        data: {"token": token_actual.token, "convocatoria": $("#id").val()},
        url: url_pv + 'Convocatoriasparticipantes/select_form_convocatoria'
    }).done(function (data) {
        if (data == 'error_metodo')
        {
            notify("danger", "ok", "Usuarios:", "Se registro un error en el método, comuníquese con la mesa de ayuda convocatorias@scrd.gov.co");
        } else
        {
            if (data == 'error_token')
            {
                //location.href = url_pv_admin + 'index.html?msg=Su sesión ha expirado, por favor vuelva a ingresar.&msg_tipo=danger';
                notify("danger", "ok", "Convocatorias:", "Se registro un error con la sesión, comuníquese con la mesa de ayuda convocatorias@scrd.gov.co");
            } else
            {
                var json = JSON.parse(data);
                if (json.length > 0) {
                    $("#tbody_tipos_participantes").find("tr").remove();
                    $.each(json, function (key, tipo_participante) {
                        var checked = '';
                        if (tipo_participante.active == true)
                        {
                            checked = "checked='checked'";
                        }

                        //Esta condicion es para que no muestre los perfiles en la tabla, con el fin de que l unico ingreso sea desde los check
                        if (tipo_participante.active != null) {
                            if (tipo_participante.active == true) {
                                $("#tbody_tipos_participantes").append('<tr><td>' + tipo_participante.nombre + '</td><td><button type="button" class="btn btn-warning btn-update-convocatoria-participante" lang="' + tipo_participante.id_cp + '" title="' + tipo_participante.id + '" dir="' + tipo_participante.nombre + '"><span class="glyphicon glyphicon-edit"></span></button></td></tr>');
                            }
                        }
                    });

                    //para habilitar formulario de convocatoria participante
                    $(".btn-update-convocatoria-participante").click(function () {
                        $("#id_cp").val($(this).attr("lang"));
                        $("#id_tipo_participante").val($(this).attr("title"));
                        $("#tipo_participante_cp").html($(this).attr("dir"));

                        //Se carga el contenido html debido a que estaba presentando problemas al cargarlo desde una propiedad html
                        $.ajax({
                            type: 'POST',
                            data: {"token": token_actual.token},
                            url: url_pv + 'Convocatoriasparticipantes/search/' + $(this).attr("lang")
                        }).done(function (data) {
                            if (data == 'error_metodo')
                            {
                                notify("danger", "ok", "Usuarios:", "Se registro un error en el método, comuníquese con la mesa de ayuda convocatorias@scrd.gov.co");
                            } else
                            {
                                if (data == 'error_token')
                                {
                                    //location.href = url_pv_admin + 'index.html?msg=Su sesión ha expirado, por favor vuelva a ingresar.&msg_tipo=danger';
                                    notify("danger", "ok", "Convocatorias:", "Se registro un error con la sesión, comuníquese con la mesa de ayuda convocatorias@scrd.gov.co");
                                } else
                                {
                                    if (data == 'error')
                                    {
                                        notify("danger", "ok", "Usuarios:", "Se registro un error en el método, comuníquese con la mesa de ayuda convocatorias@scrd.gov.co");
                                    } else
                                    {
                                        var json = JSON.parse(data);
                                        CKEDITOR.instances.descripcion_cp.setData(json.descripcion_perfil);
                                    }
                                }
                            }
                        });

                    });
                }
            }
        }
    });
}

//Carga el registro del perfil del jurado sobre el formulario
function cargar_perfil_jurado(id) {
    var json_update = JSON.parse($(".btn-update-convocatoria-jurados-" + id).attr("lang"));
    $("#formacion_profesional option[value='" + json_update.formacion_profesional + "']").prop('selected', true);
    $("#formacion_postgrado option[value='" + json_update.formacion_postgrado + "']").prop('selected', true);
    $("#reside_bogota option[value='" + json_update.reside_bogota + "']").prop('selected', true);
    $("#orden_perfil_jurado option[value='" + json_update.orden + "']").prop('selected', true);

    $("#area_conocimiento option:selected").removeAttr("selected");
    $("#area_conocimiento option:selected").prop("selected", false);
    $.each(JSON.parse(json_update.area_conocimiento), function (i, e) {
        $("#area_conocimiento option[value='" + e + "']").prop("selected", true);
    });

    $("#area_perfil option:selected").removeAttr("selected");
    $("#area_perfil option:selected").prop("selected", false);
    $.each(JSON.parse(json_update.area_perfil), function (i, e) {
        $("#area_perfil option[value='" + e + "']").prop("selected", true);
    });

    $("#nivel_educativo option:selected").removeAttr("selected");
    $("#nivel_educativo option:selected").prop("selected", false);
    $.each(JSON.parse(json_update.nivel_educativo), function (i, e) {
        $("#nivel_educativo option[value='" + e + "']").prop("selected", true);
    });

    $("#descripcion_perfil").val(json_update.descripcion_perfil);
    $("#campo_experiencia").val(json_update.campo_experiencia);
    $("#id_cpj").val(json_update.id);
}

//Carga el registro el registro del recurso de la convocatoria
function cargar_registro(id, form) {
    var json_update = JSON.parse($(".btn-update-distribucion-registro-" + id).attr("lang"));
    $('#' + form).loadJSON(json_update);
}

function validator_form(token_actual) {
    //Validar el formulario principal
    $('.form_validator').bootstrapValidator({
        feedbackIcons: {
            valid: 'glyphicon glyphicon-ok',
            invalid: 'glyphicon glyphicon-remove',
            validating: 'glyphicon glyphicon-refresh'
        },
        fields: {
            entidad: {
                validators: {
                    notEmpty: {message: 'La entidad es requerida'}
                }
            },
            programa: {
                validators: {
                    notEmpty: {message: 'El tipo de programa es requerido'}
                }
            },
            anio: {
                validators: {
                    notEmpty: {message: 'El año es requerido'}
                }
            },
            nombre: {
                validators: {
                    notEmpty: {message: 'El nombre de la convocatoria es requerido'}
                }
            },
            modalidad: {
                validators: {
                    notEmpty: {message: 'La modalidad es requerida'}
                }
            },
            cobertura: {
                validators: {
                    notEmpty: {message: 'La cobertura es requerida'}
                }
            },
            enfoque: {
                validators: {
                    notEmpty: {message: 'El enfoque es requerido'}
                }
            },
            linea_estrategica: {
                validators: {
                    notEmpty: {message: 'La línea estratégica es requerida'}
                }
            },
            area: {
                validators: {
                    notEmpty: {message: 'El área es requerida'}
                }
            },
            cantidad_perfil_jurado: {
                validators: {
                    notEmpty: {message: 'La pregunta ¿Cuántos perfiles de jurado requiere? es requerida'}
                }
            },
            tipo_estimulo: {
                validators: {
                    notEmpty: {message: 'El tipo de estímulo es requerido'}
                }
            },
            valor_total_estimulos: {
                validators: {
                    notEmpty: {message: 'El valor total de recursos que entregará la convocatoria es requerido'},
                    numeric: {message: 'Debe ingresar solo numeros'}
                }
            },
            numero_estimulos: {
                validators: {
                    numeric: {message: 'Debe ingresar solo numeros'}
                }
            },
            correo_misional: {
                validators: {
                    notEmpty: {message: 'Debe el ingresar el correo electrónico institucional del funcionario misional'}
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

        //Realizo la peticion con el fin de editar el registro actual
        $.ajax({
            type: 'PUT',
            url: url_pv + 'Convocatorias/edit/' + $("#id").attr('value'),
            data: $.param(values) + "&modulo=SICON-CONVOCATORIAS-CONFIGURACION&token=" + token_actual.token
        }).done(function (result) {
            if (result == 'error')
            {
                notify("danger", "ok", "Convocatorias:", "Se registro un error, comuníquese con la mesa de ayuda convocatorias@scrd.gov.co");
            } else
            {
                if (result == 'error_token')
                {
                    //location.href = url_pv_admin + 'index.html?msg=Su sesión ha expirado, por favor vuelva a ingresar.&msg_tipo=danger';
                    notify("danger", "ok", "Convocatorias:", "Se registro un error con la sesión, comuníquese con la mesa de ayuda convocatorias@scrd.gov.co");
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
                            notify("info", "ok", "Convocatorias:", "Se edito la convocatoria con éxito.");
                        }
                    }
                }
            }
        });

        //$form.bootstrapValidator('disableSubmitButtons', false).bootstrapValidator('resetForm', true);
        bv.resetForm();





    });

    //Validar el formulario principal
    $('.form_validator_jurado').bootstrapValidator({
        feedbackIcons: {
            valid: 'glyphicon glyphicon-ok',
            invalid: 'glyphicon glyphicon-remove',
            validating: 'glyphicon glyphicon-refresh'
        },
        fields: {
            myClass: {
                selector: '.validacion_general',
                validators: {
                    notEmpty: {
                        message: 'Este campo es requerido'
                    }
                }
            },
            descripcion_perfil: {
                validators: {
                    notEmpty: {message: 'El perfil del jurado es requerido'}
                }
            },
            campo_experiencia: {
                validators: {
                    notEmpty: {message: 'Los campos de experiencia son requeridos'}
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
        if ($("#id_cpj").val() == "") {
            //Se realiza la peticion con el fin de guardar el registro actual
            $.ajax({
                type: 'POST',
                url: url_pv + 'Convocatoriasparticipantes/new/',
                data: $form.serialize() + "&modulo=SICON-CONVOCATORIAS-CONFIGURACION&token=" + token_actual.token + "&convocatoria=" + $("#id").attr('value') + "&cantidad_perfil_jurado=" + $("#cantidad_perfil_jurado").val()
            }).done(function (result) {

                if (result == 'error')
                {
                    notify("danger", "ok", "Convocatoria perfil:", "Se registro un error, comuníquese con la mesa de ayuda convocatorias@scrd.gov.co");
                } else
                {
                    if (result == 'error_token')
                    {
                        //location.href = url_pv_admin + 'index.html?msg=Su sesión ha expirado, por favor vuelva a ingresar.&msg_tipo=danger';
                        notify("danger", "ok", "Convocatorias:", "Se registro un error con la sesión, comuníquese con la mesa de ayuda convocatorias@scrd.gov.co");
                    } else
                    {
                        if (result == 'acceso_denegado')
                        {
                            notify("danger", "remove", "Usuario:", "No tiene permisos para editar información.");
                        } else
                        {
                            if (result == 'error_maximo_jurados')
                            {
                                notify("danger", "remove", "Convocatoria perfil:", "No puede exceder el máximo de perfiles como jurado para esta convocatoria.");
                            } else
                            {
                                if (isNaN(result)) {
                                    notify("danger", "ok", "Convocatoria perfil:", "Se registro un error, comuníquese con la mesa de ayuda convocatorias@scrd.gov.co");
                                } else
                                {
                                    cargar_tabla_perfiles_jurado(token_actual);
                                    notify("success", "ok", "Convocatoria perfil:", "Se creó el perfil del jurado con éxito.");
                                }
                            }
                        }
                    }
                }
            });
        } else {
            //Realizo la peticion con el fin de editar el registro actual
            $.ajax({
                type: 'PUT',
                url: url_pv + 'Convocatoriasparticipantes/edit/' + $("#id_cpj").attr('value'),
                data: $form.serialize() + "&modulo=SICON-CONVOCATORIAS-CONFIGURACION&token=" + token_actual.token
            }).done(function (result) {
                if (result == 'error')
                {
                    notify("danger", "ok", "Convocatoria perfil:", "Se registro un error, comuníquese con la mesa de ayuda convocatorias@scrd.gov.co");
                } else
                {
                    if (result == 'error_token')
                    {
                        //location.href = url_pv_admin + 'index.html?msg=Su sesión ha expirado, por favor vuelva a ingresar.&msg_tipo=danger';
                        notify("danger", "ok", "Convocatorias:", "Se registro un error con la sesión, comuníquese con la mesa de ayuda convocatorias@scrd.gov.co");
                    } else
                    {
                        if (result == 'acceso_denegado')
                        {
                            notify("danger", "remove", "Usuario:", "No tiene permisos para editar información.");
                        } else
                        {
                            if (isNaN(result))
                            {
                                notify("danger", "ok", "Convocatoria perfil:", "Se registro un error, comuníquese con la mesa de ayuda convocatorias@scrd.gov.co");
                            } else
                            {
                                cargar_tabla_perfiles_jurado(token_actual);

                                notify("info", "ok", "Convocatoria perfil:", "Se edito el perfil del jurado con éxito.");
                            }
                        }
                    }
                }
            });
        }

        //Eliminó contenido del formulario
        $("#id_cpj").attr("value", "");
        $form.bootstrapValidator('disableSubmitButtons', false).bootstrapValidator('resetForm', true);
        bv.resetForm();
    });

    //Validar el formulario de la bolsa
    $('.form_validator_bolsa').bootstrapValidator({
        feedbackIcons: {
            valid: 'glyphicon glyphicon-ok',
            invalid: 'glyphicon glyphicon-remove',
            validating: 'glyphicon glyphicon-refresh'
        },
        fields: {
            orden: {
                validators: {
                    notEmpty: {message: 'El número de estímulos a otorgar es requerido'},
                    numeric: {message: 'Debe ingresar solo numeros'}
                }
            },
            valor_recurso: {
                validators: {
                    notEmpty: {message: 'El valor individual por estímulo es requerido'},
                    numeric: {message: 'Debe ingresar solo numeros'}
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
        if ($("#id_bolsa").val() == "") {
            //Se realiza la peticion con el fin de guardar el registro actual
            $.ajax({
                type: 'POST',
                url: url_pv + 'Convocatoriasrecursos/new/',
                data: $form.serialize() + "&modulo=SICON-CONVOCATORIAS-CONFIGURACION&token=" + token_actual.token + "&convocatoria=" + $("#id").attr('value')
            }).done(function (result) {

                if (result == 'error')
                {
                    notify("danger", "ok", "Convocatoria recurso:", "Se registro un error, comuníquese con la mesa de ayuda convocatorias@scrd.gov.co");
                } else
                {
                    if (result == 'error_token')
                    {
                        //location.href = url_pv_admin + 'index.html?msg=Su sesión ha expirado, por favor vuelva a ingresar.&msg_tipo=danger';
                        notify("danger", "ok", "Convocatorias:", "Se registro un error con la sesión, comuníquese con la mesa de ayuda convocatorias@scrd.gov.co");
                    } else
                    {
                        if (result == 'acceso_denegado')
                        {
                            notify("danger", "remove", "Usuario:", "No tiene permisos para editar información.");
                        } else
                        {
                            if (isNaN(result)) {
                                notify("danger", "ok", "Convocatoria recurso:", "Se registro un error, comuníquese con la mesa de ayuda convocatorias@scrd.gov.co");
                            } else
                            {
                                notify("success", "ok", "Convocatoria recurso:", "Se creó el registro con éxito.");
                                cargar_tabla_registros(token_actual, 'tbody_distribuciones_bolsas', 'Bolsa');
                            }
                        }
                    }
                }
            });
        } else {
            //Realizo la peticion con el fin de editar el registro actual
            $.ajax({
                type: 'PUT',
                url: url_pv + 'Convocatoriasrecursos/edit/' + $("#id_bolsa").attr('value'),
                data: $form.serialize() + "&modulo=SICON-CONVOCATORIAS-CONFIGURACION&token=" + token_actual.token
            }).done(function (result) {
                if (result == 'error')
                {
                    notify("danger", "ok", "Convocatoria recurso:", "Se registro un error, comuníquese con la mesa de ayuda convocatorias@scrd.gov.co");
                } else
                {
                    if (result == 'error_token')
                    {
                        //location.href = url_pv_admin + 'index.html?msg=Su sesión ha expirado, por favor vuelva a ingresar.&msg_tipo=danger';
                        notify("danger", "ok", "Convocatorias:", "Se registro un error con la sesión, comuníquese con la mesa de ayuda convocatorias@scrd.gov.co");
                    } else
                    {
                        if (result == 'acceso_denegado')
                        {
                            notify("danger", "remove", "Usuario:", "No tiene permisos para editar información.");
                        } else
                        {
                            if (isNaN(result))
                            {
                                notify("danger", "ok", "Convocatoria recurso:", "Se registro un error, comuníquese con la mesa de ayuda convocatorias@scrd.gov.co");
                            } else
                            {
                                notify("info", "ok", "Convocatoria recurso:", "Se edito el registro con éxito.");
                                cargar_tabla_registros(token_actual, 'tbody_distribuciones_bolsas', 'Bolsa');
                            }
                        }
                    }
                }
            });
        }

        //Eliminó contenido del formulario
        $("#id_bolsa").attr("value", "");
        $form.bootstrapValidator('disableSubmitButtons', false).bootstrapValidator('resetForm', true);
        bv.resetForm();
    });

    //Validar el formulario de la especie
    $('.form_validator_especie').bootstrapValidator({
        feedbackIcons: {
            valid: 'glyphicon glyphicon-ok',
            invalid: 'glyphicon glyphicon-remove',
            validating: 'glyphicon glyphicon-refresh'
        },
        fields: {
            orden: {
                validators: {
                    notEmpty: {message: 'El orden es requerido'},
                    numeric: {message: 'Debe ingresar solo numeros'}
                }
            },
            recurso_no_pecuniario: {
                validators: {
                    notEmpty: {message: 'El tipo de estímulo no pecuniario es requerido'}
                }
            },
            valor_recurso: {
                validators: {
                    notEmpty: {message: 'La valoración del recurso no pecuniario es requerido'},
                    numeric: {message: 'Debe ingresar solo numeros'}
                }
            },
            descripcion_recurso: {
                validators: {
                    notEmpty: {message: 'La descripción del recurso no pecuniario es requerida'}
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
        if ($("#id_especie").val() == "") {
            //Se realiza la peticion con el fin de guardar el registro actual
            $.ajax({
                type: 'POST',
                url: url_pv + 'Convocatoriasrecursos/new/',
                data: $form.serialize() + "&modulo=SICON-CONVOCATORIAS-CONFIGURACION&token=" + token_actual.token + "&convocatoria=" + $("#id").attr('value')
            }).done(function (result) {

                if (result == 'error')
                {
                    notify("danger", "ok", "Convocatoria recurso:", "Se registro un error, comuníquese con la mesa de ayuda convocatorias@scrd.gov.co");
                } else
                {
                    if (result == 'error_token')
                    {
                        //location.href = url_pv_admin + 'index.html?msg=Su sesión ha expirado, por favor vuelva a ingresar.&msg_tipo=danger';
                        notify("danger", "ok", "Convocatorias:", "Se registro un error con la sesión, comuníquese con la mesa de ayuda convocatorias@scrd.gov.co");
                    } else
                    {
                        if (result == 'acceso_denegado')
                        {
                            notify("danger", "remove", "Usuario:", "No tiene permisos para editar información.");
                        } else
                        {
                            if (isNaN(result)) {
                                notify("danger", "ok", "Convocatoria recurso:", "Se registro un error, comuníquese con la mesa de ayuda convocatorias@scrd.gov.co");
                            } else
                            {
                                notify("success", "ok", "Convocatoria recurso:", "Se creó el registro con éxito.");
                                cargar_tabla_registros(token_actual, 'tbody_distribuciones_especie', 'Especie');
                            }
                        }
                    }
                }
            });
        } else {
            //Realizo la peticion con el fin de editar el registro actual
            $.ajax({
                type: 'PUT',
                url: url_pv + 'Convocatoriasrecursos/edit/' + $("#id_especie").attr('value'),
                data: $form.serialize() + "&modulo=SICON-CONVOCATORIAS-CONFIGURACION&token=" + token_actual.token
            }).done(function (result) {
                if (result == 'error')
                {
                    notify("danger", "ok", "Convocatoria recurso:", "Se registro un error, comuníquese con la mesa de ayuda convocatorias@scrd.gov.co");
                } else
                {
                    if (result == 'error_token')
                    {
                        //location.href = url_pv_admin + 'index.html?msg=Su sesión ha expirado, por favor vuelva a ingresar.&msg_tipo=danger';
                        notify("danger", "ok", "Convocatorias:", "Se registro un error con la sesión, comuníquese con la mesa de ayuda convocatorias@scrd.gov.co");
                    } else
                    {
                        if (result == 'acceso_denegado')
                        {
                            notify("danger", "remove", "Usuario:", "No tiene permisos para editar información.");
                        } else
                        {
                            if (isNaN(result))
                            {
                                notify("danger", "ok", "Convocatoria recurso:", "Se registro un error, comuníquese con la mesa de ayuda convocatorias@scrd.gov.co");
                            } else
                            {
                                notify("info", "ok", "Convocatoria recurso:", "Se edito el registro con éxito.");
                                cargar_tabla_registros(token_actual, 'tbody_distribuciones_especie', 'Especie');
                            }
                        }
                    }
                }
            });
        }

        //Eliminó contenido del formulario
        $("#id_especie").attr("value", "");
        $form.bootstrapValidator('disableSubmitButtons', false).bootstrapValidator('resetForm', true);
        bv.resetForm();
    });
}
        