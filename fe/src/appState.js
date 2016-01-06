import angular from 'angular'
import uiRouterModule from 'angular-ui-router'
import slModule from './sl'

export default angular.module('app.appState', [
  uiRouterModule,
  slModule
])
.config($stateProvider => {
  $stateProvider
  .state('app', {
    abstract: true,
    template: `
    <ui-view></ui-view>`,
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

        var rooms = await query.exec()
        db.observe(query, async function(changes) {
          Array.prototype.splice.apply(rooms, [0, rooms.length].concat(changes[changes.length - 1].object))
          $rootScope.$digest()
        })
        return rooms
      }]
    }
  })
})
.name
