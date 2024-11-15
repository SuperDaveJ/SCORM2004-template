// JavaScript Document
// Global variables
var blnFirstPage = false;
var blnLastPage = false;
var blnInteraction = false;
var nextURL = "";
var backURL = "";
var blnHasCC = false;

/********************************** Course Content Related Functions *************************************/
//show on screen popup text on the right side of the screen
function showMoreInfo(mi) {
	$(".more_info").css("visibility", "hidden");
	$("#pop"+mi).css("visibility", "visible");
}

function checkStatus( iTerm ) {
	//iTerm start from 1.  itemsViewed needs to be defined in content page.
	itemsViewed = itemsViewed.substring(0,iTerm-1) + iTerm + itemsViewed.substring(iTerm);
	if (itemsViewed.indexOf('0') == -1) showNextButton();
}

function exitConfirm(){
	if (confirm("Do you wish to exit the course?")==true) parent.exitCourse(true);
}

function refresh() {
	window.location.reload();
}

function openWinCentered(myUrl, myTitle, myWidth, myHeight, scrollbar ) {
	// open the window
	positionTop = (screen.height - myHeight)/2 - 25;
	positionLeft = (screen.width - myWidth)/2 - 5;
	newWin = window.open (myUrl,myTitle,"toolbar=no,width="+myWidth+",height="+myHeight+",menubar=no,resizable=no,status=no,scrollbars="+scrollbar+",top="+positionTop+",left="+positionLeft+"", true);
	newWin.focus();
}

function showCC() {
	if (blnHasCC) {
	filename = parent.getPage() + "_cc.html";
	openWinCentered( filename, "ClosedCaptioning", 626, 446, "no" );
	} else {
		alert("There is no closed captioning for this page.");
	}
}

function showPopup(iTerm) {
    filename = parent.getPage() + "_pop.html?popterm=" + iTerm;
    openWinCentered( filename, "popupText", 626, 446, "no" );
}

function iconviewed(iconid,g) {
	document.getElementById(iconid).src = g.substring(0,g.length-4)+"_glow"+g.substring(g.length-4,g.length)
}

function openGlossary() {
	openWinCentered("../../includes/glossary.html", "Glossary",  626, 600, "no" );
}

function openResources() {
	openWinCentered("../../includes/references.html", "References",  626, 600, "no" );
}

function openHelp() {
	openWinCentered("../../includes/help.html", "Help",  626, 600, "no" );
}

/********************** Audio Conttrol Functions ************************/
function getFlashMovie(movieName) { 

	if (window.document[movieName]) {	//IE
		return window.document[movieName];
	}
	if (navigator.appName.indexOf("Microsoft Internet") == -1) { 	//Not IE
		if (document.embeds && document.embeds[movieName]) {	//Firefox, Opera, etc.
      		return document.embeds[movieName]; 
  		} else {	//
    		return document.getElementById(movieName);
		}
  	}
}  

function pause() {
	getFlashMovie("FlashID").StopPlay();
}

function play() {
	getFlashMovie("FlashID").Play();
}

function replay() {
	getFlashMovie("FlashID").StopPlay();
	getFlashMovie("FlashID").Rewind();
	getFlashMovie("FlashID").Play();
}

function stop() {
	getFlashMovie("FlashID").StopPlay();
	getFlashMovie("FlashID").Rewind();
}

function turnOnAudio() {
	document.getElementById("audioOff").style.visibility = "hidden";
	document.getElementById("audioOn").style.visibility = "visible";
	//document.getElementById("audioReplay").style.visibility = "visible";
	//document.getElementById("cc").style.visibility = "visible";
	play();
	audioOn = true;
}

function turnOffAudio() {
	document.getElementById("audioOn").style.visibility = "hidden";
	document.getElementById("audioOff").style.visibility = "visible";
	//document.getElementById("audioReplay").style.visibility = "hidden";
	//document.getElementById("cc").style.visibility = "hidden";
	stop();
	audioOn = false;
}

function controlAudio( onOrOff ) {
	//controlAudio( "on" ) for Play button, controlAudio( "off" ) for Pause button
	//This will play and pause narration audio whose id is "FlashID".  Animation flash id is "animation".
	audioID = getFlashMovie("FlashID").id;
    if ( audioID == "FlashID" ) {
		if (onOrOff == "on") {
			play();
			turnOnAudio();
		} else {
			pause();
			turnOffAudio();
		}
	}
}

function checkAudio() {
	//This function is called from jqFunctions after page is loaded.
	audioID = getFlashMovie("FlashID").id;
    if ( audioID == "FlashID" ) {
		if ( parent.audioOn == true ) {
			showAudioOn();
			hideAudioOff();
			play();
		} else {
			showAudioOff();
			hideAudioOn();
			stop();
		}
		showCC_Button();
	} else {
		hideAudioOn();
		hideAudioOff();
		hideCC_Button();
	}
}

function toggleAudio() {
	if (audioOn) {
		showAudioOff();
		hideAudioOn();
		pause();
		audioOn = false;
	} else {
		showAudioOn();
		hideAudioOff();
		play();
		audioOn = true;
	}
}
/********************** End of Audio Conttrol Functions ************************/


/***************************************************/
function PageQuery(q) {
	if(q.length > 1) this.q = q.substring(1, q.length);
	else this.q = null;
	this.keyValuePairs = new Array();
	if(q) {
		for(var i=0; i < this.q.split("&").length; i++) {
			this.keyValuePairs[i] = this.q.split("&")[i];
		}
	}

	this.getKeyValuePairs = function() { return this.keyValuePairs; }

	this.getValue = function(s) {
		for(var j=0; j < this.keyValuePairs.length; j++) {
			if(this.keyValuePairs[j].split("=")[0] == s)
				return this.keyValuePairs[j].split("=")[1];
		}
		return false;
	}

	this.getParameters = function() {
		var a = new Array(this.getLength());
		for(var j=0; j < this.keyValuePairs.length; j++) {
			a[j] = this.keyValuePairs[j].split("=")[0];
		}
		return a;
	}

	this.getLength = function() { return this.keyValuePairs.length; } 
}

function getQueryValue(key){
	var page = new PageQuery(window.location.search); 
	return unescape(page.getValue(key)); 
}

function showFeedback(fdbkText) {
	if (triesUser == triesLimit) {
		showNextButton();
		//There is no done button for drag to trash can.
		if ($("#done").length > 0) $("#done").hide();
	}
	
	var qType;
	if (parent.inQuiz) qType = "Knowledge";
	else qType = "Status";

	openWinCentered("", "Feedback", 626, 446, "no" );
	newWin.focus();
	if (newWin != null) {
		var strTemp = "";	
		strTemp	= strTemp + "<!DOCTYPE html><html>";
		strTemp	= strTemp + "<title>AFIT-MRA " + qType + " Check Feedback</title>";
		strTemp	= strTemp + "<link rel='stylesheet' type='text/css' href='../../style/mra_popup.css' />";
		strTemp	= strTemp + "</head> <body>";
		strTemp	= strTemp + "<h1 class='title'>" + qType + " Check Feedback</h1>";
		strTemp	= strTemp + "<div id='content'>";
		strTemp	= strTemp + fdbkText;
		strTemp	= strTemp + "</div> <div id='close'>";
		strTemp	= strTemp + "<a class='bb' href=javascript:window.close();>Close this window</a>";
		strTemp	= strTemp + "</div></body></html>";
	
		newWin.document.write(strTemp);
		newWin.document.close();
	}
}
