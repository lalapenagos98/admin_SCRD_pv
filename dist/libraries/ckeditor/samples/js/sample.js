
$(document).ready(function () {
    if (CKEDITOR.env.ie && CKEDITOR.env.version < 9)
        CKEDITOR.tools.enableHtml5Elements(document);

    CKEDITOR.config.height = 150;
    CKEDITOR.config.width = 'auto';
    CKEDITOR.replace('editor');

});



