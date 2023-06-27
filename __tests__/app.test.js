const request = require("supertest")
const app = require("../db/app")
const db = require("../db/connection")
const seed = require("../db/seeds/seed")
const data = require("../db/data/test-data")

beforeEach(() => {
    return seed(data)
})

afterAll(() => {
    return db.end()
})


describe('GET /api', () => {
    test('Serves up a JSON representation of all the available endpoints of the api', () => {
      request(app)
        .get('/api')
        .expect(200)
        .then((response) => {
            const { body } = response;
            const { endpoints } = body
          expect(endpoints).toBeInstanceOf(Object)
          expect(Object.keys(endpoints)).toHaveLength(3)

          expect(endpoints['GET /api']).toMatchObject({
            description: expect.any(String),
          });
  
          expect(endpoints['GET /api/topics']).toMatchObject({
            description: expect.any(String),
            queries: expect.any(Array),
            exampleResponse: expect.any(Object),
          });
  
          expect(endpoints['GET /api/articles']).toMatchObject({
            description: expect.any(String),
            queries: expect.any(Array),
            exampleResponse: expect.any(Object),
          });
        })
    });
  });
  
  describe('GET/API (ERROR)', () => {

      test('404 Not Found: invalid endpoint', () => {
        return request(app)
          .get('/nonsense')
          .expect(404)
      });
    });




describe('GET/API/TOPICS', () => {
    test('200 OK: all topics', () => {
        return request(app)
        .get('/api/topics')
        .expect(200)
        .then(({body}) => {
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



describe('GET /api/topics (ERROR)', () => {
    test('404 Not Found: invalid route', () => {
      return request(app)
        .get('/api/invalid')
        .expect(404);
    })
})
  