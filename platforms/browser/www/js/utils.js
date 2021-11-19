function getAnswersList(username){
  var userSHA = CryptoJS.SHA256(username).toString();
  var xhrList = dataStore.list("responses", userSHA)
  xhrList.always(function(data, textStatus, jqXHR){
    if(textStatus == "success" && jqXHR.status == 200){
      sessionStorage.answersList = JSON.stringify(data);
    }
  });
}

function getUsersList(){
  xhrList = dataStore.list("users");
  xhrList.always(function(data, textStatus, jqXHR){
    if(textStatus == "success" && jqXHR.status == 200){
      var usersList = data;
      sessionStorage.users = JSON.stringify(data);
      // Prepare cares list data for select box
      getCarers();
    }else{
      $.alert("Users listing not available right now. Try again later", "Server error");
    }
  });
}

function getCarers(){
  var carers = [];
  var usersList = JSON.parse(sessionStorage.users)
  for(index in usersList){
    xhrUser = dataStore.load("users", usersList[index]);
    xhrUser.always(function(data, textStatus, jqXHR){
      if(textStatus == "success" && jqXHR.status == 200){
        var user = JSON.parse(data);
        // Carers List data
        if (user.role == 2){
          carers.push({"text": user.fullname, "id":user.username});
          sessionStorage.carers = JSON.stringify(carers);
        }
      }else{
        // Carers List data
        carers.push({"text": "None", "id": "none"});
        sessionStorage.carers = JSON.stringify(carers);
      }
    });
  }
}

/*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    Function to check whether menudata is downloaded from datastore to local storage

    Parameter: none
        inputvalue: value of the input field
    Returns: none
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
function checkIfDataAvailable(){
  var menuCount = 0;
  // while (menuCount < menuSystem.length){
    for (index in menuSystem){
      var section = menuSystem[index].menuId;
      if (localStorage.getItem(section) != null)
        menuCount++;
    }
    return menuCount == menuSystem.length;
}

/*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    Function to sanitize the input values to prevent any XSS attack by HTML and script injection in text input fields
    Reference: https://www.owasp.org/index.php/XSS_(Cross_Site_Scripting)_Prevention_Cheat_Sheet
    Parameter:
        inputvalue: value of the input field
    Returns: Sanitized input value (i.e. Replacing &,"'<>/ with equivalent html entity encode)
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
function sanitizeHTML(inputvalue){
    var fnLog = "ui.sanitizeHTML(inputvalue)";
    var result = inputvalue;
    try {
        result = inputvalue
                    .replace(/&/g, '&amp;')
                    .replace(/</g, '&lt;')
                    .replace(/>/g, '&gt;')
                    .replace(/"/g, '&quot;')
                    .replace(/'/g, '&#x27;')
                    .replace(/\//g, '&#x2F;');
    } catch (error) {
        if(debug) writeToLog("ui.js", fnLog, "Exception in trying replace method on an array", error);
    }finally{
        return result;
    }
}

// http://viralpatel.net/blogs/dynamically-shortened-text-show-more-link-jquery/
function truncate(){
  var showChar = $('.more').width()/5;
	var ellipsestext = "...";
	var moretext = "more";
	var lesstext = "less";
	$('.more').each(function() {
		var content = $(this).html();

		if(content.length > showChar) {

			var c = content.substr(0, showChar);
			var h = content.substr(showChar-1, content.length - showChar);

			var html = c + '<span class="more-ellipses">' + ellipsestext+ '&nbsp;</span><span class="more-content"><span>' + h + '</span>&nbsp;&nbsp;<a href="" class="more-link">' + moretext + '</a></span>';

			$(this).html(html);
		}

	});

	$(".more-link").click(function(){
		if($(this).hasClass("less")) {
			$(this).removeClass("less");
			$(this).html(moretext);
		} else {
			$(this).addClass("less");
			$(this).html(lesstext);
		}
		$(this).parent().prev().toggle();
		$(this).prev().toggle();
		return false;
	});
}

// Function to delay the keydown keyup in a textbox
// Source: https://remysharp.com/2010/07/21/throttling-function-calls
function debounce(fn, delay) {
    var timer = null;
    return function () {
        var context = this, args = arguments;
        clearTimeout(timer);
        timer = setTimeout(function () {
        fn.apply(context, args);
        }, delay);
    };
}

/* ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    Function to Write all message, errors, exceptions to a log file
    Parameter:
        fileName: A string of the script file name
        fn: A string name of the function where error occured
        message: A string of message
        error: Error part of the exception object
    Returns: Nothing
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
function writeToLog(fileName, fn, message, error){
    // Line Number where error occured, Only firefox error object has line number
    // Cross browser error.line number doesn't work at present
    var ln = 0; //error.lineNumber;
    var now = new Date();
    var timeStamp = now.toISOString(); //2017-09-11T09:17:48.385Z
    var msgObject = {
        "timestamp": timeStamp,
        "file": fileName,
        "function": fn,
        "linenumber": ln,
        "message": message,
        "exerror":{
            "name": null,
            "message":null
        },
        "device": deviceDetails()
    };
    if(error != undefined){
        msgObject.exerror.name = error.name;
        msgObject.exerror.message = error.message;
    }
    //var logMessage = JSON.stringify(msgObject);
    var storedLog = [];
    if(localStorage.errorLog != undefined){
        var localLog = JSON.parse(localStorage.errorLog);
        for(index in localLog){
            storedLog.push(localLog[index]);
        }
    }
    storedLog.push(msgObject);
    localStorage.removeItem("errorLog");
    localStorage.setItem("errorLog", JSON.stringify(storedLog));

}

// Function to get device / browser details for the log
function deviceDetails(){
    try {
        return {
            "cordova-version": device.cordova,
            "model": device.model,
            "platform": device.platform,
            "UUID": device.uuid,
            "device-version": device.version
        }
    } catch (error) {
        return{
            "appversion": navigator.appVersion,
            "platform": navigator.platform,
            "useragent": navigator.userAgent
        }
    }

}

// Function to load settings from cloud and from local storage on unavailaability
function loadSettings(){

    var jqXHR = dataStore.load("settings", sessionStorage.userSHA);
    jqXHR.always(function(data, textStatus, jqXHR){
        if(textStatus == "success" && jqXHR.status == 200){
            settings = JSON.parse(data);
            sessionStorage.settings = data;
        }else{
            settings = JSON.parse(sessionStorage.settings);
        }
    });
}

// Function to reset back to login page after logout or any other error which
// requires re-loginUI
function sessionReset(){
  // Credit: https://stackoverflow.com/questions/19844750/is-there-a-way-to-remove-all-sessionstorage-items-with-keys-that-match-a-certain
  var i = sessionStorage.length;
  while(i--) {
    var key = sessionStorage.key(i);
    sessionStorage.removeItem(key);
  }
  $("#filler").height("0px");

  dataStore.initialise.prepare();
  loginUI.loginForm();
}

// To get previous submissions from the datastore for the user, section and id
function getPreviousSumissions(username, name, id){
  var resultsTable = $("<table class='table is-narrow is-fullwidth is-bordered is-hoverable' id='table_" + name + id + "'><tbody></tbody></table>");
  var userSHA = CryptoJS.SHA256(username).toString();

  var xhrList = dataStore.list("responses", userSHA + "_" + name + "_" + id);
  xhrList.always(function(list, textStatus, jqXHR){
    if(textStatus == "success" && jqXHR.status == 200){
      for(i in list){
        var xhrAnswers = dataStore.load("responses", list[i]);
        xhrAnswers.always(function(data, textStatus, jqXHR){
          if(textStatus == "success" && jqXHR.status == 200){
            var answersData = JSON.parse(data)
            if(answersData.name == name && answersData.id == id){
              var submitDateTime = new Date((this.value.split("_")[3]) * 1).toLocaleString();
              var sections = JSON.parse(localStorage.getItem(name + "_" + id))
              var colspan = 2
              var stepsCell = "";
              if(graphData != null){
                // graphData.labels.push(submitDateTime);
              }
              if(sections.length > 1){
                colspan = 3;
                stepsCell = "<th>Step</th>";
              }
              $("#table_" + name + id).append("<tr><td colspan='" + colspan + "'></td></tr>");
              $("#table_" + name + id).append("<tr class='is-selected'><th colspan='" + colspan + "'>Date Submitted: " + submitDateTime + "</th></tr>");
              $("#table_" + name + id).append("<tr>" + stepsCell + "<th>Question</th><th>Answer</th></tr>");

              for(s in sections){
                var questions = JSON.parse(localStorage.getItem(name + "_" + id))[s].questions;
                for(q in questions){
                  var questionText = JSON.parse(localStorage.getItem(name + "_" + id))[s].questions[q].text;
                  var questionType = JSON.parse(localStorage.getItem(name + "_" + id))[s].questions[q].type;
                  var answers = answersData.sections[s].answers[q].answer;
                  var answer;

                  if($.type(answers) == "array"){
                    answer = "<table class='table is-inner is-narrow is-fullwidth is-striped'><tbody>";
                    for(a in answers){
                      answer += "<tr><td>" + answers[a] + "</td></tr>";
                    }
                    answer +=  "</tbody>" +
                    "</table>";
                  }else{
                    answer = answers;
                    if(questionType == "date" && JSON.parse(sessionStorage.showChart)){
                      graphData.labels.push(answer);
                      sessionStorage.chartPoint = graphData.labels.length;
                    }
                    if(questionType == "range"){
                      for(d in graphData.datasets){
                        if(graphData.datasets[d].label == questionText){
                          graphData.datasets[d].data.push(answer==null?0:parseInt(answer));
                        }
                      }
                      appChart.update();
                    }
                  }

                  if(q == 0 && sections.length > 1){
                    var step = parseInt(s) + 1
                    stepsCell = "<td style='text-align:center;font-weight:bold' rowspan='" + questions.length + "'>" + step + "</td>";
                  }else{
                    stepsCell = "";
                  }
                  var resultsTableRow = $("<tr>" + stepsCell + "<td>" + questionText + "</td><td>" + answer + "</td></tr>");
                  $("#table_" + name + id).append(resultsTableRow);
                }
              }
            }
          }
        });
      }
    }
  });
  return resultsTable;
}


// This function is for developer only during development. Must be deleted for
// production release
function deleteData(dir){
  xhrList = dataStore.list(dir);
  xhrList.always(function(data, textStatus, jqXHR){
    if(textStatus == "success" && jqXHR.status == 200){
      // var subdirs = JSON.parse(data);
      var subdirs = data
      for(index in subdirs){
        dataStore.delete(dir, subdirs[index]);
      }
    }
  });
}

function nothing(){
  var config = {
            type: 'line',
            data: {
                labels: ["January", "February", "March", "April", "May", "June", "July"],
                datasets: [{
                    label: "My First dataset",
                    backgroundColor: window.chartColors.red,
                    borderColor: window.chartColors.red,
                    data: [
                        randomScalingFactor(),
                        randomScalingFactor(),
                        randomScalingFactor(),
                        randomScalingFactor(),
                        randomScalingFactor(),
                        randomScalingFactor(),
                        randomScalingFactor()
                    ],
                    fill: false,
                }, {
                    label: "My Second dataset",
                    fill: false,
                    backgroundColor: window.chartColors.blue,
                    borderColor: window.chartColors.blue,
                    data: [
                        randomScalingFactor(),
                        randomScalingFactor(),
                        randomScalingFactor(),
                        randomScalingFactor(),
                        randomScalingFactor(),
                        randomScalingFactor(),
                        randomScalingFactor()
                    ],
                }]
            },
            options: {
                responsive: true,
                title:{
                    display:true,
                    text:'Chart.js Line Chart'
                },
                tooltips: {
                    mode: 'index',
                    intersect: false,
                },
                hover: {
                    mode: 'nearest',
                    intersect: true
                },
                scales: {
                    xAxes: [{
                        display: true,
                        scaleLabel: {
                            display: true,
                            labelString: 'Month'
                        }
                    }],
                    yAxes: [{
                        display: true,
                        scaleLabel: {
                            display: true,
                            labelString: 'Value'
                        }
                    }]
                }
            }
        };
}
