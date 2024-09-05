const getPageContent = () => document.body.innerText;

const sendToOpenAI = async (content, apiKey) => {
  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content:
              "You are a helpful assistant that is meant to detect fake narratives that are constructed using real facts. Please analyze the following content and determine if it is a fake narrative. If it is, please explain why. If it is not, please explain why. Even if you don't have a concrete answer, try to educate the user on mechanisms by which narratives are shaped.",
          },
          {
            role: "system",
            content:
              "Response Format: (1) A summary of the content. (2) Context on the Author (3) A list of red flags. (4) A list of facts. (5) A list of questions.",
          },
          { role: "user", content: content },
        ],
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data.choices[0].message.content;
  } catch (error) {
    console.error("Error:", error);
    return "Error analyzing content: " + error.message;
  }
};

const analyzeContent = async () => {
  return new Promise((resolve) => {
    chrome.storage.local.get(["OPENAI_API_KEY"], async (result) => {
      if (!result.OPENAI_API_KEY) {
        resolve("Please set your OpenAI API Key in the extension popup.");
      } else {
        const content = getPageContent();
        const analysis = await sendToOpenAI(content, result.OPENAI_API_KEY);
        resolve(analysis);
      }
    });
  });
};

let isAnalysisRendered = false;

const updateHeaderStatus = (status) => {
  const statusDiv = document.getElementById("extension-status");
  if (statusDiv) {
    statusDiv.textContent = status;
  }
};

const renderContent = (content) => {
  const contentDiv = document.getElementById("extension-content");
  if (contentDiv) {
    contentDiv.textContent = content;
    contentDiv.style.display = "block";
  }
  isAnalysisRendered = true;
};

const analyzeAndRenderContent = async () => {
  updateHeaderStatus("Extension: Analyzing content...");
  const analysis = await analyzeContent();
  renderContent(analysis);
  updateHeaderStatus("Extension: Analysis complete");
};

const createHeaderBar = () => {
  const header = document.createElement("div");
  header.id = "extension-header";
  header.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      background: #f0f0f0;
      border-bottom: 1px solid #ccc;
      padding: 10px;
      z-index: 9999;
      display: flex;
      justify-content: space-between;
      align-items: center;
    `;

  const statusDiv = document.createElement("div");
  statusDiv.id = "extension-status";
  statusDiv.textContent = "Extension: Initializing...";

  const contentDiv = document.createElement("div");
  contentDiv.id = "extension-content";
  contentDiv.style.display = "none";

  header.appendChild(statusDiv);
  header.appendChild(contentDiv);

  document.body.insertBefore(header, document.body.firstChild);

  // Adjust the body to account for the header
  document.body.style.marginTop = `${header.offsetHeight}px`;

  analyzeAndRenderContent();
};

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "updateStatus") {
    updateHeaderStatus(request.status);
    sendResponse({ success: true });
    return true;
  }

  if (request.action === "analyze") {
    if (isAnalysisRendered) {
      const existingContent =
        document.getElementById("extension-content")?.textContent;
      sendResponse(existingContent || "Analysis already performed");
    } else {
      analyzeAndRenderContent();
    }
    return true;
  }
});

// Create the header bar when the content script loads
createHeaderBar();
