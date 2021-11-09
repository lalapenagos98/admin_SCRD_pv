$(document).ready(function () {

    //Verifico si el token exite en el cliente y verifico que el token este activo en el servidor                
    var token_actual = getLocalStorage(name_local_storage);

    //Verifico si el token esta vacio, para enviarlo a que ingrese de nuevo
    if ($.isEmptyObject(token_actual)) {
        location.href = url_pv_admin + 'index.html?msg=Su sesión ha expirado, por favor vuelva a ingresar.&msg_tipo=danger';
    } else
    {

        //Verifica si el token actual tiene acceso de lectura
        permiso_lectura(token_actual, "Subsanación de propuestas");

        //Realizo la peticion para cargar el formulario
        $.ajax({
            type: 'GET',
            data: {"token": token_actual.token, "modulo": "Subsanación de propuestas"},
            url: url_pv + 'Convocatorias/modulo_buscador_propuestas'
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
                                if (estado_propuesta.id != 7)
                                {
                                    $("#estado_propuesta").append('<option value="' + estado_propuesta.id + '" >' + estado_propuesta.nombre + '</option>');
                                }
                            });
                        }
                    }
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
                        type: 'GET',
                        data: {"modulo": "Subsanación de propuestas", "token": token_actual.token, "anio": $("#anio").val(), "entidad": $("#entidad").val()},
                        url: url_pv + 'PropuestasSubsanacion/select_convocatorias'
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
                    type: 'GET',
                    data: {"modulo": "Subsanación de propuestas", "token": token_actual.token, "conv": $("#convocatoria").val()},
                    url: url_pv + 'PropuestasSubsanacion/select_categorias'
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

        $('#buscar').click(function () {

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
                    $("#panel_periodo_actual").css("display","none");
                    notify("danger", "ok", "Convocatorias:", "Debe seleccionar la " + mensaje + ".");
                } else
                {
                    //Realizo la peticion para validar cargar las prouestas a subsanar
                    $.ajax({
                        type: 'POST',
                        data: {"token": token_actual.token},
                        url: url_pv + 'PropuestasSubsanacion/validar_acceso/' + $("#id_convocatoria").val()
                    }).done(function (data) {
                        
                        var json = JSON.parse(data);
                        
                        if (json.error == 'error_metodo')
                        {
                            $("#panel_periodo_actual").css("display","none");
                            notify("danger", "ok", "Convocatorias:", "Se registro un error en el método, comuníquese con la mesa de ayuda convocatorias@scrd.gov.co");
                        } else
                        {
                            if (json.error == 'error_token')
                            {
                                location.href = url_pv_admin + 'index.html?msg=Su sesión ha expirado, por favor vuelva a ingresar.&msg_tipo=danger';
                            } else
                            {
                                if (json.error == 'error_fecha_cierre')
                                {
                                    $("#panel_periodo_actual").css("display","none");
                                    notify("danger", "ok", "Convocatorias:", "La convocatoria no se encuentra disponible para ver las propuestas inscritas.");
                                } else
                                {
                                    if (json.error == 'ingresar')
                                    {
                                        $("#panel_periodo_actual").css("display","block");
                                        
                                        $("#periodo_actual").html(json.fecha);
                                        
                                        if ($("#busqueda").val() == "0")
                                        {                                                                                        
                                            //Cargar datos en la tabla actual
                                            cargar_tabla(token_actual);

                                            $("#busqueda").attr("value", "1");
                                        } else
                                        {
                                            $('#table_list').DataTable().draw();
                                        }
                                    } else
                                    {
                                        $("#panel_periodo_actual").css("display","none");
                                        
                                        notify("danger", "ok", "Convocatorias:", "Se registro un error en el método, comuníquese con la mesa de ayuda convocatorias@scrd.gov.co");
                                    }
                                }
                            }
                        }
                    });
                }

            } else
            {
                $("#panel_periodo_actual").css("display","none");
                notify("danger", "ok", "Propuestas:", "Debe seleccionar la convocatoria");
            }            

        });
        
        $('#enviar_notificaciones').click(function () {

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
                    //Realizo la peticion para enviar las notificaciones
                    $.ajax({
                        type: 'POST',
                        data: {"token": token_actual.token},
                        url: url_pv + 'PropuestasSubsanacion/enviar_notificaciones/' + $("#id_convocatoria").val()
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
                                    notify("danger", "ok", "Convocatorias:", "La convocatoria no se encuentra disponible para ver las propuestas inscritas.");
                                } else
                                {
                                    if (data == 'error_envio')
                                    {                                    
                                        notify("danger", "ok", "Subsanación:", "En algunas propuesta reporta error de envió de notificación, comuníquese con la mesa de ayuda convocatorias@scrd.gov.co");
                                    } else
                                    {
                                        if (data == 'ingresar')
                                        {
                                            notify("success", "ok", "Subsanación:", "Se envia las notificaciones con éxito.");
                                            $('#table_list').DataTable().draw();

                                        } else
                                        {
                                            notify("danger", "ok", "Convocatorias:", "Se registro un error en el método, comuníquese con la mesa de ayuda convocatorias@scrd.gov.co");
                                        }
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

        });

    }
});

function cargar_tabla(token_actual) {
    $('#table_list').DataTable({
        "language": {
            "url": "../../dist/libraries/datatables/js/spanish.json"
        },
        "searching": false,
        "processing": true,
        "serverSide": true,
        "ordering": false,
        "lengthMenu": [20, 30, 40],
        "ajax": {
            url: url_pv + "PropuestasSubsanacion/buscar_propuestas",
            data: function (d) {
                var params = new Object();
                params.anio = $('#anio').val();
                params.entidad = $('#entidad').val();
                params.convocatoria = $("#id_convocatoria").val();
                params.categoria = $('#categoria').val();                                
                d.params = JSON.stringify(params);
                d.token = token_actual.token;
                d.modulo = "Subsanación de propuestas";
            },
        },
        "columnDefs": [{
                "targets": 0,
                "render": function (data, type, row, meta) {
                    //Verificar cual es la categoria padre
                    var categoria = row.convocatoria;
                    if (row.categoria != "") {
                        row.convocatoria = row.categoria;
                        row.categoria = categoria;
                    }
                    
                    if (row.periodo_subsanacion == "Desde <b></b> hasta <b></b>") {
                        row.periodo_subsanacion="";
                    }
                    
                    
                                        
                    return row.estado;
                }
            }
        ],
        "columns": [
            {"data": "estado"},
            {"data": "anio"},
            {"data": "entidad"},
            {"data": "convocatoria"},
            {"data": "categoria"},
            {"data": "propuesta"},
            {"data": "codigo"},
            {"data": "participante"},
            {"data": "periodo_subsanacion"}            
        ]
    });
}

