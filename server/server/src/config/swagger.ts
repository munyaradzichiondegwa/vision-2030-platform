// server/src/config/swagger.ts
import swaggerJSDoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";
import environment from "./environment";

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Vision 2030 Platform API",
      version: "1.0.0",
      description: "National Development Platform API Documentation",
    },
    servers: [
      {
        url: `http://localhost:${environment.PORT}/api/v1`,
      },
    ],
    components: {
      securitySchemes: {
        BearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
    },
  },
  apis: ["./src/routes/*.ts", "./src/models/*.ts"],
};

const swaggerSpec = swaggerJSDoc(options);

export const swaggerDocs = (app: any) => {
  app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
  app.get("/api-docs.json", (req: any, res: any) => {
    res.setHeader("Content-Type", "application/json");
    res.send(swaggerSpec);
  });
};
