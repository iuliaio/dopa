import cors from "cors";
import express from "express";
import { router } from "./routes/routes";

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use("/api", router);

app.get("/", (req, res) => {
  res.json({ message: "Welcome to the Tasks API" });
});

const port = process.env.PORT || 8080;

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
