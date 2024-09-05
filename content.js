const getPageContent = () => document.body.innerText;

const sendToOpenAI = async (content, apiKey) => {
  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: "gpt-4",
        messages: [
          { 
            role: "system", 
            content: "You are a helpful assistant that is meant to detect fake narratives that are constructed using real facts. Please analyze the following content and determine if it is a fake narrative. If it is, please explain why. If it is not, please explain why. Even if you don't have a concrete answer, try to educate the user on mechanisms by which narratives are shaped."
          },
          { role: "user", content: content }
        ]
      })
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data.choices[0].message.content;
  } catch (error) {
    console.error('Error:', error);
    return "Error analyzing content: " + error.message;
  }
};

const analyzeContent = async () => {
  return new Promise((resolve) => {
    chrome.storage.local.get(['OPENAI_API_KEY'], async (result) => {
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

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "analyze") {
    analyzeContent().then(sendResponse);
    return true; // Indicates that the response is asynchronous
  }
});

