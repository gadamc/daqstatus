var dbhost = window.location.host;
var dbname = window.location.pathname.split("/")[1];
var appName = window.location.pathname.split("/")[3];
var db = $.couch.db(dbname);


var currentRunName = "";
var currentFileNumber = 0;
var currentSamba = "";

var savedData = {};
var sambaList = ['s1', 's2', 's3', 's4', 's5', 's6', 's7', 's8'];

// ____________________________________________________________________________________
$(document).ready(function(){


  //fill in the nav bar at the top of the page
  //using info in the webinterface database
  $.couch.db("webinterface").openDoc("navbar", {
    success: function(data) {
      var items = [];

      for (var link in data['list']){
        items.push('<li ><a href="' + link + '">' + data['list'][link] + '</a></li>');
      }
      $('#navbarList').append( items.join('') );

    }
  });
  
   // Tabs
   //$('.tabs').tabs();
   
   $('.nav-tabs').on('show', function (e) {
     setActivePane(e);  
     if(e.target.innerHTML != 'select run')        
       getSambaData(e.target.innerHTML); 
   });
   
   
   // Buttons
   $('.btn').button();
   
   $('#getRunButton').click( function(e) {
      getSelectData();
   });
   
   $('#getLatestButton').click( function(e) {
       getSambaData(currentSamba);
    });
    
    
   $('#getPreviousFileButton').click( function(e) {
     if( $('#getPreviousFileButton').hasClass('disabled') == false)
      getPreviousSambaData();
   });
    
   $('#getNextFileButton').click( function(e) {
     if( $('#getNextFileButton').hasClass('disabled') == false)
        getNextSambaData();
   }); 
   
    $('#getPreviousRunButton').click( function(e) {
      if( $('#getPreviousRunButton').hasClass('disabled') == false)
       getPreviousSambaRunData();
    });

    $('#getNextRunButton').click( function(e) {
      if( $('#getNextRunButton').hasClass('disabled') == false)
         getNextSambaRunData();
    });
    
    $('#refreshOverviewButton').click( function(e) {
      refreshOverview();
    });
     
   // Template - output
    $.get('templates/output_withrows.html', function(tmp) {               
       $.template("output_template", tmp);  
    });
    
   
   //make table sortable and then fill it
   $("#overview_table").tablesorter( );
   //fillOverviewTable();
   refreshOverview();
   
   //just run all of these to fill in the savedData on the initial load up!. 
   for (var i in sambaList)
    getSambaData(sambaList[i]);
  

  //make tables sortable and then fill it
   $(".tablesorter").tablesorter( );

   fillBoloSettings();
   
});

//-----------------------------
function setActivePane(e)
{
  
  if(e.target.innerHTML == 'select run'){
    
    if($("#tab-samba-container").hasClass("active"))
      $("#tab-samba-container").removeClass("active");
      
    if($("#tab-overview-container").hasClass("active"))
      $("#tab-overview-container").removeClass("active");
        
    if($("#tab-selectrun-container").hasClass("active") == false)
      $("#tab-selectrun-container").addClass("active");
    
  }
  else if(e.target.innerHTML == 'overview'){
    
     if($("#tab-samba-container").hasClass("active"))
       $("#tab-samba-container").removeClass("active");

     if($("#tab-selectrun-container").hasClass("active"))
       $("#tab-selectrun-container").removeClass("active");

     if($("#tab-overview-container").hasClass("active") == false)
       $("#tab-overview-container").addClass("active");
   }
  else{
    
    if($("#tab-overview-container").hasClass("active"))
       $("#tab-overview-container").removeClass("active");

    if($("#tab-selectrun-container").hasClass("active"))
       $("#tab-selectrun-container").removeClass("active");

    if($("#tab-samba-container").hasClass("active") == false)
       $("#tab-samba-container").addClass("active");
       
  }
  
}

//-----------------------------
function sanitize(obj){  //should I put this functionality into a show function on the server-side. it may be nice to have this option available elsewhere
   if(obj == null || typeof(obj) != 'object')
     return obj;

   var temp = obj.constructor(); 
   
   var patt = new RegExp('[.-]','g');
   for(var key in obj) 
     temp[key.replace(patt,'_')] = sanitize(obj[key]);
   return temp;
 }
 
 
//---------------------------------
function fillDataContainer(containerName, doc)
{
  doc = sanitize( doc );
  doc['dbhost'] = dbhost;
  doc['file_number'] = zeroPad(doc['file_number'],3)
  
  $(containerName).html( $.tmpl("output_template",  doc ));
  currentRunName = doc['run_name'];
  currentFileNumber = doc['file_number'];
   
  $('.autoheight').css("height", "auto")
  $('.divtocollapse').css("color", "blue")
  $('.iCanCollapse').hide();
  $(".divtocollapse").click(function(){
    $(this).next('.iCanCollapse').slideToggle(500);
  });
}
 
 
//_____________________________________________________________________________________
function getSambaData(sambaName)
{
   
   currentSamba = sambaName;
   if(savedData[sambaName])
    fillDataContainer("#tab-samba-datacontainer", savedData[sambaName]);
   
   db.view(appName + "/samba",  {
     endkey:[sambaName,"", 0],
     startkey:[sambaName,"zz99z999",999999],
     reduce:false,
     limit:2,
     include_docs:true,
     descending:true,
     success:function(data){
       if ( data.rows.length > 0 ) {                     
         fillDataContainer("#tab-samba-datacontainer", data.rows[0]['doc']);
         savedData[sambaName] = data.rows[0]['doc'];
         
         if (data.rows.length > 1){
           if( $('#getPreviousFileButton').hasClass('disabled') == true)
               $('#getPreviousFileButton').removeClass('disabled');
         }
         else {
           if( $('#getPreviousFileButton').hasClass('disabled') == false)
                $('#getPreviousFileButton').addClass('disabled');
         }
         
            
         if( $('#getNextFileButton').hasClass('disabled') == false)
            $('#getNextFileButton').addClass('disabled');
        
          
         if( $('#getNextRunButton').hasClass('disabled') == false)
            $('#getNextRunButton').addClass('disabled');
       }
       else{
         $("#tab-samba-datacontainer").html("<h5>no data available...</h5>");
         
         if( $('#getPreviousFileButton').hasClass('disabled') == false)
            $('#getPreviousFileButton').addClass('disabled');
            
         if( $('#getNextFileButton').hasClass('disabled') == false)
            $('#getNextFileButton').addClass('disabled');
       }
     }
    
   });
}


//_____________________________________________________________________________________
function getPreviousSambaData()
{
  
  
   db.view(appName + "/samba",  {
     endkey:[currentSamba,"", 0],
     startkey:[currentSamba,currentRunName,currentFileNumber],
     reduce:false,
     limit:3,
     include_docs:true,
     descending:true,
     success:function(data){
       if ( data.rows.length > 1 ) {                     
         fillDataContainer("#tab-samba-datacontainer", data.rows[1]['doc']);

         if (data.rows.length > 2){
            if( $('#getPreviousFileButton').hasClass('disabled') == true)
                $('#getPreviousFileButton').removeClass('disabled');
         }
         else {
            if( $('#getPreviousFileButton').hasClass('disabled') == false)
                 $('#getPreviousFileButton').addClass('disabled');
         }
          
         if( $('#getNextFileButton').hasClass('disabled') == true)
            $('#getNextFileButton').removeClass('disabled');
       }
       else{
          if( $('#getPreviousFileButton').hasClass('disabled') == false)
            $('#getPreviousFileButton').addClass('disabled');
       }
     }
    
   });
}

//_____________________________________________________________________________________
function getNextSambaData()
{
  
   //console.log('get next from ' + currentSamba + ' ' + currentRunName + ' ' + currentFileNumber);
   
   db.view(appName + "/samba",  {
     endkey:[currentSamba,"zz99z999",999999],
     startkey:[currentSamba,currentRunName,currentFileNumber],
     reduce:false,
     limit:3,
     include_docs:true,
     success:function(data){
       if ( data.rows.length > 1 ) {                     
         fillDataContainer("#tab-samba-datacontainer", data.rows[1]['doc']);
         
         if (data.rows.length > 2){
           if( $('#getNextFileButton').hasClass('disabled') == true)
               $('#getNextFileButton').removeClass('disabled');
         }
         else {
           if( $('#getNextFileButton').hasClass('disabled') == false)
                $('#getNextFileButton').addClass('disabled');
         }
         
         if( $('#getPreviousFileButton').hasClass('disabled') == true)
           $('#getPreviousFileButton').removeClass('disabled');
       }
       else{
          if( $('#getNextFileButton').hasClass('disabled') == false)
            $('#getNextFileButton').addClass('disabled');
          
       }
     }
    
   });
}

//_____________________________________________________________________________________
function getPreviousSambaRunData()
{
  
  //console.log('get previous from ' + currentSamba + ' ' + currentRunName + ' ' + currentFileNumber);
     
   db.view(appName + "/samba",  {
     endkey:[currentSamba,"", 0],
     startkey:[currentSamba,currentRunName,0],
     reduce:false,
     limit:3,
     include_docs:true,
     descending:true,
     success:function(data){
       if ( data.rows.length > 1 ) {                     
         fillDataContainer("#tab-samba-datacontainer", data.rows[1]['doc']);
         
         if (data.rows.length > 2){
            if( $('#getPreviousRunButton').hasClass('disabled') == true)
                $('#getPreviousRunButton').removeClass('disabled');
         }
         else {
            if( $('#getPreviousRunButton').hasClass('disabled') == false)
                 $('#getPreviousRunButton').addClass('disabled');
         }
          
         if( $('#getNextRunButton').hasClass('disabled') == true)
            $('#getNextRunButton').removeClass('disabled');
        
         if( $('#getNextFileButton').hasClass('disabled') == true)
            $('#getNextFileButton').removeClass('disabled');
       }
       else{
          if( $('#getPreviousRunButton').hasClass('disabled') == false)
            $('#getPreviousRunButton').addClass('disabled');
        
          if( $('#getPreviousFileButton').hasClass('disabled') == false)
            $('#getPreviousFileButton').addClass('disabled');
       }
     }
    
   });
}

//_____________________________________________________________________________________
function getNextSambaRunData()
{
  
   //console.log('get next from ' + currentSamba + ' ' + currentRunName + ' ' + currentFileNumber);
   
   db.view(appName + "/samba",  {
     endkey:[currentSamba,"zz99z999",999999],
     startkey:[currentSamba,currentRunName,9999999],
     reduce:false,
     limit:3,
     include_docs:true,
     success:function(data){
       if ( data.rows.length > 1 ) {                     
         fillDataContainer("#tab-samba-datacontainer", data.rows[1]['doc']);
         
         if (data.rows.length > 2){
           if( $('#getNextRunButton').hasClass('disabled') == true)
               $('#getNextRunButton').removeClass('disabled');
         }
         else {
           if( $('#getNextRunButton').hasClass('disabled') == false)
                $('#getNextRunButton').addClass('disabled');
         }
         
         if( $('#getPreviousRunButton').hasClass('disabled') == true)
           $('#getPreviousRunButton').removeClass('disabled');
       }
       else{
          if( $('#getNextRunButton').hasClass('disabled') == false)
            $('#getNextRunButton').addClass('disabled');
            
          if( $('#getNextFileButton').hasClass('disabled') == false)
            $('#getNextFileButton').addClass('disabled');
          
       }
     }
    
   });
}

//---------------------------------
function getSelectData()
{
  var runName = $('#selectRunInput').val();
  var fileNum = "";
  if ($('#selectFileInput').val() != "")
    fileNum = parseInt($('#selectFileInput').val());
  
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
            fillDataContainer("#selectrun-samba-datacontainer", data.rows[0]['doc']);
            
          }
          else{
            $("#selectrun-samba-container").html("<h5>no data available...</h5>");
          }
       }
    });
    
  }
  else{
    db.view(appName + "/run", {
      key:[runName, fileNum],
      reduce:false,
      include_docs:true,
      success:function(data){                     
         if ( data.rows.length > 0 ) {                     
            fillDataContainer("#selectrun-samba-datacontainer", data.rows[0]['doc']);
          
          }
          else{
            $("#selectrun-samba-container").html("<h5>no data available...</h5>");
          }
       }
    });
  }
}

//----------------------------------------------------
function fillOverviewTable()
{
  
  for (var i in sambaList){
    db.view(appName + "/sambaoverview",  {
       key:sambaList[i],
       reduce:false,
       limit:1,
       include_docs:true,
       descending:true,
       async:false,
       success:function(data){
         if ( data.rows.length > 0 ) {  
               
           var row = '<tr class="overview_table_body_elements">' 
           row += '<td>'+data.rows[0]['key']+'</td>';
           var date = data.rows[0]['value'][1];
           row += '<td>'+ date.year +'-'+ date.month +'-'+ date.day +' '+ data.rows[0]['value'][2]+'</td>';    
           row += '<td>'+data.rows[0]['value'][0]+'</td>'
           row += '<td>'+data.rows[0]['value'][3]+'</td></tr>'   
           $('#overview_table_body').append(row);
           
           $("#overview_table").trigger("update");
           
         }
       }

     });
  }
  
 
}

//-------------------------------------------------
function refreshOverview()
{
  
  $('.overview_table_body_elements').remove();
  fillOverviewTable();
  
 
}

function setTableSort()
{
  
}
// ____________________________________________________________________________________
function enter_select(event) {    
 
   if (event.keyCode == 13) {  //keycode 13 is the enter key
             
      getSelectData();
      event.returnValue = false; // for IE
      if (event.preventDefault()) event.preventDefault(); 
   
   }

   return false;     
        
}
function zeroPad(num, places) {
    var zero = places - num.toString().length + 1;
    return Array(+(zero > 0 && zero)).join("0") + num;
}

//-------------------------------------------------
function fillBoloSettings(runName, fileNum)
{
  runName = typeof runName !== 'undefined' ? runName : "zz99z999";
  fileNum = typeof fileNum !== 'undefined' ? fileNum : 999;

  db.view(appName + "/boloParams",  {
    group_level:1,
    reduce:true,
    success:function(data){

      var dataTypes = ["polar", "gain", "ampl", "corr", "comp"];
      $('.bolosettings_elements').remove();

      for ( var boloRow in data.rows ) {  
        
        if (data.rows[boloRow]['key'][0] == "veto") continue;

        db.view(appName + "/boloParams", {
          startkey : [data.rows[boloRow]['key'][0], runName, fileNum],
          endkey : [data.rows[boloRow]['key'][0], "",0],
          reduce:false,
          descending:true,
          limit:1,
          success:function(singleData){

            if(singleData.rows[0]["key"][1] < "mf00a000")
              return;

            var params = singleData.rows[0]["value"];
            var boloname = singleData.rows[0]["key"][0];
            var runName = singleData.rows[0]["key"][1] + "_" + zeroPad( singleData.rows[0]["key"][2], 3);  

            for (var key in dataTypes){

              var tableRow = '<tr class="bolosettings_elements">' 
              tableRow += '<td>'+boloname+'</td>';
              tableRow += '<td>'+runName+'</td>';
              
              console.log(boloname + " " + runName);

              if(dataTypes[key] == "polar" && boloname.indexOf("ID") != -1){  
                tableRow += '<td>'+params["polar-A"]+'</td>'
                tableRow += '<td>'+params["polar-B"]+'</td>'
                tableRow += '<td>'+params["polar-C"]+'</td>'
                tableRow += '<td>'+params["polar-D"]+'</td>'
                tableRow += "</tr>";                 
                $("#bolosettings-body-" + dataTypes[key]).append(tableRow);                    
              }

              if(dataTypes[key] == "gain" && boloname.indexOf("ID") != -1){
                tableRow += '<td>'+params["gain-ionisA"]+'</td>'
                tableRow += '<td>'+params["gain-ionisB"]+'</td>'
                tableRow += '<td>'+params["gain-ionisC"]+'</td>'
                tableRow += '<td>'+params["gain-ionisD"]+'</td>'
                tableRow += "</tr>";                 
                $("#bolosettings-body-" + dataTypes[key]).append(tableRow);  
              }

              if(dataTypes[key] == "ampl" && boloname.indexOf("ID") != -1 ){
                tableRow += '<td>'+params["ampl-chalA"]+'</td>'
                tableRow += '<td>'+params["ampl-chalB"]+'</td>'
                tableRow += "</tr>";                 
                $("#bolosettings-body-" + dataTypes[key]).append(tableRow);  
              }

              if(dataTypes[key] == "corr" && boloname.indexOf("ID") != -1 ){
                tableRow += '<td>'+params["corr-chalA"]+'</td>'
                tableRow += '<td>'+params["corr-chalB"]+'</td>'
                tableRow += "</tr>";                 
                $("#bolosettings-body-" + dataTypes[key]).append(tableRow);  
              }

              if(dataTypes[key] == "comp" && boloname.indexOf("ID") != -1 ){
                tableRow += '<td>'+params["comp-chalA"]+'</td>'
                tableRow += '<td>'+params["comp-chalB"]+'</td>'
                tableRow += "</tr>";                 
                $("#bolosettings-body-" + dataTypes[key]).append(tableRow);  
              }
             
            }

            $(".tablesorter").trigger("update"); 
           
          }
        });

      }

    }
  });
}


