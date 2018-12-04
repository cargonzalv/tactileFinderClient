/**
 * @license
 * Copyright 2018 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */

import * as tf from '@tensorflow/tfjs';

const IMAGE_SIZE = 224;

const PREPROCESS_DIVISOR = tf.scalar(255 / 2);

function reflect(promise) {
  return promise.then(function(v) {
      return {
        v: v,
        status: "resolved"
      }
    },
    function(e) {
      return {
        e: e,
        status: "rejected"
      }
    });
}

export class TFModel {
  constructor() {
    this.model = null;
    this.mnModel = null;
    this.decapitatedMobilenet = null;
    this.labels = null;
  }
  async load() {
    let arr = [tf.loadModel("https://storage.googleapis.com/tfjs-models/tfjs/mobilenet_v1_1.0_224/model.json"),
      tf.loadModel("https://storage.googleapis.com/tactiledmodel/model/model.json"),
      fetch("https://storage.googleapis.com/tactiledmodel/model/labels.json")
    ];

    let results = await Promise.all(arr.map(reflect));
    console.log(results)
    // Return a model that outputs an internal activation.
    this.mnModel = results[0].v;
    const layer = this.mnModel.getLayer("conv_pw_13_relu");
    this.decapitatedMobilenet = tf.model({
      inputs: this.mnModel.inputs,
      outputs: layer.output
    });
    this.model = results[1].v;
    let json = await results[2].v.json();
    this.labels = json.Labels;
    console.log(this.labels)
  }

  dispose() {
    if (this.model) {
      this.model.dispose();
    }
  }

  /**
   * Infer through MobileNet. This does standard ImageNet pre-processing before
   * inferring through the model. This method returns named activations as well
   * as softmax logits.
   *
   * @param input un-preprocessed input Array.
   * @return The softmax logits.
   */
  predict(input) {
    return tf.tidy(() => {
      const pixels = tf.fromPixels(input)
      // Normalize the image from [0, 255] to [-1, 1].
      let normalized = pixels.toFloat().sub(PREPROCESS_DIVISOR).div(PREPROCESS_DIVISOR);

      // Resize the image to
      let resized = normalized;
      if (pixels.shape[0] !== IMAGE_SIZE || pixels.shape[1] !== IMAGE_SIZE) {
        const alignCorners = true;
        resized = tf.image.resizeBilinear(
          normalized, [IMAGE_SIZE, IMAGE_SIZE], alignCorners);
      }

      const batched = resized.reshape([1, IMAGE_SIZE, IMAGE_SIZE, 3]);
      console.log(this.model);
      const activation = this.decapitatedMobilenet.predict(batched);

      let {
        values,
        indices
      } = this.model.predict(activation).topk();
      let label = this.labels[indices.dataSync()[0]];
      let confidence = (Number(values.dataSync()[0])*100).toFixed(2);
      let score = label == "Positive" ? confidence : 100 - confidence;
      return {
        score: score 
      };
    })

  }

  async firstPredict(input) {
      const pixels = tf.fromPixels(input)
      // Normalize the image from [0, 255] to [-1, 1].
      let normalized = pixels.toFloat().sub(PREPROCESS_DIVISOR).div(PREPROCESS_DIVISOR);

      // Resize the image to
      let resized = normalized;
      if (pixels.shape[0] !== IMAGE_SIZE || pixels.shape[1] !== IMAGE_SIZE) {
        const alignCorners = true;
        resized = tf.image.resizeBilinear(
          normalized, [IMAGE_SIZE, IMAGE_SIZE], alignCorners);
      }

      const batched = resized.reshape([1, IMAGE_SIZE, IMAGE_SIZE, 3]);
      console.log(this.model);
      
    const activation = this.decapitatedMobilenet.predict(batched);

    let {
      values,
      indices
    } = this.model.predict(activation).topk();
    console.log("BLOCK")
    indices =  indices.data();
    let label  = await this.labels[indices[0]];
    let confidence = await values.data();
    confidence =  (Number(confidence[0])*100).toFixed(2);
      let score = label == "Positive" ? confidence : 100 - confidence;
      return {
        score: score 
      };

  }
}