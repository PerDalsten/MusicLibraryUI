app = angular.module("musiclibraryapp", [ "ngRoute" , "config" ]);


app.config(['$routeProvider', function($routeProvider) {
    	
	$routeProvider    
    .when("/albumedit", {
        templateUrl : "albumedit.html"
    })
    .when("/artistedit", {
        templateUrl : "artistedit.html"
    })    
    .otherwise({
        templateUrl : "albumview.html"
    });
}]);

app.controller("MusicLibraryController", function($scope, $http, SERVICE_URL, $location) {
	$scope.artists = [];
	$scope.albums = [];

	$scope.album;
	$scope.artist;
	$scope.artistName;
	$scope.albumTitle;
	$scope.albumYear;
	
	$scope.newArtist;
	
	loadArtists();

	function loadArtists() {
		$http({
			method : 'GET',
			url : SERVICE_URL + 'artists'
		}).then(function successCallback(response) {
			$scope.artists = response.data;

			if ($scope.artists.length > 0) {
				$scope.artist = $scope.artists[0];
				$scope.getArtistAlbums()
			}
		}, function errorCallback(response) {
			console.log(response.statusText);
		});
	}

	$scope.getArtistAlbums = function() {
		console.log('Artist changed: ' + $scope.artist.id);
		$http({
			method : 'GET',
			url : SERVICE_URL + 'artists/' + $scope.artist.id + '/albums'			
		}).then(function successCallback(response) {
			$scope.albums = response.data;
			
			if ($scope.albums.length > 0) {
				$scope.album = $scope.albums[0];
			}
			
		}, function errorCallback(response) {
			console.log(response.statusText);
		});
	}

	$scope.getAlbum = function(albumId) {

		// XXX Loop through artistAlbums instead

		$http({
			method : 'GET',
			url : SERVICE_URL + 'albums/' + albumId
		}).then(function successCallback(response) {
			$scope.album = response.data;
		}, function errorCallback(response) {
			console.log(response.statusText);
		});
	}
	
	$scope.getAlbums = function() {

		console.log('Artist: '+$scope.artistName);
		console.log('Album: '+$scope.albumTitle);
		console.log('Year: '+$scope.albumYear);
		
		var url= SERVICE_URL + 'albums';
		var firstArg = true;
		
		if($scope.artistName){			
			if(firstArg){
				url+='?';
				firstArg=false;
			}else{
				url+='&';
			}
			url+='artist='+$scope.artistName;
		}
		
		if($scope.albumTitle){			
			if(firstArg){
				url+='?';
				firstArg=false;
			}else{
				url+='&';
			}
			url+='title='+$scope.albumTitle;
		}
		
		if($scope.albumYear){			
			if(firstArg){
				url+='?';
				firstArg=false;
			}else{
				url+='&';
			}
			url+='year='+$scope.albumYear;
		}
		
		$http({
			method : 'GET',
			url : url
		}).then(function successCallback(response) {
			$scope.albums = response.data;
			
			if ($scope.albums.length > 0) {
				$scope.album = $scope.albums[0];
			}
		}, function errorCallback(response) {
			console.log(response.statusText);
		});
	}

	$scope.createNewArtist = function() {
		console.log('New Artist');
		$scope.newArtist= {"id":-1};
		$location.path('artistedit');
	}
	
	$scope.saveNewArtist = function() {
		
		$http.post(SERVICE_URL + 'artists', $scope.newArtist).then(function successCallback(response) {
			console.log(response.data);
			$scope.artists.push(response.data);
			$scope.artist=response.data;	
			$scope.albums = [];
			$scope.album = null;
        }, function errorCallback(response) {
			console.log(response.statusText);
		});
		
		$location.path('');
	}
});
