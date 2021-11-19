/* =============================================================================
  Group: 6 (Keshav Hegde, Tommy Chak, Megan Petersen, Susan Idris)
  Subject: SIT302 Project Delivery
  Assignment: Project  - Bipolar App
  Trimester: T3-2017

  networking.js - Functions to intialise datastore (cloud storage) and CRUD
  operation on stored data
==============================================================================*/
window.dataStore = {
  /*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    Function to 'list' list of objects for given dir with or without prefix and/or suffix
    Parameter:
      objectid: A string representing 'Directory'
      prefix : A string representing beginning part of the subdirectory (optional)
      suffix : A string representing ending part of the subdirectory (optional)
    Returns: jqXHR object to determine data availability on use with .always callback
  ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
  list: function(objectId,prefix,suffix){
    var fnLog = "dataStore.list(dir)";
    // Prepare 'data' paramenter for the 'POST'
    var postData =  {"appid":appId, "action":"list", "objectid": objectId, "prefix": prefix, "suffix": suffix}

    // Make Ajax call to list all objects in users directory
    var jqXHR = $.ajax({
      method:httpMethod,
      url:baseUrl,
      cache:false,
      data:postData
    }).done(function(data){
      if(debug) writeToLog("networking.js", fnLog, "Ajax .done() POST:");
    }).fail(function(jqXHR,textStatus){
      if(debug) writeToLog("networking.js", fnLog, "Ajax .fail() POST:");
    });

    // Return jqXHR if success it will have array of hashed usernames
    return jqXHR;
  },
  /*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ End of list function ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
  /*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    Function to 'save' objects/data in cloud for given dir & subdir
    Parameter:
      dir: A string representing 'Directory'
      subdir : A string representing 'Subdirectory'
      data : A JSON object of data
    Returns: Nothing
  ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
  save: function(dir, subdir, data){
    var fnLog = "dataStore.save(dir, subdir, data)";
    var objectId = dir + (subdir == null?"":"/" + subdir);
    // Encrypt the survey data if chosen only for saving responses and work in progress
    if(settings.encryptSurvey && localStorage.questionType == "survey" && (dir == "responses" || dir == "wip")){
      secretKey = JSON.parse(localStorage.getItem(sessionStorage.activeUser)).password;
      dataToStore = CryptoJS.AES.encrypt(JSON.stringify(data), secretKey).toString();
    }else{
      dataToStore = JSON.stringify(data);
    }
    // Prepare 'data' paramenter for the 'POST'
    var postData = {
      "appid":appId,
      "action":"save",
      "objectid": objectId,
      "data": dataToStore
    }
    // Make Ajax call 'POST' to save the value
    $.ajax({
      method:httpMethod,
      url: baseUrl,
      cache: false,
      data: postData
    }).done(function(data){
      if(debug) writeToLog("networking.js", fnLog, "Ajax .done()");
    }).fail(function(jqXHR,textStatus){
      if(debug) writeToLog("networking.js", fnLog, "Ajax .fail() Status:" + textStatus);
    });
  },
  /*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ End of save function ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
  /*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    Function to 'append' objects/data in cloud for given dir & subdir
    Parameter:
      dir: A string representing 'Directory'
      subdir : A string representing 'Subdirectory'
      data : A JSON object of data
    Returns: Nothing
  ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
  append: function(dir, subdir, data){
    var fnLog = "dataStore.append(dir, subdir, action, data)";
    var objectId = dir + (subdir == null?"":"/" + subdir);
    // Prepare 'data' paramenter for the 'POST'
    var postData = {
      "appid": appId,
      "action": "append",
      "objectid": objectId,
      "data": JSON.stringify(data)
    }

    // Make Ajax call 'POST' to save the value
    $.ajax({
      method:httpMethod,
      url: baseUrl,
      cache: false,
      data: postData
    }).done(function(data){
      if(debug) writeToLog("networking.js", fnLog, "Ajax .done()");
    }).fail(function(jqXHR,textStatus){
      if(debug) writeToLog("networking.js", fnLog, "Ajax .fail() Status:" + textStatus);
    });
  },
  /*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ End of append function ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
  /*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    Function to 'load' i.e. download JSON text from cloud for the given dir & subdir
    Parameter:
      dir: A string representing 'Directory'
      subdir : A string representing 'Subdirectory'
    Returns: jqXHR object to determine data availability on use with .always callback
  ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
  load: function(dir, subdir){
    var fnLog = "dataStore.load(dir, subdir)";

    var objectId = dir + (subdir == null?"":"/" + subdir);
    // Prepare 'data' paramenter for the 'POST'
    var postData = {
      "appid":appId,
      "action":"load",
      "objectid": objectId
    }

    // Make Ajax call to load the data
    // The value parameter in the request is to make additional data available from within the jQuery.ajax callbacks
    // (done | fail | always) because within the callbacks, this refers to the object that was passed to jQuery.ajax.
    // jQuery.ajax will ignore this but can be accessed later
    // learnt by experimenting
    var jqXHR = $.ajax({
      method:httpMethod,
      url:baseUrl,
      cache:false,
      data:postData,
      value: subdir
    }).done(function(data){
      if(debug) writeToLog("networking.js", fnLog, "Ajax .done()");
    }).fail(function(jqXHR,textStatus){
      if(debug) writeToLog("networking.js", fnLog, "Ajax .fail() Status:" + textStatus);
    });
    return jqXHR;
  },
  /*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ End of load function ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
  /*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    Function to 'delete' i.e. remove an object (JSON) from cloud for the given dir & subdir
    Parameter:
      dir: A string representing 'Directory'
      subdir : A string representing 'Subdirectory'
    Returns: jqXHR object to confirm object deletion with use of .always callback
  ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
  delete: function(dir, subdir){
    var fnLog = "dataStore.delete(dir, subdir)";

    var objectId = dir + (subdir == null?"":"/" + subdir);
    // Prepare 'data' parameter for the 'POST'
    var postData = {
      "appid":appId,
      "action":"delete",
      "objectid": objectId
    }

    // Make Ajax call to load the data
    var jqXHR = $.ajax({
      method:httpMethod,
      url:baseUrl,
      cache:false,
      data:postData
    }).done(function(data){
      if(debug) writeToLog("networking.js", fnLog, "Ajax .done()");
    }).fail(function(jqXHR,textStatus){
      if(debug) writeToLog("networking.js", fnLog, "Ajax .fail() Status:" + textStatus);
    });
    return jqXHR;
  },
  /*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ End of delete function ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
  /*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
  When there is no cloud data available load the JSON from the file system
  ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
  initialise: {
    /*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
      Function to load list of questions available and list of attempts made from cloud datastore
      sample data from the device
      Parameters: none
      Returns: nothing
    ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
    prepare: function(){
      // Load menu structure to Local Storage
      for (index in menuSystem){
        var section = menuSystem[index].menuId;

        // localStorage.menuDataAvailable = 0;
        var xhrSections = dataStore.load("sections", section);
        xhrSections.always(function(data, textStatus, jqXHR ){
          if(textStatus == "success"  && jqXHR.status == 200){
            // Save/Update the data in LocalStorage
            localStorage.setItem(this.value, data);
            drillDown(JSON.parse(data), this.value);
          }else{
            // Menu data not available so load from the JSON files in the data directory
            dataStore.initialise.local("sections", this.value);
          }
        });
      }

      // Drill down the menu JSON to find child menus
      function drillDown(data, section){
        $.each(data, function(i, result) {
          if (result.children != null){
            if (result.children.length) {
              drillDown(result.children, section)
            }
          }

          if(result.file != null){
            var xhr = dataStore.load("questions", section + "_" + result.id);
            xhr.always(function(data, textStatus, jqXHR ){
              if(textStatus == "success"  && jqXHR.status == 200){
                // Save/Update the data in LocalStorage
                localStorage.setItem(this.value, data);

              }else{
                // Menu data not available so load from the JSON files in the data directory
                dataStore.initialise.local("questions", this.value);
              }
            });
          }
        });
      }
    },
    /*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ End of prepare function ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
    /*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
      Function to obtain quiz and survey default data from a file on the device and save the content to datastore as
      default data
      Parameters: none
      Returns: nothing
    ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
    local: function(dir, subdir){
      $.getJSON("./data/" + subdir + ".json", function(data){
        // Save the quizzes sample in to datastore
        dataStore.save(dir, subdir, data);

        // Categorise,list and save in datastore as well as local storage
        //dataStore.initialise.store.questionList(quizzesSample);
        //dataStore.initialise.store.attemptsList(quizzesSample);
      });
    },
    /*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ End of local function ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
  }
  /*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ End of initialise function ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
}
