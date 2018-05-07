// load the map
 	var mymap = L.map('mapid').setView([51.505, -0.09], 13);
	// load the tiles
	L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token=pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4NXVycTA2emYycXBndHRqcmZ3N3gifQ.rJcFIG214AriISLbB6B5aw', {
		maxZoom: 18,
		attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, ' + '<a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>,' + 'Imagery © <a href="http://mapbox.com">Mapbox</a>',
		id: 'mapbox.streets'
	}).addTo(mymap);
	var clientA;
	// and a variable that will hold the layer itself – we need to do this outside the function so that we can use it to remove the layer later on
	var formDatalayer;
//getPOI -view data as GeoJSON
	function showFormData() {
		clientA = new XMLHttpRequest();
		clientA.open('GET','http://developer.cege.ucl.ac.uk:30271/getGeoJSON/questionform/geom');
		clientA.onreadystatechange = showFormDataResponse; // note don't use earthquakeResponse() with brackets as that doesn't work
		clientA.send();
	}
	// create the code to wait for the response from the data server, and process the response once it is received
	function showFormDataResponse() {
		// this function listens out for the server to say that the data is ready - i.e. has state 4
	if (clientA.readyState == 4) {
	// once the data is ready, process the data
	var formData = clientA.responseText;
	loadFormDatalayer(formData);
	}
	}
	// convert the received data - which is text - to JSON format and add it to the map
	function loadFormDatalayer(formData) {
	// convert the text to JSON
	var formDatajson = JSON.parse(formData);
	// add the JSON layer onto the map - it will appear using the default icons
	formDatalayer = L.geoJson(formDatajson).addTo(mymap);
	// change the map zoom so that all the data is shown
	mymap.fitBounds(formDatalayer.getBounds());
	}
/*var clientB;
	// and a variable that will hold the layer itself – we need to do this outside the function so that we can use it to remove the layer later on
	var earthquakelayer;
	// create the code to get the Earthquakes data using an XMLHttpRequest
	function getEarthquakes() {
		clientB = new XMLHttpRequest();
		clientB.open('GET','https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_hour.geojson');
		clientB.onreadystatechange = earthquakeResponse; // note don't use earthquakeResponse() with brackets as that doesn't work
		clientB.send();
	}
	// create the code to wait for the response from the data server, and process the response once it is received
	function earthquakeResponse() {
	// this function listens out for the server to say that the data is ready - i.e. has state 4
	if (clientB.readyState == 4) {
	// once the data is ready, process the data
	var earthquakedata = clientB.responseText;
	loadEarthquakelayer(earthquakedata);
	}
	}
	// convert the received data - which is text - to JSON format and add it to the map
	function loadEarthquakelayer(earthquakedata) {
	// convert the text to JSON
	var earthquakejson = JSON.parse(earthquakedata);
	// add the JSON layer onto the map - it will appear using the default icons
	earthquakelayer = L.geoJson(earthquakejson).addTo(mymap);
	// change the map zoom so that all the data is shown
	mymap.fitBounds(earthquakelayer.getBounds());
	} */


//Track users' location, when user is close to the points set in database, a pop-up will show to notice user fill the quiz
//Track location function, use navigator to define and navigate position of user
function trackLocation() {
 if (navigator.geolocation) {
 navigator.geolocation.watchPosition(showPosition);
 } else {
 document.getElementById('showLocation').innerHTML = "Geolocation is not supported by this browser.";
 }
 navigator.geolocation.watchPosition(getDistanceFromPoint);
}

//Show users'location to calculate the distance
function showPosition(position) {
 document.getElementById('showLocation').innerHTML = "Latitude: " + position.coords.latitude +
 "<br>Longitude: " + position.coords.longitude;
 L.circle([position.coords.latitude, position.coords.longitude], 5, {
color: 'blue',
fillColor: '#f03',
fillOpacity: 0.5
}).addTo(mymap).bindPopup(position.coords.latitude.toString()+","+position.coords.longitude.toString()+"<br />I am here.").openPopup();
}

//Set a function to load geoJSON file from database
//This should be carefully when use the url for security consideration - not supported by some browsers
function getJSON(url) {
        var resp ;
        var xmlHttp ;

        resp  = '' ;
        xmlHttp = new XMLHttpRequest();

        if(xmlHttp != null)
        {
            xmlHttp.open( "GET", url, false );
            xmlHttp.send( null );
            resp = xmlHttp.responseText;
        }

        return resp ;
    }

function getDistanceFromPoint(position) {
// find the coordinates of a point using the url:
var geoJSONString = getJSON('http://developer.cege.ucl.ac.uk:30271/getGeoJSON/questionform/geom');
var geoJSON = JSON.parse(geoJSONString);
alert(geoJSON[0].features[1].geometry.coordinates[1]);

for(var i = 0; i < geoJSON[0].features.length; i++) {
var feature = geoJSON[0].features[i];
    for (component in feature){
	    if (component =="geometry"){
		    for (geometry in feature[component]){
			     var lng=feature[component][geometry][0];
				 var lat=feature[component][geometry][1];
				 
//alert(lng);
// return the distance in kilometers
                 var distance = calculateDistance(position.coords.latitude, position.coords.longitude, lat,lng, 'K');
                 document.getElementById('showDistance').innerHTML = "Distance: " + distance;
                     if (distance<0.16){
	                 L.marker([lat, lng]).addTo(mymap).bindPopup("<b>You were at "+ lng + " "+lat+"!</b>").openPopup();}
 }
 }
 }
 }
}


// code adapted from https://www.htmlgoodies.com/beyond/javascript/calculate-the-distance-between-two-points-inyour-web-apps.html
function calculateDistance(lat1, lon1, lat2, lon2, unit) {
 var radlat1 = Math.PI * lat1/180;
 var radlat2 = Math.PI * lat2/180;
 var radlon1 = Math.PI * lon1/180;
 var radlon2 = Math.PI * lon2/180;
 var theta = lon1-lon2;
 var radtheta = Math.PI * theta/180;
 var subAngle = Math.sin(radlat1) * Math.sin(radlat2) + Math.cos(radlat1) * Math.cos(radlat2) * Math.cos(radtheta);
 subAngle = Math.acos(subAngle);
 subAngle = subAngle * 180/Math.PI; // convert the degree value returned by acos back to degrees from radians
 dist = (subAngle/360) * 2 * Math.PI * 3956; // ((subtended angle in degrees)/360) * 2 * pi * radius )
// where radius of the earth is 3956 miles
 if (unit=="K") { dist = dist * 1.609344 ;} // convert miles to km
 if (unit=="N") { dist = dist * 0.8684 ;} // convert miles to nautical miles
 return dist;
 }


/*
//The div function is in httpServer.js
var xhr; // define the global variable to process the AJAX request
function callDivChange() {
xhr = new XMLHttpRequest();
xhr.open("GET", "test.html", true);
xhr.onreadystatechange = processDivChange;
//try {
//xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
//}
//catch (e) {
// this only works in internet explorer
//}
xhr.send();
}
function processDivChange() {
if (xhr.readyState < 4) {}// while waiting response from server
//document.getElementById('div1').innerHTML = "Loading...";
else {
	if (xhr.readyState === 4) {// 4 = Response from server has been completely loaded.
//if (xhr.status == 200 && xhr.status < 300)
// http status between 200 to 299 are all successful
		document.getElementById('div1').innerHTML = xhr.responseText;
	}
}
} */
