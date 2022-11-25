$(document).ready(function () {

    //Verifico si el token exite en el cliente y verifico que el token este activo en el servidor                
    var token_actual = getLocalStorage(name_local_storage);

    var href_regresar = "";
    var href_siguiente = "";
    //Creando link de navegación
    if (getURLParameter('m') == "pj")
    {
        href_regresar = "objetivos_metas_actividades.html?m=" + getURLParameter('m') + "&id=" + getURLParameter('id') + "&p=" + getURLParameter('p');
        href_siguiente = "territorios_poblaciones.html?m=" + getURLParameter('m') + "&id=" + getURLParameter('id') + "&p=" + getURLParameter('p');
    }

    $("#link_equipo").attr("onclick", "location.href = '" + href_regresar + "'");
    $("#link_territorio").attr("onclick", "location.href = '" + href_siguiente + "'");

    //Verifico si el token esta vacio, para enviarlo a que ingrese de nuevo
    if ($.isEmptyObject(token_actual)) {
        location.href = url_pv_admin + 'index.html?msg=Su sesión ha expirado, por favor vuelva a ingresar.&msg_tipo=danger';
    } else
    {
        //Valido el id de la propuesta
        if (Number.isInteger(parseInt(getURLParameter('p'))))
        {
            
            $('#insumo').on('change', function() {
                $('#unidadmedida').find('option').remove();
                $("#unidadmedida").append('<option value="" >::Seleccionar::</option>');
                if( this.value === 'Honorarios equipo de trabajo'){
                    $("#unidadmedida").append('<option value="Artistas" >Artistas</option>');
                    $("#unidadmedida").append('<option value="Formadores" >Formadores</option>');
                    $("#unidadmedida").append('<option value="Director" >Director</option>');
                    $("#unidadmedida").append('<option value="Coordinador" >Coordinador</option>');
                    $("#unidadmedida").append('<option value="Productor" >Productor</option>');
                    $("#unidadmedida").append('<option value="Diseñador" >Diseñador</option>');
                    $("#unidadmedida").append('<option value="Presentador" >Presentador</option>');
                    $("#unidadmedida").append('<option value="Conferencista" >Conferencista</option>');
                    $("#unidadmedida").append('<option value="Apoyo administrativo" >Apoyo administrativo</option>');
                    $("#unidadmedida").append('<option value="Personal técnico" >Personal técnico</option>');
                    $("#unidadmedida").append('<option value="Personal logístico" >Personal logístico</option>');
                    $("#unidadmedida").append('<option value="Investigadores" >Investigadores</option>');
                }
                if( this.value === 'Premios y reconocimientos'){
                    $("#unidadmedida").append('<option value="Premios y reconocimientos" >Premios y reconocimientos</option>');
                }
                if( this.value === 'Alquileres'){
                    $("#unidadmedida").append('<option value="Sonido e iluminación" >Sonido e iluminación</option>');
                    $("#unidadmedida").append('<option value="Tarimas y sillas" >Tarimas y sillas</option>');
                    $("#unidadmedida").append('<option value="Carpas y pisos" >Carpas y pisos</option>');
                    $("#unidadmedida").append('<option value="Escenarios o salones" >Escenarios o salones</option>');
                    $("#unidadmedida").append('<option value="Equipos" >Equipos</option>');
                    $("#unidadmedida").append('<option value="Instrumentos" >Instrumentos</option>');
                }
                
                if( this.value === 'Producción'){
                    $("#unidadmedida").append('<option value="Montajes de exposiciones o eventos" >Montajes de exposiciones o eventos</option>');
                    $("#unidadmedida").append('<option value="Escenografía" >Escenografía</option>');
                    $("#unidadmedida").append('<option value="Utilería" >Utilería</option>');
                    $("#unidadmedida").append('<option value="Diseño de vestuario " >Diseño de vestuario </option>');
                    $("#unidadmedida").append('<option value="Materiales o insumos" >Materiales o insumos</option>');
                    $("#unidadmedida").append('<option value="Logística" >Logística</option>');
                    $("#unidadmedida").append('<option value="Seguridad" >Seguridad</option>');
                }
                
                
                if( this.value === 'Transporte'){
                    $("#unidadmedida").append('<option value="Transporte aéreo " >Transporte aéreo</option>');
                    $("#unidadmedida").append('<option value="Transporte terrestre" >Transporte terrestre</option>');
                    $("#unidadmedida").append('<option value="Transporte de carga" >Transporte de carga</option>');
                }
                
                
                if( this.value === 'Alojamiento'){
                    $("#unidadmedida").append('<option value="Alojamiento y hospedaje" >Alojamiento y hospedaje</option>');                    
                }
                
                
                if( this.value === 'Alimentación'){
                    $("#unidadmedida").append('<option value="Refrigerios" >Refrigerios</option>');
                    $("#unidadmedida").append('<option value="Hidratación" >Hidratación</option>');
                    $("#unidadmedida").append('<option value="Alimentación" >Alimentación</option>');                    
                }
                
                
                if( this.value === 'Divulgación y publicidad'){
                    $("#unidadmedida").append('<option value="Diseño de páginas web y redes sociales" >Diseño de páginas web y redes sociales</option>');
                    $("#unidadmedida").append('<option value="Impresión" >Impresión</option>');
                    $("#unidadmedida").append('<option value="Diseño de piezas publicitarias" >Diseño de piezas publicitarias</option>');
                    $("#unidadmedida").append('<option value="Pauta en medios" >Pauta en medios</option>');
                    $("#unidadmedida").append('<option value="Transmisión por radio, tv o redes sociales" >Transmisión por radio, tv o redes sociales</option>');
                }
                                
                if( this.value === 'Permisos y derechos de autor'){
                    $("#unidadmedida").append('<option value="Derechos de autor" >Derechos de autor</option>');
                    $("#unidadmedida").append('<option value="Otros permisos" >Otros permisos</option>');
                }
                
                
            });
            
            $( "#cargar_alerta" ).click(function() {
                $("#mi-modal").modal('show');

                var modalConfirm = function (callback) {
                    $("#modal-btn-si").on("click", function () {
                        callback(true);
                        $("#mi-modal").modal('hide');
                    });

                    $("#modal-btn-no").on("click", function () {
                        callback(false);
                        $("#mi-modal").modal('hide');
                    });
                };
                
                modalConfirm(function (confirm) {
                    if (confirm) {
                        setTimeout(function () {
                            location.href = url_pv_admin + 'pages/propuestas/territorios_poblaciones.html?m=' + getURLParameter('m') + '&id=' + $("#conv").attr('value') + '&p=' + getURLParameter('p');
                        }, 1800);
                    }                    
                });
                
            });
            
            

            $('.separador_miles').number(true);

            //Realizo la peticion para validar acceso a la convocatoria
            $.ajax({
                type: 'POST',
                data: {"token": token_actual.token, "p": getURLParameter('p')},
                url: url_pv + 'PropuestasBusquedasConvocatorias/validar_acceso/' + $("#id").val()
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
                                    location.href = url_pv_admin + 'pages/propuestas/propuestas_busqueda_convocatorias.html?msg=Ya tiene el máximo de propuestas guardadas permitidas para esta convocatoria, para visualizar sus propuestas por favor ingrese al menú Mis propuestas.&msg_tipo=danger';
                                } else
                                {
                                    if (data == 'error_propuesta')
                                    {
                                        location.href = url_pv_admin + 'pages/propuestas/propuestas_busqueda_convocatorias.html?msg=El código de la propuesta no es valido.&msg_tipo=danger';
                                    } else
                                    {
                                        if (data == 'error_participante')
                                        {
                                            location.href = url_pv_admin + 'pages/index/index.html?msg=Para poder inscribir la propuesta debe crear al menos un perfil como participante.&msg_tipo=danger';
                                        } else
                                        {
                                            if (data == 'ingresar')
                                            {
                                                //Asignamos el valor a input conv
                                                $("#conv").attr('value', getURLParameter('id'));
                                                $("#id").attr('value', getURLParameter('p'));

                                                //disabled todos los componentes
                                                $("#formulario_principal input,textarea,select,button[type=submit]").attr("disabled", "disabled");
                                                

                                                //Verifica si el token actual tiene acceso de lectura
                                                permiso_lectura(token_actual, "Menu Participante");

                                                //Realizo la peticion para cargar el formulario
                                                $.ajax({
                                                    type: 'GET',
                                                    data: {"token": token_actual.token, "conv": $("#conv").attr('value'), "modulo": "Menu Participante", "m": getURLParameter('m'), "p": getURLParameter('p')},
                                                    url: url_pv + 'PropuestasPdac/buscar_propuesta/'
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
                                                            if (data == 'acceso_denegado')
                                                            {
                                                                notify("danger", "remove", "Convocatorias:", "No tiene permisos para ver la información.");
                                                            } else
                                                            {
                                                                if (data == 'crear_perfil')
                                                                {
                                                                    location.href = url_pv_admin + 'pages/perfilesparticipantes/persona_natural.html?msg=Para poder inscribir la propuesta debe crear el perfil de persona natural.&msg_tipo=danger';
                                                                } else
                                                                {
                                                                    if (data == 'error_cod_propuesta')
                                                                    {
                                                                        location.href = url_pv_admin + 'pages/propuestas/propuestas_busqueda_convocatorias.html?msg=El código de la propuesta no es valido.&msg_tipo=danger';
                                                                    } else
                                                                    {

                                                                        var json = JSON.parse(data);

                                                                        //Limpio select de categorias
                                                                        $('#actividad').find('option').remove();

                                                                        $("#actividad").append('<option value="" >::Seleccionar::</option>');

                                                                        //Cargo el select de las categorias                                                
                                                                        if (json.actividades.length > 0) {
                                                                            $.each(json.actividades, function (key, actividad) {
                                                                                $("#actividad").append('<option value="' + actividad.id + '" >' + actividad.actividad + '</option>');
                                                                            });
                                                                        }

                                                                        //eliminó disabled todos los componentes
                                                                        if (json.estado == 7)
                                                                        {
                                                                            $("#formulario_principal input,textarea,select,button[type=submit]").removeAttr("disabled");

                                                                            $("#valortotal").attr("disabled", "disabled");
                                                                            $("#aportepropio").attr("disabled", "disabled");

                                                                        }

                                                                        //Cargo los parametros obligatorios
                                                                        $("#validator").attr("value", JSON.stringify(json.validator));

                                                                        //Valido formulario
                                                                        validator_form(token_actual);

                                                                        //Creo la tabla de objetivos
                                                                        cargar_tabla_presupuesto(token_actual);
                                                                    }
                                                                }

                                                            }
                                                        }
                                                    }
                                                });
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            });

            //Limpio el formulario
            $('#nuevo_presupuesto').on('hidden.bs.modal', function () {
                $("#id_registro_4").val("");

                $("#insumo").val("");
                $("#cantidad").val("");
                $("#unidadmedida").val("");
                $("#valorunitario").val("");
                $("#valortotal").val("");
                $("#aportesolicitado").val("");
                $("#aportecofinanciado").val("");
                $("#aportepropio").val("");

                $("#formulario_principal").data('bootstrapValidator').resetForm();
                $("#formulario_principal").bootstrapValidator('resetForm', true);
            });

            $("#generar_presupuesto").click(function () {
                
                $.AjaxDownloader({
                    data : {
                        propuesta   : getURLParameter('p'),
                        token   : token_actual.token                        
                    },
                    url: url_pv + 'PropuestasFormatos/propuesta_presupuesto_xls/'
                });
            });

        } else
        {
            location.href = url_pv_admin + 'pages/propuestas/propuestas_busqueda_convocatorias.html?msg=El código de la propuesta no es valido.&msg_tipo=danger';
        }

    }

    $(".contar_caracteres").keyup(function () {
        var total = $(this).attr("title");
        var total_text = $(this).val().length;
        var obj = $(this).attr("id");
        var total_actual = total - total_text;
        if (total_actual <= 0)
        {
            total_actual = 0;
        }
        $(".caracter_" + obj).html(total_actual);
    });

    calcular_totales();

});

function calcular_totales() {
    $(".calcular_valor_total").focusout(function () {
        var cantidad = $("#cantidad").val();
        var valorunitario = $("#valorunitario").val();
        var valortotal = parseInt(cantidad) * parseInt(valorunitario);

        if (Number.isInteger(parseInt(valortotal)))
        {
            $("#valortotal").val(valortotal);
        }

        var valortotal = $("#valortotal").val();

        if (valortotal > 0)
        {
            var aportesolicitado = $("#aportesolicitado").val();
            var aportecofinanciado = $("#aportecofinanciado").val();
            var total = parseInt(aportesolicitado) + parseInt(aportecofinanciado);
            var aportepropio = valortotal - total;
            if (total >= 0)
            {
                if (aportepropio >= 0 && aportepropio <= valortotal)
                {
                    $("#aportepropio").val(aportepropio);
                } else
                {
                    $("#aportepropio").val("");
                    notify("danger", "ok", "Presupuesto:", "El aporte recursos propios, no puede ser mayor o menor al Valor Total.");
                }
            }
        } else
        {
            $("#aportesolicitado").val("0");
            $("#aportecofinanciado").val("0");
            $("#aportepropio").val("");
        }
    });
}

function validator_form(token_actual) {

    //Validar el formulario    
    $('.formulario_principal').bootstrapValidator({
        feedbackIcons: {
            valid: 'glyphicon glyphicon-ok',
            invalid: 'glyphicon glyphicon-remove',
            validating: 'glyphicon glyphicon-refresh'
        },
        excluded: [':disabled'],
        fields: {
            propuestaactividad: {
                validators: {
                    notEmpty: {message: 'La actividad, es requerido'}
                }
            },
            insumo: {
                validators: {
                    notEmpty: {message: 'El insumo, es requerido'}
                }
            },
            unidadmedida: {
                validators: {
                    notEmpty: {message: 'La unidad de medida, es requerido'}
                }
            },
            cantidad: {
                validators: {
                    notEmpty: {message: 'La cantidad, es requerido'},
                    integer: {message: 'Solo se permite números'}
                }
            },
            valorunitario: {
                validators: {
                    notEmpty: {message: 'El valor unitario, es requerido'},
                    integer: {message: 'Solo se permite números'}
                }
            },
            valortotal: {
                validators: {
                    notEmpty: {message: 'El valor total, es requerido'},
                    integer: {message: 'Solo se permite números'}
                }
            },
            aportesolicitado: {
                validators: {
                    notEmpty: {message: 'El aporte solicitado concertación, es requerido'},
                    integer: {message: 'Solo se permite números'}
                }
            },
            aportecofinanciado: {
                validators: {
                    notEmpty: {message: 'El aporte cofinanciado por terceros, es requerido'},
                    integer: {message: 'Solo se permite números'}
                }
            },
            aportepropio: {
                validators: {
                    notEmpty: {message: 'El aporte recursos propios, es requerido'},
                    integer: {message: 'Solo se permite números'}
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

        // Valido si el id existe, con el fin de eviarlo al metodo correcto
        $('#formulario_principal').attr('action', url_pv + 'PropuestasPdac/editar_propuesta_presupuesto');

        if ($("#aportepropio").val() == "") {
            notify("danger", "ok", "Presupuesto:", "El aporte recursos propios, es requerido.");
        } else
        {
            if ($("#valortotal").val() == "") {
                notify("danger", "ok", "Presupuesto:", "El valor total, es requerido.");
            } else
            {
                valor_total=parseInt($("#aportesolicitado").val())+parseInt($("#aportecofinanciado").val())+parseInt($("#aportepropio").val());
                valor_total_real=parseInt($("#valortotal").val());
                if(valor_total>valor_total_real)
                {
                    notify("danger", "ok", "Presupuesto:", "El aporte recursos propios, no puede ser mayor o menor al Valor Total.");
                }
                else
                {
                    //Se realiza la peticion con el fin de guardar el registro actual
                    $.ajax({
                        type: 'POST',
                        url: $form.attr('action'),
                        data: $form.serialize() + "&modulo=Menu Participante&token=" + token_actual.token + "&m=" + getURLParameter('m') + "&propuesta=" + getURLParameter('p') + "&valortotal=" + $("#valortotal").val() + "&aportepropio=" + $("#aportepropio").val(),
                    }).done(function (result) {

                        if (result == 'error')
                        {
                            notify("danger", "ok", "Presupuesto:", "Se registro un error, comuníquese con la mesa de ayuda convocatorias@scrd.gov.co");
                        } else
                        {
                            if (result == 'error_token')
                            {
                                location.href = url_pv_admin + 'index.html?msg=Su sesión ha expirado, por favor vuelva a ingresar.&msg_tipo=danger';
                            } else
                            {
                                if (result == 'acceso_denegado')
                                {
                                    notify("danger", "remove", "Presupuesto:", "No tiene permisos para editar información.");
                                } else
                                {
                                    if (isNaN(result)) {
                                        notify("danger", "ok", "Presupuesto:", "Se registro un error, comuníquese con la mesa de ayuda convocatorias@scrd.gov.co");
                                    } else
                                    {
                                        notify("success", "ok", "Presupuesto:", "Se guardo con el éxito el presupuesto.");
                                        $("#id_registro_4").val("");
                                        $("#insumo").val("");
                                        $("#cantidad").val("");
                                        $("#unidadmedida").val("");
                                        $("#valorunitario").val("");
                                        $("#valortotal").val("");
                                        $("#aportesolicitado").val("");
                                        $("#aportecofinanciado").val("");
                                        $("#aportepropio").val("");
                                        $("#formulario_principal").data('bootstrapValidator').resetForm();
                                        $("#formulario_principal").bootstrapValidator('resetForm', true);
                                        cargar_tabla_presupuesto(token_actual);
                                    }
                                }
                            }
                        }

                    });
                }                
            }

        }
    });
}

function cargar_tabla_presupuesto(token_actual)
{
    $('#tabla_presupuesto').DataTable({
        "language": {
            "url": "../../dist/libraries/datatables/js/spanish.json"
        },
        "processing": true,
        "destroy": true,
        "serverSide": true,
        "ordering": false,
        "searching": false,
        "lengthMenu": [20, 30, 40],
        "ajax": {
            url: url_pv + "PropuestasPdac/cargar_tabla_presupuestos_sin_actividad",
            data: {"token": token_actual.token, "conv": $("#conv").attr('value'), "modulo": "Menu Participante", "m": getURLParameter('m'), "p": getURLParameter('p')}
        },
        "drawCallback": function (settings) {
            $(".check_activar_t").attr("checked", "true");
            $(".check_activar_f").removeAttr("checked");
            //Cargo el formulario, para crear o editar
            cargar_formulario_presupuesto(token_actual);
        },
        "columnDefs": [{
                "targets": 0,
                "render": function (data, type, row, meta) {
                    //Creo los botones para acciones de cada fila de la tabla                    
                    row.valorunitario = addCommas(row.valorunitario);
                    row.valortotal = addCommas(row.valortotal);
                    row.aportesolicitado = addCommas(row.aportesolicitado);
                    row.aportecofinanciado = addCommas(row.aportecofinanciado);
                    row.aportepropio = addCommas(row.aportepropio);
                    return row.objetivo;
                }
            },
            { className: "columna_activo", "targets": [ 12 ] }
        ],        
        "columns": [
            {"data": "objetivo"},
            {"data": "actividad"},
            {"data": "insumo"},
            {"data": "cantidad"},
            {"data": "unidadmedida"},
            {"data": "valorunitario"},
            {"data": "valortotal"},
            {"data": "aportesolicitado"},
            {"data": "aportecofinanciado"},
            {"data": "aportepropio"},
            {"data": "activar_registro"},
            {"data": "editar"},
            {"data": "active"}
        ],
        footerCallback: function (row, data, start, end, display) {
            var api = this.api();
 
            // Remove the formatting to get integer data for summation
            var intVal = function (i) {
                return typeof i === 'string' ? i.replace(/[\$,]/g, '') * 1 : typeof i === 'number' ? i : 0;
            };
 
            //console.log(api.rows().data().active);
            //console.log(api.column(10).row().data().active);
            
            
 
            // valor_total
            valor_total = api
                .column(6)
                .data()
                .reduce(function (a, b, c) {
                    
                    if(data[c].active===true){
                        return intVal(a) + intVal(b);
                    }
                    else
                    {
                        return intVal(a);
                    }
                    
                }, 0);
                
            // aporte_solicitado
            aporte_solicitado = api
                .column(7)
                .data()
                .reduce(function (a, b,c) {
                    if(data[c].active===true){
                        return intVal(a) + intVal(b);
                    }
                    else
                    {
                        return intVal(a);
                    }                    
                }, 0);
                
            // aporte_cofinanciado
            aporte_cofinanciado = api
                .column(8)
                .data()
                .reduce(function (a, b,c) {
                    if(data[c].active===true){
                        return intVal(a) + intVal(b);
                    }
                    else
                    {
                        return intVal(a);
                    }                    
                }, 0);
                
            // aporte_cofinanciado
            aporte_recursos = api
                .column(9)
                .data()
                .reduce(function (a, b,c) {
                    if(data[c].active===true){
                        return intVal(a) + intVal(b);
                    }
                    else
                    {
                        return intVal(a);
                    }                    
                }, 0);            
            $("#valor_total").html('$ '+addCommas(valor_total));
            $("#aporte_solicitado").html('$ '+addCommas(aporte_solicitado));
            $("#aporte_cofinanciado").html('$ '+addCommas(aporte_cofinanciado));
            $("#aporte_recursos").html('$ '+addCommas(aporte_recursos));            
        }
    });
}

function cargar_formulario_presupuesto(token_actual)
{
    //Permite activar o inactivar un actividad
    $(".activar_presupuesto").click(function () {

        var active = "false";
        if ($(this).prop('checked')) {
            active = "true";
        }

        $.ajax({
            type: 'DELETE',
            data: {"token": token_actual.token, "modulo": "Menu Participante", "active": active},
            url: url_pv + 'PropuestasPdac/eliminar_presupuesto/' + $(this).attr("title")
        }).done(function (data) {
            if (data == 'ok')
            {
                if (active == "true")
                {
                    notify("info", "ok", "Presupuesto:", "Se activó el presupuesto con éxito.");
                } else
                {
                    notify("info", "ok", "Presupuesto:", "Se inactivo el presupuesto con éxito.");
                }
            } else
            {
                if (data == 'acceso_denegado')
                {
                    notify("danger", "remove", "Presupuesto:", "Acceso denegado.");
                } else
                {
                    notify("danger", "ok", "Presupuesto:", "Se registro un error en el método, comuníquese con la mesa de ayuda convocatorias@scrd.gov.co");
                }
            }
            cargar_tabla_presupuesto(token_actual);
        });
    });

    $(".cargar_formulario_presupuesto").click(function () {

        $("#formulario_principal").data('bootstrapValidator').resetForm();
        $("#formulario_principal").bootstrapValidator('resetForm', true);

        //Cargo el id actual        
        $("#id_registro_4").attr('value', $(this).attr('title'));
        //Realizo la peticion para cargar el formulario
        $.ajax({
            type: 'GET',
            data: {"token": token_actual.token, "propuesta": getURLParameter('p'), "conv": $("#conv").attr('value'), "modulo": "Menu Participante", "m": getURLParameter('m'), "id": $("#id_registro_4").attr('value')},
            url: url_pv + 'PropuestasPdac/consultar_presupuesto/'
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

                    $('#unidadmedida').find('option').remove();
                    $("#unidadmedida").append('<option value="" >::Seleccionar::</option>');
                    if( json.insumo === 'Honorarios equipo de trabajo'){
                        $("#unidadmedida").append('<option value="Artistas" >Artistas</option>');
                        $("#unidadmedida").append('<option value="Formadores" >Formadores</option>');
                        $("#unidadmedida").append('<option value="Director" >Director</option>');
                        $("#unidadmedida").append('<option value="Coordinador" >Coordinador</option>');
                        $("#unidadmedida").append('<option value="Productor" >Productor</option>');
                        $("#unidadmedida").append('<option value="Diseñador" >Diseñador</option>');
                        $("#unidadmedida").append('<option value="Presentador" >Presentador</option>');
                        $("#unidadmedida").append('<option value="Conferencista" >Conferencista</option>');
                        $("#unidadmedida").append('<option value="Apoyo administrativo" >Apoyo administrativo</option>');
                        $("#unidadmedida").append('<option value="Personal técnico" >Personal técnico</option>');
                        $("#unidadmedida").append('<option value="Personal logístico" >Personal logístico</option>');
                        $("#unidadmedida").append('<option value="Investigadores" >Investigadores</option>');
                    }
                    if( json.insumo === 'Premios y reconocimientos'){
                        $("#unidadmedida").append('<option value="Premios y reconocimientos" >Premios y reconocimientos</option>');
                    }
                    if( json.insumo === 'Alquileres'){
                        $("#unidadmedida").append('<option value="Sonido e iluminación" >Sonido e iluminación</option>');
                        $("#unidadmedida").append('<option value="Tarimas y sillas" >Tarimas y sillas</option>');
                        $("#unidadmedida").append('<option value="Carpas y pisos" >Carpas y pisos</option>');
                        $("#unidadmedida").append('<option value="Escenarios o salones" >Escenarios o salones</option>');
                        $("#unidadmedida").append('<option value="Equipos" >Equipos</option>');
                        $("#unidadmedida").append('<option value="Instrumentos" >Instrumentos</option>');
                    }
                    
                    if( json.insumo === 'Producción'){
                        $("#unidadmedida").append('<option value="Montajes de exposiciones o eventos" >Montajes de exposiciones o eventos</option>');
                        $("#unidadmedida").append('<option value="Escenografía" >Escenografía</option>');
                        $("#unidadmedida").append('<option value="Utilería" >Utilería</option>');
                        $("#unidadmedida").append('<option value="Diseño de vestuario " >Diseño de vestuario </option>');
                        $("#unidadmedida").append('<option value="Materiales o insumos" >Materiales o insumos</option>');
                        $("#unidadmedida").append('<option value="Logística" >Logística</option>');
                        $("#unidadmedida").append('<option value="Seguridad" >Seguridad</option>');
                    }
                    
                    
                    if( json.insumo === 'Transporte'){
                        $("#unidadmedida").append('<option value="Transporte aéreo " >Transporte aéreo</option>');
                        $("#unidadmedida").append('<option value="Transporte terrestre" >Transporte terrestre</option>');
                        $("#unidadmedida").append('<option value="Transporte de carga" >Transporte de carga</option>');
                    }
                    
                    
                    if( json.insumo === 'Alojamiento'){
                        $("#unidadmedida").append('<option value="Alojamiento y hospedaje" >Alojamiento y hospedaje</option>');                    
                    }
                    
                    
                    if( json.insumo === 'Alimentación'){
                        $("#unidadmedida").append('<option value="Refrigerios" >Refrigerios</option>');
                        $("#unidadmedida").append('<option value="Hidratación" >Hidratación</option>');
                        $("#unidadmedida").append('<option value="Alimentación" >Alimentación</option>');                    
                    }
                    
                    
                    if( json.insumo === 'Divulgación y publicidad'){
                        $("#unidadmedida").append('<option value="Diseño de páginas web y redes sociales" >Diseño de páginas web y redes sociales</option>');
                        $("#unidadmedida").append('<option value="Impresión" >Impresión</option>');
                        $("#unidadmedida").append('<option value="Diseño de piezas publicitarias" >Diseño de piezas publicitarias</option>');
                        $("#unidadmedida").append('<option value="Pauta en medios" >Pauta en medios</option>');
                        $("#unidadmedida").append('<option value="Transmisión por radio, tv o redes sociales" >Transmisión por radio, tv o redes sociales</option>');
                    }
                                    
                    if( json.insumo === 'Permisos y derechos de autor'){
                        $("#unidadmedida").append('<option value="Derechos de autor" >Derechos de autor</option>');
                        $("#unidadmedida").append('<option value="Otros permisos" >Otros permisos</option>');
                    }


                    console.log(json.insumo);
                    //Cargo el formulario con los datos
                    $('.formulario_principal').loadJSON(json);
                              
                    
                    document.getElementById('div_formulario_principal').scrollIntoView(true);
                }
            }
        });
    });


}

function addCommas(nStr) {
       nStr += '';
       var x = nStr.split('.');
       var x1 = x[0];
       var x2 = x.length > 1 ? '.' + x[1] : '';
       var rgx = /(\d+)(\d{3})/;
       while (rgx.test(x1)) {
           x1 = x1.replace(rgx, '$1' + ',' + '$2');
       }
       return x1 + x2;
}