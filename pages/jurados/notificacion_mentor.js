
$(document).ready(function () {

  //init( $.urlParam("key"),  $.urlParam("opc") );
    validator_form($.urlParam("key"));

  if( $.urlParam("opc") === 'a'){
      cargar_notificacion( $.urlParam("key") );
  }

  if( $.urlParam("opc") === 'r'){
    rechazar_notificacion(  $.urlParam("key") );

  }

  $("#aceptar").click(function(){
    //alert("Acepta!!!");

  });

  //console.log( $.urlParam("key") );

});

function cargar_notificacion( key){

    // cargo los datos
    $.ajax({
        type: 'GET',
        url: url_pv+'Juradosseleccion/notificado_key_notificacion',
        data: {"key": key},
    }).done(function (data) {

      switch (data) {
        case 'error':
          notify("danger", "ok", "Convocatorias:", "Se registro un error, comuníquese con la mesa de ayuda convocatorias@scrd.gov.co");
          break;
        case 'error_metodo':
            notify("danger", "ok", "Se registro un error en el método, comuníquese con la mesa de ayuda convocatorias@scrd.gov.co");
            break;
        case 'error_token':
          location.href = url_pv_admin + 'index.html?msg=Su sesión ha expirado, por favor vuelva a ingresar.&msg_tipo=danger';
          break;
        case 'acceso_denegado':
          notify("danger", "remove", "Usuario:", "No tiene permisos para editar información.");
          break;
        case 'deshabilitado':
          notify("danger", "remove", "Usuario:", "No tiene permisos para editar información.");
          cargar_datos_formulario(token_actual);
          break;
        default:

          var json = JSON.parse(data);

          if( json ){

            if( json.notificacion && json.notificacion.estado ==='Notificada'){

              var fecha = new Date();
              $('#nombre').html(json.participante.primer_nombre+" "+json.participante.segundo_nombre+" "+json.participante.primer_apellido+" "+json.participante.segundo_apellido);
              $('#documento').html(json.participante.tipo_documento+" "+json.participante.numero_documento);
              $('#anio').html(json.notificacion.vigencia);
              $('#anio2').html(json.notificacion.vigencia);
              $('#fecha').html( fecha.getFullYear()+"-"+(fecha.getMonth()+1)+"-"+fecha.getDate());

              $("#notificación_texto").show();

            }

            if( json.notificacion && json.notificacion.estado !='Notificada' ){

                  $('#e').html( json.notificacion.estado );
                  $("#estado_notificacion").show();

            }

          }else{

          }

          break;
        }

      }

      );
}


function aceptar_notificacion( key){

  $.ajax({
      type: 'PUT',
      url: url_pv+'Juradosseleccion/aceptar_notificacion',
      data: $("#form_notificacion").serialize()
      +"&key="+key
  }).done(function (data) {

    switch (data) {
      case 'error':
        notify("danger", "ok", "Convocatorias:", "Se registro un error, comuníquese con la mesa de ayuda convocatorias@scrd.gov.co");
        break;
      case 'exito':
        notify("success", "ok", "Convocatorias:", "Se notificó con éxito.");
         $("#aceptar").addClass( "disabled" );
          ///cargar_tabla(token_actual);
          cargar_notificacion(key );
       break;
     }

});

}

function rechazar_notificacion( key){

  $.ajax({
      type: 'PUT',
      url: url_pv+'Juradosseleccion/rechazar_notificacion',
      data:"key="+key
  }).done(function (data) {


    switch (data) {
      case 'error':
        notify("danger", "ok", "Convocatorias:", "Se registro un error, comuníquese con la mesa de ayuda convocatorias@scrd.gov.co");
        break;
      case 'error_metodo':
        notify("danger", "ok", "Se registro un error en el método, comuníquese con la mesa de ayuda convocatorias@scrd.gov.co");
        break;
      case 'acceso_denegado':
        notify("danger", "remove", "Usuario:", "No tiene permisos para editar información.");
        break;
      case 'deshabilitado':
        notify("danger", "remove", "Usuario:", "No se puede realizar la acción.");
          cargar_notificacion(key );
        break;
      case 'rechazada':
        notify("danger", "remove", "Usuario:", "La invitación está rechazada");
        cargar_notificacion( key );
        break;
      default:
          notify("success", "ok", "Convocatorias:", "Se rechazó con éxito.");
          cargar_notificacion(key );
       break;
     }

});



}

function validator_form(key) {
   
  $('.form_notificacion').bootstrapValidator({
        feedbackIcons: {
            valid: 'glyphicon glyphicon-ok',
            invalid: 'glyphicon glyphicon-remove',
            validating: 'glyphicon glyphicon-refresh'
        },
        fields: {
          'check[]': {
              validators: {
                  choice: {
                      min: 5,
                      max: 5,
                      message: 'Debe seleccionar todos los compromisos'
                  }
              }
          }

        }
    }).on('success.form.bv', function (e) {

        //console.log("Validado");
        // Prevent form submission
        e.preventDefault();
        // Get the form instance
        var $form = $(e.target);

        // Get the BootstrapValidator instance
        var bv = $form.data('bootstrapValidator');

        aceptar_notificacion(key);

        $form.bootstrapValidator('disableSubmitButtons', false).bootstrapValidator('resetForm', true);
        bv.resetForm();

    });

}

/* Función para cargar alertas */
function notify(xclass, xicon, xtitle, xmessage) {
    $.notify({
        icon: 'glyphicon glyphicon-' + xicon,
        title: '<strong>' + xtitle + '</strong>',
        message: xmessage,
        /*url: 'http://www.movilmente.com',
         target: '_blank'*/
    }, {
        // settings
        type: xclass,
        allow_dismiss: true,
        newest_on_top: false,
        showProgressbar: false,
        placement: {
            from: "top",
            align: "right"
        },
        offset: 20,
        spacing: 10,
        z_index: 2000,
        delay: 5000,
        timer: 1000,
        animate: {
            enter: 'animated fadeInRight',
            exit: 'animated fadeOutRight'
        },
    });
}


$.urlParam = function(name){
    var results = new RegExp('[\?&]' + name + '=([^&#]*)').exec(window.location.href);
    if (results==null){
       return null;
    }
    else{
       return decodeURI(results[1]) || 0;
    }
  }
