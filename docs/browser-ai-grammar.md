# Browser grammar AI prototype

This preview adds an optional Transformers.js grammar model to the original Writing Studio. No paid inference API or LanguageTool server is called. It includes the basic local checker from draft PR #9; the unapproved restyle is excluded.

Students must click Download before the model is loaded. A module Web Worker keeps inference off the main UI thread. Download progress, cancellation, unloading, a five-minute timeout, and a 500-character AI input limit are included. An AI failure never silently substitutes another checker. The original text and proposed revision are displayed separately. Saving still follows the existing submission/database flow.

## Model and license

- Runtime: `@huggingface/transformers` 3.8.1, CPU/WASM, one thread.
- Model: `Xenova/t5-base-grammar-correction` at `c439d702d7b7b178b96b64d4dc4537308963c271`.
- Original model: Vennify `t5-base-grammar-correction`, CC BY-NC-SA 4.0. This is a noncommercial school prototype; assess suitability before monetizing or commercial deployment.
- Attribution and license links appear beside the opt-in download control.
- Quantized encoder: 110,388,487 bytes; merged quantized decoder: 139,724,812 bytes. Total model weights: 250,113,299 bytes, plus tokenizer/config and browser runtime.
- Vite additionally produces an approximately 888 kB worker and 21.6 MB WASM runtime. These load with the optional worker, not as model weights in the main app bundle.

No student text is sent to an inference provider by this worker. Public model/runtime downloads still contact their hosts. Browser cache storage may be evicted, requiring another download. The model may miss errors, rewrite meaning, or behave poorly on names, dialects, and long sentences. It returns suggestions only, not reliable grammar explanations or grades.

## Validation

The initial native Node CPU smoke test is recorded in `browser-ai-model-test.json`. It corrected “They goes…” and “She have…” and left a correct sentence unchanged. These synthetic examples do not establish accuracy, browser speed, or phone compatibility.

Production build passed. Type checking retains the three baseline errors in PictureHuntIllustration and AuthContext. Browser validation is tracked in the PR before approval; do not merge without owner approval.
