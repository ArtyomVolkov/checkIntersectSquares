define([
	"Underscore",
	"Backbone",
	"models/squareModel"],
	function (_, Backbone, SquareModel) {
		return Backbone.Collection.extend({
			model: SquareModel
		});
});