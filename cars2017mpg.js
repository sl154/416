var Data;
var SelectedMake;
var SelectedFuel;
var SelectedFuels = new Set();

function Init() {
    LoadDataSet(CreateUI);
}

async function LoadDataSet(_callback_function) {
    /* Load Dataset */
    Data = await d3.csv("https://flunky.github.io/cars2017.csv");

    /* Data set is loaded. Now call the callback function to create the scene */
    _callback_function();
}

function CreateUI() {
    SetupUIParams();
    LoadScene();
}

function SetupUIParams() {
    const urlParams = new URLSearchParams(window.location.search);
    SelectedMake = urlParams.get("Make");
    SelectedFuel = urlParams.get("Fuel"); 

    SelectedFuels.clear();
    if(null != SelectedFuel)
        SelectedFuels.add(SelectedFuel);  
    /* Set the Title based on the Scene we are in */
    SetTitleAndCheckBoxes();
}

function LoadScene() {

    /* Get the data based on the scene we are in */
    const data = getSelectedMakerFuelData();

    var svg = d3.select("svg");

    /* Clear the previous scene */
    svg.selectAll("*").remove();

    var padding = {top:100, right:100, bottom:100, left:100};
    var chartArea = {
                        "width":parseInt(svg.style("width")) - padding.left - padding.right,
                        "height":parseInt(svg.style("height")) - padding.top - padding.bottom
                    };
    
    // Create Scales
    var yScale = d3.scaleLog().domain([10,150]).range([chartArea.height, 0]);
    var xScale = d3.scaleLog().domain([10,150]).range([0, chartArea.width]);
    
    // Create circles
    svg.append("g")
       .attr("transform", "translate("+padding.left+","+padding.top+")")
       .selectAll("circle").data(data).enter()
         .append("circle")
         .attr("cx", function(d,i) { return xScale(parseInt(d.AverageCityMPG)); })
         .attr("cy", function(d,i) { return yScale(parseInt(d.AverageHighwayMPG)); })
         .attr("r", function(d,i) { return ( 5 + (2 * parseInt(d.EngineCylinders))); })
         .attr("stroke", function(d) {
             if("Gasoline" == d.Fuel) return "red";
             else if ("Diesel" == d.Fuel) return "yellow";
             else if ("Electricity" == d.Fuel) return "blue";
             else return "black";
         })
         .on('mouseover', function(d)
         {
             d3.select(this).classed("mouseover-maker", true);
         })
         .on('mouseout', function(d)
         {
             d3.select(this).classed("mouseover-maker", false);
         })
         .on('click', function(d)
         {
             if(null == SelectedFuel) {
                d3.select(this).classed("mouseover-country", false);
                SelectedMaker = d.Make;
                window.location.href = "fuel.html?Make=" + d.Make + "&Fuel=" + d.Fuel;
             }
         })
         .append("title")
         .text(function(d) 
         {
            var toolTipText = "Make: " + d.Make + "\n" +
                              "Number of Cylinders: " + d.EngineCylinders + "\n" +
                              "Fuel: " + d.Fuel + "\n" +
                              "City MPG: " + d.AverageCityMPG + "\n" +
                              "Highway MPG: " + d.AverageHighwayMPG;
            return toolTipText;
         });

    // Create Axises
    svg.append("g")
       .attr("transform", "translate("+padding.left+","+padding.top+")")
       .call(d3.axisLeft(yScale)
       .tickValues([10, 20, 50, 100])
       .tickFormat(d3.format("~s")())
       .tickFormat((d, i) => ['10', '20', '50', '100'][i]) );
    
    svg.append("g")
       .attr("transform", "translate("+padding.left+","+ 
          (chartArea.height+padding.top)+")")
       .call(d3.axisBottom(xScale)
       .tickValues([10, 20, 50, 100])
       .tickFormat(d3.format("~s")())
       .tickFormat((d, i) => ['10', '20', '50', '100'][i]));

    // Axis Labels
    svg.append("text")
        .attr("class", "mainXlabel")
        .attr("text-anchor", "end")
        .attr("x", parseInt(svg.style("width"))/2)
        .attr("y", parseInt(svg.style("height")) - 65)
        .style("font-family", "verdana")
        .style("fill", "dark gray")             
        .text("Average City Mileage (MPG)");    

    svg.append("text")
        .attr("class", "mainYlabel")
        .attr("text-anchor", "end")
        .attr("x", -200)
        .attr("y", 50)
        .attr("dy", ".5em")
        .attr("transform", "rotate(-90)")
        .style("font-family", "verdana")
        .style("fill", "dark gray")             
        .text("Average Highway Mileage (MPG)");

    // Annotations
    svg.append("text")
        .attr("class", "annotation")
        .attr("x", parseInt(svg.style("width")) - 400)
        .attr("y", parseInt(svg.style("height")) - 250)
        .style("font-family", "verdana")
        .style("fill", "olive")             
        .text(function(d) {
                return "Size of Circle: Number of Cylinders.";
        })
    svg.append("text")
        .attr("class", "annotation")
        .attr("x", parseInt(svg.style("width")) - 400)
        .attr("y", parseInt(svg.style("height")) - 250)
        .attr("dy", "1em")
        .style("font-family", "verdana")   
        .style("fill", "olive")     
        .text(function(d) {
            return "Red Circle: Gasoline Car.";
        })
    svg.append("text")
    .attr("class", "annotation")
    .attr("x", parseInt(svg.style("width")) - 400)
    .attr("y", parseInt(svg.style("height")) - 250)
    .attr("dy", "2em")
    .style("font-family", "verdana")
    .style("fill", "olive")             
    .text(function(d) {
            return "Yellow Circle: Diesel Car.";
    })
    svg.append("text")
    .attr("class", "annotation")
    .attr("x", parseInt(svg.style("width")) - 400)
    .attr("y", parseInt(svg.style("height")) - 250)
    .attr("dy", "3em")
    .style("font-family", "verdana")   
    .style("fill", "olive")          
    .text(function(d) {
            return "Blue Circle: Electric Car.";
    })
    svg.append("text")
        .attr("class", "annotation")
        .attr("x", parseInt(svg.style("width")) - 410)
        .attr("y", parseInt(svg.style("height")) - 600)
        .style("font-family", "verdana")
        .style("fill", "olive")             
        .text(function(d) {
            if(null == SelectedMake)            
                return "Electric cars: Range on full charge instead of MPG.";
    })
    svg.append("text")
        .attr("class", "annotation")
        .attr("x", 45)
        .attr("y", parseInt(svg.style("height")) - 130)
        .style("font-family", "verdana")
        .style("fill", "olive")             
        .text(function(d) {
            if(null == SelectedMake)
                return "Higher the number of cylinders, lower the MPG.";
    });
}

function GoHome() {
    /* Got back to Scene1 */
    SelectedMaker = null;
    window.location.href = "index.html";
}

function SetTitleAndCheckBoxes() {
    if(null != SelectedFuel) {
        document.getElementById("heading").innerText = 
                "Fuel Efficiency of Model Year 2017 Cars Made by " + SelectedMake;
        document.getElementById(SelectedFuel + "-checkbox").checked = true; 
    }
    else {
        document.getElementById("heading").innerText = "Fuel Efficiency of Model Year 2017 Cars";
    }
}

function UpdateSelectedFuels() {
    SelectedFuels.clear();
    var gas_checkbox = document.getElementById("Gasoline-checkbox");
    if(null != gas_checkbox && gas_checkbox.checked)
        SelectedFuels.add("Gasoline");
    var diesel_checkbox = document.getElementById("Diesel-checkbox");        
    if(null != diesel_checkbox && diesel_checkbox.checked)
        SelectedFuels.add("Diesel");
    var elec_checkbox = document.getElementById("Electricity-checkbox");        
    if(null != elec_checkbox && elec_checkbox.checked)
        SelectedFuels.add("Electricity");

    LoadScene();
}

function getSelectedMakerFuelData() {
    var data = [];

    if((null == SelectedMake) || (null == SelectedFuel))
        return Data;

    for(j = 0; j < Data.length; j++) {
        if((SelectedMake === Data[j].Make) && SelectedFuels.has(Data[j].Fuel))
            data.push(Data[j]);
    }
    return data;
}
