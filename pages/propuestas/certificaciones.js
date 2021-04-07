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

                        row.ver_certificado = '<a href="'+href+'" target="_blank"><button style="margin: 0 0 5px 0" type="button" class="btn btn-primary btn_tooltip" title="Generar Certificado"><span class="fa fa-download"></span></button></a>';
                        
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