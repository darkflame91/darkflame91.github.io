$(document).ready(function(){
    crow = 0;
    ccol = 0;
    cwidth = 275;
    cheight = 400;
    // Half-assed responsiveness
    if($("html").width()<=600){
        cwidth = 150;
        cheight = 225;
    }
    
    function getSearchParams(k){
        var p={};
        location.search.replace(/[?&]+([^=&]+)=([^&]*)/gi,function(s,k,v){p[k]=v})
        return k?p[k]:p;
    }

    booksjson = {"output":[]};
    searchterm = "";
    format = "mobi";
    thisurl = window.location.href;
    searchterm = getSearchParams("searchterm");
    format = getSearchParams("format");
    
    corsproxy = ["https://corsproxy.io/?", //iffy
                "https://thingproxy.freeboard.io/fetch/", //Works well
                "https://api.allorigins.win/get?url=", //returns json. get 'contents'
                "https://api.codetabs.com/v1/proxy/?quest=" //Remove https:// and DON'T URL encode
                ]
    currentproxy = corsproxy[1];
    lgbase = "https://libgen.rs"

    function getcorsproxy(){
        currentproxy = corsproxy[2];
        console.log("Using CORS proxy: "+currentproxy);
        return currentproxy;
    }

    function getauthors(data) {
        authstring="";
        for(j=0;j<data.getElementsByTagName("a").length;j++){
           authstring += (" | "+data.getElementsByTagName("a")[j].text);
        }
        return authstring.substring(3);
    }

    function fetchjson(data) {
        outarr = [];
        lgbcount = 0;
        lgpcount = 0;
        var parsedres = $($.parseHTML('<div>'+data+'</div>'));
        if (parsedres.html().search("No files were found") >= 0){
            outarr.push(["","No books found! :(","",""]);
        }else{
            $(".cardcontents").html(parsedres.find(".catalog_paginator")[0].children[0].innerHTML.replace("&nbsp;",""));
            lgbcount = parseInt(parsedres.find(".catalog_paginator")[0].children[0].innerHTML.replace("&nbsp;","").split(" ")[0]);
            lgpcount = (lgbcount<26)?1:parseInt(parsedres.find(".page_selector")[0].innerHTML.split(" ")[3]);
            
            bookshtml=parsedres.find(".catalog")[0].getElementsByTagName("tr");
            for(i=1;i<bookshtml.length;i++){
                bookhtml=bookshtml[i];
                author = getauthors(bookhtml.getElementsByClassName("catalog_authors")[0]);
                title = bookhtml.getElementsByTagName("td")[2].getElementsByTagName("a")[0].text;
                size = bookhtml.getElementsByTagName("td")[4].textContent.substring(7);
                link = bookhtml.getElementsByTagName("td")[5].getElementsByTagName("a")[0].href;
                outarr.push([author,title,size,link]);
            }
        }
        return {"searchterm":searchterm,"bcount":lgbcount,"pcount":lgpcount,"output":outarr}
    }

    function pagerupdate(text){
        $("#pager").html(text)
    }

    function getdllink(link){
        if(link=="backtosearch") window.location.href = "/";
        $.get( getcorsproxy()+encodeURIComponent(link), function( data ) {
            data = (currentproxy==corsproxy[2])?data['contents']:data;
            var parsedres = $($.parseHTML('<div>'+data+'</div>'));
            dllink = parsedres.find("#download h2 a").attr("href");
            // dllink = parsedres.find("#download ul a")[1].href;
            console.log(dllink);
            window.location.href = dllink;
        });
    }

    function updatecoveranddllink(book){
        link = book.find(".booklink").text();
        if(link=="backtosearch") return;
        $.get( getcorsproxy()+encodeURIComponent(link), function( data ) {
            data = (currentproxy==corsproxy[2])?data['contents']:data;
            var parsedres = $($.parseHTML('<div>'+data+'</div>'));
            dllink = parsedres.find("#download h2 a").attr("href");
            // dllink = parsedres.find("#download ul a")[1].href;
            imgurl = parsedres.find("img").attr("src");



            // var img = document.createElement("img");
            // img.src = "http://library.lol/fictioncovers/842000/381c516d1b5d8a4bec819faeae69081a.jpg";
            // img.referrerPolicy = "no-referrer";
            // img.className = "bookimg"
            // var src = document.getElementByT   Id("header");
            // src.appendChild(img);



            if(imgurl != undefined) book.find(".bookcover")[0].innerHTML = '<img class="bookimg" src="http://library.lol'+imgurl+'" referrerpolicy=no-referrer />';
            // alert(book.find(".bookcover")[0].innerHTML.replace(/.{50}/g, '$&\n'));
            // alert($('.book').find('img').attr('referrerpolicy'));
            // if(imgurl != undefined) book.find(".bookcover")[0].innerHTML = '<img class="bookimg" />';
            // $('.book').find('img').attr('referrerpolicy',"no-referrer");
            // $('.book').find('img').attr('src',"http://library.lol/fictioncovers/842000/381c516d1b5d8a4bec819faeae69081a.jpg");
            // alert($('.book').find('img').attr('referrerpolicy'));

            // $(".footer .fitbox").html('<a href="http://library.lol/fictioncovers/842000/381c516d1b5d8a4bec819faeae69081a.jpg">THIS SHOULD GO TO THE IMAGE</a>')
            // pagerupdate(encodeURIComponent('<img class="bookimg" src="http://library.lol/fictioncovers/842000/381c516d1b5d8a4bec819faeae69081a.jpg"></img>'));
            book.find(".bookdllink").text() = dllink;
        
            // pagerupdate("LOL WINNER");
            // pagerupdate($(".book").find("img").attr("src"));
        });
    }

    function cardcountersakura(row) {
        element = $(".searchcontentouter");
        total = row?element.width():element.height();
        cdim = row?cwidth:cheight;
        return (Math.floor(total/(cdim+(total*0.02))));
    }

    crow = cardcountersakura(true);
    ccol = cardcountersakura(false);
    cardcount = crow*ccol;
    
    currentpage = 0;
    currentcardindex = 0;
    displaypagecurrent = 0;
    displaypagetotal = 0;


    function samebook(a1,a2){
        if(a1[0]==a2[0] && a1[1].toUpperCase().replace(/[^\w]/g, "")==a2[1].toUpperCase().replace(/[^\w]/g, ""))
            return true;
        return false;
    }
    
    //True if a1 > a2
    function biggerbook(a1,a2){
        s1=a1[2].split(" ")
        s2=a2[2].split(" ")
        
        if(s1[1]==s2[1]){
            if(parseFloat(s1[0])>parseFloat(s2[0])){
                return true;
            }
            return false;
        }else{
            if(s1[1]=="Mb"){
                return true;
            }
            return false;
        }
    }

    function deduper(startindex) {
        startindex=startindex?startindex:0;
        ogarray = booksjson["output"];
        temparray = [];
        for(i=0;i<ogarray.length;i++){
            addbook=true;
            if(i<startindex){
                temparray = temparray.concat([ogarray[i]]);
            }else{
                for(j=0;j<temparray.length;j++){
                    if(samebook(ogarray[i],temparray[j])){
                        if(biggerbook(ogarray[i],temparray[j])){
                            temparray[j]=ogarray[i];
                        }
                        addbook=false;
                    }
                }
                if(addbook){
                    temparray = temparray.concat([ogarray[i]]);
                }
            }
        }
        booksjson["output"]=temparray;
    }

    function getcardhtml(cdata){
        author = cdata[0];
        title = cdata[1];
        size = cdata[2];
        link = cdata[3];
        htmlstring = '<div class="book"><div class="bookdetails bookcover"><div class="fitbox">'+title+'</div></div><div class="bookdetails booktitle"><div class="fitbox"><p class="cardtext">'+((title.indexOf("<img ")==-1)?title:"")+'</p></div></div><div class="bookdetails bookauthor"><div class="fitbox"><p class="cardtext">'+author+'</p></div></div><div class="bookdetails booksize"><div class="fitbox"><p class="cardtext">'+size+'</p></div></div><div class="booklink" style="display: none;">'+link+'</div><div class="bookdllink" style="display: none;">blank</div></div>'
        return htmlstring;
    }

    function updatebooksjson(newjson) {
        if($.isEmptyObject(booksjson["output"])){
            booksjson = newjson;
        }
        else{
            booksjson["output"] = booksjson["output"].concat(newjson["output"]);
        }
        if(currentpage >= booksjson["pcount"]){
            booksjson["output"] = booksjson["output"].concat([["Back to Search","<img src=\"/static/img/tafs.jpg\" style=\"max-width:90%;max-height:90%;width:90%;display:block;margin:auto;\"></img>","","backtosearch"]]);
        }
    }

    function writecdata(cardindex){
        for(i=0;i<$(".cardcontents").length;i++){
            cdata = (cardindex<booksjson["output"].length)?booksjson["output"][cardindex]:["","","",""];
            $(".cardcontents")[i].innerHTML = getcardhtml(cdata);
            cardindex += 1;
        }

        $('.fitbox').boxfit({multiline: true});

        displaypagecurrent = Math.ceil((cardindex-1)/cardcount);
        displaypagetotal = Math.ceil(((booksjson["output"][booksjson["output"].length-1][0]=="Back to Search")?booksjson["output"].length:booksjson["bcount"])/cardcount);
        pagerupdate("Page "+displaypagecurrent+" of "+displaypagetotal);
        if(displaypagecurrent<=1){
            $("#prevarrow").css("opacity","0.2");
        }else{
            $("#prevarrow").css("opacity","1.0");
        }
        if(displaypagecurrent >= displaypagetotal){
            $("#nextarrow").css("opacity","0.2");
        }else{
            $("#nextarrow").css("opacity","1.0");
        }

        $(".book").click(function(){
            if($(this).find(".bookdllink").text()=="blank"){
                getdllink($(this).find(".booklink").text());
            }else{
                window.location.href = $(this).find(".bookdllink").text();
            }
        });

        $(".book").each(function(i){
            // if(i==0)
            updatecoveranddllink($(this));
        });
    }

    function updatecards(cardindex) {
        pagerupdate("Loading...")
        cardindex = cardindex?cardindex:0;
        currentcardindex = cardindex;
        if(booksjson["output"].length-cardindex < cardcount && (!booksjson["pcount"] || currentpage < booksjson["pcount"])){
            currentpage += 1;
            lgurl = "/fiction/?language=English&format=" + format + "&page=" + currentpage + "&q="
            $.get( getcorsproxy()+encodeURIComponent(lgbase+lgurl+searchterm), function( data ) {
                data = (currentproxy==corsproxy[2])?data['contents']:data;
                updatebooksjson(fetchjson(data));
                deduper(cardindex);
                writecdata(cardindex);
            });
                
        }else{
            writecdata(cardindex);
        }
    }

    searchcontentstring = "";
    for(i=0;i<(crow*ccol);i++) {
        cardstring = "<div style=\"width:"+cwidth+"px;height:"+cheight+"px;max-width:"+cwidth+"px;max-height:"+cheight+"px;outline-style:auto;margin:2% 1%;float:left;\"><div class=\"cardcontents\" style=\"width:100%;height:100%;\">"+i+"</div></div>";
        searchcontentstring = searchcontentstring.concat(cardstring);
    }

    $(".searchcontentouter").html(searchcontentstring);
    $(".searchcontentouter").css("width",crow*(cwidth+$(".searchcontentouter").width()*0.02)+"px")
    updatecards();


    $("#prevarrow").click(function(){
        if(displaypagecurrent>1){
            // pagerupdate("Loading...");
            updatecards(currentcardindex-cardcount);
        }
    });
    $("#nextarrow").click(function(){
        if(displaypagecurrent < displaypagetotal){
            // pagerupdate("Loading...");
            updatecards(currentcardindex+cardcount);
        }
    });

});	