const express = require("express");
const bodyParser = require("body-parser");
const graphqlHTTP = require("express-graphql");
const { buildSchema } = require("graphql");
const bcrypt = require("bcryptjs")
const mongoose = require("mongoose")

const port = 3000 || process.env.PORT
const app = express();

const Event = require('./models/events')
const User = require('./models/user');

app.use(bodyParser.json())

app.use('/graphql', graphqlHTTP({
    schema: buildSchema(`
    type Event {
        _id: ID!
        title: String!
        description: String!
        price: Float!
        date: String!
    }
    type User{
        _id: ID!
        name: String!
        email: String!
        password: String
        createdAt: String
    }
    type RootQuery {
        events: [Event!]!
    }

    input EventInput{
        title: String!
        description: String!
        price: Float!
        date: String!
    }

    input UserInput{
        name: String!
        email: String!
        password: String!
    }

    type RootMutation {
        createEvent(input: EventInput): Event
        createUser(input: UserInput): User
    }
      schema {
        query: RootQuery
        mutation: RootMutation
      }
    `),
    rootValue: {
        events: async () => {
            const allEvents = await Event.find()
            console.log("allEvents", allEvents)
            return allEvents
        },
        createEvent: async args => {
            const event = new Event({
                title: args.input.title,
                description: args.input.description,
                price: args.input.price,
                date: new Date(args.input.date)
            });
            const newEvent = await Event.create(event)
            console.log("newEvent", newEvent)
            return newEvent

        },
        createUser: async args => {
            var salt = await bcrypt.genSaltSync(10);
            const user = {
                name: args.input.name,
                email: args.input.email,
                password: await bcrypt.hashSync(args.input.password, salt)
            }
            const userCreated = await User.create(user)
            return userCreated
        }
    },
    graphiql: true

}));

app.get('/', (req, res, next) => {
    res.send("Hello To My Server ")
})

mongoose.connect(`mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PASSWORD}@graphql-rw2lb.mongodb.net/${process.env.MONGO_DB}?retryWrites=true&w=majority`)
    .then(() => {
        console.log("DB Connected");
    })
    .catch(err => console.log("%%%%%%%%%%%%%%%%%%%%%%5", err))

app.listen(port, () => {
    console.log("listning on port ", port);
})