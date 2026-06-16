const User = require("../models/User");
const Analysis = require("../models/Analysis");
const pdf = require("pdf-parse");

const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(
    process.env.GEMINI_API_KEY
);

const generateAnalysis = async (req, res) => {
    try {

        const { targetRole } = req.body;

        const user = await User.findById(req.user.id);

        if (!user) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        const model = genAI.getGenerativeModel({
            model: "gemini-2.5-flash"
        });

        const prompt = `
You are a career guidance AI.

Analyze the following student profile and target role.

Return ONLY valid JSON in the following format:

{
  "readinessScore": number,
  "skillGaps": [],
  "roadmap": [
    {
      "period": "",
      "focus": "",
      "activities": []
    }
  ],
  "projects": [
    {
      "name": "",
      "description": ""
    }
  ]
}

Student Profile:

College: ${user.college}
Year: ${user.year}
Branch: ${user.branch}

Skills:
${user.skills.join(", ")}

Interests:
${user.interests.join(", ")}

Target Role:
${targetRole}
`;

        const result = await model.generateContent(prompt);

        let responseText = result.response.text();

        // Remove markdown formatting if Gemini adds it
        responseText = responseText
            .replace(/```json/g, "")
            .replace(/```/g, "")
            .trim();

        // Convert JSON string to JavaScript object
        const analysisData = JSON.parse(responseText);

        // Save analysis to MongoDB
        const analysis = new Analysis({
            userId: user._id,
            targetRole,

            readinessScore: analysisData.readinessScore,

            skillGaps: analysisData.skillGaps,

            roadmap: analysisData.roadmap,

            projects: analysisData.projects
        });

        await analysis.save();

        res.status(200).json({
            message: "Analysis generated successfully",
            analysis
        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            message: "Server Error",
            error: error.message
        });

    }
};
const getAnalysisHistory = async (req, res) => {
    try {

        const analyses = await Analysis.find({
            userId: req.user.id
        }).sort({ createdAt: -1 });

        res.status(200).json(analyses);

    } catch (error) {

        console.error(error);

        res.status(500).json({
            message: "Server Error"
        });

    }
};

const analyzeResume = async (req, res) => {
    try {
        const { targetRole, targetCompany } = req.body;

        if (!req.file) {
            return res.status(400).json({
                message: "No resume file uploaded"
            });
        }

        let resumeText = "";
        if (req.file.mimetype === "application/pdf") {
            const parsedPdf = await pdf(req.file.buffer);
            resumeText = parsedPdf.text;
        } else {
            resumeText = req.file.buffer.toString("utf8");
        }

        const model = genAI.getGenerativeModel({
            model: "gemini-2.5-flash"
        });

        const prompt = `
You are a career guidance AI.

Analyze the following resume and target role/company to provide a readiness score (0-100), identify skill gaps, provide a step-by-step roadmap to prepare, and recommend target projects.

Return ONLY valid JSON in the following format:

{
  "readinessScore": number,
  "skillGaps": [],
  "roadmap": [
    {
      "period": "",
      "focus": "",
      "activities": []
    }
  ],
  "projects": [
    {
      "name": "",
      "description": ""
    }
  ]
}

Resume Content:
${resumeText}

Target Role:
${targetRole}

Target Company:
${targetCompany || "N/A"}
`;

        const result = await model.generateContent(prompt);
        let responseText = result.response.text();

        responseText = responseText
            .replace(/```json/g, "")
            .replace(/```/g, "")
            .trim();

        const analysisData = JSON.parse(responseText);

        const analysis = new Analysis({
            userId: req.user.id,
            targetRole,
            targetCompany: targetCompany || "N/A",
            readinessScore: analysisData.readinessScore,
            skillGaps: analysisData.skillGaps,
            roadmap: analysisData.roadmap,
            projects: analysisData.projects
        });

        await analysis.save();

        res.status(200).json({
            message: "Analysis generated successfully",
            analysis
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Server Error",
            error: error.message
        });
    }
};

const updateAnalysisProgress = async (req, res) => {
    try {
        const { completedActivities } = req.body;

        const analysis = await Analysis.findOne({
            _id: req.params.id,
            userId: req.user.id
        });

        if (!analysis) {
            return res.status(404).json({
                message: "Assessment report not found"
            });
        }

        analysis.completedActivities = completedActivities || [];
        await analysis.save();

        res.status(200).json({
            message: "Progress updated successfully",
            analysis
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Server Error",
            error: error.message
        });
    }
};

const rewriteBulletPoint = async (req, res) => {
    try {
        const { bulletPoint, targetRole, targetCompany } = req.body;

        if (!bulletPoint || !bulletPoint.trim()) {
            return res.status(400).json({
                message: "Bullet point text is required"
            });
        }

        const model = genAI.getGenerativeModel({
            model: "gemini-2.5-flash"
        });

        const prompt = `
You are a professional resume writer and ATS optimization specialist.
Rewrite the following resume bullet point using the Google XYZ formula:
"Accomplished [X] as measured by [Y], by doing [Z]" (Action-Measure-Result).

Make it sound highly impactful, start with a strong action verb, and include metrics where possible.
If a target role or company is provided, align the keywords and technology context with that role/company standards.

Provide exactly 3 high-impact variations (e.g. basic improvement, numerical impact focus, leadership/scale focus).
Return ONLY JSON in this format (no markdown blocks, no extra text):
{
  "variations": [
    "variation 1",
    "variation 2",
    "variation 3"
  ]
}

Target Role: ${targetRole || "General Software Engineer"}
Target Company: ${targetCompany || "N/A"}

Current Bullet Point:
"${bulletPoint}"
`;

        const result = await model.generateContent(prompt);
        let responseText = result.response.text();

        responseText = responseText
            .replace(/```json/g, "")
            .replace(/```/g, "")
            .trim();

        const data = JSON.parse(responseText);

        res.status(200).json({
            message: "Bullet point optimized successfully",
            variations: data.variations || []
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Server Error",
            error: error.message
        });
    }
};

module.exports = { generateAnalysis, getAnalysisHistory, analyzeResume, updateAnalysisProgress, rewriteBulletPoint };