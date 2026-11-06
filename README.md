# Timpla (Davao Café Intelligence)

A research prototype for Aspect-Based Sentiment Analysis (ABSA) on code-switched (Taglish / Bislish) customer reviews of Davao City cafés.

---

## Architecture Overview

```
Frontend (React 19 + Vite)  -->  FastAPI Backend (:8000)  -->  SQLite (thesis.db)
     [Port: 8443]                       |
                                        v
                            BentoML Service (:3000)
                         [XLM-RoBERTa PyTorch Model]
```

* **Frontend:** React 19, TypeScript, Tailwind CSS v4, Vite.
* **Backend API:** FastAPI with SQLite (`thesis.db`) queried via SQL/Pandas.
* **Model Inference:** BentoML service hosting fine-tuned XLM-RoBERTa sequence classification checkpoints.

---

## Prerequisites

1. **Node.js** (v18+) with `pnpm` (or `npm`)
2. **Anaconda / Miniconda** with Python 3.11

---

## 1. Environment Setup

### Conda Backend Environment
```powershell
conda create -n thesis_backend python=3.11 -y
conda activate thesis_backend
pip install fastapi uvicorn pandas bentoml torch transformers httpx sqlalchemy
```

### Frontend Dependencies
```powershell
npx pnpm install
# or: npm install
```

---

## 2. Database Ingestion

Seed the SQLite database from your review dataset (`data/DB_master_reviews_with_sentiment.csv`):

```powershell
python backend/scripts/seed_db.py
```
This generates `thesis.db` at the project root with performance indexes on café names and sentiments.

---

## 3. Running the Stack

Run each component in a separate terminal tab:

### Tab 1 — BentoML Model Server (Port 3000)
```powershell
conda activate thesis_backend
cd "backend"
bentoml serve service:AbsaService --port 3000
```
* **Interactive UI:** [http://localhost:3000](http://localhost:3000)

### Tab 2 — FastAPI Gateway (Port 8000)
```powershell
conda activate thesis_backend
cd "D:\Ateneo de Davao\Thesis-Website"
uvicorn backend.main:app --reload --port 8000
```
* **Swagger API Docs:** [http://localhost:8000/docs](http://localhost:8000/docs)
* **Cafés Endpoint:** [http://localhost:8000/api/cafes](http://localhost:8000/api/cafes)
* **Insights Endpoint:** [http://localhost:8000/api/insights](http://localhost:8000/api/insights)

### Tab 3 — Vite Frontend (Port 8443)
```powershell
cd "D:\Ateneo de Davao\Thesis-Website"
npx pnpm dev
```
* **Web Application:** [http://localhost:8443](http://localhost:8443)

  1. BentoML Model Server (Tab 1):
    conda activate thesis_backend
    cd "D:\Ateneo de Davao\Thesis-Website\backend"
    bentoml serve service:AbsaService --port 3000

  2. FastAPI Gateway (Tab 2):
    conda activate thesis_backend
    cd "D:\Ateneo de Davao\Thesis-Website"
    uvicorn backend.main:app --reload --port 8000

  3. Frontend (Tab 3):
    cd "D:\Ateneo de Davao\Thesis-Website"
    npx pnpm dev