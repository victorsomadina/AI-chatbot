import "dotenv/config";
import express from "express";
import cors from "cors";
import router from "./router/routes.js";
import swaggerUi from "swagger-ui-express";
import swaggerDoc from "../swagger.js";
import connection from "./connection.js";
import {User} from "./database/schema.js";
import populateUser from "./database/scripts.js";

connection();
User;
populateUser();

const app = express();
const port = process.env.PORT ? process.env.PORT : 3900;

// Middleware
app.use(cors());
app.use(express.json());
app.use("/api", router);

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDoc));

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

export default app;
