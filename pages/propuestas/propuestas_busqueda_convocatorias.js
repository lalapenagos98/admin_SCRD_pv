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
            data: {"token": token_actual.token},
            url: url_pv + 'PropuestasBusquedasConvocatorias/formulario_convocatorias'
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

                    $("#modalidad").append('<option value="">:: Seleccionar ::</option>');
                    if (json.modalidades.length > 0) {
                        $.each(json.modalidades, function (key, modalidad) {
                            $("#modalidad").append('<option value="' + modalidad.id + '"  >' + modalidad.nombre + '</option>');
                        });
                    }

                    $("#programa").append('<option value="">:: Seleccionar ::</option>');
                    if (json.programas.length > 0) {
                        $.each(json.programas, function (key, programa) {
                            $("#programa").append('<option value="' + programa.id + '" >' + programa.nombre + '</option>');
                        });
                    }

                    //Cargos el select de convocatorias jurado
                    //WILLIAM BARBOSA 19 DE JUNIO DEL 2020
                    //Se elimina debido a que el componente no esta creado en el HTML
                    /*
                    $("#banco_jurado").append('<option value="">:: Seleccionar ::</option>');
                    if (json.convocatorias_jurados.length > 0) {
                        $.each(json.convocatorias_jurados, function (key, convocatoria_jurado) {
                            $("#banco_jurado").append('<option value="' + convocatoria_jurado.nombre + '" >' + convocatoria_jurado.nombre + '</option>');
                        });
                    }
                    */
                    $("#estado").append('<option value="">:: Seleccionar ::</option>');
                    $("#estado").append('<option value="5">Publicada</option>');
                    $("#estado").append('<option value="51">Abierta</option>');
                    $("#estado").append('<option value="52">Cerrada</option>');
                    
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
            "lengthMenu": [50, 60, 70],
            "ajax": {
                url: url_pv + "PropuestasBusquedasConvocatorias/busqueda_convocatorias",
                data: function (d) {
                    var params = new Object();
                    params.anio = $('#anio').val();
                    params.entidad = $('#entidad').val();
                    params.area = $('#area').val();
                    params.linea_estrategica = $('#linea_estrategica').val();
                    params.enfoque = $('#enfoque').val();
                    params.modalidad = $('#modalidad').val();
                    params.programa = $('#programa').val();
                    params.nombre = $('#nombre').val();
                    params.bancojurados = $('#bancojurados').val();
                    //WILLIAM BARBOSA 19 DE JUNIO DEL 2020
                    //Se elimina debido a que el componente no esta creado en el HTML
                    //params.banco_jurado = $('#banco_jurado').val();
                    params.estado = $('#estado').val();
                    d.params = JSON.stringify(params);
                    d.token = token_actual.token;
                },
            },
            "drawCallback": function (settings) {
                cargar_cronograma(token_actual);
            },
            "columns": [
                {"data": "estado_convocatoria"},
                {"data": "anio"},
                {"data": "programa"},
                {"data": "entidad"},
                {"data": "area"},
                {"data": "linea_estrategica"},
                {"data": "enfoque"},
                {"data": "convocatoria"},
                {"data": "categoria"},
                {"data": "ver_cronograma"},
                {"data": "ver_convocatoria"},
            ],
            "columnDefs": [{
                    "targets": 0,
                    "render": function (data, type, row, meta) {
                        if (row.modalidad == 2)
                        {
                            row.entidad = "Todas";
                        }
                        return row.estado_convocatoria;
                    }
                }
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

        $('#modalidad').change(function () {
            dataTable.draw();
        });

        $('#programa').change(function () {
            dataTable.draw();
        });

        $('#estado').change(function () {
            dataTable.draw();
        });
        
        //WILLIAM BARBOSA 19 DE JUNIO DEL 2020
        //Se elimina debido a que el componente no esta creado en el HTML
        /*
        $('#banco_jurado').change(function () {
            dataTable.draw();
        });
        */
       
        $('#bancojurados').change(function () {
            var checkbox = document.getElementById('bancojurados');
            var checked = checkbox.checked;
            alert(checked);

            if (checked === true)
            {
                alert("entre");

                $('#bancojurados').val() == "Banco de jurados 2020";
                alert($('#nombre').val());
                dataTable.draw();
            } else
            {
                alert("no entre");
                $('#bancojurados').val() == "";
                dataTable.draw();
            }
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

function form_tipo_convocatoria(page, id)
{
    //Verifico si el token exite en el cliente y verifico que el token este activo en el servidor                
    var token_actual = getLocalStorage(name_local_storage);

    //Verifico si el token esta vacio, para enviarlo a que ingrese de nuevo
    if ($.isEmptyObject(token_actual)) {
        location.href = url_pv_admin + 'index.html?msg=Su sesión ha expirado, por favor vuelva a ingresar.&msg_tipo=danger';
    } else
    {
        //Realizo la peticion para cargar el formulario
        $.ajax({
            type: 'POST',
            data: {"token": token_actual.token},
            url: url_pv + 'PropuestasBusquedasConvocatorias/validar_acceso/' + id
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
                                notify("danger", "ok", "Convocatorias:", "Ya tiene el máximo de propuestas guardadas permitidas para esta convocatoria, para visualizar sus propuestas por favor ingrese al menú Mis propuestas.");
                            } else
                            {
                                if (data == 'ingresar')
                                {
                                    var redirect = "";
                                    //Modalidades
                                    if (page == 1 || page == 3 || page == 4 || page == 6 || page == 5 || page == 7 || page == 8 || page == 9)
                                    {
                                        redirect = "/propuestas/perfiles";
                                    }
                                    //Modalidad de jurado
                                    if (page == 2)
                                    {
                                        redirect = "/propuestasjurados/perfil";
                                    }

                                    window.location.href = url_pv_admin + 'pages' + redirect + ".html?m=" + page + "&id=" + id + "&p=0";
                                }
                            }
                        }
                    }
                }
            }
        });
    }
}

function cargar_cronograma(token_actual)
{
    $(".cargar_cronograma").click(function () {
        var title = $(this).attr("title");

        //Realizo la peticion para cargar el formulario
        $.ajax({
            type: 'POST',
            data: {"token": token_actual.token},
            url: url_pv + 'PropuestasBusquedasConvocatorias/cargar_cronograma/' + title
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
                    var json = JSON.parse(data);
                    var html_table = '';
                    $("#table_cronogramas").html(html_table);
                    html_table = html_table + '<table class="table table-hover table-bordered"><thead><tr><th>Tipo de evento</th><th>Fecha(s)</th><th>Descripción</th></tr></thead><tbody>';
                    $.each(json, function (key2, evento) {
                        html_table = html_table + '<tr><td>' + evento.tipo_evento + '</td><td>' + evento.fecha + '</td><td>' + evento.descripcion + '</td></tr>';
                    });
                    html_table = html_table + '</tbody></table>';

                    $("#table_cronogramas").html(html_table);
                }
            }
        });
    });
}