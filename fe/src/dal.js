import angular from 'angular'
import lf from 'lovefield'

export default angular.module('app.dal', [])
.factory('dal', function($rootScope) {

  var db
  var roomTable
  var userTable
  var membershipTable
  var messageTable
  async function initIfNotInitialized() {
    if(db) {
      return
    }

    var schemaBuilder = lf.schema.create('chat', 1)
    schemaBuilder.createTable('Room')
      .addColumn('id', lf.Type.INTEGER)
      .addColumn('name', lf.Type.STRING)
      .addPrimaryKey(['id'])
    schemaBuilder.createTable('User')
      .addColumn('id', lf.Type.INTEGER)
      .addColumn('name', lf.Type.STRING)
      .addPrimaryKey(['id'])
    schemaBuilder.createTable('Membership')
      .addColumn('roomId', lf.Type.INTEGER)
      .addColumn('userId', lf.Type.INTEGER)
      /*.addForeignKey('fkRoomId', {
        local: 'roomId',
        ref: 'Room.id'
      })
      .addForeignKey('fkUserId', {
        local: 'userId',
        ref: 'User.id'
      })*/
      .addPrimaryKey(['roomId', 'userId'])
    schemaBuilder.createTable('Message')
      .addColumn('id', lf.Type.INTEGER)
      .addColumn('userId', lf.Type.INTEGER)
      .addColumn('roomId', lf.Type.INTEGER)
      .addColumn('text', lf.Type.STRING)
      .addPrimaryKey(['id'])
      .addForeignKey('fkMessageUserId', {
        local: 'userId',
        ref: 'User.id'
      })
      .addForeignKey('fkMessageRoomId', {
        local: 'roomId',
        ref: 'Room.id'
      })

    db = await schemaBuilder.connect({
      storeType: lf.schema.DataStoreType.MEMORY
    })

    roomTable = db.getSchema().table('Room')
    userTable = db.getSchema().table('User')
    membershipTable = db.getSchema().table('Membership')
    messageTable = db.getSchema().table('Message')
  }

  return {
    putRooms: async function(rooms) {
      await initIfNotInitialized()
      var roomRows = rooms.map(roomTable.createRow, roomTable)
      await db.insertOrReplace().into(roomTable).values(roomRows).exec()
    },
    putRoom: async function(room) {
      await initIfNotInitialized()
      await this.putRooms([room])
    },
    deleteRoom: async function(roomId) {
      await initIfNotInitialized()
      await db.delete().from(roomTable).where(roomTable.id.eq(roomId)).exec()
    },

    putUsers: async function(users) {
      await initIfNotInitialized()
      var userRows = users.map(userTable.createRow, userTable)
      await db.insertOrReplace().into(userTable).values(userRows).exec()
    },
    putUser: async function(user) {
      await initIfNotInitialized()
      await this.putUsers([user])
    },

    putRoomMembers: async function(roomId, users) {
      await initIfNotInitialized()
      var memberRows = users.map(u => membershipTable.createRow({
        roomId: roomId,
        userId: u.id
      }))
      await db.insertOrReplace().into(membershipTable).values(memberRows).exec()
    },
    putRoomMember: async function(roomId, userId) {
      await initIfNotInitialized()
      await db.insertOrReplace().into(membershipTable).values([
        membershipTable.createRow({
          roomId: roomId,
          userId: userId
        })
      ]).exec()
    },
    deleteRoomMember: async function(roomId, userId) {
      await initIfNotInitialized()
      await db.delete().from(membershipTable).where(lf.op.and(
        membershipTable.roomId.eq(roomId),
        membershipTable.userId.eq(userId)
      )).exec()
    },

    putMessages: async function(messages) {
      await initIfNotInitialized()
      var messageRows = messages.map(m => messageTable.createRow({
        id: m.id,
        userId: m.userId,
        roomId: m.roomId,
        text: m.text
      }))
      await db.insertOrReplace().into(messageTable).values(messageRows).exec()
    },
    putMessage: async function(message) {
      await initIfNotInitialized()
      await this.putMessages([message])
    },

    dump: async function() {
      console.log(await db.export())
    },

    objects: async function() {
      await initIfNotInitialized()
      return {
        db: db,
        roomTable: roomTable,
        userTable: userTable,
        membershipTable: membershipTable,
        messageTable: messageTable,
        lf: lf
      }
    }
  }
})
.name
