import express from "express";
import path from "path";
import router from "./routes/index";
import cors from 'cors'

const app = express();
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, '../public')));
app.use(express.json())
app.use(cors());
app.use(router)

app.listen(3000)