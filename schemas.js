const z = require('zod')

const validateMovie = z.object({
  id: z.string({
    error: (issue) => issue.input == undefined ? 'La propiedad es obligatoria' : 'Esto no es un string'
  }).min(10, {
    error: `La longitud minima del id debe ser de 10`
  }),
  title: z.string({
    error: (issue) => issue.input === undefined ? 'La propiedad es obligatoria' : 'Esto no es un string'
  })
    .regex(/^[a-zA-Z].*[a-zA-Z0-9]$/, {
      error: 'Ha existido un error en el nombre. El nombre no puede empezar con un numero.'
    }),
  year: z.number()
    .min(1900, {
      error: (issue) => `El valor minimo aceptable es de ${issue.minimum}`
    })
    .max(2025, {
      error: (issue) => `El valor no puede ser superior a ${issue.maximum}`
    }),
  director: z.string(),
  duration: z.number().positive().max(3000),
  poster: z.url(),
  rate: z.number().min(0.1).max(10),
  genre: z.array(
    z.enum(
      ["Sci-Fi", "Crime", "Drama", "Action", "Terror"],
      {
        error: (issue) => `El genero ${issue.input} no es un genero valido. Solo puedes escoger entre Sci-Fi,Crime,Drama,Action`
      }
    )
  )
})

function validateInfoOfMovie(object) {
  return validateMovie.safeParse(object)
}

function validatePartialMovie(object) {
  return validateMovie.partial().safeParse(object)
}

module.exports = {
  validateInfoOfMovie,
  validatePartialMovie
}