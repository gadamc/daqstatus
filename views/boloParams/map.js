function(doc) {


  if(doc.type == "daqdocument"){

    for (var i in doc.Detecteurs){
      var outputVal = {}

      var info = doc.Detecteurs[i]['Bolo.reglages']
      for (var key in info){
        if( key.indexOf('polar') == 0  )
         outputVal[key] = info[key]

        if( key.indexOf('gain') == 0 )
         outputVal[key] = info[key]

        if( key.indexOf('ampl') == 0 )
         outputVal[key] = info[key]
     }
     emit([doc.Detecteurs[i]['bolometer'], doc.run_name, doc.file_number], outputVal)

   }
 }
}