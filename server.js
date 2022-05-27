/* 
npm init -y
npm i express
npm i express socket.io
npm i ejs
npm i express-session
npm i connect-mongo --save
*/
const express = require('express')
const session = require('express-session')

const MongoStore = require('connect-mongo')
const advancedOptins = { useNewUrlParser: true, useUnifiedTopology: true }

const app = express()
const server = require('http').Server(app)
const io = require('socket.io')(server)

/* ------------------------------------------------------------------- */
/*              Persistencia database                                  */
/* ------------------------------------------------------------------- */
app.use(session({
    store: MongoStore.create({ 
        mongoUrl: 'mongodb+srv://Cecilia:ceci1984@cluster1.sf6kh.mongodb.net/?retryWrites=true&w=majority',
        mongoOptions: advancedOptins
    }), 
    secret: 'sh',
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 100000 }
}))

app.use(require('flash')())

let messages = []
const productos = []

app.use(express.urlencoded({ extended: true }))
app.set('views', './views')
app.set('view engine', 'ejs')

app.get('/', (req, res) => {
    let productos = [
        {nombre: 'Escuadra', precio: 20, foto: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/3c/Squadra_45.jpg/640px-Squadra_45.jpg"}, 
        {nombre: 'Regla', precio: 10, foto: "https://image.shutterstock.com/image-vector/school-measuring-plastic-ruler-20-260nw-615662024.jpg"}, 
        {nombre: 'Compás', precio: 20, foto: "https://thumbs.dreamstime.com/b/comp%C3%A1s-de-dibujo-aislado-rojo-132996590.jpg"}
    ]
    const usuario = req.session.usuario
    try{
        if(req.session.usuario) {
            res.render('productos', { productos, usuario})
        } else {
            res.sendFile(__dirname + '/public/registrarse.html')
        }
    } catch (error){ console.log(error) }
    
})

app.post('/productos', (req, res) => {
    productos.push(req.body)
    console.log(productos)
    res.redirect('/')
})

app.use(express.static('public'))

io.on('connection', function(socket){
    console.log('Un cliente se ha conectado')
    /* Emitir todos los mensajes a un cliente nuevo */
    socket.emit('messages', messages)

    socket.on('new-message', function(data){
        /* Agregar mensajes a array */
        messages.push(data)

        /* Emitir a todos los clientes */ 
        io.sockets.emit('messages', messages)
    })
})


/* Login */
app.post('/login', (req, res) => {
    let usuario = req.body.usuario
    req.session.usuario = usuario
    console.log(usuario)
    res.redirect('/')
})

app.get('/logout', (req, res) => {
    req.session.destroy(err => {
        if(!err) {
            res.send('Chau: ', req.session.usuario)
        }
        else res.send({ status: 'Logout ERROR', body: err })
    })
})

const PORT = process.env.PORT || 8080

const srv = server.listen(PORT, () => {
    console.log(`Servidor escuchando en el puerto ${srv.address().port}`)
})
srv.on('error', error => console.log(`Error en el servidor ${error}`))