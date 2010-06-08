(function($) {

	var loading, overlay, closeLink, container, prevLink, nextLink, imgContainer, currentImage, caption, count
	images = [], currentIndex = -1, resizeTimer = null, padding = 120, fadeDuration = 500;
	
	$(document).ready(function(){

		//init DOM elements
		$(document.body).append(
			$([
				loading = $('<div id="loading" />').get(0),
				overlay = $('<div id="overlay" />').get(0),
				container = $('<div id="container" />').append(
					$('<div id="gallery_nav" />').append(
								prevLink = 	$('<a id="prevLink" href="#">Previous</a>').click(function(){changeImage(false); return false;}),
								nextLink = 	$('<a id="nextLink" href="#">Next</a>').click(function(){changeImage(true); return false;})
					),
					imgContainer = $('<div id="imgContainer"/>').append(
								closeLink = $('<a id="closeLink"href="#">Close</a>').click(function(){close(); return false;}),
								currentImage = $('<img class="currentImage"/>')
					),
					caption = $('<p id="caption"></p>'),
					count = $('<p id="count"></p>')
				).get(0)
			]).css("display", "none")
		);
		
		//bind resize events
		$(window).bind("resize", function(){ 
			if(resizeTimer != null){
				clearTimeout(resizeTimer);
			}
			resizeTimer = window.setTimeout(onResize, 500);
		});
		
		//init the images
		window.setTimeout(initImages, 100);
	});
		
	function initImages(){
		$("div.pics a").each(function(i){
			
			//create a new image, set src, caption, add class
		 	var image = $('<img/>');
			image.attr("src", $(this).attr("href"));
			image.attr("title", $(this).attr("title"));
			//image.attr("title", $(this).parents("div.item").children("h2").text() + " – " + $(this).attr("title"));
			image.addClass("currentImage");
			
			//when done loading, calc size the size
			image.load(function(){
				this.origWidth = $(this).attr("width");
				this.origHeight = $(this).attr("height");
				calcSize($(this));
			});
			
			//set the array index this thumb maps to & bind click event
			$(this).attr("rel", i);
			$(this).bind("click", open);
			images.push(image);		
		});
	}

	function onResize(event){
		$(images).each(function(){
			calcSize(this);
		});
		update();
	}

	function onKeyDown(event){
		var code = event.keyCode;

		if(code == 27 || code == 81 || code == 67){
			close();
		} else if(code == 37 || code == 38 || code == 80){
			changeImage(false);
			event.preventDefault();
		} else if(code == 39 || code == 40 || code == 78){
			changeImage(true);
			event.preventDefault();
		} else if(code == 33 || code == 34){
			event.preventDefault();
		}
	}

	function changeImage(forward){
		var oldIndex = currentIndex;
		
		if(forward && currentIndex < images.length-1){
			currentIndex++;
		} else if(!forward && currentIndex > 0){
			currentIndex--;
		}

		if(oldIndex != currentIndex){
			update();
		}
	}
	
	function update(){
		var newImage = images[currentIndex];

		//should we show the loader?
		if(!newImage.attr("complete")){
			$(loading).css("display","");
			newImage.load(function(){
				update();
			});
			return;
		}
		
		// hide the loader, show the container & caption
		$(loading).css("display", "none");
		$(container).css("display","");
				
		//replace current DOM image & variable with new, if its not the same
		if(newImage != currentImage){
			$(currentImage).replaceWith(newImage);
			currentImage = newImage;
		}

		//set click event, caption, count & margin
		$(currentImage).bind("click", function(){changeImage(true);});
		$(caption).text(currentImage.attr("title") == "" ? "" : currentImage.attr("title"));
		$(count).text("(" + (currentIndex + 1) + " of " + images.length + ")");
		$(imgContainer).css("width", (currentImage.attr("width") + "px"));
		$(caption).css("width", (currentImage.attr("width")+30) + "px");
		$(container).css("margin-left",(-1* parseInt($(container).css("width"))/2) + "px");

		//toggle buttons
		$(prevLink).css("visibility","visible");
		$(nextLink).css("visibility","visible");
		if(currentIndex == 0){
			$(prevLink).css("visibility","hidden");
		} else if(currentIndex == images.length-1){
			$(nextLink).css("visibility","hidden");
		}
	}

	function open(event){
		event.preventDefault();
		currentIndex = parseInt($(this).attr("rel"));
		
		$(overlay).css("opacity", 0).show().fadeTo(fadeDuration, 0.95, function(){
			$(document).bind("keydown", onKeyDown);
			$(overlay).bind("click", close);
			update();
		});		
	}

	function close(){
		currentIndex = -1;

		$(container).css("display","none");
		$(overlay).fadeTo(fadeDuration, 0, function(){
			$(overlay).hide();
			$(document).unbind("keydown", onKeyDown);
			$(overlay).unbind("click", close);
		});
	}
	
	function calcSize(image){	
		var origW = image.get(0).origWidth;
		var origH = image.get(0).origHeight;
		var newW, newH;
		
		//console.log("BEFORE --- img:" + image.attr("src") + " - w: " + image.attr("width") + " -- " + "h: " + image.attr("height"));
		if($(window).height() < $(window).width()){
			newH = Math.min(origH, $(window).height() - padding);
			newW = (origW*newH) / origH;
		} else{
			newW = Math.min(origW, $(window).width() - padding);
			newH = (newW*origH) / origW;
		}
		
		image.attr("height", newH);
		image.attr("width", newW);
		//console.log("AFTER --- img:" + image.attr("src") + " - w: " + image.attr("width") + " -- " + "h: " + image.attr("height"));
	}

})(jQuery);