chrome.action.onClicked.addListener((tab) => {
  chrome.scripting.executeScript({
    target: { tabId: tab.id },
    function: () => {
      console.log("Extension activated on this page");
    }
  });
});

const getApiKey = () => new Promise((resolve) => {
  chrome.storage.local.get(['OPENAI_API_KEY'], (result) => {
    resolve(result.OPENAI_API_KEY);
  });
});

// Usage example
getApiKey()
  .then((apiKey) => {
    console.log("API Key retrieved:", apiKey);
  })
  .catch((error) => {
    console.error("Error retrieving API key:", error);
  });