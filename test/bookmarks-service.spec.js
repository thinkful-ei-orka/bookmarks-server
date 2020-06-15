// const BookmarksService = require('../src/bookmarks-service')
const makeTestBookmarks = require('./makeTestBookmarks')
const knex = require('knex')
const app = require('../src/app')
const { expect } = require('chai')

describe(`Bookmarks service object`, function() {
  let db

  let testBookmarks = makeTestBookmarks.makeTestBookmarks();

  before('make knex instance', () => {
    db = knex({
      client: 'pg',
      connection: process.env.TEST_DB_URL,
    })
    app.set('db', db)
  })

  before('clean the table', () => db('bookmarks').truncate())

  after('disconnect from db', () => db.destroy())

  context('database is empty', () => {
    describe(`GET /api/bookmarks`, () => {
      it(`gets an empty array when trying to get all bookmarks`, () => {
        return supertest(app)
          .get('/api/bookmarks')
          .set('Authorization', `Bearer ${process.env.API_TOKEN}`)
          .expect(200, [])
      })
    })

    describe(`GET /api/bookmarks/:id`, () => {
      it(`returns an error for a bookmark that does not exist`, () => {
        return supertest(app)
          .get('/api/bookmarks/1')
          .set('Authorization', `Bearer ${process.env.API_TOKEN}`)
          .expect(404, {"error":{"message":"Bookmark not found"}})
      })
    })

    describe('DELETE /api/bookmarks/:id', () => {
      it(`gets undefined for a bookmark that does not exist`, () => {
        return supertest(app)
          .delete('/api/bookmarks/1')
          .set('Authorization', `Bearer ${process.env.API_TOKEN}`)
          .expect(404, {"error":{"message":"Bookmark not found"}})
      })
    })

    describe('PATCH /api/bookmarks/:id', () => {
      it(`gets undefined for a bookmark that does not exist`, () => {
        return supertest(app)
          .patch('/api/bookmarks/1')
          .set('Authorization', `Bearer ${process.env.API_TOKEN}`)
          .expect(404, {"error":{"message":"Bookmark not found"}})
      })
    })
  })

  context('database has bookmarks', () => {
    before('insert test bookmarks', () => {
      return db
        .into('bookmarks')
        .insert(testBookmarks)
    })

    after('clean the table', () => db('bookmarks').truncate())

    describe(`GET /api/bookmarks`, () => {
      it(`resolves all bookmarks from 'bookmarks' table`, () => {
        return supertest(app)
          .get('/api/bookmarks')
          .set('Authorization', `Bearer ${process.env.API_TOKEN}`)
          .expect(200, testBookmarks)
      })
    })

    describe(`GET /api/bookmarks/:id`, () => {
      it(`resolves a single bookmark from 'bookmarks' table`, () => {
        return supertest(app)
          .get(`/api/bookmarks/${testBookmarks[0].id}`)
          .set('Authorization', `Bearer ${process.env.API_TOKEN}`)
          .expect(200, testBookmarks[0])
      })
    })

    describe('DELETE /api/bookmarks/:id', () => {
      it(`removes a bookmark that does exist`, () => {
        return supertest(app)
          .delete(`/api/bookmarks/${testBookmarks[0].id}`)
          .set('Authorization', `Bearer ${process.env.API_TOKEN}`)
          .expect(204)
          .then(() => {
            supertest(app)
              .get(`/api/bookmarks/${testBookmarks[0].id}`)
              .set('Authorization', `Bearer ${process.env.API_TOKEN}`)
              .expect(404, {"error":{"message":"Bookmark not found"}})
          })
      })
    })

    describe('PATCH /api/bookmarks/:id', () => {
      it(`requires the bookmark ID be supplied as a URL param`, () => {
        return supertest(app)
          .patch(`/api/bookmarks/`)
          .set('Authorization', `Bearer ${process.env.API_TOKEN}`)
          .send({title: 'Updated Title'})
          .expect(404)
      })

      it(`responds with a 400 when no values are supplied`, () => {
        return supertest(app)
          .patch(`/api/bookmarks/${testBookmarks[1].id}`)
          .set('Authorization', `Bearer ${process.env.API_TOKEN}`)
          .send()
          .expect(400)
      })

      it(`returns a 204 and updates the bookmark`, () => {
        return supertest(app)
          .patch(`/api/bookmarks/${testBookmarks[1].id}`)
          .set('Authorization', `Bearer ${process.env.API_TOKEN}`)
          .send({title: 'Updated Title'})
          .expect(204)
          .then(
            supertest(app)
              .get(`/api/bookmarks/${testBookmarks[1].id}`)
              .set('Authorization', `Bearer ${process.env.API_TOKEN}`)
              .expect(200)
              .expect(res => {
                expect(res.body.title).to.eql('Updated Title')
              })
          )
      })

      it(`expects the updated bookmark to have the updated title`, () => {
        return supertest(app)
          .get(`/api/bookmarks/${testBookmarks[1].id}`)
          .set('Authorization', `Bearer ${process.env.API_TOKEN}`)
          .expect(200)
          .expect(res => {
            expect(res.body.title).to.eql('Updated Title')
          })
      })
    })
  })

  describe('POST /api/bookmarks', () => {
    afterEach('clean the table', () => db('bookmarks').truncate())

    it(`makes sure each field returns the original query`, () => {
      let testBookmark = {
        id: 1,
        title: 'Test Bookmark',
        url: 'https://www.testbookmark.com',
        description: 'lorem ipsum',
        rating: 3
      }

      return supertest(app)
        .post('/api/bookmarks')
        .set('Authorization', `Bearer ${process.env.API_TOKEN}`)
        .send(testBookmark)
        .expect(201, testBookmark)
        .expect(res => {
          expect(res.body.title).to.eql(testBookmark.title)
          expect(res.body.url).to.eql(testBookmark.url)
          expect(res.body.description).to.eql(testBookmark.description)
          expect(res.body.rating).to.eql(testBookmark.rating)
          expect(res.body).to.have.property('id')
        })
    })

    it('checks for a title', () => {
      let testBookmark = {
        id: 1,
        url: 'https://www.testbookmark.com',
        description: 'lorem ipsum',
        rating: 3
      }

      return supertest(app)
        .post('/api/bookmarks')
        .set('Authorization', `Bearer ${process.env.API_TOKEN}`)
        .send(testBookmark)
        .expect(400, "'title' is required")
    })

    it('checks for a url', () => {
      let testBookmark = {
        id: 1,
        title: 'Test Bookmark',
        description: 'lorem ipsum',
        rating: 3
      }

      return supertest(app)
        .post('/api/bookmarks')
        .set('Authorization', `Bearer ${process.env.API_TOKEN}`)
        .send(testBookmark)
        .expect(400, "'url' is required")
    })

    it('checks for a rating', () => {
      let testBookmark = {
        id: 1,
        title: 'Test Bookmark',
        url: 'https://www.testbookmark.com',
        description: 'lorem ipsum',
      }

      return supertest(app)
        .post('/api/bookmarks')
        .set('Authorization', `Bearer ${process.env.API_TOKEN}`)
        .send(testBookmark)
        .expect(400, "'rating' is required")
    })

    it('checks that rating is in between 1 and 5', () => {
      let testBookmark = {
        id: 1,
        title: 'Test Bookmark',
        url: 'https://www.testbookmark.com',
        description: 'lorem ipsum',
        rating: 7
      }

      return supertest(app)
        .post('/api/bookmarks')
        .set('Authorization', `Bearer ${process.env.API_TOKEN}`)
        .send(testBookmark)
        .expect(400, "'rating' must be a number between 0 and 5")
    })

    it(`makes sure appropriate fields get sanitized`, () => {
      const maliciousBookmark = {
        id: 5,
        title: 'Naughty naughty very naughty <script>alert("xss");</script>',
        url: 'https://www.badsite.com',
        description: `Bad image <img src="https://url.to.file.which/does-not.exist" onerror="alert(document.cookie);">. But not <strong>all</strong> bad.`,
        rating: 1,
      }

      before('insert malicious article', () => {
        return db
          .into('blogful_articles')
          .insert([ maliciousBookmark ])
      })

      const expectedBookmark = {
        ...maliciousBookmark,
        title: 'Naughty naughty very naughty &lt;script&gt;alert(\"xss\");&lt;/script&gt;',
        description: `Bad image <img src="https://url.to.file.which/does-not.exist">. But not <strong>all</strong> bad.`
      }

      it('removes XSS attack content', () => {
        return supertest(app)
          .get(`/api/bookmarks/${maliciousBookmark.id}`)
          .expect(200)
          .expect(res => {
            expect(res.body.title).to.eql('Naughty naughty very naughty &lt;script&gt;alert(\"xss\");&lt;/script&gt;')
            expect(res.body.content).to.eql(`Bad image <img src="https://url.to.file.which/does-not.exist">. But not <strong>all</strong> bad.`)
          })
      })
    })
  })
})
