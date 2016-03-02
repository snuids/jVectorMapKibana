// Include the angular controller
require('plugins/jVectorMap/jvector_map_visController');
require('plugins/jVectorMap/jquery-jvectormap-2.0.3.min');
require('plugins/jVectorMap/jquery-jvectormap-world-mill');


require('plugins/jVectorMap/jquery-jvectormap-2.0.3.css');



// The provider function, which must return our new visualization type
function JVectorMapProvider(Private) {
	var TemplateVisType = Private(require('ui/template_vis_type/TemplateVisType'));
	// Include the Schemas class, which will be used to define schemas
	var Schemas = Private(require('ui/Vis/Schemas'));

	// Describe our visualization
	return new TemplateVisType({
		name: 'jVectorMap', // The internal id of the visualization (must be unique)
		title: 'Offline Map', // The title of the visualization, shown to the user
		description: 'Offline Map Visualizer using jVectormap.', // The description of this vis
		icon: 'fa-map', // The font awesome icon of this visualization
		template: require('plugins/jVectorMap/jvector_map_vis.html'), // The template, that will be rendered for this visualization
		params: {
			editor: require('plugins/jVectorMap/jvector_map_vis_editor.html'), // Use this HTML as an options editor for this vis
			defaults: { // Set default values for paramters (that can be configured in the editor)
				maxRadius: 50,minRadius:10,mapBackgroundColor:"#C0C0FF",circleColor:"#00FF00"
			}
		},
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
					aggFilter: 'geohash_grid'
				}
			])
	});
}

require('ui/registry/vis_types').register(JVectorMapProvider);
