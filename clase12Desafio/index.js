const express = require("express");
const { Router } = express;
const Contenedor = require("./container.js.js");
const fs = require('fs');
const { Server: HttpServer } = require('http');
const { Server: SocketServer } = require('socket.io');

const app = express();
const routerProductos = Router();

const productos = new Contenedor();

app.engine(
  'hbs',
  engine({
      extname: '.hbs',
      defaultLayout: 'index.hbs',
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public')); 

app.set('views','./Back-End/appConHanddlebars/hbs_views');
app.set('view engine','hbs');
// GET /api/productos --> devuelve todos los productos

routerProductos.get("/", (req, res) => {
    res.send(productos.getProductos());
});

// GET /api/productos/:id --> devuelve productos según el ID

routerProductos.get("/:idProducto", (req, res) => {
  const id = req.params.idProducto;
  if(productos.getProductoPorId(id) !== undefined) {
    res.send(productos.getProductoPorId(id));

  }
  else res.status(404).send({Error: 'El producto no existe'});
});
// POST /api/productos/:id --> recibe y agrega productos creando el ID

routerProductos.post("/", (req, res) => {
  res.send(productos.postProducto(req.body));
});

// PUT /api/productos/:id --> recibe y actualiza el producto según el ID

routerProductos.put("/:idProducto", (req, res) => {
  const id = req.params.idProducto;
  res.send(productos.putProducto(id, req.body));
});

// PUT /api/productos/:id --> elimina el producto según el ID

routerProductos.delete("/:idProducto", (req, res) => {
  const id = req.params.idProducto;
  res.send(productos.deleteProducto(id));
});

app.use("/api/productos", routerProductos);

// Listeners

// Websockets


const saveMessage = (message) => {
  let json = '';
  let contenido = fs.readFileSync('./mensajes.txt','utf-8');
  if (contenido === '') {
      json = JSON.stringify([message]);
      fs.writeFileSync('./mensajes.txt',json);
  } else {
      let messages = JSON.parse(contenido);
      json = JSON.stringify([...messages,message]);
      fs.writeFileSync('./mensajes.txt',json);
  }
}

const readMessage = () => {
  let contenido = fs.readFileSync('./mensajes.txt','utf-8');
  if (contenido === '') {
      return '';
  } else {
      return JSON.parse(contenido);
  }
}


const httpServer = new HttpServer(app);
const socketServer = new SocketServer(httpServer);

socketServer.on('connection',async (socket) => {
  socket.emit('messages',await readMessage())
  socket.emit('products',await cont1.getAll())

  socket.on('new_message',async (mensaje) => {
      console.log(mensaje);
      saveMessage(mensaje);
      let mensajes = await readMessage();
      socketServer.sockets.emit('messages',mensajes);
  });

  socket.on('new_products',async (product) => {
      await cont1.save(product)
      let productos = await cont1.getAll() === '' ? '' : await cont1.getAll();
      socketServer.sockets.emit('products',productos);
  });
})


httpServer.listen(8080,() => {
  console.log('Servidor corriendo en puerto 8080!');
})