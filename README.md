# Inzicht krijgen in de collectie van Wereld culturen 
## Opdracht 
De opdracht is om in D3 een statische datavisualisatie te maken die van toegevoegde waarde is voor het Tropen museum. Het is ook de bedoeling dat we de data gelijk ophalen uit een query zodat het "responsive" en up to date blijft. We gaan ook leren hoe je data kan opschonen op een functional programming manier. Dat houd in dat je stap voor stap en heel logisch door je data heen gaat om het op te schonen. Hier kan je goed de higher order functions gebruiken. 

## fucntional programming
In mijn wiki leg ik uit wat functional progamming is en wat je ermee kan doen. Ook vertel ik mijn eigen ervaring ermee en mijn mening. Ik ga ook nog een klein stukje uitleggen over higher order functions. De wiki kan je hier lezen: https://github.com/ManoukK/functional-programming/wiki/Functional-programming

## Leerdoelen
Dit zijn de leerdoelen van deze opdracht: 
- In d3 werken
- Functional code schrijven en begrijpen
- Data kunnen opschonen

## Concept
Mijn doelgroep mijn de bezoekers van de tentoonstelling van Rick. Ik wilde graag aan de bezoekers laten zien wat er achter het museum zit. Zij zien alleen de objecten die daar worden getoont en weten niet hoe groot de collectie is die daar achter zit. Daarom wilde ik een wereldkaart maken die aantoont hoeveel objecten uit de collectie uit bepaalde landen komen. Hier kan je gelijk in zien welke landen er niet in de collectie zitten maar ook de poplulaire landen. De bezoekers kunnen over een land hoveren, als ze dat doen komt er een pop-up boven het land met daarin de naam van het land en het aantal objecten uit de collectie. Uiteindelijk als ik het interactief ga maken wil ik dat de bezoeker ook op een land kan klikken, vervolgens verschijnen er dan 10 objecten uit dat land die niet of nauwelijks in musea hebben gestaan. Zo voorkom je dat de populairste objecten (die al in veel in musea staan of hebben gestaan) te voorschijn komen en op deze manier hou je het ook fris voor de bezoekers die vaker komen.  

#### Een voorbeeld foto van hoe ik het wil krijgen
![Schermafbeelding 2019-11-08 om 10 00 42](https://user-images.githubusercontent.com/45541885/68839196-7682ea00-06c0-11ea-8fc8-41d94b27cec6.png)

#### Het resultaat

## Installatie
De template die ik heb gebruikt is deze: http://bl.ocks.org/ganeshv/2b852863d91ee21ddf71 het is van de gebruiker ganeshv en hij heeft het heel goed uitgelegt hoe de kaart werkt. Hij heeft gelijk alle script tags erin die je nodig hebt en hij laat zien hoe hij de landen ophaalt. 

(script tags)

## Data
#### De collectie
Voor de data heb ik gewerkt met de database/collectie van het Tropen museum. De collectie is ontzettend groot. Het bevat objecten en foto's vanuit de hele wereld. De collectie is voornamelijk gebaseerd op de mens. Je vind veel culturen, geloven en bevolkingsgroepen. De categoriën die er in de collectie zitten zijn heel breed tot heel specifiek. Je kan hierin echt gaat inzoomen op wat jij precies wilt hebben. 

#### Wat heb ik ermee gedaan?
Zoals je in mijn concept al kon lezen wilde ik wat doen met de hele collectie, met de landen en het aantal objecten erin. Ik heb dus een query gebruikt (zie hieronder en geschreven door Ivo) die alle landen ophaalt die in de database zijn vermeld. Vervolgens kijkt de query ook hoeveel objecten er aan dat land hangen. Door het land mee te krijgen kan ik dit op een wereld kaart zetten in d3. De grootte van het aantal objecten zorgen ervoor welke tint kleur er word mee gegeven. 

#### De query uit sparql
Dit is de qeury uit uit sparqle die ik gebruik. De prefixes zijn nodig om benodigde data op te halen, om errors te voorkomen en om dingen te definiëren. 

```
PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
PREFIX dc: <http://purl.org/dc/elements/1.1/>
PREFIX dct: <http://purl.org/dc/terms/>
PREFIX skos: <http://www.w3.org/2004/02/skos/core#>
PREFIX edm: <http://www.europeana.eu/schemas/edm/>
PREFIX foaf: <http://xmlns.com/foaf/0.1/>
PREFIX hdlh: <https://hdl.handle.net/20.500.11840/termmaster>
PREFIX wgs84: <http://www.w3.org/2003/01/geo/wgs84_pos#>
PREFIX geo: <http://www.opengis.net/ont/geosparql#>
PREFIX skos: <http://www.w3.org/2004/02/skos/core#>
PREFIX gn: <http://www.geonames.org/ontology#>
PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>

SELECT ?landLabel (COUNT(?cho) AS ?choCount) WHERE {
  
   ?cho dct:spatial ?plaats .
   ?plaats skos:exactMatch/gn:parentCountry ?land .
   ?land gn:name ?landLabel .
  
} GROUP BY ?landLabel
ORDER BY DESC(?choCount)
```
De array die je terug krijgt als je dit om heb gezet in JSON ziet er zo uit: 
![Schermafbeelding 2019-11-14 om 20 49 35](https://user-images.githubusercontent.com/45541885/68891050-669af280-0720-11ea-99a6-fe90da9e030f.png)

Je ziet dat de values nog heel "diep" in de arrey items zitten. Uiteindelijk wil je makkelijk bij de values van de landen en de objecten komen. Dit heb ik opgelost om deze code mee te geven bij mijn fetch. Nu kan ik veel sneller en makkelijker aangeven dat de de landen of het aantal objecten wil. 

```
.then(results => {
        return results.map(result => {
            return {
                //in nummers gekregen dankzij Lennart
                count: result.choCount.value,
                land: result.landLabel.value,
            }
        })
    })
```

Later in de code word er verwacht dat je in je array items hebt zitten met bepaalde eigenschappen/waardes. Om hier gebruik van te maken loop ik door mijn gefetchde array en maak ik met .map een nieuwe array met de nieuwe waardes. De "oude" waardes van de landen en het aantal objecten geef ik ook mee. (Zie field en country) Hier zie je de code: 
```
  var defaults = results.map(result => {
       return {
        title: "",                                               
        field: result.count,
        country: result.land,
        colors: "RdYlGn",
        proj: "kavrayskiy",
        inverse: "",
       }
    });
```
De nieuwe array ziet er in de console nu zo uit:
![Schermafbeelding 2019-11-14 om 21 02 30](https://user-images.githubusercontent.com/45541885/68892221-c5fa0200-0722-11ea-8a4b-416142a98faf.png)

#### Lege data 
In principe werk ik niet met lege data maar wel met "lege" landen. Landen die geen objecten bevatten. Die landen wil ik laten tonen door een witte kleur, dus eigenlijk geen kleur te geven. Dit wil ik doen omdat het in landkaarten in combinatie met kleur wit vaak leeg betekend en op deze manier kan je ook goed zien welke landen geen objecten bevatten. De lege landen vertellen namelijk ook een verhaal en het lijkt mij heel interessant om het contrast te zien tussen landen zonder objecten en landen met enorm veel objecten. 

## features
Dit zijn de features die ik nog wil toepassen of die ik al heb toegepast:
- [ ] Landen die een kleur hebben op basis van het aantal objecten uit dat land
- [ ] Pop-up met de naam van het land en het aantal objecten als je erover hovert
- [ ] Betere query schrijven die alle objecten ophaalt en dan sorteert op landen
- [ ] (interactie) klikken op een land en dan verschillende objecten uit dat land te zien krijgen 

## Credits voor:
#### conpect hulp:
- Cindy Danny die aangaven dat het interessanter was om objecten te tonen die bijna niet in het museum staan. 

#### techniek hulp:
- Ivo voor de query 
- Laurens voor de voorbeelden 
- Robert voor hulp met code
