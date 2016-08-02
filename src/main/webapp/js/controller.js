app=angular.module("musiclibraryapp", ["config"]);


app.controller("MusicLibraryController", function($scope, $http, SERVICE_URL) {
	$scope.artists = [];
	
	loadArtists();
	
	function loadArtists() {
        $http({
            method : 'GET',
            url : SERVICE_URL+'artists'
        }).then(function successCallback(response) {
            $scope.artists = response.data;
        }, function errorCallback(response) {
            console.log(response.statusText);
        });
    }
	
});
