const { GoogleGenerativeAI } = require("@google/generative-ai");
require("dotenv").config();

const genAI = new GoogleGenerativeAI(
    process.env.GEMINI_API_KEY
);

async function testGemini() {

    const model = genAI.getGenerativeModel({
        model: "gemini-2.5-flash"
    });

    const result = await model.generateContent(
        "Give me 3 project ideas for a student interested in AI."
    );

    console.log(result.response.text());
}

testGemini();