/**
 * Copyright 2016 Google Inc. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
'use strict';

const functions = require('firebase-functions');
const admin = require('firebase-admin');
admin.initializeApp(functions.config().firebase);

// Keeps track of the length of the 'likes' child list in a separate property.
exports.countlikechange = functions.database.ref('/characters/{charid}/dead').onWrite(event => {
    return admin.database().ref('/users').once('value').then(function(users) {
        return admin.database().ref('/characters').once('value').then(function(characters) {
          var usersArr = [];
          var newUsers = users.val();
          Object.keys(newUsers).forEach(function(key) {
            var user = newUsers[key];
            var points = 0;
            user.list.forEach(function(item,idx) {
              var char =characters.val()[item];
              if (char.dead) {
                points += 30-((idx + 1)*5);
              }
            });
            user.points = points;
            newUsers[key] = user;
            usersArr.push({
              id:key,
              points:points
            });
          });
          usersArr.sort(function(a, b){
            var keyA = new Number(a.points),
                keyB = new Number(b.points);
            // Compare the 2 dates
            if(keyA < keyB) return -1;
            if(keyA > keyB) return 1;
            return 0;
          }).reverse();
          usersArr.forEach(function(userObj,idx) {
            var user = newUsers[userObj.id];
            user.position = idx+1;
            newUsers[userObj.id] = user;
          });
          var usersRef = admin.database().ref('/users');
          usersRef.update(newUsers);
        });
    });
  });
