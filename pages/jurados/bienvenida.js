//Iniciamos el documento
$(document).ready(function () {
    //Verifico si el token exite en el cliente y verifico que el token este activo en el servidor                
    var token_actual = getLocalStorage(name_local_storage);

    /*Validar si existe una convocatoria de jurados vigente*/
    validar_convocatoria_jurados(token_actual);

    $("#convocatoria_no_disponible").hide();


    //Verifico si el token esta vacio, para enviarlo a que ingrese de nuevo
    if ($.isEmptyObject(token_actual)) {
        location.href = url_pv_admin + 'index.html?msg=Su sesión ha expirado, por favor vuelva a ingresar.&msg_tipo=danger';
    } else
    {

        $(".crear_copia_hoja_vida").click(function () {
            
            var bandera = $(this).attr("id");
            switch (bandera) {
                case "ahv":
                    location.href = "../propuestasjurados/perfil.html?m=2&id="+$("#convocatoria").val()+"&p=0";
                    break;
                    
                case "atc":
                    location.href = "../propuestasjurados/postular_hoja_vida.html?m=2&id="+$("#convocatoria").val();
                    break;
                    
                default:
                    return false;
                    break;
            }
         
        });
        $(".crear_hoja_vida").click(function () {
            location.href = "../propuestasjurados/perfil.html?m=2&id="+$("#convocatoria").val()+"&p=0";
        });
        $(".actualizar_hoja_vida").click(function () {
            location.href = "../propuestasjurados/perfil.html?m=2&id="+$("#convocatoria").val()+"&p=0";
        });
        $(".mis_postulaciones").click(function () {
            location.href = "../propuestasjurados/postulaciones.html?m=2&id="+$("#convocatoria").val()+"&p=0";
        });
        $(".evaluar_propuestas").click(function () {
            location.href = "../administracionpropuestas/evaluacion_propuestas.html";
        });
        
        $(".aceptar_terminos").click(function () {
            location.href = "../propuestasjurados/postular_hoja_vida.html?m=2&id=" + $("#convocatoria").val();
        });

    }
});

/*
 * 29-09-2021
 * Wilmer Gustavo Mogollón Duque
 * Se agrega función validar_estado_envio_documentacion
 */
function validar_convocatoria_jurados(token_actual) {
    $.ajax({
        type: 'GET',
        url: url_pv + 'Jurados/validar_convocatoria_jurados',
        data: {"token": token_actual.token}

    }).done(function (data) {

        switch (data) {
            case 'error':
                notify("danger", "ok", "Usuario:", "Se registro un error, comuníquese con la mesa de ayuda soporte.convocatorias@scrd.gov.co");
                break;
            case 'error_metodo':
                notify("danger", "ok", "Se registro un error en el método, comuníquese con la mesa de ayuda soporte.convocatorias@scrd.gov.co");
                break;
            case 'error_token':
                location.href = url_pv_admin + 'index.html?msg=Su sesión ha expirado, por favor vuelva a ingresar.&msg_tipo=danger';
                //notify("danger", "error_token", "URL:", 'PropuestasEvaluacion/evaluacionpropuestas/'+id_evaluacion+'/impedimentos');
                break;
            case 'acceso_denegado':
                notify("danger", "remove", "Usuario:", "No tiene permisos para editar información.");
                break;
            case 'deshabilitado':
                notify("danger", "remove", "Usuario:", "No tiene permisos para editar información.");
                break;
            case 'error_validacion':
                notify("danger", "remove", "Usuario:", "Tiene evaluaciones sin confirmar");
                break;
            default:
                var json = JSON.parse(data);
                if (json.disponible === true) {
                    $("#convocatoria").attr("value", json.convocatoria.id);
                    if (json.tiene_hoja_de_vida === false) {
                        $("#botones_acciones_jurado_sin_hoja").show();
                    } else {
                        if (json.hoja_de_vida_banco_actual === true) {
                            $("#botones_acciones_jurado_confirmado").show();
                            if(json.propuesta_jurado.estado === 10){
                                $("#actualizar_hv").show();
                                $("#postulaciones").show();
                                $("#evaluar").show();
                            }else{
                                $("#actualizar_hv").show();
                                $("#aceptar_terminos").show();
                                $("#postulaciones").hide();
                                $("#evaluar").hide();
                            }
                            
                        } else {
                            $("#botones_acciones_jurado_hoja_antigua").show();
                        }
                    }
//                    $("#info_general").attr("value", json.observaciones_documentos_ganadores);
                } else {
                    $("#convocatoria_no_disponible").show();
                    $("#mensaje_jurados").hide();
                }
        }

    });
}