// JavaScript Document for Module SCO - one-level menu courses
// This file needs to be included in the module index file only with FRAMESET.
// This file is shared with all modules in a course. 
// The module ID is set in module index file in the format mID="m2".
// Number of lessons in a module is also set in the module index file in the format modLessons=4
// The module menu file name is in the format of m2_menu.html

/************************************** Suspend Data Format *************************************************/
/* lessonStatus~pagesViewed
/* lessonStatus are  streams of 0, 1, and 2 separated by comma (,). 
/* 0=not started, 1=started but not completed, 2=completed
/* pagesViewed contains page file names (without .html) that have been viewed.
/* If NOT in LMS, cookie is used to store suspend data.

/************************************** SCORM and Navigation Functions **************************************/

//Store global variable here.
var inLMS = false;
var reviewMode = false;	//Enable all pages in topics menu for reviewing. Change it to false for delivery.
var strPagesViewed = "";
var strLessonStatus = "";
var strModuleStatus = ""
var bookmark = "";
var exitPageStatus = false;

/* module level SCO var.: number of lessons in the module */
var mod = parseInt(mID.substr(1));
for (var i=0; i<modLessons; i++) strLessonStatus = strLessonStatus + "0";

/* ===funciton to initiate the module(SCO) course===*/

function setLessonsToCompleted() {
	strLessonStatus = "";
	for (var i=0; i<modLessons; i++) strLessonStatus = strLessonStatus + "2";
}

function startCourse() {
	doInitialize();	// inLMS is set in this function call.
	if (inLMS == true) {
		var entry = doGetValue("cmi.entry");
		if(entry == "ab-initio"){
			//first time, initialize
			doSetValue( "cmi.completion_status", "incomplete" );
			doSetValue( "cmi.suspend_data", strLessonStatus + "~" );
			doSetValue("cmi.location", "");
			doCommit();
		} else {
			strModuleStatus = doGetValue("cmi.completion_status");
			if ( (strModuleStatus == "completed") || (strModuleStatus == "passed") ) {
				setLessonsToCompleted();
			} else {
				getSuspendData();
			}
			bookmark = doGetValue("cmi.location");
			if ( (bookmark == "unknown") || (bookmark == "403") || (bookmark.indexOf("menu.htm") >= 0) ) bookmark = "";
		}
	}

	defaultPage = mID + "_menu.html";
	if (bookmark != "") {
		if (confirm("Do you wish to resume where you left?")==true) contentFrame.location.href = bookmark;
		else contentFrame.location.href = defaultPage;
	} else {
		//load module menu
		contentFrame.location.href = defaultPage;
	}
}

/*************** Exit button is clicked. Module is exited properly. ******************/
function exitCourse() {
	if ( exitPageStatus != true ) {
		exitPageStatus = true;
		if ( inLMS == true ) {
			if (contentFrame.blnLastPage) updateLessonStatus('2');
			setTimeout("exitClicked()", 1000);
		} else {
			window.close();
		}
	}
}

function exitClicked() {
	saveBookmark();
	if ( checkModuleStatus() ) {
		doSetValue( "cmi.completion_status", "completed" );
		doSetValue("cmi.suspend_data", "");
	} else {
		doSetValue( "cmi.completion_status", "incomplete" );
		updateSuspendData();
	}
	setTimeout("quitNormal()",1000);
}

function quitNormal() {
	doSetValue( "cmi.exit", "suspend" );
	doSetValue("adl.nav.request", "exit");
	doTerminate();
}
/*************** End of Exit button is clicked. Module is exited properly. ******************/

/*************** Browser Close (X) button is clicked. Module is NOT exited properly. ******************/
function unloadCourse() {
	if (exitPageStatus != true) {
		exitPageStatus = true;
		xClose();
	}
}

function xClose() {
	if ( inLMS == true ) {
		if (contentFrame.blnLastPage) {
			updateLessonStatus('2');
		} else {
			saveBookmark();
		}
		if ( checkModuleStatus() ) {
			doSetValue( "cmi.completion_status", "completed" );
			doSetValue("cmi.suspend_data", "");
		} else {
			doSetValue( "cmi.completion_status", "incomplete" );
			updateSuspendData();
		}
		setTimeout("quitUnexpected()",1000);
	} else {
		window.close();
	}
}

function quitUnexpected() {
	doSetValue( "cmi.exit", "suspend" );
	doTerminate();
}
/************ End of Browser Close (X) button is clicked. Module is NOT exited properly. ***************/

function saveBookmark() {
	// It assumes there are lesson folders: lesson1, lesson2, etc. in each module.
	// and backURL is set in each page.
	if (inLMS) {
	  var strBookmark;
	  if ( contentFrame.blnLastPage || (getPage().indexOf("menu") > 0) ) {
		  strBookmark = "";
	} else {
		if ( (contentFrame.$("#next").css("visibility")!="visible") && (contentFrame.backURL != "") ) {
			//current page is not completed, bookmark previous page
			strBookmark =  "lesson"+ getLesson() + "/" + contentFrame.backURL;
		} else {
			//bookmark current page
			strBookmark = "lesson"+ getLesson() + "/" + getPage() + ".html";
		}
	}
	if (contentFrame.blnLastPage) strBookmark = "";
	doSetValue( "cmi.location", strBookmark);
	doCommit();
	}
}

/*======functions to go page and lesson menu*/
function gotoPage(direction, pgURL) {
	if (direction == "f") {
		if ( (isPageViewed(getPage()) != true) && (getPage().indexOf("menu") == -1) )  {
			if (contentFrame.blnLastPage) toModuleMenu();
			else strPagesViewed = strPagesViewed + "," + getPage();
		}
	}
	saveBookmark();
	contentFrame.location.href = pgURL;
}

function toModuleMenu() {
	mFile = "../" + mID + "_menu.html";
	if (contentFrame.blnLastPage)
		updateLessonStatus('2');
	if ( checkModuleStatus() && inLMS ) doSetValue( "cmi.completion_status", "completed" );
	updateSuspendData()
	contentFrame.location.href = mFile;
}

/*======functions to get or get the status of a lesson, and a page*/

function getPage() {
	//return current page file name in lower case without file extension.
	arrTemp = new Array();
	arrTemp2 = new Array();
	arrTemp = contentFrame.location.href.split("/");
	arrTemp2 = arrTemp[arrTemp.length-1].split("?");
	var strTemp = arrTemp2[0];
	var intTemp = strTemp.indexOf(".htm");
	strTemp = strTemp.substring(0,intTemp);
	return strTemp.toLowerCase();
}

function getLesson() {
	//Returns an integer as lessonID
	if ( getPage().indexOf("menu") > 0 ) {
		return 0;
	} else {
		arrTemp = new Array();
		arrTemp = contentFrame.location.href.split("/");
		var strTemp = arrTemp[arrTemp.length-2];
		return parseInt(strTemp.substring(6) );
	}
}

function getLessonStatus(iLes) {	//returns an integer 0, 1, or 2.
	var intTemp;
	intTemp = parseInt(strLessonStatus.substr(iLes-1,1));
	if ( (intTemp < 0) || (intTemp > 2) ) return 0;
	else return intTemp;
}

function checkModuleStatus() {
	if (strModuleStatus == "completed") return true;
	for (var i=1; i<=modLessons; i++) {
		if (getLessonStatus(i) != 2) {
			return false;
			break;
		}
	}
	return true;
}

/*======end above functions =======*/


/*======functions to update the pages, lessons status =====*/
//This function needs to be called from last page of each lesson. updateLessonStatus('2')
function updateLessonStatus(cStatus) {
	var iLes = getLesson();
	if (iLes > 0)
		strLessonStatus = strLessonStatus.substr(0,iLes-1) + cStatus + strLessonStatus.substr(iLes);
	if (cStatus == "2") cleanSuspendData();
	else updateSuspendData();
}

function isPageViewed(pageFile) {
	pageFile = pageFile.toLowerCase()
	var intTemp = pageFile.indexOf(".htm")
	if (intTemp != -1) pageFile = pageFile.substring(0,intTemp)
	var iLes = getLesson();

	if ( getLessonStatus(iLes) == 2 ) return true
	if (typeof(strPagesViewed) == undefined) return false
	if (strPagesViewed.indexOf(pageFile) >= 0) return true; 
	else return false
}

function getSuspendData() {
	if (inLMS == true) {
		strTemp = doGetValue( "cmi.suspend_data" );
	}
	if ( (strTemp != "") && (typeof(strTemp) != undefined) ) {
		arrTemp = new Array();
		arrTemp = strTemp.split("~");
		strLessonStatus = arrTemp[0];		// a stream of 2 or 3 numbers
		strPagesViewed = arrTemp[1];
	}
}

function updateSuspendData() {
   	if ( (strPagesViewed == undefined) || (typeof(strPagesViewed) == undefined) ) {
		strPagesViewed = "";
	}
	var iLes = getLesson();
	if ( iLes > 0 ) { //NOT on the mainmenu or any lesson menu
		if ( (strPagesViewed.indexOf(getPage()) == -1) && (contentFrame.$('#next').css("visibility")=="visible") ) {
			strPagesViewed = strPagesViewed + "," + getPage();
		}
	}
	strTemp = strLessonStatus + "~" + strPagesViewed;
	if (inLMS == true) {
		doSetValue("cmi.suspend_data", strTemp);
		doCommit();
	}
}

function cleanSuspendData() {
	var re = /,,/g;
	var strTemp = strPagesViewed.toLowerCase();
	arrTemp = strTemp.split(",");
	for (var i=1; i<=modLessons; i++) {
		if (getLessonStatus(i) == 2) {
			for (var k=0; k<arrTemp.length; k++) {
				if ( (parseInt(arrTemp[k].substr(0,1))==mod) && (parseInt(arrTemp[k].substr(1,1))==i) ) arrTemp[k] = ""
			}
		}
	}
	strTemp = arrTemp.join();
	while (strTemp.indexOf(",,") != -1) {
		str2 = strTemp.replace(re,",");
		if (str2.substr(0,1) == ",") str2 = str2.substr(1);
		strTemp = str2;
	}
	//after cleaned
	strPagesViewed = strTemp;
	updateSuspendData();
}
/*======end above functions ======*/
 
 //This function is for assessment module only
function setCourseScore(uScore) {
	if ( inLMS ) {
	  doSetValue("cmi.score.min", 0);
	  doSetValue("cmi.score.max", 100);
	  doSetValue("cmi.score.raw", uScore);
	  doSetValue("cmi.score.scaled", uScore/100);
	  doCommit();
	}
}

/*******************************************************************************/
//===============The following are API functions ===========

var _Debug = false;  // set this to false to turn debugging off
                     // and get rid of those annoying alert boxes.

// Define exception/error codes
var _NoError = 0;
var _GeneralException = 101;
var _GeneralInitializationFailure = 102;
var _AlreadyInitialized = 103;
var _ContentInstanceTerminated = 104;
var _GeneralTerminationFailure = 111;
var _TerminationBeforeInitialization = 112;
var _TerminationAfterTermination = 113;
var _ReceivedDataBeforeInitialization = 122;
var _ReceivedDataAfterTermination = 123;
var _StoreDataBeforeInitialization = 132;
var _StoreDataAfterTermination = 133;
var _CommitBeforeInitialization = 142;
var _CommitAfterTermination = 143;
var _GeneralArgumentError = 201;
var _GeneralGetFailure = 301;
var _GeneralSetFailure = 351;
var _GeneralCommitFailure = 391;
var _UndefinedDataModelElement = 401;
var _UnimplementedDataModelElement = 402;
var _DataModelElementValueNotInitialized = 403;
var _DataModelElementIsReadOnly = 404;
var _DataModelElementIsWriteOnly = 405;
var _DataModelElementTypeMismatch = 406;
var _DataModelElementValueOutOfRange = 407;


// local variable definitions
var apiHandle = null;
var API = null;
var findAPITries = 0;


/*******************************************************************************
**
** Function: doInitialize()
** Inputs:  None
** Return:  CMIBoolean true if the initialization was successful, or
**          CMIBoolean false if the initialization failed.
**
** Description:
** Initialize communication with LMS by calling the Initialize
** function which will be implemented by the LMS.
**
*******************************************************************************/
function doInitialize()
{
   var api = getAPIHandle();
   if (api == null)
   {
      alert("Unable to locate the LMS's API Implementation.\nInitialize was not successful.\nYour data will not be tracked.");
      return "false";
   }

   var result = api.Initialize("");

   if (result.toString() != "true")
   {
      var err = ErrorHandler();
	  inLMS = false;
   } else {
	   //This branch is added to set the inLMS
	   inLMS = true;
   }

   return result.toString();
}

/*******************************************************************************
**
** Function doTerminate()
** Inputs:  None
** Return:  CMIBoolean true if successful
**          CMIBoolean false if failed.
**
** Description:
** Close communication with LMS by calling the Terminate
** function which will be implemented by the LMS
**
*******************************************************************************/
function doTerminate()
{  
   var api = getAPIHandle();
   if (api == null)
   {
      if (_Debug == true)
      alert("Unable to locate the LMS's API Implementation.\nTerminate was not successful.");
      return "false";
   }
   else
   {
      // call the Terminate function that should be implemented by the API

      var result = api.Terminate("");
      if (result.toString() != "true")
      {
         var err = ErrorHandler();
      }

   }

   return result.toString();
}

/*******************************************************************************
**
** Function doGetValue(name)
** Inputs:  name - string representing the cmi data model defined category or
**             element (e.g. cmi.core.student_id)
** Return:  The value presently assigned by the LMS to the cmi data model
**       element defined by the element or category identified by the name
**       input value.
**
** Description:
** Wraps the call to the GetValue method
**
*******************************************************************************/
function doGetValue(name)
{
   var api = getAPIHandle();
   if (api == null)
   {
      if (_Debug == true)
      alert("Unable to locate the LMS's API Implementation.\nGetValue was not successful.");
      return "";
   }
   else
   {
	  var value = api.GetValue(name);
      var errCode = api.GetLastError().toString();
      if (errCode != _NoError)
      {
         // an error was encountered so display the error description
         var errDescription = api.GetErrorString(errCode);
         //alert("GetValue("+name+") failed. \n"+ errDescription);
         return errCode;
      }
      else
      {
         return value.toString();
      }
   }
}

/*******************************************************************************
**
** Function doSetValue(name, value)
** Inputs:  name -string representing the data model defined category or element
**          value -the value that the named element or category will be assigned
** Return:  CMIBoolean true if successful
**          CMIBoolean false if failed.
**
** Description:
** Wraps the call to the SetValue function
**
*******************************************************************************/
function doSetValue(name, value)
{
   var api = getAPIHandle();
   if (api == null)
   {
      if (_Debug == true)
      alert("Unable to locate the LMS's API Implementation.\nSetValue was not successful.");
      return;
   }
   else
   {
      var result = api.SetValue(name, value);
      if (result.toString() != "true")
      {
         var err = ErrorHandler();
		 result = err;
      }
   }
   return result;
}

/*******************************************************************************
**
** Function doCommit()
** Inputs:  None
** Return:  None
**
** Description:
** Call the Commit function 
**
*******************************************************************************/
function doCommit()
{
   var api = getAPIHandle();
   if (api == null)
   {
      if (_Debug == true)
      alert("Unable to locate the LMS's API Implementation.\nCommit was not successful.");
      return "false";
   }
   else
   {
      var result = api.Commit("");
      if (result != "true")
      {
         var err = ErrorHandler();
      }
   }
   return result.toString();
}

/*******************************************************************************
**
** Function doGetLastError()
** Inputs:  None
** Return:  The error code that was set by the last LMS function call
**
** Description:
** Call the GetLastError function 
**
*******************************************************************************/
function doGetLastError()
{
   var api = getAPIHandle();
   if (api == null)
   {
      if (_Debug == true)
      alert("Unable to locate the LMS's API Implementation.\nGetLastError was not successful.");
      //since we can't get the error code from the LMS, return a general error
      return _GeneralError;
   }

   return api.GetLastError().toString();
}

/*******************************************************************************
**
** Function doGetErrorString(errorCode)
** Inputs:  errorCode - Error Code
** Return:  The textual description that corresponds to the input error code
**
** Description:
** Call the GetErrorString function 
**
********************************************************************************/
function doGetErrorString(errorCode)
{
   var api = getAPIHandle();
   if (api == null)
   {
      if (_Debug == true)
      alert("Unable to locate the LMS's API Implementation.\nGetErrorString was not successful.");
   }
   return api.GetErrorString(errorCode).toString();
}

/*******************************************************************************
**
** Function doGetDiagnostic(errorCode)
** Inputs:  errorCode - Error Code(integer format), or null
** Return:  The vendor specific textual description that corresponds to the 
**          input error code
**
** Description:
** Call the LMSGetDiagnostic function
**
*******************************************************************************/
function doGetDiagnostic(errorCode)
{
   var api = getAPIHandle();
   if (api == null)
   {
      if (_Debug == true)
      alert("Unable to locate the LMS's API Implementation.\nGetDiagnostic was not successful.");
   }
   return api.GetDiagnostic(errorCode).toString();
}

/*******************************************************************************
**
** Function LMSIsInitialized()
** Inputs:  none
** Return:  true if the LMS API is currently initialized, otherwise false
**
** Description:
** Determines if the LMS API is currently initialized or not.
**
*******************************************************************************/
function LMSIsInitialized()
{
   // there is no direct method for determining if the LMS API is initialized
   // for example an LMSIsInitialized function defined on the API so we'll try
   // a simple LMSGetValue and trap for the LMS Not Initialized Error

   var api = getAPIHandle();
   if (api == null)
   {
      if (_Debug == true)
      alert("Unable to locate the LMS's API Implementation.\nLMSIsInitialized() failed.");
      return false;
   }
   else
   {
      var value = api.GetValue("cmi.learner_name");
      var errCode = api.GetLastError().toString();
      if (errCode == _DataModelElementValueNotInitialized)
      {
         return false;
      }
      else
      {
         return true;
      }
   }
}

/*******************************************************************************
**
** Function ErrorHandler()
** Inputs:  None
** Return:  The current value of the LMS Error Code
**
** Description:
** Determines if an error was encountered by the previous API call
** and if so, displays a message to the user.  If the error code
** has associated text it is also displayed.
**
*******************************************************************************/
function ErrorHandler()
{
   var api = getAPIHandle();
   if (api == null)
   {
      if (_Debug == true)
      alert("Unable to locate the LMS's API Implementation.\nCannot determine LMS error code.");
      return;
   }

   // check for errors caused by or from the LMS
   var errCode = api.GetLastError().toString();
   if (errCode != _NoError)
   {
      // an error was encountered so display the error description
      var errDescription = api.GetErrorString(errCode);

      if (_Debug == true)
      {
         errDescription += "\n";
         errDescription += api.GetDiagnostic(null);
         // by passing null to GetDiagnostic, we get any available diagnostics
         // on the previous error. 
		 
		 alert(errDescription);
      }

     
   }

   return errCode;
}

/******************************************************************************
**
** Function getAPIHandle()
** Inputs:  None
** Return:  value contained by APIHandle
**
** Description:
** Returns the handle to API object if it was previously set,
** otherwise it returns null
**
*******************************************************************************/
function getAPIHandle()
{
   if (apiHandle == null)
   {
      apiHandle = getAPI();
   }

   return apiHandle;
}

/*******************************************************************************
** 
** Function getAPI()
** Inputs:  none
** Return:  If an API object is found, it's returned, otherwise null is returned
**
** Description:
** This function looks for an object named API, first in the current window's 
** frame hierarchy and then, if necessary, in the current window's opener window
** hierarchy (if there is an opener window).
**
*******************************************************************************/

//created by Mike Rustici
var MAX_PARENTS_TO_SEARCH = 500; 
/*
ScanParentsForApi
-Searches all the parents of a given window until
 it finds an object named "API_1484_11". If an
 object of that name is found, a reference to it
 is returned. Otherwise, this function returns null.
*/
function ScanParentsForApi(win) 
{  
      /*
      Establish an outrageously high maximum number of
      parent windows that we are will to search as a
      safe guard against an infinite loop. This is 
      probably not strictly necessary, but different 
      browsers can do funny things with undefined objects.
      */
      var nParentsSearched = 0;
      /*
      Search each parent window until we either:
             -find the API, 
             -encounter a window with no parent (parent is null 
                        or the same as the current window)
             -or, have reached our maximum nesting threshold
      */
      while ( (win.API_1484_11 == null) && 
                  (win.parent != null) && (win.parent != win) && 
                  (nParentsSearched <= MAX_PARENTS_TO_SEARCH) 
              )
      { 
            nParentsSearched++; 
            win = win.parent;
      } 
      /*
      If the API doesn't exist in the window we stopped looping on, 
      then this will return null.
      */
      return win.API_1484_11; 
} 
/*
GetAPI
-Searches all parent and opener windows relative to the
 current window for the SCORM 2004 API Adapter.
 Returns a reference to the API Adapter if found or null
 otherwise.
*/
function getAPI() 
{
      var API = null; 

      //Search all the parents of the current window if there are any
      if ((window.parent != null) && (window.parent != window)) 

      { 
            API = ScanParentsForApi(window.parent); 
      } 
      /*
      If we didn't find the API in this window's chain of parents, 

      then search all the parents of the opener window if there is one

      */
      if ((API == null) && (window.top.opener != null))

      { 
            API = ScanParentsForApi(window.top.opener); 
      } 
      return API;
}