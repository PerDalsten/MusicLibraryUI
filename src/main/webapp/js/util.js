function findIndexById(source, id) {
	for (var i = 0; i < source.length; i++) {
		if (source[i].id === id) {
			return i;
		}
	}
}