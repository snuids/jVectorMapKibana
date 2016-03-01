module.exports = function(kibana) {
	return new kibana.Plugin({
		uiExports: {
			visTypes: ['plugins/jVectorMap/jvector_map_vis']
		}
	});
};