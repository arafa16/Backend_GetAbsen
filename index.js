import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import session from 'express-session';
import SequelizeStore from 'connect-session-sequelize';
import db from './config/Database.js';
import fileUpload from 'express-fileupload';

//controller
import { getDataMesinAbsenCron } from './controllers/MesinAbsenController.js';

//route

import InOut from './routes/InOutRoute.js'
import cron from 'node-cron';

const app = express();
dotenv.config();

const sessionStore = SequelizeStore(session.Store);

const store = new sessionStore({
    db:db
});

// (async()=>{
//     await db.sync();
// })();

app.use(session({
    secret: process.env.SESS_SECRET,
    resave: false,
    // proxy: true,
    saveUninitialized: true,
    store:store,
    cookie: {
        // httpOnly: true,
        secure: 'auto',
        maxAge: 1000 * 60 * 60
    }
}));

app.use(cors({
    credentials: true,
    origin: [process.env.LINK_FRONTEND, process.env.URL_ORIGIN]
}));

app.use(express.json());
app.use(fileUpload());

app.use(InOut);

//setup public folder
app.use(express.static("public"));

store.sync();

// jadwal penarikan data absen
cron.schedule('*/1 * * * *', function() {
    getDataMesinAbsenCron();
});

app.listen(process.env.PORT,()=>{
    console.log(`server running at port ${process.env.PORT}`)
});