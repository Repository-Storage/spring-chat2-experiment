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

    var users = await api.getUsers()
    await dal.putUsers(users)

    for(var i = 0; i < rooms.length; ++i) {
      var room = rooms[i]
      var roomMembers = await api.getRoomMembers(room.id)
      await dal.putRoomMembers(room.id, roomMembers)

      var roomMessages = await api.getRoomMessages(room.id)
      await dal.putMessages(roomMessages)
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

    $rootScope.$on('api-message', (e, payload) => {
      dal.putMessage({
        id: payload.messageId,
        roomId: payload.roomId,
        userId: payload.userId,
        text: payload.messageText
      })
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
    },
    observeMany: async function(query) {
      await initIfNotInitialized()

      var db = (await dal.objects()).db
      var items = await query.exec()

      var handler = function(changes) {
        Array.prototype.splice.apply(items, [0, items.length].concat(changes[changes.length - 1].object))
        $rootScope.$digest()
      }

      db.observe(query, handler)

      items.unobserve = function() {
        db.unobserve(query, handler)
      }

      return items
    },
    observeOne: async function(query) {
      var db = (await dal.objects()).db
      var items = await query.exec()
      if(items.length !== 1) {
        throw 'no such item'
      }

      var item = items[0]

      var handler = function(changes) {
        var items = changes[changes.length - 1].object
        if(items.length !== 1) {
          throw 'item has disappeared'
        }

        _.assign(item, items[0])
        $rootScope.$digest()
      }

      db.observe(query, handler)

      item.unobserve = function() {
        db.unobserve(query, handler)
      }

      return item
    }
  }

})
.name
