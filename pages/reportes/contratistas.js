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
            permiso_lectura_keycloak(token_actual.token, "SICON-REPORTES-CONTRATISTAS");

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
                data: {"token": token_actual.token, "modulo": "SICON-REPORTES-CONTRATISTAS"},
                url: url_pv + 'Convocatorias/select_entidades_contratistas'
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

                            $("#entidad").append('<option value="">:: Seleccionar ::</option>');
                            if (json.entidades.length > 0) {
                                $.each(json.entidades, function (key, entidad) {
                                    $("#entidad").append('<option value="' + entidad.id + '"  >' + entidad.nombre + '</option>');
                                });
                            }
                        }
                    }
                }
            });

            //Cargar datos en la tabla actual
            var dataTable = $('#table_list').DataTable({
                "language": {
                    "url": "../../dist/libraries/datatables/js/spanish.json"
                },
                "processing": true,
                "serverSide": true,
                "lengthMenu": [50, 75, 100],
                "ajax": {
                    data: function (d) {
                        d.entidad = $('#entidad').val();
                        d.modulo = "SICON-REPORTES-CONTRATISTAS";
                        d.token = token_actual.token;
                    },
                    url: url_pv + 'Reportes/generar_reportes_contratistas',
                    type: "POST"
                },
                "drawCallback": function (settings) {
                    $(".cargar_contratista").click(function () {

                        //Realizo la peticion para cargar el formulario
                        $.ajax({
                            type: 'post',
                            data: {"token": token_actual.token},
                            url: url_pv + 'ConvocatoriasFormatos/buscar_contratista/' + $(this).attr("title")
                        }).done(function (data) {
                            if (data == 'error_metodo')
                            {
                                notify("danger", "ok", "Paises:", "Se registro un error en el método, comuníquese con la mesa de ayuda convocatorias@scrd.gov.co");
                            } else
                            {
                                if (data == 'error')
                                {
                                    notify("danger", "ok", "Paises:", "El pais no se encuentra registrado, por favor registrarse");
                                } else
                                {
                                    var json = JSON.parse(data);

                                    if (typeof json.id === 'number') {
                                        $('#form_nuevo_cronograma').loadJSON(data);
                                        $("#active option[value='" + json.active + "']").prop('selected', true);
                                    }
                                }
                            }
                        });
                    });
                },
                "columns": [
                    {"data": "entidad"},
                    {"data": "numero_documento"},
                    {"data": "primer_nombre"},
                    {"data": "segundo_nombre"},
                    {"data": "primer_apellido"},
                    {"data": "segundo_apellido"},
                    {"data": "active"},
                    {"data": "acciones"}
                ],
                "columnDefs": [{
                        "targets": 0,
                        "render": function (data, type, row, meta) {
                            if (row.active == true)
                            {
                                row.active = "Sí";
                            }
                            if (row.active == false)
                            {
                                row.active = "No";
                            }
                            return row.entidad;
                        }
                    }
                ]
            });

            $('#entidad').change(function () {
                dataTable.draw();
            });

            $('input[type="file"]').change(function (evt) {

                if ($("#entidad").val() == "")
                {
                    notify("danger", "ok", "Contratistas:", "Para poder cargar la base de contratistas debe seleccionar una entidad.");
                } else
                {
                    var f = evt.target.files[0];
                    var reader = new FileReader();

                    // Cierre para capturar la información del archivo.
                    reader.onload = function (fileLoadedEvent) {
                        var srcData = fileLoadedEvent.target.result; // <--- data: base64
                        var srcName = f.name;
                        var srcSize = f.size;
                        var srcType = f.type;
                        var token_actual = JSON.parse(JSON.stringify(keycloak));

                        var ext = srcName.split('.');
                        // ahora obtenemos el ultimo valor despues el punto
                        // obtenemos el length por si el archivo lleva nombre con mas de 2 puntos
                        srcExt = ext[ext.length - 1];
                        if (srcExt == "txt")
                        {
                            $.post(url_pv + 'ConvocatoriasFormatos/cargar_contratistas_csv', {srcData: srcData, srcName: srcName, srcSize: srcSize, srcType: srcType, token: token_actual.token, modulo: "SICON-REPORTES-CONTRATISTAS", entidad: $("#entidad").val()}).done(function (data) {
                                if (data == "error_columnas")
                                {
                                    notify("danger", "ok", "Contratistas:", "El archivo txt, no cumple con las columnas requeridas.");
                                } else
                                {
                                    if (data == "error_cabecera")
                                    {
                                        notify("danger", "ok", "Contratistas:", "El archivo txt, no cumple con la cabecera.");
                                    } else
                                    {
                                        notify("info", "ok", "Cargue exitoso:", data);
                                    }
                                }
                            });
                        } else
                        {
                            notify("danger", "ok", "Contratistas:", "Para poder cargar la base de contratistas, el archivo debe ser en formato txt.");
                        }


                    };
                    // Leer en el archivo como una URL de datos.                
                    reader.readAsDataURL(f);
                }

            });

            $('.close').click(function () {
                $("#form_nuevo_cronograma").bootstrapValidator('resetForm', true); //for older version
            });

            validator_form(token_actual, dataTable);
        }
    }
});

function validator_form(token_actual, dataTable) {
//Validar el formulario
    $('#form_nuevo_cronograma').bootstrapValidator({
        feedbackIcons: {
            valid: 'glyphicon glyphicon-ok',
            invalid: 'glyphicon glyphicon-remove',
            validating: 'glyphicon glyphicon-refresh'
        },
        fields: {
            numero_documento: {
                validators: {
                    notEmpty: {message: 'El número de documento es requerido'}
                }
            },
            primer_nombre: {
                validators: {
                    notEmpty: {message: 'El primer nombre es requerido'}
                }
            },
            segundo_nombre: {
                validators: {
                    notEmpty: {message: 'El segundo nombre es requerido'}
                }
            },
            primer_apellido: {
                validators: {
                    notEmpty: {message: 'El primer apellido es requerido'}
                }
            },
            segundo_apellido: {
                validators: {
                    notEmpty: {message: 'El segundo apellido es requerido'}
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

        //Realizo la peticion con el fin de editar el registro actual
        $.ajax({
            type: 'PUT',
            url: url_pv + 'ConvocatoriasFormatos/editar_contratista/' + $("#id_registro").attr('value'),
            data: $form.serialize() + "&modulo=SICON-REPORTES-CONTRATISTAS&token=" + token_actual.token
        }).done(function (result) {
            if (result == 'error')
            {
                notify("danger", "ok", "Contratistas:", "Se registro un error, comuníquese con la mesa de ayuda convocatorias@scrd.gov.co");
            } else
            {
                if (result == 'acceso_denegado')
                {
                    notify("danger", "remove", "Usuario:", "No tiene permisos para editar información.");
                } else
                {
                    if (isNaN(result))
                    {
                        notify("danger", "ok", "Contratistas:", "Se registro un error, comuníquese con la mesa de ayuda convocatorias@scrd.gov.co");
                    } else
                    {
                        notify("info", "ok", "Contratistas:", "Se edito el pais con éxito.");
                        dataTable.draw();
                    }
                }
            }
        });

        //$form.bootstrapValidator('disableSubmitButtons', false).bootstrapValidator('resetForm', true);
        bv.resetForm();
    });
}

