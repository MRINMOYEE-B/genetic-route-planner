'use strict'

const fs = require('fs')

const optimalRoute = require('./optimal-route')

fs.writeFile('index.html', `
	<!DOCTYPE html>
	<html lang="en">
		<head>
			<meta charset="utf-8">
			<meta name="viewport" content="initial-scale=1.0, user-scalable=no">

			<title>Genetic Algorithm Optimal Path</title>
			<style>
				html, body, #map-canvas {
					height: 100%;
					margin: 0px;
					padding: 0px
				}
				#panel {
					position: absolute;
					top: 5px;
					left: 50%;
					margin-left: -180px;
					z-index: 5;
					background-color: #fff;
					padding: 10px;
					border: 1px solid #999;
				}
			</style>
			<script src="https://maps.googleapis.com/maps/api/js?v=3.exp&signed_in=true"></script>
			<script>
				var routes_list = []
				var markerOptions = {
					icon: 'http://maps.gstatic.com/mapfiles/markers2/marker.png'
				}
				var directionsDisplayOptions = {
					preserveViewport: true,
					markerOptions: markerOptions
				}
				var directionsService = new google.maps.DirectionsService()
				var map

				function initialize() {
					var center = new google.maps.LatLng(39, -96)
					var mapOptions = {
						zoom: 5,
						center: center
					}

					map = new google.maps.Map(document.getElementById('map-canvas'), mapOptions)

					for (var i = 0; i < routes_list.length; i++) {
						routes_list[i].setMap(map)
					}
				}

				function calcRoute(start, end, routes) {
					var directionsDisplay = new google.maps.DirectionsRenderer(directionsDisplayOptions)
					var waypts = []

					for (var i = 0; i < routes.length; i++) {
						waypts.push({
							location:routes[i],
							stopover:true
						})
					}

					var request = {
						origin: start,
						destination: end,
						waypoints: waypts,
						optimizeWaypoints: false,
						travelMode: google.maps.TravelMode.DRIVING
					}

					directionsService.route(request, function (response, status) {
						if (status === google.maps.DirectionsStatus.OK) {
							directionsDisplay.setDirections(response)
						}
					})

					routes_list.push(directionsDisplay)
				}

				function createRoutes(route) {
					// Google's free map API is limited to 10 waypoints so need to break into batches
					route.push(route[0])
					var subset = 0

					while (subset < route.length) {
						var waypointSubset = route.slice(subset, subset + 10)
						var startPoint = waypointSubset[0]
						var midPoints = waypointSubset.slice(1, waypointSubset.length - 1)
						var endPoint = waypointSubset[waypointSubset.length - 1]

						calcRoute(startPoint, endPoint, midPoints)
						subset += 9
					}
				}

				optimal_route = ${JSON.stringify(optimalRoute)}

				createRoutes(optimal_route)

				google.maps.event.addDomListener(window, 'load', initialize)
			</script>
		</head>

		<body>
			<div id="map-canvas"></div>
		</body>
	</html>
`)
