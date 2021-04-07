$(document).ready(function () {

    //Verifico si el token exite en el cliente y verifico que el token este activo en el servidor                
    var token_actual = getLocalStorage(name_local_storage);

    //Verifico si el token esta vacio, para enviarlo a que ingrese de nuevo
    if ($.isEmptyObject(token_actual)) {
        location.href = url_pv_admin + 'index.html?msg=Su sesión ha expirado, por favor vuelva a ingresar.&msg_tipo=danger';
    } else
    {

        //Verifica si el token actual tiene acceso de lectura
        permiso_lectura(token_actual, "Reporte Contratistas");

        //Realizo la peticion para cargar el formulario
        $.ajax({
            type: 'GET',
            data: {"token": token_actual.token, "modulo": "Reporte Contratistas"},
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
                    d.modulo = "Reporte Contratistas";
                    d.token = token_actual.token;
                },
                url: url_pv + 'Reportes/generar_reportes_contratistas'
            },
            "drawCallback": function (settings) {
                $(".cargar_contratista").click(function () {

                    var token_actual = getLocalStorage(name_local_storage);

                    //Realizo la peticion para cargar el formulario
                    $.ajax({
                        type: 'GET',
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
                        if(row.active==true)
                        {
                            row.active="Sí";    
                        }
                        if(row.active==false)
                        {
                            row.active="No";    
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
                    var token_actual = getLocalStorage(name_local_storage);
                    
                    var ext = srcName.split('.');
                    // ahora obtenemos el ultimo valor despues el punto
                    // obtenemos el length por si el archivo lleva nombre con mas de 2 puntos
                    srcExt = ext[ext.length - 1];                                                                                                
                    if (srcExt == "txt")
                    {
                        $.post(url_pv + 'ConvocatoriasFormatos/cargar_contratistas_csv', {srcData: srcData, srcName: srcName, srcSize: srcSize, srcType: srcType, token: token_actual.token, modulo: "Reporte Contratistas", entidad: $("#entidad").val()}).done(function (data) {
                            if (data == "error_columnas")
                            {
                                notify("danger", "ok", "Contratistas:", "El archivo csv, no cumple con las columnas requeridas.");
                            } else
                            {
                                if (data == "error_cabecera")
                                {
                                    notify("danger", "ok", "Contratistas:", "El archivo csv, no cumple con la cabecera.");
                                } else
                                {
                                    notify("info", "ok", "Cargue exitoso:", data);
                                }
                            }
                        });
                    } else
                    {
                        notify("danger", "ok", "Contratistas:", "Para poder cargar la base de contratistas, el archivo debe ser en formato csv.");
                    }


                };
                // Leer en el archivo como una URL de datos.                
                reader.readAsDataURL(f);
            }

        });

        $('.close').click(function () {
            $("#form_nuevo_cronograma").bootstrapValidator('resetForm', true); //for older version
        });

        validator_form(token_actual,dataTable);
    }
});

function validator_form(token_actual,dataTable) {
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
            data: $form.serialize() + "&modulo=Paises&token=" + token_actual.token
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

