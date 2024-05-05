<script>
    import { onMount } from 'svelte';
    import { load } from './+page.js';
    import * as d3 from 'd3';
    let jsonData = [];
    let filteredData = [];
    let compareData=[];
    let loading = true; // Add a loading state
  
    // Variables to store user input
    let selectedMonth = '';
    let selectedYear = '';
    let selectedPlantKey = '';
    let selectedMaterialKey = '';
    let cselectedMonth = '';
    let cselectedYear = '';
    let cselectedPlantKey = '';
    let cselectedMaterialKey = '';
    let comparing = false; // Variable to track whether comparison is active
  
  
    onMount(async () => {
      const { jsonData: data } = await load({ fetch });
      jsonData = data;
      loading = false; // Update loading state when data is fetched
    });
  
    function handleSubmit() {
      // Reset filteredData
      filteredData = [];
      
      // Iterate over jsonData to find matching entries
      for (let i = 0; i < jsonData.length; i++) {
        const entry = jsonData[i];
        // Convert "Month" value to string before comparing
        if (entry.Month.toString() === selectedMonth && entry.Year.toString() === selectedYear && entry.PlantKey.toString() === selectedPlantKey && entry.MaterialKey.toString() === selectedMaterialKey) {
          filteredData.push(entry);
        }
      }
  
    }
    function handleSubmit2() {
      // Reset filteredData
      compareData = [];
      // Iterate over jsonData to find matching entries
      for (let i = 0; i < jsonData.length; i++) {
        const entry1 = jsonData[i];
        
        // Convert "Month" value to string before comparing
        if (entry1.Month.toString() === cselectedMonth && entry1.Year.toString() === cselectedYear && entry1.PlantKey.toString() === cselectedPlantKey && entry1.MaterialKey.toString() === cselectedMaterialKey) {
         
          compareData.push(entry1);
        }
      
      }
      console.log('cd', compareData[0])
      // Draw radar chart
      drawRadarChart();
    }
    function handleCompare() {
        comparing = true;
        // Draw radar chart again to include comparison plant
        
    }
    function drawRadarChart() {
        const labels = ['DeliveryDelay', 'GoodsReceiptDelay', 'ArrivalDelay', 'ShipmentDelay', 'inventory_proportion', 'Percentage Increase'];

// Filter out the corresponding data values
        const dataValues = filteredData.map(entry => {
        return [
        entry['DeliveryDelay'],
        entry['GoodsReceiptDelay'],
        entry['ArrivalDelay'],
        entry['ShipmentDelay'],
        entry['inventory_proportion'],
        entry['Percentage Increase']
      ];
        });

        const cdataValues = compareData.map(entry => {
        return [
        entry['DeliveryDelay'],
        entry['GoodsReceiptDelay'],
        entry['ArrivalDelay'],
        entry['ShipmentDelay'],
        entry['inventory_proportion'],
        entry['Percentage Increase']
      ];
        });

        console.log('labels:', labels);
        console.log('dataValues:', dataValues);
        console.log('cdataValues:', cdataValues);
        // Remove any existing radar chart
        d3.select("#radarChart svg").remove();

        // Set up dimensions and scales
        const width = 800; // Adjust the width of the SVG container
        const height = 600; // Adjust the height of the SVG container
        const radius = Math.min(width, height) / 2 - 50; // Adjust the radius to leave some margin
        const angleSlice = Math.PI * 2 / labels.length;

        // Create SVG container
        const svg = d3.select("#radarChart")
            .append("svg")
            .attr("width", width)
            .attr("height", height)
            .append("g")
            .attr("transform", `translate(${width / 2}, ${height / 2})`);

        // Create radial scale
        const rScale = d3.scaleLinear()
            .domain([-1, 1])
            .range([0, radius]);

        // Create axes
        const axes = svg.selectAll(".axis")
            .data(labels)
            .enter()
            .append("g")
            .attr("class", "axis");

        axes.append("line")
            .attr("x1", (d, i) => rScale(-1) * Math.cos(angleSlice * i - Math.PI / 2))
            .attr("y1", (d, i) => rScale(-1) * Math.sin(angleSlice * i - Math.PI / 2))
            .attr("x2", (d, i) => rScale(1) * Math.cos(angleSlice * i - Math.PI / 2))
            .attr("y2", (d, i) => rScale(1) * Math.sin(angleSlice * i - Math.PI / 2))
            .attr("class", "line")
            .style("stroke", "black")
            .style("stroke-width", "4px");

        axes.append("text")
            .attr("x", (d, i) => rScale(1.1) * Math.cos(angleSlice * i - Math.PI / 2))
            .attr("y", (d, i) => rScale(1.1) * Math.sin(angleSlice * i - Math.PI / 2))
            .attr("dy", "0.35em")
            .text(d => d)
            .style("font-size", "20px")
            .style("text-anchor", (d, i) => (i < labels.length / 2) ? "start" : "end");

        const hexagonRadiusStep = radius / 5; // Divide the radius into 5 steps
        for (let i = 1; i <= 5; i++) {
          const hexagonRadius = hexagonRadiusStep * i;
          const hexagon = svg.append("polygon")
            .attr("points", d3.range(6).map(angle => {
                const x = hexagonRadius * Math.cos((angle * Math.PI / 3) + (Math.PI / 6));
                const y = hexagonRadius * Math.sin((angle * Math.PI / 3) + (Math.PI / 6));
                return `${x},${y}`;
              }).join(" "))
            .attr("fill", "none")
            .attr("stroke", "black")
            .attr("stroke-width", 2)
            .attr("opacity", 0.5);
         }

        const dots = svg.selectAll(".dot")
            .data(dataValues[0])
            .enter()
            .append("circle")
            .attr("class", "dot")
            .attr("cx", (d, i) => rScale(d) * Math.cos(angleSlice * i - Math.PI / 2))
            .attr("cy", (d, i) => rScale(d) * Math.sin(angleSlice * i - Math.PI / 2))
            .attr("r", 5)
            .style("fill", "red")
            .on("mouseover", function(d, i) {
              d3.select(this).style("fill", "blue"); // Change dot color on hover
              tooltip.style("opacity", 1); // Show tooltip
              tooltip.html(`Value: ${d}`) // Set tooltip text
                .style("left", `${d3.event.pageX}px`) // Position tooltip
                .style("top", `${d3.event.pageY}px`);
              })
            .on("mouseout", function(d, i) {
              d3.select(this).style("fill", "red"); // Restore original dot color on mouseout
              tooltip.style("opacity", 0); // Hide tooltip
              });
          
        const tooltip = d3.select("#radarChart")
            .append("div")
            .attr("class", "tooltip")
            .style("opacity", 0);
        

        const dotCoordinates = dataValues[0].map((d, i) => [
            rScale(d) * Math.cos(angleSlice * i - Math.PI / 2),
            rScale(d) * Math.sin(angleSlice * i - Math.PI / 2)
                ]);
        const joinedDots = svg.append("polygon")
            .attr("points", dotCoordinates)
            .attr("fill", "red")
            .attr("opacity", 0.7);

        const dots1 = svg.selectAll(".dot1")
            .data(cdataValues[0])
            .enter()
            .append("circle")
            .attr("class", "dot1")
            .attr("cx", (d, i) => rScale(d) * Math.cos(angleSlice * i - Math.PI / 2))
            .attr("cy", (d, i) => rScale(d) * Math.sin(angleSlice * i - Math.PI / 2))
            .attr("r", 5)
            .style("fill", "blue");

        const dotCoordinates1 = cdataValues[0].map((d, i) => [
            rScale(d) * Math.cos(angleSlice * i - Math.PI / 2),
            rScale(d) * Math.sin(angleSlice * i - Math.PI / 2)
                ]);
        const joinedDots1 = svg.append("polygon")
            .attr("points", dotCoordinates1)
            .attr("fill", "blue")
            .attr("opacity", 0.5);
        
        // Define the coordinates of the end points of the blue lines
        const lineCoordinates = labels.map((label, i) => [
            rScale(1) * Math.cos(angleSlice * i - Math.PI / 2),
            rScale(1) * Math.sin(angleSlice * i - Math.PI / 2)
            ]);

// Append the first point to the end to close the hexagon
        lineCoordinates.push(lineCoordinates[0]);

// Draw the hexagon
        svg.append("polygon")
            .attr("points", lineCoordinates)
            .attr("fill", "none")
            .attr("stroke", "black")
            .attr("stroke-width", 10);

        svg.append("text")
            .attr("x", -width / 2)
            .attr("y", 270)
            .text("First Selected Option")
            .style("font-size", "18px")
            .style("fill", "red");

        svg.append("text")
            .attr("x", -width / 2)
            .attr("y", 290)
            .text("Second Selected Option")
            .style("font-size", "18px")
            .style("fill", "blue");

        svg.append("text")
            .attr("x", -200)
            .attr("y", -270)
            .text("Radar Chart with normalized metrics (-1 to 1)")
            .style("font-size", "25px")
            .style("fill", "black")
            .style("font-weight", "bold");

        const scaleValues = [-1, 1]; // Include -1, 0, and 1 for the scale

// Add text labels for scale values
        const scaleLabels = svg.selectAll(".scale-label")
            .data(scaleValues)
            .enter()
            .append("text")
            .attr("class", "scale-label")
            .attr("x", (d, i) => rScale(d) * Math.cos(angleSlice * i - Math.PI / 2))
            .attr("y", (d, i) => rScale(d) * Math.sin(angleSlice * i - Math.PI / 2))
            .text(d => d)
            .style("font-size", "35px")
            .style("text-anchor", "middle")
            .style("alignment-baseline", "middle")
            .style("fill", "green")
            .style("font-weight", "bold");

    // Add lines for the scale
        const scaleLines = svg.selectAll(".scale-line")
            .data(scaleValues)
            .enter()
            .append("line")
            .attr("class", "scale-line")
            .attr("x1", 0)
            .attr("y1", 0)
            .attr("x2", (d, i) => rScale(d) * Math.cos(angleSlice * i - Math.PI / 2))
            .attr("y2", (d, i) => rScale(d) * Math.sin(angleSlice * i - Math.PI / 2))
            .style("stroke", "black")
            .style("stroke-width", "1px");

         }
  </script>



<h1>Choose month, year, plant key, and material key for radar plot</h1>

<form on:submit|preventDefault={handleSubmit}>
    <label for="year">Select Year:</label>
    <select bind:value={selectedYear} id="Year" name="Year">
        <option value="2022">2022</option>
        <option value="2023">2023</option>
    </select>

    <label for="month">Select Month:</label>
    <select bind:value={selectedMonth} id="Month" name="Month">
        <option value="1">January</option>
        <option value="2">February</option>
        <option value="3">March</option>
        <option value="4">April</option>
        <option value="5">May</option>
        <option value="6">June</option>
        <option value="7">July</option>
        <option value="8">August</option>
        <option value="9">September</option>
        <option value="10">October</option>
        <option value="11">November</option>
        <option value="12">December</option>
    </select>

    <label for="plantKey">Select Plant Key:</label>
    <select bind:value={selectedPlantKey} id="PlantKey" name="PlantKey">
        <option value="4">4</option>
        <option value="5">5</option>
        <option value="6">6</option>
        <option value="7">7</option>
        <option value="8">8</option>
    </select>

    <label for="materialKey">Select Material Key:</label>
    <select bind:value={selectedMaterialKey} id="MaterialKey" name="MaterialKey">
        <option value="1">1</option>
        <option value="2">2</option>
    </select>
    
    <button type="submit">Submit</button>
</form>





<button on:click={handleCompare}>Compare with another option</button>

{#if comparing}
  <form on:submit|preventDefault={handleSubmit2}>
    <label for="compareYear">Select Year:</label>
    <select bind:value={cselectedYear} id="cYear" name="cYear">
      <option value="2022">2022</option>
      <option value="2023">2023</option>
    </select>

    <label for="compareMonth">Select Month:</label>
    <select bind:value={cselectedMonth} id="cMonth" name="cMonth">
      <option value="1">January</option>
      <option value="2">February</option>
      <option value="3">March</option>
      <option value="4">April</option>
      <option value="5">May</option>
      <option value="6">June</option>
      <option value="7">July</option>
      <option value="8">August</option>
      <option value="9">September</option>
      <option value="10">October</option>
      <option value="11">November</option>
      <option value="12">December</option>
    </select>

    <label for="comparePlant">Select Plant Key:</label>
    <select bind:value={cselectedPlantKey} id="cPlantKey" name="cPlantKey">
      <option value="4">4</option>
      <option value="5">5</option>
      <option value="6">6</option>
      <option value="7">7</option>
      <option value="8">8</option>
  </select>

    <label for="ccompareMaterial">Select Material Key:</label>
    <select bind:value={cselectedMaterialKey} id="cMaterialKey" name="cMaterialKey">
      <option value="1">1</option>
      <option value="2">2</option>
    </select>
    
    <button type="submit">Submit</button>
  </form>
{/if}


{#if loading}
  <p>Loading...</p> <!-- Display loading message while data is being fetched -->
{:else}
  {#if filteredData.length > 0}
    <h2>Selected Data:</h2>
    {#each filteredData as entry}
      <div style="white-space: nowrap;"> <!-- Prevent wrapping of keys -->
        {#each Object.keys(entry).slice(0, 10) as key}
          <span>{key}: {entry[key]}</span>&nbsp; <!-- Display first 10 keys and values in one line -->
        {/each}
      </div>
      <div style="white-space: nowrap;"> <!-- Prevent wrapping of keys -->
        {#each Object.keys(entry).slice(10) as key}
          <span>{key}: {entry[key]}</span>&nbsp; <!-- Display remaining keys and values in another line -->
        {/each}
      </div>
    {/each}
  <!-- Display message if no data is available -->
  {/if}
  
  {#if compareData.length > 0}
    <h2>Compare Data:</h2>
    {#each compareData as entry}
      <div style="white-space: nowrap;"> <!-- Prevent wrapping of keys -->
        {#each Object.keys(entry).slice(0, 10) as key}
          <span>{key}: {entry[key]}</span>&nbsp; <!-- Display first 10 keys and values in one line -->
        {/each}
      </div>
      <div style="white-space: nowrap;"> <!-- Prevent wrapping of keys -->
        {#each Object.keys(entry).slice(10) as key}
          <span>{key}: {entry[key]}</span>&nbsp; <!-- Display remaining keys and values in another line -->
        {/each}
      </div>
    {/each}
   <!-- Display message if no data is available -->
  {/if}
{/if}





<div id="radarChart" width="800" height="800"></div>