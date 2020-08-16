const puppeteer = require('puppeteer');
const fs = require('fs-extra');
const express = require('express')
const PORT = process.env.PORT || 4000
const writeStream = fs.createWriteStream('tablapump.csv')
const mongoose = require('mongoose');
const mongoUrl = 'mongodb+srv://elfo770:benito01@clusterpump.rimyn.mongodb.net/ClusterPump?retryWrites=true&w=majority';
const Champion = require("./pumpmodel")

const app = express();

app.listen(PORT, function() {
    console.log(`Example app listening on port ${PORT}!`);
});


mongoose.connect(mongoUrl, { useNewUrlParser: true });
var db = mongoose.connection;

!db ? console.log("Hubo un error conectandose a la base de datos") : console.log("Conexión a base de datos satisfactoria");




app.get("/", function(req, res) {
    res.json({
        status: 'API Its Working',
        message: 'Welcome to RESTHub crafted with love!'
    });
})

app.post("/", function(req, res) {

    //Entrar al pumpControl usando el usuario y pass
    let scrape = async() => {
        //Lanzar la web, no headless
        const browser = await puppeteer.launch({ headless: false });
        const page = await browser.newPage();
        await page.setViewport({ width: 1200, height: 720 })
        await page.goto('https://www.fleet-online.com.ar/p/do');

        //Completar el usuario y la pass
        await page.type('#dgf_login_form_fd-username', 'TALCANTARA.MASTERBUS')
        await page.type('#dgf_login_form_fd-password_encrypted', '12345')

        await Promise.all([

                page.click('#confirm')
            ])
            .then(() => console.log("termino"))
            .catch((err) => console.log(err));

        console.log('page.url()')


        await page.waitForSelector('#scroll_header > tr > th:nth-child(3) > span');

        //writeStream.write('1\t2\tVEHICULO\tODOMETRO\tVOLUMEN\tFECHA-HORA\tESTACION\tID\tTAG1\tPATENTE\t11\t12\t13\t14\t15\t16\tPRODUCTO\tSURTIDOR\tMANGUERA\tCONSUMO PROMEDIO\t21\t22\t23\t24\t25\t26\t27\t28\t29\t30\t31\t32\n')

        const tabla = await page.evaluate(() => {

            var result;
            var tbody = document.getElementById('scroll_body');
            result = tbody.innerText;

            return result;
        })
        console.log(tabla)

        browser.close();
        return tabla;
    };


    scrape().then(value => {
        Champion.create(value, function(err, small) {
            if (err) return handleError(err);
            // saved!
        });
        res.send(value);
        return;
    });

});