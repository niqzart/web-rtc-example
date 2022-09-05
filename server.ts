import { Server }  from "socket.io";

const io = new Server({});
const PORT = parseInt(process.env.PORT) || 5000;

io.listen(PORT);
