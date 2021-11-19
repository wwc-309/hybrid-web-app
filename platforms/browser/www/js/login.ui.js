/* =============================================================================
  Group: 6 (Keshav Hegde, Tommy Chak, Megan Petersen, Susan Idris)
  Subject: SIT302 Project Delivery
  Assignment: Project  - Bipolar App
  Trimester: T3-2017
==============================================================================*/
/* ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
login.ui.js
Creates login and register fields for and registration process
Once successfully logged in then call menu.ui.js functions to create and display
navigation bar and load tree menu
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
window.loginUI = {
  /*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    Function to create login fields and buttons within the modal window
    Login fields:
    1. username (is email address) - isEmpty validation
    2. password - isEmpty validation
    Buttons:
    1. Sign-In - on success call menu creation functions as in menu.ui.js
    2. Sign-Up - call register form
    3. Forgot password (should look like a link) - call password reset form
  ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
  loginForm: function(){
    // Refresh the user listing
    getUsersList();

    // Create fields and buttons and append to it
    var loginBox = $("#loginBox");
    // Clear out anything in it before adding fields
    $(loginBox).empty();
    var usernameBox = this.field.textBox("text", "Username","username")

    $(loginBox).append(usernameBox);
    this.field.fieldIcon("fa-user",$("[id='username']"));
    $(loginBox).append(this.field.textBox("password", "Password","password"));
    this.field.fieldIcon("fa-eye",$("[id='password']"));

    // Login button
    var buttonField = $(this.field.button("Login"));
    $(buttonField).find(".button").addClass("is-primary is-fullwidth is-medium");
    $(buttonField).find(".button").on("click",function(){
      $(this).addClass("is-loading");
      $("#filler").height("0px");
      $(".hero-head").find(".title").html("My Dashboard");
      $(".hero-head").find("#content").html("<p>Welcome to MoodSwings</p>");
      user.login();
    });
    $(loginBox).append(buttonField);
    // Register button
    buttonField = $(this.field.button("Register"));
    $(buttonField).find(".button").addClass("is-info is-outlined is-fullwidth");
    $(buttonField).find(".button").on("click",function(){

      loginUI.registerForm();

    });
    $(loginBox).append(buttonField);
    // last two buttons are wrapped in columns
    // Forgot password button
    var columns = $("<div class='columns is-mobile'></div>");
    buttonField = $(this.field.button("Forgot Password"));
    $(buttonField).find(".button").addClass("is-warning is-outlined is-fullwidth is-small");
    $(buttonField).find(".button").on("click",function(){
      loginUI.passwordResetForm();
    });
    var column = $("<div class='column'></div>");
    $(column).append(buttonField);
    $(columns).append(column);
    // Cancel button
    buttonField = $(this.field.button("Cancel"));
    $(buttonField).find(".button").addClass("is-danger is-outlined is-fullwidth is-small");
    $(buttonField).find(".button").on("click",function(){
      // Go back to where you come from
      window.location.href = document.referrer
    });
    column = $("<div class='column'></div>");
    $(column).append(buttonField);
    $(columns).append(column);
    $(loginBox).append(columns);

    // If available fill out the username field in login screen and focus to password field
    if(!(localStorage.activeUser == "" || localStorage.activeUser == undefined)){
      $(loginBox).find('#username').val(localStorage.activeUser);
      $(loginBox).find('#password').focus();
    }else{
      $(loginBox).find('#username').focus();
    }
    // Display the login UI
    $("#entry").addClass("is-active");

  }, // End of loginForm ------------------------------------------------------>
  /*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    Function to create regsitration fields and buttons within the modal window
    Registration fields:
    1. Fullname - Single field for the first name middle name and lastname
    2. Username - User chosen letters, numbers and underscore only
    3. Email - User's chosen email address
    4. Password - Minimum 8 chars long, atleast 1 Uppercase, 1 lowercase and a
                  number
    5. Role - Registering users's role (Patient/Carer)
    6. Carer - Registered users with carer roles
    Buttons:
    1. Submit - After a successful validation user is registered in the system
    2. Cancel - Cancels and reloads the login form

    Parameters: None
    Returns: None
  ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
  registerForm:function(){
    // Create fields and buttons and append to it
    var loginBox = $("#loginBox");
    // Clear out anything in it
    $(loginBox).empty();
    // Fullname input field
    $(loginBox).append(this.field.textBox("text", "Full Name", "fullname" ));
    this.field.fieldIcon("fa-user",$("[id='fullname']"));
    // Event handler to validate the input on focus moved away
    $("#fullname").on("blur",function () {
      user.validate.fullName(this);
    });
    // Event handler to validate the fullname when idle for 3 seconds
    $("#fullname").on("keypress keyup",debounce(function (event) {
      user.validate.fullName(this);
    }, 3000));

    $(loginBox).append(this.field.textBox("text", "Username", "username"));
    this.field.fieldIcon("fa-user",$("[id='username']"));
    // Event handler to validate the input on focus moved away
    $("#username").on("blur",function () {
      user.validate.userName(this);
    });
    // Event handler to validate the fullname when idle for 3 seconds
    $("#username").on("keypress keyup",debounce(function (event) {
      user.validate.userName(this);
    }, 3000));

    $(loginBox).append(this.field.textBox("email", "Email", "email"));
    this.field.fieldIcon("fa-envelope",$("[id='email']"));
    // Event handler to validate the input on focus moved away
    $("#email").on("blur",function () {
      user.validate.eMail(this);
    });
    // Event handler to validate the fullname when idle for 3 seconds
    $("#email").on("keypress keyup",debounce(function (event) {
      user.validate.eMail(this);
    }, 3000));

    $(loginBox).append(this.field.textBox("password", "Password", "password"));
    this.field.fieldIcon("fa-eye",$("[id='password']"));
    // Event handler to validate the input on focus moved away
    $("#password").on("blur",function () {
      user.validate.password(this);
    });
    // Event handler to validate the fullname when idle for 3 seconds
    $("#password").on("keypress keyup",debounce(function (event) {
      user.validate.password(this);
    }, 1000));

    // Select/dropdown input for selecting Role of the user
    var roles = [{"id": 0, "text":"Admin"},{"id": 1, "text":"Patient"},{"id": 2, "text":"Carer"}];
    $(loginBox).append(this.field.select("Select Role", "role", roles));

    // Select/dropdown input for selecting Role of the carer
    var carers = [{"text": "None Registered", "id": "none"}]
    if(sessionStorage.carers != null){
      carers = JSON.parse(sessionStorage.carers);
    }

    $(loginBox).append(this.field.select("Select Carer", "carer", carers));
    // If Role selection is other than Patient then disable the Carer selection
    $("select[name='role']").on("change", function(){
      $("select[name='carer']").prop("disabled", $(this).val() != 1);
      user.validate.role(this);
    })

    // If Role selection is other than Patient then disable the Carer selection
    $("select[name='carer']").on("change", function(){
      user.validate.carer(this);
    })

    // Submit button will register the user by saving input field data into
    // datastore after validation,
    var buttonField = $(this.field.button("Submit"));
    $(buttonField).find(".button").addClass("is-primary is-fullwidth");
    $(buttonField).find(".button").on("click",function(){
      user.register();
    //loginUI.secretForm();
    });
    $(loginBox).append(buttonField);
    // Cancel button will take the visitor back to the login screen
    buttonField = $(this.field.button("Cancel"));
    $(buttonField).find(".button").addClass("is-info is-outlined is-fullwidth");
    $(buttonField).find(".button").on("click",function(){
      loginUI.loginForm();
    });
    $(loginBox).append(buttonField);
  }, // End of registerForm --------------------------------------------------->

  secretForm:function(userSHA, newUser){
    var loginBox = $("#loginBox");
    $(loginBox).empty();
    $(loginBox).append("<label class='label'>Provide two secret phrases which will be used for self password reset</label>");
    $(loginBox).append(this.field.textBox("text", "Secret 1","secret-1"));
    $(loginBox).append(this.field.textBox("text","Secret 2","secret-2"));
    var buttonField = $(this.field.button("Submit"));
    $(buttonField).find(".button").addClass("is-primary is-fullwidth");
    $(buttonField).find(".button").on("click",function(){
      var errMessage = "Unable to register right now. Please try again later";
      try {
        if($("#secret-1").val() == "") throw "Secret Phrase 1 is empty. Please provide one."
        if($("#secret-2").val() == "") throw "Secret Phrase 2 is empty. Please provide one."
        //saving of hashed phrase to datastore
        newUser.secrets = {
          "secret1": $("#secret-1").val(),
          "secret2": $("#secret-2").val()
        }

        dataStore.save("users", userSHA, newUser);
        $.confirm({
          title: "Registered",
          content: "You have been registered now. However account requires activation before you can login. \n You should get an confirmation email within 24 hours.",
          type: "green", typeAnimated: true,
          useBootstrap: false,
          boxWidth:"75%",
          buttons:{
            Okay: {
              text: "Okay",
              btnClass: "btn-blue",
              action: function(){
                loginUI.loginForm();
              }
            }
          }
        });
      } catch (e) {
        errMessage = e
        $.alert(errMessage, "Failed");
      }
    });
    $(loginBox).append(buttonField);
    // Cancel button will take the visitor back to the login screen
    buttonField = $(this.field.button("Cancel"));
    $(buttonField).find(".button").addClass("is-info is-outlined is-fullwidth");
    $(buttonField).find(".button").on("click",function(){
      loginUI.loginForm();
    });
    $(loginBox).append(buttonField);
  },
  /*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    Function to create password reset fields and buttons within the modal window
    Reset form fields:
    1. Username - username for which password needs to be reset
    2. Email - User's email address
    Buttons:
    1. Request Password - Opens secret phrases and password selection input form
    2. Cancel - Cancels and reloads the login form

    Parameters: None
    Returns: None
  ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
  passwordResetForm:function(){
    // Create fields and buttons and append to it
    var loginBox = $("#loginBox");
    // Clear out anything in it
    $(loginBox).empty();

    $(loginBox).append(this.field.textBox("text", "Username","username"));
    $(loginBox).append(this.field.textBox("text", "Email","email"));

    // Buttons wrapper
    var level = $("<nav class='level is-mobile'><div class='level-left'><div class='level-item'></div></div>" +
                "<div class='level-right'><div class='level-item is-marginless'></div></div></nav>");
    //Request password
    var nextButton = $(this.field.button("Next"));
    $(nextButton).find(".button").addClass("is-primary is-fullwidth");
    $(nextButton).find(".button").on("click",function(){
      var userSHA = CryptoJS.SHA256($("#username").val()).toString();
      var xhrUser = dataStore.load("users", userSHA);
      xhrUser.always(function(data, textStatus, jqXHR){
        try {
          if(textStatus != "success" || jqXHR.status != 200) throw "We couldn't find the username, '" + $("#username").val() + "' Please register"
          var userChange = JSON.parse(data);
          if(userChange.username != $("#username").val()) throw "We couldn't find the username, '" + $("#username").val() + "' Please register"
          if(userChange.email != $("#email").val()) throw "Email provided not belonged the username. " + $("#username").val() + " Please re-enter"
          loginUI.passwordChangeForm(userChange);
        } catch (e) {
          $.alert(e, "Not Found");
        }
      });
    });

    // Cancel button will take the visitor back to the login screen
    var cancelButton = $(this.field.button("Cancel"));
    $(cancelButton).find(".button").addClass("is-info is-outlined is-fullwidth");
    $(cancelButton).find(".button").on("click",function(){
      loginUI.loginForm();
    });
    $(level).find(".level-left").find(".level-item").append(cancelButton);
    $(level).find(".level-right").find(".level-item").append(nextButton);
    $(loginBox).append(level);
  }, // End of passwordResetForm ---------------------------------------------->
  /*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    Function to create password secret phrases, new password selection and
    buttons within a modal window
    Change form fields:
    1. Secret Phrase 1 - Secret phrase which is set during registration
    2. Secret Phrase 2 - Secret phrase which is set during registration
    3. New Password - To enter new password
    4. Confirm new password - To repeat and confirm new password
    Buttons:
    1. Submit - Action to change the password for the user

    Parameters: None
    Returns: None
  ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
  passwordChangeForm:function(userChange){
    var loginBox = $("#loginBox");
    $(loginBox).empty();
    $(loginBox).append(this.field.textBox("text", "Secret Phrase 1","secret-1"));
    $(loginBox).append(this.field.textBox("text","Secret Phrase 2","secret-2"));

    $(loginBox).append(this.field.textBox("password", "New Password", "passwordNew"));
    this.field.fieldIcon("fa-eye",$("[id='passwordNew']"));
    // Event handler to validate the input on focus moved away
    $("#password").on("blur",function () {
      user.validate.password(this);
    });
    // Event handler to validate the fullname when idle for 3 seconds
    $("#passwordNew").on("keypress keyup",debounce(function (event) {
      user.validate.password(this);
    }, 1000));

    $(loginBox).append(this.field.textBox("password", " Confirm New Password", "passwordConfirm"));
    this.field.fieldIcon("fa-eye",$("[id='passwordConfirm']"));
    // Event handler to validate the input on focus moved away
    $("#password").on("blur",function(){
      user.validate.password(this);
    });
    // Event handler to validate the fullname when idle for 3 seconds
    $("#password").on("keypress keyup",debounce(function (event) {
      user.validate.password(this);
    }, 1000));

    var buttonField = $(this.field.button("Reset"));
    $(buttonField).find(".button").addClass("is-primary is-fullwidth");
    $(buttonField).find(".button").on("click",function(){
      try {
        if($("#secret-1").val() != userChange.secrets.secret1) throw "Secret Phrase 1 doesn't match."
        if($("#secret-2").val() != userChange.secrets.secret2) throw "Secret Phrase 2 doesn't match."
        if(user.validate.password($("#passwordNew")).valid == false) throw "Password must be 8 characters long and must have at least 1 uppercase, 1 lowercase and a number"
        if($("#passwordNew").val() != $("#passwordConfirm").val()) throw "New password and confirmation password doesn't match"
        var userSHA = CryptoJS.SHA256(userChange.username).toString();
        var hash = CryptoJS.SHA256($("#passwordNew").val());
        var securePassword = hash.toString(CryptoJS.enc.Base64);
        userChange.password = securePassword;
        dataStore.save("users", userSHA, userChange);
        $.alert("Password has been reset. Now you can login with your new password","Success");
        loginUI.loginForm();
      } catch (e) {
        $.alert(e, "Errors..")
      }
    });
    $(loginBox).append(buttonField);

    // Cancel button will take the visitor back to the login screen
    buttonField = $(this.field.button("Cancel"));
    $(buttonField).find(".button").addClass("is-info is-outlined is-fullwidth");
    $(buttonField).find(".button").on("click",function(){
      loginUI.loginForm();
    });
    $(loginBox).append(buttonField);
  }, // End of passwordChangeForm --------------------------------------------->
  // /*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
  //   Function to change User's settings set/change form.
  //     Parameters: None
  //   Returns: None
  // ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
  // settingsWindow:function(){
  //   var settingsBox = $("#settingsBox");
  //   $(settingsBox).empty();
  //   $(settingsBox).append(this.field.checkBox("Save Password"));
  //   $(settingsBox).append(this.field.checkBox("Enable Logging"));
  //   // TODO:
  //   // 1. Retrieving the current settings to populate the field
  //   // 2. Saving the new settings global variable, local storage and datastore.
  //   // 3. Change in settings should take effect immediately
  //
  // }, // End of settingsWindow ------------------------------------------------->
  /*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    Object Definition to create form input fields
  ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
  field:{
    /*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
      Function to create a textbox
      Parameters:
        - type: type of input field (e.g. text/date/email/password)
        - placeHolder: help text for the text field
        - id: Id for the input field
      Returns:
        - Input field wrapped in the field control
    ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
    textBox:function(type, placeHolder, id){
      var node = $("<input class ='input' id='" + id + "' type='" + type + "' placeholder='" + placeHolder + "'>");
      return this.fieldControl(node)
    }, // End of textBox ------------------------------------------------------>
    /*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
      Function to create a label for the input fields
      Parameters:
        - name: Label text
      Returns:
        - the Label
    ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
    label:function(name){
        return $("<div class='control'><a class='button is-static'>" + name + "</a></div>");
    }, // End of label ------------------------------------------------------->
    /*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
      Function to create a button
      Parameters:
        - name: Botton text
      Returns:
        - Button field wrapped in the field control
    ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
    button:function(name){
      var node = "<button class='button'>" + name + "</button>";
      return this.fieldControl(node);
    }, // End of button ------------------------------------------------------->
    /*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
      Function to create a checkbox
      Parameters:
        - name: Checkbox label
      Returns:
        - Checkbox field wrapped in the field control
    ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
    checkbox:function(name){
      var node = "<label class='checkbox'>" +
                  "<input type='checkbox'>" + name +
                 "</label>";
      return this.fieldControl(node);
    }, // End of checkbox ----------------------------------------------------->
    /*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
      Function to create a select / dropdown box
      Parameters:
        - name: Option text
        - id: Id for the input field
        - options: An array of options
      Returns:
        - Select/Dropdown field wrapped in the field control
    ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
    select:function(name, id, options){
        var node = $("<div class='select is-fullwidth'></div>");
        var dropdown = $("<select name='" + id + "'></select>");
        $(dropdown).append($("<option selected disabled value='none'>" + name + "</option>"));
        for(index in options){
          var option = $("<option value='" + options[index].id + "'>" + options[index].text +"</option>");
          $(dropdown).append(option);
        }
        $(node).append(dropdown);
        return this.fieldControl(node);
    }, // End of select ------------------------------------------------------->
    /*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
      Function to create a wrapper (field & control) wrapper for the fields
      Parameters:
        - node: The input element
      Returns:
        - Set of elements wrapping the supplied input field
    ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
    fieldControl:function(node){
      var field = $("<div class='field'></div>");

      var control = $("<div class='control'></div>");
      $(control).append(node);
      var result =  $(field).append(control);
      if($(node).hasClass("input")){
        var help = $("<label for='" + $(node).attr("id") + "' class='is-valid is-danger'><span style='color:red'>&#9733</span></label>")
        $(field).append(help);
      }
      return result;
    }, // End of fieldControl ------------------------------------------------->
    /* ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    Function to attach an icon to password (or any other field) field and toggle
    the icon between
    eye open and close along with toggling password field type between password
    (masked) and text (unmasked).
    Parameters: faIcon - Fontawesome icon class
                field - an input field (typically password type)
    Returns: Nothing.
    ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
    fieldIcon:function(faIcon, field){
      var icon = $("<a class='icon is-small is-left'><i class='fa " + faIcon + "'></i></a>");
      // Override Bulma css property from none to auto to enable clicking
      $(field).parent().addClass("has-icons-left");
      $(field).parent().append(icon);
      // Add event listener to the icon to manipulate a password fields
      // requires to have and id containing word 'password' to work
      if($(field).attr("type") == "password"){
        $(icon).css({"pointer-events":"auto","color":"#000000"});
        $(icon).on("click",function(){
          // Toggle the input type
          if($(icon).find(".fa").hasClass("fa-eye")){
            $(this).siblings("input").attr("type","text");
          }
          if($(icon).find(".fa").hasClass("fa-eye-slash")){
            $(this).siblings("input").attr("type","password");
          }
          // Toggle the icon
          $(icon).find(".fa").toggleClass("fa-eye fa-eye-slash");
        });
      }else{
        $(icon).css({"pointer-events":"none","color":"#dbdbdb"});
      }
    }
  } // End of field ----------------------------------------------------------->
}// End of loginUI ------------------------------------------------------------>
