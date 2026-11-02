"""
Synthetic data generation with a proper train/test split.

Extends the existing pipeline.py functions (unchanged):
  tucker_congruence, jennrich_test, bootstrap_congruence_ci, ks_marginal_tests

New in this script: the train/test split itself, and fitting the
"generator" (simulate_from_corr) on the TRAINING portion only, then
validating against the HELD-OUT TEST portion — never the training data.
This is the design decision already submitted to Gru.
"""

import pandas as pd
import numpy as np
from scipy import stats

np.random.seed(42)

RAW_PATH = "data-final.csv"
TRAITS = ["Openness", "Conscientiousness", "Extraversion", "Agreeableness", "Neuroticism"]

REVERSE_ITEMS = {
    "EXT2", "EXT4", "EXT6", "EXT8", "EXT10",
    "EST2", "EST4",
    "AGR1", "AGR3", "AGR5", "AGR7",
    "CSN2", "CSN4", "CSN6", "CSN8",
    "OPN2", "OPN4", "OPN6",
}

TRAIT_ITEMS = {
    "Extraversion": [f"EXT{i}" for i in range(1, 11)],
    "Neuroticism": [f"EST{i}" for i in range(1, 11)],
    "Agreeableness": [f"AGR{i}" for i in range(1, 11)],
    "Conscientiousness": [f"CSN{i}" for i in range(1, 11)],
    "Openness": [f"OPN{i}" for i in range(1, 11)],
}


# ---------------------------------------------------------------------
# STEP 1: Load and clean the REAL human dataset (unchanged from pipeline.py)
# ---------------------------------------------------------------------
def load_and_clean_human_data():
    item_cols = sum(TRAIT_ITEMS.values(), [])
    usecols = item_cols + ["IPC"]
    df = pd.read_csv(RAW_PATH, sep="\t", usecols=usecols)
    n_raw = len(df)

    df = df[df["IPC"] == 1]
    df = df[(df[item_cols] > 0).all(axis=1)]
    n_clean = len(df)

    for item in REVERSE_ITEMS:
        df[item] = 6 - df[item]

    trait_df = pd.DataFrame({
        trait: df[items].mean(axis=1)
        for trait, items in TRAIT_ITEMS.items()
    })[TRAITS]

    print(f"Raw rows: {n_raw:,}")
    print(f"After IPC==1 and complete-response filtering: {n_clean:,}")
    return trait_df


# ---------------------------------------------------------------------
# STEP 2 (NEW): Train/test split — the design decision submitted to Gru
# ---------------------------------------------------------------------
def train_test_split(df, test_frac=0.20, seed=42):
    rng = np.random.default_rng(seed)
    n = len(df)
    idx = rng.permutation(n)
    n_test = int(n * test_frac)
    test_idx = idx[:n_test]
    train_idx = idx[n_test:]
    train_df = df.iloc[train_idx].reset_index(drop=True)
    test_df = df.iloc[test_idx].reset_index(drop=True)
    print(f"\nTrain/test split (test_frac={test_frac}):")
    print(f"  Training portion: {len(train_df):,} respondents  <- generator fit HERE ONLY")
    print(f"  Held-out test:    {len(test_df):,} respondents  <- validation HERE ONLY")
    return train_df, test_df


# ---------------------------------------------------------------------
# STEP 3: The "generator" — same simulate_from_corr as before,
# now explicitly fit on the TRAINING portion's parameters only.
# ---------------------------------------------------------------------
def simulate_from_corr(corr_matrix, n, mean_vec, std_vec, seed):
    rng = np.random.default_rng(seed)
    latent = rng.multivariate_normal(mean=np.zeros(5), cov=corr_matrix, size=n)
    scaled = mean_vec + latent * std_vec
    return pd.DataFrame(np.clip(scaled, 1, 5), columns=TRAITS)


# ---------------------------------------------------------------------
# STEP 4: Analysis functions — UNCHANGED from pipeline.py
# ---------------------------------------------------------------------
def tucker_congruence(r1, r2):
    iu = np.triu_indices_from(r1, k=1)
    v1, v2 = r1[iu], r2[iu]
    return np.sum(v1 * v2) / np.sqrt(np.sum(v1**2) * np.sum(v2**2))


def jennrich_test(r1, r2, n1, n2):
    p = r1.shape[0]
    n = (n1 * n2) / (n1 + n2)
    r_pooled = (n1 * r1 + n2 * r2) / (n1 + n2)
    iu = np.triu_indices(p, k=1)
    pairs = list(zip(iu[0], iu[1]))
    m = len(pairs)
    z = np.sqrt(n) * np.array([r1[i, j] - r2[i, j] for i, j in pairs])
    sigma = np.zeros((m, m))
    for a, (i, j) in enumerate(pairs):
        for b, (k, l) in enumerate(pairs):
            rik, rjl = r_pooled[i, k], r_pooled[j, l]
            ril, rjk = r_pooled[i, l], r_pooled[j, k]
            rij, rkl = r_pooled[i, j], r_pooled[k, l]
            sigma[a, b] = 0.5 * (
                (rik - rij * rjk) * (rjl - rij * ril)
                + (ril - rij * rjl) * (rjk - rij * rik)
            ) + 0.5 * (rik * rjl + ril * rjk) - rij * rkl
    sigma += np.eye(m) * 1e-8
    try:
        chi2_stat = z @ np.linalg.inv(sigma) @ z
    except np.linalg.LinAlgError:
        chi2_stat = np.nan
    p_value = 1 - stats.chi2.cdf(chi2_stat, m) if not np.isnan(chi2_stat) else np.nan
    return chi2_stat, m, p_value


def bootstrap_congruence_ci(synth_df, ref_corr, n_boot=2000, seed=0):
    rng = np.random.default_rng(seed)
    n = len(synth_df)
    arr = synth_df[TRAITS].values
    vals = []
    for _ in range(n_boot):
        idx = rng.integers(0, n, n)
        r_boot = np.corrcoef(arr[idx], rowvar=False)
        vals.append(tucker_congruence(ref_corr, r_boot))
    vals = np.array(vals)
    return np.percentile(vals, 2.5), np.percentile(vals, 97.5)


def ks_marginal_tests(real_df, synth_df):
    return {t: stats.ks_2samp(real_df[t], synth_df[t]) for t in TRAITS}


# ---------------------------------------------------------------------
# MAIN: fit on train, generate, validate against test ONLY
# ---------------------------------------------------------------------
if __name__ == "__main__":
    human_df = load_and_clean_human_data()

    # NEW: split before anything else touches the data
    train_df, test_df = train_test_split(human_df, test_frac=0.20, seed=42)

    # Fit generator parameters on TRAINING portion only
    r_train = train_df[TRAITS].corr().values
    mean_vec = train_df[TRAITS].mean().values
    std_vec = train_df[TRAITS].std().values

    print("\nGenerator fit on TRAINING portion's correlation structure:")
    print(pd.DataFrame(r_train, index=TRAITS, columns=TRAITS).round(3))

    # Generate synthetic sample
    N_SYNTH = 200
    synthetic_df = simulate_from_corr(r_train, N_SYNTH, mean_vec, std_vec, seed=7)

    # Validate against HELD-OUT TEST portion — never seen during fitting
    r_test = test_df[TRAITS].corr().values
    r_synth = synthetic_df[TRAITS].corr().values

    print(f"\n{'='*70}\nVALIDATION AGAINST HELD-OUT TEST SET (n={len(test_df):,})\n{'='*70}")

    cc = tucker_congruence(r_test, r_synth)
    print(f"\nTucker's congruence coefficient (synthetic vs. held-out test): {cc:.4f}")
    print(f"Pre-registered threshold: >= 0.90 -> {'PASS' if cc >= 0.90 else 'FAIL'}")

    chi2_stat, df_, p_val = jennrich_test(r_test, r_synth, len(test_df), N_SYNTH)
    print(f"\nJennrich test: chi2 = {chi2_stat:.3f}, df = {df_}, p = {p_val:.4f}")

    lo, hi = bootstrap_congruence_ci(synthetic_df, r_test, n_boot=2000)
    print(f"\nBootstrap 95% CI for congruence coefficient: [{lo:.4f}, {hi:.4f}]")

    print("\nMarginal distribution checks (KS test per trait, vs. held-out test set):")
    for trait, (stat, p) in ks_marginal_tests(test_df, synthetic_df).items():
        flag = "differs" if p < 0.05 else "no significant difference"
        print(f"  {trait:18s} KS={stat:.3f}, p={p:.4f}  ({flag})")

    print(f"\n{'='*70}")
    print("IMPORTANT: this is a statistically-fit synthetic generator")
    print("(multivariate normal sampling matched to training-set structure),")
    print("still NOT real SurveyMind output. Validated against held-out")
    print("real data the generator never saw during fitting.")
    print(f"{'='*70}")
