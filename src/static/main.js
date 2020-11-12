let recordedSourceAudio = undefined;
let chosenDestinationImage = undefined;
let chosenDestinationVideo = undefined;

const uploadedDestinationElement = document.getElementById("uploaded-visual");
const uploadedSourceElement = document.getElementById("uploaded-audio-source");
const desintationImageElement = document.getElementById("destination-image");
const desintationVideoElement = document.getElementById("destination-video");
const sourceAudioElement = document.getElementById("source-audio");
const sourceVideoElement = document.getElementById("source-video");
const recordingDuration = () =>
  parseInt(document.getElementById("recording-duration").value, 10) * 1000;

const canvas = document.createElement("canvas");
const webcam = new Webcam(document.getElementById("webcam"), "user", canvas);
const webcamPromiseToStart = webcam.start();

function tryEnableSubmit() {
  const uploadedVisual = uploadedDestinationElement.files[0];
  const uploadedAudioSource = uploadedSourceElement.files[0];

  const hasVisual =
    !!uploadedVisual || !!chosenDestinationImage || !!chosenDestinationVideo;
  const hasAudio = !!uploadedAudioSource || !!recordedSourceAudio;

  if (hasAudio && hasVisual) {
    const button = document.getElementById("submit");
    button.disabled = false;
  }

  if (chosenDestinationVideo) {
    desintationVideoElement.style.display = "unset";
    desintationImageElement.style.display = "none";
  } else {
    desintationVideoElement.style.display = "none";
    desintationImageElement.style.display = "unset";
  }

  if (recordedSourceAudio) {
    sourceAudioElement.style.display = "block";
    sourceVideoElement.style.display = "none";
  }
}

function submitRecorded() {
  const formData = new FormData();
  const image = uploadedDestinationElement.files[0];
  const audio = uploadedSourceElement.files[0];

  if (image) {
    formData.append("image", image);
  } else if (chosenDestinationVideo) {
    formData.append("image", chosenDestinationVideo, "face.webm");
  } else {
    formData.append("image", chosenDestinationImage, "face.png");
  }

  if (audio) {
    formData.append("sound", audio);
  } else {
    formData.append("sound", recordedSourceAudio, "sound.wav");
  }

  fetch("/upload_file", {
    method: "POST",
    body: formData,
  }).then(() => location.reload());
}

function recordImage() {
  const run = async () => {
    uploadedDestinationElement.value = "";
    await webcamPromiseToStart;
    const photo = webcam.snap();
    var img = desintationImageElement;
    img.src = photo;
    chosenDestinationImage = await new Promise((resolve) =>
      canvas.toBlob(resolve)
    );
    chosenDestinationVideo = undefined;
    tryEnableSubmit();
  };
  run();
}

// Destination
uploadedDestinationElement.addEventListener("change", function () {
  if (this.files && this.files[0]) {
    const type = this.files[0].type;
    chosenDestinationImage = undefined;
    chosenDestinationVideo = undefined;

    if (type.includes("video")) {
      var video = desintationVideoElement;
      video.src = URL.createObjectURL(this.files[0]);
      tryEnableSubmit();
    } else {
      var img = desintationImageElement;
      img.src = URL.createObjectURL(this.files[0]);
      img.onload = () => {
        tryEnableSubmit();
      };
    }
  }
});

uploadedSourceElement.addEventListener("change", function () {
  if (this.files && this.files[0]) {
    const type = this.files[0].type;
    recordedSourceAudio = undefined;
    if (type.includes("video")) {
      var video = sourceVideoElement;
      video.src = URL.createObjectURL(this.files[0]);
      sourceAudioElement.style.display = "none";
      sourceVideoElement.style.display = "block";
      tryEnableSubmit();
    } else {
      var audio = sourceAudioElement;
      audio.src = URL.createObjectURL(this.files[0]);
      sourceAudioElement.style.display = "block";
      sourceVideoElement.style.display = "none";
      tryEnableSubmit();
    }
  }
});

const recordAudio = () =>
  new Promise(async (resolve) => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const mediaRecorder = new MediaRecorder(stream);
    const audioChunks = [];

    mediaRecorder.addEventListener("dataavailable", (event) => {
      audioChunks.push(event.data);
    });

    const start = () => mediaRecorder.start();

    const stop = () =>
      new Promise((resolve) => {
        mediaRecorder.addEventListener("stop", () => {
          const audioBlob = new Blob(audioChunks);
          const audioUrl = URL.createObjectURL(audioBlob);
          const audio = sourceAudioElement;
          audio.src = audioUrl;
          const play = () => audio.play();
          resolve({ audioBlob, audioUrl, play });
        });

        mediaRecorder.stop();
      });

    resolve({ start, stop });
  });

const recordVideo = () =>
  new Promise(async (resolve) => {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: { width: 1280, height: 720, facingMode: "user" },
      audio: false,
    });
    const options = { mimeType: "video/webm; codecs=h264" };
    const mediaRecorder = new MediaRecorder(stream, options);
    const videoChunks = [];

    mediaRecorder.addEventListener("dataavailable", (event) => {
      videoChunks.push(event.data);
    });

    const start = () => mediaRecorder.start();

    const stop = () =>
      new Promise((resolve) => {
        mediaRecorder.addEventListener("stop", () => {
          const videoBlob = new Blob(videoChunks, {
            type: "video/webm",
          });
          const videoUrl = URL.createObjectURL(videoBlob);
          const video = desintationVideoElement;
          video.src = videoUrl;
          const play = () => video.play();

          resolve({ videoBlob, videoUrl, play });
        });

        mediaRecorder.stop();
      });

    resolve({ start, stop });
  });

const startRecordingVideo = () => {
  (async () => {
    const recorder = await recordVideo();
    recorder.start();
    await sleep(recordingDuration());
    const video = await recorder.stop();
    chosenDestinationVideo = video.videoBlob;
    uploadedDestinationElement.value = "";
    video.play();
    tryEnableSubmit();
  })();
};

const startRecordingAudio = () => {
  (async () => {
    const recorder = await recordAudio();
    recorder.start();
    await sleep(recordingDuration());
    const audio = await recorder.stop();
    recordedSourceAudio = audio.audioBlob;
    uploadedSourceElement.value = "";
    audio.play();
    tryEnableSubmit();
  })();
};

const sleep = (time) => new Promise((resolve) => setTimeout(resolve, time));
