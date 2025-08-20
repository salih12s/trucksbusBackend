import { Server } from "socket.io";
export declare const initSocket: (socketServer: Server) => Server<import("socket.io").DefaultEventsMap, import("socket.io").DefaultEventsMap, import("socket.io").DefaultEventsMap, any>;
export declare const getIO: () => Server<import("socket.io").DefaultEventsMap, import("socket.io").DefaultEventsMap, import("socket.io").DefaultEventsMap, any>;
export declare const emitToAdmins: (event: string, payload: any) => void;
export declare const emitToUser: (userId: string, event: string, payload: any) => void;
//# sourceMappingURL=socket.d.ts.map