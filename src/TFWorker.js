const IMAGE_SIZE = 224;


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

/* eslint-disable */
export default function ModelWorker() {
    this.window = this
    importScripts('https://cdn.jsdelivr.net/npm/setimmediate@1.0.5/setImmediate.min.js')
    importScripts('https://cdn.jsdelivr.net/npm/@tensorflow/tfjs-core')
    this.tfc = this.tf
    importScripts('https://cdn.jsdelivr.net/npm/@tensorflow/tfjs')
    importScripts('https://cdn.jsdelivr.net/npm/@tensorflow/tfjs-converter')
  
    this.tf = _objectSpread(this.tf, this.tfc) // this.tf = { ...this.tf, ...this.tfc }
    tf.setBackend('cpu')
  const PREPROCESS_DIVISOR = tf.scalar(255 / 2);

  onmessage = async (e) => {
    if (e.data.loadModel !== undefined) {
        postMessage('(worker) Loading model')

      let arr = [tf.loadModel("https://storage.googleapis.com/tfjs-models/tfjs/mobilenet_v1_1.0_224/model.json"),
        tf.loadModel("https://storage.googleapis.com/tactiledmodel/model/model.json"),
        fetch("https://storage.googleapis.com/tactiledmodel/model/labels.json")
      ];
      postMessage('(worker) Model loaded')


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
      return this.labels
    } else if (e.data.predictThis !== undefined) {
      tf.tidy(() => {
        var img = new Image();
        img.crossOrigin = 'Anonymous';
        img.src = e.data.predictThis.input
        img.onload = () => {
          const pixels = tf.fromPixels(img)
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
          let confidence = (Number(values.dataSync()[0]) * 100).toFixed(2);
          let score = label == "Positive" ? confidence : 100 - confidence;
          this.postMessage({
            result: score
          })

        }

      })
    }
  }

  // ES6 polyfills
  function _defineProperty(obj, key, value) {
    return key in obj ?
      Object.defineProperty(obj, key, {
        value,
        enumerable: true,
        configurable: true,
        writable: true,
      }) :
      obj[key] = value
  }

  function _objectSpread(target) {
    for (let i = 1; i < arguments.length; i += 1) {
      const source = arguments[i] != null ? arguments[i] : {}
      let ownKeys = Object.keys(source)
      if (typeof Object.getOwnPropertySymbols === 'function') {
        ownKeys = ownKeys.concat(Object
          .getOwnPropertySymbols(source)
          .filter(sym => Object.getOwnPropertyDescriptor(source, sym).enumerable))
      }
      ownKeys.forEach(key => _defineProperty(target, key, source[key]))
    }
    return target
  }
}