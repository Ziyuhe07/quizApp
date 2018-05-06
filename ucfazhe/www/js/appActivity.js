function menuClicked() {
			alert("You clicked the menu");
}

function replaceGraphs() {
	document.getElementById("graphdiv").innerHTML ="<img src='images/ucl.png'>"
}

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
		clientA.open('GET','http://developer.cege.ucl.ac.uk:30271/getGeoJSON/formdata/geom');
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


//Track location function
	function trackLocation() {
	if (navigator.geolocation) {
	navigator.geolocation.watchPosition(showPosition);
	} else {
	document.getElementById('showLocation').innerHTML = "Geolocation is not supported by this browser.";
	}
	navigator.geolocation.watchPosition(getDistanceFromPoint);
	}

	function showPosition(position) {
	// draw a point on the map
	L.marker([position.coords.latitude, position.coords.longitude]).addTo(mymap)
		.bindPopup("<b>You were at "+ position.coords.longitude + " "+position.coords.latitude+"!</b>");
	mymap.setView([position.coords.latitude, position.coords.longitude], 13);
}


// Get distance from user position to the positions in downloaded data form
function getDistance() {
		  alert('getting distance');
		  // getDistanceFromPoint is the function called once the distance has been found
		  navigator.geolocation.getCurrentPosition(getDistanceFromPoint);
}
function getDistanceFromPoint(position) {
         // find the coordinates of a point using this website:
		 // these are the coordinates for Warren Street
		 var lat = 51.524616;
		 var lng = -0.13818;
		 // return the distance in kilometers
		 var distance = calculateDistance(position.coords.latitude, position.coords.longitude, lat,lng, 'K');
		 document.getElementById('showDistance').innerHTML = "Distance: " + distance;
		 if (distance<0.16){
		 	L.marker([51.525569, -0.136046]).addTo(mymap).bindPopup("<b>Within 10m</b>").openPopup();
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
	subAngle = subAngle * 180/Math.PI; // convert the degree value returned by acos back to degrees from radians
	dist = (subAngle/360) * 2 * Math.PI * 3956; // ((subtended angle in degrees)/360) * 2 * pi * radius )
// where radius of the earth is 3956 miles
	if (unit=="K") { dist = dist * 1.609344 ;} // convert miles to km
	if (unit=="N") { dist = dist * 0.8684 ;} // convert miles to nautical miles
	return dist;
}

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
}