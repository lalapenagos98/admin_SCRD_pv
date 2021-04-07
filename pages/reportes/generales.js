$(document).ready(function () {

    //Verifico si el token exite en el cliente y verifico que el token este activo en el servidor                
    var token_actual = getLocalStorage(name_local_storage);

    //Verifico si el token esta vacio, para enviarlo a que ingrese de nuevo
    if ($.isEmptyObject(token_actual)) {
        location.href = url_pv_admin + 'index.html?msg=Su sesión ha expirado, por favor vuelva a ingresar.&msg_tipo=danger';
    } else
    {

        //Verifica si el token actual tiene acceso de lectura
        permiso_lectura(token_actual, "Reporte Propuestas");

        //Realizo la peticion para cargar el formulario
        $.ajax({
            type: 'GET',
            data: {"token": token_actual.token, "modulo": "Reporte Propuestas"},
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
                    }
                }
            }
        });

        $('#anio').change(function () {

            $("#reportes_propuestas").css("display", "none");
        });

        $('#buscar').click(function () {

            if ($("#anio").val() == "")
            {
                notify("danger", "ok", "Propuestas:", "Debe seleccionar el año.");
            } else
            {
                //Realizo la peticion para validar cargar las prouestas a subsanar
                $.ajax({
                    type: 'GET',
                    data: {"token": token_actual.token, "modulo": "Reporte Propuestas", "anio": $("#anio").val()},
                    url: url_pv + 'Reportes/generar_reportes_generales'
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

                                $("#reporte_pn").empty();
                                $("#reporte_inhabilidades_propuesta").empty();                                
                                $(".fecha_actual").empty();

                                if (json.error == 'error_metodo')
                                {
                                    notify("danger", "ok", "Convocatorias:", "Se registro un error en el método, comuníquese con la mesa de ayuda convocatorias@scrd.gov.co");
                                } else
                                {
                                    if (json.error == 'error_token')
                                    {
                                        location.href = url_pv_admin + 'index.html?msg=Su sesión ha expirado, por favor vuelva a ingresar.&msg_tipo=danger';
                                    } else
                                    {
                                        if (data == 'acceso_denegado')
                                        {
                                            notify("danger", "remove", "Convocatorias:", "No tiene permisos para ver la información.");
                                        } else
                                        {
                                            $("#reportes_propuestas").css("display", "block");

                                            $("#reporte_pn").html(json.reporte_pn);
                                            $("#reporte_inhabilidades_propuesta").html(json.reporte_inhabilidades_propuesta);                                            
                                            $(".fecha_actual").html(json.fecha_actual);
                                            
                                            //Valido que sea solo numeros
                                            $('.input-number').on('input', function () { 
                                                this.value = this.value.replace(/[^0-9]/g,'');
                                            });
                                            
                                            $('#btn_pn').click(function () {
                                                var numero_documento = $("#pn_numero_documento").val();
                                                if(numero_documento=="")
                                                {
                                                    notify("danger", "remove", "Reportes:", "Debe ingresar el número de documento.");
                                                }
                                                else
                                                {                                                    
                                                    window.open(url_pv_report+'reporte_persona_natural.php?token='+token_actual.token+'&nd='+numero_documento+'&anio='+$("#anio").val(), '_blank');
                                                }                                                
                                            });         
                                            
                                            $('#btn_inhabilidades').click(function () {
                                                var codigos = $("#inhabilidades_codigos").val();
                                                window.open(url_pv_report+'reporte_inhabilidades_propuestas.php?codigos='+codigos+'&token='+token_actual.token, '_blank');                                                                                                
                                            }); 
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

