const { v4: uuid } = require('uuid');
const bookmarksRouter = require('express').Router();
const logger = require('./logger');

const bookmarks = [
    {
        id: "1",
        title: "Yahoo",
        url: "https://www.yahoo.com",
        desc: "lorem ipsum",
        rating: 5
    }
]

bookmarksRouter
    .route('/bookmarks')
    .get((req,res)=>{
        res.json(bookmarks);
    })
    .post((req,res)=>{
        console.log(req.body);
        const { title, url, desc, rating } = req.body;

        if (!title) {
            logger.error('Title is required');
            return res
                .status(400)
                .send('Invalid data');
        }

        if (!url) {
            logger.error('Url is required');
            return res
                .status(400)
                .send('Invalid data');
        }

        if (!desc) {
            logger.error('Description is required');
            return res
                .status(400)
                .send('Invalid data');
        }

        if (!rating) {
            logger.error('Rating is required');
            return res
                .status(400)
                .send('Invalid data');
        }

        const id = uuid();

        const bookmark = {
            id,
            title,
            url,
            desc,
            rating
        }

        bookmarks.push(bookmark);

        logger.info(`Bookmark with id ${id} created`);

        res
            .status(201)
            .location(`http://localhost:8000/bookmarks`)
            .json({id});
    })

bookmarksRouter
    .route('/bookmarks/:id')
    .get((req,res)=>{
        // res.json(bookmarks);
        const { id } = req.params;
        const bookmark = bookmarks.find(bookmark => bookmark.id === id);

        if (!bookmark) {
            logger.error(`Bookmark with id ${id} not found.`);
            return res
                .status(404)
                .send('Bookmark not found');
        }

        res.json(bookmark);
    })
    .delete((req, res) => {
        const { id } = req.params;
        const bookmarkIndex = bookmarks.findIndex(bookmark => bookmark.id === id);

        if (bookmarkIndex === -1) {
            logger.error(`Bookmark with id ${id} not found.`);
            return res
                .status(404)
                .send('Not Found');
        }

        bookmarks.splice(bookmarkIndex, 1);

        logger.info(`Bookmark with id ${id} deleted.`);
        res
            .status(204)
            .end();
    });

module.exports = bookmarksRouter;
