const request = require('supertest');
const app = require('../server');

describe('Books API', () => {
  test('GET /api/books returns all books with 200', async () => {
    const res = await request(app).get('/api/books');
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThan(0);
  });

  test('GET /api/books/:id returns a specific book with 200', async () => {
    const res = await request(app).get('/api/books/1');
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('id', 1);
    expect(res.body).toHaveProperty('title');
  });

  test('GET /api/books/:id returns 404 for missing book', async () => {
    const res = await request(app).get('/api/books/99999');
    expect(res.statusCode).toBe(404);
  });

  test('POST /api/books creates a new book with 201', async () => {
    const newBook = {
      title: 'Test Book',
      author: 'Test Author',
      genre: 'Test Genre',
      copiesAvailable: 10
    };

    const res = await request(app)
      .post('/api/books')
      .send(newBook);

    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty('id');
    expect(res.body.title).toBe(newBook.title);

    // Confirm it shows up in GET /api/books
    const all = await request(app).get('/api/books');
    const found = all.body.find(b => b.id === res.body.id);
    expect(found).toBeTruthy();
  });

  test('PUT /api/books/:id updates an existing book with 200', async () => {
    // Create one to update
    const created = await request(app)
      .post('/api/books')
      .send({
        title: 'Original Title',
        author: 'Original Author',
        genre: 'Original Genre',
        copiesAvailable: 1
      });

    const id = created.body.id;

    const res = await request(app)
      .put(`/api/books/${id}`)
      .send({ title: 'Updated Title' });

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('id', id);
    expect(res.body).toHaveProperty('title', 'Updated Title');
  });

  test('PUT /api/books/:id returns 404 for missing book', async () => {
    const res = await request(app)
      .put('/api/books/99999')
      .send({ title: 'Does not matter' });

    expect(res.statusCode).toBe(404);
  });

  test('DELETE /api/books/:id removes a book with 200', async () => {
    // Create one to delete
    const created = await request(app)
      .post('/api/books')
      .send({
        title: 'Delete Me',
        author: 'Test Author',
        genre: 'Test Genre',
        copiesAvailable: 1
      });

    const id = created.body.id;

    const del = await request(app).delete(`/api/books/${id}`);
    expect(del.statusCode).toBe(200);
    expect(del.body).toHaveProperty('id', id);

    // Confirmation
    const get = await request(app).get(`/api/books/${id}`);
    expect(get.statusCode).toBe(404);
  });

  test('DELETE /api/books/:id returns 404 for missing book', async () => {
    const res = await request(app).delete('/api/books/99999');
    expect(res.statusCode).toBe(404);
  });
});
