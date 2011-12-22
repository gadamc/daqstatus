var dbname = window.location.pathname.split("/")[1];
var appName = window.location.pathname.split("/")[3];
var db = $.couch.db(dbname);


// ____________________________________________________________________________________
$(document).ready(function(){

   // Tabs
   $('.tabs').tabs();
   
   $('.tabs').bind('change', function (e) {
     if(e.target.innerText == 'select run')
      renderChoiceForm();
     else
      setSambaData(e.target.innerText);
   });
   
   // Template - output
    $.get('templates/output_withrows.html', function(tmp) {               
       $.template("output_template", tmp);  

    });
   $("#tab-samba-container").animate({opacity:0.0}, 0);
   setSambaData('s1');
   
});

//-----------------------------
function sanitize(obj){  //should I put this functionality into a show function on the server-side. it may be to have this option available elsewhere
   if(obj == null || typeof(obj) != 'object')
     return obj;

   var temp = obj.constructor(); 
   
   var patt = new RegExp('[.-]','g');;
   for(var key in obj) 
     temp[key.replace(patt,'_')] = sanitize(obj[key]);
   return temp;
 }
 
//_____________________________________________________________________________________
function setSambaData(sambaName)
{
   //$("#tab-samba-container").css("visibility", "hidden");
   $("#tab-samba-container").animate({opacity:0.0}, 0);
   db.view(appName + "/samba",  {
                 key:sambaName,
                 reduce:false,
                 limit:1,
                 include_docs:true,
                 descending:true,
                 success:function(data){ 
                     if ( data.rows.length > 0 ) {                       
                       $("#tab-samba-container").html( $.tmpl("output_template", sanitize( data.rows[0]['doc'] )));
                       $('.autoheight').css("height", "auto")
                       $('.divtocollapse').css("color", "blue")
                       $('.iCanCollapse').hide();
                       $(".divtocollapse").click(function()
                         {
                           $(this).next('.iCanCollapse').slideToggle(500);
                         });
                     }
                     else{
                       $("#tab-samba-container").html("<h5>no data available...</h5>")
                     }
                     $("#tab-samba-container").animate({opacity:1.0}, 0);
                  },
                  error: function(req, textStatus, errorThrown){alert('Error '+ textStatus);}
          });
}

//---------------------------------
function renderChoiceForm()
{
}