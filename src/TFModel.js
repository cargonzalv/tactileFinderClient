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
const IMAGE_SIZE = 224;

let trainedModel = "mobilenet_1.0_224";
const MODEL_URL = `https://github.com/cegonzalv/tactileFinderClient/raw/python-tf/src/tfmodel/${trainedModel}/tensorflowjs_model.pb`
const WEIGHTS_MANIFEST_URL = `https://raw.githubusercontent.com/cegonzalv/tactileFinderClient/python-tf/src/tfmodel/${trainedModel}/weights_manifest.json`

const INPUT_NODE_NAME = 'input';
const OUTPUT_NODE_NAME = 'final_result';

const PREPROCESS_DIVISOR = tf.scalar(255 / 2);

export class TFModel {
  constructor() {}
  
  async load() {
    this.model = await tf.loadFrozenModel(
      MODEL_URL,
      WEIGHTS_MANIFEST_URL);


    // Warmup the model.
    const result = tf.tidy(
                       () => this.model.predict(tf.zeros(
                           [1, IMAGE_SIZE, IMAGE_SIZE, 3])));
    await result.data();
    result.dispose();
    
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
      return tf.tidy(() =>{
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
          // console.log(reshapedInput)
          return this.model.predict(batched)
        })
        
      }
      
      async getTopKClasses(logits) {
        const values = await logits.data();
        console.log(values)
        let predictionList = [];
        for (let i = 0; i < values.length; i++) {
          predictionList.push({
            label: classes[i],
            value: values[i]
          });
        }
        return predictionList;
      }
    }