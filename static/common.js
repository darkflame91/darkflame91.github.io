$(document).ready(function(){

    if(Cookies.get('version')==undefined || parseInt(Cookies.get('version')) < 20220929){
        Cookies.set('covers', true, { expires: 3650 });
        Cookies.set('format', 'mobi', { expires: 3650 });
        Cookies.set('language', 'English', { expires: 3650 });
        Cookies.set('ficsci', 'fic', { expires: 3650 });
        Cookies.set('version',"20220929", { expires: 3650 });
    }
    if(Cookies.get('covers')==undefined){
        Cookies.set('covers', true, { expires: 3650 });
    }
    if(Cookies.get('format')==undefined){
        Cookies.set('format', 'mobi', { expires: 3650 });
    }
    if(Cookies.get('language')==undefined){
        Cookies.set('language', 'English', { expires: 3650 });
    }
    if(Cookies.get('ficsci')==undefined){
        Cookies.set('ficsci', 'fic', { expires: 3650 });
    }

    $('.fitbox').boxfit({multiline: true});

});	