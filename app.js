//IMPORTED MODULES
const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');
const express = require('express');
const querystring = require('querystring');
const mongo = require('mongodb').MongoClient;
const serveStatic = require('serve-static');
const pug = require('pug');



//GLOBAL VARIABLES
const app = express();
const dbpath = "mongodb://localhost:27017/";    //MONGODB URL
const port = process.env.PORT || 3000;  //PORT


//EXPRESS SPECIFIC CONFIGURATION
app.use(express.static('public'));
app.use(express.urlencoded());

//PUG SPECIFIC CONFIGURATION
app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));



//ENDPOINTS
app.get('/', (req, res) => {
   
    res.status(200).render('main', { message: 'Waiting For Submission',content:{},base:'0' });
});


app.post('/', (req, res) => {

    
    let formdata = {
        rank: req.body.rank,
        category: req.body.category,
        branch: req.body.branch   
    };
    console.log(formdata);
    mongo.connect(dbpath, function (err, client) {
        if (err)
            throw err;
        console.log("Connected To MongoDB");
        var filter = {};
        filter["Branch name"] = formdata.branch;
        filter[`${formdata.category}.open`] = { $ne: 0 };
        var to_show = {};
        to_show["_id"] = 0;
        to_show["Institute Name"] = 1;
        to_show["Branch name"] = 1;
        to_show[`${formdata.category}`] = 1;


        var sorted = {};
        sorted[`${formdata.category}.close`] = 1;

        console.log(filter);
        console.log(to_show);
        console.log(sorted);
        var db = client.db('project1');

        db.collection("wbjee").find(filter).project(to_show).sort(sorted).toArray(function (err, table) {
            if (err)
                throw err;
            console.log("Data Extracted Successfully");
           
           
            res.status(200).render('main', { message: 'HERE IS YOUR RESULT',content:table,category:formdata.category,base:formdata.rank});
            client.close();
        });






    });



});


//START THE SERVER
app.listen(port, () => {
    console.log(`Listening on port:${port}`);
})