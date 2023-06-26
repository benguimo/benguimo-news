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

describe('GET/API', () => {
    test('200 OK: message', () => {
        return request(app)
        .get('/api')
        .expect(200)
        .then(({body}) => {
            expect(body.msg).toBe("All OK")
        })
    })
})

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
  