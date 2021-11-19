/* =============================================================================
  Group: 6 (Keshav Hegde, Tommy Chak, Megan Petersen, Susan Idris)
  Subject: SIT302 Project Delivery
  Assignment: Project  - Bipolar App
  Trimester: T3-2017
==============================================================================*/
/* ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
menu.ui.js
window.menuUI: Creates login and register fields for and registration process
Once successfully logged in then call menu.ui.js functions to create and display
navigation bar and load tree menu
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
window.menuUI = {
  /*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    Definition to build top navbar menu structure
  ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
  navbarMenu:{
   /*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
     Function to load main menu of the top navbar
     Parameters: none
     Returns: DOM node with navbar & slider menu
   ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
    mainMenu:function(){
      // Any previous event handlers are removed
      // Components are reset to initial state
      $(".burger").off();
      $(".navbar-link").off();
      $(".hero-body").off();
      $("#patient-selector").addClass("is-hidden");
      $("#mainMenu").removeClass("is-active");
      $(".navbar-burger").removeClass("is-active");
      $("#filler").height(0);

      // Make sure there is only one mainMenu
      $("#mainMenu").remove();
      var node = $("<div id='mainMenu' class='navbar-menu'></div>");
      $(".hero-body").find(".title").html("Dashboard");
      var user = JSON.parse(sessionStorage.getItem(sessionStorage.activeUser));
      var content = $(".hero-body").find("#page-content").html(user.fullname + ", Welcome to MoodSwings");

      if(sessionStorage.userRole == 0){
        $(".hero-body").find(".title").html("ADMIN CONSOLE");
        var content = $(".hero-body").find("#page-content").html(user.fullname + ", With Great Power Comes Great Responsibility");
        menuUI.adminConsole();
      }else if (sessionStorage.userRole == 2){
          $(node).append(this.menuStart());
          $('#quiz-container').load("./data/_welcome", function(response, status, xhr){
            if(status != "error"){
              var dropdown = $("<select  id='user-selection' style='width:100%'></select>");
              $("#patient-selector").removeClass("is-hidden");
              $("#patient-selector").find(".select").append(dropdown);

              // Populate the patient selector list
              menuUI.populateSelectBox(dropdown,"patient")

              // On patient select load the results in accordions
              $(dropdown).on("change",function(){
                $('#quiz-container').empty();
                // Show the spinner
                $(".spinner").show();
                // Should show the patients respones
                var username = $(this).val();
                resultsUI.load(username);
                $(".spinner").hide();
              });
            }
          });
          //$('#quiz-container').load('./data/carer.html');
      }else{
          $(node).append(this.menuStart());
          $('#quiz-container').load('./data/_welcome');
      }
      // Hide the spinner after the loading
      $(".spinner").hide();
      $(node).append(this.menuEnd());

      // This event handler to the main menu aligns the top of the section to
      // the bottom of the expanded menu in portrait mode
      $(node).on("click",function(){
        if ($("body").outerWidth() < 1024){
          $("#filler").height($(this).outerHeight());
        }else{
          $("#filler").height(0);
        }
      })
      // An event handler on the body to hide the slider menu
      $(".hero-body").on("click",function(){
        $("#mainMenu").removeClass("is-active");
        $(".navbar-burger").removeClass("is-active");
        $("#filler").height(0);
      })
      return node;
    }, // End of menuStart function() ----------------------------------------->

    /*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
      Function to loda start section of the top navbar slider menu system
      Parameters: none
      Returns: DOM node with 4 buttons
    ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
    menuStart:function(){
      // Following two arrays are related
      // var titles = ["My modules","My Tools"];
      // var menuIds = ["modules","tools"];
      // Navbar Start section (stuff in between brand and end)
      var node = $("<div class='navbar-start'></div>");
      // MenuSystem object is a global JSON object defined in index.js
      // Iterate the menu system to create navbar-items
      for (index in menuSystem){
        var title = menuSystem[index].title;
        var menuId = menuSystem[index].menuId;
        var item = $("<div class='navbar-item has-dropdown is-hoverable'></div>");
        var link = $("<a class='navbar-link' id='" + menuId +"'>" + title + "</a>");
        var dropdown = $("<div class='navbar-dropdown'></div>");
        if (menuId != null){
          var slideMenu = $("<div class='menu-slider'></div>");
          menuUI.slider.loadList(menuId, slideMenu);
          $(dropdown).append(slideMenu);
        }
        $(item).append(link).append(dropdown);
        $(node).append(item);
      }
      return node;
    }, // End of menuStart function() ----------------------------------------->
    /*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
      Function to loda end section of the top navbar menu buttons
      Parameters: none
      Returns: DOM node with 4 buttons
    ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
    menuEnd:function(){
      var titles = ["Forum","Inbox", "Help","Logout"];
      var icons = ["fa-users","fa-inbox","fa-info-circle", "fa-sign-out"];
      var classes = ["is-link","is-info","is-primary","is-danger"];
      var href = ["#","#","#","#"];
      // Navbar End section (far right stuff)
      var node = $("<div class='navbar-end'></div>");
      var item = $("<div class='navbar-item'></div>");
      var field = $("<div class='field is-grouped'></div>");

      // Add buttons to the grouped field <div>
      for (i = 0; i < titles.length; i++){
        var button = $( "<p class='control'>" +
                          "<a class='button " + classes[i] + " is-small' href='" + href[i] + "'>" +
                            "<i class='fa " + icons[i] + "'>&nbsp;" + titles[i] + "</i>" +
                          "</a>" +
                        "</p>");
        $(field).append(button);
      }

      $(field).find(".fa-users").on("click",function(){
        $.alert("Forum function is not in the scope of this development phase","Not implemented");
      })

      $(field).find(".fa-inbox").on("click",function(){
        $.alert("The email function is not in the scope of this development phase","Not implemented");
      })

      // $(field).find(".fa-info-circle").on("click",function(){
      //   $("#help-pdf").find(".modal-card").append("<object height='100%' width='100%' type='application/pdf' data='.data/help.pdf'></object>");
      //   $("#help-pdf").addClass("is-active");
      // });

      var settingsButton = $("<a class='button is-small is-rounded'><i class='fa fa-gear'></i></a>");
      $(settingsButton).on("click",function(){
        menuUI.settingsBox();
      })
      $(field).append(settingsButton);
      $(item).append(field);
      $(node).append(item);
      return node ;
    }, // End of menuEnd function() -------------------------------------------->

  }, // End of navbarMenu definition ------------------------------------------>

  /*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    Definition to build slider menu
  ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
  slider:{
    /*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
      Function to load the main level 1 menus and then call recursive function
      to load all child menu items
      Parameters: Menu ID from the main menu
      Returns: None
    ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
    loadList:function(menuId, slideMenu){
      // Obtain menu data from the localStorage
      if (!(localStorage.getItem(menuId) == null || localStorage.getItem(menuId) == "")){
        var menuData = JSON.parse(localStorage.getItem(menuId));

        // Build menu list from JSON file by calling recursive function
        var listItems = menuUI.slider.listItems(menuData, menuId);
        var list = $("<ul class='" + menuId + "'>" + listItems + "</ul>");
        $(slideMenu).append(list);
        // Need to delay otherwise menu won't load properly in to DOM
        setTimeout(function(){
            $(list).sliderMenu();
        }, 1000);
      }else{
        //Display message for a confirmation
        $.confirm({
          title: "Menu load error",
          content: "Failed to load menu for " + menuId,
          type: "red", typeAnimated: true,
          useBootstrap: false,
          boxWidth:"75%",
          buttons:{
            tryAgain: {
              text: "Try again",
              btnClass: "btn-red",
              action: function(){
                sessionReset();
              }
            }
          }
        });
      }
    }, // End of loadList function() ------------------------------------------>
    /*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
      Function is a recursive function to load the menu list by drilling down
      JSON object
      Parameters:
        - menuData: JSON object containing the child menu items
      Returns: <li> element containing the menu items
    ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
    listItems:function(menuData, name){
      var items = "";
       $.each(menuData, function(i, result) {
        items += "<li data-name='" + name + "' data-id='" + result.id + "'><a href='#'>" + result.text  + "</a>";
        // If there are child menu then drill down
        if (result.children != null){
          if (result.children.length) {
            var menuItem = {
              "level":result.level,
              "id":result.id,
              "text":result.text,
              "content":result.content
            }
            localStorage.setItem(name + "Menu" + result.id, JSON.stringify(menuItem));
            items += '<ul>' + menuUI.slider.listItems(result.children, name) + '</ul>';
          }
        }else{
          localStorage.setItem(name + "Menu" + result.id, JSON.stringify(result));
        }
        items += '</li>';
      });
      return items;
    } // End of listItems function() ------------------------------------------>
  }, // End of list definition ------------------------------------------------->

  /*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    Function to load settings page to save the user preference
    Parameters: None
    Returns: None
  ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
  settingsBox:function(){
    $("#mainMenu").removeClass("is-active");
    $(".navbar-burger").removeClass("is-active");
    $("#filler").height(0);
    $("#quiz-container").load("./data/_settings", function(response, status, xhr){
        if(status != "error"){
          if(sessionStorage.userRole == 2){
            $("#patient-selector").addClass("is-hidden");
          }
          if(settings.enableLogging){
            $("#enable-logging").prop("checked","true");
          }else{
            $("#enable-logging").prop("checked","");
          }

          $("#settings-save").on("click", function(){
            var enableLogging = $("#enable-logging").prop("checked");
            var data = {
              "enableLogging": enableLogging
            }
            settings.enableLogging = data.enableLogging;
            sessionStorage.settings = JSON.stringify(data);
            dataStore.save("settings", sessionStorage.userSHA, data);

            if(sessionStorage.userRole == 0){
              menuUI.adminConsole();
            }else if(sessionStorage.userRole == 2){
              $("#patient-selector").removeClass("is-hidden");
              $('#quiz-container').load('./data/_welcome');
            }else{
              $('#quiz-container').load('./data/_welcome');
            }
          })
          $("#settings-close").on("click", function(){
            if(sessionStorage.userRole == 0){
              menuUI.adminConsole();
            }else if(sessionStorage.userRole == 2){
              $("#patient-selector").removeClass("is-hidden");
              $('#quiz-container').load('./data/_welcome');
            }else{
              $('#quiz-container').load('./data/_welcome');
            }
          })
        }else{
          $.alert("Settings page failed to load. try again", "Failed");
        }
    });
  }, // End of settings function ---------------------------------------------->
  /*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    Function to load admin console HTML and assign event listener to do tasks
    Parameters: None
    Returns: None
  ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
  adminConsole:function(){
    $("#quiz-container").load("./data/_admin", function(response, status, xhr){
        if(status != "error"){

          var userChange;
          var selectBox = $("#user-selection");

          // Initially populate the select dropdown with inactive users
          menuUI.populateSelectBox(selectBox,"inactive");
          menuUI.populateSelectBox($("#user-select-reset"),"all");
          $("#user-list-option").on("click",function(){
            if($(this).prop("checked")){
              menuUI.populateSelectBox(selectBox,"all");
            }else{
              menuUI.populateSelectBox(selectBox,"inactive");
            }
          });

          // User selection drop down for activation/deactivation
          $(selectBox).on("change",function(){
            try {
              var userSHA = CryptoJS.SHA256($("#user-selection").val()).toString();
              $("#user-fullname-reset").val("");
              $("#password-reset").val("");
              $("#reset-password-button").prop({disabled:true});
              $("#user-select-reset").val("none")

              var xhrUser = dataStore.load("users", userSHA);
              xhrUser.always(function(data, textStatus, jqXHR){
                if(textStatus == "success" && jqXHR.status == 200){
                  userChange = JSON.parse(data);
                  if(userChange.active){
                    $("#deactivate-user").prop({disabled:false});
                    $("#activate-user").prop({disabled:true});
                  }else{
                    $("#deactivate-user").prop({disabled:true});
                    $("#activate-user").prop({disabled:false});
                  }
                  menuUI.populateUserDetails(userChange);
                }
              });
            } catch (e) {
              $.alert("Could't read user information. Try again","Failed");
            }
          })

          $("#user-select-reset").on("change",function(){
              var userSHA = CryptoJS.SHA256($("#user-select-reset").val()).toString();
              $("#deactivate-user").prop({disabled:true});
              $("#activate-user").prop({disabled:true});
              $("#user-selection").val("none");
              var xhrUser = dataStore.load("users", userSHA);
              xhrUser.always(function(data, textStatus, jqXHR){
                if(textStatus == "success" && jqXHR.status == 200){
                  try {
                    userChange = JSON.parse(data);
                    $("#password-reset").prop({disabled: false});
                    $("#new-secret-1").prop({disabled: false});
                    $("#new-secret-2").prop({disabled: true});
                    $("#password-reset").focus().select();
                    menuUI.populateUserDetails(userChange);
                  } catch (e) {
                    $.alert("Couldn't read user information. Try again..","Error");
                  }
                }
              });
          })

          // Event handler to validate the input on focus moved away
          $("#password-reset").on("blur",function () {
            var result = window.user.validate.password(this);
            if(result.valid){
              $("#reset-password-button").prop({disabled:false});
            }else{
              $("#reset-password-button").prop({disabled:true});
            }
          });
          // Event handler to validate the fullname when idle for 3 seconds
          $("#password-reset").on("keypress keyup",debounce(function (event) {
            var result = window.user.validate.password(this);
            if(result.valid){
              $("#reset-password-button").prop({disabled:false});
            }else{
              $("#reset-password-button").prop({disabled:true});
            }
          }, 1000));

          $("#reset-password-button").on("click", function(){
            try {
              var userSHA = CryptoJS.SHA256(userChange.username).toString();
              var hash = CryptoJS.SHA256($("#password-reset").val());
              var securePassword = hash.toString(CryptoJS.enc.Base64);
              userChange.password = securePassword;
              dataStore.save("users", userSHA, userChange);
              $("#password-reset").val("");
              $(this).prop({disabled:true});
              $.alert("Password reset complete. An email is sent to the user","Success");
            } catch (e) {
              $.alert("Password reset failed. Try again","Failed")
            }
          })
          $("#new-secret-1").on("blur",function(){
            if($("#new-secret-1").val() != ""){
              $("#new-secret-2").prop({disabled:false});
              $("#reset-secrets").prop({disabled:false});
              $("#new-secret-2").focus();
            }else{
              $("#new-secret-2").prop({disabled:true});
              $("#reset-secrets").prop({disabled:true});
            }

          })

          // Reset secrets
          $("#reset-secrets").on("click", function(){
            if($("#new-secret-1").val() != "" &&  $("#new-secret-2").val() != ""){
              try {

                var userSHA = CryptoJS.SHA256(userChange.username).toString();
                userChange.secrets = {
                  "secret1": $("#new-secret-1").val(),
                  "secret2": $("#new-secret-2").val()
                }
                dataStore.save("users", userSHA, userChange);
                $("#new-secret-1").val("");
                $("#new-secret-2").val("");
                $(this).prop({disabled:true});
                $.alert("Secrets reset complete. An email is sent to the user", "Success");
              } catch (e) {
                $.alert("Secrets reset failed. Try again", "Failed");
              }
            }else{
              $.alert("Please input both secret phrases","Input Required");
            }
          })
          // activate and deactivate button event listeners
          $("#activate-user").on("click", function(){
            try {
              var userSHA = CryptoJS.SHA256(userChange.username).toString();
              userChange.active = true;
              dataStore.save("users", userSHA, userChange);
              $("#user-selection :selected").remove();
              $("#user-selection").val("none");
              $(this).prop({disabled:true});
              menuUI.populateUserDetails(userChange);
              $.alert("User is activated. An email is sent to the user","Success")
            } catch (e) {
              $.alert("Activation failed","Failed")
            }
          });
          $("#deactivate-user").on("click", function(){
            try {
              var userSHA = CryptoJS.SHA256(userChange.username).toString();
              userChange.active = false;
              dataStore.save("users", userSHA, userChange);
              $(this).prop({disabled:true});
              menuUI.populateUserDetails(userChange);
              $.alert("User is deactivated. An email is sent to the user","Success")
            } catch (e) {
              $.alert("Deactivation failed","Failed")
            }
          });
        }
    });
  },
  populateSelectBox:function(selectBox,type){
    $(selectBox).empty();
    // userlist must exists in the session storage. if not loadit again
    if(sessionStorage.users == null){
      $(selectBox).append("<option value='none' disabled selected>Loading...</option>");
      getUsersList()
      setTimeout(function(){
        loadOptions()
      },1000);
    }else{
      loadOptions()
    }

    function loadOptions(){
      if(sessionStorage.users != null){
        var usersList = JSON.parse(sessionStorage.users)
        var defaultOption = "Select a Name"
        if(type == "inactive"){
          defaultOption = "Select an inactive user"
        }else if(type == "patient"){
          defaultOption = "Select a patient"
        }
        $(selectBox).empty();
        var option = $("<option value='none' disabled selected>" + defaultOption + "</option>");
        $(selectBox).append(option);
        for(index in usersList){
          var xhrUser = dataStore.load("users", usersList[index]);
          xhrUser.always(function(data, textStatus, jqXHR){
            if(textStatus == "success" && jqXHR.status == 200){
              var userChange = JSON.parse(data);
              if(userChange.username != sessionStorage.activeUser){
                if(type == "all"){
                  var option = $("<option style='width:50%' value='" + userChange.username + "'>" + userChange.fullname +"</option>");
                  $(selectBox).append(option);
                }else if(type == "inactive"){
                  if(userChange.active == false){
                    var option = $("<option value='" + userChange.username + "'>" + userChange.fullname +"</option>");
                    $(selectBox).append(option);
                  }
                }else if(type == "patient"){
                  if(userChange.role == "1" && userChange.carer == sessionStorage.activeUser){
                    var option = $("<option value='" + userChange.username + "'>" + userChange.fullname + " [" + userChange.email +"]</option>");
                    $(selectBox).append(option);
                  }
                }
              }
            }
          });
        }
      }else{
        $(selectBox).append("<option value='none' disabled selected>Unavailable.</option>");
      }
    }
  },
  populateUserDetails:function(userChange){
    $("#user-fullname").val(userChange.fullname);
    $("#user-username").val(userChange.username);
    $("#user-email").val(userChange.email);
    switch (userChange.role){
      case "0":
        $("#user-role").val("Admin");
      break;
      case "1":
        $("#user-role").val("Patient");
      break;
      case "2":
        $("#user-role").val("Carer");
      break;
      default:
        $("#user-role").val("None");
    }

    if(userChange.carer != null){
      $("#user-carer").val(userChange.carer);
    }else {
      if(userChange.role == "1"){
        $("#user-carer").val("Not Available");
      }else {
        $("#user-carer").val("Not Applicable");
      }
    }

    if(userChange.active){
      $("#user-active").prop("checked","true").addClass("is-success");
      $("[for='user-active']").html("Activated").css("color","white");;
    }else{
      $("#user-active").prop("checked","").removeClass("is-success");
      $("[for='user-active']").html("Deactivated").css("color","red");
    }

    if(userChange.secrets != undefined){
      $("#user-secret-1").val(userChange.secrets.secret1);
      $("#user-secret-2").val(userChange.secrets.secret2);
    }
  },
} // End of menuUI definition ------------------------------------------------->
