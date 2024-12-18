lets build enterprise RAG Application from scratch in 6 hrs

You will need the following tools:

- Cursor - you will use this to write the code
- FASTAPI - you will use this to build the API
- NEXTJS - you will use this to build the UI [ tailwindcss, shadcn/ui , serverless ]
- github actions - you will use this to deploy the application
- PINECONE - you will use this to store the vector embeddings
- OPENAI - you will use this to generate the embeddings
- Langchain/ LlamaIndex - you will use this to build the data extraction pipeline
- S3 for file storage
- Neondb for our postgres database

Planning stage:

ITs not just the LLM its but everything that wraps around the LLM and the user.

We will start with Business Goals for most Enterprise RAG applications.
What will the end user of the enterprise RAG application be able to see and do?

- Login page ( with working login credentials ) [ we cna use mannual login credentials for now, or can use OKTA or Auth0 ]
- Upload page ( which will hold the uplaod pipeline inclduing emebedding and status of the upload )
- Billing page ( which will hold the billing information and the billing history )
- Main RAG chat application page ( which will hold the RAG application and the RAG Chat history )
