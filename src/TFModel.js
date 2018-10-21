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


const classes = {
  0: "Positivo",
  1: "Negativo"
}

const MODEL_URL = "https://github.com/cegonzalv/tactileFinderClient/raw/python-tf/src/tfmodel/mobilenet_0.5_224/tensorflowjs_model.pb"
const WEIGHTS_MANIFEST_URL = "https://raw.githubusercontent.com/cegonzalv/tactileFinderClient/python-tf/src/tfmodel/mobilenet_0.5_224/weights_manifest.json"

const INPUT_NODE_NAME = 'input';
const OUTPUT_NODE_NAME = 'final_result';

const PREPROCESS_DIVISOR = tf.scalar(255 / 2);

export class TFModel {
  constructor() {}

  async load() {
    this.model = await tf.loadFrozenModel(
        MODEL_URL,
        WEIGHTS_MANIFEST_URL);
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
    const preprocessedInput = tf.div(
        tf.sub(input.asType('float32'), PREPROCESS_DIVISOR),
        PREPROCESS_DIVISOR);
    const reshapedInput =
        preprocessedInput.reshape([-1, ...preprocessedInput.shape]);
    console.log(reshapedInput)
    return this.model.execute(
        {[INPUT_NODE_NAME]: reshapedInput}, OUTPUT_NODE_NAME);
  }

  getTopKClasses(logits, topK) {
    const predictions = tf.tidy(() => {
      return tf.softmax(logits);
    });
    const values = predictions.dataSync();
    console.log(values)
    predictions.dispose();

    let predictionList = [];
    for (let i = 0; i < values.length; i++) {
      predictionList.push({value: values[i], index: i});
    }
    predictionList = predictionList.slice(0, topK);

    return predictionList.map(x => {
      return {label: classes[x.index], value: x.value};
    });
  }
}