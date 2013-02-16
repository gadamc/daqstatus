function (doc) {
  if(doc.type == 'daqdocument' && doc.run_name && doc.file_number !== undefined){
    emit([doc.run_name, doc.file_number], 1);
  }
}