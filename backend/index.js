let express = require('express');
let cors = require('cors');
require('dotenv').config();
let { GoogleGenerativeAI } = require('@google/generative-ai');
let app = express();
app.use(cors());
app.use(express.json());

let apiKey = process.env.GOOGLE_API_KEY || process.env.KEY;
if (!apiKey) {
    console.error("WARNING: No Gemini API Key found in env variables GOOGLE_API_KEY or KEY.");
}
let genAI = new GoogleGenerativeAI(apiKey);
async function generateWithFallbackAndRetry(question, retries = 2, delayMs = 1000) {
    const modelsToTry = [
        "gemini-2.5-flash",
        "gemini-2.5-flash-lite",
        "gemini-flash-latest"
    ];

    let lastError = null;

    for (const modelName of modelsToTry) {
        let attempt = 0;
        while (attempt < retries) {
            try {
                console.log(`Attempting generateContent using model: ${modelName} (attempt ${attempt + 1}/${retries})`);
                const model = genAI.getGenerativeModel({ model: modelName });
                const data = await model.generateContent(question);
                return data; // Success!
            } catch (err) {
                lastError = err;
                console.warn(`Model ${modelName} failed on attempt ${attempt + 1}: ${err.message}`);

                attempt++;
                if (attempt < retries) {
                    await new Promise(resolve => setTimeout(resolve, delayMs));
                }
            }
        }
    }

    throw lastError || new Error("Failed to generate content after trying all fallback models");
}

app.post('/chat', async (req, res) => {
    try {
        let { question } = req.body;
        if (!question) {
            return res.status(400).send({
                _status: false,
                _message: "question is required"
            });
        }
        let data = await generateWithFallbackAndRetry(question);
        let finaldata = data.response.text();
        res.send({
            _status: true,
            _message: "content found",
            finaldata
        });
    } catch (error) {
        console.error("Error generating content:", error);
        res.status(500).send({
            _status: false,
            _message: error.message || "Internal server error during content generation"
        });
    }
});

const PORT = process.env.PORT || 5000;
if (require.main === module) {
    app.listen(PORT, function () {
        console.log('Server is running on port ' + PORT);
    });
}

module.exports = app;