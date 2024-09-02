// const request = require('supertest');
// const app = require('../server'); // Adjust the path to your server file
// const Movie = require('../models/Movie');

// describe('Movies API', () => {

//     // Test search movies by query
//     it('should search for movies by query', async () => {
//       // Mocking the API response
//       jest.mock('axios');
//       const mockResponse = {
//         data: {
//           Response: 'True',
//           Search: [
//             { Title: 'Inception', imdbID: 'tt1375666', Poster: 'http://example.com/inception.jpg' },
//             { Title: 'Interstellar', imdbID: 'tt0816692', Poster: 'http://example.com/interstellar.jpg' }
//           ]
//         }
//       };
//       require('axios').get.mockResolvedValue(mockResponse);
  
//       const res = await request(app)
//         .get('/api/movies/search')
//         .query({ query: 'Inception' });
  
//       expect(res.status).toBe(200);
//       expect(res.body).toEqual(mockResponse.data.Search);
//     });
  
//     // Test search with invalid query
//     it('should return 404 if no movies are found', async () => {
//       // Mocking the API response
//       jest.mock('axios');
//       const mockResponse = {
//         data: {
//           Response: 'False',
//           Error: 'Movie not found!'
//         }
//       };
//       require('axios').get.mockResolvedValue(mockResponse);
  
//       const res = await request(app)
//         .get('/api/movies/search')
//         .query({ query: 'NonExistentMovie' });
  
//       expect(res.status).toBe(404);
//       expect(res.body.error).toBe(mockResponse.data.Error);
//     });
  
//     // Test search with missing query parameter
//     it('should return 400 if query parameter is missing', async () => {
//       const res = await request(app)
//         .get('/api/movies/search');
  
//       expect(res.status).toBe(400);
//       expect(res.body.message).toBe('Query parameter is required.');
//     });
  
//     // Test search with invalid type
//     it('should return 400 for invalid type parameter', async () => {
//       const res = await request(app)
//         .get('/api/movies/search')
//         .query({ query: 'Inception', type: 'invalidType' });
  
//       expect(res.status).toBe(400);
//       expect(res.body.message).toBe('Invalid type parameter.');
//     });
  
//     // Test search with valid type
//     it('should return movies for valid type parameter', async () => {
//       // Mocking the API response
//       jest.mock('axios');
//       const mockResponse = {
//         data: {
//           Response: 'True',
//           Search: [
//             { Title: 'Inception', imdbID: 'tt1375666', Poster: 'http://example.com/inception.jpg' }
//           ]
//         }
//       };
//       require('axios').get.mockResolvedValue(mockResponse);
  
//       const res = await request(app)
//         .get('/api/movies/search')
//         .query({ query: 'Inception', type: 'movie' });
  
//       expect(res.status).toBe(200);
//       expect(res.body).toEqual(mockResponse.data.Search);
//     });
//   });