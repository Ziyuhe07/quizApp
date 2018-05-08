// load the map
 	var mymap = L.map('mapid').setView([51.505, -0.09], 13);
	// load the tiles
	L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token=pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4NXVycTA2emYycXBndHRqcmZ3N3gifQ.rJcFIG214AriISLbB6B5aw', {
		maxZoom: 18,
		attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, ' + '<a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>,' + 'Imagery © <a href="http://mapbox.com">Mapbox</a>',
		id: 'mapbox.streets'
	}).addTo(mymap);


//Track users' location, when user is close to the points set in database, a pop-up will show to notice user fill the quiz
//Track location function, use navigator to define and navigate position of user
function trackLocation() {
 if (navigator.geolocation) {
 	navigator.geolocation.watchPosition(showPosition);} 
 else {
 	document.getElementById('showLocation').innerHTML = "Geolocation is not supported by this browser.";
 }
 navigator.geolocation.watchPosition(getDistanceFromPoint);
}

//Show users'location to calculate the distance
function showPosition(position) {
 document.getElementById('showLocation').innerHTML = "Latitude: " + position.coords.latitude +"<br>Longitude: " + position.coords.longitude;
 L.circle([position.coords.latitude, position.coords.longitude], 5, {
                      color: 'blue',
                      fillColor: '#f03',
                      fillOpacity: 0.5}
	     ).addTo(mymap).bindPopup(position.coords.latitude.toString()+","+position.coords.longitude.toString()+"<br />I am here.").openPopup();
}

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
											            getQuizAnswer(i); //here triger related question
														}
                                               }
                              }
                     }
           }
} //Set the distance between users'position and the downloaded location, and then according to the location
		//give quiz question and answer if users are near to the location.

//Set a function to load geoJSON file from database
//This should be carefully when use the url for security consideration - not supported by some browsers
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


//Set function to get non geom features from database
function getQuestion(url) {
        var client ;
        var QxmlHttp ;

        client  = '' ;
        QxmlHttp = new XMLHttpRequest();

        if(QxmlHttp != null)
        {
            QxmlHttp.open( "GET", url, false );
            QxmlHttp.send( null );
            client = QxmlHttp.responseText;
        }

        return client ;
    }
    

//Obtain questions and answers from external database by correct order with geom features
//Appear as the coordinates set previously
  function getQuizAnswer(i) {
  	var JSONString = getQuetiondata('http://developer.cege.ucl.ac.uk:30271/getGeoJSON/questionform/geom');
  	var geoJSON = JSON.parse(geoJSONString);
    document.getElementById("question").innerHTML = geoJSON[0].features[i].properties.question;
    document.getElementById("a").innerHTML = geoJSON[0].features[i].properties.answera;
    document.getElementById("b").innerHTML = geoJSON[0].features[i].properties.answerb;
    document.getElementById("c").innerHTML = geoJSON[0].features[i].properties.answerc;
    document.getElementById("d").innerHTML = geoJSON[0].features[i].properties.answerd;
}

// code retrived from https://www.htmlgoodies.com/beyond/javascript/calculate-the-distance-between-two-points-inyour-web-apps.html
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


// Upload collected quiz answer function
function startDataUpload() {
	//alert ("Submitting your answer");
	var question = document.getElementById("question")
	//alert(question);

	var postString = "&question="+question;

	if (document.getElementById("ra1").checked) {
		var answer=document.getElementById("ra1").value;
 		 postString=postString+"&answer"+answer;
	}
	if (document.getElementById("ra2").checked) {
		var answer=document.getElementById("ra2").value;
 		 postString=postString+"&answer"+answer;
	}
	if (document.getElementById("ra3").checked) {
		var answer=document.getElementById("ra3").value;
 		 postString=postString+"&answer"+answer;
	}
	if (document.getElementById("ra4").checked) {
		var answer=document.getElementById("ra4").value;
 		 postString=postString+"&answer"+answer;
	}
	
	processData(postString);

}

var client;
function processData(postString) {
	client = new XMLHttpRequest();
	client.open('POST','http://developer.cege.ucl.ac.uk:30271/uploadAnswer',true);
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