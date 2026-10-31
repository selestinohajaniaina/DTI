# DTI — DON'T TRASH IT

**Give unwanted objects a second life with AI.**

DTI (DON'T TRASH IT) is an AI upcycling platform that helps people discover creative and practical ways to reuse objects they would otherwise throw away.

Instead of treating waste as the end of an object's life, DTI turns a simple photograph into new possibilities: creative reuse ideas, illustrated results, step-by-step tutorials, and estimated costs.

**Built from scratch starting October 26, 2026, during the Meta Global AI Developer Hackathon.**

<p align="center">
  <a href="https://dti-ai.vercel.app/">Live Application</a> ·
  <a href="https://github.com/selestinohajaniaina/DTI-Backend">Backend Repository</a> ·
  <a href="[DEMO_VIDEO_URL]">Demo Video</a>
</p>

---

## THE PROBLEM

Many objects are thrown away simply because people do not know what else they could become. As a result, these discarded objects accumulate in the environment, contributing to pollution and increasing the amount of waste that threatens our ecosystems.

An empty plastic bottle, an old container, or an unused household item may still have potential. However, imagining a useful second life and knowing how to create it are not always easy.

**The challenge is not only waste itself — it is the lack of accessible inspiration and practical guidance for reusing it.**

## THE SOLUTION

DTI makes upcycling more accessible through AI.

Users simply upload or take a photograph of an unwanted object. DTI analyzes the object and generates creative reuse ideas, each accompanied by an illustration and practical instructions.

The goal is to transform the question:

*“Should I throw this away?”*

Into:

*“What could I create with this?”*

## FEATURE

- **Photo-based object analysis:** Upload an image of an unwanted object and let AI identify its characteristics.
- **AI-generated upcycling ideas:** Discover multiple creative and practical ways to give the object a second life.
- **AI-generated illustrations:** Visualize what each reuse idea could look like.
- **Step-by-step tutorials:** Get materials, tools, instructions, estimated duration, and safety notes.
- **Estimated costs:** Explore AI-generated cost and potential selling-price estimates in USD. These are approximate estimates, not verified market prices.
- **Generated ideas library:** Browse previously saved ideas with search, filtering, sorting, and pagination.
- **Anonymous access:** Explore the generation experience without requiring an account.

## META AI MODEL IN THE APP

DTI uses Meta AI models as the core of its photo-to-upcycling workflow.

| Meta model | Role in DTI |
|---|---|
| **Muse Spark (`muse-spark-1.3`)** | Analyzes the uploaded object and generates structured upcycling ideas, descriptions, and tutorials. |
| **Muse Image (`muse-image-1.0`)** | Creates illustrations for the generated ideas, using the original uploaded photo as a visual reference. |

### HOW DTI WORKS

1. The user uploads a photograph.
2. The backend sends the image to **Muse Spark** for analysis and idea generation.
3. The backend validates and processes the generated ideas.
4. **Muse Image** generates an illustration for each idea.
5. The application displays the ideas, illustrations, tutorials, and estimated costs.
6. The generated results are saved for later access through the ideas library.

All Meta API requests are handled by the backend. API credentials are never exposed in the frontend.

## DEMO

**Watch video demo of DTI on:** [Demo Video — Coming Soon]( [DEMO_VIDEO_URL] )

The demonstration focuses on the working application: uploading an unwanted object, generating creative reuse ideas, viewing AI-generated illustrations, and exploring practical instructions.

## ARCHITECTURE

DTI is organized into two independent repositories:

| Component | Technology | Repository |
|---|---|---|
| Frontend | Angular 21, TypeScript, Tailwind CSS v4 | [DTI](https://github.com/selestinohajaniaina/DTI) |
| Backend | Node.js, Express 5, TypeScript, Sequelize 6 | [DTI-Backend](https://github.com/selestinohajaniaina/DTI-Backend) |
| Database | PostgreSQL | Managed by the backend |
| AI | Meta Muse Spark and Muse Image | Accessed server-side |

### Frontend structure

```text
src/
  app/
    core/
    shared/
      components/
    services/
      api.service.ts
    features/
      home/
      results/
      how-it-works/
      generated-ideas/
    app.config.ts
    app.routes.ts
  styles.css
```

The Angular application communicates with the backend through HTTP services. The backend handles AI requests, persistence, and generated image storage.

## TEST LOCAL

### REQUIREMENT

- Node.js `^20.19.0 || ^22.12.0 || >=24.0.0`
- npm 11
- A running DTI backend instance

### 1. Clone the frontend

```bash
git clone https://github.com/selestinohajaniaina/DTI.git
cd DTI
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure the backend URL

Make sure the frontend API service points to a running DTI backend.

For local development, the backend default URL is:

```text
http://127.0.0.1:3000
```

For the deployed application, the backend is hosted separately.

See the [https://github.com/selestinohajaniaina/DTI-Backend](https://github.com/selestinohajaniaina/DTI-Backend) for backend installation, database configuration, and environment variables.

### 4. Start the development server

```bash
npm start
```

Open [http://localhost:4200](http://localhost:4200).

## OUR SECURITY

- Meta API credentials are stored on the backend only.
- The frontend never receives the Meta API key.
- Uploaded images and generated illustrations are handled by the backend.
- Authentication and ownership mechanisms are managed server-side.

> **NB:** During the development of DTI, we used **Muse Code with `muse-spark-1.3-contributor · max` as AI agent development** to assist with coding, implementation, debugging, and improving the project.