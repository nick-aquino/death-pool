// Initialize Firebase
var config = {
  apiKey: "AIzaSyAuO1gsiF2eQ75ER5CnIFa8lPbGtE-TOSg",
  authDomain: "death-pool.firebaseapp.com",
  databaseURL: "https://death-pool.firebaseio.com",
  projectId: "death-pool",
  storageBucket: "death-pool.appspot.com",
  messagingSenderId: "789319593180"
};
firebase.initializeApp(config);

var myApp = angular.module('myApp',['ui.sortable']);
myApp.config(['$locationProvider', function($locationProvider){
    $locationProvider.html5Mode(true);
}]);
myApp.controller('GreetingController', ['$scope', '$location',function($scope,$location,$document) {

  $scope.sortableOptions = {
    handle: '> .drag-handle',
    disabled: true,
    axis: 'y',
    stop: function(e, ui) {
      var listRef = firebase.database().ref('/users').child($scope.uid).child('list');
      listRef.set($scope.userChars.map(function(char) {return char.key;}));
    }
  };
  initApp = function() {
    firebase.auth().onAuthStateChanged(function(user) {
      if (user) {
        var photolink;
        if (user.providerData[0].photoURL){
          photolink = user.providerData[0].photoURL;
        } else {
          photolink = 'characters/ironthrone-compressed.jpg';
        }
        user.updateProfile({
          photoURL: photolink
        })
        // User is signed in.
        $scope.displayName = user.displayName;
        $scope.email = user.email;
        $scope.photoURL = user.photoURL;
        $scope.uid = user.uid;

        //check if user has entry in DB
        var usersRef = firebase.database().ref('/users');
        return usersRef.child(user.uid).once('value', function(snapshot) {
          var exists = (snapshot.val() !== null);
          if (exists) {
            //check other stuff
          } else {
            var userObj = {};
            userObj[user.uid] = {
              name: user.displayName,
              points: 0,
              position: 1,
              image:user.photoURL
            };
            usersRef.update(userObj)
          }
        });
      } else {
        window.location = 'login.html'
      }
    }, function(error) {
      console.log(error);
    });
  };

  initApp();
  // Get a reference to the database service
  var database = firebase.database();

  getUsers = function() {
    return firebase.database().ref('/users').once('value').then(function(users) {
      $scope.users = [];
      Object.keys(users.val()).forEach(function(key) {
        var user = users.val()[key];
        user.key = key;
        if (key == $scope.uid){
          $scope.position = user.position;
          $scope.points = user.points;
        }
        $scope.users.push(user)
      });
      $scope.$apply();
    });
  }
  getCharacters = function() {
    $scope.dead = 0;
    $scope.alive = 0;
    return firebase.database().ref('/characters').once('value').then(function(characters) {
      $scope.characters = characters.val();
      $scope.characters.forEach(function(char) {
        if (char.dead){
          $scope.dead = $scope.dead+1;
        }
        else{
          $scope.alive = $scope.alive+1;
        }
      });
      $scope.$apply();
    });
  }

  $scope.logout = function() {
    firebase.auth().signOut();
  };

  $scope.initindex = function() {
    getUsers();
  };

  $scope.editable = function() {
    var userid = $location.search().user;
    if (userid == $scope.uid){
      $scope.sortableOptions.disabled = false;
      return true;
    }
  }

  $scope.initUser = function() {
    var userid = $location.search().user;
    return firebase.database().ref('/users').once('value').then(function(users) {
        return firebase.database().ref('/characters').once('value').then(function(characters) {
          $scope.characters = characters.val();
          $scope.userChars = [];
          var user = users.val()[userid];
          $scope.points = user.points;
          $scope.position = user.position;
          $scope.image = user.image;
          if (!user.list) {
            user.list = [];
          }
          user.list.forEach(function(item,idx) {
            var char =characters.val()[item];
            char.key = item;
            $scope.userChars.push(char);
          });
          $scope.$apply();
        });
    });
  };

  $scope.currentList = function(){return $scope.userChars.map(function(char) {return char.key;})};

  $scope.add = function(key,char) {
    var currentList = $scope.userChars.map(function(char) {return char.key;});
    if (currentList.includes(key)) {
      alert('already added');
      return;
    }
    char.key = key;
    $scope.userChars.push(char);
    $('#myModal').modal('hide');
    var listRef = firebase.database().ref('/users').child($scope.uid).child('list');
    listRef.set($scope.userChars.map(function(char) {return char.key;}));
  };

  $scope.remove = function(key) {
    $scope.userChars.splice( key, 1 );
    var listRef = firebase.database().ref('/users').child($scope.uid).child('list');
    listRef.set($scope.userChars.map(function(char) {return char.key;}));
  };

  $scope.initCharacters = function() {
    getCharacters();
  }

  $scope.go = function(user) {
    window.location = 'player.html?user='+user
  };

  $scope.goto = function(page) {
    window.location = page
  };

  /* Set the width of the side navigation to 250px and the left margin of the page content to 250px and add a black background color to body */
  $scope.openNav = function() {
      document.getElementById("mySidenav").style.width = "250px";
      $scope.overlay = true;
  }

  /* Set the width of the side navigation to 0 and the left margin of the page content to 0, and the background color of body to white */
  $scope.closeNav = function() {
      document.getElementById("mySidenav").style.width = "0";
      $scope.overlay = false;
  }

}]);
