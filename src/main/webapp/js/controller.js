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


app.directive('ngEnter', function() {
    return function(scope, element, attrs) {
        element.bind("keydown keypress", function(event) {        	
            if(event.which === 13) {            	            
                scope.$apply(function(){
                    scope.$eval(attrs.ngEnter, {'event': event});
                });

                event.preventDefault();
            }
        });
    };
});


app.controller("MusicLibraryController", function($scope, $http, SERVICE_URL, CONFIG_URL, $location) {
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
	$scope.editSong;
	
	$scope.serviceURL;
	
	init();
	
	function init(){
		$http.get(CONFIG_URL).then(
			function successCallback(response) {
			    var config = response.data;
			    var url=config.propertySources[0].source.serviceURL;
			    if(url)
			        return url;
			    else 
			    	    return SERVICE_URL;
			},
            function errorCallback(response) {
				return SERVICE_URL;	
			}
		).then(function (url){			
			$scope.serviceURL=url;
			if(!$scope.serviceURL.endsWith('/'))
				$scope.serviceURL+='/';
			console.log('Setting service url: '+$scope.serviceURL);
			loadArtists();
		}).catch(function(e){
			alert('Error: '+e);
		});
	}

	function loadArtists() {
		$http.get($scope.serviceURL + 'artists').then(function successCallback(response) {
			$scope.artists = response.data;

			if ($scope.artists.length > 0) {
				$scope.artist = $scope.artists[0];
				$scope.getArtistAlbums();
			}
		}, function errorCallback(response) {
			console.log(response.statusText);
			alert('Error: '+response.statusText);
		});
	}

	$scope.getArtistAlbums = function() {		
		$http.get($scope.serviceURL + 'artists/' + $scope.artist.id + '/albums')
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
			alert('Error: '+response.statusText);
		});
	}

	$scope.setAlbum = function(album) {
		$scope.album = album;
	}
	
	$scope.getAlbums = function() {
		
		var url= $scope.serviceURL + 'albums';
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
			$scope.artist = null;
		}, function errorCallback(response) {
			console.log(response.statusText);
			alert('Error: '+response.statusText);
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
			$http.post($scope.serviceURL + 'artists', $scope.editArtist).then(
					function successCallback(response) {
						console.log(response.data);
						$scope.artists.push(response.data);
						$scope.artist=response.data;	
						$scope.albums = [];
						$scope.album = null;
					}, 
					function errorCallback(response) {
						console.log(response.statusText);
						alert('Error: '+response.statusText);
					});
		}else{
			var url= SERVICE_URL + 'artists/'+$scope.editArtist.id;
			
			$http.put(url, $scope.editArtist).then(function successCallback(response) {				
				var index=findIndexById($scope.artists,$scope.artist.id);	
				$scope.artists[index].name=response.data.name;					
				$scope.artist=response.data;
				
				if($scope.albums){
					for(var i=0; i< $scope.albums.length; i++){
						if($scope.albums[i].artist.id == $scope.artist.id){
							$scope.albums[i].artist = $scope.artist;
						}
					}
				}				
	        }, function errorCallback(response) {
				console.log(response.statusText);
				alert('Error: '+response.statusText);
			});
			
		}
		
		$location.path('');
	}
	
	$scope.deleteArtist = function() {
		
		if(!confirm("Really delete artist?"))
			return;
					
		$http.delete(SERVICE_URL + 'artists/' + $scope.artist.id).
		then(function successCallback(response) {
			var index=findIndexById($scope.artists,$scope.artist.id);	
			$scope.artists.splice(index, 1);				
			$scope.artist=$scope.artists[0];
			$scope.getArtistAlbums();
			
		},function errorCallback(response) {
			console.log(response.statusText);
			alert('Error: '+response.statusText);
		});		
	}
		
	$scope.initEditAlbum = function(editCurrent) {
				
		$scope.editAlbum= {};
		$scope.editAlbum.songs = [];		
		$scope.editSong = null;
		
		if(editCurrent){
			$scope.editAlbum.artist=$scope.album.artist;
			$scope.editAlbum.id=$scope.album.id;
			$scope.editAlbum.title=$scope.album.title;
			$scope.editAlbum.year=$scope.album.year;										
			
			copySongs($scope.album.songs, $scope.editAlbum.songs);			
		} else {			
			if(!$scope.artist){
				alert('Please select an artist for the new album');
				return;
			}	
						
			$scope.editAlbum.artist=$scope.artist;			
		}		
				
		$location.path('albumedit');
	}
	
	$scope.saveAlbum = function() {
		if(!$scope.editAlbum.id){
			
			$http.post(SERVICE_URL + 'albums', $scope.editAlbum).then(
					function successCallback(response) {						
						$scope.albums.push(response.data);
						$scope.album = response.data;	
					}, 
					function errorCallback(response) {
						console.log(response.statusText);
						alert('Error: '+response.statusText);
					});
		}else{
			var url= SERVICE_URL + 'albums/'+$scope.editAlbum.id;
			
			$http.put(url, $scope.editAlbum).then(function successCallback(response) {				
				
				var index=findIndexById($scope.albums,$scope.editAlbum.id);				
				$scope.albums[index].title=response.data.title;
				$scope.albums[index].year=response.data.year;
				$scope.albums[index].artist=response.data.artist;
				$scope.albums[index].songs=response.data.songs;
				$scope.album=response.data;
				
	        }, function errorCallback(response) {
				console.log(response.statusText);
				alert('Error: '+response.statusText);
			});
			
		}
		
		$location.path('');		
	}
	
	$scope.deleteAlbum = function() {		
		
		if(!confirm("Really delete album?"))
			return;
		
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
			alert('Error: '+response.statusText);
		});		
	}
	
	$scope.initEditSong = function(song) {
						
		$scope.editSong={};
		
		if(song){			
			if(song.id){
				$scope.editSong.id=song.id;	
			}else{
				//Need to keep track of non-persisted song already in song list
				$scope.editSong.id=-1;
				song.id=-1;
			}
									
			$scope.editSong.title=song.title;
			$scope.editSong.track=song.track;
			$scope.editSong.disc=song.disc;
		}
		else{
			if($scope.editAlbum.songs){
				$scope.editSong.track=$scope.editAlbum.songs.length+1;
			}
			else{
				$scope.editSong.track=1;
			}
			
			$scope.editSong.disc='1';			
		}
	}	
	
    $scope.cancelEditSong = function() {		
		$scope.editSong=null;			
	}	
    
    $scope.saveEditSong = function() {
		
    	var index=findIndexById($scope.editAlbum.songs,$scope.editSong.id);	    
    	
    	if($scope.editSong.id==-1){    	
    		$scope.editAlbum.songs[index].id=null;
    		$scope.editSong.id==null;
    	}    	    	
    	
    	if(index>=0){
    		$scope.editAlbum.songs[index].title=$scope.editSong.title;
    		$scope.editAlbum.songs[index].track=$scope.editSong.track;
    		$scope.editAlbum.songs[index].disc=$scope.editSong.disc;
    	}    	
    	else{
    		$scope.editAlbum.songs.push($scope.editSong);    		
    	}
    	    	
    	$scope.editSong=null;			
	}	    
    
    $scope.deleteSong = function(song) {    	
    	var index=findIndexByIdentity($scope.editAlbum.songs,song);    	    
    	$scope.editAlbum.songs.splice(index, 1);	
    }
});
