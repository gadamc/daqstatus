var dbname = window.location.pathname.split("/")[1];
var appName = window.location.pathname.split("/")[3];
var db = $.couch.db(dbname);


// ____________________________________________________________________________________
$(document).ready(function(){

   // Tabs
   $('.tabs').tabs();
   
   $('.tabs').bind('change', function (e) {
     setActivePane(e);  
     if(e.target.innerText != 'select run')        
       setSambaData(e.target.innerText); 
      
   });
   
   
   // Buttons
   $('.btn').button();
   
   $('#getRunButton').click( function(e) {
      getSelectData();
   }); 
     
   // Template - output
    $.get('templates/output_withrows.html', function(tmp) {               
       $.template("output_template", tmp);  

    });
   
   
   setSambaData('s1');
   
});

//-----------------------------
function setActivePane(e)
{
  if(e.target.innerText == 'select run'){
    $("#tab-samba-pane").toggleClass("active");
    $("#tab-selectrun-pane").toggleClass("active");
  }
  else if(e.relatedTarget.innerText == 'select run'){
     $("#tab-samba-pane").toggleClass("active");
     $("#tab-selectrun-pane").toggleClass("active");
   }
  
}

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
 
 
//---------------------------------
function fillDataContainer(containerName, doc)
{
  $(containerName).html( $.tmpl("output_template", sanitize( doc )));
  $('.autoheight').css("height", "auto")
  $('.divtocollapse').css("color", "blue")
  $('.iCanCollapse').hide();
  $(".divtocollapse").click(function(){
    $(this).next('.iCanCollapse').slideToggle(500);
  });
}
 
 
//_____________________________________________________________________________________
function setSambaData(sambaName)
{
   //$("#tab-samba-container").css("visibility", "hidden");
   //$("#tab-samba-container").animate({opacity:0.0}, 0);
   
   
   db.view(appName + "/samba",  {
     key:sambaName,
     reduce:false,
     limit:1,
     include_docs:true,
     descending:true,
     success:function(data){
       if ( data.rows.length > 0 ) {                     
         fillDataContainer("#tab-samba-container", data.rows[0]['doc']);
       }
       else{
         $("#tab-samba-container").html("<h5>no data available...</h5>");
       }
     },
     error: function(req, textStatus, errorThrown){alert('Error '+ textStatus);}
    
   });
}



//---------------------------------
function getSelectData()
{
  var runName = $('#selectRunInput').val();
  var fileNum = "";
  if ($('#selectFileInput').val() != "")
    fileNum = parseInt($('#selectFileInput').val());
  
  console.log("requesting" + [runName, fileNum]);
  if (fileNum === "") {
    
    db.view(appName + "/run", {
      endkey:[runName, 0],
      startkey:[runName, 9999999],
      descending:true,
      reduce:false,
      limit:1,
      include_docs:true,
      success:function(data){                     
         if ( data.rows.length > 0 ) {                     
            fillDataContainer("#selectrun-samba-container", data.rows[0]['doc']);
          }
          else{
            $("#selectrun-samba-container").html("<h5>no data available...</h5>");
          }
       },
       error: function(req, textStatus, errorThrown){alert('Error '+ textStatus);}
    });
    
  }
  else{
    db.view(appName + "/run", {
      key:[runName, fileNum],
      reduce:false,
      include_docs:true,
      success:function(data){                     
         if ( data.rows.length > 0 ) {                     
            fillDataContainer("#selectrun-samba-container", data.rows[0]['doc']);
          }
          else{
            $("#selectrun-samba-container").html("<h5>no data available...</h5>");
          }
       },
       error: function(req, textStatus, errorThrown){alert('Error '+ textStatus);}
    });
  }
}

/// ____________________________________________________________________________________
function enter_select(event) {    
 
   if (event.keyCode == 13) {  //keycode 13 is the enter key
             
      getSelectData();
      event.returnValue = false; // for IE
      if (event.preventDefault()) event.preventDefault(); 
   
   }

   return false;     
        
}