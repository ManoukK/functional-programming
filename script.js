
//lengthe en breedte van de map
var width = 960,
height = 500,
sheight = 550;

//draaien van de map
// var speed = 1.0,
// rotating = false;

var defaults= {
title: "",
field: "choCount",
country: "landLabel",
colors: "RdYlGn",
proj: "kavrayskiy",
inverse: ""
};

window.addEventListener('message', function(e) {
    var opts = e.data.opts,
        data = e.data.data;

    return main(opts, data);
});


function main(o, data) {
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

data = data.map(function(d) {
        d[field] = (d[field] === undefined || isNaN(+d[field])) ? null : +d[field];
        return d;
    }).filter(function(d) {
        return d[field] !== null;
    });

var datadomain = d3.extent(data.map(function(x) { return x[field]; })),
    colors = d3.scale.quantize()
                .domain(opts.inverse ? [datadomain[1], datadomain[0]] : datadomain)
                .range(colorbrewer[colorscale][9]);

var x = d3.scale.linear()
            .domain(datadomain)
            .range([0, 240]);

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
    .scale(x)
    .tickSize(13)
    .tickFormat(d3.format(tsign + tf));

var xbar = svg.append("g")
            .attr("transform", "translate(" + (width / 2 - 120) + "," + (sheight - 30) + ")")
            .attr("class", "key");

xbar.selectAll("rect")
        .data(d3.pairs(x.ticks(10)))
    .enter().append("rect")
        .attr("height", 8)
        .attr("x", function(d) { return x(d[0]); })
        .attr("width", function(d) { return x(d[1]) - x(d[0]); })
        .style("fill", function(d) { return colors(d[0]); });

xbar.call(xAxis).append("text")
    .attr("class", "caption")
    .attr("y", -6)
    .attr("x", x(x.ticks(10)[0]))
    .text(opts.title);

    
queue()
    .defer(d3.json, "http://pigshell.com/common/d3.v3/world-110m.json")
    .defer(d3.json, "http://pigshell.com/common/d3.v3/countries.json")
    .await(loaded);

function loaded(err, world, countrydb) {
    var countries = topojson.feature(world, world.objects.countries).features;
    data = data.map(function(x) {
        var c = x[opts.country];
        if (c === undefined) {
            return {};
        }
        if (!isNaN(+c)) {
            c = c.toString();
        }
        if (typeof c === 'string' || c instanceof String) {
            c = c.trim();
            var cl = c.toLowerCase();
            var clist = countrydb.filter(function(i) {
                return i["name"].toLowerCase() === cl ||
                    i["cca3"] === c || i["cca2"] === c ||
                    i["nativeName"] === cl ||
                    +i["ccn3"] === +c || 
                    i["altSpellings"].indexOf(c) !== -1;
            });
            x["_id"] = clist.length ? +clist[0]["ccn3"] : -1;
        } else {
            x["_id"] = -1;
        }
        return x;
    });

    countries = countries.map(function(c) {
        c.properties["_data"] = data.filter(function(x) { return x["_id"] === c.id; })[0];
        c.properties["_country"] = countrydb.filter(function(x) { return +x["ccn3"] === c.id; })[0];
        return c;
    });

    svg.selectAll(".country")
            .data(countries)
        .enter().insert("path", ".outline")
        .attr("class", "country foreground")
        .attr("d", path)
        .style("fill", function(d, i) {
            return (d.properties["_data"] && d.properties["_data"][field] !== null) ? colors(d.properties["_data"][field]) : '#f8f8f8';
        })
        .on("mouseover", function(d) {
            tooltip.transition()
                .duration(200)
                .style("opacity", 0.9);
            var str = d.properties["_country"] ? d.properties["_country"].name : "Unknown";
            str += (d.properties["_data"] && d.properties["_data"][field] !== null) ? ": " + d.properties["_data"][field] : "";
            tooltip.html(str)
                .style("left", (d3.event.pageX) + "px")
                .style("top", (d3.event.pageY - 30) + "px");
        })
        .on("mouseout", function(d) {
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

if (window.location.hash === "") {
d3.csv("queryResults.csv", function(err, data) {
    main({}, data);
    console.log(ds.csv);
});
}