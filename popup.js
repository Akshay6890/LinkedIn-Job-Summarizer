// popup.js
let jobId = null; // Initialize jobId

document.addEventListener('DOMContentLoaded', function () {

    
    chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {


        if (message.action === "sendJobIdToPopup") {


            var {jobId} = message;

            if (jobId) {

                chrome.runtime.sendMessage({ action: 'getSummary', jobId: jobId });
            }
        }

        else if (message.action == "processedFeedback") {

            
            document.getElementById("summary").textContent = message.summary.message;
        }
    });
});
