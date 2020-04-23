/*
    Description: Testing REST API using Node.js
    Author: André Luferat - www.luferat.net
    License: MIT License
*/

// Dependências
var express = require('express');
var bodyParser = require('body-parser');
var fs = require('fs');
var path = require('path');
var favicon = require('serve-favicon');

// Porta HTTP local
var httpPort = 8888;

// Base de dados
var database = 'users.json';

// Inicializa Express
var app = express();

// Favicon
app.use(favicon(path.join(__dirname, './favicon.png')));

// Index.html
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, './index.html'));
});

// Inicializa Body Parser
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Formata cabeçalho HTTP
app.use((req, res, next) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE");
    res.setHeader("Access-Control-Allow-Headers", "content-type");
    res.setHeader("Content-Type", "application/json");
    res.setHeader("Access-Control-Allow-Credentials", true);
    next();
});

// Inicia servidor HTTP na porta 8888
app.listen(httpPort, () => { console.log('Servidor Web rodando na porta 8888') });

// Método get()
/*
  Exemplos:
  
    http://localhost:8888/api --> Obtém todos os cadastros
    http://localhost:8888/api?id=0 --> Obtém todos os cadastros
    http://localhost:8888/api?id=2 --> Obtém o cadastro com id = 2
*/
app.get('/api', (req, res) => {

    // Carrega database em JSON
    fs.readFile(database, 'utf8', (err, data) => {

        // Se database não existe
        if (err) {
            var response = { status: 'fail', result: err };
            res.json(response);

            // Se database existe
        } else {

            // Formata em JSON
            var obj = JSON.parse(data);

            // Resultado padrão
            var result = 'No records found';

            // Obtém id da requisição
            var data_id = req.query.id;

            // Se não informou um id ou id = 0
            if (data_id == undefined || data_id == 0) {

                // Retorna todos os registros
                result = obj.users;

                // Se informou um id
            } else {

                // Pesquisa o id nos registros
                obj.users.forEach((user) => {

                    if (user != null) {

                        // Se encontrou o id, retorna o registro
                        if (user.id == data_id) {
                            result = user;
                        }
                    }
                });
            }

            // Formata response
            var response = { status: 'sucess', result: result };

            // Envia response
            res.json(response);
        }
    });
});

// Método post()
/*
  Exemplos:

    http://localhost:8888/api?name=Joca da Silva&email=joca@silva.com&status=1
        Adiciona:
            {
                "name" : "Joca da Silva",
                "email" : "joca@silva.com",
                "status" : 1,
                "id" : #  <<< Total de registros + 1 
                "date" : # <<< Data do sistema
            }
*/
app.post('/api', (req, res) => {

    // Carrega database em JSON
    fs.readFile(database, 'utf8', (err, data) => {

        // Se database não existe
        if (err) {
            var response = { status: 'fail', result: err };
            res.json(response);

            // Se database existe
        } else {

            // Obtém todos os registros  
            var obj = JSON.parse(data);

            // Cria o novo id com base no número de registros
            req.query.id = obj.users.length + 1;

            // Data atual
            //var today = new Date();
            //req.query.date = formatDate(today);
            req.query.date = new Date();

            // Inclui novo registro
            obj.users.push(req.query);

            // Grava database atualizado 
            fs.writeFile(database, JSON.stringify(obj), (err) => {

                // Erro na gravação
                if (err) {
                    var response = { status: 'fail', result: err };
                    res.json(response);

                    // Sucesso na gravação
                } else {

                    // Formata response
                    var response = { status: 'sucess', result: 'Record successfully added' };

                    // Envia response
                    res.json(response);
                }
            });
        }
    });
});

// Método put()
/*
    Exemplos:
    
        http://localhost:8888/api?id=1&name=Joca da Silva&email=joca@silva.com&status=1
            Atualiza o registro com id = 1
*/
app.put('/api', (req, res) => {
    fs.readFile(database, 'utf8', (err, data) => {
        if (err) {
            var response = { status: 'fail', result: err };
            res.json(response);
        } else {
            var obj = JSON.parse(data);

            // Data atual
            var today = new Date();

            // Observe que os campos correspondem ao database
            obj.users[(req.query.id - 1)].name = req.query.name;
            obj.users[(req.query.id - 1)].email = req.query.email;
            obj.users[(req.query.id - 1)].status = req.query.status;
            obj.users[(req.query.id - 1)].date = new Date();

            fs.writeFile(database, JSON.stringify(obj), (err) => {
                if (err) {
                    var response = { status: 'fail', result: err };
                    res.json(response);
                } else {
                    var response = { status: 'sucess', result: 'Record successfully edited' };
                    res.json(response);
                }
            });
        }
    });
});

// Método delete()
/*
    Exemplo:

        http://localhost:8888/api?id=1
            Apaga o registro com id = 1
*/
app.delete('/api', (req, res) => {
    fs.readFile(database, 'utf8', (err, data) => {
        if (err) {
            var response = { status: 'fail', result: err };
            res.json(response);
        } else {
            var obj = JSON.parse(data);

            delete obj.users[(req.query.id - 1)];

            fs.writeFile(database, JSON.stringify(obj), (err) => {
                if (err) {
                    var response = { status: 'fail', result: err };
                    res.json(response);
                } else {
                    var response = { status: 'sucess', result: 'Record deleted successfully' };
                    res.json(response);
                }
            });
        }
    });
});


// Formata a data atual para YYYY-MM-DD HH:II:SS
var formatDate = (date) => {
    var d = new Date(date),
        month = '' + (d.getMonth() + 1),
        day = '' + d.getDate(),
        year = '' + d.getFullYear(),
        hour = '' + d.getHours(),
        min = '' + d.getMinutes(),
        sec = '' + d.getSeconds();

    if (month.length < 2) {
        month = '0' + month;
    }
    if (day.length < 2) {
        day = '0' + day;
    }
    if (hour.length < 2) {
        hour = '0' + hour;
    }
    if (min.length < 2) {
        min = '0' + min;
    }
    if (sec.length < 2) {
        sec = '0' + sec;
    }

    var datePart = [year, month, day].join('-');
    var timePart = [hour, min, sec].join(':');

    return [datePart, timePart].join(' ');
}