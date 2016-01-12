import angular from 'angular'
import uiRouterModule from 'angular-ui-router'
import slModule from './sl'
import apiModule from './api'
//import lueggDirectivesModule from 'angularjs-scroll-glue/src/scrollglue.js'
require('angularjs-scroll-glue/src/scrollglue.js')

export default angular.module('app.roomState', [
  uiRouterModule,
  slModule,
  apiModule,
  'luegg.directives'
])
.config($stateProvider => {
  $stateProvider
  .state('room', {
    url: '/rooms/:roomId',
    template: `
    <div class="col-xs-4">
      <div class="list-group">
        <a ui-sref="room({ roomId: room.id })" class="list-group-item" ng-repeat="room in myRooms track by room.id" ng-class="{'active': room.id == roomId}">{{room.name}}</a>
      </div>
    </div>
    <div class="col-xs-8 grow flex-column">
      <h1>#{{room.id}} {{room.name}}</h1>
      <div>
        Users: <span ng-repeat="member in members track by member.id">
          <span class="label label-default">{{member.name}}</span>
        </span>
      </div>
      <p>message count: {{messages.length}}</p>
      <div class="grow" style="overflow-y: scroll" scroll-glue>
        <ul>
          <li ng-repeat="message in messages track by message.id">#{{message.id}} {{message.name}}: {{message.text}}</li>
        </ul>
      </div>
      <form ng-submit="sendMessage()">
        <div class="input-group">
          <input type="text" class="form-control" ng-model="messageText">
          <span class="input-group-btn">
            <button type="submit" class="btn btn-default">Send</button>
          </span>
        </div>
      </form>
    </div>`,
    onExit: function(myRooms, room, members, messages) {
      myRooms.unobserve()
      room.unobserve()
      members.unobserve()
      messages.unobserve()
    },
    resolve: {
      roomId: $stateParams => $stateParams.roomId,
      myRooms: ['$rootScope', 'sl', 'api', async ($rootScope, sl, api) => {
        var { db, roomTable, membershipTable } = await sl.objects()

        var query = db.select(
          roomTable.id.as('id'),
          roomTable.name.as('name')
        )
        .from(membershipTable)
        .leftOuterJoin(roomTable, membershipTable.roomId.eq(roomTable.id))
        .where(membershipTable.userId.eq(api.me.id))

        return sl.observeMany(query)
      }],
      room: ['$rootScope', 'sl', '$stateParams', async ($rootScope, sl, $stateParams) => {
        var roomId = $stateParams.roomId
        var { db, roomTable } = await sl.objects()

        var query = db.select(
          roomTable.id.as('id'),
          roomTable.name.as('name')
        )
        .from(roomTable)
        .where(roomTable.id.eq(roomId))

        return sl.observeOne(query)
      }],
      members: ['$rootScope', 'sl', '$stateParams', async ($rootScope, sl, $stateParams) => {
        var roomId = $stateParams.roomId
        var { db, userTable, membershipTable } = await sl.objects()

        var query = db.select(
          userTable.id.as('id'),
          userTable.name.as('name')
        )
        .from(membershipTable)
        .leftOuterJoin(userTable, membershipTable.userId.eq(userTable.id))
        .where(membershipTable.roomId.eq(roomId))

        return await sl.observeMany(query)
      }],
      messages: ['$rootScope', 'sl', '$stateParams', async ($rootScope, sl, $stateParams) => {
        var roomId = $stateParams.roomId
        var { db, messageTable, userTable } = await sl.objects()

        var query = db.select(
          messageTable.id.as('id'),
          messageTable.text.as('text'),
          userTable.name.as('name')
        )
        .from(messageTable)
        .leftOuterJoin(userTable, messageTable.userId.eq(userTable.id))
        .where(messageTable.roomId.eq(roomId))

        return await sl.observeMany(query)
      }]
    },
    controller: ($scope, roomId, api, myRooms, room, members, messages) => {
      $scope.roomId = roomId
      $scope.myRooms = myRooms
      $scope.room = room
      $scope.members = members
      $scope.messages = messages

      $scope.messageText = ''

      $scope.sendMessage = () => {
        var messageText = $scope.messageText
        if(messageText.length === 0) {
          return
        }

        $scope.messageText = ''

        api.sendRoomMessage(roomId, messageText)
      }
    }
  })
})
.name
