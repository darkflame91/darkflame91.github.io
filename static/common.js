$(document).ready(function(){

    if(Cookies.get('covers')==undefined){
        Cookies.set('covers', true, { expires: 3650 });
        Cookies.set('format', 'mobi', { expires: 3650 });
        Cookies.set('language', 'English', { expires: 3650 });
    }

    $('.fitbox').boxfit({multiline: true});

});	