import angular from 'angular'
import apiModule from './api'
import dalModule from './dal'

export default angular.module('app.sl', [
  apiModule,
  dalModule
])
.factory('sl', ($rootScope, api, dal) => {

  var initialized = false
  async function initIfNotInitialized() {
    if(initialized) {
      return
    }

    var rooms = await api.getRooms()
    await dal.putRooms(rooms)

    for(var i = 0; i < rooms.length; ++i) {
      var room = rooms[i]
      var roomMembers = await api.getRoomMembers(room.id)
      await dal.putUsers(roomMembers)
      await dal.putRoomMembers(room.id, roomMembers)
    }

    await dal.dump()

    $rootScope.$on('api-roomCreated', (e, payload) => {
      dal.putRoom(payload)
    })

    $rootScope.$on('api-roomUpdated', (e, payload) => {
      dal.putRoom(payload)
    })

    $rootScope.$on('api-roomDeleted', (e, payload) => {
      dal.deleteRoom(payload.id)
    })

    $rootScope.$on('api-userJoinedRoom', (e, payload) => {
      dal.putRoomMember(payload.roomId, payload.userId)
    })

    $rootScope.$on('api-userLeftRoom', (e, payload) => {
      dal.deleteRoomMember(payload.roomId, payload.userId)
    })

    initialized = true
  }

  return {
    rooms: async function() {
      await initIfNotInitialized()
      return await dal.rooms()
    },
    objects: async function() {
      await initIfNotInitialized()
      return await dal.objects()
    }
  }

})
.name
