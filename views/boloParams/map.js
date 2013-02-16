function(doc) {

  if(doc.type == "daqdocument" && doc.Detecteurs && isArray(doc.Detecteurs) && doc.run_name && doc.file_number !== undefined && doc.Hote){

    for (var i in doc.Detecteurs){
      var outputVal = {}
      if (doc.Detecteurs[i]["bolometer"] && doc.Detecteurs[i]["Bolo.hote"] && doc.Detecteurs[i]["Bolo.hote"] == doc["Hote"]){  //have to check this for nonsense
        var info = doc.Detecteurs[i]['Bolo.reglages']
        for (var key in info){
          if( key.indexOf('polar') == 0  )
           outputVal[key] = info[key]

          if( key.indexOf('gain') == 0 )
            outputVal[key] = info[key]

          if( key.indexOf('ampl') == 0 )
            outputVal[key] = info[key]

          if( key.indexOf('corr') == 0 ) 
            outputVal[key] = info[key]

          if( key.indexOf('comp') == 0 )
            outputVal[key] = info[key]
        }
        emit([doc.Detecteurs[i]['bolometer'], doc.run_name, doc.file_number], outputVal)
      }
    }
  }
}
