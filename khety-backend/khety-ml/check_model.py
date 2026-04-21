from tensorflow.keras.models import load_model

model = load_model("plant_disease_model.h5")



class_names = [f"Disease {i}" for i in range(15)]
print("Class names:", class_names)