app=angular.module("musiclibraryapp", ["config"]);


app.controller("MusicLibraryController", function($scope, $http, SERVICE_URL) {
	$scope.artists = [];
	$scope.artistAlbums = [];
	$scope.album;
	
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
	
	$scope.getArtistAlbums = function (artistId){
		$http({
            method : 'GET',
            url : SERVICE_URL+'artists/'+artistId+'/albums'
        }).then(function successCallback(response) {
            $scope.artistAlbums = response.data;
        }, function errorCallback(response) {
            console.log(response.statusText);
        });				
	}
	
	$scope.getAlbum = function (albumId){
		
		//XXX Loop through artistAlbums instead
		
		$http({
            method : 'GET',
            url : SERVICE_URL+'albums/'+albumId
        }).then(function successCallback(response) {
            $scope.album = response.data;
        }, function errorCallback(response) {
            console.log(response.statusText);
        });
	}
	
});
