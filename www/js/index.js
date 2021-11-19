/* =============================================================================
  Group: 6 (Keshav Hegde, Tommy Chak, Megan Petersen, Susan Idris)
  Subject: SIT302 Project Delivery
  Assignment: Project  - Bipolar App
  Trimester: T3-2017
==============================================================================*/
/*==============================================================================
  Bipolar website/App entry point javascript file index.js
  Summary:
  JavaScript is used in combination with Jquery library for manipulating HTML DOM
  and for program logic
  Includes:
    Validation / verfication
    Hashing / encryption
    localStorage
    Networking / cloud storage
    UI Restore on login

  Cloud Datastore directory structure
    users/username(hashed)
      - fullname, username, email, password, role(carer/patient/admin), carer(assigned)
    secrets/username(hashed)
      - questions and answers JSON object (hashed).
    questions/section_quiz-id
      - One subdir for each quiz/survey -quiz and survey questions
    responses/username(hashed)_section_quiz-id_attempt_timestamp
      - completed quizzzes and surveys by user
    attempts/username(hashed)
      - Attempts made by each user on each quiz/survey
    wip/section_quiz-id_username(hashed)
      - incomplete quiz and survey by user
    sections/(modules/tools)
      - Is the base data on which menu trees are loaded
    settings/username(hashed)
      - Per user settings saved.
==============================================================================*/
window.appVersion = 1.0;
// Menu titles which has sub menu structure
// JSON Object of the Menu system construct
window.menuSystem = [
  {
    "title":"My modules",
    "menuId":"modules",
  },
  {
    "title":"My Tools",
    "menuId":"tools",
  }
]
// Variable to store settings (default as well) in a JSON object
// Which can be updated from settings menu
window.settings = {
    "enableLogging": false
};

// var storage = window.localStorage;

if(sessionStorage.settings == null || sessionStorage.settings == undefined){
    // If settings not stored in local storage first save the default
    sessionStorage.settings = JSON.stringify(settings);
}else{
    settings = JSON.parse(sessionStorage.settings);
}


// Debug logging turn on/off from settings
window.debug = settings.enableLogging;

// Url of the datastore WebAPI, appid is a unique identifier
window.baseUrl = "http://introtoapps.com/datastore.php?";

// Web API key
window.appId = "99999999";

// HTTP GET/POST method "POST" stopped working
window.httpMethod = "POST";

// // Variable to store quiz/survey questions for the session
// window.questionData;
//
// // Variable to store quiz/survey answers/responses for the session
// window.responses;

// document must be loaded before accessing any element
$(document).ready(function() {
  // If User already not logged in in the current session, load the login box
  // otherwise load the menu and main page
  // Load settings
  var userLogged = JSON.parse(sessionStorage.getItem(sessionStorage.activeUser))
  if(sessionStorage.activeUser == null || userLogged.role == 0){
    //getInactiveUsers();
    dataStore.initialise.prepare();
    getUsersList();
    loginUI.loginForm();
  }else{
    user.loadMenu();
  }

  $("#home-button").on("click",function(){
    $(".hero-foot").removeClass("is-hidden");
    user.loadMenu();
  })
  $(".modal-close").on("click", function(){
    $("#help-pdf").removeClass("is-active");
  })
  // To maintain the width and position of the buttons on quiz form
  $(window).on("resize", function(){
    try {
      $("#floating-buttons").outerWidth($("#quiz-container").width());
      // $("#chart-container").width($("#quiz-container").width());
      // appChart.resize();
    } catch (e) {
      console.log(e)
    }
  })

}); // End of document ready function
