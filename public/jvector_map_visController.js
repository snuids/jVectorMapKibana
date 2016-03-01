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
		var buckets = resp.aggregations[locationsAggId].buckets;

		var min = Number.MAX_VALUE,
			max = - Number.MAX_VALUE;

		// Transform all buckets into tag objects
		$scope.locations = buckets.map(function(bucket) {
			// Use the getValue function of the aggregation to get the value of a bucket
			var value = metricsAgg.getValue(bucket);
			// Finding the minimum and maximum value of all buckets
			min = Math.min(min, value);
			max = Math.max(max, value);
			return {
				label: bucket.key,
				value: value
			};
		});

		// Calculate the font size for each tag
		$scope.locations = $scope.locations.map(function(location) {
			location.radius = (location.value - min) / (max - min) * (maxFontSize - minFontSize) + minFontSize;
			return location;
		});
	});
});
