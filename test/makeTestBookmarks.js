function makeTestBookmarks() {
  return [
    {
      id: 1,
      title: 'Yahoo',
      url: 'https://www.yahoo.com',
      description: 'lorem ipsum',
      rating: 4
    },
    {
      id: 2,
      title: 'Google',
      url: 'https://www.google.com',
      description: 'lorem ipsum',
      rating: 5
    },
    {
      id: 3,
      title: 'Bing',
      url: 'https://www.bing.com',
      description: 'lorem ipsum',
      rating: 4
    }
  ]
}

module.exports = {
  makeTestBookmarks
}
