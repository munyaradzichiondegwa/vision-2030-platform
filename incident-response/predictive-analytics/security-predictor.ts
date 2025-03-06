import * as tf from "@tensorflow/tfjs-node";
import { performance } from "perf_hooks";

interface SecurityFeature {
  timestamp: number;
  ipAddress: string;
  userAgent: string;
  loginAttempts: number;
  geolocation: string;
  deviceType: string;
  isAnomaly: boolean;
}

class SecurityPredictor {
  private model: tf.Sequential;
  private featureEncoder: {
    ipAddress: Map<string, number>;
    userAgent: Map<string, number>;
    geolocation: Map<string, number>;
    deviceType: Map<string, number>;
  };

  constructor() {
    this.initializeModel();
    this.initializeFeatureEncoders();
  }

  private initializeModel() {
    this.model = tf.sequential();

    // Input layer
    this.model.add(
      tf.layers.dense({
        inputShape: [this.getFeatureVectorLength()],
        units: 64,
        activation: "relu",
      })
    );

    // Hidden layers
    this.model.add(
      tf.layers.dense({
        units: 32,
        activation: "relu",
      })
    );

    this.model.add(
      tf.layers.dense({
        units: 16,
        activation: "relu",
      })
    );

    // Output layer (binary classification)
    this.model.add(
      tf.layers.dense({
        units: 1,
        activation: "sigmoid",
      })
    );

    this.model.compile({
      optimizer: "adam",
      loss: "binaryCrossentropy",
      metrics: ["accuracy"],
    });
  }

  private initializeFeatureEncoders() {
    this.featureEncoder = {
      ipAddress: new Map(),
      userAgent: new Map(),
      geolocation: new Map(),
      deviceType: new Map(),
    };
  }

  // Encode categorical features
  private encodeFeature(
    feature: string,
    encoderType: keyof typeof this.featureEncoder
  ): number {
    const encoder = this.featureEncoder[encoderType];

    if (!encoder.has(feature)) {
      encoder.set(feature, encoder.size);
    }

    return encoder.get(feature)!;
  }

  // Transform security features to tensor
  private transformFeatures(features: SecurityFeature[]): {
    tensor: tf.Tensor2D;
    labels: tf.Tensor1D;
  } {
    const processedFeatures = features.map((feature) => [
      feature.timestamp,
      this.encodeFeature(feature.ipAddress, "ipAddress"),
      this.encodeFeature(feature.userAgent, "userAgent"),
      feature.loginAttempts,
      this.encodeFeature(feature.geolocation, "geolocation"),
      this.encodeFeature(feature.deviceType, "deviceType"),
      feature.isAnomaly ? 1 : 0,
    ]);

    return {
      tensor: tf.tensor2d(
        processedFeatures.map((f) => f.slice(0, -1)),
        [features.length, this.getFeatureVectorLength()]
      ),
      labels: tf.tensor1d(
        processedFeatures.map((f) => f[f.length - 1]),
        "int32"
      ),
    };
  }

  // Get total feature vector length
  private getFeatureVectorLength(): number {
    return 6; // timestamp, encoded features, login attempts
  }

  // Train predictive model
  async train(features: SecurityFeature[]) {
    const startTime = performance.now();

    const { tensor, labels } = this.transformFeatures(features);

    await this.model.fit(tensor, labels, {
      epochs: 100,
      batchSize: 32,
      shuffle: true,
      validationSplit: 0.2,
    });

    const endTime = performance.now();
    console.log(`Model trained in ${endTime - startTime}ms`);
  }

  // Predict security risk
  predict(features: SecurityFeature): number {
    const { tensor } = this.transformFeatures([features]);
    const prediction = this.model.predict(tensor) as tf.Tensor;

    return prediction.dataSync()[0];
  }

  // Periodic model retraining
  async periodicModelUpdate(recentFeatures: SecurityFeature[]) {
    // Retrain model with recent security features
    await this.train(recentFeatures);
  }
}

export default SecurityPredictor;
