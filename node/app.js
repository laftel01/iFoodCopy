const http = require('http');
const { userInfo } = require('os');
let client = require('mongodb').MongoClient,
    express = require('express'),
    path = require('path'),
    app = express();

const hostname = '127.0.0.1';
const port = 3000;
var db;

app.set('view engine', 'hbs');
app.set('views', path.join(__dirname, 'view'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: false }));
app.use(require("express-session")({
    secret: "safe statement",
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }
}));

client.connect('mongodb://localhost:27017/mongo-test', { useNewUrlParser: true }, function(err, client) {
    if (err) throw err;
    db = client.db('mongo-test');
});

app.get('/', (req, res) => {
    let db_entradas;
    if (req.session.login) {
        db.collection('entradas').find({ login: req.session.login }).toArray(function(err, db_entradas) {
            if (err) console.log(err);
            console.log(db_entradas);

            let entradas = [];
            if (db_entradas && db_entradas._id)
                for (let index = 0; index < db_entradas.length; index++) {
                    entradas[index] = db_entradas.texto;
                }
            res.render('index', { entradas: entradas });
        });
    }
    //console.log(req.session.login);
    //console.log(db_entradas);

});

app.post('/login', (req, res) => {
    res.status(200);
    let login = req.body.login;
    let pass = req.body.pass;
    db.collection('users').findOne({ login: login }, function(err, doc) {
        if (err) console.log(err);
        if (doc && doc._id) {
            if (pass == doc.pass) {
                res.status(200);
                console.log(req.session);
                req.session.login = login;

                console.log(req.session);
                res.end('{"msg": "Login feito", "token": "' + doc._id + '"}');
            } else {
                res.status(400);
                res.end('Erro no Login');
            }
        } else {
            res.status(400);
            res.end('Erro no Login');
        }
    });
});

app.post('/registrar', (req, res) => {
    let login = req.body.login;
    let pass = req.body.pass;
    db.collection('users').findOne({ login: login }, function(err, doc) {
        if (err) console.log(err);
        if (doc && doc._id) {
            res.status(409);
            res.end('Usuário já existente');
        } else {
            db.collection('users').insertOne({ login: login, pass: pass });
            res.status(200);
            res.end('Usuário registrado');
        }
    });
});

app.listen(port);