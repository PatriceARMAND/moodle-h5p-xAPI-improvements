/******************** constants and global variables **********/
class   PatriceArmand_EmbedJsFile_Events{
	static get VIDEO_PAUSED() {return "VIDEO_PAUSED";}  	// data = currentTime
	static get VIDEO_PLAY() {return "VIDEO_PLAY";}		// data = currentTime
	static get VIDEO_PLAY() {return "VIDEO_PLAYING";}	// data = currentTime
	static get VIDEO_BOOKMARK() {return "VIDEO_BOOKMARK";}	// data = bookmarkName, currentTime 
	//static get VIDEO_REWIND() {return "VIDEO_REWIND";}	// data = currentTime
	//static get VIDEO_FORWARD() {return "VIDEO_FORWARD";}	// data = currentTime
	static get USER_VIEW_PAGE() {return "USER_VIEW_PAGE";}	// data = now()
	//static get USER_LEAVE_PAGE() {return "USER_LEAVE_PAGE";}// data = now();
}


// global variables
const patriceArmand_EmbedJsFile_GlobalVariables = {
	courseId : null,
	courseIdNumber : null,
	courseName : null,
	userId : null,
	userUsername : null,
	userEmail : null,
	h5pContentLibrary : null,
	bookmarks : null,  // array
	lastPausedTime : null,
	lastPlayingTime : null,
	lrs : null
}


/****************** helper functions **************************/
// code from website https://www.golinuxcloud.com/recursive-search-json-object-javascript/
function searchJSON(obj, key) {
  let results = [];
  for (let k in obj) {
    if (obj.hasOwnProperty(k)) {
      if (k === key) {
        results.push(obj);
      } else if (typeof obj[k] === "object") {
        results = results.concat(searchJSON(obj[k], key));
      }
    }
  }
  return results;
}


function createXapiStatement(patriceArmand_EmbedJsFile_Event, data){
	// create a basic statement
	// TODO fill attributes with correct information received as parameters in function initializeEmbedJs()
	var statement = new TinCan.Statement(	
    	    {
        	actor: {account: {name: patriceArmand_EmbedJsFile_GlobalVariables.userId, homePage: 'http://localhost/moodle'},
			name: patriceArmand_EmbedJsFile_GlobalVariables.userUsername,
			objectType: "Agent",
			mbox : patriceArmand_EmbedJsFile_GlobalVariables.userEmail
		},
        	verb:{display: {"en-US": "myVerb"},
		      id: "http://myVerbID"
		},
		object: {id: patriceArmand_EmbedJsFile_GlobalVariables.h5pContentLibrary,
			definition : {type : "http://adlnet.gov/expapi/activities/video"},
			objectType: "Activity"
		}
	    }
	);
	// modify basic statement
	switch(patriceArmand_EmbedJsFile_Event){
		case   PatriceArmand_EmbedJsFile_Events.VIDEO_PAUSED :
		    var verb = "video_paused";
		    statement.verb = new TinCan.Verb({display: {"en-US": verb}, id: "http://myID"});
		    statement.result = new TinCan.Result({extensions: {"https://w3id.org/xapi/video/extensions/time": data.time}});
		    break;
		case   PatriceArmand_EmbedJsFile_Events.VIDEO_PLAY :	   
		    var verb = "video_play";
		    statement.verb = new TinCan.Verb({display: {"en-US": verb}, id: "http://myID"});
		    statement.result = new TinCan.Result({extensions: {"https://w3id.org/xapi/video/extensions/time": data.time}});
		    break;
		case   PatriceArmand_EmbedJsFile_Events.VIDEO_PLAYING :	   
		    var verb = "video_playing";
		    statement.verb = new TinCan.Verb({display: {"en-US": verb}, id: "http://myID"});
		    statement.result = new TinCan.Result({extensions: {"https://w3id.org/xapi/video/extensions/time": data.time}});
		    break;
		case   PatriceArmand_EmbedJsFile_Events.USER_VIEW_PAGE :	   
		    var verb = "view";
		    statement.verb = new TinCan.Verb({display: {"en-US": verb}, id: "http://myID"});
		    break;
	}	
	return statement;
}

function createLRS(){
	var lrs;
	try {
    	     lrs = new TinCan.LRS(
        	   {
            	     endpoint: "https://cloud.scorm.com/lrs/5SR72WX0IX/",
		     username: "pa.armand@gmail.com",
            	     password: "myPassword",
            	     allowFail: false
        	    }
    	     );
	}
	catch (ex) {
    	    // TODO: do something with error, can't communicate with LRS
	}
	return lrs;
}

function sendXapiStatement(statement){
	// asynchron version
	patriceArmand_EmbedJsFile_GlobalVariables.lrs.saveStatement(
    		statement,
    		{
        	    callback: function (err, xhr) {
        		if (err !== null) {
		                if (xhr !== null) {
                		    console.log("Failed to save statement: " + xhr.responseText + " (" + xhr.status + ")");
                    		// TODO: do something with error, didn't save statement
                    		return;
                		}

		                console.log("Failed to save statement: " + err);
                		// TODO: do something with error, didn't save statement
                		return;
            		}
		            console.log("Statement saved");
            		// TODO: do something with success (possibly ignore)
        	    }
    		}
	);
}

patriceArmand_EmbedJsFile_GlobalVariables.lrs = createLRS();

function initializeEmbedJs(Y, arg){
	patriceArmand_EmbedJsFile_GlobalVariables.courseId = arg["my_course_id"];
	patriceArmand_EmbedJsFile_GlobalVariables.courseIdNumber = arg["my_course_idnumber"];
	patriceArmand_EmbedJsFile_GlobalVariables.courseShortname = arg["my_course_shortname"];
	patriceArmand_EmbedJsFile_GlobalVariables.userId = arg["user_id"];
	patriceArmand_EmbedJsFile_GlobalVariables.userUsername = arg["user_username"];
	patriceArmand_EmbedJsFile_GlobalVariables.userEmail = arg["user_email"];

	// retrieve informations about bookmarks defined in video included in H5P interactive video activity
	// all data are in H5PIntegration
	parent_node_having_property_jsonContent = searchJSON(H5PIntegration, 'jsonContent');
	str_jsonContent = parent_node_having_property_jsonContent[0].jsonContent;
	obj_to_be_found = JSON.parse(str_jsonContent);
	// TODO assign value to patriceArmand_EmbedJsFile_GlobalVariables.bookmarks

	parent_node_having_property_contentUrl = searchJSON(H5PIntegration, 'contentUrl');
	str_contentUrl = parent_node_having_property_contentUrl[0].contentUrl;
	patriceArmand_EmbedJsFile_GlobalVariables.h5pContentLibrary = str_contentUrl;
}

// to detect when user opens page
// fired when page has loaded all content including images, script and css files
window.addEventListener('load', function() {
	console.log('window.load- user h opens page ');
	const data = null ; // usefull information is alaready enabled in the statement via timestamp 
	let statement = createXapiStatement(  PatriceArmand_EmbedJsFile_Events.USER_VIEW_PAGE, data);
	console.log('statement created by patrice');
        console.log(statement);
	sendXapiStatement(statement);
});




// This file is part of Moodle - http://moodle.org/
//
// Moodle is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
//
// Moodle is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.
//
// You should have received a copy of the GNU General Public License
// along with Moodle.  If not, see <http://www.gnu.org/licenses/>.

/* global H5PEmbedCommunicator:true */
/**
 * When embedded the communicator helps talk to the parent page.
 * This is a copy of the H5P.communicator, which we need to communicate in this context
 *
 * @type {H5PEmbedCommunicator}
 * @module     core_h5p
 * @copyright  2019 Joubel AS <contact@joubel.com>
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */
H5PEmbedCommunicator = (function() {
    /**
     * @class
     * @private
     */
    function Communicator() {
        var self = this;

        // Maps actions to functions.
        var actionHandlers = {};

        // Register message listener.
        window.addEventListener('message', function receiveMessage(event) {
            if (window.parent !== event.source || event.data.context !== 'h5p') {
                return; // Only handle messages from parent and in the correct context.
            }

            if (actionHandlers[event.data.action] !== undefined) {
                actionHandlers[event.data.action](event.data);
            }
        }, false);

        /**
         * Register action listener.
         *
         * @param {string} action What you are waiting for
         * @param {function} handler What you want done
         */
        self.on = function(action, handler) {
            actionHandlers[action] = handler;
        };

        /**
         * Send a message to the all mighty father.
         *
         * @param {string} action
         * @param {Object} [data] payload
         */
        self.send = function(action, data) {
            if (data === undefined) {
                data = {};
            }
            data.context = 'h5p';
            data.action = action;

            // Parent origin can be anything.
            window.parent.postMessage(data, '*');
        };

        /**
         * Send a xAPI statement to LMS.
         *
         * @param {string} component
         * @param {Object} statements
         */
        self.post = function(component, statements) {
            require(['core/ajax'], function(ajax) {
                var data = {
                    component: component,
                    requestjson: JSON.stringify(statements)
                };
                ajax.call([
                   {
                       methodname: 'core_xapi_statement_post',
                       args: data
                   }
                ]);
            });
        };
    }

    return (window.postMessage && window.addEventListener ? new Communicator() : undefined);
})();

document.onreadystatechange = function() {
    // Wait for instances to be initialize.
    if (document.readyState !== 'complete') {
        return;
    }

    // Check for H5P iFrame.
    var iFrame = document.querySelector('.h5p-iframe');
    if (!iFrame || !iFrame.contentWindow) {
        return;
    }
    var H5P = iFrame.contentWindow.H5P;




    // catch events on video object then call function to create a statement then call a function to send statement
    var iframeH5P = document.getElementsByClassName('h5p-iframe')[0].contentWindow.H5P
    var iframeVideo = iframeH5P.instances[0].video;
    iframeVideo.on('stateChange', function (event) { 
      switch (event.data) {
        case iframeH5P.Video.SEEKED:
            // TODO create statement and send it
            break;    
        case iframeH5P.Video.SEEKING:
            // TODO create statement and send it
            break;        
        case iframeH5P.Video.ENDED:
            // TODO create statement and send it
            break;
        case iframeH5P.Video.PLAY:
            // TODO create statement and send it
            break;
        case iframeH5P.Video.PAUSED:            
	    patriceArmand_EmbedJsFile_GlobalVariables.lastPauseTime = iframeVideo.getCurrentTime();
	    var data = {time : iframeVideo.getCurrentTime()};
	    var statement = createXapiStatement(PatriceArmand_EmbedJsFile_Events.VIDEO_PAUSED, data);	   
	    sendXapiStatement(statement);	    
            break;
        case iframeH5P.Video.PLAYING:
	    patriceArmand_EmbedJsFile_GlobalVariables.lastPlayingTime = iframeVideo.getCurrentTime();
	    var data = {time : iframeVideo.getCurrentTime()};
	    var statement = createXapiStatement(PatriceArmand_EmbedJsFile_Events.VIDEO_PLAYING, data);
	    sendXapiStatement(statement);
            break;
	case iframeH5P.Video.VOLUMECHANGE:
            // TODO create statement and send it            
	    break;
       }
   });



    // Check for H5P instances.
    if (!H5P || !H5P.instances || !H5P.instances[0]) {
        return;
    }

    var resizeDelay;
    var instance = H5P.instances[0];
    var parentIsFriendly = false;

    // Handle that the resizer is loaded after the iframe.
    H5PEmbedCommunicator.on('ready', function() {
        H5PEmbedCommunicator.send('hello');
    });

    // Handle hello message from our parent window.
    H5PEmbedCommunicator.on('hello', function() {
        // Initial setup/handshake is done.
        parentIsFriendly = true;

        // Hide scrollbars for correct size.
        iFrame.contentDocument.body.style.overflow = 'hidden';

        document.body.classList.add('h5p-resizing');

        // Content need to be resized to fit the new iframe size.
        H5P.trigger(instance, 'resize');
    });

    // When resize has been prepared tell parent window to resize.
    H5PEmbedCommunicator.on('resizePrepared', function() {
        H5PEmbedCommunicator.send('resize', {
            scrollHeight: iFrame.contentDocument.body.scrollHeight
        });
    });

    H5PEmbedCommunicator.on('resize', function() {
        H5P.trigger(instance, 'resize');
    });

    H5P.on(instance, 'resize', function() {
        if (H5P.isFullscreen) {
            return; // Skip iframe resize.
        }

        // Use a delay to make sure iframe is resized to the correct size.
        clearTimeout(resizeDelay);
        resizeDelay = setTimeout(function() {
            // Only resize if the iframe can be resized.
            if (parentIsFriendly) {
                H5PEmbedCommunicator.send('prepareResize',
                    {
                        scrollHeight: iFrame.contentDocument.body.scrollHeight,
                        clientHeight: iFrame.contentDocument.body.clientHeight
                    }
                );
            } else {
                H5PEmbedCommunicator.send('hello');
            }
        }, 0);
    });

    // Get emitted xAPI data.
    H5P.externalDispatcher.on('xAPI', function(event) {
	var statement = new TinCan.Statement(	
    		{
        	actor: event.data.statement.actor,
        	verb: event.data.statement.verb ,
		object: event.data.statement.object,
		result: event.data.statement.result,
        	target: {
            	    id: "http://rusticisoftware.github.com/TinCanJS"
        	},				
		context : {
		    contextActivities: {			
			grouping:[
			  {id: "http://localhost/moodle",
              		  definition: [Object],
              		  objectType: "Activity"}
			]
		    }
		}		
    		}
	);
	sendXapiStatement(statement);



        var moodlecomponent = H5P.getMoodleComponent();
        if (moodlecomponent == undefined) {
            return;
        }
        // Skip malformed events.
        var hasStatement = event && event.data && event.data.statement;
        if (!hasStatement) {
            return;
        }

        var statement = event.data.statement;
        var validVerb = statement.verb && statement.verb.id;
        if (!validVerb) {
            return;
        }

        var isCompleted = statement.verb.id === 'http://adlnet.gov/expapi/verbs/answered'
                    || statement.verb.id === 'http://adlnet.gov/expapi/verbs/completed';

        var isChild = statement.context && statement.context.contextActivities &&
        statement.context.contextActivities.parent &&
        statement.context.contextActivities.parent[0] &&
        statement.context.contextActivities.parent[0].id;

        if (isCompleted && !isChild) {
            var statements = H5P.getXAPIStatements(this.contentId, statement);
            H5PEmbedCommunicator.post(moodlecomponent, statements);
        }
    });

    // Trigger initial resize for instance.
    H5P.trigger(instance, 'resize');
};
