import express from 'express';
import handlebars from 'express-handlebars';
import { Server } from 'socket.io';

import mongoose from 'mongoose';

import passport from 'passport';
import cookieParser from 'cookie-parser';
import initializePassport from './config/passport.config.js'

import __dirname from './utils.js';

import productsRouter from './routes/products.router.js';
import cartsRouter from './routes/carts.router.js';
import chatRouter from './routes/chat.router.js';
import sessionRouter from './routes/session.router.js';
import viewsRouter from './routes/views.router.js';

import { MessageService } from './repositories/index.js';

import config from './config/config.js';
import errorHandler from './middlewares/errors.js'

const app = express();

app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(express.static(__dirname + '/public/'))

app.engine('handlebars', handlebars.engine())
app.set('views', __dirname + '/views');
app.set('view engine', 'handlebars')

app.use(express.static(__dirname+'/public'))
app.use(cookieParser('mySecret'));

mongoose.set({strictQuery: true})
mongoose.connect(config.MONGO_URI,{dbName: config.MONGO_DB_NAME}, async (error)=>{
    if (!error){
        console.log(`DB connected to ${config.MONGO_DB_NAME}`);
        const httpServer = app.listen(config.PORT, ()=>{
            console.log(`Server listening on port ${config.PORT}...`);
        });
        
        const socketServer = new Server(httpServer)
        let messages = []

        socketServer.on('connection', socket =>{
            console.log(socket.id);
            socket.on('msg_front', data => console.log(data)); 
            socket.emit('msg_back',"Conectado al servicio, Bienvenido desde el Back")
            

            socket.on('session', async data =>{
                messages = await MessageService.get();
                socketServer.emit('first',messages)
            })

            socket.on('message', async data=>{
                await MessageService.create(data)
                messages = await MessageService.get();
                socketServer.emit('logs',messages)
                })
        })


        //Inicializamos passport
        initializePassport();
        app.use(passport.initialize());


        //Utilizamos este Middleware genérico para enviar la instancia del servidor de Socket.io a las routes
        app.use((req,res,next)=>{
            req.io = socketServer
            next()
        })
        app.use('/api/products', productsRouter)
        app.use('/api/carts', cartsRouter)
        app.use('/api/chat', chatRouter)
        app.use('/session', sessionRouter)
        app.use('/views', viewsRouter)
        app.use(errorHandler)
        app.get('/', (req, res) =>{
                res.redirect('views/products')
            }
        )

    } else {
        console.log("Can't connect to database");
    }
} )

