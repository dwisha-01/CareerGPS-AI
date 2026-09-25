const { GoogleGenerativeAI } = require("@google/generative-ai");
require("dotenv").config();

const genAI = new GoogleGenerativeAI(
    process.env.GEMINI_API_KEY
);

const modelsToTest = [
    "gemini-2.5-flash",
    "gemini-2.0-flash",
    "gemini-3.5-flash"
];

async function testModels() {
    for (const modelName of modelsToTest) {
        console.log(`Testing model: ${modelName}...`);
        try {
            const model = genAI.getGenerativeModel({ model: modelName });
            const result = await model.generateContent("Give me 3 project ideas for a student interested in AI.");
            console.log(`SUCCESS for ${modelName}!`);
            console.log(result.response.text());
            console.log("-----------------------------------------");
        } catch (error) {
            console.log(`FAILED for ${modelName}:`, error.message || error);
            console.log("-----------------------------------------");
        }
    }
}

testModels();