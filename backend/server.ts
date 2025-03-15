import app from "./app";
import syncDatabase from "./lib/syncDatabase";

const PORT = process.env.APP_PORT || 5000;

const startServer = async () => {
  await syncDatabase();

  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
};

startServer();
