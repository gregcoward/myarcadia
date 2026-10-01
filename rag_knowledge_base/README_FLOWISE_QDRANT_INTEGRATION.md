# Flowise & Qdrant Integration Guide for Red Sea Lab Bank RAG

This directory contains sample RAG (Retrieval-Augmented Generation) knowledge base files formatted for seamless ingestion into **Flowise AI** and **Qdrant Vector Database**.

---

## 📐 Qdrant Vector Dimension Reference

The Qdrant collection **vector dimension size** must match the **Embedding Model** configured in Flowise:

| Embedding Provider | Model Name | Qdrant Vector Dimension | Recommended Distance Metric |
| :--- | :--- | :---: | :---: |
| **OpenAI** (Recommended) | `text-embedding-3-small` | **1536** | Cosine |
| **OpenAI** | `text-embedding-3-large` | **3072** | Cosine |
| **OpenAI** (Legacy) | `text-embedding-ada-002` | **1536** | Cosine |
| **Ollama / Local** | `nomic-embed-text` | **768** | Cosine |
| **Ollama / Local** | `mxbai-embed-large` | **1024** | Cosine |
| **HuggingFace / BGE** | `BAAI/bge-small-en-v1.5` | **384** | Cosine |
| **HuggingFace / BGE** | `BAAI/bge-base-en-v1.5` | **768** | Cosine |
| **HuggingFace / BGE** | `BAAI/bge-large-en-v1.5` | **1024** | Cosine |
| **Google Vertex / Gemini** | `text-embedding-004` | **768** | Cosine |
| **Cohere** | `embed-english-v3.0` | **1024** | Cosine |

> **Note**: If you let Flowise auto-create the Qdrant collection during the "Upsert" step, Flowise sets the dimension automatically based on the connected Embeddings node.

---

## 📁 Knowledge Base Files Overview

| File Name | Content Description | Best Flowise Chunk Size |
| :--- | :--- | :--- |
| `01_account_products_and_rates.txt` | Account tiers (Premium & Standard), APY interest rates, checking/savings specs, fee schedules. | 500 characters (overlap 50) |
| `02_transfers_and_digital_banking.txt` | Internal wire transfers (`/api/v1/transfer`), ACH limits, mobile banking, MFA, security. | 500 characters (overlap 50) |
| `03_referral_program_and_promotions.txt` | Refer-a-Friend rules, $50 cash rewards, referral links (`/app3/referral`), terms. | 400 characters (overlap 40) |
| `04_technical_architecture_and_faqs.txt` | Microservices breakdown (`/`, `/files`, `/api`, `/app3`), OpenShift non-root specs, Q&A FAQs. | 500 characters (overlap 50) |
| `redsea_lab_bank_knowledge_base_full.txt` | **Master Combined Document** containing all 4 sections in a single file. | 600 characters (overlap 100) |

---

## 🚀 How to Ingest into Flowise & Qdrant

### Step 1: Flowise Canvas Setup
In your Flowise UI, build or edit your Chatflow canvas with the following nodes:
1. **Document Loader**: Add a **Text File / File Loader** or **Folder Loader** node.
2. **Text Splitter**: Attach a **Recursive Character Text Splitter** node (Chunk Size: `500`, Chunk Overlap: `50`).
3. **Embeddings Model**: Attach an **OpenAI Embeddings** node (`text-embedding-3-small` -> 1536 dim) or your chosen model.
4. **Vector Store**: Attach a **Qdrant Vector Store** node.
   - **Qdrant Server URL**: `https://your-qdrant-instance:6333` (or local Qdrant container endpoint)
   - **Collection Name**: `redsea_lab_bank_kb`
5. **Conversational Retrieval QA Chain**: Connect the Qdrant Vector Store to a **Conversational Retrieval QA Chain** or **Retrieval QA Chain** linked to your Chat Model (e.g. OpenAI `gpt-4o` or local LLM).

### Step 2: Upload Knowledge Base Text Files
1. Drag and drop `redsea_lab_bank_knowledge_base_full.txt` (or individual `.txt` files from this folder) into the **File Loader** node in Flowise.
2. Click the green **Upsert Vector Database** button in Flowise top-right corner.
3. Flowise will split the text, compute vector embeddings, and populate your Qdrant collection `redsea_lab_bank_kb`.

### Step 3: Test Chatbot Retrieval
Ask the chatbot questions in Flowise Chat:
- *"What is the APY interest rate on Premium Tier savings?"*
- *"How does the $50 Refer-a-Friend program work?"*
- *"What is the daily transfer limit for checking accounts?"*
- *"Which microservice handles money transfers?"*

The chatbot will retrieve exact context chunks from Qdrant and provide grounded, accurate responses!
