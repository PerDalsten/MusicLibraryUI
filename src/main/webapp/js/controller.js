angular.module("myapp", []).controller("HelloController", function($scope) {
	$scope.tasks = [ {
		title : "Do this",
		desc : "Blabla this"
	}, {
		title : "Do that",
		desc : "Blabla that"
	}, ];
	$scope.tasks.push({
		title : "Hej",
		desc : "sdhsa"
	})
});
