import express from 'express';
import cors from 'cors';
import authRoutes from "./src/routes/auth.js"; 
import orgRoutes from "./src/routes/org.js";
import boardsRoutes from "./src/routes/boards.js"
import listsRoutes from "./src/routes/list.js"
import cardsRoutes from "./src/routes/cards.js"

const app = express();
app.use(cors({
  origin: 'http://localhost:5173',
  methods: ['GET', 'POST', 'PUT','DELETE'],
  credentials: true,
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api', authRoutes);
app.use("/api/organizations", orgRoutes);
app.use('/api/boards', boardsRoutes);
app.use('/api/lists', listsRoutes);
app.use('/api', cardsRoutes); 

app.listen(3000, () => {
  console.log('Server running on http://localhost:3000');
});
