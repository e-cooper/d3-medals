draw_bar_chart();

function draw_bar_chart() {

    var margin = {top: 20, right: 20, bottom: 130, left: 40},
        width = 960 - margin.left - margin.right,
        height = 600 - margin.top - margin.bottom;

    var format = d3.format("");

    var x0 = d3.scale.ordinal().rangeRoundBands([0, width], .1),
        x1 = d3.scale.ordinal(),
        y = d3.scale.linear().range([height, 0]);

    var xAxis = d3.svg.axis()
                      .scale(x0)
                      .orient("bottom"),
        yAxis = d3.svg.axis()
                      .scale(y)
                      .orient("left")
                      .tickFormat(d3.format(""));

    d3.csv("https://dl.dropboxusercontent.com/u/40727734/US_medals.csv", function(data) {

        var medalCounts = d3.keys(data[0]).filter(function(key) { return key !== "Games" && key !== "Comments"; });

        var svg = d3.select(".bar-chart").append("svg")
                    .attr("class", "graph")
                    .attr("width", width + margin.left + margin.right)
                    .attr("height", height + margin.top + margin.bottom)
                    .append("g")
                    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

        data.forEach(function(d) { 
            d.medals = medalCounts.map(function(name) { return {name: name, value: +d[name]}; });
        });

        x0.domain(data.map(function(d) { return d.Games; }));    
        x1.domain(medalCounts).rangeRoundBands([0, x0.rangeBand()]);
        y.domain([0, d3.max(data, function(d) { return d3.max(d.medals, function(d) { return d.value; }); })]);

        svg.append("g")
            .attr("class", "x axis")
            .attr("transform", "translate(0," + height + ")")
            .call(xAxis)
            .selectAll("text")
                .style("text-anchor", "start")
                .attr("dx", ".8em")
                .attr("transform", "rotate(65)");

        svg.append("g")
            .attr("class", "y axis")
            .call(yAxis)
            .append("text")
            .attr("transform", "rotate(-90)")
            .attr("y", 6)
            .attr("dy", ".71em")
            .style("text-anchor", "end")
            .text("Medals");

        var games = svg.selectAll(".games")
                        .data(data)
                        .enter().append("g")
                        .attr("class", "g")
                        .attr("transform", function(d) { return "translate(" + x0(d.Games) + ",0)"; });

        games.selectAll("rect")
                .data(function(d) { return d.medals; })
                .enter().append("rect")
                .attr("class", function(d) { return d.name; })
                .attr("width", x1.rangeBand())
                .attr("x", function(d) { return x1(d.name); })
                .attr("y", function(d) { return y(d.value); })
                .attr("height", function(d) { return height - y(d.value); });

        d3.select("#dropdown").on("change", change);

        function change() {

            var value = this.value;

            if (value === "Total Medals") {
                var x_value = x0.domain(data.sort(function(a, b) { return b.Total - a.Total; })
                                .map(function(d) { return d.Games; }))
                                .copy();
            }
            else if (value === "Year") {
                var x_value = x0.domain(data.sort(function(a, b) { return d3.ascending(a.Games, b.Games); })
                                .map(function(d) { return d.Games; }))
                                .copy();  
            }

            var transition = svg.transition().duration(750),
                delay = function(d, i) { return i * 50; };

            transition.selectAll("g.g")
                .delay(delay)
                .attr("transform", function(d) { return "translate(" + x_value(d.Games) + ",0)"; });

            transition.select(".x.axis")
                .call(xAxis)
                .selectAll("text")
                .style("text-anchor", "start")
                .attr("dx", ".8em")
                .selectAll("g")
                .delay(delay);
        }   
    });
}