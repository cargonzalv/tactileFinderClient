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
import {ControllerDataset} from "./controller_dataset";
const modelData = require("./tfmodel/mobilenet_1.0_224/weights_manifest.json")



let model;

// The dataset object where we will store activations.
const controllerDataset = new ControllerDataset(2);

const IMAGE_SIZE = 224;

const trainedModel = "mobilenet_1.0_224";

const MODEL_URL = `https://raw.githubusercontent.com/cegonzalv/tactileFinderClient/master/src/tfmodel/${trainedModel}/tensorflowjs_model.pb`
const WEIGHTS_MANIFEST_URL = `https://raw.githubusercontent.com/cegonzalv/tactileFinderClient/master/src/tfmodel/${trainedModel}/weights_manifest.json`

const PREPROCESS_DIVISOR = tf.scalar(255 / 2);

export class TFModel {
  constructor() {}
  
  async load() {
    this.model = await tf.loadFrozenModel(
      MODEL_URL,
      WEIGHTS_MANIFEST_URL);
      let data = await fetch(`https://raw.githubusercontent.com/cegonzalv/tactileFinderClient/master/src/tfmodel/${trainedModel}/retrained_labels.txt`,{
        mode:"cors",
      });
      let text = await data.text();
      let lines = text.split("\n");
      this.classes = [];
      lines.map((l)=>{
        this.classes.push(l)
      })
    console.log(this.model)
    }

    dispose() {
      if (this.model) {
        this.model.dispose();
      }
    }

    /**
 * Sets up and trains the classifier.
 */
async train() {
  if (controllerDataset.xs == null) {
    throw new Error('Add some examples before training!');
  }

  // Creates a 2-layer fully connected model. By creating a separate model,
  // rather than adding layers to the mobilenet model, we "freeze" the weights
  // of the mobilenet model, and only train weights from the new model.
  model = tf.sequential({
    layers: [
      // Flattens the input to a vector so we can use it in a dense layer. While
      // technically a layer, this only performs a reshape (and has no training
      // parameters).
      tf.layers.flatten({inputShape: [7, 7, 256]}),
      // Layer 1
      tf.layers.dense({
        units: 100,
        activation: 'relu',
        kernelInitializer: 'varianceScaling',
        useBias: true
      }),
      // Layer 2. The number of units of the last layer should correspond
      // to the number of classes we want to predict.
      tf.layers.dense({
        units: 2,
        kernelInitializer: 'varianceScaling',
        useBias: false,
        activation: 'softmax'
      })
    ]
  });

  // Creates the optimizers which drives training of the model.
  const optimizer = tf.train.adam(0.0001);
  // We use categoricalCrossentropy which is the loss function we use for
  // categorical classification which measures the error between our predicted
  // probability distribution over classes (probability that an input is of each
  // class), versus the label (100% probability in the true class)>
  model.compile({optimizer: optimizer, loss: 'categoricalCrossentropy'});

  // We parameterize batch size as a fraction of the entire dataset because the
  // number of examples that are collected depends on how many examples the user
  // collects. This allows us to have a flexible batch size.
  const batchSize =
      Math.floor(controllerDataset.xs.shape[0] * 0.4);
  if (!(batchSize > 0)) {
    throw new Error(
        `Batch size is 0 or NaN. Please choose a non-zero fraction.`);
  }

  // Train the model! Model.fit() will shuffle xs & ys so we don't have to.
  model.fit(controllerDataset.xs, controllerDataset.ys, {
    batchSize,
    epochs: 20,
    callbacks: {
      onBatchEnd: async (batch, logs) => {
        console.log('Loss: ' + logs.loss.toFixed(5));
      }
    }
  });
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
        console.log(this.model);
          return this.model.predict(batched)
        })
        
      }
      
      async getTopKClasses(logits) {
        const values = logits.dataSync();
        console.log(values)
        let predictionList = [];
        for (let i = 0; i < values.length; i++) {
          predictionList.push({
            label: this.classes[i],
            value: values[i]
          });
        }
        return predictionList;
      }
    }