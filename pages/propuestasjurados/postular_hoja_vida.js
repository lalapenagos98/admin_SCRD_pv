/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

/*Cesar Britto*/
$(document).ready(function () {


    $("#idc").val($("#id").val());
    $("#id").val(null);

    //Verifico si el token exite en el cliente y verifico que el token este activo en el servidor
    var token_actual = getLocalStorage(name_local_storage);

    /*
    function validarMentor() {
        $.ajax({
            type: 'GET',
            data: {"token": token_actual.token, "modulo": "Menu Participante", "idc": $("#idc").val()},
            url: url_pv + 'PropuestasJurados/validar_mentor'
        }).done(function (data) {
            var json = JSON.parse(data);
            if (json.mentorvalido == 0) {
                notify("danger", "ok", "Para postularse como mentor por favor completar la siguiente información: " + json.mensaje);
            }
        });
    }
    */

    //Verifico si el token esta vacio, para enviarlo a que ingrese de nuevo
    if ($.isEmptyObject(token_actual)) {
        location.href = url_pv_admin + 'index.html?msg=Su sesión ha expirado, por favor vuelva a ingresar.&msg_tipo=danger';
    } else
    {
        //Verifica si el token actual tiene acceso de lectura
        permiso_lectura(token_actual, "Menu Participante");

        $("#back_step").attr("onclick", " location.href = 'documentos_administrativos.html?m=2&id=" + $("#idc").val() + "' ");
        $("#next_step").attr("onclick", " location.href = 'postulaciones.html?m=2&id=" + $("#idc").val() + "' ");
        cargar_datos_formulario(token_actual);

        /*Validar si existe una convocatoria de jurados vigente*/
        validar_convocatoria_jurados(token_actual);

        $("#postular").click(function () {
        //$("#h1_postular").click(function () {

            $.ajax({
                type: 'GET',
                data: {"token": token_actual.token, "modulo": "Menu Participante", "idc": $("#idc").val()},
                url: url_pv + 'PropuestasJurados/validar_mentor'
            }).done(function (data) {
                var json = JSON.parse(data);
                if (json.mentorValido == 0) {
                    notify("danger", "ok", "Atención:", "Si desea ser también mentor por favor complete la siguiente información: " + json.mensaje);
                }
                else {
                    $("#mensaje").show();
                    $("#bcancelar").show();
                    $("#baceptar").show();

                    $("#mensaje2").hide();
                    $("#aceptar").hide();
                }
            });

        });

        $("#baceptar").click(function () {
            aceptar_terminos(token_actual);
            $('#exampleModal').modal('toggle');

        });

        $(".mis_postulaciones").click(function () {
            location.href = "../propuestasjurados/postulaciones.html?m=2&id=" + $("#convocatoria").val() + "&p=0";
        });

        $.ajax({
            type: 'GET',
            data: {"token": token_actual.token},
            url: url_pv + 'PropuestasJurados/download_condiciones'
        }).done(function (data) {

            var json = JSON.parse(data);

            $("#condiciones_banco_jurados").attr("href", json.archivo);
            $("#terminos_condiciones_pdf").attr("src", json.archivo);


        });

        /*
         * 12-02-2021
         * Wilmer Gustavo Mogollón Duque
         * //Se agrega para mostrar documento de tratamiento de datos
         $("#tratamiento_datos_pdf").attr("src", json.archivo);
         */
        $.ajax({
            type: 'GET',
            data: {"token": token_actual.token},
            url: url_pv + 'PropuestasJurados/download_tratamiento'
        }).done(function (data) {

            var json = JSON.parse(data);

            //Se agrega para mostrar documento de tratamiento de datos
            $("#tratamiento_datos_pdf").attr("src", json.archivo);

        });

    }


});


function cargar_datos_formulario(token_actual) {


    //datos de la propuesta
    $.ajax({
        type: 'GET',
        data: {"token": token_actual.token, "modulo": "Menu Participante", "idc": $("#idc").val()},
        url: url_pv + 'PropuestasJurados/propuesta'
    }).done(function (data) {

        var json = JSON.parse(data);

        $("#modalidad_participa_jurado").html(json.propuesta.modalidad_participa);

        //9	jurados	Registrado
        if (json.propuesta.estado === 9) {

            $("#estado").hide();
            $("#terminos").show();
            $("#formulario_principal").show();
        }

        //10	jurados	Inscrito
        if (json.propuesta.estado === 10) {
            $("#estado").show();
            $("#terminos").hide();
            $("#formulario_principal").hide();

        }

    });


    $(".download_file").click(function () {
        //Cargo el id file

        /*  $.AjaxDownloader({
         url: url_pv + 'PropuestasJurados/download_file/',
         data : {
         cod   : documento,
         token   : token_actual.token
         }
         });*/

    });

    cargar_tabla_educacion_formal(token_actual);
    cargar_tabla_educacion_no_formal(token_actual);
    cargar_tabla_experiencia(token_actual);
    cargar_tabla_experiencia_jurado(token_actual);
    cargar_tabla_reconocimiento(token_actual);
    cargar_tabla_publicaciones(token_actual);
    cargar_tabla_documentos(token_actual);
}

function cargar_tabla_educacion_formal(token_actual) {
    //Cargar datos en la tabla actual
    $('#table_educacion_formal').DataTable({
        "language": {
            "url": "../../dist/libraries/datatables/js/spanish.json"
        },
        "processing": true,
        "destroy": true,
        "serverSide": true,
        "lengthMenu": [10],
        "responsive": true,
        "searching": false,
        "ajax": {
            url: url_pv + "PropuestasJurados/all_educacion_formal/active",
            data: {"token": token_actual.token, "idc": $("#idc").val()},
            //async: false
        },
        "drawCallback": function (settings) {
            //$(".check_activar_t").attr("checked", "true");
            //$(".check_activar_f").removeAttr("checked");
            //acciones_registro(token_actual);
        },
        "columns": [
            {"data": "Nivel educativo",
                render: function (data, type, row) {
                    return row.nivel_educacion;
                },
            },

            {"data": "Título",
                render: function (data, type, row) {
                    return row.titulo;
                },
            },

            {"data": "Institución educativa",
                render: function (data, type, row) {
                    return row.institucion;
                },
            },
            {"data": "Graduado",
                render: function (data, type, row) {
                    return (row.graduado == true ? 'Si' : 'No');
                },
            },
                    /* {"data": "Seleccionar",
                     render: function ( data, type, row ) {
                     return ' <input title=\"'+row.id+'\" type=\"checkbox\" class=\"check_activar_'+row.active+'  activar_registro" '+(row.active? 'checked ':'')+' />';
                     },
                     },

                     {"data": "aciones",
                     render: function ( data, type, row ) {
                     return '<button title="Editar" id="'+row.id+'" type="button" class="btn btn-warning btn_cargar">'
                     +'<span class="glyphicon glyphicon-edit"></span></button>'
                     +'<button title="'+( row.file == null ? "No se ha cargado archivo": "Descargar archivo")+'" id="'+( row.file == null ? "No se ha cargado archivo": row.file)+'"  type="button" class="btn btn-primary download_file">'
                     + ( row.file == null ? '<span class="glyphicon glyphicon-ban-circle" title="No se ha cargado archivo"></span>':'<span class="glyphicon glyphicon-download-alt"></span>')
                     + '</button>';
                     },
                     }*/



        ]
    });

}

function cargar_tabla_educacion_no_formal(token_actual) {
    // console.log("idconvocatoria-->"+$("#idc").val() );
    //Cargar datos en la tabla actual
    $('#table_educacion_no_formal').DataTable({
        "language": {
            "url": "../../dist/libraries/datatables/js/spanish.json"
        },
        "processing": true,
        "destroy": true,
        "serverSide": true,
        "lengthMenu": [10],
        "responsive": true,
        "searching": false,
        "ajax": {
            url: url_pv + "PropuestasJurados/all_educacion_no_formal/active",
            data: {"token": token_actual.token, "idc": $("#idc").val()},
            //  async: false
        },
        "drawCallback": function (settings) {
            //$(".check_activar_t").attr("checked", "true");
            //$(".check_activar_f").removeAttr("checked");
            //acciones_registro(token_actual);
        },
        "columns": [
            {"data": "Tipo",
                render: function (data, type, row) {
                    return row.tipo;
                },
            },
            {"data": "Modalidad",
                render: function (data, type, row) {
                    return row.modalidad;
                },
            },
            {"data": "Noḿbre",
                render: function (data, type, row) {
                    return row.nombre;
                },
            },
            {"data": "Institución",
                render: function (data, type, row) {
                    return row.institucion;
                },
            },
            {"data": "Fecha de Inicio",
                render: function (data, type, row) {
                    return row.fecha_inicio;
                },
            },
            {"data": "Fecha de Terminación",
                render: function (data, type, row) {
                    return row.fecha_fin;
                },
            },
            {"data": "Número de Horas",
                render: function (data, type, row) {
                    return row.numero_hora;
                },
            },
            {"data": "Ciudad",
                render: function (data, type, row) {
                    return row.ciudad;
                },
            },
                    /*
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
                     */



        ]
    });

}

function cargar_tabla_experiencia(token_actual) {
    console.log("idconvocatoria-->" + $("#idc").val());
    //Cargar datos en la tabla actual
    $('#table_experiencia').DataTable({
        "language": {
            "url": "../../dist/libraries/datatables/js/spanish.json"
        },
        "processing": true,
        "destroy": true,
        "serverSide": true,
        "lengthMenu": [10],
        "responsive": true,
        "searching": false,
        "ajax": {
            url: url_pv + "PropuestasJurados/all_experiencia_laboral/active",
            data: {"token": token_actual.token, "idc": $("#idc").val()},
            async: false
        },
        "drawCallback": function (settings) {
            //$(".check_activar_t").attr("checked", "true");
            //$(".check_activar_f").removeAttr("checked");
            //acciones_registro(token_actual);
        },
        "columns": [
            {"data": "Ciudad",
                render: function (data, type, row) {
                    return row.ciudad;
                },
            },

            {"data": "Tipo Entidad",
                render: function (data, type, row) {
                    return row.tipo_entidad;
                },
            },

            {"data": "Entidad",
                render: function (data, type, row) {
                    return row.entidad;
                },
            },
            {"data": "Línea",
                render: function (data, type, row) {
                    return row.linea;
                },
            },

            {"data": "Fecha de Inicio",
                render: function (data, type, row) {
                    return row.fecha_inicio;
                },
            },
            {"data": "Fecha de Terminación",
                render: function (data, type, row) {
                    return row.fecha_fin;
                },
            },
            {"data": "Meses de Experiencia",
                render: function (data, type, row) {
                    return  ((((new Date(row.fecha_fin)) - (new Date(row.fecha_inicio))) / (60 * 60 * 24 * 1000)) / 30).toFixed(1);
                },
            },
                    /*
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
                     */


        ]
    });

}

function cargar_tabla_experiencia_jurado(token_actual) {
    //console.log("idconvocatoria-->"+$("#idc").val() );
    //Cargar datos en la tabla actual
    $('#table_experiencia_jurado').DataTable({
        "language": {
            "url": "../../dist/libraries/datatables/js/spanish.json"
        },
        "processing": true,
        "destroy": true,
        "serverSide": true,
        "lengthMenu": [10],
        "responsive": true,
        "searching": false,
        "ajax": {
            url: url_pv + "PropuestasJurados/all_experiencia_jurado/active",
            data: {"token": token_actual.token, "idc": $("#idc").val()},
            async: false
        },
        "drawCallback": function (settings) {
            //$(".check_activar_t").attr("checked", "true");
            //$(".check_activar_f").removeAttr("checked");
            //acciones_registro(token_actual);
        },
        "columns": [

            {"data": "Nombre convocatoria",
                render: function (data, type, row) {
                    return row.nombre;
                },
            },

            {"data": "Entidad",
                render: function (data, type, row) {
                    return row.entidad;
                },
            },

            {"data": "Año",
                render: function (data, type, row) {
                    return row.anio;
                },
            },
            {"data": "Ambito",
                render: function (data, type, row) {
                    return row.ambito;
                },
            },
            {"data": "Ciudad",
                render: function (data, type, row) {
                    return row.ciudad;
                },
            },
                    /*
                     {"data": "Seleccionar",
                     render: function ( data, type, row ) {
                     return ' <input title=\"'+row.id+'\" type=\"checkbox\" class=\"check_activar_'+row.active+'  activar_registro" '+(row.active? 'checked ':'')+' />';
                     },
                     },
                     {"data": "aciones",
                     render: function ( data, type, row ) {
                     return '<button title="'+row.id+'" type="button" class="btn btn-warning btn_cargar" data-toggle="modal" data-target="#nueva_ronda\">'
                     +'<span class="glyphicon glyphicon-edit"></span></button>'
                     +'<button title="'+( row.file == null ? "No se ha cargado archivo": row.file)+'" type="button" class="btn btn-primary download_file">'
                     + ( row.file == null ? '<span class="glyphicon glyphicon-ban-circle" title="No se ha cargado archivo"></span>':'<span class="glyphicon glyphicon-download-alt"></span>')
                     + '</button>';
                     },
                     }*/

        ]
    });

}

function cargar_tabla_reconocimiento(token_actual) {
    //console.log("idconvocatoria-->"+$("#idc").val() );
    //Cargar datos en la tabla actual
    $('#table_reconocimiento').DataTable({
        "language": {
            "url": "../../dist/libraries/datatables/js/spanish.json"
        },
        "processing": true,
        "destroy": true,
        "serverSide": true,
        "lengthMenu": [10],
        "responsive": true,
        "searching": false,
        "ajax": {
            url: url_pv + "PropuestasJurados/all_reconocimiento/active",
            data: {"token": token_actual.token, "idc": $("#idc").val()},
            async: false
        },
        "drawCallback": function (settings) {
            //$(".check_activar_t").attr("checked", "true");
            //$(".check_activar_f").removeAttr("checked");
            //acciones_registro(token_actual);
        },
        "columns": [

            {"data": "Nombre",
                render: function (data, type, row) {
                    return row.nombre;
                },
            },
            {"data": "Institución",
                render: function (data, type, row) {
                    return row.institucion;
                },
            },
            {"data": "Tipo",
                render: function (data, type, row) {
                    return row.tipo;
                },
            },
            {"data": "Año",
                render: function (data, type, row) {
                    return row.anio;
                },
            },
            {"data": "Ciudad",
                render: function (data, type, row) {
                    return row.ciudad;
                },
            },
                    /*
                     {"data": "Seleccionar",
                     render: function ( data, type, row ) {
                     return ' <input title=\"'+row.id+'\" type=\"checkbox\" class=\"check_activar_'+row.active+'  activar_registro" '+(row.active? 'checked ':'')+' />';
                     },
                     },
                     {"data": "aciones",
                     render: function ( data, type, row ) {
                     return '<button title="'+row.id+'" type="button" class="btn btn-warning btn_cargar" data-toggle="modal" data-target="#nueva_ronda\">'
                     +'<span class="glyphicon glyphicon-edit"></span></button>'
                     +'<button title="'+( row.file == null ? "No se ha cargado archivo": row.file)+'" type="button" class="btn btn-primary download_file">'
                     + ( row.file == null ? '<span class="glyphicon glyphicon-ban-circle" title="No se ha cargado archivo"></span>':'<span class="glyphicon glyphicon-download-alt"></span>')
                     + '</button>';
                     },
                     }*/

        ]
    });

}

function cargar_tabla_publicaciones(token_actual) {
    console.log("idconvocatoria-->" + $("#idc").val());
    //Cargar datos en la tabla actual
    $('#table_publicaciones').DataTable({
        "language": {
            "url": "../../dist/libraries/datatables/js/spanish.json"
        },
        "processing": true,
        "destroy": true,
        "serverSide": true,
        "lengthMenu": [10],
        "responsive": true,
        "searching": false,
        "ajax": {
            url: url_pv + "PropuestasJurados/all_publicacion/active",
            data: {"token": token_actual.token, "idc": $("#idc").val()},
            async: false
        },
        "drawCallback": function (settings) {
            //$(".check_activar_t").attr("checked", "true");
            //$(".check_activar_f").removeAttr("checked");
            //  acciones_registro(token_actual);
        },
        "columns": [

            {"data": "titulo",
                render: function (data, type, row) {
                    return row.titulo;
                },
            },
            {"data": "Tema",
                render: function (data, type, row) {
                    return row.tema;
                },
            },
            {"data": "Tipo",
                render: function (data, type, row) {
                    return row.tipo;
                },
            },
            {"data": "Ciudad",
                render: function (data, type, row) {
                    return row.ciudad;
                },
            },
                    /*
                     {"data": "Seleccionar",
                     render: function ( data, type, row ) {
                     return ' <input title=\"'+row.id+'\" type=\"checkbox\" class=\"check_activar_'+row.active+'  activar_registro" '+(row.active? 'checked ':'')+' />';
                     },
                     },
                     {"data": "aciones",
                     render: function ( data, type, row ) {
                     return '<button title="'+row.id+'" type="button" class="btn btn-warning btn_cargar" data-toggle="modal" data-target="#nueva_ronda\">'
                     +'<span class="glyphicon glyphicon-edit"></span></button>'
                     +'<button title="'+( row.file == null ? "No se ha cargado archivo": row.file)+'" type="button" class="btn btn-primary download_file">'
                     + ( row.file == null ? '<span class="glyphicon glyphicon-ban-circle" title="No se ha cargado archivo"></span>':'<span class="glyphicon glyphicon-download-alt"></span>')
                     + '</button>';
                     },
                     }
                     */

        ]
    });

}

function cargar_tabla_documentos(token_actual) {
    // console.log("idconvocatoria-->"+$("#idc").val() );
    //Cargar datos en la tabla actual
    $('#table_documentos').DataTable({
        "language": {
            "url": "../../dist/libraries/datatables/js/spanish.json"
        },
        "processing": true,
        "destroy": true,
        "serverSide": true,
        "lengthMenu": [10],
        "searching": false,
        "ajax": {
            url: url_pv + "PropuestasJurados/all_documento/active",
            data: {"token": token_actual.token, "idc": $("#idc").val()},
            // async: false
        },
        "drawCallback": function (settings) {
            //$(".check_activar_t").attr("checked", "true");
            //$(".check_activar_f").removeAttr("checked");
            //acciones_registro(token_actual);
        },
        "columns": [

            {"data": "Documento",
                render: function (data, type, row) {
                    return row.categoria_jurado;
                },
            },
                    /*
                     {"data": "Seleccionar",
                     render: function ( data, type, row ) {
                     return ' <input title=\"'+row.id+'\" type=\"checkbox\" class=\"check_activar_'+row.active+'  activar_registro" '+(row.active? 'checked ':'')+' />';
                     },
                     },
                     {"data": "aciones",
                     render: function ( data, type, row ) {
                     return '<button title="'+row.id+'" type="button" class="btn btn-warning btn_cargar" data-toggle="modal" data-target="#nueva_ronda\">'
                     +'<span class="glyphicon glyphicon-edit"></span></button>'
                     +'<button title="'+( row.file == null ? "No se ha cargado archivo": row.file)+'" type="button" class="btn btn-primary download_file">'
                     + ( row.file == null ? '<span class="glyphicon glyphicon-ban-circle" title="No se ha cargado archivo"></span>':'<span class="glyphicon glyphicon-download-alt"></span>')
                     + '</button>';
                     },
                     }
                     */

        ]
    });

}

function aceptar_terminos(token_actual) {
    //alert("modificando estado de la propuesta"+$("#idc").val());
    //Peticion para inactivar el evento
    $.ajax({
        type: 'GET',
        data: {"token": token_actual.token, "modulo": "Menu Participante", "idc": $("#idc").val()},
        url: url_pv + 'PropuestasJurados/postular'
    }).done(function (result) {

        switch (result) {
            case 'error':
                notify("danger", "ok", "Convocatorias:", "Se registro un error, comuníquese con la mesa de ayuda soporte.convocatorias@scrd.gov.co");
                break;
            case 'error_metodo':
                notify("danger", "ok", "Se registro un error en el método, comuníquese con la mesa de ayuda soporte.convocatorias@scrd.gov.co");
                break;
            case 'error_token':
                location.href = url_pv_admin + 'index.html?msg=Su sesión ha expirado, por favor vuelva a ingresar.&msg_tipo=danger';
                break;
            case 'acceso_denegado':
                notify("danger", "remove", "Usuario:", "No tiene permisos para editar información.");
                break;
            case 'error_documento_administrativo':
                notify("danger", "remove", "Usuario:", "Debe cargar los documentos administrativos para inscribir la hoja de vida");
                break;
            case 'error_modalidad':
                notify("danger", "remove", "Usuario:", "Debe seleccionar la categoria en la cuál participará para inscribir la hoja de vida");
                break;
            default:
                notify("success", "ok", "Usuario:", "Se realizó la inscripción con éxito.");
                setTimeout(function () {
                    location.href = url_pv_admin + 'pages/propuestasjurados/postulaciones.html?m=' + getURLParameter('m') + '&id=' + getURLParameter('id');
                }, 1800);

                cargar_datos_formulario(token_actual);
                break;
        }



    });



}

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
                    $("#modalidad_participa_jurado").html(json.propuesta_jurado.modalidad_participa);
                }
        }

    });
}



