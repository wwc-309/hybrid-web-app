/* =============================================================================
  Group: 6 (Keshav Hegde, Tommy Chak, Megan Petersen, Susan Idris)
  Subject: SIT302 Project Delivery
  Assignment: Project  - Bipolar App
  Trimester: T3-2017

  quizUI.js - Functions to construct quiz questions and associated Buttons
    actions and navigation
==============================================================================*/
/* ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
quiz.ui.js
Creates UI/UX for quiz/survey questions The load function gets called from the
slider-menu.jquery.js which then on creates the UI based on the name and id of
quiz it receives.
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
// Global variable to hold quiz data.
window.quizData = null;

// Global variable to hold quiz responses.
window.responses = null;

// Global variable for graph dataset
window.graphData = null;

window.quizUI = {
  /*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    Function to load the Section content and subsequently whole quiz/survey
    Parameters:
      - name - Menu section name (tools/modules)
      - id = Quiz ID to load
    Returns: nothing
  ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
  load:function(name, id){
    this.name = name;
    this.id = id;

    var menuData = JSON.parse(localStorage.getItem(name + "Menu" + id));
    $(".hero-body").find(".title").html(menuData.text);

    // Clear the quiz UI from the previous menu selection
    $("#quiz-container").empty();
    var content = $(".hero-body").find("#page-content");
    $(content).empty();
    // Display the content from the menudata of the menu
    for(index in menuData.content){
      $(content).append("<div class='comment more'>" + menuData.content[index] + "</div>");
    }
    // Shows a more.. button on long texts on small screens
    if($(window).width() < 1024){
      truncate();
    }
    // Check menu item is the last child which containes the question
    if(menuData.file != null){
      // Retrieve the quizData from the local storage
      try {
        quizData = JSON.parse(localStorage.getItem(name + "_" + id));
        if(quizData == null || quizData.length < 1) throw "Quiz Data not available";

        // Prepare / initialise the quiz answer object after resetting
        responses = {};
        var storedResponses = localStorage.getItem("wip_" + name + "_" + id)
        if(storedResponses == "" || storedResponses == undefined){
          responses.name = name;
          responses.id = id;
          // Sections loop
          responses.sections = [];
          for(i in quizData){
            responses.sections.push({
              "section":quizData[i].section,
              "answers":[]
            });
            responses.sections[i].answers = [];
            // Questions loop
            for(j in quizData[i].questions){
              responses.sections[i].answers.push({
                "id":quizData[i].questions[j].id,
                "type": quizData[i].questions[j].type,
                "answer":null
              });
            }
          }
        }else{
            responses = JSON.parse(storedResponses);
        }
        // When there exists a warn info
        if(menuData.info != null && menuData.info != "" && menuData.history){
          // Instead of showing the message put the previous submissions in a
          // accordian in collapsed state.
          var resultsTable = getPreviousSumissions(sessionStorage.activeUser, name,id)
          $("#quiz-container").append(this.accordions(resultsTable,"Expand to view the past submissions"));
        }

        // Display  chart
        if(menuData.chart != null && menuData.chart){
          //TODO:
          // Display charts using d3.js based on previous answers in an accordion
          // This is complicated stuff ;(
          window.appChart;
          sessionStorage.showChart = true;
          graphData = {labels:[],datasets:[]};
          sessionStorage.chartPoint = graphData.labels.length;
          var chartColors = ["rgb(255,99,132)", "rgb(255,159,64)","rgb(75,192,192)","rgb(54,162,235)","rgb(153,102,255)","rgb(201,203,207)"];
          var chartOptions =  {
                          responsive: true,
                          maintainAspectRatio: false,
                          title:{
                              display:true,
                              text: menuData.text,
                          },
                          legend: {
                              display: true,
                              labels: {
                                  boxWidth: 10
                              }
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
                                      labelString: 'Submissions'
                                  }
                              }],
                              yAxes: [{
                                  display: true,
                                  scaleLabel: {
                                      display: true,
                                      labelString: 'Scale'
                                  }
                              }]
                          }
                      }

          var config ={type:'line', data:graphData, options: chartOptions};

          for(i in quizData){
            for(j in quizData[i].questions){
              if(quizData[i].questions[j].type == "range"){
                graphData.datasets.push({
                    label:quizData[i].questions[j].text,
                    backgroundColor: chartColors[j],
                    borderColor: chartColors[j],
                    fill:false,
                    data:[]});
              }
            }
          }


          var graphContainer = $("<div class='container' id='graph-container'><canvas id='graph'></canvas></div>");

          $("#quiz-container").append(this.accordions(graphContainer,"Expand to view the chart"));
          var ctx = $("#graph");

          window.appChart = new Chart(ctx, config);

        }

        // When it is specified to prefill quiz answers from the last session
        sessionStorage.prefill = menuData.prefill;

        // When it is specified to encrypt set of quiz answers
        sessionStorage.encryptQuiz = false;
        if(menuData.encrypt != null && menuData.encrypt){
          // Store the value in localStorage
          sessionStorage.encryptQuiz = menuData.encrypt;
        }

        // If there are steps in the quiz questions
        if(menuData.steps != null){

          if(menuData.steps > 1){
            var sections = $("<div class='steps'>");
            // Create steps visual
            for(index in quizData){
              $(sections).append(this.steps(quizData[index].section, quizData[index].sectionTitle));
            }
            $("#quiz-container").append(sections);
          }

          $("#quiz-container").append("<hr class='divider'/>");
          // Create Cancel/Prev and Submit/Next buttons
          $("#quiz-container").append(this.buttons());
          // Populate the quiz container with inputs and all quiz details
          new QuizSection($("#quiz-container").get(0), quizData);
          // Adjust and position the buttons according to quiz container screen
          $("#floating-buttons").outerWidth($("#quiz-container").width());
        }
        $(".hero-foot").addClass("is-hidden");
      } catch (e) {
        console.log(e)
      }
    }
  }, // End of load function() ------------------------------------------------>
  /*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    Function to create a main container to wrap all quiz sections and questions

    Parameters: None
    Returns: None
  ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
  container:function(quizData, index){
    // main container
    var node = $("<div class='container' id='" + index + "'></div>");
    var box = $("<div class='box' id='main-box' style='background-color:gray; overflow-y:auto; padding-bottom:2.5rem'></div>");
    // $(box).css("max-height", "35rem");
    if(quizData[index].sectionTitle != ""){
      $(box).append("<p class='subtitle' style='color:white;font-weight:600;'>" + quizData[index].sectionTitle + "</p><hr/>");
    }
    sectionId = quizData[index].section;
    if (quizData[index].questions != null){
      $(box).append(this.boxItems(quizData[index].questions))
    }
    $(node).append(box);
    return node;
  }, // End of container function() ------------------------------------------->
  /*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    Function to

    Parameters: None
    Returns: None
  ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
  boxItems:function(questions){
    var node = $("<div class='content'></div>");
    for(index in questions){
      $(node).append(this.questionItem(questions[index]));
      // this.questionItem(questions[index], node)
    }
    return node;
  }, // End of boxItems function() -------------------------------------------->
  /*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    Function to

    Parameters: None
    Returns: None
  ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
  questionItem:function(question){
    // questionItem:function(question, node){
    var node = $("<div class='box' style='margin-bottom:0.5rem'></div>");
    var type = question.type.trim();
    // There are some checkboxes are used in a wierd way like a tick box to the question itself
    // then we need to set the type to 'tickbox' and append the label later
    if((type == "checkbox" || type == "radio" ) && (question.options == undefined) ){
      type = "tickbox";
    }else{
      var label = $("<label class='question-text'>" + question.text + "</label>")
      $(node).append(label);
    }

    switch (type){
      case "date":
        $(node).append(this.datebox(question));
      break;
      case "textbox":
        $(node).append(this.textbox(question));
      break;
      case "checkbox":
      case "radio":
        $(node).append(this.checkRadio(question, type));
      break;
      case "tickbox":
        $(node).append(this.tickbox(question));
      break;
      case "textarea":
        $(node).append(this.textarea(question));
      break;
      case "selection":
        $(node).append(this.selectbox(question));
      break;
      case "range":
        $(node).append(this.rangebox(question));
      break;
      default:
    }

    // If input type is text or textarea then help will be a placeholder
    if(!(type == "textbox" || type == "textarea")){
      if(question.help != ""){
        var label = $("<label class='question-info'>" + question.help + "</label>")
        $(node).append(label);
      }

      if(question.info != ""){
        var label = $("<label class='question-info'>" + question.info + "</label>")
        $(node).append(label);
      }
    }

    if(question.tip != ""){
      var label = $("<label class='question-tip'><strong>Tip:</strong> " + question.tip + "</label>")
      $(node).append(label);
    }

    return node;
  }, // End of questionItem function() ---------------------------------------->
  /*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    Function to

    Parameters: None
    Returns: None
  ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
  datebox:function(question){
    var inputId = "datebox_" + sectionId + "_" + question.id;
    var control = $("<div class='control'></div>");
    var dateBox = $("<input class='input' type='date' id='" + inputId + "'>");
    $(dateBox).get(0).valueAsDate = new Date();

    // Load WIP responses
    var answer = responses.sections[sectionId-1].answers[question.id-1].answer
    if(answer != null){
      $(dateBox).val(answer);
    }


    // Add event listener on change event to save the value only for patient role
    if (sessionStorage.userRole == "1"){
      var date = $(dateBox).val() == null?new Date():$(dateBox).val();

      // graph label for dynamic update
      if(JSON.parse(sessionStorage.showChart)){
        sessionStorage.tempLabel = date;
      }
      // Set default value as answer on DOM render
      quizUI.saveAnswer(date, sectionId, question.id);
      $(dateBox).on("blur change",function (){
        var date = $(this).val() == null?new Date():$(this).val();
        quizUI.saveAnswer(date, sectionId, question.id);

        // graph label for dynamic update
        if(JSON.parse(sessionStorage.showChart)){
          sessionStorage.tempLabel = date;
        }
      });
    }else{
      $(dateBox).prop("readonly", true);
    }

    return $(control).append(dateBox);
  }, // End of datebox function() --------------------------------------------->
  /*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    Function to

    Parameters: None
    Returns: None
  ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
  textbox:function(question){
    var inputId = "textbox_" + sectionId + "_" + question.id;
    var control = $("<div class='control'></div>");
    var textBox = $("<input class='input' type='text' id='" + inputId + "' placeholder='" + question.help + "'>");

    // Load WIP responses
    var answer = responses.sections[sectionId-1].answers[question.id-1].answer
    if(answer != null){
      $(textBox).val(answer);
    }

    // Add event listener on change event to save the value
    if (sessionStorage.userRole == "1"){
      $(textBox).on("blur",function (){
        quizUI.saveAnswer($(this).val(), sectionId, question.id);
      });
    }else{
      $(textBox).prop("readonly", true);
    }

    return $(control).append(textBox);
  }, // End of textbox function() --------------------------------------------->
  /*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    Function to

    Parameters: None
    Returns: None
  ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
  checkRadio:function(question, type){
    var node = $("<div class='columns is-multiline'></div>")
    var inputName = type + "_" + sectionId + "_" + question.id;
    for(index in question.options){
      var inputId = inputName + "_" + index;
      var column = $("<div class='column is-half'></div>");
      var field = $("<div class='field'></div>");
      var checkRadio = $("<input class='is-checkradio' name='" + inputName + "' id='" + inputId + "' type='" + type + "'  value='" + question.options[index] + "'>");
      var label = $("<label class='label-checkradio' for='" + inputId + "'>" + question.options[index] + "</label>");
      $(field).append(checkRadio);
      $(field).append(label);
      $(column).append(field);
      $(node).append(column);
      if(type == "radio" && sessionStorage.userRole == "1"){
        var answer = responses.sections[sectionId-1].answers[question.id-1].answer
        if($(checkRadio).val() == answer){
          $(checkRadio).prop("checked","true");
        }
      }
    }


    //  Click event callback to instantly save the value to Local Storage on check box click
    if (sessionStorage.userRole == "1"){
      // Load wip answers
      if(type == "checkbox"){
        var answers = responses.sections[sectionId-1].answers[question.id-1].answer
        $(node).find("input[type='checkbox']").each(function(){
          for(i in answers){
            if($(this).val() == answers[i]){
              $(this).prop("checked","true");
            }
          }
        });
      }
      $(node).on("click",function(){
        var selected;
        if(type == "checkbox"){
          selected = [];
          $(node).find("input[type='checkbox']:checked").each(function(){
              selected.push($(this).val());
          });
        }else{
          selected = $(node).find("[name='" + inputName + "']:checked").val();
        }
        // Save the answer
        quizUI.saveAnswer(selected, sectionId, question.id);
      });
    }else{
      // Make check boxes readonly
      $(node).on("click", function(e){
          e.preventDefault();
          return false;
      });
    }
    return node;
  }, // End of checkRadio function() ------------------------------------------>
  /*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    Function to

    Parameters: None
    Returns: None
  ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
  tickbox:function(question){
    // var name = question.text.replace(/[^a-zA-Z0-9]/g, "_");
    var inputId = "tickbox_" + sectionId + "_" + question.id;
    var questionText = sanitizeHTML(question.text)
    var field = $("<div class='field'></div>");
    var tickBox = $("<input class='is-checkradio' id='" + inputId + "' name='" + inputId + "' type='checkbox' value='" + questionText + "'>");
    var label = $("<label class='label-checkradio' style='font-weight:500;' for='" + inputId + "'>" + questionText + "</label>");
    $(field).append(tickBox);
    $(field).append(label);
    // Add eventlistener to save data only for patients
    if (sessionStorage.userRole == "1"){
      // Load wip answers
      var answer = responses.sections[sectionId-1].answers[question.id-1].answer
      if($(tickBox).val() === answer){
        $(tickBox).prop("checked","true");
      }

      $(tickBox).on("click", function(){
        if($(this).prop("checked","true")){
          quizUI.saveAnswer($(this).val(), sectionId, question.id);
        }else{
          quizUI.saveAnswer(null, sectionId, question.id);
        }
      });
    }else{
      $(tickBox).on("click", function(e){
          e.preventDefault();
          return false;
      });
    }
    return field;
  }, // End of tickbox function() --------------------------------------------->
  /*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    Function to

    Parameters: None
    Returns: None
  ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
  textarea:function(question){
    var inputId = "textarea_" + sectionId + "_" + question.id;
    var control = $("<div class='control'></div>");
    var textArea = $("<textarea class='textarea' id='" + inputId + "' placeholder='" + question.help + "'></textarea>")
    // Load WIP responses
    var answer = responses.sections[sectionId-1].answers[question.id-1].answer
    if(answer != null){
      $(textArea).val(answer);
    }

    // Add event listener on change event to save the value
    if (sessionStorage.userRole == "1"){
      $(textArea).on("blur",function (){
        quizUI.saveAnswer($(this).val(), sectionId, question.id);
      });
    }else{
      $(textArea).prop("readonly", true);
    }
    return $(control).append(textArea);
  }, // End of textarea function() -------------------------------------------->
  /*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    Function to

    Parameters: None
    Returns: None
  ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
  selectbox:function(question){
    var inputId = "selection_" + sectionId + "_" + question.id;
    var control = $("<div class='control'></div>");
    var selectBox = $("<div class='select'><select id='" + inputId + "'></select></div>");
    for(index in question.options){
      $(selectBox).find("select").append("<option value='"+ question.options[index] +"'>" + question.options[index] + "</option>")
    }

    // Load WIP responses
    var answer = responses.sections[sectionId-1].answers[question.id-1].answer
    $(selectBox).find("select").val(answer);


    // Add event listener on change event to save the value
    if (sessionStorage.userRole == "1"){
      $(selectBox).on("change",function (){
        var value = $(this).find("select").val();
        quizUI.saveAnswer(value, sectionId, question.id);
      });
    }else{
      $(selectBox).find("option").each(function(){
        $(this).prop({disabled:true});
      })
    }

    return $(control).append(selectBox);
  }, // End of selectbox function() ------------------------------------------->
  /*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    Function to

    Parameters: None
    Returns: None
  ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
  rangebox:function(question){
    var inputId = "range_" + sectionId + "_" + question.id;
    var control = $("<div class='control'></div>");
    var rangeBox = $("<input id='" + inputId + "' class='slider is-fullwidth is-gradient is-info has-output' step='" + question.increment + "' min='" + question.min + "' max='" + question.max + "' value='0' type='range'>");
    var output = $("<output for='" + inputId + "'>" + question.min + "</output>");
    $(rangeBox).on("input", function(){
      var output = $("output[for='" + $(this).attr("id") + "']");
      $(output).val($(this).val());
    })
    // Load WIP responses
    var answer = responses.sections[sectionId-1].answers[question.id-1].answer;
    $(rangeBox).val(answer == null?0:parseInt(answer));
    $(output).val(answer == null?0:parseInt(answer));

    // Set default value on DOM render the slider
    quizUI.saveAnswer(0, sectionId, question.id);
    // Add event listener on change event to save the value
    if (sessionStorage.userRole == "1"){
      $(rangeBox).on("input",function (){
        var value = parseInt($(this).val());
        quizUI.saveAnswer(value, sectionId, question.id);
        // Update the graph data and chart
        if(JSON.parse(sessionStorage.showChart)){
          var position = parseInt(sessionStorage.chartPoint);
          graphData.labels[position] = sessionStorage.tempLabel;
          for(d in graphData.datasets){
            if(graphData.datasets[d].label == question.text){
              graphData.datasets[d].data[position] = value;
            }
          }
          window.appChart.update();
        }
      });
    }else{
      $(rangeBox).prop({disabled:true});
    }
    return $(control).append(rangeBox).append(output);
  }, // End of rangebox function() -------------------------------------------->
  /*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    Function to

    Parameters: None
    Returns: None
  ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
  submit:function(){
    // Save answer to datastore from localStorage
    var data = JSON.parse(localStorage.getItem("wip_" + responses.name + "_" + responses.id));
    try {
      if (!data) throw "Nothing to save";
      // Directory/subdir: responses/username(hashed)_section_quiz-id_attempt_timestamp
      var userSHA = sessionStorage.userSHA;
      var section = responses.name;
      var quizId = responses.id;
      //var attempt = this.getAttempt(localStorage.questionID);
      var timeStamp = Date.now();
      var subdir = userSHA + "_" + section + "_" + quizId + "_" + timeStamp; //"_" + attempt +
      dataStore.save("responses", subdir, responses);
      // Reset the quiz data responses, local storage (wip_) on Cancel
      localStorage.removeItem("wip_" + responses.name + "_" + responses.id);
      quizData = null;
      responses = null;
      graphData = null;
      $.alert("Your responses are saved", "Save Success");
      // Set the slider menu to previous position
      this.goBack();
    } catch (e) {
      $.alert("Failed to save the respones. try again..", "Save failed");
    }
  }, // End of submit function() ---------------------------------------------->

  /*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
      Function to save quiz answers per question either on individual input
      'blur' per question and 'review' button and submit button
      Parameter:
          inputvalue: value of the input
          sid: Section ID
          qid: Question ID
      Returns: Nothing
  ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
  saveAnswer: function(inputValue, sid, qid){
      // Loop thru jSON array of answers and find the correct index and update
      // the value of answer field
      for(i in responses.sections){
        if(responses.sections[i].section == sid){
          for(j in responses.sections[i].answers){
            if(responses.sections[i].answers[j].id == qid){
              responses.sections[i].answers[j].answer =  sanitizeHTML(inputValue);
              break;
            }
          }
        }
      }
      // Save data to local storage temporarily
      localStorage.setItem("wip_" + responses.name + "_" + responses.id, JSON.stringify(responses));
      var userSHA = sessionStorage.userSHA;
      var section = responses.name;
      var quizId = responses.id;
      var subdir = userSHA + "_" + section + "_" + quizId; //"_" + attempt +
      //dataStore.save("wip", subdir, responses);

  },// End of saveAnswer function() ------------------------------------------->
  /*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    Function to

    Parameters: None
    Returns: None
  ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
  cancel:function(items){
    // Reset the quiz data responses, local storage (wip_) on Cancel
    localStorage.removeItem("wip_" + responses.name + "_" + responses.id);
    quizData = null;
    responses = null;
    graphData = null;
    // Set the slider menu to previous position
    this.goBack();
  }, // End of cancel function() ---------------------------------------------->
  /*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    Function to move the slider menu to the previous position upon the quiz form
    is closed either by clicking cancel or submit.
    Parameters: None
    Returns: None
  ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
  goBack:function(){
    // Go back.
    var menuPath = JSON.parse(sessionStorage.menuPath);

    var prevMenu = menuPath[menuPath.length - 1];
    var parentMenu = $(".menu-slider ." + prevMenu.name).find("[data-id='" + sessionStorage.parentItem + "']").parent( '.slider-menu__menu' );
    var nav = $(parentMenu).closest("nav.slider-menu__container");
    var container = $(parentMenu).closest(".slider-menu");
    var activeMenu = $(parentMenu).parent().parent();

    this.load(prevMenu.name, prevMenu.id);
    sessionStorage.currentLeft = prevMenu.left;
    $(nav).css( 'left', '-' + prevMenu.left + '%' );

    $(parentMenu).removeClass( 'slider-menu--active' );
    $(activeMenu).addClass( 'slider-menu--active' )
                  .parents( '.slider-menu__menu' ).addClass( 'slider-menu--active' );

    $(container).css( 'height', prevMenu.height );
    menuPath.pop();
    sessionStorage.menuPath = JSON.stringify(menuPath);

    $(".hero-foot").removeClass("is-hidden");
  }, // End of goBack function() ---------------------------------------------->
  /*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    Function to

    Parameters: None
    Returns: None
  ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
  buttons:function(){
    var node = $("<nav class='level is-mobile' id='floating-buttons'></nav>");
    var leftButton = $("<div class='level-left'>" +
                          "<p class='level-item'>" +
                            "<button class='button is-danger' id='button-left'>Cancel</button>" +
                          "</p>" +
                        "</div>");
    var rightButton = $("<div class='level-right'>" +
                          "<p class='level-item' style='margin-right:2rem'>" +
                            "<button class='button is-dark is-hidden' id='button-print'>" +
                            "<i class='fa fa-print'>&nbsp;Print</i>" +
                            "</button>" +
                          "</p>" +
                          "<p class='level-item' style='margin-right:0'>" +
                            "<button class='button is-success' id='button-right'>Submit</button>" +
                          "</p>" +

                        "</div>");
    return $(node).append(leftButton).append(rightButton);
  }, // End of buttons function() --------------------------------------------->
  /*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    Function to

    Parameters: None
    Returns: None
  ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
  accordions:function(contentInput, title){
    var node = $("<section class='accordions'></section>");
    var accordion = $("<article class='accordion' id='past-result'></article>");
    var header = $("<div class='accordion-header'></div>");
    $(header).append("<p>" + title + "</p>");
    $(header).append("<button class='toggle'></button>");
    var body = $("<div class='accordion-body'></div>");
    var content = $("<div class='accordion-content is-paddingless'></div>");
    $(content).append(contentInput)
    $(body).append(content);
    $(accordion).append(header).append(body);
    $(node).append(accordion);

    $(accordion).find(".toggle").on("click",function(){
      var parentNode = $(this).parent().parent()
      if($(parentNode).hasClass("is-active")){
        $(parentNode).removeClass("is-active");
      }else{
        $(parentNode).addClass("is-active");
      }
    })
    return node;
  }, // End of accordions function() ------------------------------------------>
  /*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    Function to

    Parameters: None
    Returns: None
  ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
  steps:function(index, title){
      var stepItem = $("<div class='step-item'></div>");
      if(index == 1) $(stepItem).addClass("is-active");
      $(stepItem).append($("<div class='step-marker'>" + index + "</div>"));
    return stepItem;
  },// End of steps function() ------------------------------------------------>
  /*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
      Function to print/output the current quiz form and answers to a PDF file
      on click of print button
      Parameter: None
      Returns: Nothing
  ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
  print:function(){
    // Using jsPDF library.
    var doc = new jsPDF('p','mm','a4');
    var menuData = JSON.parse(localStorage.getItem(responses.name + "Menu" + responses.id));
    var quizData = JSON.parse(localStorage.getItem(responses.name + "_" + responses.id));
    var page = 1;
    const PAGE_TOP = 20;
    var nextLine = PAGE_TOP;
    // jsPDF settings
    var pageWidth = 210,
        pageHeight = 297,
        lineHeight = 1.2,
        margin = 20,
        indent1 = 25,
        indent2 = 30,
        indent3 = 38,
        indent4 = 40,
        maxLineWidth = pageWidth - margin * 2,
        fontSize = 12,
        ptsPerInch = 72,
        oneLineHeight = 5;

    doc.setFont("helvetica");
    doc.setFontSize(14);
    doc.setFontType("bold");
    // Print the title
    doc.text(margin, nextLine, menuData.text);
    nextLine += oneLineHeight;
    doc.line(margin, nextLine, 190, nextLine);
    nextLine += oneLineHeight;

    doc.setFont("times");
    doc.setFontSize(fontSize);
    doc.setFontType("normal");

    doc.text(170, 285,"Page - " + page);
    // Print the content
    for(m in menuData.content){
      var content = doc.splitTextToSize(menuData.content[m], 170);
      doc.text(margin, nextLine, content);
      nextLine += content.length * oneLineHeight;
    }
    doc.line(margin, nextLine, 190, nextLine);
    nextLine += oneLineHeight;
    // Iterate the sections in quiz data and print info to PDF
    for(section in quizData){
      // Add the page
      if(nextLine > 240){
        doc.addPage();
        page++;
        doc.text(170, 285,"Page - " + page);
        nextLine = PAGE_TOP;
      }
      // Print the section title
      doc.setFontType("bold");
      var sectionTitle = doc.splitTextToSize(quizData[section].sectionTitle, 150);
      doc.text(margin, nextLine, "STEP-" + quizData[section].section + ": ");
      doc.text(margin + 16, nextLine, sectionTitle);
      nextLine += oneLineHeight * sectionTitle.length + 2;
      // iterate all quiz questions to print questions and answers as well
      for(q in quizData[section].questions){
        if(nextLine > 260){
          doc.text(margin, 285,"Continued...");
          doc.addPage();
          page++;
          doc.text(170, 285,"Page - " + page);
          nextLine = PAGE_TOP;
        }
        // Determine the type of input
        var type = quizData[section].questions[q].type.trim();
        doc.setFontType("bold");
        // Special case checkbox in the quiz
        if((type == "checkbox" || type == "radio" ) && (quizData[section].questions[q].options == undefined) ){
          // Draw a checkbox
          var answer = responses.sections[section].answers[q].answer;
          var question = sanitizeHTML(quizData[section].questions[q].text);
          if(question === answer){
            doc.setFillColor(80,80,80);
            doc.rect(indent2, nextLine - 4, 4, 4, 'F');
          }else{
            doc.rect(indent2, nextLine - 4, 4, 4);
          }

          // Split the long line of text into segments to print over several lines
          var questionText = doc.splitTextToSize(quizData[section].questions[q].text, 130)
          //Print the question
          doc.text(indent3 + 2, nextLine, questionText);
          nextLine += oneLineHeight * questionText.length;
          doc.setFontType("normal");
          doc.setFontType("italic");
          // Print help/info text from the quiz
          var info = quizData[section].questions[q].info
          // Remove all html markups
          info = info.replace(/<br>/g,"\n");
          info = info.replace(/<i>/g,"");
          info = info.replace(/<\/i>/g,"");
          var infoText = doc.splitTextToSize(info, 130)
          doc.text(indent4, nextLine, infoText);
          nextLine += oneLineHeight * infoText.length + 2;
        }else{
          // Split the long line of text into segments to print over several lines
          var questionText = doc.splitTextToSize(quizData[section].questions[q].text, 130);
          doc.text(indent1, nextLine, quizData[section].questions[q].id + ". ");
          //Print the question
          doc.text(indent1 + 7, nextLine, questionText);
          nextLine += oneLineHeight * questionText.length + 2;
        }

        doc.setFontType("normal");
        // Print the question options text etc accordin to type of the input
        switch (type){
          case "date":
            doc.setDrawColor(80,80,80);
            // Print the answer
            var answer = responses.sections[section].answers[q].answer
            if(answer != null){
              doc.text(indent3, nextLine - 1, answer);
            }else{
              doc.text(indent3, nextLine - 1, "    /     /     ");
            }
            // Draw a pagewidth line
            doc.line(indent2, nextLine, 190, nextLine);
            nextLine += oneLineHeight + 2;
          break;
          case "textbox":
            doc.setDrawColor(80,80,80);
            var answer = responses.sections[section].answers[q].answer
            if(answer != null){
              doc.text(indent3, nextLine - 1, answer);
            }
            doc.line(indent2, nextLine, 190, nextLine);
            nextLine += oneLineHeight + 2;
          break;
          case "checkbox":
            if(quizData[section].questions[q].options != null){
              for(o in quizData[section].questions[q].options){
                if(nextLine > 275){
                  doc.text(margin, 285, "Continued...");
                  doc.addPage();
                  page++;
                  doc.text(170, 285,"Page - " + page);
                  nextLine = 20;
                }
                var answers = responses.sections[section].answers[q].answer
                var checked = false;
                for(a in answers){
                  if(quizData[section].questions[q].options[o] == answers[a]){
                    checked = true;
                    break;
                  }
                }
                if(checked){
                  doc.setFillColor(80,80,80);
                  doc.rect(indent2, nextLine - 4, 4, 4, 'F');
                }else{
                  doc.rect(indent2, nextLine - 4, 4, 4);
                }
                var optionText = doc.splitTextToSize(quizData[section].questions[q].options[o], 135)
                doc.text(indent3, nextLine, optionText);
                nextLine += oneLineHeight * optionText.length + 2;
              }
            }
          break;
          case "radio":
            for(o in quizData[section].questions[q].options){
              if(nextLine > 275){
                doc.text(margin,285,"Continued...");
                doc.addPage();
                page++;
                doc.text(170, 285,"Page - " + page);
                nextLine = PAGE_TOP;
              }
              var answer = responses.sections[section].answers[q].answer;
              if(quizData[section].questions[q].options[o] == answer){
                doc.setFillColor(80,80,80);
                doc.circle(indent2, nextLine - 2, 2, 'FD');
              }else{
                doc.circle(indent2, nextLine - 2, 2);
              }
              var optionText = doc.splitTextToSize(quizData[section].questions[q].options[o], 130)
              doc.text(indent3, nextLine, optionText);
              nextLine += oneLineHeight * optionText.length + 2;
            }
          break;
          case "textarea":
            doc.setDrawColor(80,80,80);
            var answer = responses.sections[section].answers[q].answer;
            if(answer == null || answer == ""){
              for(i=0;i<4;i++){
                if (nextLine >= 285) break;
                doc.line(indent2, nextLine, 190, nextLine);
                nextLine += oneLineHeight;
              }
            }else{
              var answerText = doc.splitTextToSize(answer, 130)
              doc.text(indent3, nextLine, answerText);
              nextLine += oneLineHeight * answerText.length + 2;
            }
            doc.setDrawColor(255,255,255);
          break;
          case "selection":
            for(o in quizData[section].questions[q].options){
              if(nextLine > 275){
                doc.text(margin,285,"Continued...");
                doc.addPage();
                page++;
                doc.text(170, 285,"Page - " + page);
                nextLine = PAGE_TOP;
              }
              var answer = responses.sections[section].answers[q].answer;
              if(quizData[section].questions[q].options[o] == answer){
                doc.rect(indent2, nextLine - 4, 4, 4, 'F');
              }else{
                doc.rect(indent2, nextLine - 4, 4, 4);
              }
              var optionText = doc.splitTextToSize(quizData[section].questions[q].options[o], 135)
              doc.text(indent3, nextLine, optionText);
              nextLine += oneLineHeight * optionText.length + 2;
            }
          break;
          case "range":
            var answer = responses.sections[section].answers[q].answer;
            doc.text(indent3, nextLine, quizData[section].questions[q].help);
            nextLine += 2;
            doc.setFontType("bold");
            doc.text(indent2 + 2, nextLine + oneLineHeight, answer);
            doc.setFontType("normal");
            doc.rect(indent4, nextLine, 140, 8);
            doc.rect(indent4, nextLine, 10, 8);
            var start = 50;
            var end = 170;
            doc.rect(end + 1, nextLine, 9, 8);
            doc.line(indent4 + 10, nextLine + 4, end, nextLine + 4)
            var min = quizData[section].questions[q].min;
            var max = quizData[section].questions[q].max;
            var step = 120 /  ((min * -1) + max);
            if(max > 24) step = 10;

            var answerStep = ((min * -1) + parseInt(answer));
            answerStep = (answerStep * step) + start;
            // Draw the scale grades
            for(i=start;i<=end;){
              if(i == answerStep){
                doc.rect(i, nextLine + 2, 1, 4, 'F');
              }else{
                doc.rect(i, nextLine + 2, 1, 4);
              }
              i += step;
            }
            doc.text(indent4 + 3, nextLine + 6, quizData[section].questions[q].min.toString())
            doc.text(end + 3, nextLine + 6, quizData[section].questions[q].max.toString())
            nextLine += oneLineHeight  + 8;
          break;
          default:
        }
        if(nextLine != PAGE_TOP) nextLine += 2;
      }
    }
    // Output the PDF file
    doc.save("Documents/My Tools " + responses.id + ".pdf");
  },
} // End of print function() -------------------------------------------------->
/*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
  Class definition to

  Parameters: None
  Returns: None
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
class QuizSection{
  // Class constructors to receive data into class
  constructor(container, data){
    this.container = container;
    this.data = data;
    this.init();
  }
  // The initialisation of the class which assigns the values to required
  // variables and adds event listener to buttons
  init(){
    this.content = this.data[0].questions;
    this.sections = this.data.length - 1;
    this.leftButton = this.container.querySelector("#button-left");
    this.righttButton = this.container.querySelector("#button-right");
    this.printButton = this.container.querySelector("#button-print");
    this.current = 0;
    this.loaded = -1;
    var self = this;

    if(this.data.length > 1){ // Has more than one section/steps
      $(this.righttButton).html("Next").removeClass("is-success").addClass("is-info")
      // Wire up event listener to the button
      // For a single section button will submit to save otherwise button will
      // load/display the next section
      $(this.righttButton).on("click", function(){
        if($(this).html() === "Submit"){
          // Delay to avoid premature nulling of respones aboject before text box 'debounce' finishes
          $(this).addClass("is-loading");
          setTimeout(function(){
            quizUI.submit();
            $(this).removeClass("is-loading");
          },3000);

        }else{
          self.nextSection(this);
        }
      });
      // Wire up event listener to the button
      // For a single section button will cancel to goback otherwise button will
      // load/display the previous section
      $(this.leftButton).on("click", function(){
        if($(this).html() === "Cancel"){
          quizUI.cancel();
        }else{
          self.prevSection(this);
        }
      });
    }else{ // When there is only one section/step
      $(this.leftButton).on("click", function(){
        quizUI.cancel();
      });
      $(this.righttButton).on("click", function(){
        quizUI.submit();
      });
      // Show the printButton
      $(this.printButton).removeClass("is-hidden");
    }
    // Attch click action to print button
    $(this.printButton).on("click", function(){
      quizUI.print();
    });
    // Default or initial load of the section
    this.loadSection(0, "next");
  }
  // Loads/reloads the called section from the 'Next' & 'Prev' buttons
  loadSection(index, direction){
    this.current = index;
    var self = this;
    // Only load the new section if not yet loaded.
    if(this.loaded < index && direction == "next"){
      $(this.container).append(quizUI.container(this.data, index));
      this.loaded = index;
    }
    // initialize direction to change order
    if (direction === 'previous') {
      $(this.container).find("#" + (index + 1)).hide(300, function(){
        $(self.container).find("#" + (index)).show(800);
      });
    } else if (direction === 'next') {
      $(this.container).find("#" + (index - 1)).hide(300, function(){
        $(self.container).find("#" + (index)).show(800);
      });
    }
  }
  // Loads the next section when there are multiple sections are present and
  // changes the button behaviour according to the slide position
  nextSection(button){
    // Load next section
    this.loadSection(this.current + 1, "next");
    // Change button behavious depending on the position of the slides
    if($(this.leftButton).html() === "Cancel"){
      $(this.leftButton).html("Prev").removeClass("is-danger").addClass("is-info");
    }
    // var currentSlide = this.current;
    if(this.current === this.sections){
      $(button).html("Submit").removeClass("is-info").addClass("is-success");
      // Show the printButton
      $(this.printButton).removeClass("is-hidden");
    }

    this.maintainSteps(this.current);
  }
  // Displays the previous section when there are multiple sections are present
  //and changes the button behaviour according to the slide position
  prevSection(button){
    // Load previous section
    this.loadSection(this.current - 1, "previous");
    // Change button behavious depending on the position of the slides
    if($(this.righttButton).html() === "Submit"){
      $(this.righttButton).html("Next").removeClass("is-success").addClass("is-info");
    }
    // var currentSlide = this.current;
    if(this.current === 0){
      $(button).html("Cancel").removeClass("is-info").addClass("is-danger");
    }
    this.maintainSteps(this.current);
    // Show the printButton
    $(this.printButton).addClass("is-hidden");
  }
  // Maintains the visualisation of the steps bar when there are multiple
  // sections are present
  maintainSteps(currentSlide){
    var steps = $(".step-item");
    $(steps).each(function(index){
      if(index < currentSlide){
        $(this).removeClass("is-active").addClass("is-completed");
      }else{
        $(this).removeClass("is-active is-completed");
      }

      if (index == currentSlide) {
        $(this).removeClass("is-completed").addClass("is-active");
      }
    });
  }
} // End of class QuizSection{} ----------------------------------------------->

window.resultsUI = {
  load:function(username){
    // var userSHA = CryptoJS.SHA256(username).toString();
    var node = $("#quiz-container");
    var menuData = JSON.parse(localStorage.tools);
    var items = this.accordions(menuData, username);
    var section = $("<section class='accordions'>" + items + "</section>");
    $(node).append(section);

    $("[id^='toggle_']").each(function(button){
      // Attch the event listener to the button
      $(this).on("click",function(event){
        event.stopPropagation();
        var body = $(this).siblings();
        if($(body).hasClass("hide")){
          $(body).removeClass("hide").addClass("show");
          $(body).parent().siblings().find(".accordion-body").removeClass("show").addClass("hide");
          $(body).parent().siblings().find(".toggle").find("i").removeClass("fa-angle-down").addClass("fa-angle-right");
          $(this).find("i").removeClass("fa-angle-right").addClass("fa-angle-down");

          if($(this).data("child") == false){
            var id = $(this).data("id");
            var resultsTable = getPreviousSumissions(username, "tools", id)
            $(body).find(".accordion-content").empty();
            $(body).find(".accordion-content").append(resultsTable);
          }
        }else{
          $(body).removeClass("show").addClass("hide");
          $(this).find("i").removeClass("fa-angle-down").addClass("fa-angle-right");
        }
      });
    });
  },
  accordions:function(menuData){
    var items = "";
    $.each(menuData, function(i, result) {
      var hasChild = false;
      if (result.children != null){
        hasChild = true;
      }
      items +=  "<article class='accordion is-info' id='article_" + result.id + "'>" +
                "<div class='accordion-header toggle' id='toggle_" + result.id + "' data-id='" + result.id + "' data-child='" + hasChild + "'>" +
                  "<p>" + result.text + "</p>" +
                  // "<button class='toggle' id='toggle_" + result.id + "' data-id='" + result.id + "'></button>" +
                  "<span class='icon is-small is-right-pulled' ><i class='fa fa-angle-right'></i></span>" +
                "</div>" +
                "<div class='accordion-body hide'>" +
                "<div class='accordion-content' style='padding:.2em 0em .2em .1em'>";
      if (result.children != null){
        items += "<section class='accordions'>" + resultsUI.accordions(result.children) + "</section>";
      }
      items += "</div></div></article>";
    });
    return items;
  }
}
