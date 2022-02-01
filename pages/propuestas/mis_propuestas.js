$(document).ready(function () {

    //Verifico si el token exite en el cliente y verifico que el token este activo en el servidor                
    var token_actual = getLocalStorage(name_local_storage);

    //Verifico si el token esta vacio, para enviarlo a que ingrese de nuevo
    if ($.isEmptyObject(token_actual)) {
        location.href = url_pv_admin + 'index.html?msg=Su sesión ha expirado, por favor vuelva a ingresar.&msg_tipo=danger';
    } else
    {

        //Verifica si el token actual tiene acceso de lectura
        permiso_lectura(token_actual, "Menu Participante");

        //Realizo la peticion para cargar el formulario
        $.ajax({
            type: 'GET',
            data: {"token": token_actual.token, "modulo": "Menu Participante"},
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
                                //21 por subsanar
                                //23 rechazada
                                //24 habilitada
                                //33 Recomendada como Ganadora  
                                if( estado_propuesta.id!=21 && estado_propuesta.id!=23 && estado_propuesta.id!=24 && estado_propuesta.id!=33)                                
                                {                                                                    
                                    $("#estado_propuesta").append('<option value="' + estado_propuesta.id + '" >' + estado_propuesta.nombre + '</option>');
                                }
                            });
                        }
                    }
                }
            }
        });

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
                "lengthMenu": [100, 150, 200],
                "ajax": {
                    url: url_pv + "PropuestasParticipantes/buscar_propuestas",
                    data: function (d) {
                        var params = new Object();
                        params.anio = $('#anio').val();
                        params.entidad = $('#entidad').val();
                        params.codigo = $('#codigo').val();
                        params.estado = $('#estado_propuesta').val();
                        d.params = JSON.stringify(params);
                        d.token = token_actual.token;
                        d.modulo = "Menu Participante";
                    },
                },
                "columnDefs": [{
                        "targets": 0,
                        "render": function (data, type, row, meta) {
                            
                            var redirect = "";
                            var m = "";
                            var href = "";
                            if (row.perfil == 6)
                            {
                                redirect = "perfil_persona_natural";
                                m = "pn";                                
                            }
                            if (row.perfil == 7)
                            {
                                redirect = "perfil_persona_juridica";
                                m = "pj";                                
                            }
                            if (row.perfil == 8)
                            {
                                redirect = "perfil_agrupacion";
                                m = "agr";                                
                            }
                            
                            href = redirect + ".html?m=" + m + "&id=" + row.id_convocatoria + "&p=" + row.id_propuesta;                                        
                            
                            $('.btn_tooltip').tooltip();
                            
                            //Creo los botones para acciones de cada fila de la tabla
                            if(row.id_estado==22)
                            {
                                row.ver_propuesta = '<a href="'+href+'" ><button style="margin: 0 0 5px 0" type="button" class="btn btn-warning btn_tooltip" title="Ver propuesta"><span class="fa fa-file-text-o"></span></button></a><br/><a href="subsanar_propuesta.html?id='+row.id_convocatoria+'&p='+row.id_propuesta+'&sub=1" ><button style="margin: 0 0 5px 0" type="button" class="btn btn-info btn_tooltip" title="Subsanar propuesta"><span class="fa fa-file-text-o"></span></button></a><br/><button style="margin: 0 0 5px 0" type="button" onclick="anular_propuesta('+row.id_propuesta+')" class="btn btn-danger btn_tooltip" title="Anular propuesta" data-toggle="modal" data-target="#anular_propuesta"><span class="fa fa-times-circle"></span></button>';                            
                            }
                            else
                            {
                                row.ver_propuesta = '<a href="'+href+'" ><button style="margin: 0 0 5px 0" type="button" class="btn btn-warning btn_tooltip" title="Ver propuesta"><span class="fa fa-file-text-o"></span></button></a><br/><button style="margin: 0 0 5px 0" type="button" onclick="anular_propuesta('+row.id_propuesta+')" class="btn btn-danger btn_tooltip" title="Anular propuesta" data-toggle="modal" data-target="#anular_propuesta"><span class="fa fa-times-circle"></span></button>';                            
                            }
                            
                            if( row.id_estado!=7 && row.id_estado!=20 )
                            {
                                href_propuesta = "encuestas.html?id="+row.id_propuesta;                                        
                                row.ver_propuesta = row.ver_propuesta+'<br/><a href="'+href_propuesta+'" ><button style="margin: 0 0 5px 0" type="button" class="btn btn-primary btn_tooltip" title="Ver encuesta"><span class="fa fa-edit"></span></button></a>';
                            }
                            
                            //Se agrega un nuevo boton en acciones cuando es ganador                            
                            if(row.id_estado==34)
                            {
                                //Solo para agrupaciones
                                if(row.perfil == 8)
                                {
                                    href_propuesta = "cambio_integrante.html?perfil=" + m + "&id=" + row.id_convocatoria + "&p=" + row.id_propuesta+"&sub=2";                              
                                    row.ver_propuesta = row.ver_propuesta+'<br/><a href="'+href_propuesta+'" ><button style="margin: 0 0 5px 0" type="button" class="btn btn-info btn_tooltip" title="Realizar cambio de integrante"><span class="fa fa-users"></span></button></a>';
                                }
                                
                                /*Wilmer Mogollón -- 26-09-2021 -- Agrego botón para documentación ganadores*/
                                href_propuesta = "documentacion_ganadores.html?m=" + m + "&id=" + row.id_convocatoria + "&p=" + row.id_propuesta;                              
                                row.ver_propuesta = row.ver_propuesta+'<br/><a href="'+href_propuesta+'" ><button style="margin: 0 0 5px 0" type="button" class="btn btn-success btn_tooltip" title="Documentación ganadores"><span class="fa fa-folder-o"></span></button></a>';
                                
                            }
                            
                           
                            //Valido el programa PDAC
                            if(row.programa==2)
                            {
                                if(row.fecha_subsanacion!=null)
                                {
                                    row.ver_reporte='<a href="'+url_pv_report+'reporte_propuesta_inscrita_pdac.php?id='+row.id_propuesta+'&token='+row.token+'" target="_blank"><button style="margin: 0 0 5px 0" type="button" class="btn btn-danger btn_tooltip" title="Reporte de propuesta inscrita"><span class="fa fa-bar-chart-o"></span></button></a><br/><a href="'+url_pv_report+'reporte_propuesta_subsanacion.php?id='+row.id_propuesta+'&token='+row.token+'" target="_blank"><button type="button" class="btn btn-info btn_tooltip" title="Reporte de propuesta subsanada"><span class="fa fa-bar-chart-o"></span></button></a>';
                                }
                                else
                                {
                                    row.ver_reporte='<a href="'+url_pv_report+'reporte_propuesta_inscrita_pdac.php?id='+row.id_propuesta+'&token='+row.token+'" target="_blank"><button type="button" class="btn btn-danger btn_tooltip" title="Reporte de propuesta inscrita"><span class="fa fa-bar-chart-o"></span></button></a>';
                                }
                            }
                            else
                            {
                                if(row.fecha_subsanacion!=null)
                                {
                                    row.ver_reporte='<a href="'+url_pv_report+'reporte_propuesta_inscrita.php?id='+row.id_propuesta+'&token='+row.token+'" target="_blank"><button style="margin: 0 0 5px 0" type="button" class="btn btn-danger btn_tooltip" title="Reporte de propuesta inscrita"><span class="fa fa-bar-chart-o"></span></button></a><br/><a href="'+url_pv_report+'reporte_propuesta_subsanacion.php?id='+row.id_propuesta+'&token='+row.token+'" target="_blank"><button type="button" class="btn btn-info btn_tooltip" title="Reporte de propuesta subsanada"><span class="fa fa-bar-chart-o"></span></button></a>';
                                }
                                else
                                {
                                    row.ver_reporte='<a href="'+url_pv_report+'reporte_propuesta_inscrita.php?id='+row.id_propuesta+'&token='+row.token+'" target="_blank"><button type="button" class="btn btn-danger btn_tooltip" title="Reporte de propuesta inscrita"><span class="fa fa-bar-chart-o"></span></button></a>';
                                }
                            }                                                        
                            
                            //Valido que sea los edtados en
                            //21 por subsanar
                            //23 rechazada
                            //24 habilitada
                            //33 Recomendada como Ganadora                              
                            //44 Recomendada como No Ganadora                              
                            if( row.id_estado===21 || row.id_estado===23 || row.id_estado===24 || row.id_estado===33 || row.id_estado===44)
                            {
                                row.estado="<b>Inscrita</b>";
                            }
                            else
                            {
                                row.estado="<b>"+row.estado+"</b>";
                            }                                                        
                            
                            var categoria = row.convocatoria;
                            
                            if (row.categoria != null) {
                                row.convocatoria = row.categoria;
                                row.categoria = categoria;
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
                    {"data": "tipo_participante"},
                    {"data": "participante"},
                    {"data": "ver_propuesta"},
                    {"data": "ver_reporte"}
                ]
            });
            $("#busqueda").attr("value", "1");
        } else
        {
            $('#table_list').DataTable().draw();
        }

        $('#buscar').click(function () {
                   $('#table_list').DataTable().draw();
        });                 
        
        $("#modal-btn-si").on("click", function () {
            
            if($("#justificacion_anulacion").val()=="")
            {
                notify("danger", "ok", "Propuesta:", "La justificación de la anulación de la propuesta es obligatoria.");
            }
            else
            {
                //Se realiza la peticion con el fin de guardar el registro actual
                $.ajax({
                    type: 'POST',
                    url: url_pv + 'Propuestas/anular_propuesta',
                    data: "modulo=Menu Participante&token=" + token_actual.token + "&propuesta=" + $("#id_propuesta").val()+"&justificacion_anulacion="+$("#justificacion_anulacion").val(),
                }).done(function (result) {

                    if (result == 'error_estado')
                    {
                        notify("danger", "ok", "Propuesta:", "Su propuesta no esta en estado registrada, por tal razón no puede ser anulada.");
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
                                        notify("danger", "remove", "Propuesta:", "La convocatoria se encuentra en estado cerrada, por tal razón no puede anular la propuesta.");
                                    } else
                                    {
                                        if (isNaN(result)) {
                                            notify("danger", "ok", "Propuesta:", "Se registro un error, comuníquese con la mesa de ayuda convocatorias@scrd.gov.co");
                                        } else
                                        {                                                                                
                                            notify("success", "ok", "Propuesta:", "Su propuesta fue anulada con éxito.");
                                            $('#table_list').DataTable().draw();
                                            $('#anular_propuesta').modal('toggle');
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
});

function anular_propuesta(id){
    $("#id_propuesta").val(id);
    $("#justificacion_anulacion").val("");
}