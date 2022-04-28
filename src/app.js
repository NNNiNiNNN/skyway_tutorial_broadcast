"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const room_1 = require("@skyway-sdk/room");
console.log("Hello, world!");
const myId = document.getElementById("my-id");
const roomNameInput = document.getElementById("room-name");
(() => __awaiter(void 0, void 0, void 0, function* () {
    console.log("Hello, world2!");
    const broadcastVideo = document.getElementById("broadcast-video");
    const testToken = new room_1.SkyWayAuthToken({
        jti: (0, room_1.uuidV4)(),
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
    const tokenString = testToken.encode("YZatigbFmhxZgS5PTM08kiK6vkp+4Y0EOvG2F5dDMw4=");
    document.getElementById("join").onclick = () => __awaiter(void 0, void 0, void 0, function* () {
        console.log("join");
        if (roomNameInput.value == "")
            return;
        const context = yield room_1.SkyWayContext.Create(tokenString);
        const room = yield room_1.SkyWayRoom.FindOrCreate(context, {
            type: "p2p",
            name: roomNameInput.value,
        });
        const me = yield room.join();
        myId.textContent = me.id;
        function subscribe(publication) {
            return __awaiter(this, void 0, void 0, function* () {
                console.log("subscribe");
                if (publication.publisher.id === me.id)
                    return;
                const { stream } = yield me.subscribe(publication.id);
                broadcastVideo.playsInline = true;
                broadcastVideo.autoplay = true;
                stream.attach(broadcastVideo);
            });
        }
        room.publications.forEach(subscribe);
        room.onStreamPublished.add((e) => {
            subscribe(e.publication);
        });
    });
    document.getElementById("broadcast").onclick = () => __awaiter(void 0, void 0, void 0, function* () {
        console.log("broadcast");
        const { audio, video, } = yield room_1.SkyWayMediaDevices.createMicrophoneAudioAndCameraStream();
        video.attach(broadcastVideo);
        yield broadcastVideo.play();
        if (roomNameInput.value === "")
            return;
        const context = yield room_1.SkyWayContext.Create(tokenString);
        const room = yield room_1.SkyWayRoom.FindOrCreate(context, {
            type: "p2p",
            name: roomNameInput.value,
        });
        const me = yield room.join();
        myId.textContent = me.id;
        me.publish(video);
    });
}))();
