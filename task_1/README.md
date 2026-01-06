````markdown
# Yelp Review Star Rating Prediction with LLM Prompt Engineering

## Overview

This project explores how **prompt engineering strategies** affect the performance of a Large Language Model (LLM) when predicting **Yelp restaurant star ratings (1–5)** from free-text reviews.

Using a local **Ollama LLaMA 3.1 (8B)** model, we compare three prompt designs and evaluate them on:
- Prediction accuracy
- JSON output validity
- Mean absolute star distance

The goal is to demonstrate how **output constraints, structure, and examples** influence reliability in structured prediction tasks.

---

## Dataset

- **Source:** Yelp review dataset (`data/train.csv`)
- **Fields used:**
  - `review_text` – Text of the restaurant review
  - `actual_stars` – Ground truth rating

A random sample of **200 reviews** is used for evaluation.

---

## Setup & Dependencies

### Python Libraries
```bash
pip install pandas numpy tqdm
````

### External Requirements

* **Ollama** installed and running locally
* Model used:

```bash
ollama pull llama3.1:8b
```

---

## Methodology

### 1. Data Preparation

* Load CSV data
* Rename columns for clarity
* Select relevant fields only

### 2. Model Invocation

The model is called via a subprocess wrapper:

```python
ollama run llama3.1:8b
```

Responses are parsed as JSON and validated before evaluation.

---

## Prompt Experiments

### Prompt V1 — Baseline

* Minimal instruction
* No JSON enforcement
* No rating guidance

**Result:**
Very low accuracy and poor JSON validity.

---

### Prompt V2 — Strict JSON

* Explicit role definition
* Mandatory JSON-only output
* Defined schema

**Result:**
Perfect JSON validity and large accuracy improvement.

---

### Prompt V3 — Examples + Guidelines

* Clear rating rubric (1–5 stars)
* Few-shot examples
* Strict JSON rules retained

**Result:**
Maintained perfect JSON validity, but accuracy plateaued.

---

## Results Summary

| Prompt Version             | Accuracy | JSON Validity | Mean Absolute Star Distance |
| -------------------------- | -------- | ------------- | --------------------------- |
| Baseline (V1)              | ~1%      | ~4.5%         | 1.22                        |
| Strict JSON (V2)           | ~14%     | 100%          | 1.05                        |
| Examples + Guidelines (V3) | ~13.5%   | 100%          | 1.11                        |

---

## Key Insights

* **Unconstrained prompts are unreliable** for structured prediction tasks.
* **Strict output schemas** dramatically improve reliability.
* **Few-shot examples** improve consistency and explanation quality but may introduce bias.
* Mean absolute distance is a better indicator than accuracy alone for ordinal predictions.

---

## Project Structure

```text
├── data/
│   └── train.csv
├── prompt_experiments.ipynb
├── README.md
```

---

## Future Improvements

* Calibrate predictions using probabilistic decoding
* Explore regression-style prompting
* Test larger models or fine-tuned variants
* Evaluate on a larger validation set

---

## Conclusion

This project demonstrates that **prompt design is critical** when using LLMs for structured prediction tasks. Enforcing output constraints greatly improves reliability, while examples must be chosen carefully to avoid bias.

```
```
