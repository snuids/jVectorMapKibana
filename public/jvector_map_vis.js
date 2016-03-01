// Include the angular controller
require('plugins/jVectorMap/jvector_map_visController');
//require('plugins/tr-k4p-tagcloud/tagcloud.css');



// The provider function, which must return our new visualization type
function JVectorMapProvider(Private) {
	var TemplateVisType = Private(require('ui/template_vis_type/TemplateVisType'));
	// Include the Schemas class, which will be used to define schemas
	var Schemas = Private(require('ui/Vis/Schemas'));

	// Describe our visualization
	return new TemplateVisType({
		name: 'jVectorMap', // The internal id of the visualization (must be unique)
		title: 'jVectorMap', // The title of the visualization, shown to the user
		description: 'jVector Map Visualizer', // The description of this vis
		icon: 'fa-map', // The font awesome icon of this visualization
		template: require('plugins/jVectorMap/jvector_map_vis.html'), // The template, that will be rendered for this visualization
		// Define the aggregation your visualization accepts
		schemas: new Schemas([
				{
					group: 'metrics',
					name: 'locationsize',
					title: 'LocationSize',
					min: 1,
					max: 1,
					aggFilter: ['count', 'avg', 'sum', 'min', 'max', 'cardinality', 'std_dev']
				},
				{
					group: 'buckets',
					name: 'locations',
					title: 'Locations',
					min: 1,
					max: 1,
					aggFilter: '!geohash_grid'
				}
			])
	});
}

require('ui/registry/vis_types').register(JVectorMapProvider);
