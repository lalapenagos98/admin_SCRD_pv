$(document).ready(function () {

    //Verifico si el token exite en el cliente y verifico que el token este activo en el servidor                
    var token_actual = getLocalStorage(name_local_storage);



    $("#formulario_complementar_informacion_cuenta_bancaria").hide();
    $("#formulario_complementar_informacion_rut").hide();
    $("#formulario_complementar_informacion_otros").hide();
    $("#formulario_complementar_informacion_rut").hide();
    $("#guardar_parametro_cuenta").hide();
    $("#actualizar_parametro_cuenta").hide();
    $("#guardar_parametro_rut").hide();
    $("#actualizar_parametro_rut").hide();
    $("#actualizar_parametro_convocatoriadocumento").hide();
    $("#guardar_parametro_convocatoriadocumento").hide();

//    /*para permitir movilidad al cerrar el modal*/
//    $('.modal').on("hidden.bs.modal", function (e) { //fire on closing modal box
//        if ($('.modal:visible').length) { // check whether parent modal is opend after child modal close
//            $('body').addClass('modal-open'); // if open mean length is 1 then add a bootstrap css class to body of the page
//        }
//    });


    /*Validar si se puede editar información*/
    validar_estado_envio_documentacion(token_actual, getURLParameter('p'));

    /*
     * Botón para guardar el estímulo de la propuesta
     */

    $("#enviar_documentacion").click(function () {
        token_actual = getLocalStorage(name_local_storage);
        agregar_observacion_documentacion(token_actual, $('#id_propuesta').val(), $('#info_general').val());
    });


    $("#guardar_parametro_rut").click(function () {
        token_actual = getLocalStorage(name_local_storage);
        agregar_informacion_complementaria_documentacion(token_actual, $('#programadocumento').val(), $('#label').val(), $('#id_html').val(), $('#info_comp_rut').val());
        $('#complementar_informacion').modal('hide');
//        limpiarFormulario();
    });

    $("#actualizar_parametro_rut").click(function () {
        token_actual = getLocalStorage(name_local_storage);
        actualizar_informacion_complementaria_documentacion(token_actual, $('#programadocumento').val(), $('#label').val(), $('#id_html').val(), $('#info_comp_rut').val());
        $('#complementar_informacion').modal('hide');
//        limpiarFormulario();
    });

    $("#guardar_parametro_cuenta").click(function () {
        token_actual = getLocalStorage(name_local_storage);
        agregar_informacion_complementaria_documentacion_cuenta(token_actual, $('#programadocumento').val(), $('#label_banco_cuenta').val(), $('#id_html_banco_cuenta').val(), $('#label_tipo_cuenta').val(), $('#id_html_tipo_cuenta').val(), $('#label_numero_cuenta').val(), $('#id_html_numero_cuenta').val(), $('#info_comp_numero_cuenta').val(), $('#entidad_bancaria').val(), $('#tipo_cuenta').val());
//        limpiarFormulario();
    });

    $("#actualizar_parametro_cuenta").click(function () {
        token_actual = getLocalStorage(name_local_storage);
        actualizar_informacion_complementaria_documentacion_cuenta(token_actual, $('#programadocumento').val(), $('#label_banco_cuenta').val(), $('#id_html_banco_cuenta').val(), $('#label_tipo_cuenta').val(), $('#id_html_tipo_cuenta').val(), $('#label_numero_cuenta').val(), $('#id_html_numero_cuenta').val(), $('#info_comp_numero_cuenta').val(), $('#entidad_bancaria').val(), $('#tipo_cuenta').val());
//        limpiarFormulario();
    });

    $("#guardar_parametro_otros").click(function () {
        token_actual = getLocalStorage(name_local_storage);
        agregar_informacion_complementaria_documentacion_otros(token_actual, $('#programadocumento').val(), $('#label_otros').val(), $('#id_html_otros').val(), $('#info_comp_otros').val());
        $('#complementar_informacion').modal('hide');
//        limpiarFormulario();
    });

    $("#actualizar_parametro_otros").click(function () {
        token_actual = getLocalStorage(name_local_storage);
        actualizar_informacion_complementaria_documentacion_otros(token_actual, $('#programadocumento').val(), $('#label_otros').val(), $('#id_html_otros').val(), $('#info_comp_otros').val());
        $('#complementar_informacion').modal('hide');
//        limpiarFormulario();
    });

    $("#guardar_parametro_convocatoriadocumento").click(function () {
        token_actual = getLocalStorage(name_local_storage);
        agregar_informacion_complementaria_documentacion_convocatoriadocumento(token_actual, $('#convocatoriadocumento').val(), $('#label_convocatoriadocumento').val(), $('#id_html_convocatoriadocumento').val(), $('#info_comp_convocatoriadocumento').val());
        $('#complementar_informacion').modal('hide');
//        limpiarFormulario();
    });

    $("#actualizar_parametro_convocatoriadocumento").click(function () {
        token_actual = getLocalStorage(name_local_storage);
        actualizar_informacion_complementaria_documentacion_convocatoriadocumento(token_actual, $('#convocatoriadocumento').val(), $('#label_convocatoriadocumento').val(), $('#id_html_convocatoriadocumento').val(), $('#info_comp_convocatoriadocumento').val());
        $('#complementar_informacion').modal('hide');
//        limpiarFormulario();
    });




    var href_regresar = "";
    //Creando link de navegación
    if (getURLParameter('m') == "agr")
    {
        href_regresar = "/admin_SCRD_pv/pages/propuestas/mis_propuestas.html";
        $("#link_regresar").attr("onclick", "location.href = '" + href_regresar + "'");
    }

    if (getURLParameter('m') == "pn")
    {
        href_regresar = "/admin_SCRD_pv/pages/propuestas/mis_propuestas.html";
        $("#link_regresar").attr("onclick", "location.href = '" + href_regresar + "'");
    }

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
                                                $(".inactivar_estado_propuesta").attr("disabled", "disabled");

                                                //Verifica si el token actual tiene acceso de lectura
                                                permiso_lectura(token_actual, "Menu Participante");

                                                //Realizo la peticion para cargar el formulario
                                                $.ajax({
                                                    type: 'GET',
                                                    data: {"token": token_actual.token, "conv": $("#conv").attr('value'), "modulo": "Menu Participante", "m": getURLParameter('m'), "p": getURLParameter('p')},
                                                    url: url_pv + 'PropuestasDocumentacionganadores/buscar_documentacion'
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
                                                            if (data == 'crear_perfil_pn')
                                                            {
                                                                location.href = url_pv_admin + 'pages/perfilesparticipantes/persona_natural.html?msg=Para poder inscribir la propuesta debe crear el perfil de persona natural.&msg_tipo=danger';
                                                            } else
                                                            {
                                                                if (data == 'crear_perfil_pj')
                                                                {
                                                                    location.href = url_pv_admin + 'pages/perfilesparticipantes/persona_juridica.html?msg=Para poder inscribir la propuesta debe crear el perfil de persona juridica.&msg_tipo=danger';
                                                                } else
                                                                {
                                                                    if (data == 'crear_perfil_agr')
                                                                    {
                                                                        location.href = url_pv_admin + 'pages/perfilesparticipantes/agrupacion.html?msg=Para poder inscribir la propuesta debe crear el perfil de agrupacion.&msg_tipo=danger';
                                                                    } else
                                                                    {

                                                                        if (data == 'crear_propuesta')
                                                                        {
                                                                            location.href = url_pv_admin + 'pages/propuestas/propuestas_busqueda_convocatorias.html?msg=Para poder inscribir la propuesta debe crear el perfil de agrupacion.&msg_tipo=danger';
                                                                        } else
                                                                        {
                                                                            if (data == 'acceso_denegado')
                                                                            {
                                                                                notify("danger", "remove", "Convocatorias:", "No tiene permisos para ver la información.");
                                                                            } else
                                                                            {
                                                                                var json = JSON.parse(data);

                                                                                //eliminó disabled todos los componentes
                                                                                if (json.estado == 7)
                                                                                {
                                                                                    $(".inactivar_estado_propuesta").removeAttr("disabled");
                                                                                }

                                                                                $("#programa").val(json.programa);

                                                                                if (getURLParameter('m') == "pj")
                                                                                {
                                                                                    if (json.programa == 2)
                                                                                    {
                                                                                        href_regresar = "territorios_poblaciones.html?m=" + getURLParameter('m') + "&id=" + getURLParameter('id') + "&p=" + getURLParameter('p');
                                                                                        $("#link_regresar").attr("onclick", "location.href = '" + href_regresar + "'");
                                                                                    } else
                                                                                    {
                                                                                        href_regresar = "junta.html?m=" + getURLParameter('m') + "&id=" + getURLParameter('id') + "&p=" + getURLParameter('p');
                                                                                        $("#link_regresar").attr("onclick", "location.href = '" + href_regresar + "'");
                                                                                    }
                                                                                }

                                                                                if (json.programa === 2)
                                                                                {
                                                                                    $(".programa_actual").html("PDAC")
                                                                                    $(".mensaje_pdac").css("display", "block");
                                                                                } else
                                                                                {
                                                                                    $(".programa_actual").html("PDE")
                                                                                    $(".mensaje_pdac").css("display", "none");
                                                                                }

                                                                                $("#propuesta").attr("value", json.propuesta);
                                                                                $("#participante").attr("value", json.participante);

                                                                                var html_table = '';
                                                                                $.each(json.administrativos, function (key2, documento) {
                                                                                    html_table = html_table + '<tr><td>' + documento.orden + '</td><td>' + documento.requisito + '</td><td>' + documento.descripcion + '</td><td>' + documento.archivos_permitidos + '</td><td>' + documento.tamano_permitido + ' MB</td><td><button title="' + documento.id + '" lang="' + documento.archivos_permitidos + '" dir="' + documento.tamano_permitido + '" type="button" class="btn btn-success btn_tecnico_documento" data-toggle="modal" data-target="#cargar_documento"><span class="glyphicon glyphicon-open"></span></button></td><td><button title="' + documento.id + '"  type="button" class="btn btn-primary btn_administrativo_informacion" data-toggle="modal" data-target="#complementar_informacion" id="complementaria"><span class="glyphicon glyphicon-pencil"></span></button></td></tr>';
                                                                                });

                                                                                $("#tabla_administrativos").append(html_table);

                                                                                var html_table = '';
                                                                                $('#tipo_pago').find('option').remove();
                                                                                $("#tipo_pago").append('<option value="">:: Seleccionar ::</option>');
                                                                                
                                                                                $.each(json.convocatoriaadministrativos, function (key2, documento) {
                                                                                    html_table = html_table + '<tr><td>' + documento.orden + '</td><td>' + documento.requisito + '</td><td>' + documento.descripcion + '</td><td>' + documento.archivos_permitidos + '</td><td>' + documento.tamano_permitido + ' MB</td><td><button title="' + documento.id + '" lang="' + documento.archivos_permitidos + '" dir="' + documento.tamano_permitido + '" type="button" class="btn btn-success btn_convocatoria_documento" data-toggle="modal" data-target="#cargar_documento_convocatoria"><span class="glyphicon glyphicon-open"></span></button></td><td><button title="' + documento.id + '"  type="button" class="btn btn-primary btn_administrativo_informacion_convocatoria" data-toggle="modal" data-target="#complementar_informacion_convocatoria" id="complementaria_convocatoria"><span class="glyphicon glyphicon-pencil"></span></button></td></tr>';
                                                                                    $("#tipo_pago").append('<option value="' + documento.id + '" >' + documento.descripcion + '</option>');
                                                                                });



                                                                                $("#tabla_convocatoriaadministrativos").append(html_table);

                                                                                html_table = '';
                                                                                $.each(json.tecnicos, function (key2, documento) {
                                                                                    html_table = html_table + '<tr><td>' + documento.orden + '</td><td>' + documento.requisito + '</td><td>' + documento.descripcion + '</td><td>' + documento.archivos_permitidos + '</td><td>' + documento.tamano_permitido + ' MB</td><td><button title="' + documento.id + '" lang="' + documento.archivos_permitidos + '" dir="' + documento.tamano_permitido + '" type="button" class="btn btn-success btn_tecnico_documento" data-toggle="modal" data-target="#cargar_documento"><span class="glyphicon glyphicon-open"></span></button></td><td><button title="' + documento.id + '"  type="button" class="btn btn-primary btn_tecnico_link" data-toggle="modal" data-target="#complementar_informacion"><span class="glyphicon glyphicon-pencil"></span></button></td></tr>';
                                                                                });

                                                                                $("#tabla_tecnicos").append(html_table);

                                                                                $(".btn_tecnico_documento").click(function () {
                                                                                    var documento = $(this).attr("title");
                                                                                    var permitidos = $(this).attr("lang");
                                                                                    var tamano = $(this).attr("dir");
                                                                                    $("#archivos_permitidos").html(permitidos);
                                                                                    $("#documento").val(documento);
                                                                                    $("#permitidos").val(permitidos);
                                                                                    $("#tamano").val(tamano);

                                                                                    cargar_tabla_archivos(token_actual, documento, json.estado);
                                                                                });

                                                                                $(".btn_convocatoria_documento").click(function () {
                                                                                    var documento = $(this).attr("title");
                                                                                    var permitidos = $(this).attr("lang");
                                                                                    var tamano = $(this).attr("dir");
                                                                                    $("#archivos_permitidos").html(permitidos);
                                                                                    $("#documento").val(documento);
                                                                                    $("#permitidos").val(permitidos);
                                                                                    $("#tamano").val(tamano);

                                                                                    cargar_tabla_archivos_convocatoria(token_actual, documento, json.estado);
                                                                                });

                                                                                $(".btn_tecnico_link").click(function () {
                                                                                    var documento = $(this).attr("title");
                                                                                    $("#documento").val(documento);

                                                                                    cargar_tabla_link(token_actual, documento, json.estado);
                                                                                });

                                                                                $(".btn_administrativo_informacion").click(function () {

                                                                                    var documento = $(this).attr("title");

                                                                                    switch (documento) {

                                                                                        case '1':
                                                                                            $("#formulario_complementar_informacion_cuenta_bancaria").modal('show');
                                                                                            $("#formulario_complementar_informacion_rut").modal('hide');
                                                                                            $("#formulario_complementar_informacion_otros").hide();
                                                                                            var id_propuesta = getURLParameter('p');

                                                                                            $.ajax({
                                                                                                type: 'GET',
                                                                                                url: url_pv + 'PropuestasDocumentacionganadores/verificar_propuestas_parametros_ganadores_cuenta/propuesta/' + id_propuesta,
                                                                                                data: {
                                                                                                    "token": token_actual.token,
                                                                                                    "documento": documento
                                                                                                },
                                                                                            }).done(function (data) {

                                                                                                switch (data) {
                                                                                                    case 'error':
                                                                                                        notify("danger", "ok", "Usuario:", "Se registro un error, comuníquese con la mesa de ayuda soporte.convocatorias@scrd.gov.co");
                                                                                                        break;
                                                                                                    case 'error_metodo':
                                                                                                        notify("danger", "ok", "Usuario:", "Se registro un error en el método, comuníquese con la mesa de ayuda soporte.convocatorias@scrd.gov.co");
                                                                                                        break;
                                                                                                    case 'error_token':
                                                                                                        location.href = url_pv_admin + 'index.html?msg=Su sesión ha expirado, por favor vuelva a ingresar.&msg_tipo=danger';
                                                                                                        //notify("danger", "error_token", "URL:", "PropuestasEvaluacion/propuestas/"+id_propuesta);
                                                                                                        break;
                                                                                                    case 'acceso_denegado':
                                                                                                        notify("danger", "remove", "Usuario:", "No tiene permisos acceder a la información.");
                                                                                                        break;
                                                                                                    default:

                                                                                                        var json = JSON.parse(data);


                                                                                                        if (json.banco) {
                                                                                                            $("#entidad_bancaria").attr("value", json.banco.valor);
                                                                                                        } else {
                                                                                                            $("#entidad_bancaria").attr("value", "");
                                                                                                        }

                                                                                                        if (json.tipo_cuenta) {
                                                                                                            $("#tipo_cuenta").attr("value", json.tipo_cuenta.valor);
                                                                                                        } else {
                                                                                                            $("#entidad_bancaria").attr("value", "");
                                                                                                        }

                                                                                                        if (json.numero_cuenta) {
                                                                                                            $("#info_comp_numero_cuenta").attr("value", json.numero_cuenta.valor);
                                                                                                            $("#programadocumento").attr("value", documento);
                                                                                                            $("#actualizar_parametro_cuenta").show();
                                                                                                            $("#guardar_parametro_cuenta").hide();
                                                                                                        } else {
                                                                                                            $("#programadocumento").attr("value", documento);
                                                                                                            $("#info_comp_numero_cuenta").attr("value", "");
                                                                                                            $("#guardar_parametro_cuenta").show();
                                                                                                            $("#actualizar_parametro_cuenta").hide();
                                                                                                        }

                                                                                                        break;
                                                                                                }

                                                                                            }
                                                                                            );
                                                                                            break;

                                                                                        case '2':
                                                                                            $("#formulario_complementar_informacion_rut").modal('show');
                                                                                            $("#formulario_complementar_informacion_otros").hide();
                                                                                            $("#formulario_complementar_informacion_cuenta_bancaria").modal('hide');
                                                                                            var id_propuesta = getURLParameter('p');
                                                                                            $.ajax({
                                                                                                type: 'GET',
                                                                                                url: url_pv + 'PropuestasDocumentacionganadores/verificar_propuestas_parametros_ganadores/propuesta/' + id_propuesta,
                                                                                                data: {
                                                                                                    "token": token_actual.token,
                                                                                                    "documento": documento
                                                                                                },
                                                                                            }).done(function (data) {

                                                                                                switch (data) {
                                                                                                    case 'error':
                                                                                                        notify("danger", "ok", "Usuario:", "Se registro un error, comuníquese con la mesa de ayuda soporte.convocatorias@scrd.gov.co");
                                                                                                        break;
                                                                                                    case 'error_metodo':
                                                                                                        notify("danger", "ok", "Usuario:", "Se registro un error en el método, comuníquese con la mesa de ayuda soporte.convocatorias@scrd.gov.co");
                                                                                                        break;
                                                                                                    case 'error_token':
                                                                                                        location.href = url_pv_admin + 'index.html?msg=Su sesión ha expirado, por favor vuelva a ingresar.&msg_tipo=danger';
                                                                                                        //notify("danger", "error_token", "URL:", "PropuestasEvaluacion/propuestas/"+id_propuesta);
                                                                                                        break;
                                                                                                    case 'acceso_denegado':
                                                                                                        notify("danger", "remove", "Usuario:", "No tiene permisos acceder a la información.");
                                                                                                        break;
                                                                                                    default:
                                                                                                        var json = JSON.parse(data);
                                                                                                        if (json.id) {
                                                                                                            $("#info_comp_rut").attr("value", json.valor);
                                                                                                            $("#programadocumento").attr("value", documento);
                                                                                                            $("#actualizar_parametro_rut").show();
                                                                                                            $("#guardar_parametro_rut").hide();
                                                                                                        } else {
                                                                                                            $("#programadocumento").attr("value", documento);
                                                                                                            $("#guardar_parametro_rut").show();
                                                                                                            $("#actualizar_parametro_rut").hide();
                                                                                                        }

                                                                                                        break;
                                                                                                }

                                                                                            }
                                                                                            );
                                                                                            break;
                                                                                        default:
                                                                                            $("#formulario_complementar_informacion_otros").show();
                                                                                            $("#formulario_complementar_informacion_rut").modal('hide');
                                                                                            $("#formulario_complementar_informacion_cuenta_bancaria").modal('hide');
                                                                                            document.getElementById("formulario_complementar_informacion_otros").reset();
                                                                                            var id_propuesta = getURLParameter('p');
                                                                                            $.ajax({
                                                                                                type: 'GET',
                                                                                                url: url_pv + 'PropuestasDocumentacionganadores/verificar_propuestas_parametros_ganadores_otros/propuesta/' + id_propuesta,
                                                                                                data: {
                                                                                                    "token": token_actual.token,
                                                                                                    "documento": documento
                                                                                                },
                                                                                            }).done(function (data) {

                                                                                                switch (data) {
                                                                                                    case 'error':
                                                                                                        notify("danger", "ok", "Usuario:", "Se registro un error, comuníquese con la mesa de ayuda soporte.convocatorias@scrd.gov.co");
                                                                                                        break;
                                                                                                    case 'error_metodo':
                                                                                                        notify("danger", "ok", "Usuario:", "Se registro un error en el método, comuníquese con la mesa de ayuda soporte.convocatorias@scrd.gov.co");
                                                                                                        break;
                                                                                                    case 'error_token':
                                                                                                        location.href = url_pv_admin + 'index.html?msg=Su sesión ha expirado, por favor vuelva a ingresar.&msg_tipo=danger';
                                                                                                        //notify("danger", "error_token", "URL:", "PropuestasEvaluacion/propuestas/"+id_propuesta);
                                                                                                        break;
                                                                                                    case 'acceso_denegado':
                                                                                                        notify("danger", "remove", "Usuario:", "No tiene permisos acceder a la información.");
                                                                                                        break;
                                                                                                    default:
                                                                                                        document.getElementById("formulario_complementar_informacion_otros").reset();
                                                                                                        var json = JSON.parse(data);
                                                                                                        if (json.id) {

                                                                                                            $("#info_comp_otros").attr("value", json.valor);
                                                                                                            $("#programadocumento").attr("value", documento);
                                                                                                            $("#actualizar_parametro_otros").show();
                                                                                                            $("#guardar_parametro_otros").hide();
                                                                                                        } else {
                                                                                                            $("#info_comp_otros").attr("value", "");
                                                                                                            $("#programadocumento").attr("value", documento);
                                                                                                            $("#guardar_parametro_otros").show();
                                                                                                            $("#actualizar_parametro_otros").hide();
                                                                                                        }

                                                                                                        break;
                                                                                                }

                                                                                            }
                                                                                            );
                                                                                            break;
                                                                                    }

                                                                                });
                                                                                /*
                                                                                 * 13-06-2021
                                                                                 * Wilmer Gustavo Mogollón
                                                                                 * Se agrega acción al botón btn_administrativo_informacion_convocatoria para guardar información complementaria
                                                                                 */
                                                                                $(".btn_administrativo_informacion_convocatoria").click(function () {

                                                                                    var documento = $(this).attr("title");

                                                                                    var id_propuesta = getURLParameter('p');
                                                                                    $.ajax({
                                                                                        type: 'GET',
                                                                                        url: url_pv + 'PropuestasDocumentacionganadores/verificar_propuestas_parametros_ganadores_convocatoriadocumento/propuesta/' + id_propuesta,
                                                                                        data: {
                                                                                            "token": token_actual.token,
                                                                                            "documento": documento
                                                                                        },
                                                                                    }).done(function (data) {

                                                                                        switch (data) {
                                                                                            case 'error':
                                                                                                notify("danger", "ok", "Usuario:", "Se registro un error, comuníquese con la mesa de ayuda soporte.convocatorias@scrd.gov.co");
                                                                                                break;
                                                                                            case 'error_metodo':
                                                                                                notify("danger", "ok", "Usuario:", "Se registro un error en el método, comuníquese con la mesa de ayuda soporte.convocatorias@scrd.gov.co");
                                                                                                break;
                                                                                            case 'error_token':
                                                                                                location.href = url_pv_admin + 'index.html?msg=Su sesión ha expirado, por favor vuelva a ingresar.&msg_tipo=danger';
                                                                                                //notify("danger", "error_token", "URL:", "PropuestasEvaluacion/propuestas/"+id_propuesta);
                                                                                                break;
                                                                                            case 'acceso_denegado':
                                                                                                notify("danger", "remove", "Usuario:", "No tiene permisos acceder a la información.");
                                                                                                break;
                                                                                            default:
                                                                                                var json = JSON.parse(data);
                                                                                                if (json.id) {
                                                                                                    $("#info_comp_convocatoriadocumento").attr("value", json.valor);
                                                                                                    $("#convocatoriadocumento").attr("value", documento);
                                                                                                    $("#actualizar_parametro_convocatoriadocumento").show();
                                                                                                    $("#guardar_parametro_convocatoriadocumento").hide();
                                                                                                } else {
                                                                                                    $("#convocatoriadocumento").attr("value", documento);
                                                                                                    $("#guardar_parametro_convocatoriadocumento").show();
                                                                                                    $("#actualizar_parametro_convocatoriadocumento").hide();
                                                                                                }

                                                                                                break;
                                                                                        }

                                                                                    }
                                                                                    );

                                                                                });

                                                                            }
                                                                        }
                                                                    }
                                                                }

                                                            }
                                                        }
                                                    }
                                                });

                                                $("#archivo").change(function (evt) {
//                                                $(".btn_tecnico_documento").click(function (evt) {

                                                    var f = evt.target.files[0];
                                                    var reader = new FileReader();

                                                    // Cierre para capturar la información del archivo.
                                                    reader.onload = function (fileLoadedEvent) {
//                                                        alert ($("#info_comp").attr('value'));
                                                        var srcData = fileLoadedEvent.target.result; // <--- data: base64
                                                        var srcName = f.name;
                                                        var info_comp = f.info_comp;
                                                        var srcSize = f.size;
                                                        var srcType = f.type;
                                                        var ext = srcName.split('.');
                                                        // ahora obtenemos el ultimo valor despues el punto
                                                        // obtenemos el length por si el archivo lleva nombre con mas de 2 puntos
                                                        srcExt = ext[ext.length - 1];

                                                        var permitidos = $("#permitidos").val();
                                                        var permitidos_mayuscula = $("#permitidos").val().toUpperCase();
                                                        var documento = $("#documento").val();
                                                        var tamano = $("#tamano").val();

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
                                                                $.post(url_pv + 'PropuestasDocumentacionganadores/guardar_archivo', {documento: documento, srcExt: srcExt, srcData: srcData, srcName: srcName, srcSize: srcSize, srcType: srcType, "token": token_actual.token, conv: $("#conv").attr('value'), modulo: "Menu Participante", m: getURLParameter('m'), propuesta: $("#propuesta").attr('value'), info_comp: $("#info_comp").attr('value')}).done(function (data) {
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
                                                                                        if (data == 'error_ya_tiene_documentos') {
                                                                                            notify("danger", "ok", "Usuario:", "Ya tiene un documento asociado a este requisito");
                                                                                        } else {
                                                                                            notify("success", "ok", "Convocatorias:", "Se Guardó con el éxito el archivo.");
                                                                                            cargar_tabla_archivos(token_actual, documento);
                                                                                        }

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

                                                $("#archivo_convocatoria").change(function (evt) {
//                                                $(".btn_tecnico_documento").click(function (evt) {

                                                    var f = evt.target.files[0];
                                                    var reader = new FileReader();

                                                    // Cierre para capturar la información del archivo.
                                                    reader.onload = function (fileLoadedEvent) {
//                                                        alert ($("#info_comp").attr('value'));
                                                        var srcData = fileLoadedEvent.target.result; // <--- data: base64
                                                        var srcName = f.name;
                                                        var info_comp = f.info_comp;
                                                        var srcSize = f.size;
                                                        var srcType = f.type;
                                                        var ext = srcName.split('.');
                                                        // ahora obtenemos el ultimo valor despues el punto
                                                        // obtenemos el length por si el archivo lleva nombre con mas de 2 puntos
                                                        srcExt = ext[ext.length - 1];

                                                        var permitidos = $("#permitidos").val();
                                                        var permitidos_mayuscula = $("#permitidos").val().toUpperCase();
                                                        var documento = $("#documento").val();
                                                        var tamano = $("#tamano").val();

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
                                                                $.post(url_pv + 'PropuestasDocumentacionganadores/guardar_archivo_convocatoria', {documento: documento, srcExt: srcExt, srcData: srcData, srcName: srcName, srcSize: srcSize, srcType: srcType, "token": token_actual.token, conv: $("#conv").attr('value'), modulo: "Menu Participante", m: getURLParameter('m'), propuesta: $("#propuesta").attr('value'), info_comp: $("#info_comp").attr('value')}).done(function (data) {
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
                                                                                        if (data == 'error_ya_tiene_documentos') {
                                                                                            notify("danger", "ok", "Usuario:", "Ya tiene un documento asociado a este requisito");
                                                                                        } else {
                                                                                            notify("success", "ok", "Convocatorias:", "Se Guardó con el éxito el archivo.");
                                                                                            cargar_tabla_archivos_convocatoria(token_actual, documento);
                                                                                        }

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

                                                validator_form(token_actual);



                                                $("#inscribir_propuesta").click(function () {
                                                    //Realizo la peticion para cargar el formulario
                                                    $.ajax({
                                                        type: 'GET',
                                                        data: {"token": token_actual.token, conv: $("#conv").attr('value'), modulo: "Menu Participante", m: getURLParameter('m'), propuesta: $("#propuesta").attr('value')},
                                                        url: url_pv + 'PropuestasDocumentacion/validar_requisitos'
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
                                                                if (data == 'crear_propuesta')
                                                                {
                                                                    location.href = url_pv_admin + 'pages/propuestas/propuestas_busqueda_convocatorias.html?msg=Para poder inscribir la propuesta debe crear el perfil de agrupacion.&msg_tipo=danger';
                                                                } else
                                                                {
                                                                    if (data == 'acceso_denegado')
                                                                    {
                                                                        notify("danger", "remove", "Convocatorias:", "No tiene permisos para ver la información.");
                                                                    } else
                                                                    {
                                                                        var json = JSON.parse(data);

                                                                        var count = Object.keys(json).length;

                                                                        if (count > 0)
                                                                        {
                                                                            var html_table = '<ul>';
                                                                            $.each(json, function (key, documento) {
                                                                                var nombre_requisito = documento.nombre;
                                                                                if (documento.nombre == "Junta")
                                                                                {
                                                                                    nombre_requisito = "No ha ingresado los integrantes de la junta directiva.";
                                                                                }

                                                                                if (documento.nombre == "Integrante")
                                                                                {
                                                                                    nombre_requisito = "No ha ingresado el mínimo de los integrantes de la agrupación.";
                                                                                }

                                                                                if (documento.nombre == "EquipoTrabajo")
                                                                                {
                                                                                    nombre_requisito = "No ha ingresado los integrantes del equipo de trabajo.";
                                                                                }

                                                                                if (documento.nombre == "RJunta")
                                                                                {
                                                                                    nombre_requisito = "No ha ingresado el representante de la junta directiva.";
                                                                                }

                                                                                if (documento.nombre == "RIntegrante")
                                                                                {
                                                                                    nombre_requisito = "No ha ingresado el representante de la agrupación.";
                                                                                }

                                                                                if (documento.nombre == "FPropuesta")
                                                                                {
                                                                                    nombre_requisito = "No ha ingresado información en el formulario de la propuesta.";
                                                                                }

                                                                                if (documento.nombre == "FParticipantePN")
                                                                                {
                                                                                    nombre_requisito = "No ha actualizado la información en el formulario de la persona natural.";
                                                                                }

                                                                                if (documento.nombre == "FParticipantePJ")
                                                                                {
                                                                                    nombre_requisito = "No ha actualizado la información en el formulario de la persona jurídica.";
                                                                                }

                                                                                if (documento.nombre == "FObjetivogeneral")
                                                                                {
                                                                                    nombre_requisito = "No ha ingresado información del objetivo general.";
                                                                                }

                                                                                if (documento.nombre == "FTerritorio")
                                                                                {
                                                                                    nombre_requisito = "No ha ingresado información en el formulario de los territorios y población.";
                                                                                }

                                                                                if (documento.nombre == "FObjetivos")
                                                                                {
                                                                                    nombre_requisito = "No ha ingresado información en el formulario de los objetivos especificos.";
                                                                                }

                                                                                if (documento.nombre == "FActividades")
                                                                                {
                                                                                    nombre_requisito = "No ha ingresado información en el formulario de las actividades, todo objetivo especifico debe tener al menos una actividad.";
                                                                                }

                                                                                if (documento.nombre == "FCronograma")
                                                                                {
                                                                                    nombre_requisito = "No ha ingresado información en el formulario del cronograma, todo actividad debe tener al menos un cronograma.";
                                                                                }

                                                                                if (documento.nombre == "FPresupuesto")
                                                                                {
                                                                                    nombre_requisito = "No ha ingresado información en el formulario del presupuesto, todo actividad debe tener al menos un presupuesto.";
                                                                                }

                                                                                if (documento.nombre == "FPorcentajePresupuesto")
                                                                                {
                                                                                    nombre_requisito = "El total de la cofinanciación es superior al 70% del valor total del proyecto, se debe ajustar.";
                                                                                }

                                                                                html_table = html_table + '<li>' + nombre_requisito + '</li>';
                                                                            });
                                                                            html_table = html_table + '</ul>';
                                                                            notify("danger", "remove", "Convocatorias:", "<p>Los siguientes requisitos son obligatorios</p>" + html_table);
                                                                        } else
                                                                        {
                                                                            $("#mi-modal").modal('show');
                                                                        }
                                                                    }
                                                                }

                                                            }
                                                        }
                                                    });
                                                });

                                                var modalConfirm = function (callback) {
                                                    $("#modal-btn-si").on("click", function () {
                                                        callback(true);
                                                        $("#mi-modal").modal('hide');
                                                    });

                                                    $("#modal-btn-no").on("click", function () {
                                                        callback(false);
                                                        $("#mi-modal").modal('hide');
                                                    });

                                                    $("#modal-btn-reporte").on("click", function () {
                                                        callback(false);
                                                        if ($("#programa").val() == 2)
                                                        {
                                                            window.open(url_pv_report + "/reporte_propuesta_inscrita_pdac.php?token=" + token_actual.token + "&vi=1&id=" + $("#propuesta").attr('value'), '_blank');
                                                        } else
                                                        {
                                                            window.open(url_pv_report + "/reporte_propuesta_inscrita.php?token=" + token_actual.token + "&vi=1&id=" + $("#propuesta").attr('value'), '_blank');
                                                        }
                                                    });
                                                };

                                                modalConfirm(function (confirm) {
                                                    if (confirm) {
                                                        //Se realiza la peticion con el fin de guardar el registro actual
                                                        $.ajax({
                                                            type: 'POST',
                                                            url: url_pv + 'Propuestas/inscribir_propuesta',
                                                            data: "conv=" + $("#conv").attr('value') + "&modulo=Menu Participante&token=" + token_actual.token + "&m=" + getURLParameter('m') + "&id=" + $("#propuesta").val(),
                                                        }).done(function (result) {

                                                            if (result == 'error_estado')
                                                            {
                                                                notify("danger", "ok", "Propuesta:", "Su propuesta no esta en estado registrada, comuníquese con la mesa de ayuda convocatorias@scrd.gov.co");
                                                            } else
                                                            {
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
                                                                            if (result == 'error_fecha_cierre')
                                                                            {
                                                                                notify("danger", "ok", "Convocatorias:", "La convocatoria ya no se encuentra disponible para inscribir su propuesta.");
                                                                            } else
                                                                            {
                                                                                if (isNaN(result)) {
                                                                                    notify("danger", "ok", "Propuesta:", "Se registro un error, comuníquese con la mesa de ayuda convocatorias@scrd.gov.co");
                                                                                } else
                                                                                {
                                                                                    location.href = url_pv_admin + 'pages/propuestas/encuestas.html?id=' + $("#propuesta").val() + '&msg=Felicitaciones, su propuesta quedó inscrita en la plataforma.&msg_tipo=success';
                                                                                }
                                                                            }
                                                                        }
                                                                    }
                                                                }
                                                            }

                                                        });
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

//Agrego para limpiar el formulario
function limpiarFormulario() {
    document.getElementById("formulario_complementar_informacion_otros").reset();
}

function cargar_tabla_archivos(token_actual, documento, estado) {
    //Realizo la peticion para cargar el formulario
    $.ajax({
        type: 'GET',
        data: {documento: documento, "token": token_actual.token, conv: $("#conv").attr('value'), modulo: "Menu Participante", m: getURLParameter('m'), propuesta: $("#propuesta").attr('value')},
        url: url_pv + 'PropuestasDocumentacionganadores/buscar_archivos'
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
                if (data == 'crear_propuesta')
                {
                    location.href = url_pv_admin + 'pages/propuestas/propuestas_busqueda_convocatorias.html?msg=Para poder inscribir la propuesta debe crear el perfil de agrupacion.&msg_tipo=danger';
                } else
                {
                    if (data == 'acceso_denegado')
                    {
                        notify("danger", "remove", "Convocatorias:", "No tiene permisos para ver la información.");
                    } else
                    {
                        var json = JSON.parse(data);

                        var html_table = '';
                        $("#tabla_archivos").html("");

                        var disabled = 'disabled="disabled"';
                        if (estado == 7)
                        {
                            disabled = '';
                        }


                        $.each(json, function (key2, documento) {
                            html_table = html_table + '<tr class="tr_' + documento.id + '"><td>' + documento.nombre + '</td><td><button type="button" onclick="download_file(\'' + documento.id_alfresco + '\')" class="btn btn-success"><span class="glyphicon glyphicon-save"></span></button></td><td><button onclick="eliminar(\'' + documento.id + '\')" id="eliminar_archivo" type="button" class="btn btn-danger eliminar_archivo" ><span class="glyphicon glyphicon-remove"></span></button></td></tr>';
                        });
                        $("#tabla_archivos").append(html_table);

                    }
                }

            }
        }
    });
}


/*
 * 12-10-2021
 * Wilmer Gustavo Mogollón Duque
 * Se agrega función garcar tabla archivos para convocatoriadocumento
 */

function cargar_tabla_archivos_convocatoria(token_actual, documento, estado) {
    //Realizo la peticion para cargar el formulario
    $.ajax({
        type: 'GET',
        data: {documento: documento, "token": token_actual.token, conv: $("#conv").attr('value'), modulo: "Menu Participante", m: getURLParameter('m'), propuesta: $("#propuesta").attr('value')},
        url: url_pv + 'PropuestasDocumentacionganadores/buscar_archivos_convocatoria'
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
                if (data == 'crear_propuesta')
                {
                    location.href = url_pv_admin + 'pages/propuestas/propuestas_busqueda_convocatorias.html?msg=Para poder inscribir la propuesta debe crear el perfil de agrupacion.&msg_tipo=danger';
                } else
                {
                    if (data == 'acceso_denegado')
                    {
                        notify("danger", "remove", "Convocatorias:", "No tiene permisos para ver la información.");
                    } else
                    {
                        var json = JSON.parse(data);

                        var html_table = '';
                        $("#tabla_archivos_convocatoria").html("");

                        var disabled = 'disabled="disabled"';
                        if (estado == 7)
                        {
                            disabled = '';
                        }


                        $.each(json, function (key2, documento) {
                            html_table = html_table + '<tr class="tr_' + documento.id + '"><td>' + documento.nombre + '</td><td><button type="button" onclick="download_file(\'' + documento.id_alfresco + '\')" class="btn btn-success"><span class="glyphicon glyphicon-save"></span></button></td><td><button onclick="eliminar(\'' + documento.id + '\')" type="button" id="eliminar_archivo" class="btn btn-danger eliminar_archivo" ><span class="glyphicon glyphicon-remove"></span></button></td></tr>';
                        });
                        $("#tabla_archivos_convocatoria").append(html_table);

                    }
                }

            }
        }
    });
}




function cargar_tabla_link(token_actual, documento, estado) {
    //Realizo la peticion para cargar el formulario
    $.ajax({
        type: 'GET',
        data: {documento: documento, "token": token_actual.token, conv: $("#conv").attr('value'), modulo: "Menu Participante", m: getURLParameter('m'), propuesta: $("#propuesta").attr('value')},
        url: url_pv + 'PropuestasDocumentacionganadores/buscar_link'
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
                if (data == 'crear_propuesta')
                {
                    location.href = url_pv_admin + 'pages/propuestas/propuestas_busqueda_convocatorias.html?msg=Para poder inscribir la propuesta debe crear el perfil de agrupacion.&msg_tipo=danger';
                } else
                {
                    if (data == 'acceso_denegado')
                    {
                        notify("danger", "remove", "Convocatorias:", "No tiene permisos para ver la información.");
                    } else
                    {
                        var json = JSON.parse(data);

                        var html_table = '';
                        $("#tabla_link").html("");

                        var disabled = 'disabled="disabled"';
                        if (estado == 7)
                        {
                            disabled = '';
                        }
                        $.each(json, function (key2, documento) {
                            html_table = html_table + '<tr class="tr_link_' + documento.id + '"><td><a href="' + documento.link + '" target="_blank">' + documento.link + '</a></td><td><button onclick="eliminar_link(\'' + documento.id + '\')" type="button" class="btn btn-danger" ' + disabled + '><span class="glyphicon glyphicon-remove"></span></button></td></tr>';
                        });
                        $("#tabla_link").append(html_table);

                    }
                }

            }
        }
    });
}

//Funcion para descargar archivo
function download_file(cod)
{
    //Verifico si el token exite en el cliente y verifico que el token este activo en el servidor                
    var token_actual = getLocalStorage(name_local_storage);

    //Verifico si el token esta vacio, para enviarlo a que ingrese de nuevo
    if ($.isEmptyObject(token_actual)) {
        location.href = url_pv_admin + 'index.html?msg=Su sesión ha expirado, por favor vuelva a ingresar.&msg_tipo=danger';
    } else
    {
        $.AjaxDownloader({
            url: url_pv + 'PropuestasDocumentacionganadores/download_file/',
            data: {
                cod: cod,
                token: token_actual.token,
                modulo: "Menu Participante"
            }
        });
    }

}

//Funcion para descargar archivo
function eliminar(id)
{
    //Verifico si el token exite en el cliente y verifico que el token este activo en el servidor                
    var token_actual = getLocalStorage(name_local_storage);

    //Verifico si el token esta vacio, para enviarlo a que ingrese de nuevo
    if ($.isEmptyObject(token_actual)) {
        location.href = url_pv_admin + 'index.html?msg=Su sesión ha expirado, por favor vuelva a ingresar.&msg_tipo=danger';
    } else
    {
        $.ajax({
            type: 'DELETE',
            data: {"token": token_actual.token, "modulo": "Menu Participante"},
            url: url_pv + 'PropuestasDocumentacionganadores/delete/' + id
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
                    if (data == 'error')
                    {
                        notify("danger", "ok", "Convocatorias:", "Se registro un error en el método, comuníquese con la mesa de ayuda convocatorias@scrd.gov.co");
                    } else
                    {
                        if (data == 'acceso_denegado')
                        {
                            notify("danger", "remove", "Convocatorias:", "No tiene permisos para ver la información.");
                        } else
                        {
                            notify("success", "ok", "Convocatorias:", "Se eliminó con el éxito el archivo.");
                            $(".tr_" + id).remove();
                        }
                    }

                }
            }
        });
    }

}

//Funcion para descargar archivo
function eliminar_link(id)
{
    //Verifico si el token exite en el cliente y verifico que el token este activo en el servidor                
    var token_actual = getLocalStorage(name_local_storage);

    //Verifico si el token esta vacio, para enviarlo a que ingrese de nuevo
    if ($.isEmptyObject(token_actual)) {
        location.href = url_pv_admin + 'index.html?msg=Su sesión ha expirado, por favor vuelva a ingresar.&msg_tipo=danger';
    } else
    {
        $.ajax({
            type: 'DELETE',
            data: {"token": token_actual.token, "modulo": "Menu Participante"},
            url: url_pv + 'PropuestasDocumentacion/delete_link/' + id
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
                    if (data == 'error')
                    {
                        notify("danger", "ok", "Convocatorias:", "Se registro un error en el método, comuníquese con la mesa de ayuda convocatorias@scrd.gov.co");
                    } else
                    {
                        if (data == 'acceso_denegado')
                        {
                            notify("danger", "remove", "Convocatorias:", "No tiene permisos para ver la información.");
                        } else
                        {
                            notify("success", "ok", "Convocatorias:", "Se eliminó con el éxito el archivo.");
                            $(".tr_link_" + id).remove();
                        }
                    }

                }
            }
        });
    }

}

function validator_form(token_actual) {

    //Validar el formulario
    $('.formulario_link').bootstrapValidator({
        feedbackIcons: {
            valid: 'glyphicon glyphicon-ok',
            invalid: 'glyphicon glyphicon-remove',
            validating: 'glyphicon glyphicon-refresh'
        },
        fields: {
            link: {
                validators: {
                    notEmpty: {message: 'El link es requerido'},
                    regexp: {
                        regexp: /((([A-Za-z]{3,9}:(?:\/\/)?)(?:[\-;:&=\+\$,\w]+@)?[A-Za-z0-9\.\-]+|(?:www\.|[\-;:&=\+\$,\w]+@)[A-Za-z0-9\.\-]+)((?:\/[\+~%\/\.\w\-_]*)?\??(?:[\-\+=&;%@\.\w_]*)#?(?:[\.\!\/\\\w]*))?)/,
                        message: 'Debe ingresar un link correcto ejemplo (https://www.culturarecreacionydeporte.gov.co)'
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
        $('#formulario_link').attr('action', url_pv + 'PropuestasDocumentacion/guardar_link');

        var documento = $("#documento").val();

        //Se realiza la peticion con el fin de guardar el registro actual
        $.ajax({
            type: 'POST',
            url: $form.attr('action'),
            data: "modulo=Menu Participante&token=" + token_actual.token + "&documento=" + documento + "&conv=" + $("#conv").attr('value') + "&m=" + getURLParameter('m') + "&propuesta=" + $("#propuesta").attr('value') + "&link=" + $("#link").val()
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
                        if (data == 'error_carpeta')
                        {
                            notify("danger", "ok", "Convocatorias:", "Se registro un error al subir el archivo en la carpeta, comuníquese con la mesa de ayuda convocatorias@scrd.gov.co");
                        } else
                        {
                            notify("success", "ok", "Convocatorias:", "Se Guardó con el éxito el archivo.");
                            cargar_tabla_link(token_actual, documento);

                        }
                    }
                }
            }

        });

        $form.bootstrapValidator('disableSubmitButtons', false).bootstrapValidator('resetForm', true);
    });

}



function agregar_observacion_documentacion(token_actual, id_propuesta, info_general) {

    $.ajax({
        type: 'PUT',
        url: url_pv + 'PropuestasDocumentacionganadores/agregar_observacion/propuesta/' + getURLParameter('p'),
        data: "&modulo=Menu Participante&token=" + token_actual.token
                + "&info_general=" + $('#info_general').val()
                + "&tipo_pago=" + $('#tipo_pago').val()

    }).done(function (data) {

        switch (data) {
            case 'error':
                notify("danger", "ok", "Usuario:", "Se registro un error, comuníquese con la mesa de ayuda soporte.convocatorias@scrd.gov.co");
                break;
            case 'error_metodo':
                notify("danger", "ok", "Se registro un error en el método, comuníquese con la mesa de ayuda soporte.convocatorias@scrd.gov.co");
                break;
            case 'error_token':
                location.href = url_pv_admin + 'index.html?msg=Su sesión ha expirado, por favor vuelva a ingresar.&msg_tipo=danger';
                //notify("danger", "error_token", "URL:", 'PropuestasEvaluacion/evaluacionpropuestas/'+id_evaluacion+'/impedimentos');
                break;
            case 'acceso_denegado':
                notify("danger", "remove", "Usuario:", "No tiene permisos para editar información.");
                break;
            case 'deshabilitado':
                notify("danger", "remove", "Usuario:", "No tiene permisos para editar información.");
                break;
            case 'error_validacion':
                notify("danger", "remove", "Usuario:", "Tiene evaluaciones sin confirmar");
                break;
            case 'error_descripcion':
                notify("danger", "remove", "Usuario:", "Debe agregar una descripción de la documentación");
                break;
            case 'error_tipo_pago':
                notify("danger", "remove", "Usuario:", "Debe seleccionar el tipo de pago correspondiente");
                break;
            case 'error_faltan_documentos':
                notify("danger", "remove", "Usuario:", "Debe adjuntar un soporte por cada uno de los requisitos");
                break;
            case 'error_ya_fueron_aprobados_documentos':
                notify("danger", "remove", "Usuario:", "Los documentos ya fueron aprobados por el misional, por favor espere a que se habilite nuevamente el flujo.");
                break;
            case 'error_falta_documento_primer_pago':
                notify("danger", "remove", "Usuario:", "Debe adjuntar el documento correspondiente al primer pago antes de iniciar el trámite de segundo pago.");
                break;
            default:
                notify("success", "ok", "Usuario:", "Se envió la documentación con éxito.");
//                $("#fieldset_top_general").attr("disabled", "");
//                $("#fieldset_documentacion").attr("disabled", "");
//                $("#fieldset_cuenta").attr("disabled", "");
//                $("#fieldset_rut").attr("disabled", "");
//                $("#fieldset_otros").attr("disabled", "");
//                $("#fieldset_documentacion_convocatoria").attr("disabled", "");
//                $("#fieldset_convocatoriadocumento").attr("disabled", "");
//                $("#guardar_parametro_cuenta").attr("disabled", "");
//                $("#actualizar_parametro_cuenta").attr("disabled", "");
//                $("#guardar_parametro_rut").attr("disabled", "");
//                $("#actualizar_parametro_rut").attr("disabled", "");
//                $("#guardar_parametro_otros").attr("disabled", "");
//                $("#actualizar_parametro_otros").attr("disabled", "");
//                $("#guardar_parametro_convocatoriadocumento").attr("disabled", "");
//                $("#actualizar_parametro_convocatoriadocumento").attr("disabled", "");
//                $(".eliminar_archivo").attr("disabled", "");
                //cargar_tabla_ganadores(token_actual);
                break;
        }

    });
}


function agregar_informacion_complementaria_documentacion(token_actual, programadocumento, label, id_html, info_comp) {

    $.ajax({
        type: 'PUT',
        url: url_pv + 'PropuestasDocumentacionganadores/agregar_informacion_complementaria/propuesta/' + getURLParameter('p'),
        data: "&modulo=Menu Participante&token=" + token_actual.token
                + "&programadocumento=" + programadocumento
                + "&label=" + label
                + "&id_html=" + id_html
                + "&info_comp=" + info_comp

    }).done(function (data) {

        switch (data) {
            case 'error':
                notify("danger", "ok", "Usuario:", "Se registro un error, comuníquese con la mesa de ayuda soporte.convocatorias@scrd.gov.co");
                break;
            case 'error_metodo':
                notify("danger", "ok", "Se registro un error en el método, comuníquese con la mesa de ayuda soporte.convocatorias@scrd.gov.co");
                break;
            case 'error_token':
                location.href = url_pv_admin + 'index.html?msg=Su sesión ha expirado, por favor vuelva a ingresar.&msg_tipo=danger';
                //notify("danger", "error_token", "URL:", 'PropuestasEvaluacion/evaluacionpropuestas/'+id_evaluacion+'/impedimentos');
                break;
            case 'acceso_denegado':
                notify("danger", "remove", "Usuario:", "No tiene permisos para editar información.");
                break;
            case 'deshabilitado':
                notify("danger", "remove", "Usuario:", "No tiene permisos para editar información.");
                break;
            case 'error_validacion':
                notify("danger", "remove", "Usuario:", "Tiene evaluaciones sin confirmar");
                break;
            case 'error_info_comp':
                notify("danger", "remove", "Usuario:", "Debe agregar una descripción de la documentación");
                break;
            case 'error_faltan_documentos':
                notify("danger", "remove", "Usuario:", "Debe adjuntar un soporte por cada uno de los requisitos");
                break;
            default:
                notify("success", "ok", "Usuario:", "Se registró la información con éxito.");
                $('#complementar_informacion').modal('hide');
                document.getElementById("formulario_complementar_informacion_rut").reset();
                $('.modal-backdrop').remove();
                break;
        }

    });
}


/*
 * 04-10-2021
 * Wilmer Gustavo Mogollón Duque
 * Se agrega metodo actualizar_informacion_complementaria_documentacion 
 */

function actualizar_informacion_complementaria_documentacion(token_actual, programadocumento, label, id_html, info_comp) {

    $.ajax({
        type: 'PUT',
        url: url_pv + 'PropuestasDocumentacionganadores/actualizar_informacion_complementaria/propuesta/' + getURLParameter('p'),
        data: "&modulo=Menu Participante&token=" + token_actual.token
                + "&programadocumento=" + programadocumento
                + "&label=" + label
                + "&id_html=" + id_html
                + "&info_comp=" + info_comp

    }).done(function (data) {

        switch (data) {
            case 'error':
                notify("danger", "ok", "Usuario:", "Se registro un error, comuníquese con la mesa de ayuda soporte.convocatorias@scrd.gov.co");
                break;
            case 'error_metodo':
                notify("danger", "ok", "Se registro un error en el método, comuníquese con la mesa de ayuda soporte.convocatorias@scrd.gov.co");
                break;
            case 'error_token':
                location.href = url_pv_admin + 'index.html?msg=Su sesión ha expirado, por favor vuelva a ingresar.&msg_tipo=danger';
                //notify("danger", "error_token", "URL:", 'PropuestasEvaluacion/evaluacionpropuestas/'+id_evaluacion+'/impedimentos');
                break;
            case 'acceso_denegado':
                notify("danger", "remove", "Usuario:", "No tiene permisos para editar información.");
                break;
            case 'deshabilitado':
                notify("danger", "remove", "Usuario:", "No tiene permisos para editar información.");
                break;
            case 'error_validacion':
                notify("danger", "remove", "Usuario:", "Tiene evaluaciones sin confirmar");
                break;
            case 'error_info_comp':
                notify("danger", "remove", "Usuario:", "Debe agregar una descripción de la documentación");
                break;
            case 'error_faltan_documentos':
                notify("danger", "remove", "Usuario:", "Debe adjuntar un soporte por cada uno de los requisitos");
                break;
            default:
                notify("success", "ok", "Usuario:", "Se registró la información con éxito.");
                $('#complementar_informacion').modal('hide');
                document.getElementById("formulario_complementar_informacion_rut").reset();
                $('.modal-backdrop').remove();
                break;
        }

    });
}


function agregar_informacion_complementaria_documentacion_convocatoriadocumento(token_actual, convocatoriadocumento, label_convocatoriadocumento, id_html_convocatoriadocumento, info_comp_convocatoriadocumento) {

    $.ajax({
        type: 'PUT',
        url: url_pv + 'PropuestasDocumentacionganadores/agregar_informacion_complementaria_convocatoriadocumento/propuesta/' + getURLParameter('p'),
        data: "&modulo=Menu Participante&token=" + token_actual.token
                + "&convocatoriadocumento=" + convocatoriadocumento
                + "&label_convocatoriadocumento=" + label_convocatoriadocumento
                + "&id_html_convocatoriadocumento=" + id_html_convocatoriadocumento
                + "&info_comp_convocatoriadocumento=" + info_comp_convocatoriadocumento

    }).done(function (data) {

        switch (data) {
            case 'error':
                notify("danger", "ok", "Usuario:", "Se registro un error, comuníquese con la mesa de ayuda soporte.convocatorias@scrd.gov.co");
                break;
            case 'error_metodo':
                notify("danger", "ok", "Se registro un error en el método, comuníquese con la mesa de ayuda soporte.convocatorias@scrd.gov.co");
                break;
            case 'error_token':
                location.href = url_pv_admin + 'index.html?msg=Su sesión ha expirado, por favor vuelva a ingresar.&msg_tipo=danger';
                //notify("danger", "error_token", "URL:", 'PropuestasEvaluacion/evaluacionpropuestas/'+id_evaluacion+'/impedimentos');
                break;
            case 'acceso_denegado':
                notify("danger", "remove", "Usuario:", "No tiene permisos para editar información.");
                break;
            case 'deshabilitado':
                notify("danger", "remove", "Usuario:", "No tiene permisos para editar información.");
                break;
            case 'error_validacion':
                notify("danger", "remove", "Usuario:", "Tiene evaluaciones sin confirmar");
                break;
            case 'error_info_comp':
                notify("danger", "remove", "Usuario:", "Debe agregar una descripción de la documentación");
                break;
            case 'error_faltan_documentos':
                notify("danger", "remove", "Usuario:", "Debe adjuntar un soporte por cada uno de los requisitos");
                break;
            default:
                notify("success", "ok", "Usuario:", "Se registró la información con éxito.");
                $('#complementar_informacion_convocatoria').modal('hide');
                break;
        }

    });
}


function actualizar_informacion_complementaria_documentacion_convocatoriadocumento(token_actual, convocatoriadocumento, label_convocatoriadocumento, id_html_convocatoriadocumento, info_comp_convocatoriadocumento) {

    $.ajax({
        type: 'PUT',
        url: url_pv + 'PropuestasDocumentacionganadores/actualizar_informacion_complementaria_convocatoriadocumento/propuesta/' + getURLParameter('p'),
        data: "&modulo=Menu Participante&token=" + token_actual.token
                + "&convocatoriadocumento=" + convocatoriadocumento
                + "&label_convocatoriadocumento=" + label_convocatoriadocumento
                + "&id_html_convocatoriadocumento=" + id_html_convocatoriadocumento
                + "&info_comp_convocatoriadocumento=" + info_comp_convocatoriadocumento

    }).done(function (data) {

        switch (data) {
            case 'error':
                notify("danger", "ok", "Usuario:", "Se registro un error, comuníquese con la mesa de ayuda soporte.convocatorias@scrd.gov.co");
                break;
            case 'error_metodo':
                notify("danger", "ok", "Se registro un error en el método, comuníquese con la mesa de ayuda soporte.convocatorias@scrd.gov.co");
                break;
            case 'error_token':
                location.href = url_pv_admin + 'index.html?msg=Su sesión ha expirado, por favor vuelva a ingresar.&msg_tipo=danger';
                //notify("danger", "error_token", "URL:", 'PropuestasEvaluacion/evaluacionpropuestas/'+id_evaluacion+'/impedimentos');
                break;
            case 'acceso_denegado':
                notify("danger", "remove", "Usuario:", "No tiene permisos para editar información.");
                break;
            case 'deshabilitado':
                notify("danger", "remove", "Usuario:", "No tiene permisos para editar información.");
                break;
            case 'error_validacion':
                notify("danger", "remove", "Usuario:", "Tiene evaluaciones sin confirmar");
                break;
            case 'error_info_comp':
                notify("danger", "remove", "Usuario:", "Debe agregar una descripción de la documentación");
                break;
            case 'error_faltan_documentos':
                notify("danger", "remove", "Usuario:", "Debe adjuntar un soporte por cada uno de los requisitos");
                break;
            default:
                notify("success", "ok", "Usuario:", "Se registró la información con éxito.");
                $('#complementar_informacion_convocatoria').modal('hide');
                break;
        }

    });
}


function agregar_informacion_complementaria_documentacion_otros(token_actual, programadocumento, label_otros, id_html_otros, info_comp_otros) {

    $.ajax({
        type: 'PUT',
        url: url_pv + 'PropuestasDocumentacionganadores/agregar_informacion_complementaria_otros/propuesta/' + getURLParameter('p'),
        data: "&modulo=Menu Participante&token=" + token_actual.token
                + "&programadocumento=" + programadocumento
                + "&label_otros=" + label_otros
                + "&id_html_otros=" + id_html_otros
                + "&info_comp_otros=" + info_comp_otros

    }).done(function (data) {

        switch (data) {
            case 'error':
                notify("danger", "ok", "Usuario:", "Se registro un error, comuníquese con la mesa de ayuda soporte.convocatorias@scrd.gov.co");
                break;
            case 'error_metodo':
                notify("danger", "ok", "Se registro un error en el método, comuníquese con la mesa de ayuda soporte.convocatorias@scrd.gov.co");
                break;
            case 'error_token':
                location.href = url_pv_admin + 'index.html?msg=Su sesión ha expirado, por favor vuelva a ingresar.&msg_tipo=danger';
                //notify("danger", "error_token", "URL:", 'PropuestasEvaluacion/evaluacionpropuestas/'+id_evaluacion+'/impedimentos');
                break;
            case 'acceso_denegado':
                notify("danger", "remove", "Usuario:", "No tiene permisos para editar información.");
                break;
            case 'deshabilitado':
                notify("danger", "remove", "Usuario:", "No tiene permisos para editar información.");
                break;
            case 'error_validacion':
                notify("danger", "remove", "Usuario:", "Tiene evaluaciones sin confirmar");
                break;
            case 'error_info_comp':
                notify("danger", "remove", "Usuario:", "Debe agregar una descripción de la documentación");
                break;
            case 'error_faltan_documentos':
                notify("danger", "remove", "Usuario:", "Debe adjuntar un soporte por cada uno de los requisitos");
                break;
            default:
                notify("success", "ok", "Usuario:", "Se registró la información con éxito.");
                $('#complementar_informacion').modal('hide');
                document.getElementById("formulario_complementar_informacion_otros").reset();
                break;
        }

    });
}


function actualizar_informacion_complementaria_documentacion_otros(token_actual, programadocumento, label_otros, id_html_otros, info_comp_otros) {

    $.ajax({
        type: 'PUT',
        url: url_pv + 'PropuestasDocumentacionganadores/actualizar_informacion_complementaria_otros/propuesta/' + getURLParameter('p'),
        data: "&modulo=Menu Participante&token=" + token_actual.token
                + "&programadocumento=" + programadocumento
                + "&label_otros=" + label_otros
                + "&id_html_otros=" + id_html_otros
                + "&info_comp_otros=" + info_comp_otros

    }).done(function (data) {

        switch (data) {
            case 'error':
                notify("danger", "ok", "Usuario:", "Se registro un error, comuníquese con la mesa de ayuda soporte.convocatorias@scrd.gov.co");
                break;
            case 'error_metodo':
                notify("danger", "ok", "Se registro un error en el método, comuníquese con la mesa de ayuda soporte.convocatorias@scrd.gov.co");
                break;
            case 'error_token':
                location.href = url_pv_admin + 'index.html?msg=Su sesión ha expirado, por favor vuelva a ingresar.&msg_tipo=danger';
                //notify("danger", "error_token", "URL:", 'PropuestasEvaluacion/evaluacionpropuestas/'+id_evaluacion+'/impedimentos');
                break;
            case 'acceso_denegado':
                notify("danger", "remove", "Usuario:", "No tiene permisos para editar información.");
                break;
            case 'deshabilitado':
                notify("danger", "remove", "Usuario:", "No tiene permisos para editar información.");
                break;
            case 'error_validacion':
                notify("danger", "remove", "Usuario:", "Tiene evaluaciones sin confirmar");
                break;
            case 'error_info_comp':
                notify("danger", "remove", "Usuario:", "Debe agregar una descripción de la documentación");
                break;
            case 'error_faltan_documentos':
                notify("danger", "remove", "Usuario:", "Debe adjuntar un soporte por cada uno de los requisitos");
                break;
            default:
                notify("success", "ok", "Usuario:", "Se registró la información con éxito.");
                $('#complementar_informacion').modal('hide');
                document.getElementById("formulario_complementar_informacion_otros").reset();
                break;
        }

    });
}

/*
 * 22-10-2021
 * Wilmer Gustavo Mogollón Duque
 * Se agregan funciones para agregar y editar parametros cuenta bancaria
 */
function agregar_informacion_complementaria_documentacion_cuenta(token_actual, programadocumento, label_banco_cuenta, id_html_banco_cuenta, label_tipo_cuenta, id_html_tipo_cuenta, label_numero_cuenta, id_html_numero_cuenta, info_comp_numero_cuenta, entidad_bancaria, tipo_cuenta) {
    $.ajax({
        type: 'PUT',
        url: url_pv + 'PropuestasDocumentacionganadores/agregar_informacion_complementaria_cuenta/propuesta/' + getURLParameter('p'),
        data: "&modulo=Menu Participante&token=" + token_actual.token
                + "&programadocumento=" + programadocumento
                + "&label_banco_cuenta=" + label_banco_cuenta
                + "&id_html_banco_cuenta=" + id_html_banco_cuenta
                + "&label_tipo_cuenta=" + label_tipo_cuenta
                + "&id_html_tipo_cuenta=" + id_html_tipo_cuenta
                + "&label_numero_cuenta=" + label_numero_cuenta
                + "&id_html_numero_cuenta=" + id_html_numero_cuenta
                + "&info_comp_numero_cuenta=" + info_comp_numero_cuenta
                + "&entidad_bancaria=" + entidad_bancaria
                + "&tipo_cuenta=" + tipo_cuenta

    }).done(function (data) {

        switch (data) {
            case 'error':
                notify("danger", "ok", "Usuario:", "Se registro un error, comuníquese con la mesa de ayuda soporte.convocatorias@scrd.gov.co");
                break;
            case 'error_metodo':
                notify("danger", "ok", "Se registro un error en el método, comuníquese con la mesa de ayuda soporte.convocatorias@scrd.gov.co");
                break;
            case 'error_token':
                location.href = url_pv_admin + 'index.html?msg=Su sesión ha expirado, por favor vuelva a ingresar.&msg_tipo=danger';
                //notify("danger", "error_token", "URL:", 'PropuestasEvaluacion/evaluacionpropuestas/'+id_evaluacion+'/impedimentos');
                break;
            case 'acceso_denegado':
                notify("danger", "remove", "Usuario:", "No tiene permisos para editar información.");
                break;
            case 'deshabilitado':
                notify("danger", "remove", "Usuario:", "No tiene permisos para editar información.");
                break;
            case 'error_validacion':
                notify("danger", "remove", "Usuario:", "Tiene evaluaciones sin confirmar");
                break;
            case 'error_info_comp_numero_cuenta':
                notify("danger", "remove", "Usuario:", "Debe agregar el número de cuenta bancaria");
                break;
            case 'error_info_comp_tipo_cuenta':
                notify("danger", "remove", "Usuario:", "Debe seleccionar el tipo de cuenta bancaria");
                break;
            case 'error_info_comp_entidad_bancaria':
                notify("danger", "remove", "Usuario:", "Debe seleccionar la entidad bancaria");
                break;
            case 'error_faltan_documentos':
                notify("danger", "remove", "Usuario:", "Debe adjuntar un soporte por cada uno de los requisitos");
                break;
            default:
                notify("success", "ok", "Usuario:", "Se registró la información con éxito.");
                $('#complementar_informacion').modal('hide');
                $('.modal-backdrop').remove();
                break;
        }

    });
}


function actualizar_informacion_complementaria_documentacion_cuenta(token_actual, programadocumento, label_banco_cuenta, id_html_banco_cuenta, label_tipo_cuenta, id_html_tipo_cuenta, label_numero_cuenta, id_html_numero_cuenta, info_comp_numero_cuenta, entidad_bancaria, tipo_cuenta) {

    $.ajax({
        type: 'PUT',
        url: url_pv + 'PropuestasDocumentacionganadores/actualizar_informacion_complementaria_cuenta/propuesta/' + getURLParameter('p'),
        data: "&modulo=Menu Participante&token=" + token_actual.token
                + "&programadocumento=" + programadocumento
                + "&label_banco_cuenta=" + label_banco_cuenta
                + "&id_html_banco_cuenta=" + id_html_banco_cuenta
                + "&label_tipo_cuenta=" + label_tipo_cuenta
                + "&id_html_tipo_cuenta=" + id_html_tipo_cuenta
                + "&label_numero_cuenta=" + label_numero_cuenta
                + "&id_html_numero_cuenta=" + id_html_numero_cuenta
                + "&info_comp_numero_cuenta=" + info_comp_numero_cuenta
                + "&entidad_bancaria=" + entidad_bancaria
                + "&tipo_cuenta=" + tipo_cuenta


    }).done(function (data) {

        switch (data) {
            case 'error':
                notify("danger", "ok", "Usuario:", "Se registro un error, comuníquese con la mesa de ayuda soporte.convocatorias@scrd.gov.co");
                break;
            case 'error_metodo':
                notify("danger", "ok", "Se registro un error en el método, comuníquese con la mesa de ayuda soporte.convocatorias@scrd.gov.co");
                break;
            case 'error_token':
                location.href = url_pv_admin + 'index.html?msg=Su sesión ha expirado, por favor vuelva a ingresar.&msg_tipo=danger';
                //notify("danger", "error_token", "URL:", 'PropuestasEvaluacion/evaluacionpropuestas/'+id_evaluacion+'/impedimentos');
                break;
            case 'acceso_denegado':
                notify("danger", "remove", "Usuario:", "No tiene permisos para editar información.");
                break;
            case 'deshabilitado':
                notify("danger", "remove", "Usuario:", "No tiene permisos para editar información.");
                break;
            case 'error_validacion':
                notify("danger", "remove", "Usuario:", "Tiene evaluaciones sin confirmar");
                break;
            case 'error_info_comp':
                notify("danger", "remove", "Usuario:", "Debe agregar una descripción de la documentación");
                break;
            case 'error_info_comp_numero_cuenta':
                notify("danger", "remove", "Usuario:", "Debe agregar el número de cuenta bancaria");
                break;
            case 'error_info_comp_tipo_cuenta':
                notify("danger", "remove", "Usuario:", "Debe seleccionar el tipo de cuenta bancaria");
                break;
            case 'error_info_comp_entidad_bancaria':
                notify("danger", "remove", "Usuario:", "Debe seleccionar la entidad bancaria");
                break;
            case 'error_faltan_documentos':
                notify("danger", "remove", "Usuario:", "Debe adjuntar un soporte por cada uno de los requisitos");
                break;
            default:
                notify("success", "ok", "Usuario:", "Se registró la información con éxito.");
                $('#complementar_informacion').modal('hide');
                $('.modal-backdrop').remove();
                break;
        }

    });
}



/*
 * 29-09-2021
 * Wilmer Gustavo Mogollón Duque
 * Se agrega función validar_estado_envio_documentacion
 */
function validar_estado_envio_documentacion(token_actual, id_propuesta) {
    $.ajax({
        type: 'GET',
        url: url_pv + 'PropuestasDocumentacionganadores/verificar_envio/propuesta/' + id_propuesta,
        data: "&modulo=Menu Participante&token=" + token_actual.token
                + "&info_general=" + $('#info_general').val()

    }).done(function (data) {

        switch (data) {
            case 'error':
                notify("danger", "ok", "Usuario:", "Se registro un error, comuníquese con la mesa de ayuda soporte.convocatorias@scrd.gov.co");
                break;
            case 'error_metodo':
                notify("danger", "ok", "Se registro un error en el método, comuníquese con la mesa de ayuda soporte.convocatorias@scrd.gov.co");
                break;
            case 'error_token':
                location.href = url_pv_admin + 'index.html?msg=Su sesión ha expirado, por favor vuelva a ingresar.&msg_tipo=danger';
                //notify("danger", "error_token", "URL:", 'PropuestasEvaluacion/evaluacionpropuestas/'+id_evaluacion+'/impedimentos');
                break;
            case 'acceso_denegado':
                notify("danger", "remove", "Usuario:", "No tiene permisos para editar información.");
                break;
            case 'deshabilitado':
                notify("danger", "remove", "Usuario:", "No tiene permisos para editar información.");
                break;
            case 'error_validacion':
                notify("danger", "remove", "Usuario:", "Tiene evaluaciones sin confirmar");
                break;
            default:
                var json = JSON.parse(data);
                if (json.id) {

                    $("#info_general").attr("value", json.observaciones_documentos_ganadores);
                    if (json.envio_documentos_ganadores === true) {
//                        $("#fieldset_top_general").attr("disabled", "");
//                        $("#fieldset_documentacion").attr("disabled", "");
//                        $("#fieldset_cuenta").attr("disabled", "");
//                        $("#fieldset_rut").attr("disabled", "");
//                        $("#fieldset_otros").attr("disabled", "");
//                        $("#fieldset_documentacion_convocatoria").attr("disabled", "");
//                        $("#fieldset_convocatoriadocumento").attr("disabled", "");
//                        $("#guardar_parametro_cuenta").attr("disabled", "");
//                        $("#actualizar_parametro_cuenta").attr("disabled", "");
//                        $("#guardar_parametro_rut").attr("disabled", "");
//                        $("#actualizar_parametro_rut").attr("disabled", "");
//                        $("#guardar_parametro_otros").attr("disabled", "");
//                        $("#actualizar_parametro_otros").attr("disabled", "");
//                        $("#guardar_parametro_convocatoriadocumento").attr("disabled", "");
//                        $("#actualizar_parametro_convocatoriadocumento").attr("disabled", "");
//                        $(".eliminar_archivo").attr("disabled", "");
                    }
                }
        }

    });
}



