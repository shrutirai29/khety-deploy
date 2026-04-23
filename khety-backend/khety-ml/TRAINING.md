# Khety Model Training

## Recommended dataset stack

For Khety, do not rely on a single dataset.

Use this combination:

1. PlantVillage as the base dataset for broad disease coverage and clean labels.
2. PlantDoc as the real-world dataset for field backgrounds, clutter, and harder images.
3. Your own Khety field photos for the exact phone cameras, lighting, and crops your users will upload.
4. An explicit `unknown` negative set containing screenshots, UI images, soil-only images, hands, tools, multiple leaves, blurred photos, and unsupported crops.

This is the most important practical point:

If you want the model to reject junk images, you must train it on junk images as an `unknown` class.

## Best datasets to start with

### Immediate best choice for Khety

- PlantVillage
- PlantDoc
- Khety custom field data
- Khety unknown negatives

### If you later expand beyond current crops

- Plant Pathology 2021 FGVC8 for stronger apple field performance
- PlantSeg for lesion segmentation and future explainable overlays

## Suggested directory structure

Use a single directory where every class is a folder:

```text
dataset/
  pepper_bell_bacterial_spot/
  pepper_bell_healthy/
  potato_early_blight/
  potato_healthy/
  potato_late_blight/
  tomato_bacterial_spot/
  tomato_early_blight/
  tomato_healthy/
  tomato_late_blight/
  tomato_leaf_mold/
  tomato_mosaic_virus/
  tomato_septoria_leaf_spot/
  tomato_spider_mites/
  tomato_target_spot/
  tomato_yellow_leaf_curl_virus/
  unknown/
```

## What to put in `unknown`

Examples:

- screenshots
- file explorer windows
- app UI screenshots
- hands without leaves
- backgrounds only
- leaves from unsupported crops
- badly blurred photos
- overexposed images
- collages and posters
- synthetic graphics

This class is essential for reducing absurd answers.

## Training command

Run from `khety-backend/khety-ml`:

```powershell
python train_model.py `
  --dataset D:\datasets\khety-mixed `
  --base-model efficientnetv2b0 `
  --epochs 24 `
  --batch-size 24 `
  --output-model plant_disease_model.h5 `
  --output-classes class_names.json `
  --output-metrics training_metrics.csv
```

## Recommended first training run

- Backbone: `efficientnetv2b0`
- Image size: `224x224`
- Batch size: `24`
- Epochs: `24`
- Validation split: `0.15`
- Label smoothing: `0.08`

## Practical training strategy

1. Start with PlantVillage classes that match Khety crops.
2. Merge in PlantDoc images for the same crops and diseases.
3. Add at least a few thousand `unknown` negative examples.
4. Add your own Khety photos before the final training run.
5. Evaluate on a holdout set made only from real user-style phone photos.

## Deployment flow

After training:

1. Replace `plant_disease_model.h5`.
2. Replace `class_names.json`.
3. Restart the ML service.
4. Re-test with real leaves, screenshots, and unsupported crops.

## Important truth

No model will honestly detect everything.

The best production model is the one that:

- classifies supported crops well
- rejects unsupported images safely
- is trained on the exact photo style your users upload
