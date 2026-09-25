# SurveyMind Response Pattern Realism Study

A statistical validation project for [Humanitarians AI's Madison framework](https://github.com/Humanitariansai/Madison) (Research Agents layer), testing whether SurveyMind's AI-generated synthetic survey respondents actually replicate real human personality response patterns.

**Author:** Asheesh Nellutla, Research Analyst, Humanitarians AI

## The question

SurveyMind ([paper](#reference)) generates synthetic survey respondents — AI personas with simulated Big Five (OCEAN) personality traits — so researchers can pretest surveys without recruiting real participants. The paper's own conclusion states this validation has not yet been run:

> "Comprehensive results from the validation studies described in the Methods section remain to be determined."

This project runs one of those planned studies: the **Response Pattern Realism Study** (Section 4.5.2) — testing whether the *relationships between* personality traits in SurveyMind's synthetic data actually match real human data, not just whether individual trait scores look plausible in isolation.

## Current status

**Human-side data: real.** Uses the [Open Psychometrics Big Five dataset](https://openpsychometrics.org/) (the same dataset SurveyMind's own paper cites), cleaned to 603,322 usable respondents after filtering duplicate submissions and incomplete responses.

**Synthetic-side data: not yet available.** SurveyMind's real synthetic output could not be located in its GitHub repository — only the paper describing the intended method. Two paths are being pursued:
1. Regenerate synthetic data by following the paper's own method (Gaussian copula approach, Section 4.2.1) — in progress
2. If that isn't successfully replicable, build an independent synthetic-generation approach instead

Until real or regenerated synthetic data is available, the pipeline is validated against **self-built dummy test cases** (see Results below) — this proves the analysis code works correctly, not that SurveyMind's synthetic data passes or fails.

## Method

Four statistical tests, run against a pre-registered threshold decided before any data was examined:

| Test | Purpose |
|---|---|
| **Tucker's congruence coefficient** | Primary outcome — similarity between the human and synthetic correlation matrices (upper triangle only, avoiding double-counting) |
| **Jennrich test** | Significance test — are the two correlation matrices statistically distinguishable? |
| **Bootstrap confidence interval** | Resamples the smaller (synthetic) dataset 2,000× to characterize uncertainty from sample size, rather than downsampling the larger human dataset |
| **Per-trait KS test** | Secondary/supporting check — do individual trait distributions match? |

**Pre-registered success threshold:** congruence coefficient ≥ 0.90, set before running any comparison.

## Results so far (pipeline validation only — not a SurveyMind verdict)

| Scenario | Congruence | Jennrich p | Verdict |
|---|---|---|---|
| Dummy data built to match real structure | 0.983 | 0.977 | PASS |
| Dummy data with deliberately broken Neuroticism relationships | 0.595 | <0.0001 | FAIL (correctly detected) |

These results confirm the pipeline correctly distinguishes realistic from broken synthetic data — they are not a finding about SurveyMind itself.

## Known limitations (stated honestly, not hidden)

- **Jennrich test implementation is custom**, built from Steiger's (1980) asymptotic covariance formula, since no maintained Python library equivalent exists. Internal consistency checks pass (identical matrices → chi2=0; ~4% false-positive rate under a true null, matching the expected ~5%), but it has **not yet been cross-validated against R's `psych::cortest.jennrich`** on identical input. Do not treat outputs as publication-ready until that cross-check is done.
- **No demographic conditioning** exists in SurveyMind's synthetic personas (confirmed with the Madison team), so the full Open Psychometrics dataset is used as ground truth rather than a matched demographic subset. Whether *unconditioned* generation implicitly skews toward a non-representative population (e.g., a WEIRD-leaning default, a known failure mode in LLM-generated personas) has not been checked — this is a genuinely open question, not yet resolved.
- The reverse-scored item list (from the dataset's codebook) was independently verified via item-correlation analysis against the real data — all 50 items check out consistently. This confirms internal consistency with the dataset, not independent verification against the original survey designers' intent.

## Getting the data

The Open Psychometrics dataset (`data-final.csv`) is **not included in this repo** — it's large and not ours to redistribute. Download it yourself:
- [Kaggle: "Big Five Personality Test"](https://www.kaggle.com/) (search by that title)
- Or directly from [openpsychometrics.org](https://openpsychometrics.org/)

Place `data-final.csv` in the repo root before running the pipeline.

## Running it

```bash
pip install pandas numpy scipy
python pipeline.py
```

This loads and cleans the real human data, generates dummy synthetic comparison data, and runs the full four-test analysis — printing results for both a "good" and "bad" synthetic scenario.

## Reference

SurveyMind: A Framework for Generating and Validating Synthetic Survey Respondents Using Personality-Driven AI Models. Humanitarians AI.

## License

TBD — check with the Madison project maintainers before reuse.
