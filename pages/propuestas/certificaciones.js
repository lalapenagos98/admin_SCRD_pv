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
                url: url_pv + "PropuestasParticipantes/buscar_certificaciones",
                data: function (d) {
                    var params = new Object();
                    d.params = JSON.stringify(params);
                    d.token = token_actual.token;
                    d.modulo = "Menu Participante";
                },
            },
            "columnDefs": [{
                    "targets": 0,
                    "render": function (data, type, row, meta) {

                        var redirect = url_pv_report+"reporte_certificacion.php";
                        var m = "";
                        var href = "";
                        
                        if (row.tipo_participante == 'Persona Natural')
                        {
                            m = "PN";                                
                        }
                        if (row.tipo_participante == 'Persona Jurídica')
                        {
                            m = "PJ";                                
                        }
                        if (row.tipo_participante == 'Agrupación')
                        {
                            m = "AGRU";                                
                        }
                        if (row.tipo_participante == 'Jurados')
                        {
                            m = "JUR";                                
                        }
                        
                        href = redirect + "?entidad=" + row.entidad + "&tp=" + m + "&id=" + row.codigo+ "&token=" + row.token;

                        if(m=="JUR")
                        {
                            row.ver_certificado = '<a><button style="margin: 0 0 5px 0" type="button" class="btn btn-success" data-toggle="modal" data-target="#certificaciones_jurados" title="Ver Postulaciones" onclick="certificaciones_jurados(\''+row.codigo+'\',\''+row.token+'\')"><span class="fa fa-download"></span></button></a>';
                        }
                        else
                        {
                            row.ver_certificado = '<a href="'+href+'" target="_blank"><button style="margin: 0 0 5px 0" type="button" class="btn btn-primary btn_tooltip" title="Generar Certificado"><span class="fa fa-download"></span></button></a>';
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
                {"data": "nombre_propuesta"},
                {"data": "codigo"},
                {"data": "tipo_participante"},
                {"data": "participante"},
                {"data": "ver_certificado"}
            ]
        });        
    }
});

function certificaciones_jurados(codigo,token){
    //Realizo la peticion para validar acceso a la convocatoria
    $.ajax({
        type: 'POST',
        data: {"codigo": codigo,"token": token},
        url: url_pv + 'PropuestasParticipantes/cargar_certificaciones_jurados'
    }).done(function (data) {
        
        var redirect = url_pv_report+"reporte_certificacion.php";
        var m = "JUR";                                
        
        var json = JSON.parse(data);                
        if (json.length > 0) {
                $("#tbody_certificados_jurados").find("tr").remove();
                $.each(json, function (key, c) {
                    
                    href = redirect + "?entidad=" + c.entidad + "&tp=" + m + "&id=" + c.id+ "&token=" + token;
                    
                    if(c.categoria=="")
                    {
                        $("#tbody_certificados_jurados").append('<tr><td>' + c.convocatoria + '</td><td>' + c.categoria + '</td><td><a href="'+href+'" target="_blank"><button style="margin: 0 0 5px 0" type="button" class="btn btn-primary btn_tooltip" title="Generar Certificado"><span class="fa fa-download"></span></button></a></td></tr>');                        
                    }
                    else
                    {
                        $("#tbody_certificados_jurados").append('<tr><td>' + c.categoria + '</td><td>' + c.convocatoria + '</td><td><a href="'+href+'" target="_blank"><button style="margin: 0 0 5px 0" type="button" class="btn btn-primary btn_tooltip" title="Generar Certificado"><span class="fa fa-download"></span></button></a></td></tr>');                        
                    }
                });
            }
    });
}
