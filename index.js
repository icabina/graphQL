const express = require("express");
const expressGraphQL = require("express-graphql").graphqlHTTP;
const {
  GraphQLSchema,
  GraphQLObjectType,
  GraphQLString,
  GraphQLList,
  GraphQLInt,
  GraphQLNonNull,
} = require("graphql");
const app = express();

const authors = [
  { id: 1, name: "Jesus Christ" },
  { id: 2, name: "Melchizedek" },
  { id: 3, name: "Benitez" },
];
const books = [
  { id: 1, name: "Urantia Book", authorId: 1 },
  { id: 2, name: "Personality Survival", authorId: 1 },
  { id: 3, name: "The Return", authorId: 2 },
  { id: 4, name: "The Two Towers", authorId: 2 },
  { id: 5, name: "Caballos", authorId: 3 },
  { id: 6, name: "Jesus Micael", authorId: 3 },
];

//================================================================
//TYPES
const BookType = new GraphQLObjectType({
  name: "Book",
  description: "This represents a book by ",
  fields: () => ({
    id: { type: GraphQLNonNull(GraphQLInt) },
    name: { type: GraphQLNonNull(GraphQLString) },
    authorId: { type: GraphQLNonNull(GraphQLInt) },
    author: {
      type: AuthorType,
      resolve: (book) => {
        return authors.find((author) => author.id === book.authorId);
      },
    },
  }),
});

const AuthorType = new GraphQLObjectType({
  name: "Author",
  description: "This represents an author ",
  fields: () => ({
    id: { type: GraphQLNonNull(GraphQLInt) },
    name: { type: GraphQLNonNull(GraphQLString) },
    books: {
      type: new GraphQLList(BookType),
      resolve: (author) => {
        return books.filter((book) => book.authorId === author.id);
      },
    },
  }),
});
// Construct a schema, using GraphQL schema language

//==========================================================
//ROOT QUERY
/* var schema = new GraphQLSchema({
  query: new GraphQLObjectType({
    name: "HelloWorld",
    fields: () => ({
      message: {
        type: GraphQLString,
        resolve: () => "HelloWorld",
      },
    }),
  }),
}); */

const RootQueryType = new GraphQLObjectType({
  name: "Query",
  description: "Root Query",
  fields: () => ({
    book: {
      type: BookType,
      description: "A Single Book",
      args: {
        id: { type: GraphQLInt },
      },
      resolve: (parent, args) => books.find((book) => book.id === args.id),
    },
    //return
    books: {
      type: new GraphQLList(BookType),
      description: "List of Books",
      resolve: () => books,
    },
    authors: {
      type: new GraphQLList(AuthorType),
      description: "List of Authors",
      resolve: () => authors,
    },
    author: {
        type: AuthorType,
        description: 'A Single author',
        args: {
            id: {type: GraphQLInt}
        },
        resolve: (parent,args) => authors.find(author => author.id === args.id)
    }
  }),
});

//======================================================
const RootMutationType = new GraphQLObjectType({
    name: 'Mutation',
    description: 'Root Mutation',
    fields: ()=>({
        addBook: {
            type: BookType,
            description: 'Add a book',
            args: { 
                name: { type: GraphQLNonNull(GraphQLString)},
                authorId: { type: GraphQLNonNull(GraphQLInt)},
            },
            resolve: (parent, args) => {
                const book = {
                    id = books.length + 1, name: args.name, authorId: args.authorId
                }
                books.push(book);
                return book;
            }
        }
    })
})

const schema = new GraphQLSchema({
  query: RootQueryType,
  mutation: RootMutationType //simulate crud functions post update...
});

app.use(
  "/graphql",
  expressGraphQL({
    schema: schema,
    graphiql: true,
  })
);
app.listen(5000, () => console.log("Server Running"));

//example query in graphiQL

/* 
  {
    authors{
      id
      name
      books{
        name
      }
    }
  books{
    id
    author{
      name
    }
  name
    authorId
}
    book(id: 1){
      name
    }
}
 */


//EXAMPLE QUERY FOR MUTATIONS
/* 
mutation{
    addBook(name: "Revelation", authorId: 2){
        id
        name
    }
} 
*/