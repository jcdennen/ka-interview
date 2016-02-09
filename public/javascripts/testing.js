// -----------------------------------------------------------------------------
// testing.js
//
// this file consists mostly of jQuery that uses Esprima.js to parse some
// javascript from a text editor (Ace) and notify the user whether or not
// their code is meeting the necessary requirements. these requirements, namely
// a whitelist, blacklist, and javascript object depicting a parent and child
// relationship between to elements of code are set in the DOM using form elements
// 
// Author: Jeremy Dennen
// -----------------------------------------------------------------------------

// necessary javascript for Ace Editor's ace.js file
var editor = ace.edit("editor");
editor.setTheme("ace/theme/twilight");
editor.session.setMode("ace/mode/javascript");

// start of jQuery
(function($){
  $(function(){

    // -------------------------------------------------------------------------
    // VARIABLE AND FUNCTION DECLARATIONS
    // -------------------------------------------------------------------------

    // arrays we will use to whitelist, blacklist, etc. necessary attribtues of
    // a user's code.
    // NOTE: roughStruct may be extended to be an array of objects if more
    // structure requirements are needed
    var whitelist = [];
    var blacklist = [];
    var roughStruct = { parent: "", child: "" };

    // crosscheck JSON string with keywords from whitelist array and make sure
    // all keywords exist within the JSON object that is passed
    var checkWhiteList = function(stringifiedJSON){
      if (whitelist.length > 0) {
        // an array of whitelisted elements that are missing from the code
        var missingFromWhiteList = [];
        var found;
        for (var i = 0; i < whitelist.length; i++) {
          found = false;
          JSON.parse(stringifiedJSON, function(x,y){
            if (x === "type" && y === whitelist[i]){
              found = true;
              return;
            }
          });
          // if the current whitelisted item has not been found, we add it to
          // the array of missing items
          if (!found) {
            missingFromWhiteList.push(whitelist[i]);
          }
        }
        if (missingFromWhiteList.length > 0) {
          // throw a syntax error describing what's missing
          throw new SyntaxError("Whoops! Looks like the following are missing from your code!\n" + missingFromWhiteList.join("\n"));
        }
      }
      return;
    };

    // crosscheck JSON string with keywords from array and make sure all
    // keywords DO NOT exist within the JSON object that is passed
    var checkBlackList = function(stringifiedJSON){
      if (blacklist.length > 0) {
        // an array of blacklisted elements that are present in the code
        var presentInBlackList = [];
        for (var i = 0; i < blacklist.length; i++) {
          JSON.parse(stringifiedJSON, function(x,y){
            if (x === "type" && y === blacklist[i]){
              // every blacklisted item found will be added to this array
              presentInBlackList.push(blacklist[i]);
              return;
            }
          });
        }
        if (presentInBlackList.length > 0) {
          // throw a syntax error describing what's missing
          throw new SyntaxError("Whoops! Looks like you need to remove the following from your code!\n" + presentInBlackList.join("\n"));
        }
      }
      return;
    };

    // crosscheck JSON string structure with rough structure object to ensure
    // code follows one case of proper nesting
    var checkStructure = function(stringifiedJSON){
      if (roughStruct.parent !== "" && roughStruct.child !== ""){
        // parse object
        var jsonObj = JSON.parse(stringifiedJSON);
        var parentFound = false;
        for (var prop in jsonObj) {
          if (jsonObj.hasOwnProperty(prop)) {
            if (prop === "body" && (jsonObj.body instanceof Array)) {
              for (var i = 0; i < jsonObj.body.length; i++) {
                if (jsonObj.body[i].type === roughStruct.parent){
                  parentFound = true;
                  checkStructureHelper(jsonObj.body[i].body);
                }
              }
            }
          }
        }
        if (!parentFound) {
          throw new SyntaxError("Whoops! Looks like you didn't nest some code " +
                                "correctly. Make sure that your " +
                                roughStruct.parent + " is where it needs to be.");
        }
        return;
      }
      else {
        // we have no need to do anything if the user has not set both structure
        // requirements so let's return
        // NOTE: potentially worth notifying the user that they've set only
        // one requirement and not the other...?
        return;
      }
    };

    // recursive function that looks for the child statement/loop after the
    // parent has been found. throws SyntaxError if no child found.
    var checkStructureHelper = function(jsonObj){
      // NOTE: for in loop potentially unecessary, consider checking existence
      // of body property then accessing (no existence would throw SyntaxError)
      for (var prop in jsonObj) {
        if (jsonObj.hasOwnProperty(prop)) {
          if (prop === "body" && (jsonObj.body instanceof Array)) {
            if (jsonObj.body.length > 0) {
              for (var i = 0; i < jsonObj.body.length; i++) {
                if (jsonObj.body[i].type === roughStruct.child){
                  return; //passes
                }
                else if (jsonObj.body[i].body !== 'undefined') {
                  checkStructureHelper(jsonObj.body[i].body);
                }
                else {
                  throw new SyntaxError("Whoops! Looks like you didn't nest some code correctly. " +
                  "Make sure that your " + roughStruct.child +
                  " is where it needs to be.");
                }
              }
            }
            else {
              throw new SyntaxError("Whoops! Looks like you didn't nest some code correctly. " +
              "Make sure that your " + roughStruct.child +
              " is where it needs to be.");
            }
          }
        }
      }
    }

    // our most important function that takes the code from the editor, parses it,
    // runs various tests, and throws any necessary errors, all the while
    // keeping the user updated with their progress!
    var parseEditor = function(){
      // we retrieve the text of every single div.ace_line element within the editor
      var inputString = $('#editor').find('.ace_line').text();
      var updateMessage = "Looking good so far!";
      var parsedResult;
      // try/catch for retrieving proper errors from esprima
      try {
        // NOTE: consider adding a .no-error class for better UI/UX
        parsedResult = esprima.parse(inputString, {loc:true});
        parsedResult = JSON.stringify(parsedResult, null, 4);
        checkWhiteList(parsedResult);
        checkBlackList(parsedResult);
        checkStructure(parsedResult);
      } catch (e) {
        updateMessage = e;
      } finally {
        // uncomment to see the updated syntax tree each time this function runs
        // console.log(parsedResult);
        $('#update').empty();
        $('#update').text(updateMessage);
      }
    };

    // -------------------------------------------------------------------------
    // DOM RELATED OPERATIONS
    // -------------------------------------------------------------------------

    // update whitelists and blacklists each time checkboxes are altered
    $('input[type=checkbox]').on('click', function(){
      whitelist.length = 0;
      $('.wl-item:checked').each(function(){
        whitelist.push($(this).attr('value'));
      });

      blacklist.length = 0;
      $('.bl-item:checked').each(function(){
        blacklist.push($(this).attr('value'));
      });

      // parse the code now that the requirements have been updated
      parseEditor();
    });

    // update the roughStruct object whenever the structure requirements change
    // and then parse the code
    $('select').on('change', function(){
      roughStruct = {
        parent: $('.struct-two > option:selected').attr('value'),
        child: $('.struct-one > option:selected').attr('value')
      };
      parseEditor();
    });

    // parse the code everytime a user uses the keyboard within the editor
    $('#editor').on('keyup', function(event){
      parseEditor();
    });

  });
})(jQuery);
