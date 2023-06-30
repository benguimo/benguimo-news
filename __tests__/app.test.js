const request = require("supertest")
const app = require("../app")
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
        .send({ username: 'butter_bridge', body: 'POST: comment/article_id' })
        .expect(201)
        .then(({ body }) => {
          expect(body[0]).toEqual(
            expect.objectContaining({
              comment_id: 19,
              body: 'POST: comment/article_id',
              votes: 0,
              author: expect.any(String),
              article_id: 1,
              created_at: expect.any(String),
            })
          );

        });
        })


        test('201: ignores the unnecessary property', () => {
          return request(app)
            .post('/api/articles/1/comments')
            .send({
              username: 'butter_bridge',
              body: 'POST: comment/article_id',
              ignoreThis: 'not to be posted',
            })
            .expect(201)
            .then(({ body }) => {
              expect(body[0]).toEqual(
                expect.objectContaining({
                  comment_id: 19,
                  body: 'POST: comment/article_id',
                  votes: 0,
                  author: expect.any(String),
                  article_id: 1,
                  created_at: expect.any(String),
                })
              );
              expect(body[0]).not.toHaveProperty('ignoreThis');
            });
        })


        test('400 Bad Request: invalid properties', () => {
          return request(app)
            .post('/api/articles/1/comments')
            .send({random: 'butter_bridge', head: "POST: comment/article_id",})
            .expect(400)
            .then(({ body }) => {
              expect(body.msg).toBe('Bad Request')
            })
        })

        test('404 Not Found: valid but non-existing ID', () => {
          return request(app)
            .post('/api/articles/999/comments')
            .send({ username: 'butter_bridge', body: 'POST: comment/article_id' })
            .expect(404)
            .then(({ body }) => {
              expect(body.msg).toBe('Not Found');
            })
        })


        test('400 Bad Request: invalid id (non-existing)', () => {
          return request(app)
            .post('/api/articles/not-an-ID/comments')
            .send({ username: 'butter_bridge', body: 'POST: comment/article_id' })
            .expect(400)
            .then(({ body }) => {
              expect(body.msg).toBe('Bad Request')
            })
        })


        test('400 Bad Request: returns missing fields', () => {
          return request(app)
            .post('/api/articles/1/comments')
            .send({ username: 'butter_bridge' })
            .expect(400)
            .then(({ body }) => {
              expect(body.msg).toBe('Bad Request')
            })
        })
        test('400: Invalid username', () => {
          return request(app)
            .post(`/api/articles/1/comments`)
            .send({
              body: 'Testing POST comment for article Id',
              username: '',
            })
            .expect(400)
            .then(({ body }) => {
              expect(body.msg).toBe('Bad Request')
            })
  })
  })

  describe('PATCH: /api/articles/:article_id', () => {
    test('201: adds new votes to votes in article', () => {
      return request(app)
        .patch('/api/articles/1')
        .send({inc_votes: 50})
        .expect(201)
        .then(({ body }) => {
          const { article } = body
          expect(article.votes).toBe(150)
        })
    })

    test('201: takes away votes (from updated votes)', () => {
      return request(app)
        .patch(`/api/articles/1`)
        .send({ inc_votes: -50 })
        .expect(201)
        .then(({ body }) => {
          const { article } = body
          expect(article.votes).toBe(50)
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

    test('400 Bad Request: article ID not valid', () => {
      return request(app)
        .patch('/api/articles/not-an-ID')
        .send({ inc_votes: 999 })
        .expect(400)
        .then(({ body }) => {
          expect(body.msg).toBe('Bad Request');
        });
    });
})



describe('DELETE /api/comment/comment_id', () => {

  test("204: deleted successfully", () => {
    return request(app).delete('/api/comments/1').expect(204) 
      .then(({ body }) => {
      expect(body).toEqual({});
    });
  })

    test('400 Bad Request: comment ID is not valid', () => {
      return request(app)
        .delete('/api/comments/not-an-ID')
        .expect(400)
        .then(({ body }) => {
          expect(body.msg).toBe('Bad Request')
        })
    })

    test('404 Not Found: valid comment ID but no resource found', () => {
      return request(app)
        .delete(`/api/comments/999`)
        .expect(404)
        .then(({ body }) => {
          expect(body.msg).toBe('Not Found')
        })
    })
  })

  describe('GET /api/users', () => {
    test('200 OK: users block is an array', () => {
      return request(app)
        .get('/api/users')
        .expect(200)
        .then(({ body }) => {
          expect(body).toHaveProperty('users')
          expect(Array.isArray(body.users)).toBe(true)
        })
    })

    test('200 OK: returns all users with properties (username, name, avatar)', () => {
      return request(app)
        .get('/api/users')
        .expect(200)
        .then(({ body }) => {
          const { users } = body

          expect(users).toHaveLength(4)
          expect(Array.isArray(users)).toBe(true)

          users.forEach((user) => {
            expect(user).toMatchObject({
              username: expect.any(String),
              name: expect.any(String),
              avatar_url: expect.any(String)
            })
          })
        })
      })
    })









    describe('1. GET api/articles?sort_by', () => {
      test('200 OK: returns -> SORT BY DESC (author)', () => {
        return request(app)
          .get('/api/articles?sort_by=author')
          .expect(200)
          .then(({ body }) => {
            const { articles } = body
            expect(articles).toBeSortedBy('author', { descending: true });
          })
      })


      test('200 OK: returns -> SORT BY DESC (title)', () => {
        return request(app)
          .get('/api/articles?sort_by=title')
          .expect(200)
          .then(({ body }) => {
            const { articles } = body
            expect(articles).toBeSortedBy('title', { descending: true })
          })
      })


      test('200 OK: returns -> SORT BY DESC (created_at)', () => {
        return request(app)
          .get('/api/articles')
          .expect(200)
          .then(({ body }) => {
            expect(body.articles).toBeSortedBy('created_at', { descending: true })
          })
      })


      test('400 Bad Request: invalid SORT BY', () => {
        return request(app)
          .get('/api/articles?sort_by=none')
          .expect(400)
          .then(({ body }) => {
            expect(body.msg).toBe('Bad request')
          })
      })
    })





    describe('2. GET api/articles?order=ASC', () => {
      test('200 OK: returns list -> ORDER BY ASC', () => {
        return request(app)
          .get('/api/articles?order=asc')
          .expect(200)
          .then(({ body }) => {
            const { articles } = body
            expect(articles).toBeSortedBy('created_at', { ascending: true })
          })
      })


      test('400 Bad Request: invalid ORDER BY ', () => {
        return request(app)
          .get('/api/articles?order=none')
          .expect(400)
          .then(({ body }) => {
            expect(body.msg).toBe('Bad request')
          })
      })
    })





    describe('3. GET api/articles?topic= <topic>', () => {
      test('200 OK: empty array -> valid topic but non-existing articles', () => {
        return request(app)
          .get('/api/articles?topic=paper')
          .expect(200)
          .then(({ body }) => {
            const { articles } = body
            expect(articles).toEqual([])
          })
      })


      test('200 OK: articles -> topic: Mitch (all articles with Mitch as topic) ', () => {
        return request(app)
          .get('/api/articles?topic=mitch')
          .expect(200)
          .then(({ body }) => {
            const { articles } = body
            articles.forEach((article) => {
              expect(article.topic).toBe('mitch')
            })
          })
      })


      test('200 OK: articles -> topic: Cats (all articles with Cats as topic)', () => {
        return request(app)
          .get('/api/articles?topic=cats')
          .expect(200)
          .then(({ body }) => {
            const { articles } = body
            articles.forEach((article) => {
              expect(article.topic).toBe('cats')
            })
          })
      })


      test('404 Not Found: invalid topic', () => {
        return request(app)
          .get('/api/articles?topic=none')
          .expect(404)
          .then(({ body }) => {
            expect(body.msg).toBe('Not Found');
          })
      })
    })







