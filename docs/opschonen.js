//De meeste stukjes code heb ik geleerd van NDM
var prijzenLijst = `1,65
2,25
1,35
1,95
1,49
1,65
2,99
1,95
1,95
1,35
2,75
1,45
1,85
2,95
2,49
2,49
2,95`
//vervangt de komma's naar punten 
.replace(/,/g, '.')

//het is nu nog 1 lange string en nu zeg ik dat bij elke enter het moet splitten in meerdere strings
.split('\n')

//de items in de array waren eerst strings maar ik wil het in nummers
//note: als het goed is kan dit ook met parseInt
.map(function(getal){
  return Number(getal)
})

/*
// met reduce loopt hij door de array heen en geeft het 1 waarde terug. ForEach laat nog alle stappen zien in de console. 
.reduce(function(accumulator, currentValue, currentIndex, array) {
  return accumulator + currentValue;
});
// hier heb ik via het filmpje van Wes Bos een makkelijkere reduce geschreven. Dit maakt het iets duidelijker, ik begrijp het nog niet helemaal maar het is wel beter geschreven. 
.reduce((totaal, prijs) => totaal + prijs)
*/
var divContainer = document.querySelector('.container');
var totaalPrijs = 0;


//hoe kom ik aan item? ik pak de array en dan zeg ik voor elke... en die geef ik een naam dus nu item. 
prijzenLijst.forEach(prijs => {
  totaalPrijs = totaalPrijs + prijs
  //hier print ik het uit in html zodat het makkelijk te zien is voor anderen
  console.log(totaalPrijs);
    // hier heeft mohamad me ermee geholpen! nu komen mijn resultaten op de site te staan
    var pElement = document.createElement('p');
    pElement.textContent = totaalPrijs;
    divContainer.appendChild(pElement);
})



//console.log(lijst)
console.log(totaalPrijs);
console.log(typeof prijzenLijst[0])
console.log(prijzenLijst.length)
// lijst.length.getElementsByTagName("h1");
