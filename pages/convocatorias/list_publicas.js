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
            permiso_lectura_keycloak(token_actual.token, "SICON-AJUSTAR-CONVOCATORIAS");

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
                data: {"token": token_actual.token},
                url: url_pv + 'Convocatoriaspublicas/load_search'
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
                "lengthMenu": [50, 100, 150],
                "ajax": {
                    url: url_pv + "Convocatoriaspublicas/all",
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
                    type: "POST"
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
    }
});

function form_edit_publica(page, id)
{
    var url = "";
    var name = "";
    if (page == 1)
    {
        url = "update_publicas";
        name = "_self";

    }
    window.open(url + ".html?id=" + id, name);
}