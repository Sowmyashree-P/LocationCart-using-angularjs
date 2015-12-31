var myApp = angular.module('myApp', ['ngRoute'])

//ng-route config
.config(function ($routeProvider, $locationProvider){
  $routeProvider
    .when('/home', {
      templateUrl: 'home.html',
    })
    .when('/place-info/:place_index', {
      templateUrl: 'place_info.html',
      controller: 'placeInfoCtrl'
    })
    .when('/add', {
      templateUrl: 'place_form.html',
      controller: 'addPlaceCtrl'
    })
    .when('/edit/:place_index', {
      templateUrl: 'place_form.html',
      controller: 'editPlaceCtrl'
    })
    .when('/map/:place_index', {
      templateUrl: 'map.html',
      controller: 'mapController'
    })
    .otherwise({redirectTo: '/home'});
})


.controller('homeCtrl', function ($scope, PlaceService,$rootScope){
    //localStorage.removeItem('placeList');
    //localStorage.clear();
  $scope.places = PlaceService.getPlaces();
  console.log($scope.places);
  $rootScope.places = $scope.places;
  $scope.showList = true;
  $scope.showDetail = false;
  $scope.removePlace = function (item) {
    var index = $scope.places.indexOf(item);
    $scope.places.splice(index, 1);
    $scope.removed = 'Place successfully removed.';
    var localData = localStorage.getItem('placeList');
    if(localData != null) {
        //localStorage.setItem('placeList',$scope.places);
        localStorage.removeItem('placeList');
        localStorage.clear();
        //localStorage.setItem('placeList',JSON.stringify($scope.places));
        localStorage.setItem('placeList',angular.toJson($scope.places));
    } else {
    }
  };
})

.controller('placeInfoCtrl', function ($scope, $routeParams){
  var index = $routeParams.place_index;
  $scope.currentPlace = $scope.places[index];
  $scope.showList = false;
  $scope.showDetail = true;
})

.controller('addPlaceCtrl', function ($scope, $location) {
  //needed to show the correct button on the place form
  $scope.path = $location.path();

  $scope.addPlace = function () {
    var place = $scope.currentPlace;
    place.id = $scope.places.length;
    $scope.places.push(place);
    var localData = localStorage.getItem('placeList');
    if(localData != null) {
        localStorage.removeItem('placeList');
        localStorage.clear();
        //localStorage.setItem('placeList',JSON.stringify($scope.places));
        localStorage.setItem('placeList',angular.toJson($scope.places));
        //localStorage.setItem('placeList',$scope.places);
    } else {
    }
  };
    
  $scope.uploadFile = function(element) {
    var data = new FormData();
    console.log($(element)[0].files[0]);
    data.append('file', $(element)[0].files[0]);
    $.ajax({
      url: 'upload.php',
      type:'post',
      data: data,
      contentType: false,
      processData: false,
      success: function(response) {
        console.log(response);
        $scope.currentPlace.img = 'images/'+$(element)[0].files[0].name;
      },
      error: function(jqXHR, textStatus, errorMessage) {
        alert('Error uploading: ' + errorMessage);
      }
    });   
  }
})

.controller('editPlaceCtrl', function ($scope, $routeParams){
  $scope.index = $routeParams.place_index;
  $scope.currentPlace = $scope.places[$scope.index];
})

.controller('mapController', function ($scope, $routeParams,$rootScope){
    $scope.index = $routeParams.place_index;
    $scope.currentPlace = $rootScope.places[$scope.index];
    $scope.goBack = function() {
        window.history.back();
    }
    var lat = '';
    var lon = '';
    console.log('inside map controller');console.log($scope.currentPlace);
    var mapCanvas = document.getElementById('map');
    var mapOptions = {
      center: new google.maps.LatLng(12.9883797,77.7270481),
      zoom: 8,
      mapTypeId: google.maps.MapTypeId.ROADMAP
    }
    var map = new google.maps.Map(mapCanvas, mapOptions);
    console.log(map);
    var geocoder = new google.maps.Geocoder();
    var address = $scope.currentPlace.name+",Bangalore";

    geocoder.geocode( { 'address': address}, function(results, status) {
        console.log(results);
        if (status == google.maps.GeocoderStatus.OK) {
            lat = results[0].geometry.location.lat();
            lon = results[0].geometry.location.lng();
            var marker = new google.maps.Marker({
                map: map,
                position: results[0].geometry.location,
                icon: 'http://maps.google.com/mapfiles/ms/icons/blue-dot.png'
            });
            map.setZoom(15);
            map.setCenter(marker.getPosition());
        } 
    }); 
    
    //var lat = '12.9883797';
    //var lon = '77.7270481';
    //var geolocate = new google.maps.LatLng(lat,lon);
    
})

// directives
.directive('place', function () {
  return {
    restrict: 'E',
    replace: true,
    templateUrl: 'place.html'
  }
})

// services
.factory('PlaceService', [function () {
  var factory = {};

  factory.getPlaces = function () {
    return placeList;
  }

  // place list, usually would be a separate database
  var placeList = [
    {id: 0, name: 'Wonderla', 'description':'Wonderla Holidays Limited is a leading amusement park designing and operating company in India headquartered near Bidadi, 28 kilometres (17 mi) from Bangalore.','Address': '28th km, Mysore Road, Before Bidadi, Bengaluru, Karnataka 562109','Hours': '11:00 AM – 6:00 PM','img':'images/wonderla.jpg'},
    {id: 1, name: 'ISKCON Temple','description':'Sri Radha Krishna Temple has deities of Radha and Krishna located at Rajajinagar, in North Bangalore, Karnataka, India. It is one of the largest ISKCON temples in the world.','Address': 'Hare Krishna Hill, Chord Road, Near Orion Mall, Rajajinagar, Bengaluru, Karnataka 560010','Hours': ' 7:15 AM – 1:00 PM, 4:15 – 8:30 PM','img':'images/iskcon.jpg' },
    {id: 2, name: 'Lalbagh Botanical Garden', 'description':'Lalbagh or Lalbagh Botanical Gardens, meaning The Red Garden in English, is a well known botanical garden in southern Bangalore, India','Address': 'Bengaluru, Karnataka 560004','Hours': ' 6:00 AM – 6:00 PM','img':'images/lalbag.jpg' },
    {id: 3, name: 'Ragigudda Anjaneya Temple', 'description':'The Ragigudda Sri Prasanna Anjaneya temple is a temple dedicated to Hanuman located in Jayanagar 9th Block suburb of Bangalore. The temple also hosts a Shivalinga along with Rama, Sita, Lakshmana, Hanuman shrine in the same precinct','Address': '560069, S End F Cross Rd, 2nd Phase, J P Nagar, Bengaluru, Karnataka 560078','Hours': 'dont know','img':'images/ragigudda.jpg' },
    {id: 4, name: 'Gavi Gangadhareshwara Temple','description':'cGavi Gangadhareshwara Temple also Gavipuram Cave Temple, an example of Indian rock-cut architecture, is located in Bangalore in the state of Karnataka in India','Address': 'Gavipura, Kempegowda Nagar, Bengaluru, Karnataka 560019','Hours':'dk','img':'images/gavi.jpg'},
    {id: 5, name: 'Cubbon Park','description':'Cubbon Park is a landmark lung area of the Bangalore city, located within the heart of city in the Central Administrative Area.','Address': 'Kasturba Road, Sampangi Rama Nagar, Bengaluru, Karnataka 560001','Hours':'dk','img':'images/cubbon.jpg'},
    {id: 6, name: 'Dodda Ganapathi Temple','description':'Dodda Basavana Gudi is situated in Bull Temple Road, Basavanagudi, area of South Bangalore, part of the largest city of the Indian state of Karnataka. The Hindu temple is inside a park called Bugle Rock.','Address': 'Bull Temple Rd, Basavanagudi, Bengaluru, Karnataka 560004','Hours':'dk','img':'images/dodda.jpg'},
    {id: 7, name: 'Vidhana Soudha','description':'The Vidhana Soudha located in Bengaluru, is the seat of the state legislature of Karnataka. It is an imposing building, constructed in a style sometimes described as Mysore Neo-Dravidian, and incorporates ...','Address': 'Bengaluru, Karnataka 560004','Hours':'dk','img':'images/vidhan.jpg'},
    {id: 8, name: 'Phoenix Marketcity', 'description':'Phoenix Marketcity is a shopping mall developed by The Phoenix Mills Co. Ltd. located in Bengaluru, Karnataka, India','Address': 'Mahadevapura,Bengaluru, Karnataka 560004','Hours':'11:00AM-11:00PM','img':'images/pheonix.jpg'},
    {id: 9, name: 'Bannerghatta National Park', 'description':'Bannerghatta National Park, near Bangalore, Karnataka, was founded in 1971 and declared as a national park in 1974. In 2002 a portion of the park, became a biological reserve, the Bannerghatta Biological Park.','Address': 'Bannerghatta, Bengaluru, Karnataka 560083','Hours':'9:30 AM – 5:00 PM','img':'images/banner.jpg'},
    {id: 10, name: 'M Chinnaswamy Stadium','description':'The M. Chinnaswamy Stadium, located in Bengaluru, Karnataka, is one of the cricket stadiums of India.','Address': 'MG Road, Near Gandhi Park, Near Anil Kumble Circle, Bengaluru, Karnataka 560001','Hours':'dk','img':'images/chinna.jpg'}
  ];
    console.log(placeList);
  //var localData = JSON.parse(localStorage.getItem('placeList'));
  var localData = angular.fromJson(localStorage.getItem('placeList'));
  if(localData != null) {
      console.log('local data is ',localData);
      //localStorage.setItem('placeList',JSON.stringify(placeList));
      placeList = localData;
  } else {
      console.log('emopty store ');
      //localStorage.setItem('placeList',JSON.stringify(placeList));
      localStorage.setItem('placeList',angular.toJson(placeList));
  }
  
  return factory;
}]);