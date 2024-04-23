// 1. make a simple express server that calls take notes given a note and string
// 2. deploy on railway

import express from "express";

function main() {
  const app = express();
  const port = process.env.port || 8000;

  app.use(express.json());

  app.get("/", (_req, res) => {
    res.send(200).json("ok");
  });

  app.listen(port, () => {
    console.log(`server is listening on ${port}`);
  });
}

main();
