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

	//current selections
	$scope.album;
	$scope.artist;
	
	//search input
	$scope.artistName; 
	$scope.albumTitle;
	$scope.albumYear;
	
	$scope.editArtist;
	
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
		}, function errorCallback(response) {
			console.log(response.statusText);
		});
	}
	
	$scope.createNewArtist = function() {
		console.log('New Artist');
		$scope.editArtist= {"id":-1};
		$location.path('artistnew');
	}
	
	$scope.initEditArtist = function(editCurrent) {
		$scope.editArtist= {"id":-1};
		if(editCurrent){
		
			console.log('Current Artist');
			$scope.editArtist.id=$scope.artist.id;
			$scope.editArtist.name=$scope.artist.name;
		}
		
		$location.path('artistedit');
	}
	
	$scope.saveArtist = function() {		
		
		console.log('EditArtist: '+$scope.editArtist);
		
		if($scope.editArtist.id==-1){
			
			console.log('NEW');
		
		$http.post(SERVICE_URL + 'artists', $scope.editArtist).then(function successCallback(response) {
			console.log(response.data);
			$scope.artists.push(response.data);
			$scope.artist=response.data;	
			$scope.albums = [];
			$scope.album = null;
        }, function errorCallback(response) {
			console.log(response.statusText);
		});
		}else{
			console.log('CURRENT');
			
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
	
	
	function findIndexById(source,id) {
		for (var i = 0; i < source.length; i++) {
			if (source[i].id === id) {
				return i;
		    }
		}		  
	}
	
});
