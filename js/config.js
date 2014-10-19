require.config({
	baseUrl: "js",
	paths: {
		jQuery: "libs/jquery-1.11.1",
		Underscore: "libs/underscore-1.6.0",
		Backbone: "libs/backbone-1.1.2"
	},
	shim: {
		jQuery: {
			exports: "jQuery",
			 init: function () {
                return this.jQuery.noConflict();
            }
        },
        Underscore: {
            exports: '_'
	    },
	    Backbone: {
	        deps: ['Underscore', 'jQuery'],
	        exports: 'Backbone'
		}
	}
});
// point of start webapp
require(["jQuery", "collections/squares", "views/appView"],
	function ($, Squares, App) {
		new App({
			collection: new Squares(),
			el: "#container"
		});
});