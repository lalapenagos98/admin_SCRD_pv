/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

 /*Cesar Britto*/
 $(document).ready(function () {

    $("#idc").val($("#id").val());
    //$("#id").val(null);

     //Verifico si el token exite en el cliente y verifico que el token este activo en el servidor
    var token_actual = getLocalStorage(name_local_storage);

     //Verifico si el token esta vacio, para enviarlo a que ingrese de nuevo
     if ($.isEmptyObject(token_actual)) {
         location.href = url_pv_admin + 'index.html?msg=Su sesión ha expirado, por favor vuelva a ingresar.&msg_tipo=danger';
     } else
     {
         //Verifica si el token actual tiene acceso de lectura
         permiso_lectura(token_actual, "Menu Participante");
         $("#back_step").attr("onclick", " location.href = 'postular_hoja_vida.html?m=2&id="+  $("#idc").val()+"' ");

         cargar_tabla(token_actual);


       }// fin else

 });



 function cargar_tabla(token_actual){

     $('#table_list').DataTable({
                   "language": {
                       "url": "../../dist/libraries/datatables/js/spanish.json"
                   },
                   "processing": true,
                   "destroy": true,
                   "serverSide": true,
                   "lengthMenu": [5,10],
                   "responsive": true,
                   "searching": false,
                   "ajax":{
                       url : url_pv+"PropuestasJurados/listar",
                       data: {
                         "token" : token_actual.token,
                        },
                     },
                   "drawCallback": function (settings) {
                      //$(".check_activar_t").attr("checked", "true");
                      //$(".check_activar_f").removeAttr("checked");
                      acciones_b_registro(token_actual);
                     },
                   "columns": [

                       {"data": "Código",
                         render: function ( data, type, row ) {
                               return row.codigo;
                               },
                       },
                       {"data": "Convocatoria Banco de Jurados",
                         render: function ( data, type, row ) {
                               return row.convocatoria;
                               },
                       },
                       {"data": "Modalidad",
                         render: function ( data, type, row ) {
                               return row.modalidad_participa;
                               },
                       },
                       {"data": "Estado",
                         render: function ( data, type, row ) {
                               return row.estado;
                               },
                       },
                       {"data": "Aciones",
                                 render: function ( data, type, row ) {
                                             return '<button id="'+row.id+'" title="Ver hoja de vida" type="button" class="btn btn-warning btn_ver" id_convocatoria="'+row.id_convocatoria+'">'
                                                 +'<span class="fa fa-eye "></span></button>'
                                                ;
                                             },
                       }

                   ]
               });

   }

//Permite realizar acciones despues de cargar la tabla
 function acciones_b_registro(token_actual) {

   $(".btn_ver").on("click", function(){
      location.href='perfil.html?m=2&id='+$(this).attr('id_convocatoria')+'&p=0';
   });


   }
