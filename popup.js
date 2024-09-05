const apiKeyInput = document.getElementById("apiKeyInput");
const saveApiKeyButton = document.getElementById("saveApiKey");
const apiKeySection = document.getElementById("apiKeySection");
const analyzeButton = document.getElementById("analyze");
const resultDiv = document.getElementById("result");
const apiKeyStatus = document.getElementById("apiKeyStatus");

const updateContentScriptStatus = (status) => {
  chrome.tabs.query({ active: true, currentWindow: true }, ([tab]) => {
    chrome.tabs.sendMessage(tab.id, { action: "updateStatus", status: status });
  });
};

const checkApiKeyStatus = () => {
  chrome.storage.local.get(["OPENAI_API_KEY"], (result) => {
    if (result.OPENAI_API_KEY) {
      apiKeyStatus.textContent = "API Key: Loaded";
      apiKeyStatus.style.color = "green";
      apiKeySection.style.display = "none";
      analyzeArticle();
      updateContentScriptStatus("Analyzing article...");
    } else {
      apiKeyStatus.textContent = "API Key: Not loaded";
      apiKeyStatus.style.color = "red";
      apiKeySection.style.display = "block";
      updateContentScriptStatus("Extension: API Key not set");
    }
  });
};

const saveApiKey = () => {
  const apiKey = apiKeyInput.value.trim();
  if (apiKey) {
    chrome.storage.local.set({ OPENAI_API_KEY: apiKey }, () => {
      checkApiKeyStatus();
      resultDiv.textContent = "API Key saved successfully!";
      updateContentScriptStatus("Extension: API Key saved");
    });
  }
};

const analyzeArticle = () => {
  resultDiv.textContent = "Analyzing article...";
  // updateContentScriptStatus('Extension: Analyzing content...');
  chrome.tabs.query({ active: true, currentWindow: true }, ([tab]) => {
    chrome.tabs.sendMessage(tab.id, { action: "analyze" }, (response) => {
      if (response) {
        resultDiv.textContent =
          "Analysis complete. Check the page for results.";
        updateContentScriptStatus(null);
      } else {
        resultDiv.textContent = "No response from content script";
        updateContentScriptStatus("Extension: Analysis failed");
      }
    });
  });
};

// Add this line to attach the event listener for the save button
saveApiKeyButton.addEventListener("click", saveApiKey);

// Make sure this line is present to check the API key status when the popup opens
document.addEventListener("DOMContentLoaded", checkApiKeyStatus);

// Add event listener for the analyze button
analyzeButton.addEventListener("click", analyzeArticle);
