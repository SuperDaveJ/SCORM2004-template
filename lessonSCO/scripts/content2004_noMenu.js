// JavaScript Document
// Global variables
var blnLastPage = false;
var enableNext = true;
var enableBack = true;
var nextURL = "";
var backURL = "";

/************* Course Content Related Functions ***************/
//show on screen popup text on the right side of the screen

function checkStatus( iTerm ) {
	//iTerm start from 1.  itemsViewed needs to be defined in content page.
	itemsViewed = itemsViewed.substring(0,iTerm-1) + iTerm + itemsViewed.substring(iTerm);
	if (itemsViewed.indexOf('0') == -1) showNextButton();
}

function exitConfirm(){
	if (confirm("Do you wish to exit the course?")==true) parent.exitCourse();
}

function goNext() {
	parent.gotoPage(nextURL);
}

function goBack() {
	parent.gotoPage(backURL);
}

function goMenu() {
	alert("There is no menu for this course.");
	//parent.toMenu();
}

function showNext() {
	enableNext = true;
	$("a.next").css("visibility", "visible");
	$("a.next").removeClass("unavailable");
	$("a.next").attr({tabindex: "", href: "javascript:goNext();"});
    $("a.next").on("click", goNext);
}

function hideNext() {
	enableNext = false;
	$("a.next").css("visibility", "hidden");
	$("a.next").addClass("unavailable");
	$("a.next").attr({ tabindex: "-1", href: "javascript: return false;" });
    $("a.next").off("click");
}

/*********************** Open Popup Functions **********************************/
function openWinCentered(myUrl, myTitle, myWidth, myHeight, scrollbar, resize ) {
	// open the window
	positionTop = (screen.height - myHeight)/2 - 25;
	positionLeft = (screen.width - myWidth)/2 - 5;
	newWin = window.open (myUrl,myTitle,"toolbar=no,location=no,width="+myWidth+",height="+myHeight+",menubar=no,resizable="+resize+",status=no,scrollbars="+scrollbar+",top="+positionTop+",left="+positionLeft+"");
	//newWin.focus();
	return newWin;
}

function openNewWindow( strURL ) {
   openWinCentered(strURL, "External", 800, 800, "yes", "yes");
}

function openHelp() {
	openWinCentered("../help.html", "Help", 750, 600, "yes", "yes" );
}

function openGlossary() {
	openWinCentered("../glossary.html", "Glossary", 750, 600, "yes", "yes" );
}

function openResources() {
	openWinCentered( "../resources.html", "Resources", 750, 600, "yes", "yes" );
}

function show_cc() {
	filename = getPage() + "_cc.html";
	openWinCentered( filename, "AudioTranscript", 500, 400, "yes", "yes" );
}

function showPopup(iTerm) {
    filename = getPage() + "_pop.html?popId=" + iTerm;
    openWinCentered(filename, "popupText", 500, 400, "yes", "yes");
}

/***** Image link functions *****/
function swapImage( evt, imgURL ) {
	var e = evt || window.evt;
	var node;
	if ( e.target ) {
		node = e.target;
	} else {
		node = e.srcElement;
	}
    if (node) {
	    if (node.tagName == "IMG") {
			node.src = imgURL;
		} else {
			node.getElementsByTagName("img")[0].src = imgURL;
		}
	}
	return false;
}

$(document).ready(function () {
	$(".pgNumber").html( "Page " + pgNumber + " of " + totalPages );
	$(".prompt").html( strPrompt );

    if (!enableNext) $(".next").addClass("unavailable");
    if (!enableBack) $(".back").addClass("unavailable");
	
    $(".next").on("click", goNext);
	$(".back").on("click", goBack);
    $(".menu").on("click", goMenu);
    $(".library").on("click", openResources);
    $(".glossary").on("click", openGlossary);
    $(".help").on("click", openHelp);
    $("#exit_large").on("click", exitConfirm);

    $("a").each(function () {
        if ($(this).hasClass("unavailable")) {
            $(this).attr({ tabindex: "-1", href: "javascript: return false;" });
            if ($(this).hasClass("next")) {
				$(this).css("visibility", "hidden");
            }
            if ($(this).hasClass("back")) {
				$(this).css("visibility", "hidden");
            }
        }
    });
});
