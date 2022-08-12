$(document).ready(function(){

    if(Cookies.get('covers')==undefined){
        Cookies.set('covers', true, { expires: 365 });
        Cookies.set('format', 'mobi', { expires: 365 });
        Cookies.set('language', 'English', { expires: 365 });
    }
    
    console.log("COOKIEEE  " + Cookies.get('covers'));
    console.log("COOKIEEE  " + Cookies.get('format'));
    console.log("COOKIEEE  " + Cookies.get('language'));

    $('.fitbox').boxfit({multiline: true});

});	