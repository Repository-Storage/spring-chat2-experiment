import 'bootstrap/dist/css/bootstrap.css'
import './app.css'
import './index.html'

import 'babel-polyfill'
import angular from 'angular'
import uiRouterModule from 'angular-ui-router'

import homeStateModule from './homeState'
import roomStateModule from './roomState'
import roomsStateModule from './roomsState'

angular.module('app', [
  uiRouterModule,
  homeStateModule,
  roomStateModule,
  roomsStateModule
])
.config($urlRouterProvider => {
  $urlRouterProvider.otherwise('/')
})
