self.onmessage = ({
    data: { question },
}: MessageEvent<{ question: string }>) => {
    self.postMessage(
        {
            answer: 42,
        },
        ""
    );
};
