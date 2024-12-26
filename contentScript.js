function addInputListeners() {
  
  document.getElementById("submit-job-feedback").onclick = function (){

    var jobId;

    if(window.location.href.indexOf('/jobs/collections/recommended/?') !== -1){
      const url_extracted = new URL(window.location.href);
      jobId = url_extracted.searchParams.get("currentJobId");
    }
    else if(window.location.href.indexOf('/jobs/search/') !== -1){
      const url_extracted = new URL(window.location.href);
      jobId = url_extracted.searchParams.get("currentJobId");
    }

    var feedback = document.getElementById("feedback-text").value;

    // Send a message to the background script to use AWS SDK and perform actions
    chrome.runtime.sendMessage({ action: 'processFeedback', jobId: jobId, feedback: feedback });


  };
}

function injectFeedbackDiv() {
  const feedback_box = `

    <textarea id="feedback-text" style="height:100px; width:vw; 
    border:1px solid white; padding-left:2px; 
    padding-top:2px; margin-top: 10px;
    resize:none;" placeholder="Enter your feedback">
    </textarea>

    <button id="submit-job-feedback" style="color:white; 
    border:1px solid white; background:green; margin-top: 5px; padding:5px; border-radius:10px">Submit Feedback</button>


  `;

  const targetDiv = document.querySelector('.mt4');

  if (targetDiv) {
    // Inject modalHTML after the target div
    targetDiv.insertAdjacentHTML('afterend', feedback_box);
  } else {
      console.error('Target div not found.');
  }
  
}




window.addEventListener('load', () => {


  if (window.location.href.indexOf('/jobs/collections/recommended/?') !== -1 || window.location.href.indexOf('/jobs/search/') !== -1) {
    
    const url_extracted = new URL(window.location.href);
    var jobId = url_extracted.searchParams.get("currentJobId");
    chrome.runtime.sendMessage({ action: 'setJobId', jobId: jobId });

    injectFeedbackDiv();
    addInputListeners();

    const observer = new MutationObserver(() => {
      addInputListeners();
    });

    observer.observe(document.body, { childList: true, subtree: true });
  }
});
