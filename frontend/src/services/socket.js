import { io } from "socket.io-client";

const socket = io("https://fsocity.onrender.com/");

export default socket;
