# SurveyMind Response Pattern Realism Study

A statistical validation project for Humanitarians AI's Madison framework (Research Agents layer), testing whether SurveyMind's AI-generated synthetic survey respondents actually replicate real human personality response patterns.

**Author:** Asheesh Nellutla, Research Analyst, Humanitarians AI

## The question

SurveyMind ([paper](#reference)) generates synthetic survey respondents — AI personas with simulated Big Five (OCEAN) personality traits — so researchers can pretest surveys without recruiting real participants. The paper's own conclusion states this validation has not yet been run:

> "Comprehensive results from the validation studies described in the Methods section remain to be determined."

This project runs one of those planned studies: the **Response Pattern Realism Study** (Section 4.5.2) — testing whether the *relationships between* personality traits in SurveyMind's synthetic data actually match real human data, not just whether individual trait scores look plausible in isolation.

## Current status

**Human-side data: real.** Uses the [Open Psychometrics Big Five dataset](https://openpsychometrics.org/) (the same dataset SurveyMind's own paper cites), cleaned to 603,322 usable respondents after filtering duplicate submissions and incomplete responses.

**Synthetic-side data: SurveyMind's own output still not available.** SurveyMind's real synthetic output could not be located in its GitHub repository — only the paper describing the intended method. Two paths were pursued:
1. Regenerate synthetic data by following the paper's own method (Gaussian copula approach, Section 4.2.1) — **attempted, hit a blocker, not successfully replicable**
2. **Build an independent synthetic-generation approach instead — done, see Phase 2 below**

The pipeline has now been validated in two stages: first against self-built dummy test cases (Phase 1, proves the analysis code itself works), then against a real, independently-built synthetic generator using a proper train/test split (Phase 2, a genuine non-circular validation — still not a verdict on SurveyMind's own tool, since that output remains unavailable).

## Method

Four statistical tests, run against a pre-registered threshold decided before any data was examined:

| Test | Purpose |
|---|---|
| **Tucker's congruence coefficient** | Primary outcome — similarity between the human and synthetic correlation matrices (upper triangle only, avoiding double-counting) |
| **Jennrich test** | Significance test — are the two correlation matrices statistically distinguishable? |
| **Bootstrap confidence interval** | Resamples the smaller (synthetic) dataset 2,000× to characterize uncertainty from sample size, rather than downsampling the larger human dataset |
| **Per-trait KS test** | Secondary/supporting check — do individual trait distributions match? |

**Pre-registered success threshold:** congruence coefficient ≥ 0.90, set before running any comparison.

## Results

### Phase 1 — pipeline validation only (not a SurveyMind verdict)

| Scenario | Congruence | Jennrich p | Verdict |
|---|---|---|---|
| Dummy data built to match real structure | 0.983 | 0.977 | PASS |
| Dummy data with deliberately broken Neuroticism relationships | 0.595 | <0.0001 | FAIL (correctly detected) |

These results confirm the pipeline correctly distinguishes realistic from broken synthetic data — they are not a finding about SurveyMind itself.

### Phase 2 — independent generator, validated with a train/test split (new)

Since the paper's method stayed blocked, an independent synthetic-data generator was built instead. Before writing any generation code, a circularity risk was identified: a generator fit and tested against the *same* data would trivially pass regardless of whether it actually works. The fix — an 80/20 train/test split — fits the generator only on the training portion and validates it only against a held-out test portion it never saw.

**Split-size sanity check:** the held-out test portion (~120,664 respondents) gives correlation-estimate standard error ≈0.003 — stable enough to trust. For comparison, the Phase 1 dummy-synthetic sample (n=200) had standard error ≈0.07, over 20x less precise. The split size is not a fragility risk.

| | |
|---|---|
| Training portion | 482,658 respondents (generator fit here only) |
| Held-out test portion | 120,664 respondents (validation here only) |
| **Tucker's congruence coefficient** | **0.9618 — PASS** (threshold ≥0.90) |
| **Jennrich test** | χ² = 5.439, df = 10, **p = 0.860** (no significant structural difference) |
| **Bootstrap 95% CI** | [0.804, 0.967] |

**Per-trait KS test (vs. held-out real data):**

| Trait | KS statistic | p-value | Result |
|---|---|---|---|
| Openness | 0.063 | 0.392 | No significant difference |
| Conscientiousness | 0.068 | 0.307 | No significant difference |
| Extraversion | 0.091 | 0.069 | No significant difference |
| **Agreeableness** | **0.108** | **0.017** | **Differs** |
| Neuroticism | 0.095 | 0.051 | No significant difference |

**What this is, and isn't:** this is a genuine, non-circular validation of an *independently built* generator (multivariate normal sampling fit to the training portion's correlation structure) — not a verdict on SurveyMind's own tool, which still depends on obtaining real SurveyMind output.

## Known limitations (stated honestly, not hidden)

- **Agreeableness distribution discrepancy (new, unexplained).** The one trait that failed its KS test in Phase 2. Not yet investigated — a plausible cause is that Agreeableness's real-world distribution shape isn't well captured by a normal-distribution generator the way the other four traits are. Needs a direct check before this result is presented as fully clean.
- **Jennrich test implementation is custom**, built from Steiger's (1980) asymptotic covariance formula, since no maintained Python library equivalent exists. Internal consistency checks pass (identical matrices → chi2=0; ~4% false-positive rate under a true null, matching the expected ~5%), but it has **not yet been cross-validated against R's `psych::cortest.jennrich`** on identical input. Do not treat outputs as publication-ready until that cross-check is done.
- **No demographic conditioning** exists in SurveyMind's synthetic personas (confirmed with the Madison team), so the full Open Psychometrics dataset is used as ground truth rather than a matched demographic subset. Whether *unconditioned* generation implicitly skews toward a non-representative population (e.g., a WEIRD-leaning default, a known failure mode in LLM-generated personas) has not been checked — this is a genuinely open question, not yet resolved.
- **The reverse-scored item list** (from the dataset's codebook) was independently verified via item-correlation analysis against the real data — all 50 items check out consistently. This confirms internal consistency with the dataset, not independent verification against the original survey designers' intent.
- **The generative method decision** (multivariate normal sampling) was made after the train/test split decision was already submitted for design review; it should be logged as its own explicit decision, confirming it only used the training portion.
- **Real SurveyMind synthetic output still not located.** The independent generator above is a stand-in for methodology validation, not a substitute for eventually testing the actual tool.

## Getting the data

The Open Psychometrics dataset (`data-final.csv`) is **not included in this repo** — it's large and not ours to redistribute. Download it yourself:
- [Kaggle: "Big Five Personality Test"](https://www.kaggle.com/) (search by that title)
- Or directly from [openpsychometrics.org](https://openpsychometrics.org/)

Place `data-final.csv` in the repo root before running.

## Running it

**Phase 1 pipeline (dummy test cases):**
```bash
pip install pandas numpy scipy
python pipeline.py
```

**Phase 2 pipeline (independent generator, train/test split):**
```bash
pip install pandas numpy scipy
python generate_synthetic.py
```

Both load and clean the real human data; `pipeline.py` runs the four-test analysis against self-built "good" and "bad" dummy scenarios, while `generate_synthetic.py` performs the 80/20 split, fits the generator on the training portion, and validates it against the held-out test portion.

## Next steps

1. Investigate the Agreeableness KS discrepancy
2. Log the generative-method decision formally
3. Cross-validate the Jennrich test against R's `cortest.jennrich`
4. Resolve the demographic-conditioning / representativeness question
5. Continue pursuing real SurveyMind output for a true end-to-end validation

## Reference

SurveyMind: A Framework for Generating and Validating Synthetic Survey Respondents Using Personality-Driven AI Models. Humanitarians AI.
