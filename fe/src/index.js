import 'bootstrap/dist/css/bootstrap.css'

import 'babel-polyfill'
import angular from 'angular'
import uiRouterModule from 'angular-ui-router'

import homeStateModule from './homeState'
import appStateModule from './appState'
import roomStateModule from './roomState'
import roomsStateModule from './roomsState'

angular.module('app', [
  uiRouterModule,
  homeStateModule,
  appStateModule,
  roomStateModule,
  roomsStateModule
])
.config($urlRouterProvider => {
  $urlRouterProvider.otherwise('/')
})
