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
      expect(body.msg).toBe("Not found")
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
            expect(article).toHaveProperty('article_id')
            expect(article).toHaveProperty('title')
            expect(article).toHaveProperty('topic')
            expect(article).toHaveProperty('author')
            expect(article).toHaveProperty('body')
            expect(article).toHaveProperty('created_at')
            expect(article).toHaveProperty('votes')
            expect(article).toHaveProperty('article_img_url')
            })
          })
         test('400 Bad Request: error message when passed invalid article ID', () => {
              return request(app)
                .get('/api/articles/noID')
                .expect(400)
                .then(({ body }) => {
                  expect(body.msg).toBe('Bad Request')
                })
            })
          test('404 Not Found: valid api but nonexisting id', () => {
              return request(app)
              .get('/api/articles/56565')
              .expect(404)
              .then(({ body }) => {
                      expect(body.msg).toBe('Not Found')
          })
      }) 
  })

  
  describe('GET /api/articles', () => {
    test('200 OK: an articles array of article objects (including certain properties)', () => {
      return request(app)
        .get('/api/articles')
        .expect(200)
        .then(({ body }) => {
          const { articles } = body
          expect(articles).toHaveLength(13)
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
            })
          })
        })
    })
    
  })

  describe("GET /api/articles/:article_id/comments", () => {
    test('200 OK: empty array when article_id is valid but has no comments', () => {
      return request(app)
        .get('/api/articles/2/comments')
        .expect(200)
        .then((response) => {
          expect(response.body.comments).toEqual(expect.any(Array));
        });
        })

    test("200 OK: all comments for an article", () => {
      return request(app)
        .get("/api/articles/1/comments")
        .expect(200)
        .then(({ body }) => {
          const { comments } = body
          expect(comments).toBeInstanceOf(Array)
          expect(comments).toHaveLength(11) 
          
          comments.forEach((comment) => {
            expect(comment).toHaveProperty("comment_id")
            expect(comment).toHaveProperty("body")
            expect(comment).toHaveProperty("votes")
            expect(comment).toHaveProperty("author")
            expect(comment).toHaveProperty("article_id")
            expect(comment).toHaveProperty("created_at")

            expect(comment).toMatchObject({
              comment_id: expect.any(Number),
              body:  expect.any(String),
              votes: expect.any(Number),
              author: expect.any(String),
              article_id: expect.any(Number),
              created_at: expect.any(String)
            })
          })
      })
  })
  test('200 OK: comments served with the most recent comments first.', () => {
    return request(app)
      .get('/api/articles/1/comments')
      .expect(200)
      .then(({ body }) => {
        const { comments } = body;
        expect(comments[0].created_at).toBe("2020-11-03T21:00:00.000Z");
        expect(comments[comments.length - 1].created_at).toBe("2020-01-01T03:08:00.000Z");
      });
  })

    test("404 Not Found: valid api but no ID", () => {
      return request(app)
        .get("/api/articles/99999/comments")
        .expect(404)
        .then(({ body }) => {
          expect(body.msg).toBe("Not Found")
        })
    })
  
    test("400 Bad Request: error message when passed invalid article ID", () => {
      return request(app)
        .get("/api/articles/noID/comments")
        .expect(400)
        .then(({ body }) => {
          expect(body.msg).toBe("Bad Request")
        })
    })
  })