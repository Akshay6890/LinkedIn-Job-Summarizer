// background.js

// Create a new Broadcast Channel with a unique name
const channel = new BroadcastChannel('extension_channel');


// background.js
chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
  if (message.action === "processFeedback") {
      const { jobId, feedback } = message;

      if (jobId && feedback) {
          fetch("http://<give_public_ip_of_ec2>:5000/submit-feedback", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ job_id: jobId, feedback: feedback }),
          })
          .then((response) => response.json())
          .then((data) => {
              console.log("Feedback submitted:", data);
          })
          .catch((error) => console.error("Error submitting feedback:", error));
      }
  } else if (message.action === "getSummary") {
      const { jobId } = message;

      if (jobId) {
          fetch(`http://<give_public_ip_of_ec2>:5000/get-summary?job_id=${jobId}`, {
              method: "GET",
              headers: { "Content-Type": "application/json" },
          })
          .then((response) => response.json())
          .then((data) => {
              chrome.runtime.sendMessage({ action: 'processedFeedback', summary: data });
          })
          .catch((error) => console.error("Error fetching summary:", error));
      }
  }

  else if (message.action === "setJobId"){

    var {jobId} = message;

    chrome.runtime.sendMessage({ action: 'sendJobIdToPopup', jobId: jobId });

  }

});

