FROM wav2lip

COPY ./dev-requirements.txt .
RUN pip install --no-cache-dir -r dev-requirements.txt
RUN apt-get install -y git

RUN addgroup --gid 1000 devuser
RUN adduser --disabled-password --gecos "" --uid 1000 --gid 1000 devuser
ENV HOME /home/devuser

USER devuser