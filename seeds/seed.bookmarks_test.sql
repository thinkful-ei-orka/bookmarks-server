INSERT INTO bookmarks_test (title, url, description, rating)
VALUES
  ('Yahoo', 'https://www.yahoo.com', 'lorem ipsum', 4),
  ('Google', 'https://www.google.com', 'lorem ipsum', 5),
  ('Bing', 'https://www.bing.com', 'lorem ipsum', 4);

/*
psql -U dunder_mifflin -d knex-practice -f ./seeds/seed.bookmarks_test.sql
*/
