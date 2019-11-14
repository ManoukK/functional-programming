
//lengthe en breedte van de map
var width = 960,
height = 500,
sheight = 550;

//draaien van de map
// var speed = 1.0,s
// rotating = false;

// var defaults= {
// title: "",                                               
// field: "choCount",
// country: "landLabel",
// colors: "RdYlGn",
// proj: "kavrayskiy",
// inverse: ""
// };


var query = `PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
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
ORDER BY DESC(?choCount)`

var url = "https://api.data.netwerkdigitaalerfgoed.nl/datasets/ivo/NMVW/services/NMVW-13/sparql";

// hier begint het fetchen
// async function https://gist.github.com/msmfsd/fca50ab095b795eb39739e8c4357a808
// veel hulp van robert gekregen
async function fetchAsync () {
    // await response of fetch call
    let response = await fetch(url+"?query="+ encodeURIComponent(query) +"&format=json");

    console.log(response.url);

    // only proceed once promise is resolved
    let dataQuery = await response.json();

    // only proceed once second promise is resolved
    return dataQuery;
  }

// trigger async function
// log response or catch error of fetch promise
// code dankzij laurens
fetchAsync()
    .then(json => json.results.bindings)
    .then(results => {
        return results.map(result => {
            return {
                //in nummers gekregen dankzij Lennart
                count: result.choCount.value,
                land: result.landLabel.value,
            }
        })
    })

    .then(results => {
        console.log(results)
        //dit zorgt ervoor dat ik met de resultaten verder kan werken
        nextFunction(results)
    })
    .catch(reason => console.log(reason.message))

fetchAsync;

//hier eindigt de fetch


function nextFunction(results, o,){

    // //hier trek ik mijn array los met alleen de landen en alleen counts als strings (dankzij Lennart!)
    // var landArray = results.map(result => result.land);
    // console.log(landArray);

    // var countArray = results.map(result => result.count);
    // console.log(countArray);

    // console.log(results.result);

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

    console.log(defaults);


    var opts = $.extend({}, defaults, o),
        colorscale = opts.colors,
        field = opts.field;

    if (colorbrewer[colorscale] === undefined) {
     colorscale = "RdYlGn";
    }

    var ortho = d3.geo.orthographic()
        .precision(.5)
        .translate([width / 2, height / 2])
        .clipAngle(90)
        .clipExtent([[1, 1], [width - 1, height - 1]])
        .scale(250)
        .rotate([-80, -10]);

    var kavrayskiy = d3.geo.kavrayskiy7();

    var graticule = d3.geo.graticule();

    var projections = {
        'kavrayskiy': {
            'projection': kavrayskiy,
            'outline_datum': graticule.outline
        },
        'orthographic': {
            'projection': ortho,
            'outline_datum': {type: "Sphere"}
        }
    };

    var projtype = projections[opts.proj] ? opts.proj : "kavrayskiy";

    var projection = projections[projtype]['projection'];

    var path = d3.geo.path()
        .projection(projection);

    var svg = d3.select("#container").append("svg")
        .attr("width", width)
        .attr("height", sheight);

    var tooltip = d3.select("body").append("div")
        .attr("class", "tooltip")
        .style("opacity", 0);

    svg.append("path")
        .datum(projections[projtype]['outline_datum']) 
        .attr("class", "sea foreground")
        .attr("d", path);

    svg.append("path")
        .datum(graticule)
        .attr("class", "graticule")
        .attr("d", path);

    svg.append("path")
        .datum(projections[projtype]['outline_datum'])
        .attr("class", "outline foreground")
        .attr("d", path);

    data = defaults.map(function(d) {
        //console.log(d)
        //console.log(d.field)
        d[field] = (d[field] === undefined || isNaN(+d[field])) ? null : +d[field];
        return d;
        }).filter(function(d) {
            return d[field] !== null;
        });

    var datadomain = d3.extent(defaults.map(function(legenda) { return legenda[field]; })),
        colors = d3.scale.quantize()
            .domain(opts.inverse ? [datadomain[1], datadomain[0]] : datadomain)
            .range(["#ff78cb", "#f295cd", "#e2adce", "#d0c3d0", "#bad8d1", "#9fecd3", "#78ffd4"]);

    var legenda = d3.scale.linear()
        //.domain(datadomain)
        .domain([0, 300000])
        //.range([0, 240]);
        .range([0, 240])

    var tf = ".0f",
        tsign = "",
        drange = datadomain[1] - datadomain[0];
    
    if (datadomain[0] < 0) {
        tsign = "+";
    }

    if (drange <= 2.0) {
     tf = ".2f";
    } else if (drange < 10.0) {
        tf = ".1f";
    }
    
    var xAxis = d3.svg.axis()
        .orient("bottom")
        .scale(legenda)
        .tickSize(13)
        .tickFormat(d3.format(tsign + tf));

    var xbar = svg.append("g")
        .attr("transform", "translate(" + (width / 2 - 120) + "," + (sheight - 30) + ")")
        .attr("class", "key");

    xbar.selectAll("rect")
        .data(d3.pairs(legenda.ticks(10)))
        .enter().append("rect")
        .attr("height", 8)
        .attr("x", function(d) { return legenda(d[0]); })
        .attr("width", function(d) { return legenda(d[1]) - legenda(d[0]); })
        .style("fill", function(d) { return colors(d[0]); });

    xbar.call(xAxis).append("text")
        .attr("class", "caption")
        .attr("y", -6)
        .attr("x", legenda(legenda.ticks(10)[0]))
        .text(opts.title);

    
    queue()
        .defer(d3.json, "http://pigshell.com/common/d3.v3/world-110m.json")
        .defer(d3.json, "http://pigshell.com/common/d3.v3/countries.json")
        .await(loaded);

//hier word csv getransformeerd en worden er locaties aan gegeven
function loaded(err, world, countrydb) {
    
    console.log("test")

    var countries = topojson.feature(world, world.objects.countries).features;

    //Hier was een error die kim heeft gefixt (data.map moets results.map worden)
    data = defaults.map(function(land) {
        var naamLand = land.country;
    
        if (naamLand === undefined) {
            return {};
        }
        if (!isNaN(+naamLand)) {
            naamLand = naamLand.toString();
        }
        if (typeof naamLand === 'string' ||naamLand instanceof String) {
            naamLand = naamLand.trim();
            var cl = naamLand.toLowerCase();
            var naamLandLijst = countrydb.filter(function(i) {
                return i["name"].toLowerCase() === cl ||
                    i["cca3"] === naamLand || i["cca2"] === naamLand ||
                    i["nativeName"] === cl ||
                    +i["ccn3"] === +naamLand || 
                    i["altSpellings"].indexOf(naamLand) !== -1;
            });
            land["_id"] = naamLandLijst.length ? +naamLandLijst[0]["ccn3"] : -1;
            } else {
                land["_id"] = -1;
            }
            return land;
        });

        countries = countries.map(function(naamLand) {
            //console.log(naamLand)
            naamLand.properties["_data"] = defaults.filter(function(landNaamOmzetten) { return landNaamOmzetten["field"] === naamLand.field; })[0];
            naamLand.properties["_country"] = countrydb.filter(function(landNaamOmzetten) { return +landNaamOmzetten["ccn3"] === naamLand.id; })[0];
            // console.log(naamLand)
            return naamLand;
        });

        //hier zit de animatie in met het hoveren
        svg.selectAll(".country")
            .data(countries)
            .enter().insert("path", ".outline")
            .attr("class", "country foreground")
            .attr("d", path)
            .style("fill", function(landKleurenFill, i) {
                console.log(landKleurenFill)
                //console.log(landKleurenFill.properties["_data"])
                return (landKleurenFill.properties["_data"] && landKleurenFill.properties["_data"][field] !== null) ? colors(landKleurenFill.properties["_data"][field]) : '#f8f8f8';
            })
            .on("mouseover", function(popup) {
                console.log(str)
                tooltip.transition()
                .duration(200)
                .style("opacity", 0.9);
                
                var str = popup.properties["_country"] ? popup.properties["_country"].name : "Unknown";
                str += (popup.properties["_data"] && popup.properties["_data"][field] !== null) ? ": " + popup.properties["_data"][field] : "";
                tooltip.html(str)
                    .style("left", (d3.event.pageX) + "px")
                    .style("top", (d3.event.pageY - 30) + "px");
            })
            .on("mouseout", function(popupWeg) {
                tooltip.transition()
                .duration(500)
                .style("opacity", 0);
            });


        if (projtype === 'orthographic') {
            d3.select("#footer").style("visibility", "visible");
            d3.select("#rotstate")
                .on("change", function() {
                    rotating = d3.select(this).property('checked');
                });
            svg.selectAll(".foreground")
                .call(d3.geo.zoom().projection(projection)
                .scaleExtent([projection.scale() * .7, projection.scale() * 10])
                .on("zoom.redraw", function() {
                    d3.event.sourceEvent.preventDefault();
                    svg.selectAll("path").attr("d", path);
                }));
        // d3.timer(function() {
        //     if (!rotating) {
        //         return;
        //     }
        //     var rot = projection.rotate();
        //     projection.rotate([rot[0] + speed, rot[1], rot[2]]);
        //     svg.selectAll("path").attr("d", path);
        // });
    }
    if (window.parent !== window) {
        var myheight = document.documentElement.scrollHeight || document.body.scrollHeight;
        window.parent.postMessage({height: myheight}, '*');
    }
}

}