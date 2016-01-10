import angular from 'angular'
import uiRouterModule from 'angular-ui-router'
import apiModule from './api'

export default angular.module('app.homeState', [
  uiRouterModule,
  apiModule
])
.config($stateProvider => {
  $stateProvider.state('index', {
    url: '/',
    template: `
    <div class="col-xs-12">
      <h1>Sign in</h1>
      <form ng-submit="signIn()">
        <div class="form-group">
          <input type="text" placeholder="name" ng-model="username" class="form-control">
        </div>
        <button type="submit" class="btn btn-default">Enter</button>
      </form>
      <a ui-sref="rooms">Rooms</a>
    </div>`,
    controller: ($scope, api, $state) => {
      $scope.username = ''

      $scope.signIn = async () => {
        var username = $scope.username
        if(!username) {
          return
        }

        console.log('sign in as', username)
        await api.authenticate(username)

        console.log('authenticated')
        $state.go('rooms')
      }
    }
  })
})
.name
