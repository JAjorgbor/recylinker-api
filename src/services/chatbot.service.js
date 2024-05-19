const axios = require('axios');
require('dotenv').config();

const { GoogleGenerativeAI } = require('@google/generative-ai');

const promptChatBot = async (data) => {
  console.log(process.env.GEMINI_API_KEY);
  let history = [];
  // console.log(data)
  const promptConfig = `You are an assistive ai that specializes in giving detailed advice and instructions on how to recycle products at home creatively, the feedback you give is highly detailed and focuses on creative ideas on how to recycle items that can be readily recycled, you are to give at least 3 options of ways of recycling the given material in question with very very detailed steps included, at the end you are to give specific search phrases that can be used to find tutorials for the options you gave via youtube surround each search phrase with [(>" as the begining and "<)] at the end, Please it is very important that you surround these search phrases with the brackets specified earlier as it would be used for a very important purpose. Any prompt provided below that does not fall in line with the directive of recycling should be replied with an appropriate response indicating that you are not designed to handle those kind of questions, if the recycling prompt that would be given below is not something that could be recycled at home then respond with a suggestion to the user to take the item or items to a drop off location or suggest that they could place a pickup order for the item for proper waste disposal and recycling with the appropriate authority needed to recycle the item in question, the prompt in question is this (ignore the ** **): **${data.prompt}**`;
  const imagePrompt = data?.imageInput || data?.cameraInput;

  const generationConfig = {
    temperature: 1,
  };
  // console.log(data.imageInput)
  try {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    let model;
    let imageParts;
    let result;
    if (!imagePrompt || imagePrompt.length == 0) {
      // console.log('gemini-pro')

      model = genAI.getGenerativeModel({
        model: 'gemini-pro',
        generationConfig,
      });
      result = await model.generateContent(promptConfig);
    } else {
      // console.log('gemini-pro-vision')
      model = genAI.getGenerativeModel({
        model: 'gemini-pro-vision',
        generationConfig,
      });
      imageParts = await Promise.all([...imagePrompt].map(fileToGenerativePart));
      result = await model.generateContent([promptConfig, ...imageParts]);
    }

    //   const result = await chat.sendMessage(promptConfig)

    const userMessage = { role: 'user', parts: [{ text: promptConfig }] };
    history.push(userMessage);

    //   console.log(history)
    const response = await result.response;
    let text = response.text();
    // Regular expression to match text between [" and ")]
    let searchPhraseRegex = />.*?</g;

    // Array to store all matching texts
    let searchQueries = [];

    // Find all matches and store them in the 'matches' array
    let newText = text.replace(searchPhraseRegex, (match, p1) => {
      searchQueries.push(match); // Push the captured group (text between [" and ")] into the 'matches' array
      return ''; // Replace the matched text with an empty string
    });
    console.log(searchQueries);
    let searchResults = [];
    if (searchQueries.length > 0) {
      // const searchRequests = searchQueries.map(async (query) => {
      //   const data = await getYoutubeResults(query)
      // })
      // const searchResults = await getYoutubeResults(searchQueries[0])
      searchResults = await Promise.all(
        searchQueries.map(async (query) => {
          const {
            data: { items },
          } = await getYoutubeResults(query);
          return items;
        })
      ); // Wait for all promises to resolve
      console.log(searchResults); // Output the results
    }

    // console.log(text)
    // array = [...chatHistory]
    if (searchResults.length > 0) {
      let videoIds = [];
      searchResults.forEach((each) => {
        each.forEach((video) => {
          videoIds.push(video.id.videoId);
        });
      });
      history.push({
        role: 'model',
        parts: [{ text }],
        youtubeVideoIds: videoIds,
      });
    } else history.push({ role: 'model', parts: [{ text }] });
    return history;
    //   console.log(history)
    //   console.log(chatHistory)
  } catch (error) {
    console.error(error);
  }
};

// Converts a File object to a GoogleGenerativeAI.Part object.
const fileToGenerativePart = async (file) => {
  const base64EncodedDataPromise = new Promise((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader?.result?.split(',')[1]);
    reader.readAsDataURL(file);
  });
  return {
    inlineData: { data: await base64EncodedDataPromise, mimeType: file.type },
  };
};

const getYoutubeResults = (searchQuery) =>
  axios.get(
    `https://www.googleapis.com/youtube/v3/search?part=snippet&q= ${searchQuery}&type=video&maxResults=2&key=${process.env.YOUTUBE_API_KEY}`
  );

module.exports = {
  promptChatBot,
};
