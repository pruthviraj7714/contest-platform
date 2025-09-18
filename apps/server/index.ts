import express from "express";
import cors from "cors";
import userRouter from "./routes/user.routes";
import adminRouter from "./routes/admin.routes";
import contestRouter from "./routes/contest.routes";
import { PORT } from "./config";

const app = express();

app.use(express.json());
app.use(cors());

app.get('/', (req, res) => {
    res.status(200).json({
        message : "Healthy Server"
    })
});

app.use('/api/v1/user', userRouter);
app.use('/api/v1/admin', adminRouter);
app.use('/api/v1/contest', contestRouter);

app.listen(PORT || 3001, () => {
  console.log(`Server is running on Port ${PORT || 3001}`);
});
