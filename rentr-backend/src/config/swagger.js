const swaggerJsdoc = require("swagger-jsdoc");

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Rentr API",
      version: "1.0.0",
      description: "Rental App Backend API",
    },
    servers: [
      {
        url: "http://localhost:5001",
      },
    ],
  },
  apis: ["./src/modules/**/*.js"], // scans your files
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = swaggerSpec;