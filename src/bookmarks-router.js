// const { v4: uuid } = require('uuid');
const express = require('express')
const xss = require('xss')
const logger = require('./logger');
const BookmarksService = require('./bookmarks-service')

const bookmarksRouter = express.Router();
const bodyParser = express.json()

const serializeBookmark = bookmark => ({
    id: bookmark.id,
    title: xss(bookmark.title),
    url: bookmark.url,
    description: xss(bookmark.description),
    rating: Number(bookmark.rating),
})

bookmarksRouter
    .route('/bookmarks')
    .get((req,res,next)=>{
        BookmarksService.getAllBookmarks(req.app.get('db'))
            .then(bookmarks => {
                res.json(bookmarks.map(serializeBookmark))
            })
            .catch(next);
    })
    .post((req,res,next)=>{
        const { id, title, url, description, rating } = req.body;

        for (const field of ['title', 'url', 'description', 'rating']) {
            if (!req.body[field]) {
              logger.error(`${field} is required`)
              return res.status(400).send(`'${field}' is required`)
            }
        }

        if (!Number.isInteger(rating) || rating < 0 || rating > 5) {
            logger.error(`Invalid rating '${rating}' supplied`)
            return res.status(400).send(`'rating' must be a number between 0 and 5`)
        }

        const bookmark = {
            id,
            title,
            url,
            description,
            rating
        }

        BookmarksService.insertBookmark(req.app.get('db'), bookmark)
            .then(bookmark => {
                logger.info(`Card with id ${bookmark.id} created.`)
                res
                    .status(201)
                    .location(`/bookmarks/${bookmark.id}`)
                    .json(serializeBookmark(bookmark))
            })
            .catch(next)
    })

bookmarksRouter
    .route('/bookmarks/:id')
    .all((req, res, next) => {
        const { id } = req.params
        BookmarksService.getById(req.app.get('db'), id)
            .then(bookmark => {
                if (!bookmark) {
                    logger.error(`Bookmark with id ${id} not found.`)
                    return res.status(404).json({
                        error: { message: 'Bookmark not found' }
                    })
                }
                res.bookmark = bookmark
                next()
            })
            .catch(next)
    })
    .get((req,res)=>{
        res.json(serializeBookmark(res.bookmark))
    })
    .delete((req, res, next) => {
        const { id } = req.params;

        BookmarksService.deleteBookmark(req.app.get('db'), id)
            .then(() => {
                logger.info(`Bookmark with id ${id} deleted.`)
                res.status(204).end()
            })
            .catch(next)
    });

module.exports = bookmarksRouter;
