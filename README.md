## Project Overview

For our project, we want to create a website that enhances user prompts that are meant for LLM’s. We plan to follow prompt patterns that dictate an optimal prompt design. This tool can give users feedback in core areas, explaining how the prompt can be improved and incorporating these changes into a new prompt. This process will be an iterative one, as the user can continue to highlight sections they would like to rephrase or add additional context to.

We believe that this project can cater to a lot of people. Researchers that are testing the capabilities of LLM’s would benefit from optimized prompts. The general user of an LLM would also find this helpful as they would receive results that are more catered to their needs.

The use of LLM’s like ChatGPT has become incredibly prevalent. Our team has experience receiving vague responses that failed to address our requirements and expectations. Using this tool can create a quicker and more effective experience with an LLM. Through the explanation of prompt patterns, the user can also better understand the information
they should include in future prompts.

## Running the Project

1. Navigate to the back_end directory and start the services:

Create your `.env` file in the backend project directory, you can copy `.env.sample` as the base for this.

```sh
cd back_end
docker compose up -d
```

2. Navigate to the front_end directory and start the services:

```sh
cd front_end
npm install
npm run dev
```

docker compose down -v
docker compose up -d --build
docker system prune --all --volumes

Generate New Prompt
Evaluate the Result to Refine the Prompt
Multi-step Prompting
Handle Edge Cases and Ambiguous Input
Detect Vague, Ambiguous, or Typo-ridden Prompts
add save response
