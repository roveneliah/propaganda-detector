const apiKeyInput = document.getElementById('apiKeyInput');
const saveApiKeyButton = document.getElementById('saveApiKey');
const apiKeySection = document.getElementById('apiKeySection');
const analyzeButton = document.getElementById('analyze');
const resultDiv = document.getElementById('result');
const apiKeyStatus = document.getElementById('apiKeyStatus');

const checkApiKeyStatus = () => {
  chrome.storage.local.get(['OPENAI_API_KEY'], (result) => {
    if (result.OPENAI_API_KEY) {
      apiKeyStatus.textContent = 'API Key: Loaded';
      apiKeyStatus.style.color = 'green';
      apiKeySection.style.display = 'none';
      analyzeArticle();
    } else {
      apiKeyStatus.textContent = 'API Key: Not loaded';
      apiKeyStatus.style.color = 'red';
      apiKeySection.style.display = 'block';
    }
  });
};

const saveApiKey = () => {
  const apiKey = apiKeyInput.value.trim();
  if (apiKey) {
    chrome.storage.local.set({ OPENAI_API_KEY: apiKey }, () => {
      checkApiKeyStatus();
      resultDiv.textContent = 'API Key saved successfully!';
    });
  }
};

const analyzeArticle = () => {
  resultDiv.textContent = 'Analyzing article...';
  chrome.tabs.query({ active: true, currentWindow: true }, ([tab]) => {
    chrome.tabs.sendMessage(tab.id, { action: "analyze" }, (response) => {
      resultDiv.textContent = response || "No response from content script";
    });
  });
};

// Call checkApiKeyStatus when the popup is opened
document.addEventListener('DOMContentLoaded', checkApiKeyStatus);

saveApiKeyButton.addEventListener('click', saveApiKey);
analyzeButton.addEventListener('click', analyzeArticle);