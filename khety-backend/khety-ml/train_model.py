import argparse
import json
import math
import os

os.environ.setdefault("TF_CPP_MIN_LOG_LEVEL", "2")

import tensorflow as tf
from tensorflow.keras import layers, models
from tensorflow.keras.callbacks import CSVLogger, EarlyStopping, ModelCheckpoint, ReduceLROnPlateau


IMAGE_SIZES = {
    "mobilenetv2": (224, 224),
    "efficientnetv2b0": (224, 224),
    "efficientnetv2b2": (260, 260),
}


def parse_args():
    parser = argparse.ArgumentParser(
        description="Train a stronger Khety plant disease classifier from a directory dataset."
    )
    parser.add_argument("--dataset", required=True, help="Path to dataset root.")
    parser.add_argument("--output-model", default="plant_disease_model.h5")
    parser.add_argument("--output-classes", default="class_names.json")
    parser.add_argument("--output-metrics", default="training_metrics.csv")
    parser.add_argument(
        "--base-model",
        default="efficientnetv2b0",
        choices=sorted(IMAGE_SIZES.keys()),
        help="Backbone architecture to fine-tune.",
    )
    parser.add_argument("--batch-size", type=int, default=24)
    parser.add_argument("--epochs", type=int, default=24)
    parser.add_argument("--validation-split", type=float, default=0.15)
    parser.add_argument("--seed", type=int, default=42)
    parser.add_argument("--label-smoothing", type=float, default=0.08)
    parser.add_argument("--dropout", type=float, default=0.35)
    parser.add_argument(
        "--mixed-precision",
        action="store_true",
        help="Enable mixed precision on supported GPUs.",
    )
    return parser.parse_args()


def maybe_enable_mixed_precision(enabled):
    if enabled:
        tf.keras.mixed_precision.set_global_policy("mixed_float16")


def build_datasets(dataset_dir, image_size, batch_size, validation_split, seed):
    train_ds = tf.keras.utils.image_dataset_from_directory(
        dataset_dir,
        validation_split=validation_split,
        subset="training",
        seed=seed,
        image_size=image_size,
        batch_size=batch_size,
    )
    val_ds = tf.keras.utils.image_dataset_from_directory(
        dataset_dir,
        validation_split=validation_split,
        subset="validation",
        seed=seed,
        image_size=image_size,
        batch_size=batch_size,
    )

    class_names = train_ds.class_names
    autotune = tf.data.AUTOTUNE

    train_ds = train_ds.shuffle(2048, seed=seed).prefetch(autotune)
    val_ds = val_ds.prefetch(autotune)
    return train_ds, val_ds, class_names


def create_backbone(name, input_shape):
    if name == "mobilenetv2":
        backbone = tf.keras.applications.MobileNetV2(
            input_shape=input_shape,
            include_top=False,
            weights="imagenet",
        )
        preprocess = tf.keras.applications.mobilenet_v2.preprocess_input
        fine_tune_layers = 30
    elif name == "efficientnetv2b0":
        backbone = tf.keras.applications.EfficientNetV2B0(
            input_shape=input_shape,
            include_top=False,
            weights="imagenet",
        )
        preprocess = tf.keras.applications.efficientnet_v2.preprocess_input
        fine_tune_layers = 40
    else:
        backbone = tf.keras.applications.EfficientNetV2B2(
            input_shape=input_shape,
            include_top=False,
            weights="imagenet",
        )
        preprocess = tf.keras.applications.efficientnet_v2.preprocess_input
        fine_tune_layers = 50

    return backbone, preprocess, fine_tune_layers


def build_model(class_count, base_model_name, dropout):
    image_size = IMAGE_SIZES[base_model_name]
    input_shape = image_size + (3,)
    backbone, preprocess, fine_tune_layers = create_backbone(base_model_name, input_shape)
    backbone.trainable = False

    augmentation = tf.keras.Sequential(
        [
            layers.RandomFlip("horizontal"),
            layers.RandomRotation(0.08),
            layers.RandomZoom(0.15),
            layers.RandomContrast(0.12),
            layers.RandomBrightness(0.1),
            layers.RandomTranslation(0.06, 0.06),
        ],
        name="augmentation",
    )

    inputs = layers.Input(shape=input_shape)
    x = augmentation(inputs)
    x = preprocess(x)
    x = backbone(x, training=False)
    x = layers.GlobalAveragePooling2D()(x)
    x = layers.BatchNormalization()(x)
    x = layers.Dropout(dropout)(x)
    x = layers.Dense(256, activation="swish")(x)
    x = layers.Dropout(dropout * 0.75)(x)
    outputs = layers.Dense(class_count, activation="softmax", dtype="float32")(x)

    model = models.Model(inputs, outputs)
    return model, backbone, fine_tune_layers


def compile_model(model, learning_rate, label_smoothing):
    model.compile(
        optimizer=tf.keras.optimizers.Adam(learning_rate=learning_rate),
        loss=tf.keras.losses.SparseCategoricalCrossentropy(
            label_smoothing=label_smoothing
        ),
        metrics=[
            "accuracy",
            tf.keras.metrics.TopKCategoricalAccuracy(k=3, name="top3_accuracy"),
        ],
    )


def compute_class_weights(dataset, class_count):
    counts = [0] * class_count

    for _, labels in dataset.unbatch():
        counts[int(labels.numpy())] += 1

    total = sum(counts)
    class_weights = {}
    for index, count in enumerate(counts):
        if count == 0:
            continue
        class_weights[index] = total / (class_count * count)

    return class_weights, counts


def unfreeze_backbone(backbone, fine_tune_layers):
    backbone.trainable = True
    freeze_until = max(0, len(backbone.layers) - fine_tune_layers)

    for layer in backbone.layers[:freeze_until]:
        layer.trainable = False


def save_json(path, data):
    with open(path, "w", encoding="utf-8") as file_handle:
        json.dump(data, file_handle, indent=2)


def main():
    args = parse_args()
    maybe_enable_mixed_precision(args.mixed_precision)

    dataset_dir = os.path.abspath(args.dataset)
    output_model = os.path.abspath(args.output_model)
    output_classes = os.path.abspath(args.output_classes)
    output_metrics = os.path.abspath(args.output_metrics)

    if not os.path.isdir(dataset_dir):
        raise FileNotFoundError(f"Dataset directory not found: {dataset_dir}")

    image_size = IMAGE_SIZES[args.base_model]
    train_ds, val_ds, class_names = build_datasets(
        dataset_dir,
        image_size,
        args.batch_size,
        args.validation_split,
        args.seed,
    )

    model, backbone, fine_tune_layers = build_model(
        len(class_names),
        args.base_model,
        args.dropout,
    )
    compile_model(model, learning_rate=1e-3, label_smoothing=args.label_smoothing)

    class_weights, counts = compute_class_weights(train_ds, len(class_names))

    callbacks = [
        EarlyStopping(monitor="val_loss", patience=5, restore_best_weights=True),
        ReduceLROnPlateau(monitor="val_loss", factor=0.25, patience=2, min_lr=1e-6),
        ModelCheckpoint(output_model, monitor="val_accuracy", save_best_only=True),
        CSVLogger(output_metrics),
    ]

    warmup_epochs = max(4, math.ceil(args.epochs * 0.35))
    model.fit(
        train_ds,
        validation_data=val_ds,
        epochs=warmup_epochs,
        class_weight=class_weights,
        callbacks=callbacks,
    )

    unfreeze_backbone(backbone, fine_tune_layers)
    compile_model(model, learning_rate=1e-5, label_smoothing=args.label_smoothing / 2)

    model.fit(
        train_ds,
        validation_data=val_ds,
        epochs=args.epochs,
        initial_epoch=warmup_epochs,
        class_weight=class_weights,
        callbacks=callbacks,
    )

    model.save(output_model)
    save_json(output_classes, class_names)
    save_json(
        os.path.splitext(output_classes)[0] + "_metadata.json",
        {
            "base_model": args.base_model,
            "image_size": image_size,
            "class_names": class_names,
            "class_counts": dict(zip(class_names, counts)),
            "batch_size": args.batch_size,
            "epochs": args.epochs,
            "validation_split": args.validation_split,
            "label_smoothing": args.label_smoothing,
        },
    )

    print(f"Saved model to {output_model}")
    print(f"Saved class names to {output_classes}")
    print(f"Saved training metrics to {output_metrics}")


if __name__ == "__main__":
    main()
