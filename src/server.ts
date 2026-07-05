import express from "express";
import path from "path";
import router from "./routes/index";
import cors from 'cors';
import expressLayouts from 'express-ejs-layouts';

const app = express();
app.use(expressLayouts)
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.set('layout', 'layout'); // レイアウトファイルの指定
app.use(express.static(path.join(__dirname, '../public')));
app.use(express.json())
app.use(cors());
app.use(router)

//app.listen(3000)

//rails用
const PORT = Number(process.env.PORT) || 3000;

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
});