import * as tf from "@tensorflow/tfjs-node";
import { performance } from "perf_hooks";
import * as math from "mathjs";

interface AnomalyDetectionConfig {
  windowSize: number;
  threshold: number;
  learningRate: number;
}

interface AnomalyResult {
  isAnomaly: boolean;
  score: number;
  timestamp: Date;
  features?: Record<string, number>;
}

class AnomalyDetector {
  private model: tf.Sequential;
  private config: AnomalyDetectionConfig;
  private featureScaler: {
    mean: number[];
    std: number[];
  };

  constructor(config?: Partial<AnomalyDetectionConfig>) {
    this.config = {
      windowSize: 50,
      threshold: 0.7,
      learningRate: 0.01,
      ...config,
    };

    this.initializeModel();
  }

  private initializeModel() {
    // Create autoencoder for anomaly detection
    this.model = tf.sequential();

    // Encoder layers
    this.model.add(
      tf.layers.dense({
        inputShape: [this.config.windowSize],
        units: Math.floor(this.config.windowSize / 2),
        activation: "relu",
      })
    );

    this.model.add(
      tf.layers.dense({
        units: Math.floor(this.config.windowSize / 4),
        activation: "relu",
      })
    );

    // Decoder layers
    this.model.add(
      tf.layers.dense({
        units: Math.floor(this.config.windowSize / 2),
        activation: "relu",
      })
    );

    this.model.add(
      tf.layers.dense({
        units: this.config.windowSize,
        activation: "linear",
      })
    );

    // Compile model
    this.model.compile({
      optimizer: tf.train.adam(this.config.learningRate),
      loss: "meanSquaredError",
    });
  }

  // Preprocess and normalize data
  private preprocessData(data: number[][]): {
    tensor: tf.Tensor2D;
    scaledData: number[][];
  } {
    // Compute mean and standard deviation for scaling
    const transposedData = math.transpose(data);
    this.featureScaler = {
      mean: transposedData.map((col) => math.mean(col)),
      std: transposedData.map((col) => math.std(col)),
    };

    // Z-score normalization
    const scaledData = data.map((row) =>
      row.map(
        (val, idx) =>
          (val - this.featureScaler.mean[idx]) /
          (this.featureScaler.std[idx] || 1)
      )
    );

    return {
      tensor: tf.tensor2d(scaledData),
      scaledData,
    };
  }

  // Train anomaly detection model
  async train(trainingData: number[][]) {
    const startTime = performance.now();

    const { tensor } = this.preprocessData(trainingData);

    await this.model.fit(tensor, tensor, {
      epochs: 100,
      batchSize: 32,
      shuffle: true,
    });

    const endTime = performance.now();
    console.log(`Model trained in ${endTime - startTime}ms`);
  }

  // Detect anomalies
  detectAnomaly(
    inputData: number[],
    context?: Record<string, any>
  ): AnomalyResult {
    // Ensure input matches window size
    if (inputData.length !== this.config.windowSize) {
      throw new Error("Input data must match window size");
    }

    const { tensor, scaledData } = this.preprocessData([inputData]);

    // Reconstruct input
    const reconstructed = this.model.predict(tensor) as tf.Tensor;

    // Compute reconstruction error
    const mse = tf.metrics.meanSquaredError(tensor, reconstructed);
    const anomalyScore = mse.dataSync()[0];

    return {
      isAnomaly: anomalyScore > this.config.threshold,
      score: anomalyScore,
      timestamp: new Date(),
      features: scaledData[0].reduce((acc, val, idx) => {
        acc[`feature_${idx}`] = val;
        return acc;
      }, {}),
    };
  }

  // Adaptive threshold adjustment
  adaptThreshold(recentAnomalies: AnomalyResult[]) {
    const avgScore = math.mean(recentAnomalies.map((a) => a.score));

    this.config.threshold = avgScore * 1.5;
  }
}

export default AnomalyDetector;
