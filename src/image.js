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

/**
 * A class that wraps webcam video elements to capture Tensor4Ds.
 */
export class Image {
  /**
   * @param {HTMLImageElement} imageElement A HTMLImageElement representing the webcam feed.
   */
  constructor() {
  }

  /**
   * Captures a frame from the webcam and normalizes it between -1 and 1.
   * Returns a batched image (1-element batch) of shape [1, w, h, c].
   */
  capture(image) {
    this.setup(image);
    return tf.tidy(() => {
      // Reads the image as a Tensor from the webcam <video> element.
      const imageElement = tf.fromPixels(this.imageElement);

      // Normalize the image from [0, 255] to [-1, 1].
      const batchedImage = imageElement.expandDims(0);

      return batchedImage.toFloat().div(tf.scalar(127)).sub(tf.scalar(1));
        
    //   // Resize the image to
    //   let resized = normalized;
    //   if (imageElement.shape[0] !== 224 || imageElement.shape[1] !== 224) {
    //     const alignCorners = true;
    //     resized = tf.image.resizeBilinear(
    //       normalized, [224, 224], alignCorners);
    //   }
        
    //   console.log(resized);
    //   return resized.reshape([4, 224, 224, 3]);
    });
  }

  /**
   * Crops an image tensor so we get a square image with no white space.
   * @param {Tensor4D} img An input image Tensor to crop.
   */
  cropImage(img) {
    const size = 224;
    const centerHeight = img.shape[0] / 2;
    const beginHeight = centerHeight - (size / 2);
    const centerWidth = img.shape[1] / 2;
    const beginWidth = centerWidth - (size / 2);
    return img.slice([beginHeight, beginWidth, 0], [size, size, 3]);
  }

  /**
   * Adjusts the video size so we can make a centered square crop without
   * including whitespace.
   * @param {number} width The real width of the video element.
   * @param {number} height The real height of the video element.
   */
  adjustVideoSize(width, height) {
    const aspectRatio = width / height;
    if (width >= height) {
      this.imageElement.width = aspectRatio * this.imageElement.height;
    } else if (width < height) {
      this.imageElement.height = this.imageElement.width / aspectRatio;
    }
  }

  async setup(imageElement) {
    console.log(imageElement)
    this.imageElement = imageElement;
    this.imageElement.width = 224;
    this.imageElement.height = 224;
    
  }
}