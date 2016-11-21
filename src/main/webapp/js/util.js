function findIndexById(source, id) {
	for (var i = 0; i < source.length; i++) {
		if (source[i].id === id) {
			return i;
		}
	}
}

function copySongs(source, target){
	
	for (var i = 0; i < source.length; i++) {
		target[i]={};
		target[i].id = source[i].id;
		target[i].title = source[i].title;
		target[i].track = source[i].track;
		target[i].disc = source[i].disc;
	}
	
}