// server/src/server.ts
import app from "./app";
import environment from "./config/environment";

const PORT = environment.PORT;

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
