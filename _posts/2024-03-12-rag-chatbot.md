# Chat with my blog: A RAG based chatbot that talks about me and my blog !
Intro about chat chatbots and why you decided to create one for your blog

## Retreival Augmented Generation
Large Language Models (LLMs) like ChatGPT or Misral are state of the art "next token" generators. Given a string of text, they predict more words to comlete the text.
This allows us to prompt these models to fullfill a wide range of tasks by using different prompting strategies to achieve classification, sentiment analysis, summarization etc.
However, unaided, these models also suffer from some drawbacks which limit their adaptibility in the real world:

1. **Fixed Knowledge**: The knowledge of the model is limited to the data it was trained on. Hence asking questions outside of the training domain or "cut-off" date can lead to inaccurate answers.
2. No citations: Since these models generate answers based on the entire dataset they were trained on, it's hard to attribute or cite the parts of the dataset that the model found relevant.
3. Expensive: It's quite expensive to train a base language model.  So updating a model's knowledge via training/retraining for every specific domain use case becomes expensive.

To overcome these limitations Lewis et al[1] introduced Retreival Augmented Generation commonly shortened to RAG.
A RAG based system allows LLMs to access additional external data alongside the internal data they were trained on. This allows relevant knowledge to be injected during the inference phase, leading to more accurate and grounded answers.

A typical RAG setup is shown below:

<p align="center">
   <figure>
   <img src= "/media/2023-12-03-llama2/rag_diagram.png" alt = "Diagram of a simple RAG System">
   <figcaption>A simple RAG setup.
</figcaption>
   </figure>
</p>

A simple RAG system typically consists of the following modules:

1. Parser + Chunker: This module parses the external text data and splits it into smaller chunks ideal for the embedding.
2. Embedding Model:  This model is used to generate vector embeddings from chunks of input text.
3. Vector Database: This is used to store the embeddings generated from the embedding model. These usually come equipped with a vector similarity based querying method.
4. Generation Model: This is base LLM we used for generating our answers.

A typical RAG flow looks like following:
1. Ingestion:
    - Ingest all the external data using the Parser and split them into smaller chunks.
    - Embed all these chunks into vectors using the embedding model and store them in the Vector Databse
2. Querying:
    - Take the user query and embed it into a query vector
    - By using vector similarity search, find the top `k` most similar vector embeddings and retreive their corresponding text.
    - Create a new prompt using the original user query as well as retreived text chunks and use them to generate an answer.


## RAG Frameworks
Talk briefly about the various frameworks that exist for creating a rag chatbot, and what made me pick langchain.

## chat-langchain repo
What is this repo, and why this was a good starting point rather than starting from scratch.
1-2 line summary about what we use directly vs what we modify.

## Backend
- Langchain chain
- Langserve + FastAPI
- Langfuse integration

## Frontend
 - NextJS + Chakra UI
 - langchainJS

## Deployment
 - Multi stage docker builds