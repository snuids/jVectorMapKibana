// Create an Angular module for this plugin
var module = require('ui/modules').get('jvector_map_vis');

// Minimum and maximum font size tags should have.
var maxFontSize = 32,
	minFontSize = 12;

module.controller('JVectorMapController', function($scope, Private) {

	var filterManager = Private(require('ui/filter_manager'));

	$scope.filter = function(tag) {
		// Add a new filter via the filter manager
		filterManager.add(
			// The field to filter for, we can get it from the config
			$scope.vis.aggs.bySchemaName['locations'][0].params.field,
			// The value to filter for, we will read out the bucket key from the tag
			location.label,
			// Whether the filter is negated. If you want to create a negated filter pass '-' here
			null,
			// The index pattern for the filter
			$scope.vis.indexPattern.title
		);
	};

	$scope.$watch('esResponse', function(resp) {
		if (!resp) {
			$scope.locations = null;
			return;
		}

		// Retrieve the id of the configured tags aggregation
		var locationsAggId = $scope.vis.aggs.bySchemaName['locations'][0].id;
		// Retrieve the metrics aggregation configured
		var metricsAgg = $scope.vis.aggs.bySchemaName['locationsize'][0];
		console.log(metricsAgg);
		// Get the buckets of that aggregation


		console.log('Resp');
		console.log(resp.aggregations);


		var buckets = resp.aggregations[locationsAggId].buckets;

		console.log('buckets');
		console.log(buckets);


		var min = Number.MAX_VALUE,
			max = - Number.MAX_VALUE;



		// Transform all buckets into tag objects
		$scope.locations = buckets.map(function(bucket) {
			// Use the getValue function of the aggregation to get the value of a bucket
			var value = metricsAgg.getValue(bucket);
			// Finding the minimum and maximum value of all buckets
			min = Math.min(min, value);
			max = Math.max(max, value);
			
			console.log('bucket');
			console.log(bucket);
			
			return {
				label: bucket.key,
				geo:decodeGeoHash(bucket.key),
				value: value
			};
		});

		// Calculate the font size for each tag
		$scope.locations = $scope.locations.map(function(location) {
			location.radius = (location.value - min) / (max - min) * (maxFontSize - minFontSize) + minFontSize;

			return location;
		});

		console.log('Iterating');
					
		angular.forEach($scope.locations, function(value, key){
		     console.log(key + ': ' + value);
			 console.log(value);
			 
		});
		
		console.log('Finished');
		
		// Draw Map
		
        $('#map').vectorMap(
  			  {
  				  map: 'world_mill',
  				  markerStyle: {
  			        initial: {
  			          fill: '#F8E23B',
  						stroke: '#383f47',r:5
  			        }
  			      },
  				  backgroundColor: '#C0C0FF',
  				  markers: [
  		        {latLng: [41.90, 12.45], name: 'Vatican City'},
  		        {latLng: [43.73, 7.41], name: 'Monaco'},
  		        {latLng: [-0.52, 166.93], name: 'Nauru'},
  		        {latLng: [-8.51, 179.21], name: 'Tuvalu'},
  		        {latLng: [43.93, 12.46], name: 'San Marino'},
  		        {latLng: [47.14, 9.52], name: 'Liechtenstein'},
  		        {latLng: [7.11, 171.06], name: 'Marshall Islands'},
  			    {latLng: [17.3, -62.73], name: 'Saint Kitts and Nevis',style: {fill: 'rgba(0,255,0,0.5)', r:10}},
  		        {latLng: [3.2, 73.22], name: 'Maldives',style: {fill: 'rgba(0,0,255,0.5)', r:20}},
  		        {latLng: [35.88, 14.5], name: 'Malta'},
  		        {latLng: [12.05, -61.75], name: 'Grenada'},
  		        {latLng: [13.16, -61.23], name: 'Saint Vincent and the Grenadines'},
  		        {latLng: [13.16, -59.55], name: 'Barbados'},
  		        {latLng: [17.11, -61.85], name: 'Antigua and Barbuda'},
  		        {latLng: [-4.61, 55.45], name: 'Seychelles'},
  		        {latLng: [7.35, 134.46], name: 'Palau'},
  		        {latLng: [42.5, 1.51], name: 'Andorra'},
  		        {latLng: [14.01, -60.98], name: 'Saint Lucia'},
  		        {latLng: [6.91, 158.18], name: 'Federated States of Micronesia'},
  		        {latLng: [1.3, 103.8], name: 'Singapore'},
  		        {latLng: [1.46, 173.03], name: 'Kiribati'},
  		        {latLng: [-21.13, -175.2], name: 'Tonga'},
  		        {latLng: [15.3, -61.38], name: 'Dominica'},
  		        {latLng: [-20.2, 57.5], name: 'Mauritius'},
  		        {latLng: [26.02, 50.55], name: 'Bahrain'},
  		        {latLng: [0.33, 6.73], name: 'São Tomé and Príncipe'}
  		      	]
  			}
  	  );
      
		
		// End of draw map
		
		
		
	});
});
