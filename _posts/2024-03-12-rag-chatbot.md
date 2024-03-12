# Chat with my blog: A RAG based chatbot that talks about me and my blog !
Large Language Models (LLMs) have revolutionized how we interact with information. They are quickly augmenting traditional search based methods for interacting with the Web, providing more natural sounding responses. My blog has been steadilty growing in size, which will make it necessary to have a way to search and extract information from it a necessity.

This gave me the perfect oppurtunity to implement a personal chatbot that can answer questions using my blog, and even about myself ! In this blog I will discuss about the core mechanisms powering my chatbot, as well some brief discussion about the actual implementation.


## Retreival Augmented Generation
Large Language Models (LLMs) excel at generating text based on given input. However, they face limitations in adapting to real-world scenarios because of the following reasons:

1. **Fixed Knowledge**: The knowledge of the model is limited to the data it was trained on. Hence asking questions outside of the training domain or "cut-off" date can lead to inaccurate answers.
2. **Lack of Citations**: These models generate answers without referencing specific parts of the dataset they draw from, making it challenging to attribute sources.
3. **Costly Training**: Training LLMs is a resource-intensive process, making frequent updates for domain-specific use cases economically impractical.

To address these challenges, Lewis et al introduced Retrieval-Augmented Generation (RAG), which enables LLMs to access external data during inference. This approach injects relevant knowledge into the model, leading to more grounded and accurate responses.

### Simple Question Answering RAG Setup

<p align="center">
   <figure>
   <img src= "/media/2023-12-03-llama2/rag_diagram.png" alt = "Diagram of a simple RAG System">
   <figcaption>A simple RAG setup.
</figcaption>
   </figure>
</p>

A simple Question Answering RAG system has the following modules:

1. **Parser + Chunker**: This module parses and breaks down external text data into smaller, digestible chunks.
2. **Embedding Model**: It generates vector representations from these text chunks.
3. **Vector Database**: This stores the generated embeddings, facilitating efficient retrieval based on vector similarity.
4. **Generation Model**: The base LLM responsible for generating responses.

Setting up a RAG system involves ingesting external knowledge and preparing it for use:

- Parse external text data and chunk it for embedding.
- Convert these chunks into vectors and store the text, vector pairs in the Vector Database.

Once setup, users can query the system for answers. When a user query is received, the system follows these steps:
- Embed the user query into a query vector.
- Retrieve relevant text chunks from the database based on vectors similar to the query vector.
- Generate a response using a prompt derived from the user query and retrieved text chunks.

### Q&A with chat history
While the above setup works well for independent queries, what if we want our chatbot to reference previous conversations alongside external knowledge?

To accommodate this, we can enhance the querying stage to incorporate chat history:

- Use the generation model to generate a standalone query that incorporates both the user query and the chat history.
- Follow the standard querying flow to retrieve and generate responses.


## Personal Chatbot Implementation
Rather than starting from scratch, I built the chatbot on top of the excellent [`chat-langchain`](https://github.com/langchain-ai/chat-langchain) github repo.

This repo contains codebase of the chatbot `LangChain` has built for it's documentation and deployed at [`chat.langchain.com`](https://chat.langchain.com/). They has used LangChain, FastAPI and NextJS to build the chatbot, and have predefined scripts for ingestion and querying logic.

My implementation incorporates the following technologies:

1. **Backend**:
    - Utilizing LangChain for RAG logic.
    - Serving API endpoints using FastAPI and LangServe.
    - Employing Chroma as a self-hosted Vector Database.
    - Integrating Together AI for embedding and answer generation.
    - Enhancing modularity and maintainability through code refactoring.
    - Implementing Unstructured IO for parsing during ingestion.
2. **Frontend**:
    - Developing a user-friendly interface with NextJS and Chakra UI.
    - Interacting with backend APIs via LangchainJS.
    - Customizing example prompts and page contents for a personalized touch.
    - Adding social media links to the footer for enhanced connectivity.
3. **Deployment**:
    - Employing Docker and Docker Compose for lightweight and efficient deployment.