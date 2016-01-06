import angular from 'angular'
import uiRouterModule from 'angular-ui-router'
import slModule from './sl'
import apiModule from './api'
import _ from 'lodash'

export default angular.module('app.roomState', [
  uiRouterModule,
  slModule,
  apiModule
])
.config($stateProvider => {
  $stateProvider
  .state('app.room', {
    url: '/rooms/:roomId',
    template: `
    <div class="row">
      <div class="col-xs-4">
        <div class="list-group">
          <a ui-sref="app.room({ roomId: room.id })" class="list-group-item" ng-repeat="room in myRooms track by room.id">{{room.name}}</a>
        </div>
      </div>
      <div class="col-xs-8">
        <h1>#{{room.id}} {{room.name}}</h1>
        Users: <span ng-repeat="member in members track by member.id">
          <span class="label label-default">{{member.name}}</span>
        </span>
      </div>
    </div>`,
    resolve: {
      myRooms: ['$rootScope', 'sl', 'api', async ($rootScope, sl, api) => {
        var { db, roomTable, userTable, membershipTable, lf } = await sl.objects()

        var query = db.select(
          roomTable.id.as('id'),
          roomTable.name.as('name')
        )
        .from(membershipTable)
        .leftOuterJoin(roomTable, membershipTable.roomId.eq(roomTable.id))
        .where(membershipTable.userId.eq(api.me.id))

        var rooms = await query.exec()
        db.observe(query, async function(changes) {
          Array.prototype.splice.apply(rooms, [0, rooms.length].concat(changes[changes.length - 1].object))
          $rootScope.$digest()
        })
        return rooms
      }],

      room: ['$rootScope', 'sl', '$stateParams', async ($rootScope, sl, $stateParams) => {
        var roomId = $stateParams.roomId
        var { db, roomTable, userTable, membershipTable, lf } = await sl.objects()

        var roomQuery = db.select(
          roomTable.id.as('id'),
          roomTable.name.as('name')
        )
        .from(roomTable)
        .where(roomTable.id.eq(roomId))

        var rooms = await roomQuery.exec()
        if(rooms.length !== 1) {
          console.log('no such room!')
          throw 'no such room'
        }

        var room = rooms[0]
        db.observe(roomQuery, async function(changes) {
          var rooms = changes[changes.length - 1].object
          if(rooms.length !== 1) {
            console.log('room has disappeared!')
            throw 'room has disappeared'
          }

          var r = rooms[0]
          _.assign(room, rooms[0])

          $rootScope.$digest()
        })

        return room
      }],
      members: ['$rootScope', 'sl', '$stateParams', async ($rootScope, sl, $stateParams) => {
        var roomId = $stateParams.roomId
        var { db, roomTable, userTable, membershipTable, lf } = await sl.objects()

        var query = db.select(
          userTable.id.as('id'),
          userTable.name.as('name')
        )
        .from(membershipTable)
        .leftOuterJoin(userTable, membershipTable.userId.eq(userTable.id))
        .where(membershipTable.roomId.eq(roomId))

        var members = await query.exec()
        db.observe(query, async function(changes) {
          Array.prototype.splice.apply(members, [0, members.length].concat(changes[changes.length - 1].object))
          $rootScope.$digest()
        })
        return members
      }]
    },
    controller: ($scope, myRooms, room, members) => {
      $scope.myRooms = myRooms
      $scope.room = room
      $scope.members = members
    }
  })
})
.name
