//Array del consumo con el back
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
            permiso_lectura_keycloak(token_actual.token, "SICON-ADMINISTRACION-ENCUESTAS");
            //Cargamos el menu principal
            $.ajax({
                type: 'POST',
                data: {"token": token_actual.token, "id": getURLParameter('id'), "m": getURLParameter('m'), "p": getURLParameter('p'), "sub": getURLParameter('sub')},
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
            //Cargar datos en la tabla actual
            $('#table_list').DataTable({
                "language": {
                    "url": "../../dist/libraries/datatables/js/spanish.json"
                },
                "processing": true,
                "serverSide": true,
                "lengthMenu": [5, 10, 20],
                "ajax": {
                    url: url_pv + "Encuestas/all",
                    data: {"token": token_actual.token},
                    type: "POST"
                },
                "drawCallback": function (settings) {
                    $(".check_activar_t").attr("checked", "true");
                    $(".check_activar_f").removeAttr("checked");
                    acciones_convocatoria(token_actual);
                },
                "columns": [
                    {"data": "tipo"},
                    {"data": "programa"},
                    {"data": "anio"},
                    {"data": "nombre"},
                    {"data": "activar_registro"},
                    {"data": "acciones"}
                ]
            });
        }
    }
});
function acciones_convocatoria(token_actual)
{
    //Permite activar o eliminar una categoria
    $(".activar_categoria").click(function () {

        var active = "false";
        if ($(this).prop('checked')) {
            active = "true";
        }


        $.ajax({
            type: 'DELETE',
            data: {"token": token_actual.token, "modulo": "SICON-ADMINISTRACION-ENCUESTAS", "active": active},
            url: url_pv + 'Encuestas/delete/' + $(this).attr("title")
        }).done(function (data) {
            if (data == 'ok')
            {
                if (active == "true")
                {
                    notify("info", "ok", "Encuestas:", "Se activó la convocatoria con éxito.");
                } else
                {
                    notify("info", "ok", "Encuestas:", "Se inactivó la convocatoria con éxito.");
                }
            } else
            {
                if (data == 'acceso_denegado')
                {
                    notify("danger", "remove", "Encuestas:", "Acceso denegado.");
                } else
                {
                    notify("danger", "ok", "Encuestas:", "Se registro un error en el método, comuníquese con la mesa de ayuda convocatorias@scrd.gov.co");
                }
            }
        });
    });
}

function form_edit_param(id) {
    document.location.href = 'params.html?id=' + id;
}