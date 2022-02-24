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
            permiso_lectura_keycloak(token_actual.token, "SICON-CONVOCATORIAS-CONFIGURACION");

            //Cargamos el menu principal
            $.ajax({
                type: 'POST',
                data: {"token": token_actual.token, "id": getURLParameter('id'), "m": getURLParameter('m'), "p": getURLParameter('p'), "sub": getURLParameter('sub'), "modulo": "SICON-CONVOCATORIAS-CONFIGURACION-UPDATE"},
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
            
            $("#idConvocatoria").val($("#id").val());

            //Realizo la peticion para cargar los datos del formulario
            if ($("#id").val() != "") {
                //alert("hay id"+"www"+$("#id").attr('value') );
            }

            //William Barbosa 2019-07-18
            //Cuando se pasa a enriquecido no valida revisar
            //Establesco los text area html
            $('.textarea_html').jqte();

            cargar_tabla($("#idConvocatoria").attr('value'), token_actual);

            //establece formulario nuevo
            $('#b_nueva_ronda').click(function () {

                $('#form_nuevo_ronda').trigger("reset");
                $("#descripcion_ronda").jqteVal('');
                $("#descripcion_ronda").val(null);
                $("#id_registro").val(null);
                $('.form_nuevo_ronda').bootstrapValidator('destroy', true);

                //carga los datos en el select_categoria
                cargar_select_categoria(token_actual);

                //carga los datos en el select_tipo_acta
                cargar_select_tipo_acta(token_actual);


                //14-09-2020 Wilmer Mogollón --- Select tipo_evaluacion
                //carga los datos en el select_tipo_evaluacion
                cargar_select_tipo_evaluacion(token_actual);

                // $('#form_nuevo_convocatoria').attr('action', url_pv + 'Rondas/new');
                validator_form(token_actual);

            });//$('#b_nueva_ronda').click();


            //establece el valor de la convocatoria cuando existen categorias
            $('#select_categoria').change(function () {
                $("#convocatoria").val($("#select_categoria").val());
            });


            $('#b_nueva_ronda').on('hidden.bs.modal', function () {
                /*$("#descripcion").jqteVal('');
                 $("#orden").val("");
                 $("#requisto option[value='']").prop("selected", true);
                 $("#subsanable option[value='true']").prop("selected", true);
                 $("#obligatorio option[value='true']").prop("selected", true);
                 $("#id_registro").val("");
                 */
                //$('#form_nuevo_ronda').bootstrapValidator('resetForm', true)
                //$('#form_nuevo_ronda').data('bootstrapValidator').resetForm(true);
            });

            //2020-02-21
            //Si esta publica no puede hacer ninguna accion
            $.ajax({
                type: 'POST',
                data: {"token": token_actual.token, "id": $("#id").attr('value'), "tipo_requisito": "Tecnicos"},
                url: url_pv + 'Convocatorias/search/'
            }).done(function (data) {
                if (data == 'error_metodo')
                {
                    notify("danger", "ok", "Convocatorias:", "Se registro un error en el método, comuníquese con la mesa de ayuda convocatorias@scrd.gov.co");
                } else
                {
                    if (data == 'error')
                    {
                        location.href = 'list.html?msg=Debe seleccionar una convocatoria, para poder continuar.&msg_tipo=danger';
                    } else
                    {
                        if (data == 'error_token')
                        {
                            notify("danger", "ok", "Convocatorias:", "Por favor actualizar la página, debido a que su sesión caduco");
                        } else
                        {
                            var json = JSON.parse(data);

                            if (typeof json.convocatoria.id === 'number') {

                                //Si la convocatoria fue publicada o cancelada o suspendida
                                if (json.convocatoria.estado == 5 || json.convocatoria.estado == 32 || json.convocatoria.estado == 43 || json.convocatoria.estado == 45 || json.convocatoria.estado == 6) {
                                    $("#form_validator button,input,select,button[type=submit],textarea").attr("disabled", "disabled");
                                    $("#form_nuevo_ronda button,input,select,button[type=submit],textarea").attr("disabled", "disabled");
                                    $("#btn_guardar").css("display", "none");
                                    $(".input-sm").css("display", "none");
                                    $(".paginate_button").css("display", "none");
                                    $(".jqte_editor").prop('contenteditable', 'false');
                                }

                            }
                        }
                    }
                }
            });
        }
    }//fin else
});//fin document

function cargar_tabla(id, token_actual) {
    //Cargar datos en la tabla actual
    $('#table_list').DataTable({
        "language": {
            "url": "../../dist/libraries/datatables/js/spanish.json"
        },
        "processing": true,
        "destroy": true,
        "serverSide": true,
        "lengthMenu": [10, 15, 20],
        "responsive": true,
        "ajax": {
            url: url_pv + "Rondas/all_convocatoria",
            data: {"token": token_actual.token, "idcat": id},
            type: "POST"
        },
        columnDefs: [
            {orderable: false, targets: '_all'}
        ],
        "drawCallback": function (settings) {
            $(".check_activar_t").attr("checked", "true");
            $(".check_activar_f").removeAttr("checked");
            acciones_ronda(token_actual);
        },
        "columns": [
            {"data": "convocatoria",
                render: function (data, type, row) {
                    return row.categoria;
                },
            },
            {"data": "numero_ronda",
                render: function (data, type, row) {
                    return row.ronda.numero_ronda;
                },
            },
            {"data": "nombre_ronda",
                render: function (data, type, row) {
                    return row.ronda.nombre_ronda;
                },
            },
            {"data": "fecha_inicio_evaluacion",
                render: function (data, type, row) {
                    return row.ronda.fecha_inicio_evaluacion;
                },
            },
            {"data": "fecha_fin_evaluacion",
                render: function (data, type, row) {
                    return row.ronda.fecha_fin_evaluacion;
                },
            },
            {"data": "fecha_deliberacion",
                render: function (data, type, row) {
                    return row.ronda.fecha_deliberacion;
                },
            },
            {"data": "total_ganadores",
                render: function (data, type, row) {
                    return row.ronda.total_ganadores;
                },
            },
            {"data": "total_suplentes",
                render: function (data, type, row) {
                    return row.ronda.total_suplentes;
                },
            },
            {"data": "active",
                render: function (data, type, row) {
                    return ' <input title=\"' + row.ronda.id + '\" type=\"checkbox\" class=\"check_activar_' + row.ronda.active + '  activar_registro" ' + (row.ronda.active ? 'checked ' : '') + ' />';
                },
            },
            {"data": "aciones",
                render: function (data, type, row) {
                    return '<button id="' + row.ronda.id + '"  type="button" class="btn btn-warning btn_cargar btn_tooltip" data-toggle="modal" data-target="#nueva_ronda" data-placement="top" title="Editar la ronda de evaluación" >'
                            + '<span class="glyphicon glyphicon-edit"></span></button>' +
                            '<button id="' + row.ronda.id + '" type="button" class="btn btn-warning btn_cargar_criterios" data-toggle="modal" data-target="#nueva_criterio" title="Crear los criterios de evaluación de la ronda">'
                            + '<span class="glyphicon glyphicon-list"></span></button>';
                },
            }



        ]
    });

}

function cargar_select_categoria(token_actual) {

    $("#selectCategoria").hide();
    $.ajax({
        type: 'POST',
        data: {"token": token_actual.token, "id": $("#idConvocatoria").attr('value')},
        url: url_pv + 'Convocatorias/select_categorias/'
    }).done(function (data) {

        if (data == 'error_metodo') {
            notify("danger", "ok", "Convocatorias:", "Se registro un error en el método, comuníquese con la mesa de ayuda convocatorias@scrd.gov.co");
        } else if (data == 'error') {
            notify("danger", "ok", "Convocatorias:", "El convocatoria no se encuentra registrado, por favor registrarse");
        } else {
            var json = JSON.parse(data);

            $('#select_categoria').find('option').remove();

            if (json.length > 0) {
                //  console.log('lo'+json.length );

                //Cargo el select categorias
                $('#select_categoria').find('option').remove();
                $("#select_categoria").append('<option value="">:: Seleccionar ::</option>');

                $.each(json, function (key, categoria) {
                    $("#select_categoria").append('<option value="' + categoria.id + '"  >' + categoria.nombre + '</option>');
                });

                $("#selectCategoria").show();
            } else {
                $("#convocatoria").val($("#idConvocatoria").attr('value'));
                $("#select_categoria").append('<option value="' + $("#idConvocatoria").attr('value') + '" selected >' + $("#idConvocatoria").attr('value') + '</option>');

            }
        }
    });
}

function cargar_select_tipo_acta(token_actual) {
    $.ajax({
        type: 'POST',
        data: {"token": token_actual.token, "nombre": "tipo_acta"},
        url: url_pv + 'Tablasmaestras/select_general/'
    }).done(function (data) {
        var json = JSON.parse(data);


        if (data == 'error_metodo') {
            notify("danger", "ok", "Convocatorias:", "Se registro un error en el método, comuníquese con la mesa de ayuda convocatorias@scrd.gov.co");
        } else if (data == 'error') {
            notify("danger", "ok", "Convocatorias:", "El convocatoria no se encuentra registrado, por favor registrarse");
        } else {

            if (json.length > 0) {
                //Cargo el select categorias
                $('#tipo_acta').find('option').remove();
                $("#tipo_acta").append('<option value="">:: Seleccionar ::</option>');

                $.each(json, function (key, tipo) {
                    $("#tipo_acta").append('<option value="' + tipo + '"  >' + tipo + '</option>');
                });
            }
        }

    }
    );
}

/*
 * 14-09-2020
 * Wilmer Gustavo Mogollón Duque
 * Incorporar función cargar_select_tipo_evaluación para ajustes PDAC
 */
function cargar_select_tipo_evaluacion(token_actual) {
    $.ajax({
        type: 'POST',
        data: {"token": token_actual.token, "nombre": "tipo_evaluacion"},
        url: url_pv + 'Tablasmaestras/select_general/'
    }).done(function (data) {
        var json = JSON.parse(data);


        if (data == 'error_metodo') {
            notify("danger", "ok", "Convocatorias:", "Se registro un error en el método, comuníquese con la mesa de ayuda convocatorias@scrd.gov.co");
        } else if (data == 'error') {
            notify("danger", "ok", "Convocatorias:", "No se encuentra registrado, por favor registrarse");
        } else {

            if (json.length > 0) {
                //Cargo el select categorias
                $('#tipo_evaluacion').find('option').remove();
                $("#tipo_evaluacion").append('<option value="">:: Seleccionar ::</option>');

                $.each(json, function (key, tipo) {
                    $("#tipo_evaluacion").append('<option value="' + tipo + '"  >' + tipo + '</option>');
                });
            }
        }

    }
    );
}

function validator_form(token_actual) {

//  console.log("Validando");

    $('.calendario').on('changeDate show', function (e) {
        $('.form_nuevo_ronda').bootstrapValidator('revalidateField', 'fecha_inicio_evaluacion');
        $('.form_nuevo_ronda').bootstrapValidator('revalidateField', 'fecha_fin_evaluacion');
        $('.form_nuevo_ronda').bootstrapValidator('revalidateField', 'fecha_deliberacion');
    });

    $('.form_nuevo_ronda').bootstrapValidator({
        feedbackIcons: {
            valid: 'glyphicon glyphicon-ok',
            invalid: 'glyphicon glyphicon-remove',
            validating: 'glyphicon glyphicon-refresh'
        },
        excluded: ':disabled',
        fields: {
            select_categoria: {
                validators: {
                    notEmpty: {message: 'La categoria es requerida'}
                }
            },
            numero_ronda: {
                validators: {
                    notEmpty: {message: 'El numero de ronda es requerido'},
                    integer: {message: 'Debe digitar un número'}
                }
            },
            nombre_ronda: {
                validators: {
                    notEmpty: {message: 'El nombre de la ronda es requerido'}
                }
            },
            descripcion_ronda: {
                validators: {
                    notEmpty: {message: 'La descripción es requerida'}
                }
            },
            total_ganadores: {
                validators: {
                    notEmpty: {message: 'El número de ganadores es requerido'}
                }
            },
            total_suplentes: {
                validators: {
                    notEmpty: {message: 'El número de suplentes es requerido'}
                }
            },
            fecha_inicio_evaluacion: {
                validators: {
                    notEmpty: {message: 'La fecha de inicio es requerida'}
                }
            },
            fecha_fin_evaluacion: {
                validators: {
                    notEmpty: {message: 'La fecha de fin es requerida'}
                }
            },
            fecha_deliberacion: {
                validators: {
                    notEmpty: {message: 'La fecha de deliberación es requerida'}
                }
            },
            tipo_acta: {
                validators: {
                    notEmpty: {message: 'El tipo de acta es requerido'}
                }
            },
            //14-09-2020 --- Agrego tipo evaluación
            tipo_evaluacion: {
                validators: {
                    notEmpty: {message: 'El tipo de evaluación es requerido'}
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

        //$form.bootstrapValidator('resetForm', true);

        //console.log("form-->" + $form.serialize());

        if ($("#id_registro").attr('value') === null || $("#id_registro").attr('value') === '') {
            console.log("crear!!!");
            //Se realiza la peticion con el fin de guardar el registro actual
            $.ajax({
                type: 'POST',
                url: url_pv + 'Rondas/new',
                data: $form.serialize() + "&modulo=SICON-CONVOCATORIAS-CONFIGURACION&token=" + token_actual.token
            }).done(function (result) {

                switch (result) {
                    case 'error':
                        notify("danger", "ok", "Convocatorias:", "Se registro un error, comuníquese con la mesa de ayuda convocatorias@scrd.gov.co");
                        break;
                    case 'error_metodo':
                        notify("danger", "ok", "Se registro un error en el método, comuníquese con la mesa de ayuda convocatorias@scrd.gov.co");
                        break;
                    case 'error_token':
                        notify("danger", "ok", "Convocatorias:", "Por favor actualizar la página, debido a que su sesión caduco");
                        break;
                    case 'acceso_denegado':
                        notify("danger", "remove", "Usuario:", "No tiene permisos para editar información.");
                        break;
                    default:
                        notify("success", "ok", "Convocatorias:", "Se creó la ronda con éxito.");
                        //Cargar datos de la tabla de rondas
                        cargar_tabla($("#idConvocatoria").attr('value'), token_actual);
                        break;
                }


            });

        } else {
            //  console.log("editar!!!");

            //Realizo la peticion con el fin de editar el registro actual
            $.ajax({
                type: 'PUT',
                url: url_pv + 'Rondas/edit/' + $("#id_registro").attr('value'),
                data: $form.serialize() + "&modulo=SICON-CONVOCATORIAS-CONFIGURACION&token=" + token_actual.token
            }).done(function (result) {
                switch (result) {
                    case 'error':
                        notify("danger", "ok", "Convocatorias:", "Se registro un error, comuníquese con la mesa de ayuda soporte.convocatorias@scrd.gov.co");
                        break;
                    case 'error_metodo':
                        notify("danger", "ok", "Se registro un error en el método, comuníquese con la mesa de ayuda soporte.convocatorias@scrd.gov.co");
                        break;
                    case 'error_token':
                        notify("danger", "ok", "Convocatorias:", "Por favor actualizar la página, debido a que su sesión caduco");
                        break;
                    case 'acceso_denegado':
                        notify("danger", "remove", "Usuario:", "No tiene permisos para editar información.");
                        break;
                    case 'deshabilitado':
                        notify("danger", "remove", "Usuario:", "No tiene permisos para editar información.");
                        break;
                    default:
                        notify("info", "ok", "Convocatorias:", "Se editó la ronda con éxito.");
                        cargar_tabla($("#idConvocatoria").attr('value'), token_actual);
                        break;
                }
            });

            $("#id_registro").val(null);

        }

        $form.bootstrapValidator('disableSubmitButtons', false).bootstrapValidator('resetForm', true);
        bv.resetForm();
        $('#nueva_ronda').modal('toggle');

    });
}

//Permite realizar acciones despues de cargar la tabla
function acciones_ronda(token_actual) {

    cargar_select_categoria(token_actual);
    cargar_select_tipo_acta(token_actual);
    // 14-09-2020 Agrego cargar_select_tipo_evaluacion
    cargar_select_tipo_evaluacion(token_actual);

    //Permite activar o eliminar una registro
    $(".activar_registro").click(function () {

        //Cambio el estado del check
        var active = "false";

        if ($(this).prop('checked')) {
            active = "true";
        }

        //Peticion para inactivar el evento
        $.ajax({
            type: 'DELETE',
            data: {"token": token_actual.token, "modulo": "SICON-CONVOCATORIAS-CONFIGURACION", "active": active},
            url: url_pv + 'Rondas/delete/' + $(this).attr("title")
        }).done(function (result) {


            switch (result) {
                case 'Si':
                    notify("info", "ok", "Convocatorias:", "Se activó la ronda con éxito.");
                    break;
                case 'No':
                    notify("info", "ok", "Convocatorias:", "Se eliminó la ronda con éxito.");
                    break;
                case 'error':
                    notify("danger", "ok", "Convocatorias:", "Se registro un error, comuníquese con la mesa de ayuda convocatorias@scrd.gov.co");
                    break;
                case 'error_token':
                    notify("danger", "ok", "Convocatorias:", "Por favor actualizar la página, debido a que su sesión caduco");
                    break;
                case 'acceso_denegado':
                    notify("danger", "remove", "Usuario:", "No tiene permisos para editar información.");
                    break;
                case 'deshabilitado':
                    notify("danger", "remove", "Usuario:", "No tiene permisos para editar información.");
                    cargar_tabla($("#idConvocatoria").attr('value'), token_actual);
                    break;
                default:
                    notify("success", "ok", "Convocatorias:", "Se actualizó el registro con éxito.");
                    cargar_tabla($("#idConvocatoria").attr('value'), token_actual);
                    break;
            }

        });
    });

    //Permite realizar la carga respectiva de la ronda
    $(".btn_cargar").click(function () {

        $('#form_nuevo_ronda').trigger("reset");
        $('.form_nuevo_ronda').bootstrapValidator('destroy', true);

        //Realizo la peticion para cargar el formulario
        $.ajax({
            type: 'POST',
            data: {"token": token_actual.token},
            url: url_pv + 'Rondas/search/' + $(this).attr("id")
        }).done(function (data) {
            if (data == 'error_metodo')
            {
                notify("danger", "ok", "Convocatorias:", "Se registro un error en el método, comuníquese con la mesa de ayuda convocatorias@scrd.gov.co");
            } else
            {
                if (data == 'error')
                {
                    notify("danger", "ok", "Convocatorias:", "El convocatoria no se encuentra registrado, por favor registrarse");
                } else
                {
                    var json = JSON.parse(data);

                    //Cargo el formulario con los datos
                    $('#form_nuevo_ronda').loadJSON(json);
                    $("#select_categoria option[value='" + json.convocatoria + "']").prop('selected', true);
                    $("#fecha_inicio_evaluacion").val(json.fecha_inicio_evaluacion.split(" ")[0]);
                    $("#fecha_fin_evaluacion").val(json.fecha_fin_evaluacion.split(" ")[0]);
                    $("#fecha_deliberacion").val(json.fecha_deliberacion.split(" ")[0]);
                    $("#fecha_deliberacion").val(json.fecha_deliberacion.split(" ")[0]);
                    $("#id_registro").val(json.id);
                    //$("#descripcion_ronda").jqteVal(json.descripcion_ronda);
                    $("#descripcion_ronda").val(json.descripcion_ronda);
                }
            }
        });


        validator_form(token_actual);

    });

    //carga el modal de criterios
    $(".btn_cargar_criterios").click(function () {

        //  console.log("cargando criterios");

        var puntaje_maximo_criterios;
        var total_puntaje_criterios = 0;
        var limite;

        $('#form_nuevo_criterio').trigger("reset");
        $("#id_registro_criterio").val(null);
        $("#grupo_criterio").val(null);
        $("#descripcion_criterio").val(null);
        $('.form_nuevo_criterio').bootstrapValidator('destroy', true);

        //traer el valor puntaje_maximo
        $.ajax({
            type: 'POST',
            data: {"token": token_actual.token, "nombre": "puntaje_maximo_criterios"},
            url: url_pv + 'Tablasmaestras/search_nombre/',
            async: false
        }).done(function (data) {

            switch (data) {
                case 'error':
                    notify("danger", "ok", "Convocatorias:", "Se registro un error, comuníquese con la mesa de ayuda convocatorias@scrd.gov.co");
                    break;
                case 'error_token':
                    notify("danger", "ok", "Convocatorias:", "Por favor actualizar la página, debido a que su sesión caduco");
                    break;
                case 'acceso_denegado':
                    notify("danger", "remove", "Usuario:", "No tiene permisos para editar información.");
                    break;
                case 'error_metodo':
                    notify("danger", "ok", "Convocatorias:", "Se registro un error en el método, comuníquese con la mesa de ayuda convocatorias@scrd.gov.co");
                    break;
                default:
                    var json = JSON.parse(data);
                    puntaje_maximo_criterios = json.valor;
                    break;
            }

        });

        //Calcular la suma de los puntajes de los criterios
        //  console.log("idRonda-->" + $(this).attr("title"));
        $("#convocatoria_ronda").val($(this).attr("id"));
        //console.log("convocatoria_ronda->>"+ $("#convocatoria_ronda").val() );
        $.ajax({
            type: 'POST',
            data: {"token": token_actual.token, "idRonda": $(this).attr("id")},
            url: url_pv + 'Convocatoriasrondascriterios/criterios_ronda'
        }).done(function (result) {

            //console.log("json-xxxx->>" + result);

            switch (result) {
                case 'error':
                    notify("danger", "ok", "Convocatorias:", "Se registro un error, comuníquese con la mesa de ayuda convocatorias@scrd.gov.co");
                    break;
                case 'error_token':
                    notify("danger", "ok", "Convocatorias:", "Por favor actualizar la página, debido a que su sesión caduco");
                    break;
                case 'acceso_denegado':
                    notify("danger", "remove", "Usuario:", "No tiene permisos para editar información.");
                    break;
                case 'error_metodo':
                    notify("danger", "ok", "Convocatorias:", "Se registro un error en el método, comuníquese con la mesa de ayuda convocatorias@scrd.gov.co");
                    break;
                default:
                    var json = JSON.parse(result);

                    if (json.length > 0) {

                        $.each(json, function (key, criterio) {
                            //console.log("key->" + key + "  criterio.puntaje_maximo->" + criterio.puntaje_maximo);
                            total_puntaje_criterios += criterio.puntaje_maximo;
                        });

                        //asignar valor al limite
                        limite = (puntaje_maximo_criterios - total_puntaje_criterios);
                        //console.log("limite" + limite);
                        $("#limite").val(limite);
                    }

                    break;
            }
            //cargar_tabla_criterio(  $(this).attr("title"), token_actual);
            //console.log("cargar");
            validator_form_criterio(token_actual, $(this).attr("id"));

        });

        //carga select tipo criterios
        $.ajax({
            type: 'POST',
            data: {"token": token_actual.token, "nombre": "tipos_criterios"},
            url: url_pv + 'Tablasmaestras/select_general/'
        }).done(function (data) {
            var json = JSON.parse(data);


            if (data == 'error_metodo') {
                notify("danger", "ok", "Convocatorias:", "Se registro un error en el método, comuníquese con la mesa de ayuda convocatorias@scrd.gov.co");
            } else if (data == 'error') {
                notify("danger", "ok", "Convocatorias:", "El convocatoria no se encuentra registrado, por favor registrarse");
            } else {

                if (json.length > 0) {
                    //Cargo el select categorias
                    $('#tipo_criterio').find('option').remove();
                    $("#tipo_criterio").append('<option value="">:: Seleccionar ::</option>');

                    $.each(json, function (key, tipo) {
                        $("#tipo_criterio").append('<option value="' + tipo + '"  >' + tipo + '</option>');
                    });
                }
            }

        }
        );


        //  sum_criterios(token_actual, $(this).attr("title"));
        cargar_tabla_criterio($(this).attr("id"), token_actual);
        //$("#convocatoria_ronda").val($(this).attr("title"));
        //validator_form_criterio(token_actual,$(this).attr("title"));
    });


}

function cargar_tabla_criterio(idRonda, token_actual) {

    //Cargar datos en la tabla actual
    $('#table_list_criterio').DataTable({
        "language": {
            "url": "../../dist/libraries/datatables/js/spanish.json"
        },
        "processing": true,
        "destroy": true,
        "serverSide": true,
        "searching": false, //William Barbosa 2019-07-18, false por estetica
        "lengthChange": true, //William Barbosa 2019-07-18, false por estetica
        "lengthMenu": [5, 10, 15],
        "responsive": true,
        "ajax": {
            url: url_pv + "Convocatoriasrondascriterios/all_criterios_ronda",
            data: {"token": token_actual.token, "idRonda": idRonda},
            type: "POST"
        },
        "drawCallback": function (settings) {
            $(".check_activar_t").attr("checked", "true");
            $(".check_activar_f").removeAttr("checked");
            acciones_criterio(token_actual);
        },
        "columns": [
            {"data": "orden"},
            {"data": "grupo_criterio"},
            {"data": "descripcion_criterio"},
            //{"data": "puntaje_maximo"},
            {"data": "rango",
                render: function (data, type, row) {
                    return row.puntaje_minimo + '-' + row.puntaje_maximo;
                },
            },
            {"data": "exclusivo",
                render: function (data, type, row) {
                    return  ((row.exclusivo) ? "Si" : "No");
                },
            },
            {"data": "active",
                render: function (data, type, row) {
                    return ' <input title=\"' + row.id + '\" type=\"checkbox\" class=\"check_activar_' + row.active + '  activar_registro_criterio" ' + (row.active ? 'checked ' : '') + ' />';
                },
            },
            {"data": "aciones",
                render: function (data, type, row) {
                    return '<button id="' + row.id + '" type="button" class="btn btn-warning btn_cargar_criterio" title="Editar el criterio de evaluación">'
                            + '<span class="glyphicon glyphicon-edit"></span></button>';
                },
            }
        ]
    });

}

function validator_form_criterio(token_actual, idRonda) {
    //console.log("Validando");


    $('.form_nuevo_criterio').bootstrapValidator({
        feedbackIcons: {
            valid: 'glyphicon glyphicon-ok',
            invalid: 'glyphicon glyphicon-remove',
            validating: 'glyphicon glyphicon-refresh'
        },
        excluded: ':disabled',
        fields: {
            /*grupo_criterio: {
             validators: {
             notEmpty: {message: 'El grupo es requerido'}
             }
             },*/
            descripcion_criterio: {
                validators: {
                    notEmpty: {message: 'El criterio es requerido'}
                }
            },
            puntaje_maximo: {
                validators: {
                    notEmpty: {message: 'El puntaje máximo es requerido'},
                    integer: {message: 'Debe ingresar un número'},
                }
            },
            orden: {
                validators: {
                    notEmpty: {message: 'El orden es requerido'},
                    integer: {message: 'Debe ingresar un número'},
                }
            },

        }
    }).on('success.form.bv', function (e) {

        // Prevent form submission
        e.preventDefault();
        // Get the form instance
        if ($("#exclusivo").prop('checked')) {
            //$("#exclusivo").prop("checked", true);
            $("#exclusivo").val(true);
        } else {
            //se establece con el fin de que viaje el parametro con el valor false
            $("#exclusivo").prop("checked", true);
            $("#exclusivo").val(false);
        }

        var $form = $(e.target);

        // Get the BootstrapValidator instance
        var bv = $form.data('bootstrapValidator');

        //$form.bootstrapValidator('resetForm', true);

        //console.log("form-->" + $form.serialize());
        //console.log("id_registro_criterio"+$("#id_registro_criterio"));

        if ($("#id_registro_criterio").attr('value') === null || $("#id_registro_criterio").attr('value') === '') {
            //console.log("crear!!!");

            //Se realiza la peticion con el fin de guardar el registro actual
            $.ajax({
                type: 'POST',
                url: url_pv + 'Convocatoriasrondascriterios/new',
                data: $form.serialize() + "&modulo=SICON-CONVOCATORIAS-CONFIGURACION&token=" + token_actual.token
            }).done(function (result) {


                switch (result) {
                    case 'error':
                        notify("danger", "ok", "Convocatorias:", "Se registro un error, comuníquese con la mesa de ayuda convocatorias@scrd.gov.co");
                        break;
                    case 'error_token':
                        notify("danger", "ok", "Convocatorias:", "Por favor actualizar la página, debido a que su sesión caduco");
                        break;
                    case 'acceso_denegado':
                        notify("danger", "remove", "Usuario:", "No tiene permisos para editar información.");
                        break;
                    case 'error_metodo':
                        notify("danger", "ok", "Convocatorias:", "Se registro un error en el método, comuníquese con la mesa de ayuda convocatorias@scrd.gov.co");
                        break;
                    case 'error_puntaje':
                        notify("danger", "ok", "Convocatorias:", "La suma de los valores de los criterios sobrepasa el valor máximo permitido");
                        break;
                    default:
                        notify("success", "ok", "Convocatorias:", "Se creó el criterio con éxito.");
                        //Cargar datos de la tabla de rondas
                        cargar_tabla_criterio($("#convocatoria_ronda").attr('value'), token_actual);
                        break;
                }


            });
        } else {

            console.log("editar!!!");

            //Realizo la peticion con el fin de editar el registro actual
            $.ajax({
                type: 'PUT',
                url: url_pv + 'Convocatoriasrondascriterios/edit/' + $("#id_registro_criterio").attr('value'),
                data: $form.serialize() + "&modulo=SICON-CONVOCATORIAS-CONFIGURACION&token=" + token_actual.token
            }).done(function (result) {


                switch (result) {
                    case 'error':
                        notify("danger", "ok", "Convocatorias:", "Se registró un error, comuníquese con la mesa de ayuda convocatorias@scrd.gov.co");
                        break;
                    case 'error_token':
                        notify("danger", "ok", "Convocatorias:", "Por favor actualizar la página, debido a que su sesión caduco");
                        break;
                    case 'acceso_denegado':
                        notify("danger", "remove", "Usuario:", "No tiene permisos para editar información.");
                        break;
                    case 'error_metodo':
                        notify("danger", "ok", "Convocatorias:", "Se registró un error en el método, comuníquese con la mesa de ayuda convocatorias@scrd.gov.co");
                        break;
                    case 'error_puntaje':
                        notify("danger", "ok", "Convocatorias:", "La suma de los valores de los criterios sobrepasa el valor máximo permitido");
                        break;
                    case 'deshabilitado':
                        notify("danger", "remove", "Usuario:", "No tiene permisos para editar información.");
                        break;
                    default:
                        notify("info", "ok", "Convocatorias:", "Se editó el criterio con éxito.");
                        sum_criterios(token_actual, $("#convocatoria_ronda").attr('value'));
                        cargar_tabla_criterio($("#convocatoria_ronda").attr('value'), token_actual);
                        $("#id_registro_criterio").val(null);
                        break;
                }

            });

        }


        $form.bootstrapValidator('disableSubmitButtons', false).bootstrapValidator('resetForm', true);
        bv.resetForm();
        $("#form_nuevo_criterio").trigger("reset");
        $("#grupo_criterio").val(null);
        $("#descripcion_criterio").val(null);
        $("#exclusivo").prop("checked", false);
    });

}

//Permite realizar acciones despues de cargar la tabla
function acciones_criterio(token_actual) {


    //Permite activar o eliminar una registro
    /**
     *Cesar Britto, 2020-05-12
     * Se ajusta para que no cree conflicto con activar_registro de la ronda
     */
    $(".activar_registro_criterio").click(function () {

        //Cambio el estado del check
        var active = "false";

        if ($(this).prop('checked')) {
            active = "true";
        }

        //Peticion para inactivar o activar el evento
        $.ajax({
            type: 'DELETE',
            data: {"token": token_actual.token, "modulo": "SICON-CONVOCATORIAS-CONFIGURACION", "active": active, "convocatoria_ronda": $('#convocatoria_ronda').val()},
            url: url_pv + 'Convocatoriasrondascriterios/delete/' + $(this).attr("title")
        }).done(function (result) {


            switch (result) {
                case 'Si':
                    notify("info", "ok", "Convocatorias:", "Se activó el evento con éxito.");
                    break;
                case 'No':
                    notify("info", "ok", "Convocatorias:", "Se eliminó el evento con éxito.");
                    break;
                case 'error':
                    notify("danger", "ok", "Convocatorias:", "Se registro un error, comuníquese con la mesa de ayuda convocatorias@scrd.gov.co");
                    break;
                case 'error_token':
                    notify("danger", "ok", "Convocatorias:", "Por favor actualizar la página, debido a que su sesión caduco");
                    break;
                case 'acceso_denegado':
                    notify("danger", "remove", "Usuario:", "No tiene permisos para editar información.");
                    break;
                case 'error_metodo':
                    notify("danger", "ok", "Convocatorias:", "Se registro un error en el método, comuníquese con la mesa de ayuda convocatorias@scrd.gov.co");
                    break;
                case 'error_puntaje':
                    notify("danger", "ok", "Convocatorias:", "La suma de los valores de los criterios sobrepasa el valor máximo permitido");
                    $(this).removeAttr("checked");

                    return false;
                    break;
                default:
                    break;
            }

        });
    });

    //carga los datos del formulario del modal de criterios
    $(".btn_cargar_criterio").click(function () {
        //console.log("btn_cargar_criterio!!!");


        //Realizo la peticion para cargar el formulario
        $.ajax({
            type: 'POST',
            data: {"token": token_actual.token},
            url: url_pv + 'Convocatoriasrondascriterios/search/' + $(this).attr("id")
        }).done(function (data) {
            if (data == 'error_metodo')
            {
                notify("danger", "ok", "Convocatorias:", "Se registro un error en el método, comuníquese con la mesa de ayuda convocatorias@scrd.gov.co");
            } else
            {
                if (data == 'error')
                {
                    notify("danger", "ok", "Convocatorias:", "El usuario no se encuentra registrado, por favor registrarse");
                } else
                {
                    var json = JSON.parse(data);
                    //Cargo el formulario con los datos
                    $('#form_nuevo_criterio').loadJSON(json);
                    $("#grupo_criterio").val(json.grupo_criterio);
                    $("#descripcion_criterio").val(json.descripcion_criterio);
                    $("#id_registro_criterio").val(json.id);
                    if (json.exclusivo) {
                        $("#exclusivo").prop("checked", true);
                    }


                }
            }
        });


        //  validator_form_criterio(token_actual);

    });

    $("#puntaje_maximo").on("change", function () {
        //  console.log("cambio!!!");
    })

}


function sum_criterios(token_actual, idRonda) {
    var puntaje_maximo_criterios;
    var total_puntaje_criterios = 0;
    var limite;

    //establecer el valor puntaje_maximo
    $.ajax({
        type: 'POST',
        data: {"token": token_actual.token, "nombre": "puntaje_maximo_criterios"},
        url: url_pv + 'Tablasmaestras/search_nombre/'
    }).done(function (data) {
        var json = JSON.parse(data);
        if (data == 'error_metodo') {
            notify("danger", "ok", "Convocatorias:", "Se registro un error en el método, comuníquese con la mesa de ayuda convocatorias@scrd.gov.co");
        } else if (data == 'error') {
            notify("danger", "ok", "Convocatorias:", "El convocatoria no se encuentra registrado, por favor registrarse");
        } else {
            //Cargo el select categorias
            console.log("json-->" + json.valor);
            puntaje_maximo_criterios = json.valor;
            $("#puntaje_maximo_criterios").val(puntaje_maximo_criterios);

        }

    }
    );

    //Calcular la suma de los puntajes de los criterios
    //  console.log("idRonda-->" + idRonda);
    $.ajax({
        type: 'POST',
        data: {"token": token_actual.token, "idRonda": idRonda},
        url: url_pv + 'Convocatoriasrondascriterios/criterios_ronda'
    }).done(function (data) {

        var json = JSON.parse(data);

        if (data == 'error_metodo') {
            notify("danger", "ok", "Convocatorias:", "Se registro un error en el método, comuníquese con la mesa de ayuda convocatorias@scrd.gov.co");
        } else if (data == 'error') {
            notify("danger", "ok", "Convocatorias:", "El convocatoria no se encuentra registrado, por favor registrarse");
        } else {

            //console.log("json-xxxx->>" + json);

            if (json.length > 0) {

                $.each(json, function (key, criterio) {
                    console.log("key->" + key + "  valor->" + criterio.id);
                    if (criterio.active) {
                        total_puntaje_criterios += criterio.puntaje_maximo;
                    }

                });

                //asignar valor al limite
                $("#total_puntaje_criterios").val(total_puntaje_criterios);
                limite = (puntaje_maximo_criterios - total_puntaje_criterios);
                //console.log("limite" + limite);
                $("#limite").val(limite);



            }

        }


    }
    );

}

jQuery.fn.dataTable.Api.register('sum()', function ( ) {
    return this.flatten().reduce(function (a, b) {
        if (typeof a === 'string') {
            a = a.replace(/[^\d.-]/g, '') * 1;
        }
        if (typeof b === 'string') {
            b = b.replace(/[^\d.-]/g, '') * 1;
        }

        return a + b;
    }, 0);
});
