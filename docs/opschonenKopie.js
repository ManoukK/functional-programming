//filmpje die ik heb gevolgt om dit te doen: https://www.youtube.com/watch?v=hMwKfkaCdJU

console.log("hoi");

const CSVToJSON = require('csvtojson');
const FileSystem = require('fs');

CSVToJSON().fromFile("prijzenLijstVoorDataOpschonen.csv").then(source => {

    source.push({
        'Titel': "Dit is een test",
        'Link': "www.test.nl",
        'Prijs': "100.00",
    });

    source.push({
        'Titel': "coole ketting",
        'Link': "www.bol.com",
        'Prijs': "19.95node",
    });

    console.log(source);
});

console.log("hey");