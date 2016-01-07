import SockJS from 'sockjs-client'
import { Stomp } from 'stompjs/lib/stomp.js'
import angular from 'angular'
import URITemplate from 'urijs/src/URITemplate'

export default angular.module('app.api', [])
.config($httpProvider => {
  $httpProvider.interceptors.push('apiHttpInterceptor')
})
.factory('apiHttpInterceptor', ($q, $injector) => {
  return {
    responseError: response => {
      var status = response.status;
      if(status === 401) {
        console.log('got 401')
        $injector.get('$state').go('index')
      }
      return $q.reject(response)
    }
  }
})
.factory('api', ($http, $q, $rootScope) => {
  var apiRootUrl = 'http://localhost:8080/api'
  var wsUrl = 'http://localhost:8080/ws'

  function makeUrl(path, params) {
    return apiRootUrl + URITemplate(path).expand(params)
  }

  return {
    authenticate: async function(username) {
      var usernameColonPassword = username + ':' + 'qwerty'
      var base64EncodedUsernameColonPassword = btoa(usernameColonPassword)
      var authorizationHeaderValue = 'Basic ' + base64EncodedUsernameColonPassword

      var response = await $http.get(makeUrl('/me'), {
        headers: {
          Authorization: authorizationHeaderValue
        }
      })

      var body = response.data;
      this.me = {
        id: body.userId,
        name: body.username
      }

      $http.defaults.headers.common.Authorization = authorizationHeaderValue

      var socket = new SockJS(wsUrl)
      var stompClient = Stomp.over(socket)
      await new Promise(resolve => {
        stompClient.connect({}, frame => {
          var subscription = stompClient.subscribe('/notifications', notification => {
            var body = JSON.parse(notification.body)
            var notificationType = body.type
            var notificationPayload = body
            $rootScope.$apply(() => {
              $rootScope.$broadcast('api-' + notificationType, notificationPayload)
            })
          })

          resolve(subscription)
        })
      })
    },
    deauthenticate: async function() {
      this.me = undefined;

      $http.defaults.headers.common.Authorization = undefined;
    },
    getMe: async function() {
      var response = await $http.get(makeUrl('/me'))
      return response.data
    },
    getUsers: async function() {
      var response = await $http.get(makeUrl('/users'))
      return response.data
    },
    getRooms: async function() {
      var response = await $http.get(makeUrl('/rooms'))
      return response.data
    },
    createRoom: async function(room) {
      var response = await $http.post(makeUrl('/rooms'), {
          name: room.name
      })
      return response.data
    },
    updateRoom: async function(roomId, room) {
      var response = await $http.put(makeUrl('/rooms/{id}', { id: roomId }), {
          name: room.name
      })
      return response.data
    },
    deleteRoom: async function(roomId) {
      var response = $http.delete(makeUrl('/rooms/{id}', { id: roomId }))
      return response.data
    },
    getRoomMembers: async function(roomId) {
      var response = await $http.get(makeUrl('/rooms/{id}/members', { id: roomId }))
      return response.data
    },
    joinRoom: async function(roomId) {
      var userId = this.me.id
      var response = await $http.put(makeUrl('/rooms/{roomId}/members/{userId}', { roomId: roomId, userId: userId }), {})
      return response.data
    },
    leaveRoom: async function(roomId) {
      var userId = this.me.id
      var response = await $http.delete(makeUrl('/rooms/{roomId}/members/{userId}', { roomId: roomId, userId: userId }), {})
      return response.data
    },
    getRoomMessages: async function(roomId) {
      var response = await $http.get(makeUrl('/rooms/{id}/messages', { id: roomId }))
      return response.data
    },
    sendRoomMessage: async function(roomId, text) {
      var response = await $http.post(makeUrl('/rooms/{id}/messages', { id: roomId }), {
        text: text
      })
      return response.data
    }
  };
})
.name
