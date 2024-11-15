// swapImage function used in pupop windows
function swapImage( evt, imgURL ) {
	var e = evt || window.evt;
	//test for W3C or IE event object to get event node info
	var node;
	if ( e.target ) {
		node = e.target;
	} else {
		node = e.srcElement;
	}
	//test to see if there is a valid DOM node
    if (node) {
	    if (node.tagName == "IMG") {
			//if the node is an "img" node then a mouse event accoured 
			//and use the event node to change images
			node.src = imgURL;
		} else {
			//else the node is a focus event and "a" element is the event node
			//and need to get the child image to do image swap
			node.getElementsByTagName("img")[0].src = imgURL;
		}
	}
	return false;
}
