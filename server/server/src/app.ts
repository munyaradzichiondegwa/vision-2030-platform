// server/src/app.ts
import { swaggerDocs } from "./config/swagger";

// Add after middleware initialization
swaggerDocs(app);
