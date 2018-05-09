

// load the leaflet map
var mymap = L.map('mapid').setView([51.505, -0.09], 13);
// load the tiles
L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token=pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4NXVycTA2emYycXBndHRqcmZ3N3gifQ.rJcFIG214AriISLbB6B5aw', {maxZoom: 18,attribution: 'Map data &copy; <ahref="http://openstreetmap.org">OpenStreetMap</a> contributors, ' +'<a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>,' +'Imagery © <a href="http://mapbox.com">Mapbox</a>',id: 'mapbox.streets'}).addTo(mymap);


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
		
	//Automatically load the question form layer without click buttons	
	document.addEventListener('DOMContentLoaded', function() {
	showFormData();
	}, false);

//Track users' location, when user is close to the points set in database, a pop-up will show to notice user fill the quiz
//Track location function, use navigator to define and navigate position of user
function trackLocation() {
 if (navigator.geolocation) 
                {navigator.geolocation.watchPosition(showPosition);} 
 else           {document.getElementById('showLocation').innerHTML = "Geolocation is not supported by this browser.";}
 
 navigator.geolocation.watchPosition(getDistanceFromPoint);
}

function showPosition(position) {
 document.getElementById('showLocation').innerHTML = "Latitude: " + position.coords.latitude +"<br>Longitude: " + position.coords.longitude;
 L.circle([position.coords.latitude, position.coords.longitude], 5, {
                      color: 'blue',
                      fillColor: '#f03',
                      fillOpacity: 0.5}
	     ).addTo(mymap).bindPopup(position.coords.latitude.toString()+","+position.coords.longitude.toString()+"<br />I am here.").openPopup();
}    //The track will remain if the user doesn't click trackLocation button again, because the time for record position in this function
																													//is set by default

function getDistanceFromPoint(position) {
var geoJSONString = getGeoJSON('http://developer.cege.ucl.ac.uk:30271/getGeoJSON/questionform/geom');
var geoJSON = JSON.parse(geoJSONString);

for(var i = 0; i < geoJSON[0].features.length; i++) {
      var feature = geoJSON[0].features[i];
          for (component in feature){
	          if (component =="geometry"){
	        	    for (geometry in feature[component]){
		    	             var lng=feature[component][geometry][0];
				             var lat=feature[component][geometry][1];
                             // return the distance in kilometers
                             var distance = calculateDistance(position.coords.latitude, position.coords.longitude, lat,lng, 'K');
                                 document.getElementById('showDistance').innerHTML = "Distance: " + distance;
                                       if (distance>0.001){
	                                           L.marker([lat, lng]).addTo(mymap).bindPopup("<b>Within 1km</b>").openPopup();
											            getQuizAnswer(i); //use for loops to update questions and answers related to 
																			//specific locations
														}
                                               }
                              }
                     }
           }
}

function getGeoJSON(url) {
        var resp ;
        var xmlHttp ;
        resp  = '' ;
        xmlHttp = new XMLHttpRequest();
        if(xmlHttp != null)
            {xmlHttp.open( "GET", url, false );
             xmlHttp.send( null );
             resp = xmlHttp.responseText;}
           return resp ;
}

//Set a similar function of the getGeoJSON function above, to obtain the non-geom features: questions and answers in the JSON file
//The additional function is used to avoid crush between choosing coordinates features and question & answers features
function getQJSON(url) {
        var dataQ ;
        var xmlHttp ;
        dataQ  = '' ;
        xmlHttp = new XMLHttpRequest();
        if(xmlHttp != null)
            {xmlHttp.open( "GET", url, false );
             xmlHttp.send( null );
             dataQ = xmlHttp.responseText;}
           return dataQ ;
}



function getQuizAnswer(i) {
var geoJSONString = getQJSON('http://developer.cege.ucl.ac.uk:30271/getGeoJSON/questionform/geom');
var geoJSON = JSON.parse(geoJSONString);
    
    document.getElementById("question").innerHTML =geoJSON[0].features[i].properties.question;
    document.getElementById("a").innerHTML =geoJSON[0].features[i].properties.answera;
    document.getElementById("b").innerHTML =geoJSON[0].features[i].properties.answerb;
    document.getElementById("c").innerHTML =geoJSON[0].features[i].properties.answerc;
    document.getElementById("d").innerHTML =geoJSON[0].features[i].properties.answerd;
}
	
// code retrieved from https://www.htmlgoodies.com/beyond/javascript/calculate-the-distance-between-two-points-inyour-web-apps.html
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
 
 //Upload quiz results to database, which connect the "quizform" table in database
//Upload function similar to the Question App one, but variables differ
function startDataUpload() { //the variables here are local, which are name, mobile ID, question, and answer chosen by users
	//alert ("start data upload");
	var name = document.getElementById("name").value;
	//alert(name);
	//var mobileid = document.getElementById("mobileid").value; //get name and mobile ID value
	var question = document.getElementById("question").textContent;
		question = String(question);
		//alert(question);
		var postString = "name="+name+"&question="+question;

	


// now get the answer values
	if (document.getElementById("ra1").checked) {
		var ranswer=document.getElementById("ra1").value;
 		 postString=postString+"&ranswer="+ranswer;
	}
	if (document.getElementById("ra2").checked) {
		var ranswer=document.getElementById("ra2").value;
 		 postString=postString+"&ranswer="+ranswer;
	}
	if (document.getElementById("ra3").checked) {
		var ranswer=document.getElementById("ra3").value;
 		 postString=postString+"&ranswer="+ranswer;
	}
	if (document.getElementById("ra4").checked) {
		var ranswer=document.getElementById("ra4").value;
		alert(ranswer);
 		 postString=postString+"&ranswer="+ranswer;
		 	}
	
	processData(postString);

}


var client;
function processData(postString) {
	client = new XMLHttpRequest();
	client.open('POST','http://developer.cege.ucl.ac.uk:30271/uploadQuizData',true);
	client.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
	client.onreadystatechange = dataUploaded;
	client.send(postString);
	}
// create the code to wait for the response from the data server, and process the response once it is received
function dataUploaded() {
// this function listens out for the server to say that the data is ready - i.e. has state 4
	if (client.readyState == 4) {
// change the DIV to show the response
		document.getElementById("dataUploadResult").innerHTML = client.responseText;
	}
}
 