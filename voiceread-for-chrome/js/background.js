//THIS SCRIPT DEALS WITH THE EXTENSION'S USE OF THE CHROME TEXT TO SPEECH API!
//SETS UP HOW TO RESPOND TO MESSAGES FROM THE EXTENSION



var lastCharIndex = null;

// checks voice is english and has word boundaries
function isValidVoice(voice) {
  return voice.lang.indexOf('en') > -1 && voice.eventTypes.indexOf('word') > -1 && 
    (voice.voiceName == 'Alex' || 
    voice.voiceName == 'Daniel' || 
    voice.voiceName == 'Karen' ||
    voice.voiceName == 'Moira' ||
    voice.voiceName ==  'Samantha');
}
function getValidFont(font) {
    if (font.fontId == 'Avenir'  || 
    font.fontId == 'Calibri' || 
    font.fontId == 'Cambria' ||
    font.fontId == 'Courier' ||
    font.fontId == 'Helvetica'||
    font.fontId == 'OpenDyslexic' ||
    font.fontId == 'Times New Roman' ||
    font.fontId == 'Trebuchet'){
      return font
     }

    
}

//looks like this whole script acts on the background page and sends informatoin to the extension.
//the connection established below is between the background and the 
//extension--the bg is listening for extesnsion's requests of things like font and voices (from APIs)

//fires when a connection is made from either an extension process or a content script
//handles incoming connections (is this an extension or a content script?)

//this section allows for responding to incoming connections!
//chrome.runtime.xxxxxxxxxxxxx.addListener
//the xxxx'ed part can be subsitituted with 
////"onMessage" for one way
////or ditto but with 'external' at the end for cross extension communication
chrome.runtime.onConnect.addListener(function(port) {
  console.assert(port.name == "voiceread");
  port.onMessage.addListener(function(msg) { //the msg is sent by the chrome extension--contains info about the user's interaction(buttons pressed)
    if (msg.type == "request") {
      chrome.tts.getVoices( function(voice_list) { 
        port.postMessage({voices: voice_list.filter(isValidVoice)});
 //how do we know its a valid voice?    
      });
      chrome.fontSettings.getFontList( function(font_list) {
        port.postMessage({fonts: font_list.filter(getValidFont)});      
      }); 
    } else if (msg.type == "speak"){
      chrome.tts.speak(msg.selected_text,
        {
          voiceName: msg.voice_name, // 'native', 
          rate: msg.speech_rate,
          requiredEventTypes: ['word'],
          onEvent: function(event){
            //unsure what suppressBoundary does
            //also need to think more deeply about what's going on with the char indices.
            if (!msg.suppressBoundary && event.charIndex != lastCharIndex && event.type == 'word'){
              port.postMessage({evt: 'boundary'});
              lastCharIndex = event.charIndex; //help why
            }
            if (!msg.suppressBoundary && event.type == 'end'){
              port.postMessage({evt: 'finished'});
            }
          }// okay so there are two states: 1) boundary (keep going) 2) finished (stop)
        }
      );
    } else if (msg.type == "resume"){
      chrome.tts.resume();
    } else if (msg.type == "pause"){
      chrome.tts.pause();
    } else if (msg.type == "stop"){
      chrome.tts.stop();
    }
   });
});
//Alex, Daniel, FIona, Karen, Moira, Samantha
//Arial, Avenir, Calibri, cambria, courier, helvetica, open dyslexic, times new romam, trebuchet
