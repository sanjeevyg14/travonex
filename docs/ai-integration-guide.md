# AI Integration & Local Setup Guide

This document explains the AI architecture of the Travonex platform and provides instructions for running the AI services locally for development and testing.

## 1. AI Architecture with Genkit

The AI features in this application, such as the **AI Planner**, are powered by **Genkit**, an open-source framework from Google. Genkit simplifies the development, testing, and deployment of AI-driven features.

-   **Flows:** A "flow" is a structured sequence of AI operations. For example, the `personalizedTripRecommendationsFlow` in `src/ai/flows/personalized-trip-recommendations.ts` defines the entire process of receiving a user's request, using tools to search for data, and generating a structured response.
-   **Tools:** Tools are special functions that you give to the AI, allowing it to interact with your application's data or external services. The `searchTrips` tool in `src/ai/tools/trip-tools.ts` is a perfect example. The AI doesn't know about trips directly; it only knows that it has a tool it can use to find them.
-   **Models:** Genkit handles the connection to the underlying Large Language Models (LLMs), like Google's Gemini.
-   **Developer UI:** Genkit includes a powerful local web interface where you can test your AI flows and, most importantly, view detailed traces of the AI's execution. This is invaluable for debugging, as it shows you exactly what the AI was thinking, which tools it decided to use, and what data it got back.

This architecture decouples the AI logic from the main application, making it easy to update the AI's capabilities or even switch out the underlying model without rewriting the entire feature.

## 2. Local AI Service Setup

To work on the AI features, you need to run the Genkit AI service in parallel with your main Next.js web application.

### Step 1: Set Up Your Environment Variable

The AI service requires an API key to communicate with Google's Gemini models.

1.  In the root directory of your project, locate the file named `.env`. If it doesn't exist, create it.
2.  Open the `.env` file and add the following line, replacing `your_gemini_api_key_here` with your actual API key obtained from Google AI Studio:

    ```
    GEMINI_API_KEY=your_gemini_api_key_here
    ```

    *Note: The `.env` file is included in `.gitignore` by default to prevent you from accidentally committing your secret key to a public repository.*

### Step 2: Run the Genkit and Next.js Services

You will need to open **two separate terminals** to run both services.

#### In Terminal 1: Start the Genkit AI Service

This command starts the local Genkit server and the developer UI. Your Next.js app will send requests to this service.

```bash
npm run genkit:dev
```

Once running, you can open **`http://localhost:4000`** in your browser to access the Genkit Developer UI. Here, you can test flows and see detailed traces of every AI interaction.

#### In Terminal 2: Start the Next.js Web Application

This is the main command to run the Travonex application that you see and interact with in the browser.

```bash
npm run dev
```

Your web application will be available at **`http://localhost:9002`**.

With both services running, you can now navigate to the AI Planner page, and it will be fully functional, communicating with your local Genkit AI service in the background.
