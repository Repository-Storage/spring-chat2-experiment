import angular from 'angular'
import uiRouterModule from 'angular-ui-router'
import apiModule from './api'
import slModule from './sl'

export default angular.module('app.roomsState', [
  uiRouterModule,
  apiModule,
  slModule
])
.config($stateProvider => {
  $stateProvider
  .state('rooms', {
    url: '/rooms',
    template: `
    <div class="col-xs-12 grow" style="overflow-y: scroll; flex-direction: column;">
      <form ng-submit="createRandomRoom()">
        <button type="submit" class="btn btn-default">Create random room</button>
      </form>
      <ul>
        <li ng-repeat="room in rooms track by room.id">
          (id={{room.id}})
          <input type="text" ng-model="room.name"> (members: {{room.count}})
          <button type="button" ng-click="editRoom(room)">Save</button>
          <button type="button" ng-click="deleteRoom(room.id)">Delete</button>
          <button type="button" ng-click="joinRoom(room.id)">Join</button>
          <button type="button" ng-click="leaveRoom(room.id)">Leave</button>
          <a ui-sref="room({ roomId: room.id })">View</a>
        </li>
      </ul>
    </div>`,
    onExit: function(rooms) {
      rooms.unobserve()
    },
    resolve: {
      rooms: ['$rootScope', 'sl', 'api', async ($rootScope, sl, api) => {
        var { db, roomTable, userTable, membershipTable, lf } = await sl.objects()

        var query = db.select(
          roomTable.id.as('id'),
          roomTable.name.as('name'),
          lf.fn.count(membershipTable.userId).as('count')
        )
        .from(roomTable)
        .leftOuterJoin(membershipTable, roomTable.id.eq(membershipTable.roomId))
        .groupBy(roomTable.id, roomTable.name)

        return sl.observeMany(query)
      }]
    },
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
