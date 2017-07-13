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

var myApp = angular.module('myApp',[]);
myApp.config(['$locationProvider', function($locationProvider){
    $locationProvider.html5Mode(true);
}]);
myApp.controller('GreetingController', ['$scope', '$location',function($scope,$location,$document) {
  initApp = function() {
    firebase.auth().onAuthStateChanged(function(user) {
      if (user) {
        user.updateProfile({
          photoURL: user.providerData[0].photoURL
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
              position: 3,
              image:user.photoURL,
              list:[12]
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

  $scope.initUser = function() {
    var userid = $location.search().user;
    return firebase.database().ref('/users').once('value').then(function(users) {
        return firebase.database().ref('/characters').once('value').then(function(characters) {
          $scope.userChars = [];
          var user = users.val()[userid];
          $scope.points = user.points;
          $scope.position = user.position;
          $scope.image = user.image;
          user.list.forEach(function(item,idx) {
            var char =characters.val()[item];
            $scope.userChars.push(char);
          });
          $scope.$apply();
        });
    });
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
  }

  /* Set the width of the side navigation to 0 and the left margin of the page content to 0, and the background color of body to white */
  $scope.closeNav = function() {
      document.getElementById("mySidenav").style.width = "0";
  }

}]);
