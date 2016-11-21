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
	
	// albums for current artist or search result
	$scope.albums = [];

	// current selections
	$scope.album;
	$scope.artist;
	
	// search input
	$scope.artistName; 
	$scope.albumTitle;
	$scope.albumYear;
	
	$scope.editArtist;
	$scope.editAlbum;
	
	loadArtists();

	function loadArtists() {
		$http.get(SERVICE_URL + 'artists').then(function successCallback(response) {
			$scope.artists = response.data;

			if ($scope.artists.length > 0) {
				$scope.artist = $scope.artists[0];
				$scope.getArtistAlbums();
			}
		}, function errorCallback(response) {
			console.log(response.statusText);
		});
	}

	$scope.getArtistAlbums = function() {
		console.log('Artist changed: ' + $scope.artist.id);
		$http.get(SERVICE_URL + 'artists/' + $scope.artist.id + '/albums')
		.then(function successCallback(response) {
			$scope.albums = response.data;
			
			if ($scope.albums.length > 0) {
				$scope.album = $scope.albums[0];
			}
			else{
				$scope.album = null;
			}
			
		}, function errorCallback(response) {
			console.log(response.statusText);
		});
	}

	$scope.getAlbum = function(albumId) {

		// XXX Loop through albums instead

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
		
		$http.get(url).then(function successCallback(response) {
			$scope.albums = response.data;
			
			if ($scope.albums.length > 0) {
				$scope.album = $scope.albums[0];
			}
			else{
				$scope.album = null;
			}
		}, function errorCallback(response) {
			console.log(response.statusText);
		});
	}
		
	$scope.initEditArtist = function(editCurrent) {
		$scope.editArtist= {};
		if(editCurrent){
			$scope.editArtist.id=$scope.artist.id;
			$scope.editArtist.name=$scope.artist.name;
		}		
		$location.path('artistedit');
	}
	
	$scope.saveArtist = function() {				
		if(!$scope.editArtist.id){
			$http.post(SERVICE_URL + 'artists', $scope.editArtist).then(
					function successCallback(response) {
						console.log(response.data);
						$scope.artists.push(response.data);
						$scope.artist=response.data;	
						$scope.albums = [];
						$scope.album = null;
					}, 
					function errorCallback(response) {
						console.log(response.statusText);
					});
		}else{
			var url= SERVICE_URL + 'artists/'+$scope.editArtist.id;
			
			$http.put(url, $scope.editArtist).then(function successCallback(response) {
				console.log(response.data);
				
				var index=findIndexById($scope.artists,$scope.artist.id);	
				$scope.artists[index].name=response.data.name;					
				$scope.artist=response.data;
				
	        }, function errorCallback(response) {
				console.log(response.statusText);
			});
			
		}
		
		$location.path('');
	}
	
	$scope.deleteArtist = function() {
		console.log('Delete Artist');	
		
		$http.delete(SERVICE_URL + 'artists/' + $scope.artist.id).
		then(function successCallback(response) {
			var index=findIndexById($scope.artists,$scope.artist.id);	
			$scope.artists.splice(index, 1);				
			$scope.artist=$scope.artists[0];
			$scope.getArtistAlbums();
			
		},function errorCallback(response) {
			console.log(response.statusText);
		});
		
	}
	
	
	$scope.initEditAlbum = function(editCurrent) {
		$scope.editAlbum= {};
		if(editCurrent){
			$scope.editAlbum.id=$scope.album.id;
			$scope.editAlbum.title=$scope.album.title;
			$scope.editAlbum.year=$scope.album.year;
			$scope.editAlbum.artist=$scope.artist;		
			
			$scope.editAlbum.songs = [];
			
			copySongs($scope.album.songs, $scope.editAlbum.songs);			
		}		
		$location.path('albumedit');
	}
	
	$scope.saveAlbum = function() {
		console.log('Save Album');	
				
		if(!$scope.editAlbum.id){
			
			$http.post(SERVICE_URL + 'albums', $scope.editAlbum).then(
					function successCallback(response) {
						console.log(response.data);						
						$scope.albums.push(response.data);
						$scope.album = response.data;	
					}, 
					function errorCallback(response) {
						console.log(response.statusText);
					});
		}else{
			var url= SERVICE_URL + 'albums/'+$scope.editAlbum.id;
			
			$http.put(url, $scope.editAlbum).then(function successCallback(response) {
				console.log(response.data);
				
				var index=findIndexById($scope.albums,$scope.editAlbum.id);
				console.log('Album index: '+index);
				$scope.albums[index].title=response.data.title;
				$scope.albums[index].year=response.data.year;
				$scope.albums[index].artist=response.data.artist;
				$scope.albums[index].songs=response.data.songs;
				$scope.album=response.data;
				
	        }, function errorCallback(response) {
				console.log(response.statusText);
			});
			
		}
		
		$location.path('');
		
	}
	
	$scope.deleteAlbum = function() {
		console.log('Delete Album');	
		
		$http.delete(SERVICE_URL + 'albums/' + $scope.album.id).
		then(function successCallback(response) {
			var index=findIndexById($scope.albums,$scope.album.id);	
			$scope.albums.splice(index, 1);	
			if($scope.albums.length>0){
				$scope.album=$scope.albums[0];
			}
			else{
				$scope.album=null;
			}						
		},function errorCallback(response) {
			console.log(response.statusText);
		});
		
	}
});
