const BookmarksService = require('../src/bookmarks-service')
const makeTestBookmarks = require('./makeTestBookmarks')
const knex = require('knex')
const app = require('../src/app')

describe(`Bookmarks service object`, function() {
  let db

  let testBookmarks = makeTestBookmarks.makeTestBookmarks();

  before('make knex instance', () => {
    db = knex({
      client: 'pg',
      connection: process.env.TEST_DB_URL,
    })
  })

  before('clean the table', () => db('bookmarks').truncate())

  after('disconnect from db', () => db.destroy())

  context('database is empty', () => {
    describe(`getAllBookmarks()`, () => {
      it(`gets an empty array when trying to get all bookmarks`, () => {
        return BookmarksService.getAllBookmarks(db)
          .then(actual => {
            expect(actual).to.eql([])
          })
      })
    })

    describe(`getById()`, () => {
      it(`resolves a single bookmark from 'bookmarks' table`, () => {
        return BookmarksService.getById(db, 1)
          .then(actual => {
            expect(actual).to.eql(undefined)
          })
      })
    })
  })

  context('database has bookmarks', () => {
    before('insert test bookmarks', () => {
      return db
        .into('bookmarks')
        .insert(testBookmarks)
    })

    describe(`getAllBookmarks()`, () => {
      it(`resolves all bookmarks from 'bookmarks' table`, () => {
        return BookmarksService.getAllBookmarks(db)
          .then(actual => {
            expect(actual).to.eql(testBookmarks)
          })
      })
    })

    describe(`getById()`, () => {
      it(`resolves a single bookmark from 'bookmarks' table`, () => {
        return BookmarksService.getById(db, testBookmarks[0].id)
          .then(actual => {
            expect(actual).to.eql(testBookmarks[0])
          })
      })
    })
  })
})
