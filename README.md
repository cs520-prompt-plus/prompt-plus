## Project Overview

For our project, we want to create a website that enhances user prompts that are meant for LLM’s. We plan to follow prompt patterns that dictate an optimal prompt design. This tool can give users feedback in core areas, explaining how the prompt can be improved and incorporating these changes into a new prompt. This process will be an iterative one, as the user can continue to highlight sections they would like to rephrase or add additional context to.

We believe that this project can cater to a lot of people. Researchers that are testing the capabilities of LLM’s would benefit from optimized prompts. The general user of an LLM would also find this helpful as they would receive results that are more catered to their needs.

The use of LLM’s like ChatGPT has become incredibly prevalent. Our team has experience receiving vague responses that failed to address our requirements and expectations. Using this tool can create a quicker and more effective experience with an LLM. Through the explanation of prompt patterns, the user can also better understand the information
they should include in future prompts.

## Running the Project

1. Create your `.env` file in the root project directory, you can copy `.env.sample` as the base for this.
- Retrieve your Google Client ID and Secret via this instructions: https://developers.google.com/identity/gsi/web/guides/get-google-api-clientid
- Retrieve your OpenAI API Key via this instructions: https://help.openai.com/en/articles/4936850-where-do-i-find-my-openai-api-key
- Retrieve your NextAuth Secret via this instructions: https://next-auth.js.org/configuration/options

2. Run the following command to start the services
```sh
docker compose up -d --build
```

3. Access 
- Frontend at localhost:3000
- Prisma Studio at localhost:5555 
- Backend API Documentations at localhost:8000/docs

---

## File Structure

```
prompt-plus/
├── backend/
│   ├── app/
│   ├── prisma/
│   └── Dockerfile
├── frontend/
│   ├── src/
│   └── Dockerfile
├── .env
├── docker-compose.yml
├── docker-compose.prod.yml
└── BUILD.md
```
