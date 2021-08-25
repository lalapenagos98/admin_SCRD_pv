//Definimos las variables del sitio
var url_pv = "http://localhost/crud_SCRD_pv/api/";
var url_pv_admin = "http://localhost/admin_SCRD_pv/";
var url_pv_site = "http://localhost/site_SCRD_pv/";
var url_pv_report = "http://localhost/report_SCRD_pv/";
var name_local_storage = "token_pv";
var name_local_storage_keycloak = "token_keycloak";

//Conexión al keycloak
var keycloak = Keycloak({
    url: 'https://qa-sso.scrd.gov.co/auth',
    realm: 'SCRD',
    clientId: 'sicon-ui'
});

//Configuración de respuesta del keycloak
var initOptions = {
    responseMode: 'fragment',
    flow: 'standard',
    redirectUri: window.location
};


//funcion para extaer un parametro de la url
function getURLParameter(sParam)
{
    var sPageURL = window.location.search.substring(1);
    var sURLVariables = sPageURL.split('&');
    for (var i = 0; i < sURLVariables.length; i++)
    {
        var sParameterName = sURLVariables[i].split('=');
        if (sParameterName[0] == sParam)
        {
            return sParameterName[1];
        }
    }
}

//Crear los parametros dinamicos
function crearParametro(id, label, valores, tipo, obligatorio, estado_propuesta)
{
    var span_obligatorio='';
    if(obligatorio==true)
    {
        span_obligatorio='<span class="icono_requerido">*</span>';
    }
    
    var disabled= 'disabled="disabled"';
    if(estado_propuesta == 7)
    {
        disabled = '';
    }
        
    var parametro;
    switch (tipo) {
        case 'Texto':
            parametro='<div class="col-lg-6">';
            parametro+='<div class="form-group">';            
            if(valores!=='')
            {                
                parametro+='<label>'+label+' '+span_obligatorio+'</label>&nbsp;&nbsp;<button type="button" class="btn btn-primary btn-circle" data-toggle="tooltip" data-placement="top" title="'+valores+'"><i class="fa fa-question"></i></button>';                
            }
            else
            {
                parametro+='<label>'+label+' '+span_obligatorio+'</label>';                
            }            
            parametro+='<input id="parametro_'+id+'" name="parametro['+id+']" type="text" class="form-control" value="" '+disabled+'>';
            parametro+='</div>';
            parametro+='</div>';
            return(parametro);
            break;
        case 'Parrafo':
            parametro='<div class="col-lg-6">';
            parametro+='<div class="form-group">';            
            if(valores!=='')
            {                                
                parametro+='<label>'+label+' '+span_obligatorio+'</label>&nbsp;&nbsp;<button type="button" class="btn btn-primary btn-circle" data-toggle="tooltip" data-placement="top" title="'+valores+'"><i class="fa fa-question"></i></button>';
            }
            else
            {
                parametro+='<label>'+label+' '+span_obligatorio+'</label>';
            }
            parametro+='<textarea id="parametro_'+id+'" name="parametro['+id+']" class="form-control textarea_html" rows="3" '+disabled+'></textarea>';            
            parametro+='</div>';
            parametro+='</div>';
            return(parametro);
            break;
        case 'Lista desplegable':
            parametro='<div class="col-lg-6">';
            parametro+='<div class="form-group">';
            parametro+='<label>'+label+' '+span_obligatorio+'</label>';
            parametro+='<select id="parametro_'+id+'" name="parametro['+id+']" class="form-control" '+disabled+'>';
            var array = valores.split(",");
            parametro+='<option value="">:: Seleccionar ::</option>';            
            for (var i in array) {
                if (array.hasOwnProperty(i)) {                                        
                    parametro+='<option value="'+array[i]+'">'+array[i]+'</option>';            
                }
            }            
            parametro+='</select>';
            parametro+='</div>';
            parametro+='</div>';
            return(parametro);
            break;
        case 'Fecha':
            parametro='<div class="col-lg-6">';
            parametro+='<div class="form-group">';
            parametro+='<label>'+label+' '+span_obligatorio+'</label>';
            parametro+='<div title="'+id+'" class="input-group date calendario" data-date="" data-date-format="yyyy-mm-dd" data-link-format="yyyy-mm-dd">';            
            parametro+='<input id="parametro_'+id+'" name="parametro['+id+']" class="form-control" size="16" type="text" value="" readonly '+disabled+'>';
            parametro+='<span class="input-group-addon"><span class="glyphicon glyphicon-calendar"></span></span>';                    
            parametro+='</div>';                                            
            parametro+='</div>';
            parametro+='</div>';
            return(parametro);
        case 'Título':
            parametro='<div class="col-lg-12">';
            parametro+='<div class="form-group">';
            parametro+='<h1>'+label+'</h1>';            
            parametro+='</div>';
            parametro+='</div>';
            return(parametro);
        case 'Mensaje':
            parametro='<div class="col-lg-12">';
            parametro+='<div class="form-group">';
            parametro+='<p>'+label+'</p>';            
            parametro+='</div>';
            parametro+='</div>';
            return(parametro);
        case 'Salto de línea':
            parametro='<div class="col-lg-12">';
            parametro+='<div class="form-group">';
            parametro+='<br/><br/>';            
            parametro+='</div>';
            parametro+='</div>';
            return(parametro);        
    }
}

function form_edit(id)
{
    location.href = "form.html?id=" + id;
}

function form_edit_page(page, id)
{
    var url = "";
    var name = "";
    if (page == 1)
    {
        url = "update";
        name = "_self";

    }
    if (page == 2)
    {
        url = url_pv_site + "publicar";
        name = "_blank";
    }
    window.open(url + ".html?id=" + id, name);
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

//Funcion para validar si el navegador soporta localStorage
function issetLocalStorage() {
    if (typeof (Storage) !== "undefined")
    {
        return true
    } else
    {
        location.href = 'index.html?msg=Debe actualizar su navegador.&msg_tipo=danger';
        return false;
    }
}

//Funcion para retornar el valor de la variable
function getLocalStorage(nombre)
{
    return JSON.parse(localStorage.getItem(nombre));
}

//Funcion para agregar el valor a una variable
function setLocalStorage(nombre, valor)
{
    localStorage.setItem(nombre, valor);
    return localStorage.getItem(nombre);
}

//Funcion para eliminar la variable
function removeLocalStorage(nombre)
{
    localStorage.removeItem(nombre);
}

//Funcion para lavidar permiso de lectura
function permiso_lectura(token_actual, modulo)
{
    $.ajax({
        type: 'POST',
        data: {"token": token_actual.token, modulo: modulo},
        url: url_pv + 'Session/permiso_lectura/'
    }).done(function (data) {
        if (data == 'error_metodo')
        {
            location.href = '../index/index.html?msg=Se registro un error en el método, comuníquese con la mesa de ayuda convocatorias@scrd.gov.co&msg_tipo=danger';
        } else
        {
            if (data == 'error')
            {
                location.href = '../index/index.html?msg=Se registro un error en la consulta, comuníquese con la mesa de ayuda convocatorias@scrd.gov.co&msg_tipo=danger';
            } else
            {
                if (data == 'acceso_denegado')
                {
                    location.href = '../index/index.html?msg=Acceso denegado.&msg_tipo=danger';
                }
            }
        }
    });
}

//Funcion para lavidar permiso de lectura
function permiso_lectura_keycloak(token_actual, modulo)
{
    $.ajax({
        type: 'POST',
        data: {"token": token_actual, modulo: modulo},
        url: url_pv + 'Session/permiso_lectura_keycloak/'
    }).done(function (data) {
        if (data == 'error_metodo')
        {
            location.href = '../index/index.html?msg=Se registro un error en el método, comuníquese con la mesa de ayuda convocatorias@scrd.gov.co&msg_tipo=danger';
        } else
        {
            if (data == 'error_token')
            {
                location.href = '../index/index.html?msg=Su sesión ha expirado, por favor vuelva a ingresar.&msg_tipo=danger';
            } else
            {
                if (data == 'acceso_denegado')
                {
                    location.href = '../index/index.html?msg=Acceso denegado.&msg_tipo=danger';
                }
            }
        }        
    });
}

//Logaut
function logout()
{
    //Verifico si el token exite en el cliente y verifico que el token este activo en el servidor
    //Si el token no esta activo o se presenta un error se elimina la variable del session storage
    var token_actual = getLocalStorage(name_local_storage);

    $.ajax({
        type: 'POST',
        data: {"token": token_actual.token},
        url: url_pv + 'Session/cerrar_session/'
    }).done(function (data) {
        if (data == 'error_metodo')
        {
            location.href = '../index/index.html?msg=Se registro un error en el método, comuníquese con la mesa de ayuda convocatorias@scrd.gov.co&msg_tipo=danger';
        } else
        {
            if (data == 'error')
            {
                location.href = '../index/index.html?msg=Se registro un error en la consulta, comuníquese con la mesa de ayuda convocatorias@scrd.gov.co&msg_tipo=danger';
            } else
            {
                if (data == 'ok')
                {
                    removeLocalStorage(name_local_storage)
                    location.href = '../../index.html?msg=Cerró su sesión con éxito.&msg_tipo=success';
                }
            }
        }
    });
}

//Iniciamos el documento
$(document).ready(function () {
    //Verifico que no tenga ningun mensaje y el tipo
    var msg = getURLParameter('msg');
    var msg_tipo = getURLParameter('msg_tipo');
    if (typeof msg !== 'undefined' && typeof msg_tipo !== 'undefined')
    {
        notify(msg_tipo, "ok", "Mensaje:", decodeURI(msg));
    }

    //Asignamos el valor a input id
    $("#id").attr('value', getURLParameter('id'));

    //crear tooltip 
    $('[data-toggle="tooltip"]').tooltip();
    $('.btn_tooltip').tooltip();

    //Array del consumo con el back
    keycloak.init(initOptions).then(function (authenticated) {
        //Si no esta autenticado lo obliga a ingresar al keycloak
        if (authenticated === false)
        {
            keycloak.login();
        } else
        {            
            //Guardamos el token en el local storage
            setLocalStorage(name_local_storage_keycloak,keycloak.token);
            
            //Cargamos el menu principal
            $.ajax({
                type: 'POST',
                data: {"token": keycloak.token, "id": getURLParameter('id'), "m": getURLParameter('m'), "p": getURLParameter('p'), "sub": getURLParameter('sub')},
                url: url_pv + 'Administrador/menu'
            }).done(function (result) {
                if (result == 'error_token')
                {
                    location.href = url_pv_admin + 'index.html?msg=Su sesión ha expirado, por favor vuelva a ingresar.&msg_tipo=danger';
                } else
                {
                    $("#menu_principal").html(result);
                }
            });                    
        }
    }).catch(function () {
        location.href = url_pv_admin + 'error_keycloak.html';
    });
    
    $('.calendario').datetimepicker({
        language: 'es',
        weekStart: 1,
        todayBtn: 1,
        autoclose: 1,
        todayHighlight: 1,
        startView: 2,
        minView: 2,
        forceParse: 0
    });
});

//Al crear cualquier peticion de ajax muestra el modal
$(document).ajaxStart(function () {
    //Cuando se utiliza modal
    $('#my_loader').modal();
    //Cuando se utiliza divs
    $('.loading').show();
});
//Al completar cualquier peticion de ajax oculta el modal
$(document).ajaxComplete(function () {
    //Cuando se utiliza modal
    $("#my_loader").modal('hide');
    //Cuando se utiliza divs    
    $('.loading').hide();
});
