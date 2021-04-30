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
            data: {"token": token_actual.token, "modulo": "Menu Participante", "id": $("#id").val()},
            url: url_pv + 'Encuestas/generar_encuesta'
        }).done(function (data) {
            if (data == 'error_metodo')
            {
                notify("danger", "ok", "Encuestas:", "Se registro un error en el método, comuníquese con la mesa de ayuda convocatorias@scrd.gov.co");
            } else
            {
                if (data == 'error')
                {
                    location.href = url_pv_admin + 'index.html?msg=Su sesión ha expirado, por favor vuelva a ingresar.&msg_tipo=danger';
                } else
                {
                    if (data == 'acceso_denegado')
                    {
                        notify("danger", "remove", "Encuestas:", "No tiene permisos para ver la información.");
                    } else
                    {
                        var json = JSON.parse(data);

                        //Cargo los parametros dinamicos
                        var parametros = "";
                        var columna = 1;
                        for (var i in json.parametros) {
                            if (json.parametros.hasOwnProperty(i)) {
                                if (columna == 1)
                                {
                                    parametros += '<div class="row">';
                                }
                                parametros += crearParametroEncuesta(json.parametros[i].id, json.parametros[i].label, json.parametros[i].valores, json.parametros[i].tipo_parametro, json.parametros[i].obligatorio, 7);
                                if (columna == 2)
                                {
                                    parametros += '</div>';
                                    columna = 0;
                                }
                                columna++;
                            }
                        }

                        $("#dinamico").html(parametros);
                        
                        $("#programa_nombre").html(json.programa_nombre);
                        $("#convocatoria_nombre").html(json.convocatoria_nombre);
                        $("#entidad_nombre").html(json.entidad_nombre);

                        //Cargo los parametros obligatorios
                        $("#validator").attr("value", JSON.stringify(json.validator));

                        $('#formulario_principal').loadJSON(json.array_values_params);
                        
                        //Si la convocatoria fue publicada o cancelada
                        if( json.total_values_params>0 ){
                            $("#formulario_principal input,select,button[type=submit],textarea").attr("disabled","disabled");                               
                        }
                        
                        
                        //Valido formulario
                        validator_form(token_actual);

                    }
                }
            }
        });
    }
});


//Crear los parametros dinamicos
function crearParametroEncuesta(id, label, valores, tipo, obligatorio, estado_propuesta)
{
    var span_obligatorio = '';
    if (obligatorio == true)
    {
        span_obligatorio = '<span class="icono_requerido">*</span>';
    }

    var disabled = 'disabled="disabled"';
    if (estado_propuesta == 7)
    {
        disabled = '';
    }

    var parametro;
    switch (tipo) {
        case 'Texto':
            parametro = '<div class="col-lg-12">';
            parametro += '<div class="form-group">';
            parametro += '<label>' + label + ' ' + span_obligatorio + '</label>';
            parametro += '<input id="parametro_' + id + '" name="parametro[' + id + ']" type="text" class="form-control" value="" ' + disabled + '>';
            parametro += '</div>';
            parametro += '</div>';
            return(parametro);
            break;
        case 'Parrafo':
            parametro = '<div class="col-lg-12">';
            parametro += '<div class="form-group">';
            parametro += '<label>' + label + ' ' + span_obligatorio + '</label>';
            parametro += '<textarea id="parametro_' + id + '" name="parametro[' + id + ']" class="form-control textarea_html" rows="3" ' + disabled + '></textarea>';
            parametro += '</div>';
            parametro += '</div>';
            return(parametro);
            break;
        case 'Lista desplegable':
            parametro = '<div class="col-lg-12">';
            parametro += '<div class="form-group">';
            parametro += '<label>' + label + ' ' + span_obligatorio + '</label>';
            parametro += '<select id="parametro_' + id + '" name="parametro[' + id + ']" class="form-control" ' + disabled + '>';
            var array = valores.split(",");
            parametro += '<option value="">:: Seleccionar ::</option>';
            for (var i in array) {
                if (array.hasOwnProperty(i)) {
                    parametro += '<option value="' + array[i] + '">' + array[i] + '</option>';
                }
            }
            parametro += '</select>';
            parametro += '</div>';
            parametro += '</div>';
            return(parametro);
            break;
        case 'Fecha':
            parametro = '<div class="col-lg-12">';
            parametro += '<div class="form-group">';
            parametro += '<label>' + label + ' ' + span_obligatorio + '</label>';
            parametro += '<div title="' + id + '" class="input-group date calendario" data-date="" data-date-format="yyyy-mm-dd" data-link-format="yyyy-mm-dd">';
            parametro += '<input id="parametro_' + id + '" name="parametro[' + id + ']" class="form-control" size="16" type="text" value="" readonly ' + disabled + '>';
            parametro += '<span class="input-group-addon"><span class="glyphicon glyphicon-calendar"></span></span>';
            parametro += '</div>';
            parametro += '</div>';
            parametro += '</div>';
            return(parametro);
        case 'Título':
            parametro = '<div class="col-lg-12">';
            parametro += '<div class="form-group">';
            parametro += '<h1>' + label + '</h1>';
            parametro += '</div>';
            parametro += '</div>';
            return(parametro);
        case 'Mensaje':
            parametro = '<div class="col-lg-12">';
            parametro += '<div class="form-group">';
            parametro += '<p>' + label + '</p>';
            parametro += '</div>';
            parametro += '</div>';
            return(parametro);
        case 'Salto de línea':
            parametro = '<div class="col-lg-12">';
            parametro += '<div class="form-group">';
            parametro += '<br/><br/>';
            parametro += '</div>';
            parametro += '</div>';
            return(parametro);
    }
}

function validator_form(token_actual) {

    //Validar el formulario
    $('.formulario_principal').bootstrapValidator(JSON.parse($("#validator").val())).on('success.form.bv', function (e) {

        // Prevent form submission
        e.preventDefault();
        // Get the form instance
        var $form = $(e.target);

        // Get the BootstrapValidator instance
        var bv = $form.data('bootstrapValidator');

        // Valido si el id existe, con el fin de eviarlo al metodo correcto
        $('#formulario_principal').attr('action', url_pv + 'Encuestas/new_encuesta_param');

        //Se realiza la peticion con el fin de guardar el registro actual
        $.ajax({
            type: 'POST',
            url: $form.attr('action'),
            data: $form.serialize() + "&modulo=Menu Participante&token=" + token_actual.token+"&propuesta=" + $("#id").val(),
        }).done(function (result) {

            if (result == 'error')
            {
                notify("danger", "ok", "Encuestas:", "Se registro un error, comuníquese con la mesa de ayuda convocatorias@scrd.gov.co");
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
                        if (isNaN(result)) {
                            notify("danger", "ok", "Encuestas:", "Se registro un error, comuníquese con la mesa de ayuda convocatorias@scrd.gov.co");
                        } else
                        {
                            location.href = url_pv_admin + 'pages/propuestas/mis_propuestas.html?msg=Se guardo con éxito la encuesta de satisfacción.&msg_tipo=success';
                        }
                    }
                }
            }

        });

    });

}