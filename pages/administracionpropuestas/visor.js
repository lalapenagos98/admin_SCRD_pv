$(document).ready(function () {

    //Verifico si el token exite en el cliente y verifico que el token este activo en el servidor                
    var token_actual = getLocalStorage(name_local_storage);

    //Verifico si el token esta vacio, para enviarlo a que ingrese de nuevo
    if ($.isEmptyObject(token_actual)) {
        location.href = url_pv_admin + 'index.html?msg=Su sesión ha expirado, por favor vuelva a ingresar.&msg_tipo=danger';
    } else
    {

        $("#id").attr('value', getURLParameter('id'));

        $("#ext").attr('value', getURLParameter('ext'));
        
        $("#name").attr('value', getURLParameter('name'));

        $.ajax({
            type: 'POST',
            url: url_pv + 'PropuestasDocumentacion/visor/',
            data: {"cod": $("#id").val(), "token": token_actual.token, "modulo": "Verificación de propuestas"},
        }).done(function (result) {
            var b64 = "";
            if ($("#ext").val() == "pdf")
            {                
                b64 = "data:application/pdf;base64," + result;
                $("#visor_pdf").css("display", "block");
                PDFObject.embed(b64, "#visor_pdf");
            }

            if ($("#ext").val() == "jpg" || $("#ext").val() == "gif", $("#ext").val() == "png")
            {
                b64 = "data:image/" + $("#ext").val() + ";base64," + result;
                $("#visor_img").css("display", "block");
                $("#visor_img").attr("src", b64);
                $("#visor_img").attr("title", $("#name").val());
                $("#visor_img").attr("alt", $("#name").val());
            }
        });
        
        $("#link_descargar").click(function () {
            //Verifico si el token exite en el cliente y verifico que el token este activo en el servidor                
            var token_actual = getLocalStorage(name_local_storage);

            //Verifico si el token esta vacio, para enviarlo a que ingrese de nuevo
            if ($.isEmptyObject(token_actual)) {
                location.href = url_pv_admin + 'index.html?msg=Su sesión ha expirado, por favor vuelva a ingresar.&msg_tipo=danger';
            } else
            {
                $.AjaxDownloader({
                    url: url_pv + 'PropuestasDocumentacion/download_file/',
                    data: {
                        cod: $("#id").val(),
                        token: token_actual.token,
                        modulo: "Verificación de propuestas"
                    }
                });
            }
        });
        
    }

});