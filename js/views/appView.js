define([
	"jQuery",
	"Underscore",
	"Backbone",
	"models/squareModel"
],  function ($, _, Backbone, SquareModel) {
	var AppView = Backbone.View.extend({
		events: {
			"click #btnCheck" : "checkRect",
			"click #btnClear" : "clearHolst",
			"click #log_panel" : "onOpenClosePanel",
			"mousemove #paintPlace" : "moveCursor",
			"mousedown #paintPlace" : "beginTrace",
			"mouseup #paintPlace" : "endTrace"
		},

		initialize: function () {
			this.inputX = this.$('input[name=posX]');
			this.inputY = this.$('input[name=posY]');
			this.lblResult = this.$("#resultPanel");
			this.logPanel = this.$("#log_panel");
			this.holst = this.$("#holst")[0];
			this.offsetX = Math.floor(this.holst.offsetLeft);
			this.offsetY = Math.floor(this.holst.offsetTop);
			this.allocationColor = "black";
			this.isMoove = false;
			this.intersectRect = {};
			this.x1;
			this.y1;
			this.x2;
			this.y2;
			this.squareWidth;
			this.squareHeight;
			this.context;
			this.render();
		},

		render: function () {
			this.$el.html();
		},

		checkRect: function () {
			if (this.collection.length %2 === 0) {
				this.lblResult.html("");
				for (var i = 0; i < this.collection.length; i++) {
					if (this.checkCross(this.collection.at(i), this.collection.at(++i))) {
						var p = $('<p>');
						p.append("[" + Math.ceil(i/2) +
						    "] x1: " + this.intersectRect.x1 + 
							", y1: " + this.intersectRect.y1 + 
					    	", x2: " + this.intersectRect.x2 + 
					    	", y2: " + this.intersectRect.y2 + 
							", width: " + this.intersectRect.width + 
							", height: " + this.intersectRect.height);

						p.addClass("success").css("background", this.collection.at(i).get("color"));
						this.lblResult.append(p);
					} else {
						this.lblResult.append($('<p>').append("[" + Math.ceil(i/2) + "] NOT INTERSECT")
							.css("background", this.collection.at(i).get("color")));
					}
				}
			} else {
				this.lblResult.append($("<p>ERROR OF CONPARE (need an even number of squares)</p>").addClass("error"));
			}
			if (this.lblResult.is(":hidden")) {
				this.onOpenClosePanel();
			}
		},

		clearHolst: function () {
			this.holst.width = this.holst.width;
			this.allocationColor = "black";
			this.lblResult.text("");
			this.collection.reset();
			squares = [];
			intersectRect = {};
		},

		moveCursor: function (event) {
			this.inputX.val(event.pageX - this.offsetX);
			this.inputY.val(event.pageY - this.offsetY);
			this.allocation(event, this.isMoove);
		},

		beginTrace: function (event) {
			this.x1 = event.pageX - this.offsetX;
			this.y1 = event.pageY - this.offsetY;
			this.isMoove = true;
		},

		endTrace: function (event) {
			var obj = {},
				position;

			this.x2 = event.pageX - this.offsetX;
			this.y2 = event.pageY - this.offsetY;
			this.isMoove = false;

		    if (this.x1 < this.x2 &&  this.y1 < this.y2) {
		    	position = "DownRight";
		    }
		    if (this.x1 > this.x2 &&  this.y1 < this.y2) {
		    	position = "DownLeft";
		    }
		    if (this.x1 < this.x2 &&  this.y1 > this.y2) {
		    	position = "UpRight";
		    }
		    if (this.x1 > this.x2 &&  this.y1 > this.y2) {
		    	position = "UpLeft";
		    }

		    switch (position) {
		    	case "DownRight":
		    		this.addCoordinats(this.x1, this.y1, this.x2, this.y2, this.squareWidth, this.squareHeight);
					break;

		    	case "DownLeft":
		    		this.addCoordinats(this.x2, this.y1, this.x1, this.y2, this.squareWidth, this.squareHeight);
		    		break;

		    	case "UpRight":
		    		this.addCoordinats(this.x1, this.y2, this.x2, this.y1, this.squareWidth, this.squareHeight);
		    		break;

		    	case "UpLeft":
		    		this.addCoordinats(this.x2, this.y2, this.x1, this.y1, this.squareWidth, this.squareHeight);
		    		break;
		    }
		    this.drowRect(this.x1, this.y1, this.x2 - this.x1, this.y2 - this.y1, this.collection.at(this.collection.length - 1).get("color"));
		},

		allocation: function (event, isMoove) {
			if (this.isMoove) {
				this.x2 = event.pageX - this.offsetX;
				this.y2 = event.pageY - this.offsetY;
				this.squareWidth = Math.abs(this.x2 - this.x1);
				this.squareHeight = Math.abs(this.y2 - this.y1);
				this.context = this.holst.getContext("2d");
				this.context.lineWidth = 3;
				this.context.clearRect(0, 0, this.holst.width, this.holst.height);
				if (this.collection.length > 0) {
					this.collection.each(function (item) {
						this.context.strokeStyle = item.get("color");
						this.context.beginPath();
						this.context.rect(item.get("x1"), item.get("y1"), item.get("width"), item.get("height"));
						this.context.stroke();
					}, this);
				}
				this.context.strokeStyle = this.allocationColor;
				this.context.beginPath();
				this.context.rect(this.x1, this.y1, (this.x2 - this.x1), (this.y2 - this.y1));
				this.context.stroke();
			}
		},

		addCoordinats: function (x1, y1, x2, y2, width, height) {
			var model = new SquareModel(),
				color;

			if (this.collection.length >= 2) {
				if (this.collection.length %2 === 0){
					color = this.allocationColor;
				}
				else {
					color = this.collection.at(this.collection.length -1).get("color");
				}			
			}
			else {
				color = "black";
			}
			model.set({
				"x1" : x1,
				"y1" : y1,
				"x2" : x2,
				"y2" : y2,
				"width" : width,
				"height" : height,
				"color" : color
			});

			this.collection.add(model);
			if (this.collection.length %2 === 0) {
				this.allocationColor = this.generateColor();
			}
		},

		drowRect: function (x, y, w, h, color) {
			this.context.strokeStyle = color;
			this.context.beginPath();
			this.context.rect(x, y, w, h);
			this.context.stroke();
		},

		generateColor: function () {
			var red, green, blue;
			red = Math.ceil(Math.random() * 255);
			green = Math.ceil(Math.random() * 255);
			blue = Math.ceil(Math.random() * 255);
			return "rgb(" + red + ", " + green + ", " + blue +")";
		},

		checkCross: function (first, next) {
			if (first.get("x1") + first.get("width") > next.get("x1") && first.get("y1") + first.get("height") > next.get("y1")) {
				if (next.get("x1") + next.get("width") > first.get("x1") &&  next.get("y1") + next.get("height") > first.get("y1")) {
					var CX1 = Math.max(first.get("x1"), next.get("x1")),
						CY1 = Math.max(first.get("y1"), next.get("y1")),
						CX2 = Math.min(first.get("x2"), next.get("x2")),
						CY2 = Math.min(first.get("y2"), next.get("y2"));

					this.context = this.holst.getContext("2d");
					this.intersectRect.x1 = CX1;
					this.intersectRect.y1 = CY1;
					this.intersectRect.x2 = CX2;
					this.intersectRect.y2 = CY2;
					this.intersectRect.width = Math.abs(CX2 - CX1);
					this.intersectRect.height = Math.abs(CY2 - CY1);
					this.context.fillStyle = "red";
					this.context.fillRect(CX1, CY1, (CX2 - CX1), (CY2 - CY1));
					return true;
				}
				else {
					return false;
				}
			}
			else {
				return false;
			}
		},

		onOpenClosePanel: function () {
			if (this.lblResult.is(":hidden")) {
				this.logPanel.removeClass("down_icon");
				this.logPanel.addClass("up_icon");
				this.lblResult.removeClass("hidden");
				this.lblResult.addClass("show");
			} else {
				this.logPanel.removeClass("up_icon");
				this.logPanel.addClass("down_icon");
				this.lblResult.removeClass("show");
				this.lblResult.addClass("hidden");
			}
		}
	});
	return AppView;
});