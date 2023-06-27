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


describe('GET /api', () => {
    test('Serves up a JSON representation of all the available endpoints of the api', () => {
      return request(app)
        .get('/api')
        .expect(200)
        .then(({ body }) => {
          expect(body).toEqual(apiData)
    })
  })

    test('404 Not Found: invalid endpoint', () => {
        return request(app)
          .get('/nonsense')
          .expect(404)
          .then((res) => {
            expect(res.error).toMatchObject({ message: "cannot GET /nonsense (404)" });
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

  

