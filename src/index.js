const { ApolloServer } = require("apollo-server-express");
const express = require("express");
const fs = require("fs");
const _ = require("lodash");
const productsData = require("./products");

const PORT = 4000;
const BASE_URL = `http://localhost:${PORT}`;

const typeDefs = fs.readFileSync(`${__dirname}/schema.graphql`, "utf-8");

const app = express();

const resolvers = {
  Query: {
    products: (__, args) => {
      const { limit, offset, filter } = args.query;
      let products = productsData;

      if (filter) {
        if (filter.product_type) {
          const filterTerm = filter.product_type;

          products = _.filter(products, (p) =>
            p.product_type.match(filterTerm)
          );
        }
      }

      const count = products.length;
      const edges = products.slice(offset, offset + limit);

      return {
        limit,
        offset,
        count,
        edges,
      };
    },
    productById: (_, args) =>
      productsData.find((product) => product.id === args.id),
  },
};

const server = new ApolloServer({ typeDefs, resolvers });

server.applyMiddleware({ app });

app.listen({ port: process.env.PORT || PORT }, () => {
  console.log(
    `🚀  Makeup API GraphQL server running at ${BASE_URL}${server.graphqlPath}`
  );
});
