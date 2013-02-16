function (doc) {
  if(doc.type == 'daqdocument' && doc.Hote && doc.run_name && doc.file_number !== undefined){
    emit([doc.Hote, doc.run_name, doc.file_number], 1);
  }
}