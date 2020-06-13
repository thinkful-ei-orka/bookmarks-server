const bookmarksTable = 'bookmarks';
// const bookmarksTable = 'bookmarks_test';

const BookmarksService = {
  getAllBookmarks(knex) {
    return knex.select('*').from(bookmarksTable)
  },
  getById(knex, id) {
    return knex.from(bookmarksTable).select('*').where('id', id).first()
  },
  insertBookmark(knex, newBookmark) {
    return knex
      .insert(newBookmark)
      .into(bookmarksTable)
      .returning('*')
      .then(rows => {
        return rows[0]
      })
  },
  deleteBookmark(knex, id) {
    return knex(bookmarksTable)
      .where({ id })
      .delete()
  },
  updateBookmark(knex, id, newBookmarkFields) {
    return knex(bookmarksTable)
      .where({ id })
      .update(newBookmarkFields)
  },
}

module.exports = BookmarksService
