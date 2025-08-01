const express = require('express')
const app = express()
const z = require('zod')

const movies = require('./movies.json')
const { validateInfoOfMovie, validatePartialMovie } = require('./schemas')

app.disable('x-powered-by')
app.use(express.json())

const PORT = process.env.PORT ?? 1234

//obteniendo una variable de entorno para saber si estoy en produccion
const isProduction = process.env.NODE_ENV === 'production'

const BASE_URL = isProduction ? 'https://api-rest-mlnn.onrender.com' : 'http://localhost:1234'

const ORIGENES_ACEPTADOS = [
  'https://api-rest-mlnn.onrender.com',
  'http://127.0.0.1:5500'
]

app.get('/movies', (req, res) => {
  const { origin } = req
  const origen_aceptado = ORIGENES_ACEPTADOS.matches((e) => e === origin)
  if (origen_aceptado) {
    res.setHeader('Access-Control-Allow-Origin', origen_aceptado)
  }
  const { genre } = req.query

  if (genre) {
    const filterMovies = movies.filter((item) =>
      item.genre.some((item) => item.toLowerCase() === genre.toLowerCase())
    )
    if (filterMovies.length < 1) return res.status(400).json({ error: 'No se encontraron coincidencias.' })

    res.json(filterMovies)
  }

  res.send(movies)
})

//manejar ruta con parametros dinamicos
app.get('/movies/:id', (req, res) => {
  const { id } = req.params

  const indexMovie = movies.findIndex(item => item.id === id)
  if (indexMovie < 0) return res.status(400).json({ error: 'No se ha encontrado la pelicula buscada' })

  const foundMovie = movies[indexMovie]

  res.json(foundMovie)
})

//ruta para manejar peticiones de tipo POST
app.post('/movies', (req, res) => {
  //extraer informacion enviada por el usuario en la petición
  const movie = req.body

  //verificacion de id
  const isExist = movies.some(item => item.id === movie.id)
  if (isExist) return res.status(400).json({ message: 'El id especificado ya existe', solucion: 'Tienes que cambiar el id' })

  //validar la informacion
  const result = validateInfoOfMovie(movie)
  if (result.error) return res.status(400).json({ "Error encontrado:": JSON.parse(result.error) })

  //envio exitoso
  const newMovie = result.data
  movies.unshift(newMovie)
  res.json(newMovie)
})


//Manejo ruta para metodo PATCH, modificacion parcial de recurso
app.patch('/movies/:id', (req, res) => {
  const { id } = req.params
  const { body } = req

  const movieIndex = movies.findIndex((item) => item.id === id)
  if (movieIndex < 0) return res.status(400).json({ error: 'No se encontro la pelicula a modificar.' })

  //validar la informacion antes de aplicar la modificacion
  const result = validatePartialMovie(body)
  if (result.error) return res.status(400).json({ 'Error encontrado': JSON.parse(result.error) })

  //procedo a realizar o implementar la modificacion
  movies[movieIndex] = {
    ...movies[movieIndex],
    ...result.data
  }

  res.status(200).json({ success: true })

})


//manejar ruta para eliminar un recurso
app.delete('/movies/:id', (req, res) => {

  const { origin } = req
  const origen_aceptado = ORIGENES_ACEPTADOS.matches((e) => e === origin)
  if (origen_aceptado) {
    res.setHeader('Access-Control-Allow-Origin', origen_aceptado)
  }

  res.setHeader('Access-Control-Allow-Methods', 'DELETE')
  const { id } = req.params

  //buscar el elemento a eliminar
  const findIndex = movies.findIndex((item) => item.id === id)
  if (findIndex < 0) return res.status(400).json({ error: 'No se logro identificar el elemento buscado.' })

  movies.splice(findIndex, 1)

  res.status(200).json({ message: 'Operacion exitosa', success: true })
})


app.options('/movies/:id', (req, res) => {

  const { origin } = req
  const origen_aceptado = ORIGENES_ACEPTADOS.matches((e) => e === origin)
  if (origen_aceptado) {
    res.setHeader('Access-Control-Allow-Origin', origen_aceptado)
  }

  res.setHeader('Access-Control-Allow-Methods', 'DELETE')
  res.send()
})


// manejo de rutas no especificadas
app.use('*', (req, res) => {
  res.redirect(`${BASE_URL}/movies`)
})

app.listen(PORT, () => {
  console.log(`Servidor funcionando en el siguiente enlace: http://localhost:${PORT}`)
})