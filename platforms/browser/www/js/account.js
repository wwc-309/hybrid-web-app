/* =============================================================================
  Group: 6 (Keshav Hegde, Tommy Chak, Megan Petersen, Susan Idris)
  Subject: SIT302 Project Delivery
  Assignment: Project  - Bipolar App
  Trimester: T3-2017

  account.js - Functions to authenticate an user and /or register an user
  after thorough validation of inputs
==============================================================================*/
window.user = {
  /*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    Function to authenticate the user on login
    Username and password fields are 'validated' (only for blank at the
    moment) then tested against the user JSON object values for the username
    and password. If successful main page with navigation menu is loaded
    otherwise an alert is show about the failure and login page is presented
    Parameters: None
    Returns: Nothing
  ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
  login: function(){
    var fnLog = "user.login()";

    var username = $("#username").val().toLowerCase();
    var password = $("#password").val();
    var authenticated = false;

    // Validate user input fields i.e. username and password
    if(username == ""){
      $.alert("Provide Username","Error");
      $(".is-loading").removeClass("is-loading");
    }else if(password == ""){
      $.alert("Provide Password","Error");
      $(".is-loading").removeClass("is-loading");
    }else{


      // Hash the password for testing
      var hash = CryptoJS.SHA256(password);
      passwordSHA = hash.toString(CryptoJS.enc.Base64);


      try {
        // Get locally stored user details
        var loginUser = JSON.parse(sessionStorage.getItem(username));
        // When user details not available
        if (loginUser == null || loginUser == undefined){
          // Hash the supplied username and store it in localStorage for later use
          var userSHA = CryptoJS.SHA256(username).toString();
          sessionStorage.userSHA = userSHA;
          // Retreive user details from the cloud datastore
          xhr = dataStore.load("users", userSHA);
          // Ajax returns the data, status
          xhr.always(function(data, textStatus){
            try {
                // Parse the returned data to JSON object
                loginUser = JSON.parse(data);
                // Call login function for further processing
                user.authenticate(username,passwordSHA,loginUser);
            } catch (error) {
                if(debug) writeToLog("index.js", fnLog, "Error in Getting user details for login. Ajax status: " + textStatus, error);
                // Provide user the option of registering by presenting register page when username doesn't exists
                $.alert("Username Doesn't exists. Please register","Not registered");
                $(".is-loading").removeClass("is-loading");
                sessionStorage.removeItem("activeUser");
                sessionStorage.removeItem("userSHA");
            }
          });
        }else{
          // Call login function using local storage user details
          this.authenticate(username,passwordSHA,loginUser);
        }
      } catch (error) {
        if(debug) writeToLog("index.js", fnLog, "Exception in authenticating" + error);
      }
    }
  },
  /* End of authenticateuser function ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
  /*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
  Function to compare the supplied username and password with stored (registered) user's credentials
  Once credential check passed user details are saved/updated in the local storage
  then tested against the user JSON object values for the username and password
  If successful quiz / survey selection page is pushed to the top of the stack or otherwise
  an alert is show about the failure and login page is presented
  Parameters:
    username: User supplied username
    password: User supplied password
    loginUser: User details object either from Local Storage or Cloud Storage
  Returns: nothing
  ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
  authenticate: function(username, password, loginUser){
    var fnLog = "user.authenticate(username, password, loginUser)";

    try {
        // Test and match username and password against the LocalStorage
      if(username == loginUser.username && password === loginUser.password){

        if(loginUser.active == false) throw "Your account is not active. Contact admin@moodswings.net.au";
        // Save as active / current user in the session storage
        // Save/Update the user details in the session storage
        sessionStorage.activeUser = username;
        sessionStorage.userRole = loginUser.role;
        sessionStorage.setItem(username, JSON.stringify(loginUser));
        this.loadMenu();

      }else{
        // In case of login failure display an alert
        $(".is-loading").removeClass("is-loading");
        $.confirm({
          title: "Login Error",
          content: "Username and / or Password is incorrect.",
          type: "red", typeAnimated: true,
          useBootstrap: false,
          boxWidth:"75%",
          buttons:{
            tryAgain: {
              text: "Try again",
              btnClass: "btn-red",
              action: function(){
                $("#password").val("");
                $("#username").focus();
              }
            }
          }
        });
      }
    } catch (error) {
      if(debug) writeToLog("index.js", fnLog, "Exception occured while Login" + error);
      $.alert("Login failed: " + error, "Error!")
      $(".is-loading").removeClass("is-loading");
    }
  },
  /* End of login function ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
  /*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    Function to load the menu system after successful login or reloads the page
    in the same session

    Once logged in login data is saved in to 'sessionStorage' and login bypassed
    to load the menu system for the user
  ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
  loadMenu:function(){

    setTimeout(function(){
      // Remove the login UI
      $("#entry").removeClass("is-active");
      // Load the main menu
      $(".navbar").append(menuUI.navbarMenu.mainMenu());
      // Burger menu toggle
      $(".burger").on("click", function(){
        this.classList.toggle("is-active");
        $("#mainMenu").get(0).classList.toggle("is-active");
        $("#filler").height("0px");
        $("#mainMenu").find(".navbar-dropdown").each(function(){
          $(this).hide();
          $(this).siblings(".navbar-link").css({"background-color":"inherit","color":"inherit","font-weight":"inherit"})
        });
      });
      // Load the sliding menu when a navbar drodown is clicked or hovered
      $(".navbar-link").on("click",function(event){
        // Hide all dropdowns first
        $("#mainMenu").find(".navbar-dropdown").each(function(){
          $(this).parent().removeClass("active-dropdown");
          $(this).hide();
          $(this).siblings(".navbar-link").css({"background-color":"inherit","color":"inherit","font-weight":"inherit"})
        })
        // Only show the selected drop down
        var dropDown = $(this).siblings(".navbar-dropdown");
        localStorage.currentSection = $(this).attr("id");
        $(dropDown).show();
        if($(".burger").hasClass("is-active")){
          $(dropDown).parent().addClass("active-dropdown");
        }else{
          $(dropDown).parent().removeClass("active-dropdown");
        }
        $(this).css({"background-color":"#292929","color":"white","font-weight":"bold"})
      });
      $("#mainMenu").find(".fa-sign-out").on("click", function(){
        sessionReset();
      })
      // Remove the 'loading' icon from the login button
      $(".is-loading").removeClass("is-loading");
    }, 1000);
  },
  /* End of login function ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
  /*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    Function to register a new user
    Fullname, Username and password fields are 'validated'
    also password is encrypted using SHA256 is done.
    Once validated new user data is saved in to 'LocalStore' and Cloud 'datastore'
    as well
  ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
  register: function(){
    var fnLog = "registerUser()";
    // Function call to validate registration input data and return results object
    var result = this.validate.all();
    // When validated.valid is true, Full name, username (email) and chosen passwords are valid
    if(result.valid){
      // Hash the password uisng SHA256 and stringfy for LocalStorage
      // Valid password is encrypted using SHA256 with the use of crypto-js library
      var hash = CryptoJS.SHA256(result.password);
      var securePassword = hash.toString(CryptoJS.enc.Base64);

      // Save the newly registered user to LocalStorage and Cloud Storage
      try {
        // Create a new user object with values from the validation
        var newUser = {
          "fullname":result.fullname,
          "username":result.username,
          "email":result.email,
          "password":securePassword,
          "role":result.role,
          "carer":result.carer,
          "active":false
        }

        // Hash the username before saving to localStorage and cloud datastore
        // for security and data integrity
        var userSHA = CryptoJS.SHA256(result.username).toString();
        // Display secret questions form
        loginUI.secretForm(userSHA, newUser);
      } catch (error) {
        $.alert("Registration failed due to " + error.message + ". Please try again.","Validation failed");
      }
    }else{
      $.alert(result.message,"Validation failed");
      $(result.focusto).focus();
    }
  },
  /* End of registerUser function ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/

  validate:{
    /*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
      Function to validate input values of registration form
      Separate functions are called for each input fields validation
      Parameters: None
      Returns: An object with a result (boolean) and validated values.
    ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
    all: function(){
      try {
        // Call function to validate fullname, Unicode names are supported
        // Function returns an object containing a result bit and validated full name
        var fullname = this.fullName($("#fullname"));
        if(!fullname.valid) throw fullname.message;
        // Call function to validate username, Unicode characters are supported
        // Function returns an object containing a result bit and validated username
        var username = this.userName($("#username"));
        if(!username.valid) throw username.message;
        // Call function to validate email, Unicode characters are supported
        // Function returns an object containing a result bit and validated email
        var email = this.eMail($("#email"));
        if(!email.valid) throw email.message;
        // Call function to validate password, Passwords rules are applied
        // Function returns an object containing a result bit and validated and hashed password
        var password = this.password($("#password"));
        if(!password.valid) throw password.message;
        // Call function to validate role selection
        // Function returns an object containing a result bit and validated role
        var role = this.role($("select[name='role']"));
        if(!role.valid) throw role.message;
        // Call function to validate carer selection
        // Function returns an object containing a result bit and validated carer
        var carer = this.carer($("select[name='carer']"));
        if(!carer.valid) throw carer.message;

        // Return the object containing result (boolean) and data for registration
        return {
          "valid":true,
          "fullname":fullname.fullname,
          "username":username.username,
          "email":email.email,
          "password":password.password,
          "role":role.role,
          "carer":carer.carer,
        };

      } catch (error) {
        return {
          "valid":false,
          "message":error
        };
      }
    },
    /* End of validateRegistration function ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
    /*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
      Function to validate full name field
      Validated for empty, letters only in any language
      Then first character of each word is capitaliased
      Parameters: Input field (<input type="text">)
      Returns: An object with a result (boolean) and validated fullname.
    ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
    fullName: function(input){
      var errMessage = "Name";
      var result = false;
      var name = $(input).val();
      try {
        if(name == "") throw "Fullname cannot be empty";

        // FUll name must not have any numbers, and puctuation marks except -_
        // To cater for different lauguages and cultures only numbers are NOT allowed.
        const pattern = /^[^0-9!"#$%&'()*+,./:;<=>?@[\]^_{|}~]+$/g
        if(pattern.test(name) == false) throw "Letters, '-' and ''' only";
        /*
          Capitalise first letter of every word.
          Regex Idea from:
            https://stackoverflow.com/questions/7376238/javascript-regex-look-behind-alternative
          Answer by: Tim Pietzcker
          Replace Function snippet :
            https://stackoverflow.com/questions/6251463/regex-capitalize-first-letter-every-word-also-after-a-special-character-like-a
          Answer by: NotNedLudd
        */
        var regx = /^.{1}|(?:(?=\s).{1}).{1}/g
        name = name.toLowerCase();
        name = name.replace(regx, function(x){return x.toUpperCase();});
        $("#fullname").val(name);
        $("label[for='fullname']").html("<span style='color:green'>&#10004</span>");
        result = true;
      } catch (err) {
        errMessage = err;
        $("label[for='fullname']").html("<span style='color:red'>" + errMessage + "&nbsp;&#10060</span>");
      }finally{
        // Return a tuple object containing result, error message and validatied name.
        return {"valid":result, "message":errMessage, "fullname":name};
      }
    },
    /* End of validateFullName function ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
    /*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
      Function to validate username (email) field
      Validated for empty, correct email format as per RFC6532-Internationalized Email Headers
      whole address is lower cased
      Parameters: Input field (<input type="email">)
      Returns: An object with a result (boolean) and validated username (email).
    ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
    userName: function(input){
      var errMessage = "Username";
      var result = false;
      var username = $(input).val();

      try {
        if(username == "") throw "Username cannot be empty";

        // FUll name must not have any numbers, and puctuation marks except -_
        // To cater for different lauguages and cultures only numbers are NOT allowed.
        const pattern = /^[^-!"#$%&'()*+,./:;<=>?@[\]^\s{|}~]+$/g
        if(pattern.test(username) == false) throw "Letters, numbers and '_' only";

        // Find weather username already exists
        if(this.isExists(username)) throw "Username taken";
        username = username.toLowerCase();
        $(input).val(username);
        $("label[for='username']").html("<span style='color:green'>&#10004</span>");
        result = true;
      } catch (error) {
        errMessage = error;
        $("label[for='username']").html("<span style='color:red'>" + errMessage + "&nbsp;&#10060</span>");
      }finally{
        return {"valid":result, "message":errMessage, "username":username};
      }
    },
    /*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
      Function to validate email field
      Validated for empty, correct email format as per RFC6532-Internationalized
      Email Headers. whole address is lower cased
      Parameters: Input field (<input type="email">)
      Returns: An object with a result (boolean) and validated username (email).
    ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
    eMail: function(input){
      var errMessage = "eMail";
      var result = false;
      var email = $(input).val();

      try {
        if(email == "") throw "Provide your email address";
        /* Email test pattern
          Idea source: http://emailregex.com/ available JavaScript expression
          modified to include any unicode characters
          fine tuned IP address matching to exclude broadcast addresses.
          Online tool used: https://www.debuggex.com/
          Picture speaks thousand words -> ../img/email-regex-diagram.PNG
        */
        const pattern = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[((25[0-4]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(25[0-4]|2[0-4][0-9]|[01]?[0-9][0-9]?)])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
        if(pattern.test(email) == false) throw "Email address is not in acceptable format.";
        email = email.toLowerCase();
        // Find weather username already exists
        if(this.isExists(email)) throw "Email address registered. Please verify";

        $("#email").val(email);
        $("label[for='email']").html("<span style='color:green'>&#10004</span>");
        result = true;
      } catch (error) {
        errMessage = error;
        $("label[for='email']").html("<span style='color:red'>" + errMessage + "&nbsp;&#10060</span>");
      }finally{
        return {"valid":result, "message":errMessage, "email":email};
      }
    },
    /* End of validateEmail function ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
    /*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
      Function to validate passwords field
      Validated for empty, password strength

      Parameters: Input field (<input type="password">)
      Returns: An object with a result (boolean) and validated and hashed password.
    ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
    password: function(input){
      var errMessage = "Password";
      var result = false;
      var password = $(input).val();

      try {
        if($(input).val() == "") throw "Choose a Password";
        if($(input).val().length < 8) throw "(" + $(input).val().length + "/8)";
        // regular expression pattern for Password Rule: Minimum 8 characters,
        // Atleast one Uppercase, one lowercase and one digit.
        const pattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])[a-zA-Z\d@#$%&]{8,}$/
        if (pattern.test(password) == false) throw "Require atleast 1 Uppercase, 1 lowercase and 1 digit.";
        $("label[for*='password']").html("<span style='color:green'>&#10004</span>");
        result = true;
      } catch (error) {
        errMessage = error;
        $("label[for*='password']").html("<span style='color:red'>" + errMessage + "&nbsp;&#10060</span>");
      }finally{
        return {"valid":result, "message":errMessage, "password":password};
      }
    },
    /* End of validate.password function ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
    /*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
      Function to validate selection of the role of the user
      Check that a valid option is selected other than the default

      Parameters: Select field (<select name="role">)
      Returns: An object with a result (boolean) and validated role.
    ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
    role:function(input){
      var errMessage = "Role";
      var result = false;
      var role = $(input).val();
      try {
        if(role == null) throw "Select a Role";
        result = true;
      } catch (error) {
        errMessage = error;
      }finally{
        return {"valid":result, "message":errMessage, "role":role};
      }
    },
    /* End of validate.role function ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
    /*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
      Function to validate selection of the role of the user
      Check that a valid option is selected other than the default

      Parameters: Select field (<select name="carer">)
      Returns: An object with a result (boolean) and validated role.
    ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
    carer:function(input){
      var errMessage = "Carer";
      var result = false;
      var carer = $(input).val();

      try {
        if($("select[name='role']").val() == "1"){
          if(carer == null) throw "Select a Carer";
        }
        result = true;
      } catch (error) {
        errMessage = error;
      }finally{
        return {"valid":result, "message":errMessage, "carer":carer};
      }
    },
    /* End of validate.carer function ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
    /*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
      Function to query whether username already taken
      Checks against a copy of users list downloaded to localStorage from cloud

      Parameters: username (entered email address while registering)
      Returns: true or false
    ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
    isExists: function(username){
      var fnLog = "isUsernameExists(username)";

      var result = false;
      try {
        // Retrieve list if registered users from the localStore
        var users = JSON.parse(sessionStorage.getItem("users"));
        result = CryptoJS.SHA256(username).toString() == users.find(function(user){
            return user == CryptoJS.SHA256(username).toString();
        });
      } catch (error) {
        if(debug) writeToLog("index.js", fnLog,  "Users Array is not available in local storage", error);
      }finally{
        return result;
      }
    }
    /* End of isUsernameExists function ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
  }
}
