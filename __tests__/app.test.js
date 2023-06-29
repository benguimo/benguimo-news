const request = require("supertest")
const app = require("../db/app")
const db = require("../db/connection")
const seed = require("../db/seeds/seed")
const data = require("../db/data/test-data")
const apiData = require('../endpoints.json')

beforeEach(() => {
    return seed(data)
})

afterAll(() => {
    return db.end()
})


describe('ANY: ALL non-existent path', () => {  
  test('400: Not A Path, returns custom error message when no path is found', () => {
    return request(app)
    .get('/api/notapath')
    .expect(404)
    .then(({ body }) => {
      expect(body.msg).toBe("Not Found")
    })
  })
})

describe('GET /api', () => {
    test('Serves up a JSON representation of all the available endpoints of the api', () => {
      return request(app)
        .get('/api')
        .expect(200)
        .then(({ body }) => {
          expect(body).toEqual(apiData)
    })
  })
})



describe('GET /api/topics', () => {
    test('200 OK: all topics', () => {
        return request(app)
        .get('/api/topics')
        .expect(200)
        .then(({ body }) => {
            const { topics } = body

             expect(topics).toBeInstanceOf(Object)
             expect(topics).toHaveLength(3)
             topics.forEach((topic) => {
                 expect(topic).toMatchObject({
                     description: expect.any(String),
                     slug: expect.any(String)
                 })
             })
        })
    })
  })


    describe('GET /api/articles/:article_id', () => {
      test('200 OK: matches the article given id', () => {
        return request(app)
          .get(`/api/articles/1`)
          .expect(200)
          .then(({ body }) => {
            const { article } = body
            expect(article).toHaveProperty('article_id');
            expect(article).toHaveProperty('title');
            expect(article).toHaveProperty('topic');
            expect(article).toHaveProperty('author');
            expect(article).toHaveProperty('body');
            expect(article).toHaveProperty('created_at');
            expect(article).toHaveProperty('votes');
            expect(article).toHaveProperty('article_img_url');
            });
          });
         test('400 Bad Request: error message when passed invalid article ID', () => {
              return request(app)
                .get('/api/articles/noID')
                .expect(400)
                .then(({ body }) => {
                  expect(body.msg).toBe('Bad Request');
                });
            });
          test('404 Not Found: valid api but nonexisting id', () => {
              return request(app)
              .get('/api/articles/56565')
              .expect(404)
              .then(({ body }) => {
                      expect(body.msg).toBe('Not Found');
          })
      }); 
  });

  
  describe('GET /api/articles', () => {
    test('200 OK: an articles array of article objects (including certain properties)', () => {
      return request(app)
        .get('/api/articles')
        .expect(200)
        .then(({ body }) => {
          const { articles } = body
          expect(articles).toHaveLength(13);
          articles.forEach((article) => {
            expect(article).not.toHaveProperty('body')
            expect(article).toMatchObject({
              title: expect.any(String),
              topic: expect.any(String),
              author: expect.any(String),
              created_at: expect.any(String),
              votes: expect.any(Number),
              article_img_url: expect.any(String),
              comment_count: expect.any(String)
            });
          });
        });
    });
    
  });

  describe("GET /api/articles/:article_id/comments", () => {
    test("200 OK: all comments for an article", () => {
      return request(app)
        .get("/api/articles/1/comments")
        .expect(200)
        .then(({ body }) => {
          const { comments } = body;
          expect(comments).toBeInstanceOf(Array);
          comments.forEach((comment) => {
            expect(comment).toHaveProperty("comment_id");
            expect(comment).toHaveProperty("votes");
            expect(comment).toHaveProperty("created_at");
            expect(comment).toHaveProperty("author");
            expect(comment).toHaveProperty("body");
            expect(comment).toHaveProperty("article_id");
          });
        });
    });
  
    test("404 Not Found: valid api but no ID", () => {
      return request(app)
        .get("/api/articles/99999/comments")
        .expect(404)
        .then(({ body }) => {
          expect(body.msg).toBe("Not Found");
        });
    });
  
    test("400 Bad Request: error message when passed invalid article ID", () => {
      return request(app)
        .get("/api/articles/noID/comments")
        .expect(400)
        .then(({ body }) => {
          expect(body.msg).toBe("Bad Request");
        });
    });
  });


  describe('POST /api/articles/:article_id/comments', () => {
    test('201: returns the posted comment', () => {
      return request(app)
        .post('/api/articles/1/comments')
        .send({ username: 'icellusedkars', body: 'POST: comment/article_id' })
        .expect(201)
        .then(({ body }) => {
          expect(body).toHaveProperty('comment')
          expect(body.comment).toMatchObject({
            comment_id: expect.any(Number),
            article_id: 1,
            username: 'icellusedkars',
            body: 'POST: comment/article_id',
            created_at: expect.any(String),
          })
        })
    })

    test('201: comment fully matches structure of database (all comments)', () => {
      return request(app)
        .post(`/api/articles/1/comments`)
        .send({
          body: 'POST: comment/article_id',
          username: 'butter_bridge',
        })
        .expect(201)
        .then(({ body }) => {
          expect(body.comment).toMatchObject({
            body: expect.any(String),
            votes: expect.any(Number),
            author: expect.any(String),
            article_id: expect.any(Number),
            created_at: expect.any(String),
          })
        })
    })

    test('400 Bad Request: missing fields', () => {
      return request(app)
        .post('/api/articles/1/comments')
        .send({})
        .expect(400)
        .then(({ body }) => {
          expect(body.msg).toBe('Bad Request')
        })
    })

    test('400 Bad Request: Invalid username', () => {
      return request(app)
        .post(`/api/articles/1/comments`)
        .send({
          body: 'POST: comment/article_id',
          username: 'no_valid_username',
        })
        .expect(400)
        .then((response) => {
          expect(response.body.msg).toBe('Bad Request')
        })
    })

    test('404 Not Found: valid but non-existent article id', () => {
      return request(app)
        .post(`/api/articles/999/comments`)
        .send({
          body: 'POST: comment/article_id',
          username: 'butter_bridge',
        })
        .expect(404)
        .then((response) => {
          expect(response.body.msg).toBe('Not Found')
        })
    })
    test('404 Not Found: invalid id', () => {
      return request(app)
        .post(`/api/articles/random/999/random/comments`)
        .send({
          body: 'POST: comment/article_id',
          username: 'butter_bridge',
        })
        .expect(404)
        .then((response) => {
          expect(response.body.msg).toBe('Not Found')
        })
    })
  })

  describe('PATCH: /api/articles/:article_id', () => {
    test('200 OK: adds new votes to votes in article', () => {

      return request(app)
        .patch('/api/articles/1')
        .send({inc_votes: 50})
        .expect(200)
        .then(({ body }) => {
          const { article } = body
          expect(article).toEqual({
            article_id: 1,
            title: "Living in the shadow of a great man",
            topic: "mitch",
            author: "butter_bridge",
            body: "I find this existence challenging",
            created_at: "2020-07-09T21:11:00.000Z",
            votes: 150,
            article_img_url: "https://images.pexels.com/photos/158651/news-newsletter-newspaper-information-158651.jpeg?w=700&h=700"
          })
        })
    })

    test('200 OK: takes away votes (from updated votes)', () => {
      return request(app)
        .patch(`/api/articles/1`)
        .send({ inc_votes: -50 })
        .expect(200)
        .then(({ body }) => {
          const { article } = body
          expect(article).toEqual({
            article_id: 1,
            title: 'Living in the shadow of a great man',
            topic: 'mitch',
            author: 'butter_bridge',
            body: 'I find this existence challenging',
            created_at: '2020-07-09T21:11:00.000Z',
            votes: 50,
            article_img_url: "https://images.pexels.com/photos/158651/news-newsletter-newspaper-information-158651.jpeg?w=700&h=700"
          })
        })
    })

    test('404 Not Found: valid article ID but non-existing', () => {
      return request(app)
        .patch('/api/articles/9999')
        .send({ inc_votes: 1 })
        .expect(404)
        .then(({ body }) => {
          expect(body.msg).toBe("Not Found")
        })
      })


    test('400 Bad Request: missing inc_votes', () => {
      return request(app)
        .patch('/api/articles/1')
        .send({})
        .expect(400)
        .then(({ body }) => {
          expect(body.msg).toBe('Bad Request')
        })
    })

    test('400 Bad Request: inc_votes is NaN', () => {
      return request(app)
        .patch(`/api/articles/1`)
        .send({ inc_votes: NaN })
        .expect(400)
        .then(({ body }) => {
          expect(body.msg).toBe('Bad Request')
        })
    })
  })