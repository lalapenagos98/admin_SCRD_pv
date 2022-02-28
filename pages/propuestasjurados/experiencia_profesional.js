/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

 /*Cesar Britto*/
 $(document).ready(function () {


    $("#idc").val($("#id").val());
    $("#id").val(null);
    
    $("#back_step").attr("title", "");
    $("#back_step").attr("data-original-title", "");

     //Verifico si el token exite en el cliente y verifico que el token este activo en el servidor
     var token_actual = getLocalStorage(name_local_storage);

     //Verifico si el token esta vacio, para enviarlo a que ingrese de nuevo
     if ($.isEmptyObject(token_actual)) {
         location.href = url_pv_admin+'index.html?msg=Su sesión ha expirado, por favor vuelva a ingresar.&msg_tipo=danger';
     } else
     {
         //Verifica si el token actual tiene acceso de lectura
         permiso_lectura(token_actual, "Menu Participante");
         
         
         determinar_modalidad(token_actual);

        alert("Recuerde diligenciar toda la información requerida para este formulario");
        
        if ($("#modalidad_participa_educacion").val() === "Experto con título universitario"){
            $("#back_step").attr("onclick", " location.href = 'educacion_formal.html?m=2&id=" + $("#idc").val() + "' ");
            $("#back_step").attr("title", " Ingresar la información sobre educación formal. ");
            $("#back_step").attr("data-original-title", " Ingresar la información sobre educación formal. ");
        } 
        if ($("#modalidad_participa_educacion").val() === "Experto sin título universitario"){
            $("#back_step").attr("onclick", " location.href = 'educacion_no_formal.html?m=2&id=" + $("#idc").val() + "' ");
            $("#back_step").attr("title", " Ingresar la información sobre educación no formal. ");
            $("#back_step").attr("data-original-title", " Ingresar la información sobre educación no formal. ");
        }
        
        $("#next_step").attr("onclick", " location.href = 'experiencia_jurado.html?m=2&id="+  $("#idc").val()+"' ");

        //Peticion para buscar ciudades
        var json_ciudades = function (request, response) {
            $.ajax({
                type: 'GET',
                data: {"token": token_actual.token, "id": $("#id").attr('value'), q: request.term},
                url: url_pv + 'Ciudades/autocompletar/',
                dataType: "jsonp",
                success: function (data) {
                    response(data);
                }
            });
        };

        //Cargos el autocomplete de ciudad
        $( "#ciudad_name" ).autocomplete({
            source: json_ciudades,
            minLength: 2,
            select: function (event, ui) {
                $(this).val(ui.item ? ui.item : " ");
                $("#ciudad").val(ui.item.id);
            },
            change: function (event, ui) {
                if (!ui.item) {
                    this.value = '';
                    $('.formulario_principal').bootstrapValidator('revalidateField', 'ciudad_name');
                    $("#ciudad").val("");
                }
            //else { Return your label here }
            }
        });

        $("#archivo").on('change', function(){

          $('#formulario_principal').bootstrapValidator('addField', 'archivo', {
            validators: {
                //notEmpty: {message: 'El archivo es requerido'},
                file: {
                    extension: 'pdf',
                    type: 'application/pdf',
                    message: 'El archivo seleccionado no es válido',
                }
            }
           });

           //console.log( $('#archivo')[0].files[0].size );

           //4974593 = 5mb
           if ( $('#archivo')[0].files.length > 0 && $('#archivo')[0].files[0].size > 4974593 ){
               notify("danger", "remove", "Usuario:", "El archivo sobrepasa el tamaño máximo permitido");
               $('#archivo').val('');
           }

        });

         cargar_datos_formulario(token_actual);
         cargar_tabla(token_actual);
         validator_form(token_actual);

       }

 });
 
 
/*
 * 28-01-2022
 * Wilmer Gustavo Mogollón Duque
 * Se agrega función para determinar la categorís en la que participa el jurado
 */


function determinar_modalidad(token_actual) {


    // cargo los datos
    $.ajax({
        type: 'GET',
        url: url_pv + 'PropuestasJurados/propuesta',
        data: {"token": token_actual.token, "idc": $("#idc").val(), "modulo": "Menu Participante"},
        //data: $form.serialize() + "&modulo=Menu Participante&token=" + token_actual.token,

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
            default:

                var json = JSON.parse(data);

                $('#modalidad_participa_educacion').val("");

                $('#modalidad_participa_educacion').val(json.propuesta.modalidad_participa);

                break;
        }

    }

    );

}

 function cargar_datos_formulario(token_actual){

   // cargo los datos
   $.ajax({
       type: 'GET',
       url: url_pv + 'PropuestasJurados/search_experiencia_laboral',
       data: {"token": token_actual.token, "idc": $("#idc").val(), "idregistro": $("#idregistro").val()},

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
       default:

         var json = JSON.parse(data);

         if( json.usuario_perfil ){

           //Cargos el select de tipo_entidad
           $('#tipo_entidad').find('option').remove();
           $("#tipo_entidad").append('<option value="">:: Seleccionar ::</option>');
           if (json.tipo_entidad.length > 0) {
               $.each(json.tipo_entidad, function (key, array) {
                   $("#tipo_entidad").append('<option value="' + array.id + '" >' + array.nombre + '</option>');
               });
           }

           //Cargos el select de tipo_entidad
           $('#linea').find('option').remove();
           $("#linea").append('<option value="">:: Seleccionar ::</option>');
           if (json.linea.length > 0) {
               $.each(json.linea, function (key, array) {
                   $("#linea").append('<option value="' + array.id + '" >' + array.nombre + '</option>');
               });
           }

           //Cargo el formulario con los datos
           if( json.experiencialaboral ){
             $("#graduado").removeClass();
             $('#ciudad_name').val(json.ciudad_name);
             $('#ciudad').val(json.experiencialaboral.ciudad.id);
             $('#funcion').val(json.experiencialaboral.funcion);

             $('.formulario_principal').loadJSON(json.experiencialaboral);
           }

           $("#formulario_principal").show();

         }else{

           //window.location.href = url_pv_admin+"pages/perfilesparticipantes/jurado.html";
           notify("danger", "ok", "Convocatorias:", "No tiene el perfil de participante para esta convocatoria");

         }

         break;
       }

     }

     );

 }

 function cargar_tabla(token_actual){
   //console.log("idconvocatoria-->"+$("#idc").val() );
   //Cargar datos en la tabla actual
   $('#table_list').DataTable({
                 "language": {
                     "url": "../../dist/libraries/datatables/js/spanish.json"
                 },
                 "processing": true,
                 "destroy": true,
                 "serverSide": true,
                 "lengthMenu": [10, 15, 20, 30, 50, 100], //07-05-2020 Wilmer Mogollón -se agregan valores al array
                 "responsive": true,
                 "ajax":{
                     url : url_pv+"PropuestasJurados/all_experiencia_laboral",
                     data: {"token": token_actual.token, "idc": $("#idc").val() },
                     async: false
                   },
                   "drawCallback": function (settings) {
                      //$(".check_activar_t").attr("checked", "true");
                      //$(".check_activar_f").removeAttr("checked");
                      acciones_registro(token_actual);
                     },
                 "columns": [
                     {"data": "Ciudad",
                       render: function ( data, type, row ) {
                             return row.ciudad;
                             },
                     },

                     {"data": "Tipo Entidad",
                       render: function ( data, type, row ) {
                             return row.tipo_entidad;
                             },
                     },

                     {"data": "Entidad",
                       render: function ( data, type, row ) {
                             return row.entidad;
                             },
                     },
                     {"data": "Línea",
                       render: function ( data, type, row ) {
                             return row.linea;
                             },
                     },

                     {"data": "Fecha de Inicio",
                       render: function ( data, type, row ) {
                             return row.fecha_inicio;
                             },
                     },
                     {"data": "Fecha de Terminación",
                       render: function ( data, type, row ) {
                             return row.fecha_fin;
                             },
                     },
                     {"data": "Meses de Experiencia",
                       render: function ( data, type, row ) {
                             return  ( ( ( (new Date(row.fecha_fin)) - (new Date(row.fecha_inicio)) ) / (60 * 60 * 24 * 1000) ) / 30 ).toFixed(1);
                             },
                     },
                     {"data": "Seleccionar",
                       render: function ( data, type, row ) {
                             return ' <input title=\"'+row.id+'\" type=\"checkbox\" class=\"check_activar_'+row.active+'  activar_registro" '+(row.active? 'checked ':'')+' />';
                             },
                     },
                     {"data": "aciones",
                               render: function ( data, type, row ) {
                                           return '<button title="Editar" id="'+row.id+'" type="button" class="btn btn-warning btn_cargar" data-toggle="modal" data-target="#nueva_ronda\">'
                                               +'<span class="glyphicon glyphicon-edit"></span></button>'
                                               +'<button title="'+( row.file == null ? "No se ha cargado archivo": "Descargar archivo")+'" id="'+( row.file == null ? "No se ha cargado archivo": row.file)+'"type="button" class="btn btn-primary download_file">'
                                               + ( row.file == null ? '<span class="glyphicon glyphicon-ban-circle" title="No se ha cargado archivo"></span>':'<span class="glyphicon glyphicon-download-alt"></span>')
                                               + '</button>';
                                           },
                     }

                 ]
             });

 }

 function validator_form(token_actual) {

       //Se debe colocar debido a que el calendario es un componente diferente
       $('.calendario').on('changeDate show', function (e) {
           $('.formulario_principal').bootstrapValidator('revalidateField', 'fecha_inicio');
       });

      /* $('.calendario').on('changeDate show', function (e) {
           $('.formulario_principal').bootstrapValidator('revalidateField', 'fecha_fin');
       });*/

       //Validar el formulario
       $('.formulario_principal').bootstrapValidator({
           feedbackIcons: {
               valid: 'glyphicon glyphicon-ok',
               invalid: 'glyphicon glyphicon-remove',
               validating: 'glyphicon glyphicon-refresh'
           },
           fields: {
               tipo_entidad:{
                 validators: {
                     notEmpty: {message: 'El tipo es requerido'}
                 }
               },
               entidad: {
                   validators: {
                       notEmpty: {message: 'La entidad es requerida'}
                   }
               },
               fecha_inicio: {
                   validators: {
                       notEmpty: {message: 'La fecha es requerida'}
                   }
               },
               linea: {
                    validators: {
                        notEmpty: {message: 'La línea es requerida'}
                    }
                },
               funcion: {
                   validators: {
                       notEmpty: {message: 'Las funciones son requeridas'},
                       stringLength: {
                            max: 500,
                            message: 'Este campo debe contener máximo 500 caracteres'
                        }
                   }
               },
               correo: {
                   validators: {
                       notEmpty: {message: 'El correo electrónico es requerido'},
                       emailAddress: {message: 'No es un correo electrónico válido'},
                   }
               },
               ciudad_name: {
                   validators: {
                       notEmpty: {message: 'La cidudad es requerida'}
                   }
               },
               direccion: {
                   validators: {
                       notEmpty: {message: 'La dirección es requerida'},
                   }
               },
             }

       }).on('success.form.bv', function (e) {
           // Prevent form submission
           e.preventDefault();
           // Get the form instance
           var $form = $(e.target);

           // Get the BootstrapValidator instance
           var bv = $form.data('bootstrapValidator');

           var formData = new FormData(document.getElementById("formulario_principal"));
           formData.append("modulo", "Menu Participante");
           formData.append("token", token_actual.token);
           formData.append("convocatoria", $("#id").attr('value'));
           formData.append("anexos", "documentacion");

        //   console.log("formData-->"+formData);

          // console.log("idregistro-->"+$("#idregistro").val());

           if (typeof $("#idregistro").attr('value') == 'undefined' || $("#idregistro").val() =='' ) {
                 //console.log("guardar");

                 //$("#id").val($("#idp").attr('value'));
                 //Se realiza la peticion con el fin de guardar el registro actual
                 $.ajax({
                     type: 'POST',
                     url: url_pv + 'PropuestasJurados/new_experiencia_laboral',
                     //data: $form.serialize() + "&modulo=Menu Participante&token=" + token_actual.token,
                     data: formData,
                     cache: false,
                     contentType: false,
                     processData: false,
                     async: false

                 }).done(function (result) {

                   switch (result) {
                     case 'error':
                       notify("danger", "ok", "Convocatorias:", "Se registro un error, comuníquese con la mesa de ayuda convocatorias@scrd.gov.co");
                       break;
                     case 'error_token':
                       location.href = url_pv_admin + 'index.html?msg=Su sesión ha expirado, por favor vuelva a ingresar.&msg_tipo=danger';
                       break;
                     case 'acceso_denegado':
                       notify("danger", "remove", "Usuario:", "No tiene permisos para editar información.");
                       break;
                     case 'deshabilitado':
                       notify("danger", "remove", "Usuario:", "No tiene permisos para editar información.");
                       //cargar_datos_formulario(token_actual);
                       break;
                     case 'error_creo_alfresco':
                       notify("danger", "remove", "Usuario:", "Se registró un error, comuníquese con la mesa de ayuda convocatorias@scrd.gov.co");
                       //cargar_datos_formulario(token_actual);
                       break;
                     default:
                       notify("success", "ok", "Convocatorias:", "Se agregó el registro con éxito.");
                       //cargar_datos_formulario(token_actual);
                       break;
                   }

                 });

             }else{
                 console.log("Actualizar -->"+$("#idregistro").val());

                 $.ajax({
                     type: 'POST',
                     url: url_pv + 'PropuestasJurados/edit_experiencia_laboral/' + $("#idregistro").val(),
                     //data: $form.serialize() + "&modulo=Menu Participante&token=" + token_actual.token,
                     data: formData,
                     cache: false,
                     contentType: false,
                     processData: false,
                     async: false
                 }).done(function (result) {

                   switch (result) {
                     case 'error':
                       notify("danger", "ok", "Convocatorias:", "Se registro un error, comuníquese con la mesa de ayuda convocatorias@scrd.gov.co");
                       break;
                     case 'error_token':
                       location.href = url_pv_admin + 'index.html?msg=Su sesión ha expirado, por favor vuelva a ingresar.&msg_tipo=danger';
                       break;
                     case 'acceso_denegado':
                       notify("danger", "remove", "Usuario:", "No tiene permisos para editar información.");
                       break;
                     case 'deshabilitado':
                       notify("danger", "remove", "Usuario:", "No tiene permisos para editar información.");
                       //cargar_datos_formulario(token_actual);
                       break;
                     case 'error_creo_alfresco':
                       notify("danger", "remove", "Usuario:", "Se registró un error, comuníquese con la mesa de ayuda convocatorias@scrd.gov.co");
                       //cargar_datos_formulario(token_actual);
                       break;
                     default:
                       notify("success", "ok", "Convocatorias:", "Se actualizó el registro con éxito.");
                       //cargar_datos_formulario(token_actual);
                       break;
                   }

                 }
               );

             }

           $("#idregistro").val(null);
           $("#archivo").val(null);
           $("#fecha_inicio").val(null);
           $("#fecha_fin").val(null);
           $form.bootstrapValidator('disableSubmitButtons', false).bootstrapValidator('resetForm', true);
           //$form.bootstrapValidator('destroy', true);
           bv.resetForm();
           cargar_datos_formulario(token_actual);
           cargar_tabla(token_actual);
       });

   }

//Permite realizar acciones despues de cargar la tabla
 function acciones_registro(token_actual) {

     //Permite realizar la carga respectiva de cada registro
     $(".btn_cargar").click(function () {
         $("#idregistro").val( $(this).attr("id") );
         // cargo los datos
         cargar_datos_formulario(token_actual);
     });

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
             data: {"token": token_actual.token, "modulo": "Menu Participante", "active": active, "idc": $("#idc").val()},
             url: url_pv + 'PropuestasJurados/delete_experiencia_laboral/' + $(this).attr("title")
         }).done(function (result) {

           switch (result) {
             case 'Si':
                 notify("info", "ok", "Convocatorias:", "Se activó el registro con éxito.");
                 break;
             case 'No':
                   notify("info", "ok", "Convocatorias:", "Se desactivó el registro con éxito.");
                   break;
             case 'error':
               notify("danger", "ok", "Convocatorias:", "Se registro un error, comuníquese con la mesa de ayuda convocatorias@scrd.gov.co");
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
               notify("success", "ok", "Convocatorias:", "Se actualizó el registro con éxito.");
               cargar_datos_formulario(token_actual);
               break;
           }


         });
     });

     //desarcar archivo
     $(".download_file").click(function () {
       //Cargo el id file
       var cod = $(this).attr('id');

       $.AjaxDownloader({
           url: url_pv + 'PropuestasJurados/download_file/',
           data : {
               cod   : cod,
               token   : token_actual.token
           }
       });

     });

   }
