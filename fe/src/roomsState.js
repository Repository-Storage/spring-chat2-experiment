import angular from 'angular'
import uiRouterModule from 'angular-ui-router'
import apiModule from './api'

export default angular.module('app.roomsState', [
  uiRouterModule,
  apiModule
])
.config($stateProvider => {
  $stateProvider
  .state('app.rooms', {
    url: '/rooms',
    template: `
    <button ng-click="createRandomRoom()">Create random room</button>
    <ul>
        <li ng-repeat="room in rooms track by room.id">
          (id={{room.id}})
          <input type="text" ng-model="room.name"> (members: {{room.count}})
          <button type="button" ng-click="editRoom(room)">Save</button>
          <button type="button" ng-click="deleteRoom(room.id)">Delete</button>
          <button type="button" ng-click="joinRoom(room.id)">Join</button>
          <button type="button" ng-click="leaveRoom(room.id)">Leave</button>
          <a ui-sref="app.room({ roomId: room.id })">View</a>
        </li>
    </ul>`,
    controller: ($scope, $http, api, rooms) => {
      $scope.rooms = rooms;

      // UI ACTIONS
      $scope.createRandomRoom = () => {
        var roomName = 'test room #' + Math.random().toString(36).replace(/[^a-z]+/g, '').substr(0, 5)
        api.createRoom({
          name: roomName
        });
      };

      $scope.deleteRoom = roomId => {
        api.deleteRoom(roomId);
      };

      $scope.editRoom = room => {
        api.updateRoom(room.id, room);
      };

      $scope.joinRoom = roomId => {
        api.joinRoom(roomId);
      };

      $scope.leaveRoom = roomId => {
        api.leaveRoom(roomId);
      };
    }
  })
})
.name
