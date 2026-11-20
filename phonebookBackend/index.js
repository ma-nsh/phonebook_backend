const express = require('express')
const app = express()
const morgan = require('morgan')
const cors = require('cors')

morgan.token('body', (req) => 
    req.method === "POST" ? JSON.stringify(req.body) : '')

const requestLogger = (request, response, next) => {
    console.log('Method: ', request.method)
    console.log('Path: ', request.path)
    console.log('Body: ', request.body)
    console.log('---')
    next()
}

const unknownEndpoint = ( request, response ) => {
    response.status(400).send({
        error: 'unknown endpoint'
    })
}

app.use(express.json())
app.use(requestLogger)
app.use( morgan(':method :url :status :res[content-length] - :response-time ms :body'))
app.use(cors())

const generateId = () => {
    return Math.floor( Math.random() * 1000000000 )
}

let persons = [
    { 
      "id": "1",
      "name": "Arto Hellas", 
      "number": "040-123456"
    },
    { 
      "id": "2",
      "name": "Ada Lovelace", 
      "number": "39-44-5323523"
    },
    { 
      "id": "3",
      "name": "Dan Abramov", 
      "number": "12-43-234345"
    },
    { 
      "id": "4",
      "name": "Mary Poppendieck", 
      "number": "39-23-6423122"
    }
]

app.get( '/api/persons', (request, response) => {
    console.log('returned all objects')
    return response.json(persons)
} )

app.get( '/api/info', (request, response) => {
    const time = new Date()
    console.log(`the server has ${persons.length} notes at the time of request`)
    
    response.send(`
        <div>
            Sent something
            <p>${time}</p>
        </div>
    `)
})

app.post('/api/persons', (request, response) => {
    const body = request.body
    const {name, number} = body

    if ( !name ) {
        return response.status(400).json({
            error: "name must exist"
        })
    } else if ( !number ) {
        return response.status(400).json({
            error: "number must exist"
        })
    }
    console.log('request body is ', request.body)
    const anyMatchingName = persons.find(p => p.name?.toLowerCase() === name.toLowerCase())
    const anyMatchingNumber = persons.find(p => p.number === number)

    if ( anyMatchingName ) {
        return response.status(400).json({
            error: "name should be unique"
        })
    }

    const person = {
        name: body.name,
        number: body.number,
        id: generateId()
    }
    persons = persons.concat(person)

    response.json(persons)
})

app.get('/api/persons/:id', (request, response) => {
    const id = request.params.id
    const foundPerson = persons.find( p => p.id === id )
    console.log('found object', foundPerson)

    if ( !foundPerson ) {
        console.log('none found, sending 404 status')
        return response.status(404).end()
    } else {
        console.log('found the id, returning person')
        return response.json(foundPerson)
    }
})

app.delete('/api/persons/:id', (request, response) => {
    const id = request.params.id
    const otherPersons = persons.filter( p => p.id !== id )
    console.log('other objects to return', otherPersons)

    response.json(otherPersons)
})

app.use(unknownEndpoint)

const PORT = process.env.PORT || 3001
app.listen( PORT, () => {
    console.log(`Server running on port ${PORT}`)
})