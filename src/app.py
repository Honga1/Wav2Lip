import os
import io
from PIL import Image
from flask import Flask, request, redirect, send_file
from inference import main
from flask_ngrok import run_with_ngrok

app = Flask(__name__)
run_with_ngrok(app)  # Start ngrok when app is run
UPLOAD_FOLDER = "./sample_data"
app.config["UPLOAD_FOLDER"] = UPLOAD_FOLDER

# python3 -m flask run --port 9000 --no-debugger --no-reload
@app.route('/', defaults=dict(filename="index.html"))
@app.route('/<path:filename>', methods=['GET', 'POST'])
def index(filename):
    return app.send_static_file(filename)


@app.route("/upload_file", methods=["GET", "POST"])
def upload_file():
    if "image" not in request.files:
        return "there is no image in form!"
    if "sound" not in request.files:
        return "there is no sound in form!"
    image = request.files["image"]
    sound = request.files["sound"]
    path = os.path.join(app.config["UPLOAD_FOLDER"], image.filename)
    image.save(path)
    path = os.path.join(app.config["UPLOAD_FOLDER"], sound.filename)
    sound.save(path)
    main(
        "./checkpoints/wav2lip_gan.pth",
        "./sample_data/" + image.filename,
        "./sample_data/" + sound.filename,
        resize_factor=1,
        outfile="./static/result_voice.mp4",
    )

    return redirect(request.referrer)


@app.route("/three_videos_demo", methods=["GET", "POST"])
def three_videos_demo():
    if "image" not in request.files:
        return "there is no image in form!"
    # if "sound" not in request.files:
    #     return "there is no sound in form!"
    image = request.files["image"]
    # sound = request.files["sound"]
    scale = int(request.form["webcamScale"], 10)
    imageFilename = image.filename + ".webm"
    # soundFilename = sound.filename + ".wav"
    path = os.path.join(app.config["UPLOAD_FOLDER"], imageFilename)
    image.save(path)
    # path = os.path.join(app.config["UPLOAD_FOLDER"], soundFilename)
    # sound.save(path)
    main(
        "./checkpoints/wav2lip_gan.pth",
        "./sample_data/" + imageFilename,
        "./sample_data/" + '2.wav',
        resize_factor=scale,
        outfile="./static/result_voice.mp4",
    )

    with open("./static/result_voice.mp4", "rb") as bites:
        response = send_file(
            io.BytesIO(bites.read()),
            attachment_filename="result.mp4",
            mimetype="video/mp4",
            as_attachment=True,
        )

        response.headers.add("Access-Control-Allow-Origin", "*")
        return response


@app.route("/three_videos_is_up", methods=["GET", "POST"])
def three_videos_is_up():
    with open("./static/index.html", "rb") as bites:
        response = send_file(
            io.BytesIO(bites.read()),
            as_attachment=True,
            attachment_filename="video.html",
            mimetype="application/octet-stream",
        )

        response.headers.add("Access-Control-Allow-Origin", "*")
        return response


if __name__ == "__main__":
    app.run()
