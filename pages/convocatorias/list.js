$(document).ready(function () {

    //Verifico si el token exite en el cliente y verifico que el token este activo en el servidor                
    var token_actual = getLocalStorage(name_local_storage);

    //Verifico si el token esta vacio, para enviarlo a que ingrese de nuevo
    if ($.isEmptyObject(token_actual)) {
        location.href = url_pv_admin + 'index.html?msg=Su sesión ha expirado, por favor vuelva a ingresar.&msg_tipo=danger';
    } else
    {

        //Verifica si el token actual tiene acceso de lectura
        permiso_lectura(token_actual, "Convocatorias");

        //Realizo la peticion para cargar el formulario
        $.ajax({
            type: 'GET',
            data: {"token": token_actual.token},
            url: url_pv + 'Convocatorias/load_search'
        }).done(function (data) {
            if (data == 'error_metodo')
            {
                notify("danger", "ok", "Convocatorias:", "Se registro un error en el método, comuníquese con la mesa de ayuda convocatorias@scrd.gov.co");
            } else
            {
                if (data == 'error')
                {
                    location.href = url_pv_admin + 'index.html?msg=Su sesión ha expirado, por favor vuelva a ingresar.&msg_tipo=danger';
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

                    $("#area").append('<option value="">:: Seleccionar ::</option>');
                    if (json.areas.length > 0) {
                        $.each(json.areas, function (key, area) {
                            $("#area").append('<option value="' + area.id + '"  >' + area.nombre + '</option>');
                        });
                    }

                    $("#linea_estrategica").append('<option value="">:: Seleccionar ::</option>');
                    if (json.lineas_estrategicas.length > 0) {
                        $.each(json.lineas_estrategicas, function (key, linea_estrategica) {
                            $("#linea_estrategica").append('<option value="' + linea_estrategica.id + '"  >' + linea_estrategica.nombre + '</option>');
                        });
                    }

                    $("#enfoque").append('<option value="">:: Seleccionar ::</option>');
                    if (json.enfoques.length > 0) {
                        $.each(json.enfoques, function (key, enfoque) {
                            $("#enfoque").append('<option value="' + enfoque.id + '"  >' + enfoque.nombre + '</option>');
                        });
                    }

                    $("#programa").append('<option value="">:: Seleccionar ::</option>');
                    if (json.programas.length > 0) {
                        $.each(json.programas, function (key, programa) {
                            $("#programa").append('<option value="' + programa.id + '" >' + programa.nombre + '</option>');
                        });
                    }

                    if (json.estados_convocatorias.length > 0) {
                        $.each(json.estados_convocatorias, function (key, estado) {

                            if (estado.id == 1) {
                                var style_class = 'panel-primary';
                                var style_class_number = 'estados estado_1';
                                var icono_class = 'fa-save';
                            }
                            if (estado.id == 2) {
                                var style_class = 'panel-default';
                                var style_class_number = 'estados estado_2';
                                var icono_class = 'fa-check-circle';
                            }
                            if (estado.id == 3) {
                                var style_class = 'panel-yellow';
                                var style_class_number = 'estados estado_3';
                                var icono_class = 'fa-eye';
                            }
                            if (estado.id == 4) {
                                var style_class = 'panel-info';
                                var style_class_number = 'estados estado_4';
                                var icono_class = 'fa-check-circle-o';
                            }
                            if (estado.id == 5) {
                                var style_class = 'panel-green';
                                var style_class_number = 'estados estado_5';
                                var icono_class = 'fa-cloud-upload';
                            }
                            
                            if (estado.id == 6) {
                                var style_class = 'panel-warning';
                                var style_class_number = 'estados estado_6';
                                var icono_class = 'fa-child';
                            }
                            
                            $("#filtros_estados_convocatorias").append('<div class="col-lg-2 col-md-6"><div class="panel ' + style_class + '"><div class="panel-heading"><div class="row"><div class="col-xs-3"><i class="fa ' + icono_class + ' fa-5x"></i></div><div class="col-xs-9 text-right"><div class="huge ' + style_class_number + '">0</div><div>' + estado.nombre + '</div></div></div></div><a href="javascript:void(0)" class="estado_filter" title="' + estado.id + '"><div class="panel-footer"><span class="pull-left">Filtrar convocatorias</span><span class="pull-right"><i class="fa fa-arrow-circle-right"></i></span><div class="clearfix"></div></div></a></div></div>');
                        });
                        //Panel para filtrar todas los estados
                        //$("#filtros_estados_convocatorias").append('<div class="col-lg-2 col-md-6"><div class="panel panel-default"><div class="panel-heading"><div class="row"><div class="col-xs-3"><i class="fa fa-search fa-5x"></i></div><div class="col-xs-9 text-right"><div class="huge estados estado_total">0</div><div>Total</div></div></div></div><a href="javascript:void(0)" class="estado_filter" title=""><div class="panel-footer"><span class="pull-left">Filtrar convocatorias</span><span class="pull-right"><i class="fa fa-arrow-circle-right"></i></span><div class="clearfix"></div></div></a></div></div>');                        
                    }

                }
            }
        });

        //Cargar datos en la tabla actual
        var dataTable = $('#table_list').DataTable({
            "language": {
                "url": "../../dist/libraries/datatables/js/spanish.json"
            },
            "searching": false,
            "processing": true,
            "serverSide": true,
            "ordering": false,
            "lengthMenu": [20, 30, 40],
            "ajax": {
                url: url_pv + "Convocatorias/all",
                data: function (d) {
                    var params = new Object();
                    params.anio = $('#anio').val();
                    params.entidad = $('#entidad').val();
                    params.area = $('#area').val();
                    params.linea_estrategica = $('#linea_estrategica').val();
                    params.enfoque = $('#enfoque').val();
                    params.programa = $('#programa').val();
                    params.nombre = $('#nombre').val();
                    params.estado = $('#estado').val();
                    d.params = JSON.stringify(params);
                    d.token = token_actual.token;
                },
            },
            "drawCallback": function (settings) {
                $(".estados").html("0");
                var json = settings.json;
                $(".estado_total").html(json["recordsTotal"]);
                $.each(json["dataEstados"], function (key, value) {
                    $(".estado_" + value["estado"]).html(value["total"]);
                });

                $('.estado_filter').click(function () {
                    $("#estado").val($(this).attr("title"));
                    dataTable.draw();
                });
                
                $('.convocatoria_publicar').click(function () {
                    $("#convocatoria_publicar").val($(this).attr("title"));                    
                });
                
                $('.convocatoria_cancelar').click(function () {
                    //Convocatoria principal
                    $("#convocatoria_cancelar").val($(this).attr("title"));                    
                    //Verificar si es una convocatoria especial
                    $("#convocatoria_diferente").val($(this).attr("lang"));                                        
                    
                    if($("#convocatoria_diferente").val()=="t")
                    {
                        $.ajax({
                            type: 'GET',
                            data: {"modulo": "Convocatorias", "token": token_actual.token, "id": $("#convocatoria_cancelar").val()},
                            url: url_pv + 'Convocatorias/select_convocatoria_categorias'
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

                                    $('#convocatoria_diferente_categoria').find('option').remove();
                                    $("#convocatoria_diferente_categoria").append('<option value="">:: Seleccionar ::</option>');
                                    $.each(json, function (key, value) {
                                        $("#convocatoria_diferente_categoria").append('<option value="' + value.id + '">' + value.nombre + '</option>');
                                    });
                                }
                            }
                        });
                        
                        
                        $("#convocatoria_categorias_diferente").css("display","block");                        
                    }
                    else
                    {
                        $("#convocatoria_categorias_diferente").css("display","none");                        
                    }
                });
                
                $('#publicar_convocatoria').click(function () {
                    
                    $.ajax({
                        type: 'GET',
                        data: {"token": token_actual.token, "id": $("#convocatoria_publicar").val()},
                        url: url_pv + 'Convocatorias/publicar_convocatoria'
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
                                if (data == 'error_publicacion')
                                {                                    
                                    notify("danger", "ok", "Convocatorias:", "No cuenta con permisos para cambiar el estado de la convocatoria");
                                } else
                                {
                                    if (data == 'error')
                                    {
                                        notify("danger", "ok", "Convocatorias:", "Se registro un error al editar, comuníquese con la mesa de ayuda convocatorias@scrd.gov.co");
                                    } else
                                    {
                                        notify("success", "ok", "Convocatorias:", "Se publico la convocatoria con éxito.");
                                        dataTable.draw();
                                    }                                    
                                }
                            }
                        }
                    });
                });
                
                $('#cancelar_convocatoria').click(function () {
                    
                    var convocatoria_cancelar = $("#convocatoria_cancelar").val();
                    
                    if($("#convocatoria_diferente").val()=="t")
                    {
                        convocatoria_cancelar = $("#convocatoria_diferente_categoria").val();
                    }
                    
                    $.ajax({
                        type: 'GET',
                        data: {"token": token_actual.token, "id": convocatoria_cancelar},
                        url: url_pv + 'Convocatorias/cancelar_convocatoria'
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
                                if (data == 'error_publicacion')
                                {                                    
                                    notify("danger", "ok", "Convocatorias:", "No cuenta con permisos para cambiar el estado de la convocatoria");
                                } else
                                {
                                    if (data == 'error')
                                    {
                                        notify("danger", "ok", "Convocatorias:", "Se registro un error al editar, comuníquese con la mesa de ayuda convocatorias@scrd.gov.co");
                                    } else
                                    {
                                        notify("success", "ok", "Convocatorias:", "Se cancelo la convocatoria con éxito.");
                                        dataTable.draw();
                                    }                                    
                                }
                            }
                        }
                    });
                });

                $(".check_activar_t").attr("checked", "true");
                $(".check_activar_f").removeAttr("checked");
                acciones_convocatoria(token_actual);

            },
            "columns": [
                {"data": "estado_convocatoria"},
                {"data": "anio"},
                {"data": "programa"},
                {"data": "entidad"},
                {"data": "area"},
                {"data": "linea_estrategica"},
                {"data": "enfoque"},
                {"data": "nombre"},                
                {"data": "ver_convocatoria"},
                {"data": "publicar"},
                {"data": "cancelar"},
                {"data": "acciones"}
            ]
        });

        $('#anio').change(function () {
            dataTable.draw();
        });

        $('#entidad').change(function () {
            dataTable.draw();
        });

        $('#area').change(function () {
            dataTable.draw();
        });

        $('#linea_estrategica').change(function () {
            dataTable.draw();
        });

        $('#enfoque').change(function () {
            dataTable.draw();
        });

        $('#programa').change(function () {
            dataTable.draw();
        });

        $('#nombre').on('keyup', function () {
            if (this.value.length > 3)
            {
                dataTable.draw();
            } else
            {
                if ($('#nombre').val() == "")
                {
                    dataTable.draw();
                }
            }
        });

    }
});

function acciones_convocatoria(token_actual)
{
    //Permite activar o eliminar una categoria
    $(".activar_categoria").click(function () {

        var active = "false";
        if ($(this).prop('checked')) {
            active = "true";
        }


        $.ajax({
            type: 'DELETE',
            data: {"token": token_actual.token, "modulo": "Convocatorias", "active": active},
            url: url_pv + 'Convocatorias/delete_categoria/' + $(this).attr("title")
        }).done(function (data) {
            if (data == 'ok')
            {
                if (active == "true")
                {
                    notify("info", "ok", "Convocatorias:", "Se activó la convocatoria con éxito.");
                } else
                {
                    notify("info", "ok", "Convocatorias:", "Se inactivó la convocatoria con éxito.");
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
        });
    });
}
