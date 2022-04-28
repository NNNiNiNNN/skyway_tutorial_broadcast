import { PublicationImpl } from '@skyway-sdk/core';
import {
    SkyWayAuthToken,
    SkyWayContext,
    SkyWayMediaDevices,
    SkyWayRoom,
    LocalVideoStream,
    RemoteVideoStream,
    RoomPublication,
    LocalStream,
    uuidV4,
    RemoteDataStream
} from '@skyway-sdk/room';



console.log("Hello, world!");

const myId = <HTMLSpanElement>document.getElementById("my-id")!;
const roomNameInput = <HTMLInputElement>document.getElementById("room-name")!;



(async () => {
    console.log("Hello, world2!");
    const broadcastVideo = <HTMLVideoElement>document.getElementById("broadcast-video")!;
    const testToken = new SkyWayAuthToken({
        jti: uuidV4(),
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + 600,
        scope: {
            app: {
                id: "0919bf13-8251-4c27-bdb0-2f5b8c41ceb2",
                turn: true,
                actions: ["read"],
                channels: [
                    {
                        id: "*",
                        name: "*",
                        actions: ["write"],
                        members: [
                            {
                                id: "*",
                                name: "*",
                                actions: ["write"],
                                publication: {
                                    actions: ["write"],
                                },
                                subscription: {
                                    actions: ["write"],
                                },
                            },
                        ],
                        sfuBots: [
                            {
                                actions: ["write"],
                                forwardings: [
                                    {
                                        actions: ["write"]
                                    }
                                ]
                            }
                        ]
                    },
                ],
            },
        },
    });
    const tokenString = testToken.encode(
        "YZatigbFmhxZgS5PTM08kiK6vkp+4Y0EOvG2F5dDMw4="
    );
    document.getElementById("join")!.onclick = async () => {
        console.log("join");
        if (roomNameInput.value == "") return;

        const context = await SkyWayContext.Create(tokenString);
        const room = await SkyWayRoom.FindOrCreate(context, {
            type: "p2p",
            name: roomNameInput.value,
        });

        const me = await room.join();

        myId.textContent = me.id;

        async function subscribe(publication: RoomPublication) {
            console.log("subscribe");
            if (publication.publisher.id === me.id) return;

            const { stream }: { stream: RemoteVideoStream } = await me.subscribe(publication.id);

            broadcastVideo.playsInline = true;
            broadcastVideo.autoplay = true;
            stream.attach(broadcastVideo);
        }
        room.publications.forEach(subscribe);

        room.onStreamPublished.add((e) => {
            subscribe(e.publication);
        });
    }

    document.getElementById("broadcast")!.onclick = async () => {
        console.log("broadcast");

        const {
            audio,
            video,
        } = await SkyWayMediaDevices.createMicrophoneAudioAndCameraStream();
        video.attach(broadcastVideo);

        await broadcastVideo.play();


        if (roomNameInput.value === "") return;

        const context = await SkyWayContext.Create(tokenString);

        const room = await SkyWayRoom.FindOrCreate(context, {
            type: "p2p",
            name: roomNameInput.value,
        });


        const me = await room.join();
        myId.textContent = me.id;

        me.publish(video);



    }






})();