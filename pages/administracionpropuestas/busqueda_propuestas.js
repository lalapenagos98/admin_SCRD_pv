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
            permiso_lectura_keycloak(token_actual.token, "SICON-PROPUESTAS-BUSQUEDA");

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
                data: {"token": token_actual.token, "modulo": "SICON-PROPUESTAS-BUSQUEDA"},
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
                                    if( estado_propuesta.id===7 || estado_propuesta.id===8 || estado_propuesta.id===20 || estado_propuesta.id===21 || estado_propuesta.id===22 || estado_propuesta.id===23 || estado_propuesta.id===24 || estado_propuesta.id===31 || estado_propuesta.id===33 || estado_propuesta.id===34 || estado_propuesta.id===44|| estado_propuesta.id===53)                                
                                    {
                                        $("#estado_propuesta").append('<option value="' + estado_propuesta.id + '" >' + estado_propuesta.nombre + '</option>');                                        
                                    }    
                                });
                            }
                        }
                    }
                }
            });

            $('#buscar').click(function () {

                if ($("#codigo").val() != "")
                {
                    if ($("#busqueda").val() == "0")
                    {
                        //Cargar datos en la tabla actual
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
                                url: url_pv + "PropuestasBusquedas/buscar_propuestas",
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
                                    d.modulo = "SICON-PROPUESTAS-BUSQUEDA";
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
                                        return row.estado;
                                    }
                                }
                            ],
                            "drawCallback": function (settings) {
                                cargar_propuesta(token_actual);
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
                                {"data": "ver_reporte"},
                                {"data": "ver_propuesta"}
                            ]
                        });

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
                            //Realizo la peticion para validar acceso a la convocatoria
                            $.ajax({
                                type: 'POST',
                                data: {"token": token_actual.token},
                                url: url_pv + 'PropuestasBusquedas/validar_acceso/' + $("#id_convocatoria").val()
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
                                                            url: url_pv + "PropuestasBusquedas/buscar_propuestas",
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
                                                                d.modulo = "SICON-PROPUESTAS-BUSQUEDA";
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
                                                                    return row.estado;
                                                                }
                                                            }
                                                        ],
                                                        "drawCallback": function (settings) {
                                                            cargar_propuesta(token_actual);
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
                                                            {"data": "ver_reporte"},
                                                            {"data": "ver_propuesta"}
                                                        ]
                                                    });

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
                        $.ajax({
                            type: 'POST',
                            data: {"modulo": "SICON-PROPUESTAS-BUSQUEDA", "token": token_actual.token, "anio": $("#anio").val(), "entidad": $("#entidad").val()},
                            url: url_pv + 'PropuestasBusquedas/select_convocatorias'
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
                    $.ajax({
                        type: 'POST',
                        data: {"modulo": "SICON-PROPUESTAS-BUSQUEDA", "token": token_actual.token, "conv": $("#convocatoria").val()},
                        url: url_pv + 'PropuestasBusquedas/select_categorias'
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

        }
    }
});

function cargar_propuesta(token_actual)
{
    $("#info_propuesta").focus();

    $(".cargar_propuesta").click(function () {
        var title = $(this).attr("title");

        $("#propuesta").attr('value', title);

        //Realizo la peticion para cargar el formulario
        $.ajax({
            type: 'POST',
            data: {"token": token_actual.token},
            url: url_pv + 'PropuestasBusquedas/cargar_propuesta/' + title
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
                    var json = JSON.parse(data);

                    $('#info_propuesta').loadJSON(json.propuesta);
                    $(".tr_eliminar").remove();
                    $('#info_propuesta tbody').append(json.propuesta_dinamico);

                    var html_table = '';
                    $.each(json.administrativos, function (key2, documento) {
                        html_table = html_table + '<tr><td>' + documento.orden + '</td><td>' + documento.requisito + '</td><td>' + documento.descripcion + '</td><td>' + documento.archivos_permitidos + '</td><td>' + documento.tamano_permitido + ' MB</td><td><button title="' + documento.id + '" lang="' + documento.archivos_permitidos + '" dir="' + documento.tamano_permitido + '" type="button" class="btn btn-success btn_tecnico_documento" data-toggle="modal" data-target="#cargar_documento"><span class="glyphicon glyphicon-search"></span></button></td><td><button title="' + documento.id + '"  type="button" class="btn btn-primary btn_tecnico_link" data-toggle="modal" data-target="#cargar_link"><span class="glyphicon glyphicon-search"></span></button></td></tr>';
                    });

                    $('#tabla_administrativos tr').remove();
                    $("#tabla_administrativos").append(html_table);

                    html_table = '';
                    $.each(json.tecnicos, function (key2, documento) {
                        html_table = html_table + '<tr><td>' + documento.orden + '</td><td>' + documento.requisito + '</td><td>' + documento.descripcion + '</td><td>' + documento.archivos_permitidos + '</td><td>' + documento.tamano_permitido + ' MB</td><td><button title="' + documento.id + '" lang="' + documento.archivos_permitidos + '" dir="' + documento.tamano_permitido + '" type="button" class="btn btn-success btn_tecnico_documento" data-toggle="modal" data-target="#cargar_documento"><span class="glyphicon glyphicon-search"></span></button></td><td><button title="' + documento.id + '"  type="button" class="btn btn-primary btn_tecnico_link" data-toggle="modal" data-target="#cargar_link"><span class="glyphicon glyphicon-search"></span></button></td></tr>';
                    });

                    $('#tabla_tecnicos tr').remove();
                    $("#tabla_tecnicos").append(html_table);

                    $(".btn_tecnico_documento").click(function () {
                        var documento = $(this).attr("title");
                        cargar_tabla_archivos(token_actual, documento);
                    });

                    $(".btn_tecnico_link").click(function () {
                        var documento = $(this).attr("title");
                        cargar_tabla_link(token_actual, documento);
                    });

                }
            }
        });
    });
}

function cargar_tabla_archivos(token_actual, documento) {
    //Realizo la peticion para cargar el formulario
    $.ajax({
        type: 'POST',
        data: {documento: documento, "token": token_actual.token, modulo: "SICON-PROPUESTAS-BUSQUEDA", propuesta: $("#propuesta").attr('value')},
        url: url_pv + 'PropuestasBusquedas/buscar_archivos'
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
                if (data == 'crear_propuesta')
                {
                    notify("danger", "ok", "Convocatorias:", "Para poder inscribir la propuesta debe crear el perfil de agrupacion");
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
                        $.each(json, function (key2, documento) {
                            html_table = html_table + '<tr class="tr_' + documento.id + '"><td>' + documento.nombre + '</td><td><button type="button" onclick="download_file(\'' + documento.id_alfresco + '\')" class="btn btn-success"><span class="glyphicon glyphicon-save"></span></button></td></tr>';
                        });
                        $("#tabla_archivos").append(html_table);

                    }
                }

            }
        }
    });
}

function cargar_tabla_link(token_actual, documento) {
    //Realizo la peticion para cargar el formulario
    $.ajax({
        type: 'POST',
        data: {documento: documento, "token": token_actual.token, modulo: "SICON-PROPUESTAS-BUSQUEDA", propuesta: $("#propuesta").attr('value')},
        url: url_pv + 'PropuestasBusquedas/buscar_link'
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
                if (data == 'crear_propuesta')
                {
                    notify("danger", "ok", "Convocatorias:", "Para poder inscribir la propuesta debe crear el perfil de agrupacion");
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
                        $.each(json, function (key2, documento) {
                            html_table = html_table + '<tr class="tr_link_' + documento.id + '"><td><a href="' + documento.link + '" target="_blank">' + documento.link + '</a></td></tr>';
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