// Create an Angular module for this plugin
var module = require('ui/modules').get('jvector_map_vis');


module.controller('JVectorMapController', function($scope, Private) {

	var filterManager = Private(require('ui/filter_manager'));

	$scope.refine_interval=function (interval, cd, mask) 
	{
		if (cd&mask)
			interval[0] = (interval[0] + interval[1])/2;
	  	else
			interval[1] = (interval[0] + interval[1])/2;
	}
	
	$scope.hexToRGB = function(hex){
		 	hex=hex.replace(/#/g,'');
		    var r = parseInt('0x'+hex[0]+hex[1]);
		    var g = parseInt('0x'+hex[2]+hex[3]);
		    var b = parseInt('0x'+hex[4]+hex[5]);
	    	return [r,g,b];
	}
	
	$scope.decodeGeoHash=function(geohash) {
		var BITS = [16, 8, 4, 2, 1];
		var BASE32 = "0123456789bcdefghjkmnpqrstuvwxyz";
	
		var is_even = 1;
		var lat = []; 
		
		lat[0] = -90.0;  
		lat[1] = 90.0;

		var lon = [];
		lon[0] = -180.0; 
		lon[1] = 180.0;

		var lat_err = 90.0;  
		var lon_err = 180.0;
	
		for (var i=0; i<geohash.length; i++) {
			var c = geohash[i];
			var cd = BASE32.indexOf(c);
			for (var j=0; j<5; j++) {
				var mask = BITS[j];
				if (is_even) 
				{
					lon_err /= 2;
					$scope.refine_interval(lon, cd, mask);
				} else 
				{
					lat_err /= 2;
					$scope.refine_interval(lat, cd, mask);
				}
				is_even = !is_even;
			}
		}
		lat[2] = (lat[0] + lat[1])/2;
		lon[2] = (lon[0] + lon[1])/2;

		return { latitude: lat, longitude: lon};
	}

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

		if($scope.vis.aggs.bySchemaName['locations']== undefined)
		{
			$scope.locations = null;
			return;
		}

		// Retrieve the id of the configured tags aggregation
		var locationsAggId = $scope.vis.aggs.bySchemaName['locations'][0].id;
		// Retrieve the metrics aggregation configured
		var metricsAgg = $scope.vis.aggs.bySchemaName['locationsize'][0];
		var buckets = resp.aggregations[locationsAggId].buckets;



		var min = Number.MAX_VALUE;
		var max = - Number.MAX_VALUE;



		// Transform all buckets into tag objects
		$scope.locations = buckets.map(function(bucket) {
			// Use the getValue function of the aggregation to get the value of a bucket
			var value = metricsAgg.getValue(bucket);
			// Finding the minimum and maximum value of all buckets
			min = Math.min(min, value);
			max = Math.max(max, value);
			
			return {
				label: bucket.key,
				geo:$scope.decodeGeoHash(bucket.key),
				value: value
			};
		});

		var circlecolormin=$scope.hexToRGB($scope.vis.params.circleColorMin)		
		var circlecolormax=$scope.hexToRGB($scope.vis.params.circleColorMax)		
		var circlecolor=circlecolormin;


		// Calculate the font size for each tag
		$scope.locations = $scope.locations.map(function(location) {
			if(max!=min)
			{
				var tmpval=(location.value - min) / (max - min);
				location.radius = parseInt(tmpval * ($scope.vis.params.maxRadius - $scope.vis.params.minRadius))
				+parseInt($scope.vis.params.minRadius);
				
//				console.log("radius="+location.radius);
//				console.log("tmpval="+tmpval);
				
				circlecolor=[];
				for(var x=0;x<circlecolormin.length;x++)
				{
					/*console.log("min="+circlecolormin[x]+ "max="+circlecolormax[x]+" first="+((location.value - min) / (max - min))
					+" next="+((location.value - min) / (max - min))*(circlecolormax[x]-circlecolormin[x])+" final="+circlecolormin[x]);*/
					circlecolor.push(Math.floor(tmpval*(circlecolormax[x]-circlecolormin[x])+circlecolormin[x]));				
				}
				location.color=circlecolor;
				console.log(circlecolor);
			}
			else			
				location.radius=$scope.vis.params.minRadius;
			

			return location;
		});
				
		// Draw Map
			
		var dynmarkers=[];
	
		angular.forEach($scope.locations, function(value, key){
			 dynmarkers.push({latLng: [value.geo.latitude[2], value.geo.longitude[2]]
				 , name: 'lat:'+value.geo.latitude[2]+' lon:'+value.geo.longitude[2]+' ('+value.value+')'
				 ,style: {fill: 'rgba('+value.color[0]+','+value.color[1]+','+value.color[2]+','+($scope.vis.params.circleOpacity/100)+')', r:value.radius}})
		});

		
		try { $('#map').vectorMap('get', 'mapObject').remove(); }
		catch(err) {}
		

		
        $('#map').vectorMap(
  			  {
  				  map: $scope.vis.params.selectedMap+'_mill',
  				  markerStyle: {
  			        initial: {
  			          fill: '#F8E23B',
  						stroke: '#383f47',r:5
  			        }
  			      },
  				  backgroundColor: $scope.vis.params.mapBackgroundColor,
  				  markers: dynmarkers
  			}
  	  	);     		
		// End of draw map
		
	});
});
