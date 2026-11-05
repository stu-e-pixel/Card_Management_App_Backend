const express = require('express');
const app = express();
const path = require('path')
const helmet = require('helmet');
const limiter = require('./utils/RateLimit');
const morgan = require('morgan');
const cors = require('cors')
const swaggerJsDoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');
const SwaggerOptions = require('../swagger.json');
const swaggerDocument = swaggerJsDoc(SwaggerOptions);
const cookieParser = require('cookie-parser')

app.use(express.json({ limit: "10mb" }));

app.use(express.urlencoded({
  extended: true,
  limit: "10mb",
}));


app.use(helmet())
app.use(limiter)
app.use(morgan('dev'))
app.use(cookieParser())


app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:3000'],
  credentials: true,
  methods: ['GET','POST', 'PUT','PATCH',  'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'x-secret-key']
}));

app.set("view engine","ejs");
app.set("views",path.join(__dirname,"src","views"))

const indexrouter = require('./router/index')
app.use(indexrouter);

const homerouter = require('./router/homerouter');
app.use(homerouter)

module.exports=app

